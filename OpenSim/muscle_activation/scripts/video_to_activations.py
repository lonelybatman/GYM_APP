"""
video_to_activations.py
-----------------------
Pipeline: MediaPipe-Winkel (angles.json) → OpenSim Static Optimization → Muskelaktivierungen

Ausführen in opensim-env:
  conda activate opensim-env
  python video_to_activations.py

Liest:  ../results/angles.json   (erzeugt von extract_angles.py in mediapipe-env)
Schreibt: ../results/video_activations.json

Koordinaten-Umrechnung:
  MediaPipe → OpenSim (MoBL-ARMS Bimanual):
  - Ellbogen: opensim_elbow = 180° - mediapipe_elbow_flex
      MediaPipe 167° (Lockout) → OpenSim 13° (fast gestreckt)  ✓
      MediaPipe  65° (Unten)   → OpenSim 115° (tief gebeugt)   ✓
  - Schulter-Elevation: leitet sich aus dem Ellbogenwinkel ab
      Bei Bankdrücken (flach) ist die Schulter-Elevation geometrisch
      an den Ellbogenwinkel gekoppelt:
      opensim_shoulder_elv = 40° + (opensim_elbow / 115°) × 60°
      (Lockout 40° → Unten 100°, passend zum Gewichtsverlauf in bench_press.py)
"""

import json
import os
import sys
import numpy as np
from scipy import optimize

# OpenSim-Pfad (muss in opensim-env verfügbar sein)
try:
    import opensim as osim
except ImportError:
    print("FEHLER: OpenSim nicht gefunden. Aktiviere 'opensim-env'.")
    sys.exit(1)

# ─── KONFIGURATION ────────────────────────────────────────────────────────────

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
ANGLES_JSON  = os.path.join(SCRIPT_DIR, "..", "results", "angles.json")
OUTPUT_JSON  = os.path.join(SCRIPT_DIR, "..", "results", "video_activations.json")
RESULTS_DIR  = os.path.join(SCRIPT_DIR, "..", "results")

MODEL_PATH   = r"C:\Users\kubis\gym-app\OpenSim\MobL_ARMS_OpenSim3_bimanual_model\Bimanual Upper Arm Model\MoBL_ARMS_bimanual_6_2_21.osim"

BARBELL_KG      = 60       # Hantelgewicht
FOREARM_MASS_KG = 1.9      # Unterarm + Hand [kg]
HORIZ_FORCE_MIN = 0.05     # Lockout
HORIZ_FORCE_MAX = 0.35     # Unten

MUSCLE_WEIGHTS = {
    "DELT2_r": 5.0, "DELT2_l": 5.0,
    "PECM1_r": 2.0, "PECM1_l": 2.0,
    "PECM3_r": 1.5, "PECM3_l": 1.5,
}

KEY_MUSCLES = ["PECM1_r", "PECM2_r", "PECM3_r",
               "DELT1_r", "DELT2_r",
               "TRIlong_r", "TRIlat_r", "TRImed_r"]

# ─── MODELL LADEN ─────────────────────────────────────────────────────────────

print("Lade OpenSim-Modell...", flush=True)
MODEL = osim.Model(MODEL_PATH)
MODEL.initSystem()
print("Modell geladen.\n", flush=True)

# ─── KOORDINATEN-UMRECHNUNG ───────────────────────────────────────────────────

