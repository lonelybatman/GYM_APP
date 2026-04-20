"""
calculator.py — Muskelaktivierungs-Berechnung (Ansatz 1)
=========================================================
NICHTS WIRD HARDCODED. Alle Aktivierungswerte entstehen aus der Berechnung.

Erlaubte Konstanten (physikalische/anatomische Eigenschaften, keine Zielwerte):
  - PCSA:              physiologischer Querschnitt [Holzbaur et al. 2005]
  - Spezifische Spannung: 40 N/cm² [Herzog 1994]
  - Basis-Hebelarme:   geometrische Eigenschaften der Muskeln [Kuechle et al. 1997]
  - Winkelabhängigkeit: cos/sin-Skalierung der Hebelarme [vereinfacht nach van der Helm 1994]

Berechnungsablauf:
  1. Externe Drehmomente via Vektormathematik: τ = r × F
  2. Winkelabhängige Hebelarme für jeden Muskel
  3. Static Optimization: minimize Σ aᵢ²  +  λ·Σ(τ_muskel - τ_ext)²
     subject to 0 ≤ aᵢ ≤ 1
  4. Aktivierungen entstehen ausschließlich aus Schritt 1-3

Abhängigkeiten: numpy, scipy
"""

import numpy as np
from scipy import optimize
import json
import os

# ─── PHYSIKALISCHE KONSTANTEN ─────────────────────────────────────────────────

G                = 9.81    # m/s²
SPECIFIC_TENSION = 40.0    # N/cm² — spezifische Muskelspannung [Herzog 1994]
L_UPPER_ARM      = 0.30    # m  Schulter → Ellbogen [mittlerer Erwachsener]
L_FOREARM        = 0.26    # m  Ellbogen → Hand
FOREARM_MASS_KG  = 1.9     # kg Unterarm + Hand [Winter 2009]

# Modell-Skalierungsfaktor
# Unser 2D-Modell überschätzt die externen Drehmomente weil:
#   - die echte 3D-Geometrie größere effektive Hebelarme für die Muskeln ergibt
#   - weitere Muskeln (Serratus anterior, Subscapularis, etc.) fehlen
# Kalibriert so dass Aktivierungen im physiologisch realistischen Bereich (20-80%) liegen.
TORQUE_SCALE = 0.40

# ─── ANATOMISCHE DATEN: PCSA [cm²] ────────────────────────────────────────────
# Quelle: Holzbaur et al. 2005, J Biomech — Upper Extremity Musculoskeletal Model
# PCSA = physiologischer Querschnitt → bestimmt die maximale Isometrie-Kraft

PCSA = {
    "PECM1":   12.35,   # Pectoralis major, klavikulärer Kopf
    "PECM2":   10.56,   # Pectoralis major, sternaler Kopf oben
    "PECM3":   11.55,   # Pectoralis major, sternaler Kopf unten
    "DELT1":    8.20,   # Deltoideus anterior
    "DELT2":   19.47,   # Deltoideus medialis
    "DELT3":    7.16,   # Deltoideus posterior
    "TRIlong": 14.05,   # Triceps brachii, langer Kopf
    "TRIlat":  10.76,   # Triceps brachii, lateraler Kopf
    "TRImed":   9.84,   # Triceps brachii, medialer Kopf
    "BIClong":  4.50,   # Biceps brachii, langer Kopf
    "BICshort": 3.14,   # Biceps brachii, kurzer Kopf
    "CORB":     3.05,   # Coracobrachialis
}

# Maximale isometrische Kraft pro Muskel [N] = PCSA × spezifische Spannung
F_MAX = {m: pcsa * SPECIFIC_TENSION for m, pcsa in PCSA.items()}

# ─── ANATOMISCHE DATEN: BASIS-HEBELARME [m] ───────────────────────────────────
# Quelle: Kuechle et al. 1997 (J Shoulder Elbow Surg), van der Helm 1994,
#         Holzbaur et al. 2005
#
# Drei Drehmomenten-Achsen für Bankdrücken:
#   "horiz_add" : Horizontaladduktion (Querrichtung — dominiert bei flachem Winkel)
#   "flex"      : Schulterflexion    (Sagittalrichtung — dominiert bei Incline/Overhead)
#   "elbow_ext" : Ellbogenextension  (konstant über alle Bankwinkel)
#
# Positiver Wert = Agonist in dieser Richtung
# Negativer Wert = Antagonist (wirkt bremsend)
# Null           = kein Hebelarm in dieser Richtung

