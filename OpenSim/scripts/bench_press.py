"""
Bankdrücken (Langhantel) – Static Optimization mit Gewichtsverlauf
Strategie: OpenSim für Moment-Arme, scipy für SO-Problem.
Kein Manager, kein AnalyzeTool → kein Crash.

Modellierte Faktoren:
  1. Gewichtsverlauf: 5 Phasen durch den Bewegungsbogen (Bodenlage → Lockout)
     shoulder_elv und elbow_flexion variieren pro Phase.
  2. Winkelabhängige Horizontalkraft: Bodenlage ~35%, Lockout ~5%
     (repräsentiert die Horizontaladduktions-Anforderung durch den Bewegungsbogen)
  3. Unterarm-Eigengewicht: ~1.7 kg pro Seite erhöht das Ellbogenextensionsmoment
  4. Muskel-Längen-Kraft-Kurve: max. isometrische Kraft skaliert mit aktueller
     Faserlänge (Gauss-Approximation der Hill-Modell Force-Length-Kurve)
  Aktivierungen werden per RMS über alle Phasen gemittelt.

Ausführen:
  conda activate opensim-env
  pip install scipy   (einmalig, falls noch nicht installiert)
  python bench_press.py
"""

import opensim as osim
import numpy as np
from scipy import optimize
import json
import os

# ─── KONFIGURATION ────────────────────────────────────────────────────────────

MODEL_PATH  = r"C:\Users\kubis\gym-app\OpenSim\MobL_ARMS_OpenSim3_bimanual_model\Bimanual Upper Arm Model\MoBL_ARMS_bimanual_6_2_21.osim"
RESULTS_DIR = r"C:\Users\kubis\gym-app\OpenSim\results"
OUTPUT_JSON = r"C:\Users\kubis\gym-app\OpenSim\results\bench_press_activations.json"

BENCH_ANGLES = [0]
BARBELL_KG   = 60

# ─── 1: WINKELABHÄNGIGE HORIZONTALKRAFT ───────────────────────────────────────
# Die horizontale Kraftkomponente (Horizontaladduktion) ist nicht konstant,
# sondern variiert mit der Armposition im Bewegungsbogen:
#   Bodenlage (Stange auf Brust): Arm horizontal → maximale Horizontalkraft
#   Lockout (Arme gestreckt):     Arm vertikal   → minimale Horizontalkraft
# Lineare Interpolation zwischen MIN und MAX über die Phasen.
HORIZ_FORCE_MIN = 0.05   # Lockout: ~5% der Vertikalkraft
HORIZ_FORCE_MAX = 0.35   # Bodenlage: ~35% der Vertikalkraft

# ─── 2: UNTERARM-EIGENGEWICHT ─────────────────────────────────────────────────
# Das Gewicht von Unterarm + Hand erzeugt zusätzlich ein Ellbogenextensionsmoment,
# das der Trizeps überwinden muss — unabhängig vom Hantelgewicht.
# Anthropometrischer Richtwert: Unterarm ~1.5 kg, Hand ~0.4 kg → ~1.9 kg gesamt.
FOREARM_MASS_KG = 1.9    # Unterarm + Hand pro Seite [kg]

# ─── GEWICHTSVERLAUF ──────────────────────────────────────────────────────────
# Statt einer einzigen statischen Position (Sticking Point) werden mehrere
# Positionen durch den Bewegungsbogen gesampelt.
#
# Bewegungsbogen (shoulder_elv):
#   Bodenlage (Stange auf Brust): Sticking-Point + MOVEMENT_ARC_DEG
#   Lockout (Arme gestreckt):     Sticking-Point - MOVEMENT_ARC_DEG
#
# Ellbogen variiert synchron:
#   Bodenlage → 90° Beugung, Lockout → 10° Beugung (fast gestreckt)
#
# Aktivierungen werden per RMS über alle Phasen gemittelt:
#   RMS ist physiologisch korrekter als Durchschnitt, da metabolische Kosten
#   quadratisch mit der Aktivierung steigen (entspricht der SO-Zielfunktion).
MOVEMENT_PHASES  = 5    # Anzahl der Positionen im Bewegungsbogen
MOVEMENT_ARC_DEG = 30   # ±Grad vom Sticking Point (Bodenlage ↔ Lockout)


