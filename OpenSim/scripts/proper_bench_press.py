"""
proper_bench_press.py
=====================
Bankdrücken — Static Optimization mit korrekten externen Momenten.

Problem mit bench_press.py:
  Die externen Momente wurden als globales Kreuzprodukt berechnet (tau = r × F)
  und dann auf OpenSim-Koordinaten gemappt. Das erzeugt falsche Werte weil
  OpenSim-Koordinaten eigene Rotationsachsen haben die nicht mit dem Weltframe übereinstimmen.

Lösung — Finite Differences:
  M_j = F · (∂r_hand / ∂q_j)
  OpenSim berechnet selbst wie sich die Handposition ändert wenn Koordinate q_j
  leicht perturiert wird. Das ergibt den exakten externen Moment für jede Koordinate
  im richtigen Referenzframe — ohne Koordinatentransformation.

Ausführen:
  conda activate opensim-env
  python proper_bench_press.py
"""

import opensim as osim
import numpy as np
from scipy import optimize
import json
import os

# ─── KONFIGURATION ────────────────────────────────────────────────────────────

MODEL_PATH  = r"C:\Users\kubis\gym-app\OpenSim\MobL_ARMS_OpenSim3_bimanual_model\Bimanual Upper Arm Model\MoBL_ARMS_bimanual_6_2_21.osim"
OUTPUT_JSON = r"C:\Users\kubis\gym-app\OpenSim\results\proper_bench_press.json"
RESULTS_DIR = r"C:\Users\kubis\gym-app\OpenSim\results"

BENCH_ANGLES = [0, 15, 30, 45, 60, 90]
BARBELL_KG   = 60
MOVEMENT_PHASES = 5

# Horizontaler Kraftanteil (Bogenbahn des Bankdrückens)
HORIZ_FORCE_MIN = 0.05   # Lockout
HORIZ_FORCE_MAX = 0.35   # Bodenlage

# Finite-Difference-Schrittweite [rad]
FD_STEP = 1e-4

# ─── MODELL LADEN ─────────────────────────────────────────────────────────────

print("Lade Modell...", flush=True)
MODEL = osim.Model(MODEL_PATH)
MODEL.initSystem()
print("Modell geladen.\n", flush=True)

# ─── KOORDINATEN FÜR BANKDRÜCKEN ──────────────────────────────────────────────

COORD_NAMES = [
    "shoulder_elv_r", "elv_angle_r", "shoulder_rot_r", "elbow_flexion_r",
    "shoulder_elv_l", "elv_angle_l", "shoulder_rot_l", "elbow_flexion_l",
]

def set_bench_press_state(bench_angle_deg, elbow_flex_deg=90.0, grip_angle_deg=30.0):
    """Setzt Gelenkwinkel für Bankdrücken und gibt den State zurück."""
    state     = MODEL.initSystem()
    coord_set = MODEL.updCoordinateSet()

    bench_coords = {
        "elv_angle":     np.radians(grip_angle_deg),
        "shoulder_elv":  np.radians(70.0 + bench_angle_deg),
        "shoulder_rot":  np.radians(-20.0),
        "elbow_flexion": np.radians(elbow_flex_deg),
        "pro_sup":       np.radians(-80.0),
    }
    for base, val in bench_coords.items():
        for side in ("r", "l"):
            try:
                coord_set.get(f"{base}_{side}").setValue(state, val)
            except Exception:
                pass

    MODEL.realizeVelocity(state)
    return state

# ─── FINITE DIFFERENCES: EXTERNE MOMENTE ──────────────────────────────────────

def get_hand_pos(state, side):
    """Handposition im Weltframe."""
    body = MODEL.getBodySet().get(f"hand_{side}")
    p    = body.getPositionInGround(state)
    return np.array([p[0], p[1], p[2]])


def compute_external_moment_fd(state, side, coord_name, force_n, horiz_fraction):
    """
    Externes Moment um Koordinate coord_name via Finite Differences.

    M_j = F_vec · (∂r_hand / ∂q_j)

    Das ist der exakte externe Moment in OpenSims Koordinatensystem —
    kein Koordinaten-Mismatch, kein falsches Kreuzprodukt.
    """
    coord = MODEL.updCoordinateSet().get(coord_name)
    if coord.getLocked(state):
        return 0.0

    q = coord.getValue(state)

    # Kraftvektor (vertikal + horizontaler Bogenbahn-Anteil)
    x_sign   = -1.0 if side == "r" else 1.0
    force_vec = np.array([x_sign * force_n * horiz_fraction, -force_n, 0.0])

    # Handposition bei q
    coord.setValue(state, q, False)
    MODEL.realizeVelocity(state)
    r_minus = get_hand_pos(state, side)

    # Handposition bei q + dq
    coord.setValue(state, q + FD_STEP, False)
    MODEL.realizeVelocity(state)
    r_plus = get_hand_pos(state, side)

    # Reset
    coord.setValue(state, q, False)
    MODEL.realizeVelocity(state)

    # Jacobian-Spalte
    dr_dq = (r_plus - r_minus) / FD_STEP

    return float(np.dot(force_vec, dr_dq))