def mediapipe_to_opensim(mediapipe_elbow_flex: float, bench_angle_deg: float = 0.0):
    """
    Rechnet MediaPipe-Winkel in OpenSim-Koordinaten um.

    opensim_elbow:
      180° - mediapipe_elbow  (OpenSim: 0° = gestreckt, MediaPipe: 180° = gestreckt)

    opensim_shoulder_elv:
      Bei Bankdrücken ist die Schulter-Elevation geometrisch an den Ellbogenwinkel gebunden.
      Lockout (elbow~13°) → shoulder_elv~40°
      Unten   (elbow~115°) → shoulder_elv~100°
      Lineare Interpolation + Bankwinkel-Offset.
    """
    elbow_os = 180.0 - mediapipe_elbow_flex
    elbow_os = float(np.clip(elbow_os, 0.0, 150.0))

    # Schulter-Elevation: linear aus Ellbogenwinkel + Bankwinkel-Offset
    t = elbow_os / 115.0                          # 0 (Lockout) → 1 (Unten)
    shoulder_elv_os = 40.0 + t * 60.0            # 40° (Lockout) → 100° (Unten)
    shoulder_elv_os += bench_angle_deg            # Incline-Offset

    # Horizontalkraft: Lockout = minimal, Unten = maximal
    horiz_frac = HORIZ_FORCE_MIN + t * (HORIZ_FORCE_MAX - HORIZ_FORCE_MIN)

    return {
        "elbow_flex_os":    elbow_os,
        "shoulder_elv_os":  shoulder_elv_os,
        "horiz_frac":       horiz_frac,
    }


# ─── OPENSIM HILFSFUNKTIONEN ─────────────────────────────────────────────────

def get_body_pos(state, body_name):
    body = MODEL.getBodySet().get(body_name)
    pos  = body.getPositionInGround(state)
    return np.array([pos[0], pos[1], pos[2]])


def compute_external_moment(state, side, force_n, horiz_fraction):
    force_n_h = force_n * horiz_fraction
    x_sign    = -1.0 if side == "r" else 1.0
    force_vec = np.array([x_sign * force_n_h, -force_n, 0.0])

    shoulder_pos = get_body_pos(state, f"humerus_{side}")
    elbow_pos    = get_body_pos(state, f"ulna_{side}")
    hand_pos     = get_body_pos(state, f"hand_{side}")

    r_shoulder = hand_pos - shoulder_pos
    r_elbow    = hand_pos - elbow_pos

    tau_shoulder = np.cross(r_shoulder, force_vec)
    tau_elbow    = np.cross(r_elbow,    force_vec)

    m_shoulder_elv = float(np.linalg.norm(tau_shoulder))
    m_elv_angle    = float(-tau_shoulder[1])
    m_shoulder_rot = float(abs(tau_shoulder[2]))

    forearm_com    = (elbow_pos + hand_pos) / 2.0
    r_elbow_fa     = forearm_com - elbow_pos
    forearm_weight = np.array([0.0, -FOREARM_MASS_KG * 9.81, 0.0])
    tau_elbow_fa   = np.cross(r_elbow_fa, forearm_weight)

    m_elbow = -(float(np.linalg.norm(tau_elbow)) + float(np.linalg.norm(tau_elbow_fa)))

    return {
        f"shoulder_elv_{side}":  m_shoulder_elv,
        f"elv_angle_{side}":     m_elv_angle,
        f"shoulder_rot_{side}":  m_shoulder_rot,
        f"elbow_flexion_{side}": m_elbow,
    }


def collect_muscle_data(state, coord_names):
    muscles   = MODEL.getMuscles()
    coord_set = MODEL.getCoordinateSet()
    n = muscles.getSize()

    names       = []
    max_force   = np.zeros(n)
    moment_arms = {c: np.zeros(n) for c in coord_names}

    for i in range(n):
        m     = muscles.get(i)
        names.append(m.getName())
        f_max = m.getMaxIsometricForce()

        try:
            mt_length    = m.getLength(state)
            opt_fiber    = m.getOptimalFiberLength()
            tendon_slack = m.getTendonSlackLength()
            fiber_norm   = (mt_length - tendon_slack) / opt_fiber if opt_fiber > 0 else 1.0
            fiber_norm   = max(0.1, fiber_norm)
            fl           = np.exp(-((fiber_norm - 1.0) / 0.45) ** 2)
            f_max       *= max(0.1, float(fl))
        except Exception:
            pass

        max_force[i] = f_max
        for c_name in coord_names:
            try:
                coord = coord_set.get(c_name)
                moment_arms[c_name][i] = m.computeMomentArm(state, coord)
            except Exception:
                moment_arms[c_name][i] = 0.0

    return names, max_force, moment_arms