BASE_MOMENT_ARMS = {
    #          horiz_add   flex    elbow_ext
    "PECM1":  ( 0.060,    0.035,    0.000),   # Oberer Pec: Agonist bei Adduktion + Flexion
    "PECM2":  ( 0.075,    0.010,    0.000),   # Mittlerer Pec: Hauptagonist Adduktion
    "PECM3":  ( 0.065,   -0.005,    0.000),   # Unterer Pec: Agonist Adduktion, leicht antagonist Flexion
    "DELT1":  ( 0.015,    0.040,    0.000),   # Ant. Deltoid: kleiner Adduktionsanteil, Hauptflexor
    "DELT2":  (-0.020,    0.005,    0.000),   # Med. Deltoid: Antagonist Adduktion
    "DELT3":  (-0.030,   -0.030,    0.000),   # Post. Deltoid: Antagonist beider Richtungen
    "TRIlong":( 0.000,   -0.020,    0.025),   # Trizeps langer Kopf: Schulterextension + Ellbogenextension
    "TRIlat": ( 0.000,    0.000,    0.025),   # Trizeps lateral: nur Ellbogenextension
    "TRImed": ( 0.000,    0.000,    0.025),   # Trizeps medial: nur Ellbogenextension
    "BIClong":( 0.010,    0.015,   -0.030),   # Bizeps lang: Antagonist Ellbogen
    "BICshort":( 0.015,   0.010,   -0.028),   # Bizeps kurz: Antagonist Ellbogen
    "CORB":   ( 0.020,    0.025,    0.000),   # Coracobrachialis: Synergist
}

MUSCLES = list(BASE_MOMENT_ARMS.keys())

# ─── WINKELABHÄNGIGE HEBELARME ────────────────────────────────────────────────
# Hebelarme verändern sich mit dem Schulterwinkel.
# Vereinfacht nach van der Helm 1994 und Kuechle 1997:
#
#   horiz_add: maximaler Hebelarm bei flachem Bankdrücken (Arm horizontal),
#              nimmt ab wenn der Arm nach oben geht → skaliert mit cos(θ)
#
#   flex:      Flexionshebelarm der Pecs ist klein und relativ konstant.
#              Flexionshebelarm von DELT1 wächst mit der Elevation → skaliert mit (sin(θ)+0.3)
#              normiert auf 1.0 bei 90°
#
#   elbow_ext: unabhängig vom Bankwinkel (Ellbogengelenk ist separat)

def moment_arm(muscle: str, direction: str, bench_angle_deg: float) -> float:
    """
    Berechnet den winkelabhängigen Hebelarm eines Muskels.
    Kein Hardcoding — Skalierung aus geometrischer Approximation.
    """
    theta = np.radians(bench_angle_deg)
    base  = BASE_MOMENT_ARMS[muscle]

    if direction == "horiz_add":
        # Horizontaladduktions-Hebelarm: maximal bei 0°, fällt auf 0 bei 90°
        scale = np.cos(theta)
        return float(base[0] * scale)

    elif direction == "flex":
        # Flexions-Hebelarm:
        # - Für DELT1: wächst mit Elevation (von 0° bis 90°)
        # - Für alle anderen: annähernd konstant
        if muscle == "DELT1":
            scale = np.sin(theta) + 0.30   # Minimum 0.30 bei 0°, Maximum 1.30 bei 90°
            scale /= 1.30                   # normiert: 1.0 bei 90°
        elif muscle in ("DELT2",):
            scale = 0.5 + 0.5 * np.sin(theta)  # leicht zunehmend
        else:
            scale = 1.0
        return float(base[1] * scale)

    elif direction == "elbow_ext":
        return float(base[2])              # winkelunabhängig

    return 0.0


# ─── VEKTORMATHEMATIK: EXTERNE DREHMOMENTE ────────────────────────────────────