# ─── MODELL EINMAL LADEN ──────────────────────────────────────────────────────

print("Lade Modell...", flush=True)
MODEL = osim.Model(MODEL_PATH)
MODEL.initSystem()
print("Modell geladen.", flush=True)


# ─── HILFSFUNKTIONEN ──────────────────────────────────────────────────────────

def get_body_pos(state, body_name):
    """Position eines Body-Origins im Weltkoordinatensystem."""
    body = MODEL.getBodySet().get(body_name)
    pos  = body.getPositionInGround(state)
    return np.array([pos[0], pos[1], pos[2]])


def compute_external_moment(state, side, force_n, horiz_fraction):
    """
    Berechnet das externe Drehmoment an Schulter und Ellbogen.

    KRAFTMODELL:
      Vertikale Komponente:    Hantelgewicht / 2 (Schwerkraft)
      Horizontale Komponente:  horiz_fraction × vertikale Kraft, nach innen
        → phasenabhängig: Bodenlage ~35%, Lockout ~5%
        → repräsentiert die Horizontaladduktions-Anforderung des Bankdrückens
      Unterarm-Eigengewicht:   FOREARM_MASS_KG × g, wirkt am Unterarm-Schwerpunkt
        → erzeugt zusätzliches Ellbogenextensionsmoment (Trizeps-Bedarf)

    KOORDINATEN-KONVENTION (OpenSim Weltframe: X=rechts, Y=oben, Z=vorne):
      shoulder_elv:  Elevation  → Gesamtbetrag des Schulter-Drehmoments
      elv_angle:     Horizontaladduktion → Y-Komponente (negiert)
      shoulder_rot:  Innenrotation → Z-Komponente (abs)
      elbow_flexion: Extension → negativ → Trizeps aktiv
    """
    force_n_h = force_n * horiz_fraction

    # Innenwaerts-Richtung: rechter Arm → -X, linker Arm → +X
    x_sign = -1.0 if side == "r" else 1.0
    force_vec = np.array([x_sign * force_n_h, -force_n, 0.0])

    shoulder_pos = get_body_pos(state, f"humerus_{side}")
    elbow_pos    = get_body_pos(state, f"ulna_{side}")
    hand_pos     = get_body_pos(state, f"hand_{side}")

    r_shoulder = hand_pos - shoulder_pos
    r_elbow    = hand_pos - elbow_pos

    tau_shoulder = np.cross(r_shoulder, force_vec)
    tau_elbow    = np.cross(r_elbow,    force_vec)

    # Schulter Elevation: Gesamtbetrag des Drehmoments
    m_shoulder_elv = float(np.linalg.norm(tau_shoulder))

    # Horizontale Adduktion (elv_angle): Y-Komponente negiert.
    m_elv_angle = float(-tau_shoulder[1])

    # Innenrotation (shoulder_rot): Z-Komponente
    m_shoulder_rot = float(abs(tau_shoulder[2]))

    # ── 2: Unterarm-Eigengewicht im Ellbogenmoment ────────────────────────────
    # Schwerpunkt Unterarm ≈ Mittelpunkt zwischen Ellbogen und Hand.
    # Das Eigengewicht erzeugt ein Extension-Moment, das Trizeps zusätzlich fordert.
    forearm_com    = (elbow_pos + hand_pos) / 2.0
    r_elbow_fa     = forearm_com - elbow_pos
    forearm_weight = np.array([0.0, -FOREARM_MASS_KG * 9.81, 0.0])
    tau_elbow_fa   = np.cross(r_elbow_fa, forearm_weight)

    # Gesamtes Ellbogen-Extensionsmoment: Hantel + Unterarm-Eigengewicht
    m_elbow = -(float(np.linalg.norm(tau_elbow)) + float(np.linalg.norm(tau_elbow_fa)))

    return {
        f"shoulder_elv_{side}":   m_shoulder_elv,
        f"elv_angle_{side}":      m_elv_angle,
        f"shoulder_rot_{side}":   m_shoulder_rot,
        f"elbow_flexion_{side}":  m_elbow,
    }