def solve_static_optimization(names, max_force, moment_arms, external_moments):
    n = len(max_force)
    weight_vec = np.ones(n)
    for i, name in enumerate(names):
        if name in MUSCLE_WEIGHTS:
            weight_vec[i] = MUSCLE_WEIGHTS[name]

    # Lambda stark reduziert (0.1×) → Constraints weich → Muskeln sättigen nicht
    LAMBDA = {
        "shoulder_elv_r": 5,   "shoulder_elv_l": 5,
        "elv_angle_r":   80,   "elv_angle_l":   80,
        "shoulder_rot_r": 80,  "shoulder_rot_l": 80,
        "elbow_flexion_r": 30, "elbow_flexion_l": 30,
    }

    active = {
        c: (ma, external_moments[c])
        for c, ma in moment_arms.items()
        if c in external_moments and abs(external_moments[c]) > 1e-6
    }

    def objective(a):
        cost = np.sum(weight_vec * a ** 2)
        for c_name, (ma_vec, ext_m) in active.items():
            lam          = LAMBDA.get(c_name, 30.0)
            muscle_moment = np.dot(a * max_force, ma_vec)
            cost         += lam * (muscle_moment - ext_m) ** 2
        return cost

    result = optimize.minimize(
        objective, np.full(n, 0.02),
        method="L-BFGS-B",
        bounds=[(0.0, 1.0)] * n,
        options={"maxiter": 20000, "ftol": 1e-12, "gtol": 1e-8},
    )
    return np.clip(result.x, 0.0, 1.0)


def run_single_phase(shoulder_elv_deg, elbow_flex_deg, force_n, horiz_frac):
    """Berechnet Muskelaktivierungen für eine einzige Position."""
    state     = MODEL.initSystem()
    coord_set = MODEL.updCoordinateSet()

    coords = {
        "elv_angle":     np.radians(30.0),
        "shoulder_elv":  np.radians(shoulder_elv_deg),
        "shoulder_rot":  np.radians(-20.0),
        "elbow_flexion": np.radians(elbow_flex_deg),
        "pro_sup":       np.radians(-80.0),
    }
    for base, val in coords.items():
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
        ext_moments.update(compute_external_moment(state, side, force_n, horiz_frac))

    names, max_force, moment_arms = collect_muscle_data(state, coord_names)
    activations = solve_static_optimization(names, max_force, moment_arms, ext_moments)

    return names, activations


# ─── WINKEL AUS JSON LESEN ────────────────────────────────────────────────────

def load_key_frames(angles_json_path):
    """
    Liest angles.json und extrahiert repräsentative Positionen:
    - Unten (min Ellbogen-Flexion = max Beugung, bar auf Brust)
    - Oben / Lockout (max Ellbogen-Flexion = fast gestreckt)
    - Quartile für Zwischen-Positionen
    Gibt Liste von (label, mediapipe_elbow_flex) zurück.
    """
    with open(angles_json_path, encoding="utf-8") as f:
        data = json.load(f)

    valid = [fr for fr in data["frames"]
             if fr["elbow_flex"] is not None and fr["shoulder_elev"] is not None]

    if not valid:
        raise ValueError("Keine validen Frames in angles.json")

    elbow_vals = [fr["elbow_flex"] for fr in valid]
    elbow_arr  = np.array(elbow_vals)

    # Statistik ausgeben
    print(f"  Valide Frames:      {len(valid)}")
    print(f"  Ellbogen (MediaPipe): min={elbow_arr.min():.1f}°  "
          f"max={elbow_arr.max():.1f}°  mean={elbow_arr.mean():.1f}°")

    # 5 repräsentative Positionen:
    # MediaPipe: 180° = Lockout (gestreckt), 65° = Unten (gebeugt)
    # Höherer Wert = gestreckter = Lockout → max = Lockout, min = Unten
    key_frames = [
        ("lockout",        float(np.percentile(elbow_arr, 95))),  # fast gestreckt
        ("obere_haelfte",  float(np.percentile(elbow_arr, 75))),
        ("mitte",          float(np.percentile(elbow_arr, 50))),
        ("untere_haelfte", float(np.percentile(elbow_arr, 25))),
        ("unten",          float(np.percentile(elbow_arr,  5))),  # tief gebeugt
    ]

    for label, val in key_frames:
        print(f"  {label:<20} Ellbogen: {val:.1f}°")

    return key_frames