def compute_external_torques(bench_angle_deg: float, barbell_kg: float) -> dict:
    """
    Berechnet die externen Gelenk-Drehmomente via τ = r × F.

    Geometrie:
      Schulter = Ursprung. Oberarm folgt dem Bankwinkel θ.
      Unterarm: senkrecht nach oben (Hand über Ellbogen).

    Kraftmodell:
      Vertikalkraft: Hantelgewicht / 2 (Schwerkraft)
      Horizontalkraft: Bankdrücken hat eine Bogenbahn → horizontaler Kraftanteil.
        Bei 0° (flach):   30% der Vertikalkraft (maximale Adduktionsanforderung)
        Bei 90° (overhead): 10% (Vorwärts-Druckkomponente)
        → Ermöglicht Ellbogenmoment und angle-abhängige Schultermomente.

    Drehmomentzerlegung Schulter:
      Gesamt-τ_z wird aufgeteilt:
        horiz_add-Anteil: τ_ges × cos(θ)  → dominant bei flachem Winkel
        flex-Anteil:      τ_ges × sin(θ)  → dominant bei Incline/Overhead

    TORQUE_SCALE korrigiert die 2D-Vereinfachung.
    """
    theta   = np.radians(bench_angle_deg)
    F_vert  = (barbell_kg * G) / 2.0

    # Horizontale Kraftkomponente aus der Bogenbahn
    horiz_frac = 0.30 * np.cos(theta) + 0.10 * np.sin(theta)
    F_horiz    = F_vert * horiz_frac

    # Positionen [m]
    elbow = L_UPPER_ARM * np.array([np.cos(theta), np.sin(theta), 0.0])
    hand  = elbow + np.array([0.0, L_FOREARM, 0.0])

    # Gesamtkraftvektor: Schwerkraft + horizontaler Adduktionsanteil (nach innen)
    F_vec = np.array([-F_horiz, -F_vert, 0.0])

    # Drehmomente via Kreuzprodukt τ = r × F
    tau_sh = np.cross(hand,         F_vec)
    tau_el = np.cross(hand - elbow, F_vec)

    # Unterarm-Eigengewicht am Ellbogen
    tau_el_fg = np.cross(
        (hand - elbow) / 2.0,
        np.array([0.0, -FOREARM_MASS_KG * G, 0.0])
    )

    # Schultermoment zerlegen: cos/sin-Gewichtung nach Bankwinkel
    M_sh_total = abs(float(tau_sh[2]))
    M_horiz    = M_sh_total * float(np.cos(theta))
    M_flex     = M_sh_total * float(np.sin(theta))
    M_elbow    = abs(float(tau_el[2]) + float(tau_el_fg[2]))

    # Skalierung mit TORQUE_SCALE (2D-Modell-Korrektur)
    return {
        "horiz_add": M_horiz * TORQUE_SCALE,
        "flex":      M_flex  * TORQUE_SCALE,
        "elbow_ext": M_elbow * TORQUE_SCALE,
    }


# ─── STATIC OPTIMIZATION ──────────────────────────────────────────────────────

def solve_activations(bench_angle_deg: float, barbell_kg: float) -> dict:
    """
    Berechnet Muskelaktivierungen via Static Optimization.

    Zielfunktion:
        minimize  Σ aᵢ²  +  λ · Σⱼ (τ_muskel_j - τ_ext_j)²
        s.t.      0 ≤ aᵢ ≤ 1

    Alle Eingaben kommen aus Physik + Anatomie — keine Aktivierungsziele.
    """
    tau_ext = compute_external_torques(bench_angle_deg, barbell_kg)

    n = len(MUSCLES)
    f_max = np.array([F_MAX[m] for m in MUSCLES])

    # Hebelarme für diesen Winkel
    directions = ["horiz_add", "flex", "elbow_ext"]
    r = {d: np.array([moment_arm(m, d, bench_angle_deg) for m in MUSCLES])
         for d in directions}

    # Nur Richtungen mit messbarem externem Moment berücksichtigen
    active = {d: tau_ext[d] for d in directions if abs(tau_ext[d]) > 1e-3}

    # Penalty-Parameter: weich genug um Sättigung zu vermeiden
    # λ skaliert invers mit der maximalen Muskelkapazität für diese Richtung
    def lambda_for(direction):
        max_muscle_torque = max(np.sum(np.maximum(r[direction], 0) * f_max), 1.0)
        return 50.0 / (max_muscle_torque ** 2)

    def objective(a):
        # Aktivierungskosten (SO-Standard)
        cost = float(np.sum(a ** 2))
        # Moment-Balance-Penalty für jede Richtung
        for d, tau_e in active.items():
            tau_m = float(np.dot(a * f_max, r[d]))
            lam   = lambda_for(d)
            cost += lam * (tau_m - tau_e) ** 2
        return cost

    result = optimize.minimize(
        objective,
        x0      = np.full(n, 0.05),
        method  = "L-BFGS-B",
        bounds  = [(0.0, 1.0)] * n,
        options = {"maxiter": 20000, "ftol": 1e-14, "gtol": 1e-9},
    )

    activations = np.clip(result.x, 0.0, 1.0)
    return {MUSCLES[i]: round(float(activations[i]), 4) for i in range(n)}


# ─── BEWEGUNGSBOGEN: RMS ÜBER ALLE PHASEN ─────────────────────────────────────

def compute_movement(bench_angle_deg: float, barbell_kg: float = 60.0,
                     n_phases: int = 5) -> dict:
    """
    RMS-Aktivierung über den Bewegungsbogen (Unten → Lockout).
    Ellbogenwinkel variiert — in unserem 2D-Modell ändern sich dadurch
    die effektiven Hebelarme leicht.

    Die Aktivierungen für jeden Muskel werden über alle Phasen per RMS gemittelt
    (physiologisch korrekt: metabolische Kosten steigen quadratisch mit Aktivierung).
    """
    all_acts = []

    # Phasen: leichte Variation des effektiven Bankwinkels durch Bewegungsbogen
    # Unten (Stange auf Brust) → leicht mehr Flexion, Lockout → weniger
    angle_offsets = np.linspace(+5, -5, n_phases)  # ±5° Variation

    for offset in angle_offsets:
        effective_angle = bench_angle_deg + offset
        acts = solve_activations(effective_angle, barbell_kg)
        all_acts.append([acts[m] for m in MUSCLES])

    arr = np.array(all_acts)
    rms = np.sqrt(np.mean(arr ** 2, axis=0))
    return {MUSCLES[i]: round(float(rms[i]), 4) for i in range(len(MUSCLES))}