def compute_all_external_moments(state, force_n, horiz_fraction):
    """Berechnet externe Momente für alle relevanten Koordinaten beider Seiten."""
    moments = {}
    for side in ("r", "l"):
        for coord_name in COORD_NAMES:
            if not coord_name.endswith(f"_{side}"):
                continue
            m = compute_external_moment_fd(state, side, coord_name, force_n, horiz_fraction)
            moments[coord_name] = m
    return moments

# ─── MUSKELDATEN AUS OPENSIM ──────────────────────────────────────────────────

def collect_muscle_data(state):
    """
    Sammelt für jeden Muskel:
      - maximale isometrische Kraft (mit Force-Length-Skalierung)
      - Moment-Arme für alle relevanten Koordinaten
    Direkt aus OpenSim — kein manuelles Anatomie-Mapping.
    """
    muscles   = MODEL.getMuscles()
    coord_set = MODEL.getCoordinateSet()
    n = muscles.getSize()

    names       = []
    max_force   = np.zeros(n)
    moment_arms = {c: np.zeros(n) for c in COORD_NAMES}

    for i in range(n):
        m = muscles.get(i)
        names.append(m.getName())
        f_max = m.getMaxIsometricForce()

        # Force-Length-Skalierung (Gauß-Approximation)
        try:
            mt    = m.getLength(state)
            opt   = m.getOptimalFiberLength()
            slack = m.getTendonSlackLength()
            lnorm = (mt - slack) / opt if opt > 0 else 1.0
            lnorm = max(0.1, lnorm)
            fl    = np.exp(-((lnorm - 1.0) / 0.45) ** 2)
            f_max *= max(0.1, float(fl))
        except Exception:
            pass

        max_force[i] = f_max

        for c_name in COORD_NAMES:
            try:
                coord = coord_set.get(c_name)
                moment_arms[c_name][i] = m.computeMomentArm(state, coord)
            except Exception:
                moment_arms[c_name][i] = 0.0

    return names, max_force, moment_arms

# ─── STATIC OPTIMIZATION ──────────────────────────────────────────────────────

def solve_so(names, max_force, moment_arms, external_moments):
    """
    Static Optimization:
      minimize  Σ aᵢ²  +  Σⱼ λⱼ · (τ_muskel_j - τ_ext_j)²
      s.t.      0 ≤ aᵢ ≤ 1

    λⱼ wird automatisch skaliert: groß genug für Momentbalance,
    klein genug um Sättigung zu vermeiden.
    """
    n = len(max_force)

    active = {
        c: (moment_arms[c], external_moments[c])
        for c in COORD_NAMES
        if abs(external_moments.get(c, 0)) > 1e-3
    }

    if not active:
        return np.zeros(n)

    # λ skaliert invers zur maximalen Muskelkapazität dieser Koordinate
    def get_lambda(coord_name, ma_vec):
        cap = float(np.sum(np.abs(ma_vec) * max_force))
        return 20.0 / (cap ** 2 + 1e-6)

    def objective(a):
        cost = float(np.sum(a ** 2))
        for c_name, (ma_vec, ext_m) in active.items():
            lam      = get_lambda(c_name, ma_vec)
            tau_m    = float(np.dot(a * max_force, ma_vec))
            cost    += lam * (tau_m - ext_m) ** 2
        return cost

    result = optimize.minimize(
        objective,
        x0      = np.full(n, 0.05),
        method  = "L-BFGS-B",
        bounds  = [(0.0, 1.0)] * n,
        options = {"maxiter": 30000, "ftol": 1e-14, "gtol": 1e-9},
    )
    if not result.success:
        print(f"    [SO] {result.message}", flush=True)

    return np.clip(result.x, 0.0, 1.0)

# ─── PRO BANKWINKEL ───────────────────────────────────────────────────────────