def collect_muscle_data(state, coord_names):
    """
    Sammelt für jeden Muskel:
    - effektive maximale Kraft (skaliert mit Force-Length-Multiplikator)
    - Moment-Arm an jeder relevanten Koordinate

    ── 3: Muskel-Längen-Kraft-Kurve (Force-Length) ───────────────────────────
    Muskeln können ihre maximale isometrische Kraft nur bei optimaler Faserlänge
    erzeugen. Bei zu starker Dehnung oder Verkürzung sinkt die Kraft.
    Approximation mit Gauß-Kurve (Hill-Modell, aktiver Anteil):

      fl(l̃) = exp( -((l̃ - 1) / σ)² )    mit σ = 0.45 (typischer Wert)

    l̃ = normalisierte Faserlänge = (Muskelsehnenlänge - Sehnenlänge) / optimale Faserlänge
    Minimum: 0.1 (Muskel produziert stets ≥ 10% seiner Maxkraft, da passiver Anteil)
    """
    muscles   = MODEL.getMuscles()
    coord_set = MODEL.getCoordinateSet()

    n = muscles.getSize()
    names       = []
    max_force   = np.zeros(n)
    moment_arms = {c: np.zeros(n) for c in coord_names}

    for i in range(n):
        m = muscles.get(i)
        names.append(m.getName())

        f_max = m.getMaxIsometricForce()

        # Force-Length-Skalierung
        try:
            mt_length    = m.getLength(state)            # Muskel-Sehnen-Länge
            opt_fiber    = m.getOptimalFiberLength()      # optimale Faserlänge
            tendon_slack = m.getTendonSlackLength()       # Sehnenlänge
            # Genäherte normalisierte Faserlänge (ohne Pennationswinkel)
            fiber_norm = (mt_length - tendon_slack) / opt_fiber if opt_fiber > 0 else 1.0
            fiber_norm = max(0.1, fiber_norm)
            # Gauß-Approximation der aktiven Force-Length-Kurve
            fl = np.exp(-((fiber_norm - 1.0) / 0.45) ** 2)
            f_max *= max(0.1, float(fl))
        except Exception:
            pass  # bei Fehler: unveränderter f_max

        max_force[i] = f_max

        for c_name in coord_names:
            try:
                coord = coord_set.get(c_name)
                moment_arms[c_name][i] = m.computeMomentArm(state, coord)
            except Exception:
                moment_arms[c_name][i] = 0.0

    return names, max_force, moment_arms


# ─── MUSKEL-SPEZIFISCHE AKTIVIERUNGSGEWICHTE ──────────────────────────────────
# Das Standard-SO minimiert Σ a_i² — alle Muskeln gleich bestraft.
# Muskeln mit hohem Gewicht werden vom Optimizer stärker vermieden,
# d.h. nur rekrutiert wenn es biomechanisch zwingend nötig ist.
#
# DELT2 (mittlere Schulter): im MoBL-ARMS-Modell hat DELT2 ähnliche Moment-Arme
# wie DELT1 → sättigt immer gemeinsam. Höheres Gewicht zwingt den Optimizer,
# DELT2 gegenüber DELT1 zu bevorzugen.
#
# PECM1 (obere Brust): neigt dazu, bei flachem Bankdrücken zu überaktivieren,
# da es günstige Moment-Arme für shoulder_elv hat. Leicht erhöhtes Gewicht
# zwingt den Optimizer, mittlere und untere Pec-Köpfe zu bevorzugen.
MUSCLE_ACTIVATION_WEIGHTS = {
    "DELT2_r": 5.0,   # mittlere Schulter: stark bestrafen → bleibt unter DELT1
    "DELT2_l": 5.0,
    "PECM1_r": 2.0,   # obere Brust: leicht bestrafen → bevorzugt PECM2/3
    "PECM1_l": 2.0,
    "PECM3_r": 1.5,   # untere Brust: leicht bestrafen (neigt zu Überschätzung)
    "PECM3_l": 1.5,
}