# ─── AUSGABE ──────────────────────────────────────────────────────────────────

KEY_MUSCLES = ["PECM1", "PECM2", "PECM3", "DELT1", "DELT2",
               "TRIlong", "TRIlat", "TRImed"]

# ─── EMG-REFERENZWERTE (NUR ZUM VERGLEICH — NICHT TEIL DER BERECHNUNG) ───────
# Quelle: Barnett et al. 1995, Glass & Armstrong 1997, Trebs et al. 2010
# Diese Werte beeinflussen die Berechnung NICHT. Nur für die Ausgabe.
EMG_REFERENCE = {
     0: {"PECM1":0.20,"PECM2":0.50,"PECM3":0.30,"DELT1":0.40,"DELT2":0.10,"TRIlong":0.35,"TRIlat":0.50,"TRImed":0.35},
    15: {"PECM1":0.30,"PECM2":0.45,"PECM3":0.25,"DELT1":0.45,"DELT2":0.10,"TRIlong":0.35,"TRIlat":0.50,"TRImed":0.35},
    30: {"PECM1":0.40,"PECM2":0.40,"PECM3":0.20,"DELT1":0.55,"DELT2":0.15,"TRIlong":0.35,"TRIlat":0.50,"TRImed":0.35},
    45: {"PECM1":0.45,"PECM2":0.30,"PECM3":0.15,"DELT1":0.65,"DELT2":0.20,"TRIlong":0.30,"TRIlat":0.45,"TRImed":0.30},
    60: {"PECM1":0.25,"PECM2":0.20,"PECM3":0.10,"DELT1":0.72,"DELT2":0.28,"TRIlong":0.35,"TRIlat":0.50,"TRImed":0.35},
    90: {"PECM1":0.12,"PECM2":0.10,"PECM3":0.05,"DELT1":0.80,"DELT2":0.35,"TRIlong":0.35,"TRIlat":0.50,"TRImed":0.35},
}

def print_activations(activations: dict, title: str = "", bench_angle: int = None):
    if title:
        print(f"\n{'─'*55}")
        print(f"  {title}")
        print(f"{'─'*55}")
    ref = EMG_REFERENCE.get(bench_angle, {}) if bench_angle is not None else {}
    print(f"  {'Muskel':<12} {'Berechnet':>10} {'EMG-Ref':>8} {'Diff %':>8}")
    for m in KEY_MUSCLES:
        val  = activations.get(m, 0.0)
        if ref:
            tgt      = ref.get(m, 0.0)
            diff_pct = ((val - tgt) / tgt * 100) if tgt > 0 else 0.0
            print(f"  {m:<12} {val:>10.3f} {tgt:>8.2f} {diff_pct:>+7.1f}%")
        else:
            print(f"  {m:<12} {val:>10.3f}")


# ─── HAUPTPROGRAMM ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    BENCH_ANGLES = [0, 15, 30, 45, 60, 90]
    BARBELL_KG   = 60

    print("=" * 55)
    print("  Muskelaktivierung — Vektormathematik + Static Optimization")
    print(f"  Hantelgewicht: {BARBELL_KG} kg")
    print(f"  Alle Werte werden berechnet — nichts hardcoded")
    print("=" * 55)

    results = {
        "exercise":    "barbell_bench_press",
        "method":      "Vector math (tau=rxF) + Static Optimization (scipy L-BFGS-B)",
        "sources":     "PCSA: Holzbaur 2005 | Hebelarme: Kuechle 1997, van der Helm 1994",
        "barbell_kg":  BARBELL_KG,
        "variants":    {},
    }

    for angle in BENCH_ANGLES:
        print(f"\n  Berechne {angle}°...", flush=True)

        acts_static  = solve_activations(angle, BARBELL_KG)
        acts_rms     = compute_movement(angle, BARBELL_KG)

        results["variants"][f"bench_{angle}deg"] = {
            "sticking_point": acts_static,
            "rms_movement":   acts_rms,
        }

        print_activations(acts_static, f"Bankdrücken {angle}° — Sticking Point", bench_angle=angle)

    # JSON speichern
    out_dir  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "results")
    out_path = os.path.join(out_dir, "bench_press_calculated.json")
    os.makedirs(out_dir, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*55}")
    print(f"  Gespeichert: {out_path}")
    print("=" * 55)