def run_phase(bench_angle_deg, elbow_flex_deg, horiz_fraction, force_n):
    """Berechnet Muskelaktivierungen für eine Position."""
    state = set_bench_press_state(bench_angle_deg, elbow_flex_deg)

    ext_moments = compute_all_external_moments(state, force_n, horiz_fraction)
    names, max_force, moment_arms = collect_muscle_data(state)
    activations = solve_so(names, max_force, moment_arms, ext_moments)

    return names, activations


def run_for_angle(bench_angle_deg):
    """RMS-Aktivierung über den Bewegungsbogen (MOVEMENT_PHASES Positionen)."""
    force_n      = (BARBELL_KG * 9.81) / 2.0
    elbow_angles = np.linspace(90.0, 10.0, MOVEMENT_PHASES)

    # Horizontalkraft: unten maximal, Lockout minimal
    horiz_fracs  = np.linspace(HORIZ_FORCE_MAX, HORIZ_FORCE_MIN, MOVEMENT_PHASES)

    all_acts = []
    names    = None

    for elbow_deg, horiz_frac in zip(elbow_angles, horiz_fracs):
        print(f"    Phase: Ellbogen={elbow_deg:.0f}°  horiz={horiz_frac:.2f}", flush=True)
        names, acts = run_phase(bench_angle_deg, elbow_deg, horiz_frac, force_n)
        all_acts.append(acts)

    arr = np.array(all_acts)
    rms = np.sqrt(np.mean(arr ** 2, axis=0))
    return names, {names[i]: round(float(rms[i]), 4) for i in range(len(names))}

# ─── AUSGABE ──────────────────────────────────────────────────────────────────

KEY_MUSCLES = ["PECM1_r", "PECM2_r", "PECM3_r",
               "DELT1_r",  "DELT2_r",
               "TRIlong_r","TRIlat_r","TRImed_r"]

EMG_REF = {
     0: {"PECM1_r":0.20,"PECM2_r":0.50,"PECM3_r":0.30,"DELT1_r":0.40,"DELT2_r":0.10,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    15: {"PECM1_r":0.30,"PECM2_r":0.45,"PECM3_r":0.25,"DELT1_r":0.45,"DELT2_r":0.10,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    30: {"PECM1_r":0.40,"PECM2_r":0.40,"PECM3_r":0.20,"DELT1_r":0.55,"DELT2_r":0.15,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    45: {"PECM1_r":0.45,"PECM2_r":0.30,"PECM3_r":0.15,"DELT1_r":0.65,"DELT2_r":0.20,"TRIlong_r":0.30,"TRIlat_r":0.45,"TRImed_r":0.30},
    60: {"PECM1_r":0.25,"PECM2_r":0.20,"PECM3_r":0.10,"DELT1_r":0.72,"DELT2_r":0.28,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    90: {"PECM1_r":0.12,"PECM2_r":0.10,"PECM3_r":0.05,"DELT1_r":0.80,"DELT2_r":0.35,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
}

def print_result(activations, angle):
    ref = EMG_REF.get(angle, {})
    print(f"  {'Muskel':<14} {'Berechnet':>10} {'EMG-Ref':>8} {'Diff%':>7}")
    for m in KEY_MUSCLES:
        val = activations.get(m, 0.0)
        tgt = ref.get(m, 0.0)
        pct = ((val - tgt) / tgt * 100) if tgt > 0 else 0.0
        print(f"  {m:<14} {val:>10.3f} {tgt:>8.2f} {pct:>+6.1f}%", flush=True)

# ─── HAUPTPROGRAMM ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.makedirs(RESULTS_DIR, exist_ok=True)

    print("=" * 60, flush=True)
    print("  Bankdrücken — Proper OpenSim SO (Finite Differences)", flush=True)
    print(f"  Hantelgewicht: {BARBELL_KG} kg  |  Phasen: {MOVEMENT_PHASES}", flush=True)
    print("=" * 60, flush=True)

    results = {
        "exercise":  "barbell_bench_press",
        "method":    "OpenSim moment arms + FD external moments + scipy L-BFGS-B",
        "variants":  {},
    }

    for angle in BENCH_ANGLES:
        print(f"\n{'─'*60}", flush=True)
        print(f"  Bankwinkel {angle}°", flush=True)
        print(f"{'─'*60}", flush=True)

        try:
            names, activations = run_for_angle(angle)
            results["variants"][f"bench_{angle}deg"] = activations
            print_result(activations, angle)
        except Exception as e:
            print(f"  FEHLER: {e}", flush=True)
            results["variants"][f"bench_{angle}deg"] = {"error": str(e)}

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}", flush=True)
    print(f"  Gespeichert: {OUTPUT_JSON}", flush=True)
    print("=" * 60, flush=True)