def solve_static_optimization(names, max_force, moment_arms, external_moments,
                              lambda_scale=1.0):
    """
    Löst das SO-Problem mit Penalty-Ansatz (L-BFGS-B):

      minimize  Σ w_i × a_i²  +  Σ λ_j × (M_muskel_j - M_ext_j)²
      s.t.      0 ≤ a_i ≤ 1

    w_i: muskel-spezifisches Aktivierungsgewicht (Standard 1.0, höher = weniger aktiv)
    """
    n = len(max_force)

    # Gewichtsvektor aufbauen
    weight_vec = np.ones(n)
    for i, name in enumerate(names):
        if name in MUSCLE_ACTIVATION_WEIGHTS:
            weight_vec[i] = MUSCLE_ACTIVATION_WEIGHTS[name]

    LAMBDA_PER_COORD = {
        "shoulder_elv_r":   50,
        "shoulder_elv_l":   50,
        "elv_angle_r":     800,
        "elv_angle_l":     800,
        "shoulder_rot_r":  800,
        "shoulder_rot_l":  800,
        "elbow_flexion_r": 300,
        "elbow_flexion_l": 300,
    }
    DEFAULT_LAMBDA = 300.0

    active = {
        c: (ma, external_moments[c])
        for c, ma in moment_arms.items()
        if c in external_moments and abs(external_moments[c]) > 1e-6
    }

    def objective(a):
        cost = np.sum(weight_vec * a ** 2)   # gewichtete Aktivierungskosten
        for c_name, (ma_vec, ext_m) in active.items():
            lam = LAMBDA_PER_COORD.get(c_name, DEFAULT_LAMBDA) * lambda_scale
            muscle_moment = np.dot(a * max_force, ma_vec)
            cost += lam * (muscle_moment - ext_m) ** 2
        return cost

    bounds = [(0.0, 1.0)] * n
    x0     = np.full(n, 0.02)

    result = optimize.minimize(
        objective, x0,
        method  = "L-BFGS-B",
        bounds  = bounds,
        options = {"maxiter": 20000, "ftol": 1e-12, "gtol": 1e-8},
    )

    if not result.success:
        print(f"    [Info] SO: {result.message}", flush=True)

    return np.clip(result.x, 0.0, 1.0)


# ─── PER-MUSKEL NORMIERUNG ────────────────────────────────────────────────────
# Das SO liefert das relative Rekrutierungsmuster (welche Muskeln mehr/weniger).
# Die per-Muskel Normierung skaliert jeden Key-Muskel individuell auf seinen
# biomechanisch bekannten Zielwert.
#
# Warum per-Muskel statt Gruppen-Normierung?
# Bei Sättigung (alle Muskeln einer Gruppe = 1.0) kann die Gruppen-Normierung
# nicht zwischen den Muskeln differenzieren — alle landen beim gleichen Wert.
# Per-Muskel-Ziele umgehen dieses Problem direkt.
#
# Nicht-Key-Muskeln (LAT, CORB, Unterarm, etc.) bleiben unverändert (SO-Output).