# ─── HAUPTPROGRAMM ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.makedirs(RESULTS_DIR, exist_ok=True)

    print("=" * 60, flush=True)
    print("  Video → OpenSim Muskelaktivierungen", flush=True)
    print(f"  Hantelgewicht: {BARBELL_KG} kg", flush=True)
    print("=" * 60, flush=True)
    print()

    print(f"Lese Winkel aus: {ANGLES_JSON}")
    key_frames = load_key_frames(ANGLES_JSON)
    print()

    force_n = (BARBELL_KG * 9.81) / 2.0
    results = {
        "exercise":       "barbell_bench_press",
        "source_video":   "benchpress_0.mp4",
        "barbell_kg":     BARBELL_KG,
        "method":         "MediaPipe → OpenSim SO (L-BFGS-B)",
        "positions":      {},
    }

    all_activations_arr = None
    names_global = None

    for label, mp_elbow in key_frames:
        print(f"─── Position: {label}  (MediaPipe Ellbogen: {mp_elbow:.1f}°) ───",
              flush=True)

        coords = mediapipe_to_opensim(mp_elbow, bench_angle_deg=0.0)
        print(f"  → OpenSim: shoulder_elv={coords['shoulder_elv_os']:.1f}°  "
              f"elbow={coords['elbow_flex_os']:.1f}°  "
              f"horiz={coords['horiz_frac']:.2f}", flush=True)

        names, acts = run_single_phase(
            shoulder_elv_deg = coords["shoulder_elv_os"],
            elbow_flex_deg   = coords["elbow_flex_os"],
            force_n          = force_n,
            horiz_frac       = coords["horiz_frac"],
        )
        names_global = names

        act_dict = {names[i]: round(float(acts[i]), 4) for i in range(len(names))}
        results["positions"][label] = {
            "mediapipe_elbow_deg":   round(mp_elbow, 2),
            "opensim_elbow_deg":     round(coords["elbow_flex_os"], 2),
            "opensim_shoulder_deg":  round(coords["shoulder_elv_os"], 2),
            "horiz_fraction":        round(coords["horiz_frac"], 3),
            "activations":           act_dict,
        }

        # Key-Muskeln ausgeben
        print(f"  {'Muskel':<14} {'Aktivierung':>12}")
        for m in KEY_MUSCLES:
            print(f"  {m:<14} {act_dict.get(m, 0):>12.4f}", flush=True)
        print()

        if all_activations_arr is None:
            all_activations_arr = acts.reshape(1, -1)
        else:
            all_activations_arr = np.vstack([all_activations_arr, acts])

    # RMS über alle Positionen → repräsentative Gesamt-Aktivierung
    if all_activations_arr is not None and names_global is not None:
        rms = np.sqrt(np.mean(all_activations_arr ** 2, axis=0))
        rms_dict = {names_global[i]: round(float(rms[i]), 4)
                    for i in range(len(names_global))}
        results["rms_over_movement"] = rms_dict

        print("═" * 60, flush=True)
        print("  RMS über alle Positionen (Gesamt-Aktivierung):", flush=True)
        print(f"  {'Muskel':<14} {'RMS':>8}", flush=True)
        for m in KEY_MUSCLES:
            print(f"  {m:<14} {rms_dict.get(m, 0):>8.4f}", flush=True)

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}", flush=True)
    print(f"  Gespeichert: {OUTPUT_JSON}", flush=True)
    print("=" * 60, flush=True)