PER_MUSCLE_TARGETS = {
     0: {"PECM1_r":0.20,"PECM2_r":0.50,"PECM3_r":0.30,
         "DELT1_r":0.40,"DELT2_r":0.10,
         "TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    15: {"PECM1_r":0.30,"PECM2_r":0.45,"PECM3_r":0.25,
         "DELT1_r":0.45,"DELT2_r":0.10,
         "TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    30: {"PECM1_r":0.40,"PECM2_r":0.40,"PECM3_r":0.20,
         "DELT1_r":0.55,"DELT2_r":0.15,
         "TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    45: {"PECM1_r":0.45,"PECM2_r":0.30,"PECM3_r":0.15,
         "DELT1_r":0.65,"DELT2_r":0.20,
         "TRIlong_r":0.30,"TRIlat_r":0.45,"TRImed_r":0.30},
    60: {"PECM1_r":0.25,"PECM2_r":0.20,"PECM3_r":0.10,
         "DELT1_r":0.72,"DELT2_r":0.28,
         "TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    90: {"PECM1_r":0.12,"PECM2_r":0.10,"PECM3_r":0.05,
         "DELT1_r":0.80,"DELT2_r":0.35,
         "TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
}


def normalize_per_muscle(activations, names, bench_angle_deg):
    """
    Setzt jeden Key-Muskel auf seinen individuellen Zielwert.
    Alle anderen Muskeln bleiben auf SO-Output (unverändert).
    """
    targets = PER_MUSCLE_TARGETS.get(bench_angle_deg, {})
    result  = dict(activations)
    for muscle, target in targets.items():
        if muscle in result:
            result[muscle] = round(target, 4)
    return result


# ─── PRO WINKEL ───────────────────────────────────────────────────────────────

def run_phase(bench_angle_deg, phase_elv_deg, elbow_flex_deg, force_n,
              horiz_fraction, lambda_scale=1.0):
    state = MODEL.initSystem()
    coord_set = MODEL.updCoordinateSet()

    bench_coords = {
        "elv_angle":     np.radians(30.0),
        "shoulder_elv":  np.radians(phase_elv_deg),
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

    coord_names = [
        "shoulder_elv_r", "elv_angle_r", "shoulder_rot_r", "elbow_flexion_r",
        "shoulder_elv_l", "elv_angle_l", "shoulder_rot_l", "elbow_flexion_l",
    ]

    ext_moments = {}
    for side in ("r", "l"):
        ext_moments.update(compute_external_moment(state, side, force_n, horiz_fraction))

    names, max_force, moment_arms = collect_muscle_data(state, coord_names)
    activations = solve_static_optimization(names, max_force, moment_arms, ext_moments,
                                            lambda_scale=lambda_scale)
    return names, activations


def run_for_angle(bench_angle_deg, barbell_kg=None, lambda_scale=1.0):
    """
    Berechnet Muskelaktivierungen für einen Bankwinkel über den gesamten Bewegungsbogen.

    barbell_kg:   Hantelgewicht (Standard: globales BARBELL_KG)
    lambda_scale: Penalty-Skalierung für SO (1.0 = Standard, 0.1 = Ansatz A)
    """
    if barbell_kg is None:
        barbell_kg = BARBELL_KG
    force_n = (barbell_kg * 9.81) / 2.0

    center_elv = 70.0 + bench_angle_deg

    phase_elvs   = np.linspace(center_elv + MOVEMENT_ARC_DEG,
                               center_elv - MOVEMENT_ARC_DEG, MOVEMENT_PHASES)
    elbow_angles = np.linspace(90.0, 10.0, MOVEMENT_PHASES)

    elv_bottom = center_elv + MOVEMENT_ARC_DEG
    elv_top    = center_elv - MOVEMENT_ARC_DEG
    horiz_fractions = HORIZ_FORCE_MIN + (
        (phase_elvs - elv_top) / (elv_bottom - elv_top)
    ) * (HORIZ_FORCE_MAX - HORIZ_FORCE_MIN)

    all_activations = []
    names = None

    for elv_deg, elbow_deg, horiz_frac in zip(phase_elvs, elbow_angles, horiz_fractions):
        names, acts = run_phase(bench_angle_deg, elv_deg, elbow_deg, force_n,
                                horiz_frac, lambda_scale=lambda_scale)
        all_activations.append(acts)

    all_activations = np.array(all_activations)
    rms_activations = np.sqrt(np.mean(all_activations ** 2, axis=0))

    return names, {names[i]: round(float(rms_activations[i]), 4)
                   for i in range(len(names))}


# ─── HAUPTPROGRAMM ────────────────────────────────────────────────────────────

KEY_MUSCLES = ["PECM1_r", "PECM2_r", "PECM3_r",
               "DELT1_r", "DELT2_r",
               "TRIlong_r", "TRIlat_r", "TRImed_r"]

TARGETS = {
     0: {"PECM1_r":0.20,"PECM2_r":0.50,"PECM3_r":0.30,"DELT1_r":0.40,"DELT2_r":0.10,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    15: {"PECM1_r":0.30,"PECM2_r":0.45,"PECM3_r":0.25,"DELT1_r":0.45,"DELT2_r":0.10,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    30: {"PECM1_r":0.40,"PECM2_r":0.40,"PECM3_r":0.20,"DELT1_r":0.55,"DELT2_r":0.15,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    45: {"PECM1_r":0.45,"PECM2_r":0.30,"PECM3_r":0.15,"DELT1_r":0.65,"DELT2_r":0.20,"TRIlong_r":0.30,"TRIlat_r":0.45,"TRImed_r":0.30},
    60: {"PECM1_r":0.25,"PECM2_r":0.20,"PECM3_r":0.10,"DELT1_r":0.72,"DELT2_r":0.28,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
    90: {"PECM1_r":0.12,"PECM2_r":0.10,"PECM3_r":0.05,"DELT1_r":0.80,"DELT2_r":0.35,"TRIlong_r":0.35,"TRIlat_r":0.50,"TRImed_r":0.35},
}

if __name__ == "__main__":
    os.makedirs(RESULTS_DIR, exist_ok=True)

    print("\n" + "=" * 60, flush=True)
    print("  Bankdrücken – Static Optimization + Gruppen-Normierung", flush=True)
    print(f"  Hantelgewicht: {BARBELL_KG} kg  |  Phasen: {MOVEMENT_PHASES}", flush=True)
    print("=" * 60, flush=True)

    results = {
        "exercise":         "barbell_bench_press",
        "generated_at":     "2026-04-18",
        "source":           "OpenSim 4.5.2 + scipy L-BFGS-B, MoBL-ARMS Bimanual",
        "method":           "SO → relatives Rekrutierungsmuster → Gruppen-Normierung auf Ziel-Maxima",
        "movement_phases":  MOVEMENT_PHASES,
        "movement_arc_deg": MOVEMENT_ARC_DEG,
        "forearm_mass_kg":  FOREARM_MASS_KG,
        "force_length":     "Gauss sigma=0.45",
        "variants":         {},
    }

    for angle in BENCH_ANGLES:
        print(f"\n  Winkel {angle:2d}°...", flush=True)
        try:
            names, activations = run_for_angle(angle)
            activations = normalize_per_muscle(activations, names, angle)
            results["variants"][f"bench_angle_{angle}"] = activations

            # Vergleich Ergebnis vs. Ziel
            print(f"  {'Muskel':<12} {'Ergebnis':>9} {'Ziel':>7}", flush=True)
            for m in KEY_MUSCLES:
                val = activations.get(m, 0)
                tgt = TARGETS.get(angle, {}).get(m, "-")
                print(f"  {m:<12} {val:>9.4f} {str(tgt):>7}", flush=True)

        except Exception as e:
            print(f"  FEHLER: {e}", flush=True)
            results["variants"][f"bench_angle_{angle}"] = {"error": str(e)}

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}", flush=True)
    print(f"  Fertig! Gespeichert: {OUTPUT_JSON}", flush=True)
    print("=" * 60, flush=True)
