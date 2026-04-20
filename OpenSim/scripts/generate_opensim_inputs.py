"""
generate_opensim_inputs.py
===========================
Liest die Übungs-Excel (exercise1.xlsx) und generiert pro Zeile zwei OpenSim-Inputdateien:

  1. {name}.mot   — Kinematik-Zeitreihe (Gelenkwinkel)
  2. {name}_ext_loads.xml  — External Loads Definition
  3. {name}_forces.sto     — Kraft-Zeitreihe (Betrag + Richtung + Angriffspunkt)

Physikalisches Modell:
  - Kabelzug:   Kraftvektor = normalize(Umlenkrolle − Hand) × Gewichtskraft
  - Hantel/Frei: Kraftvektor = [0, −1, 0] × Gewichtskraft (Gravitation)
  - Bewegungsebene: Schulterwinkel werden trigonometrisch gemischt
    (0° Sagittal → cos=1/sin=0 ; 90° Frontal → cos=0/sin=1)
  - Nichts wird hardcoded — alle Werte entstehen aus den Excel-Parametern.

Ausführen (opensim-env Conda-Umgebung NICHT nötig — reines Python):
  python generate_opensim_inputs.py [--excel PFAD] [--out ORDNER] [--only-defaults]
"""

import argparse
import os
import re
import numpy as np
import pandas as pd
from pathlib import Path

# ─── PFADE ────────────────────────────────────────────────────────────────────
EXCEL_DEFAULT = r"C:\Users\kubis\gym-app\data\exercise1.xlsx"
OUTPUT_DEFAULT = r"C:\Users\kubis\gym-app\OpenSim\generated_inputs"

# ─── SPALTENINDIZES (aus Row-2-Sub-Header der Excel-Datei) ────────────────────
# Hände
C_HANDS_1   = 7    # 1 Hand
C_HANDS_2   = 8    # 2 Hände

# Griffart (Grip Type)
C_GRIP_SUP  = 9    # Supination
C_GRIP_SN   = 10   # Semi-Supination / Neutral
C_GRIP_N    = 11   # Neutral
C_GRIP_NP   = 12   # Neutral-Pronation
C_GRIP_PRO  = 13   # Pronation

# Bewegungsebene (Plane)
C_PLANE_LAT   = 14   # Lateral / Frontal
C_PLANE_LS    = 15   # Lateral-Sagittal (≈45°)
C_PLANE_SAG   = 16   # Sagittal
C_PLANE_ST    = 17   # Sagittal-Transversal
C_PLANE_TRANS = 18   # Transversal
C_PLANE_TL    = 19   # Transversal-Lateral

# Griffbreite (Grip Width)
C_GW_NARROW = 20   # × 0.5 (eng)
C_GW_NORMAL = 21   # × 1.0 (mittel)
C_GW_WIDE   = 22   # × 1.5 (weit)

# Kabelhöhe (Cable Height — nummerische Position am Gerät)
C_CABLE_LOW  = 23   # 1–8    → Bodennahe Umlenkrolle
C_CABLE_MID  = 24   # 9–15   → Mittlere Umlenkrolle
C_CABLE_HIGH = 25   # 16–22  → Hohe Umlenkrolle

# Bankwinkel (Bench Angle)
C_BENCH_FLAT    = 26
C_BENCH_INCL    = 27
C_BENCH_UPRIGHT = 28

# Stand-Winkel (Körper ↔ Kabelmaschine, in Grad)
C_STAND_0    = 29   # 0°   Körper zur Maschine gewandt
C_STAND_45   = 30   # 45°
C_STAND_90   = 31   # 90°
C_STAND_90OS = 32   # 90° Overhoulder-Stance
C_STAND_135  = 33   # 135°
C_STAND_180  = 34   # 180° Rücken zur Maschine

# Kabel ↔ Bank Winkel
C_BC_0   = 35
C_BC_90  = 36
C_BC_180 = 37

# Körper ↔ Bank Winkel
C_BODY_BENCH_0   = 38
C_BODY_BENCH_45  = 39
C_BODY_BENCH_90  = 40
C_BODY_BENCH_135 = 41
C_BODY_BENCH_180 = 42

# Körperposition (Body Position)
C_POS_LYING   = 43   # liegend
C_POS_PRONE   = 44   # Bauchlage (180°)
C_POS_SITTING = 45   # sitzend
C_SIT_0       = 46   # sitzend 0° (aufrecht)
C_SIT_90      = 47   # sitzend 90°

# Kabel-Anzahl
C_CABLES_1 = 50
C_CABLES_2 = 51

# ─── KOMBI-KÜRZEL ────────────────────────────────────────────────────────────
KOMBI_ABBR = {
    "free + cable":        "FC",
    "bench + freeweight":  "BF",
    "cable + bench":       "CB",
    "lat pull":            "LP",
    "lat pull2":           "LP2",
    "lat row":             "LR",
    "lat row 2":           "LR2",
    "free + freeweight":   "FF",
}

def kombi_abbreviation(kombi: str) -> str:
    key = kombi.strip().lower()
    for k, v in KOMBI_ABBR.items():
        if k in key:
            return v
    # Fallback: Großbuchstaben der Wörter
    return "".join(w[0].upper() for w in kombi.split() if w)

# Metadaten-Spalten
C_KOMBI     = 0
C_SUPERDEF  = 1
C_MUSCLE    = 2
C_NAME      = 3
C_POSSIBLE  = 4
C_EQUIPMENT = 5
C_DEFAULT   = 6
C_INFO_EQ   = 48
C_INFO_EX   = 49


# ─── ANTHROPOMETRISCHE KONSTANTEN ─────────────────────────────────────────────
# Standard-Segmentlängen (m) für näherungsweise Hand-Position
UPPER_ARM_LEN  = 0.33   # Oberarm (Schulter → Ellbogen)
FOREARM_LEN    = 0.27   # Unterarm (Ellbogen → Handgelenk)
HAND_LEN       = 0.08   # Hand (Handgelenk → Kraftangriff)

# Schulterposition im Weltframe bei verschiedenen Körperpositionen
SHOULDER_POS_R = {
    "stand":   np.array([ 0.20, 1.42,  0.0]),
    "sit":     np.array([ 0.20, 0.95,  0.0]),
    "lying":   np.array([ 0.20, 0.50,  0.0]),
    "incline": np.array([ 0.20, 1.10,  0.0]),
}
SHOULDER_POS_L = {k: v * np.array([-1, 1, 1]) for k, v in SHOULDER_POS_R.items()}


# ─── UMLENKROLLEN-POSITIONEN (Weltframe, Meter) ───────────────────────────────
# Position der Kabel-Umlenkrolle abhängig von der Höheneinstellung.
# Maschine steht in +z-Richtung vom Modell entfernt (frontal).
# x = 0 (mittig), z = Abstand zur Maschine
PULLEY_POSITIONS = {
    "low":  np.array([0.0,  0.10,  1.20]),   # Bodennahe Rolle
    "mid":  np.array([0.0,  1.10,  1.20]),   # Mittlere Rolle
    "high": np.array([0.0,  2.30,  1.20]),   # Hohe Rolle / Overhead
}
# Numerische Kabelhöhe (1–22) → low/mid/high
def cable_height_category(col_idx):
    if col_idx == C_CABLE_LOW:  return "low"
    if col_idx == C_CABLE_MID:  return "mid"
    if col_idx == C_CABLE_HIGH: return "high"
    return "mid"


# ─── GRIFFART → PRO_SUP + SHOULDER_ROT ───────────────────────────────────────
# Werte in Grad; keine Aktivierungswerte — nur anatomische Startposition
GRIP_COORDS = {
    "sup":  {"pro_sup":  80.0, "shoulder_rot":  15.0},
    "s-n":  {"pro_sup":  40.0, "shoulder_rot":   0.0},
    "n":    {"pro_sup":   0.0, "shoulder_rot":   0.0},
    "n-p":  {"pro_sup": -40.0, "shoulder_rot": -10.0},
    "pro":  {"pro_sup": -80.0, "shoulder_rot": -20.0},
}

# Griffart-Spalten sortiert nach Rotation (für Default-Wahl)
GRIP_COL_TO_KEY = {
    C_GRIP_SUP: "sup",
    C_GRIP_SN:  "s-n",
    C_GRIP_N:   "n",
    C_GRIP_NP:  "n-p",
    C_GRIP_PRO: "pro",
}

# ─── GRIFFBREITE → ELV_ANGLE ──────────────────────────────────────────────────
# Griffbreite bestimmt die Elevationsebene (0° = Sagittal, 90° = Frontal)
GRIP_WIDTH_ELV_ANGLE = {
    C_GW_NARROW: 10.0,
    C_GW_NORMAL: 35.0,
    C_GW_WIDE:   70.0,
}

# ─── BEWEGUNGSEBENE → EBENEN-WINKEL (Grad) ───────────────────────────────────
# 0° = sagittal, 90° = frontal
# Schulterwinkel werden als Projektion auf die Ebene berechnet:
#   shoulder_elv = ROM × cos(plane_rad)
#   elv_angle    = ROM × sin(plane_rad)
PLANE_COL_TO_DEG = {
    C_PLANE_LAT:   90.0,   # Frontalebene
    C_PLANE_LS:    67.5,   # Lateral-Sagittal (~67.5°)
    C_PLANE_SAG:    0.0,   # Sagittalebene
    C_PLANE_ST:    22.5,   # Sagittal-Transversal (~22.5°)
    C_PLANE_TRANS: 180.0,  # Transversalebene
    C_PLANE_TL:   112.5,   # Transversal-Lateral
}

# ─── STAND-WINKEL → OFFSET FÜR ELV_ANGLE ─────────────────────────────────────
# Richtet das Modell relativ zur Kabelmaschine aus.
# Bei 180° steht der Rücken zur Maschine → Kabel zieht nach hinten.
STAND_COL_TO_DEG = {
    C_STAND_0:    0.0,
    C_STAND_45:  45.0,
    C_STAND_90:  90.0,
    C_STAND_90OS: 90.0,
    C_STAND_135: 135.0,
    C_STAND_180: 180.0,
}

# ─── KÖRPERPOSITION → GELENK-STARTWERTE (Grad / Meter) ───────────────────────
BODY_POSITION_COORDS = {
    "stand": {
        "pelvis_ty":      0.95,   # in Metern (kein Grad)
        "hip_flexion_r":  0.0,
        "hip_flexion_l":  0.0,
        "knee_angle_r":   0.0,
        "knee_angle_l":   0.0,
        "lumbar_extension": 0.0,
    },
    "sit": {
        "pelvis_ty":      0.50,
        "hip_flexion_r":  90.0,
        "hip_flexion_l":  90.0,
        "knee_angle_r":   90.0,
        "knee_angle_l":   90.0,
        "lumbar_extension": 0.0,
    },
    "lying": {
        "pelvis_ty":      0.10,
        "hip_flexion_r":  0.0,
        "hip_flexion_l":  0.0,
        "knee_angle_r":   0.0,
        "knee_angle_l":   0.0,
        "lumbar_extension": 5.0,
    },
    "incline": {
        "pelvis_ty":      0.60,
        "hip_flexion_r": 30.0,
        "hip_flexion_l": 30.0,
        "knee_angle_r":   90.0,
        "knee_angle_l":   90.0,
        "lumbar_extension": 0.0,
    },
}


# ─── ÜBUNGSNAME → KINEMATIK-DEFINITION ───────────────────────────────────────
# Jede Übung hat:
#   "primary"       : Welches Gelenk ist Hauptbeweger ("elbow" / "shoulder")
#   "rom"           : [Start, Ende] in Grad
#   "default_plane" : Standardebene falls Excel keine angibt
#   "elbow_start"   : Ellbogen-Startwinkel (für Schulterübungen)
#   "elbow_end"     : Ellbogen-Endwinkel   (für Schulterübungen)
#   "shoulder_fixed": Fixer shoulder_elv-Wert (für Ellbogenübungen)
#   "elv_fixed"     : Fixer elv_angle-Wert

EXERCISE_KINEMATICS = {
    # ── Trizeps ──────────────────────────────────────────────────────────────
    "pushdown": {
        "primary": "elbow", "rom": [110, 5],
        "default_plane": 0.0, "shoulder_fixed": 15.0, "elv_fixed": 0.0,
    },
    "extension": {
        "primary": "elbow", "rom": [110, 5],
        "default_plane": 0.0, "shoulder_fixed": 20.0, "elv_fixed": 0.0,
    },
    "overhead extension": {
        "primary": "elbow", "rom": [90, 5],
        "default_plane": 0.0, "shoulder_fixed": 170.0, "elv_fixed": 0.0,
    },
    "kickback": {
        "primary": "elbow", "rom": [90, 0],
        "default_plane": 0.0, "shoulder_fixed": 80.0, "elv_fixed": 0.0,
    },
    # ── Bizeps ───────────────────────────────────────────────────────────────
    "curl": {
        "primary": "elbow", "rom": [10, 145],
        "default_plane": 0.0, "shoulder_fixed": 10.0, "elv_fixed": 0.0,
    },
    "hammer curl": {
        "primary": "elbow", "rom": [10, 145],
        "default_plane": 0.0, "shoulder_fixed": 10.0, "elv_fixed": 0.0,
    },
    "preacher curl": {
        "primary": "elbow", "rom": [30, 130],
        "default_plane": 0.0, "shoulder_fixed": 55.0, "elv_fixed": 0.0,
    },
    "incline curl": {
        "primary": "elbow", "rom": [10, 140],
        "default_plane": 0.0, "shoulder_fixed": -20.0, "elv_fixed": 0.0,
    },
    # ── Schulter / Drücken ────────────────────────────────────────────────────
    "press": {
        "primary": "shoulder", "rom": [80, 20],
        "default_plane": 35.0, "elbow_start": 90.0, "elbow_end": 15.0,
    },
    "shoulder press": {
        "primary": "shoulder", "rom": [90, 20],
        "default_plane": 35.0, "elbow_start": 90.0, "elbow_end": 15.0,
    },
    "bench press": {
        "primary": "shoulder", "rom": [90, 30],
        "default_plane": 35.0, "elbow_start": 90.0, "elbow_end": 10.0,
    },
    "fly": {
        "primary": "shoulder", "rom": [80, 25],
        "default_plane": 35.0, "elbow_start": 30.0, "elbow_end": 30.0,
    },
    "cable fly": {
        "primary": "shoulder", "rom": [90, 20],
        "default_plane": 35.0, "elbow_start": 30.0, "elbow_end": 30.0,
    },
    # ── Lateralerhebungen ─────────────────────────────────────────────────────
    "lateral raise": {
        "primary": "shoulder", "rom": [0, 90],
        "default_plane": 90.0, "elbow_start": 10.0, "elbow_end": 10.0,
    },
    "front raise": {
        "primary": "shoulder", "rom": [0, 90],
        "default_plane": 0.0, "elbow_start": 10.0, "elbow_end": 10.0,
    },
    "diagonal raise": {
        "primary": "shoulder", "rom": [0, 90],
        "default_plane": 45.0, "elbow_start": 10.0, "elbow_end": 10.0,
    },
    # ── Lat / Rücken ─────────────────────────────────────────────────────────
    "pulldown": {
        "primary": "shoulder", "rom": [20, 80],
        "default_plane": 0.0, "elbow_start": 20.0, "elbow_end": 90.0,
    },
    "lat pulldown": {
        "primary": "shoulder", "rom": [20, 80],
        "default_plane": 0.0, "elbow_start": 20.0, "elbow_end": 90.0,
    },
    "row": {
        "primary": "shoulder", "rom": [30, 80],
        "default_plane": 0.0, "elbow_start": 30.0, "elbow_end": 100.0,
    },
    "cable row": {
        "primary": "shoulder", "rom": [30, 80],
        "default_plane": 0.0, "elbow_start": 30.0, "elbow_end": 100.0,
    },
    "pullthrough": {
        "primary": "shoulder", "rom": [80, 20],
        "default_plane": 0.0, "elbow_start": 20.0, "elbow_end": 20.0,
    },
    "face pull": {
        "primary": "shoulder", "rom": [30, 80],
        "default_plane": 0.0, "elbow_start": 45.0, "elbow_end": 100.0,
    },
    # ── Fallback ─────────────────────────────────────────────────────────────
    "_default_elbow": {
        "primary": "elbow", "rom": [10, 120],
        "default_plane": 0.0, "shoulder_fixed": 20.0, "elv_fixed": 0.0,
    },
    "_default_shoulder": {
        "primary": "shoulder", "rom": [20, 80],
        "default_plane": 35.0, "elbow_start": 60.0, "elbow_end": 60.0,
    },
}


# ─── HILFSFUNKTIONEN ──────────────────────────────────────────────────────────

def is_true(val) -> bool:
    """Behandelt Excel-True, 'WAHR', 'True', True als wahr."""
    if val is True:
        return True
    if isinstance(val, str) and val.strip().lower() in ("wahr", "true", "wahr*"):
        return True
    return False


def safe_str(val) -> str:
    if val is None or (isinstance(val, float) and np.isnan(val)):
        return ""
    return str(val).strip()


def slugify(name: str) -> str:
    """Konvertiert Exercise-Namen in sicheren Dateinamen."""
    name = name.lower().strip()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[\s]+", "_", name)
    return name


def first_true_col(row, cols: list):
    """Gibt den ersten Spalten-Index zurück, in dem row[col] == True ist."""
    for c in cols:
        if is_true(row[c]):
            return c
    return None


def active_cols(row, cols: list) -> list:
    """Gibt alle Spalten zurück, in denen row[col] == True ist."""
    return [c for c in cols if is_true(row[c])]


def estimate_hand_position(shoulder_elv_deg: float, elv_angle_deg: float,
                            elbow_flex_deg: float, body_pos: str,
                            side: str = "r") -> np.ndarray:
    """
    Näherungsweise Hand-Position im Weltframe (Meter).

    OpenSim Koordinaten-Konvention (MoBL-ARMS):
      shoulder_elv  = Elevation vom vertikalen (0° = Arm hängt, 90° = Arm horizontal)
      elv_angle     = Elevationsebene (0° = sagittal, 90° = frontal)
      elbow_flexion = Ellbogenbeugung (0° = gestreckt)

    Vereinfachung: Pennationswinkel und Handgelenkswinkel = 0.
    """
    beta = np.radians(shoulder_elv_deg)   # Elevation
    alpha = np.radians(elv_angle_deg)     # Ebenenwinkel

    # Arm-Richtungsvektor (Schulter → Ellbogen)
    # Im OpenSim-Weltframe: Y = oben, X = rechts, Z = vorne
    arm_dir = np.array([
        np.sin(beta) * np.sin(alpha),   # X (laterale Komponente)
        -np.cos(beta),                  # Y (vertikal, nach unten wenn Arm oben)
        np.sin(beta) * np.cos(alpha),   # Z (anterior/posterior)
    ])
    # Vorzeichen für linken/rechten Arm
    if side == "l":
        arm_dir[0] *= -1

    # Unterarm-Richtung: gebogen um elbow_flex_deg aus Oberarmachse
    gamma = np.radians(elbow_flex_deg)
    # Vereinfachung: Unterarm kippt in der Sagittalebene nach vorne
    forearm_offset = np.array([0.0, np.sin(gamma), -np.cos(gamma)]) * FOREARM_LEN

    shoulder_key = body_pos if body_pos in SHOULDER_POS_R else "stand"
    if side == "r":
        shoulder = SHOULDER_POS_R[shoulder_key].copy()
    else:
        shoulder = SHOULDER_POS_L[shoulder_key].copy()

    hand_pos = (shoulder
                + arm_dir * UPPER_ARM_LEN
                + forearm_offset
                + arm_dir * HAND_LEN)
    return hand_pos


def compute_cable_force_direction(hand_pos: np.ndarray,
                                  pulley_pos: np.ndarray,
                                  stand_deg: float) -> np.ndarray:
    """
    Berechnet die normalisierte Kraftrichtung des Kabels.

    Der Stand-Winkel rotiert das Modell relativ zur Maschine um die Y-Achse.
    Bei 0°: Körper zur Maschine → Kabel zieht in +z-Richtung.
    Bei 180°: Rücken zur Maschine → Kabel zieht in -z-Richtung.

    Rotation der Umlenkrolle in das Modell-Frame:
      rotated_pulley = Ry(stand_deg) × pulley_pos
    """
    theta = np.radians(stand_deg)
    cos_t, sin_t = np.cos(theta), np.sin(theta)
    # Rotation um Y-Achse
    Ry = np.array([
        [ cos_t, 0, sin_t],
        [     0, 1,     0],
        [-sin_t, 0, cos_t],
    ])
    rotated_pulley = Ry @ pulley_pos

    direction = rotated_pulley - hand_pos
    norm = np.linalg.norm(direction)
    if norm < 1e-6:
        return np.array([0.0, 1.0, 0.0])
    return direction / norm


# ─── KINEMATIK-GENERATOR ──────────────────────────────────────────────────────

def generate_kinematics(kinem_def: dict, plane_deg: float, elv_angle_base: float,
                         grip_coords: dict, body_coords: dict,
                         n_frames: int = 50, duration: float = 2.0,
                         one_handed: bool = False) -> pd.DataFrame:
    """
    Erzeugt eine Zeitreihe von Gelenkwinkeln als DataFrame.

    elv_angle = plane_deg + elv_angle_base (konstant in der .mot — in OpenSim anpassbar).
    shoulder_elv läuft die volle ROM — keine trigonometrische Zerlegung.

    Rückgabe: DataFrame mit Spalte 'time' und allen Koordinaten.
    """
    t = np.linspace(0.0, duration, n_frames)
    progress = np.linspace(0.0, 1.0, n_frames)

    rom_start = kinem_def["rom"][0]
    rom_end   = kinem_def["rom"][1]
    rom_val   = rom_start + progress * (rom_end - rom_start)

    data = {"time": t}

    if kinem_def["primary"] == "elbow":
        # ── Ellbogen-Hauptbeweger ──────────────────────────────────────────
        # elv_angle = plane_deg (konstant) — in OpenSim manuell anpassbar
        # plane_deg definiert die Ebene (0=sagittal, 90=frontal)
        # elv_angle_base kommt aus Griffweite — beide sind unabhängig, nicht addierbar
        # Du passt elv_angle_val manuell in OpenSim an
        elv_angle_val = plane_deg if plane_deg is not None else elv_angle_base

        data["elbow_flexion_r"] = rom_val
        data["elbow_flexion_l"] = rom_val
        data["shoulder_elv_r"]  = np.full(n_frames, kinem_def.get("shoulder_fixed", 20.0))
        data["shoulder_elv_l"]  = np.full(n_frames, kinem_def.get("shoulder_fixed", 20.0))
        data["elv_angle_r"]     = np.full(n_frames, elv_angle_val)
        data["elv_angle_l"]     = np.full(n_frames, elv_angle_val)

    else:
        # ── Schulter-Hauptbeweger ──────────────────────────────────────────
        # elv_angle = plane_deg (konstant, definiert die Ebene)
        # shoulder_elv läuft die volle ROM — in OpenSim manuell anpassbar
        # plane_deg definiert die Ebene (0=sagittal, 90=frontal)
        # elv_angle_base kommt aus Griffweite — beide sind unabhängig, nicht addierbar
        # Du passt elv_angle_val manuell in OpenSim an
        elv_angle_val = plane_deg if plane_deg is not None else elv_angle_base

        elbow_start = kinem_def.get("elbow_start", 60.0)
        elbow_end   = kinem_def.get("elbow_end",   60.0)
        elbow_flex  = elbow_start + progress * (elbow_end - elbow_start)

        data["shoulder_elv_r"]  = rom_val
        data["shoulder_elv_l"]  = rom_val
        data["elv_angle_r"]     = np.full(n_frames, elv_angle_val)
        data["elv_angle_l"]     = np.full(n_frames, elv_angle_val)
        data["elbow_flexion_r"] = elbow_flex
        data["elbow_flexion_l"] = elbow_flex

    # Gemeinsame Koordinaten aus Griffart
    data["shoulder_rot_r"] = np.full(n_frames, grip_coords.get("shoulder_rot", 0.0))
    data["shoulder_rot_l"] = np.full(n_frames, grip_coords.get("shoulder_rot", 0.0))
    data["pro_sup_r"]      = np.full(n_frames, grip_coords.get("pro_sup", 0.0))
    data["pro_sup_l"]      = np.full(n_frames, grip_coords.get("pro_sup", 0.0))

    # 1-händige Übung: rechter Arm bleibt in Neutralstellung
    if one_handed:
        data["shoulder_elv_r"]  = np.zeros(n_frames)
        data["elv_angle_r"]     = np.zeros(n_frames)
        data["elbow_flexion_r"] = np.zeros(n_frames)
        data["shoulder_rot_r"]  = np.zeros(n_frames)
        data["pro_sup_r"]       = np.zeros(n_frames)

    # Körperposition-Koordinaten (Becken, Hüfte, Knie)
    for coord, val in body_coords.items():
        if coord != "pelvis_ty":
            data[coord] = np.full(n_frames, float(val))

    return pd.DataFrame(data)


# ─── KRAFT-ZEITREIHE ──────────────────────────────────────────────────────────

def generate_forces(kinematics_df: pd.DataFrame, equipment: str,
                    cable_height: str, stand_deg: float,
                    body_pos: str, force_n: float,
                    sides: list = None,
                    kombi: str = "") -> pd.DataFrame:
    """
    Erzeugt die Kraft-Zeitreihe als DataFrame.

    Für Kabelzug: Kraftvektor = normalize(Umlenkrolle − Hand) × force_n
    Für Freihantel: Kraftvektor = [0, −1, 0] × force_n (Gravitation)

    Das .sto-Format erwartet pro External Force:
      {name}_force_vx, {name}_force_vy, {name}_force_vz  — Kraftvektor (N)
      {name}_force_px, {name}_force_py, {name}_force_pz  — Angriffspunkt (m)
      {name}_torque_x, {name}_torque_y, {name}_torque_z  — Drehmoment (Nm)
    """
    if sides is None:
        sides = ["r"]

    n = len(kinematics_df)
    data = {"time": kinematics_df["time"].values}

    # Kabel-Erkennung: kombi-Feld hat Vorrang (enthält "cable"), sonst Equipment-Name
    cable_kws = ["cable", "kabel", "lat pull", "lat row", "free + cable", "cable + bench"]
    equip_kws = ["d-handle", "rope", "noose", "pulley", "lat bar", "straight bar",
                 "staight", "ez", "handle", "attach"]
    is_cable = (any(kw in kombi.lower() for kw in cable_kws)
                or any(kw in equipment.lower() for kw in equip_kws))

    pulley = PULLEY_POSITIONS.get(cable_height, PULLEY_POSITIONS["mid"])

    for side in sides:
        name = f"hand_{side}"

        fx_vals = np.zeros(n)
        fy_vals = np.zeros(n)
        fz_vals = np.zeros(n)
        px_vals = np.zeros(n)
        py_vals = np.zeros(n)
        pz_vals = np.zeros(n)

        for i in range(n):
            row = kinematics_df.iloc[i]
            shoulder_elv = float(row.get(f"shoulder_elv_{side}", 20.0))
            elv_angle    = float(row.get(f"elv_angle_{side}", 0.0))
            elbow_flex   = float(row.get(f"elbow_flexion_{side}", 30.0))

            hand_pos = estimate_hand_position(
                shoulder_elv, elv_angle, elbow_flex, body_pos, side
            )

            if is_cable:
                force_dir = compute_cable_force_direction(hand_pos, pulley, stand_deg)
            else:
                # Freihantel: Gravitation nach unten
                force_dir = np.array([0.0, -1.0, 0.0])

            force_vec = force_dir * force_n

            fx_vals[i] = force_vec[0]
            fy_vals[i] = force_vec[1]
            fz_vals[i] = force_vec[2]
            px_vals[i] = hand_pos[0]
            py_vals[i] = hand_pos[1]
            pz_vals[i] = hand_pos[2]

        data[f"{name}_force_vx"] = fx_vals
        data[f"{name}_force_vy"] = fy_vals
        data[f"{name}_force_vz"] = fz_vals
        data[f"{name}_force_px"] = px_vals
        data[f"{name}_force_py"] = py_vals
        data[f"{name}_force_pz"] = pz_vals
        data[f"{name}_torque_x"] = np.zeros(n)
        data[f"{name}_torque_y"] = np.zeros(n)
        data[f"{name}_torque_z"] = np.zeros(n)

    return pd.DataFrame(data)


# ─── DATEI-SCHREIBER ─────────────────────────────────────────────────────────

def write_mot(df: pd.DataFrame, filepath: str, label: str = "Coordinates"):
    """
    Schreibt eine OpenSim .mot-Datei mit korrektem Header.
    """
    n_rows = len(df)
    n_cols = len(df.columns)

    lines = []
    lines.append(label)
    lines.append("version=1")
    lines.append(f"nRows={n_rows}")
    lines.append(f"nColumns={n_cols}")
    lines.append("inDegrees=yes")
    lines.append("endheader")
    lines.append("\t".join(df.columns))

    for _, row in df.iterrows():
        vals = []
        for col in df.columns:
            v = row[col]
            vals.append(f"{v:.6f}")
        lines.append("\t".join(vals))

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def write_sto(df: pd.DataFrame, filepath: str, label: str = "Forces"):
    """
    Schreibt eine OpenSim .sto-Datei (gleiches Format wie .mot).
    """
    write_mot(df, filepath, label=label)


def write_external_loads_xml(xml_path: str, sto_filename: str, mot_filename: str,
                              sides: list):
    """
    Schreibt die OpenSim ExternalLoads .xml-Datei.

    Für jede Seite wird ein ExternalForce-Objekt erstellt, das:
      - an 'hand_{side}' angreift
      - Kraft und Punkt im Weltframe (ground) ausgedrückt
      - auf die Force- und Point-Identifier im .sto-File verweist
    """
    ext_forces_xml = []
    for side in sides:
        name = f"hand_{side}"
        ext_forces_xml.append(f"""        <ExternalForce name="{name}_force">
            <isDisabled>false</isDisabled>
            <applied_to_body>{name}</applied_to_body>
            <force_expressed_in_body>ground</force_expressed_in_body>
            <point_expressed_in_body>ground</point_expressed_in_body>
            <force_identifier>{name}_force_v</force_identifier>
            <point_identifier>{name}_force_p</point_identifier>
            <torque_identifier>{name}_torque_</torque_identifier>
        </ExternalForce>""")

    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<OpenSimDocument Version="40000">
    <ExternalLoads name="external_loads">
        <objects>
{chr(10).join(ext_forces_xml)}
        </objects>
        <groups />
        <datafile>{sto_filename}</datafile>
        <external_loads_model_kinematics_file>{mot_filename}</external_loads_model_kinematics_file>
        <lowpass_cutoff_frequency_for_load_kinematics>-1</lowpass_cutoff_frequency_for_load_kinematics>
    </ExternalLoads>
</OpenSimDocument>
"""
    with open(xml_path, "w", encoding="utf-8") as f:
        f.write(xml_content)


# ─── EXCEL PARSER ─────────────────────────────────────────────────────────────

def parse_excel(excel_path: str, only_defaults: bool = False) -> list[dict]:
    """
    Liest die Exercise-Excel und gibt eine Liste von Übungs-Dicts zurück.
    Jedes Dict enthält alle für die Generierung nötigen Parameter.
    """
    df = pd.read_excel(excel_path, header=None)

    # Propagiere 'exercise kombi' und 'exercise name' nach unten (merged cells)
    df[C_KOMBI] = df[C_KOMBI].ffill()
    df[C_NAME]  = df[C_NAME].ffill()
    df[C_MUSCLE] = df[C_MUSCLE].ffill()

    exercises = []

    for idx, row in df.iloc[3:].iterrows():
        possible = is_true(row[C_POSSIBLE])
        default  = is_true(row[C_DEFAULT])

        if only_defaults and not default:
            continue
        if not possible and not default:
            continue
        superdefault = is_true(row[C_SUPERDEF])
        if only_defaults and not superdefault and not default:
            continue

        name      = safe_str(row[C_NAME])
        muscle    = safe_str(row[C_MUSCLE])
        equipment = safe_str(row[C_EQUIPMENT])
        kombi     = safe_str(row[C_KOMBI])
        info_eq   = safe_str(row[C_INFO_EQ])
        info_ex   = safe_str(row[C_INFO_EX])

        if not name or not equipment:
            continue

        # ── Hände ──────────────────────────────────────────────────────────
        # 2 Hände: beide Arme bewegen sich
        # 1 Hand:  nur linke Hand aktiv, rechte bleibt in Neutralstellung
        hands_active = active_cols(row, [C_HANDS_1, C_HANDS_2])
        if C_HANDS_2 in hands_active:
            sides = ["r", "l"]
            one_handed = False
        else:
            sides = ["l"]
            one_handed = True

        # ── Griffart ───────────────────────────────────────────────────────
        grip_col = first_true_col(row, [C_GRIP_SUP, C_GRIP_SN, C_GRIP_N, C_GRIP_NP, C_GRIP_PRO])
        if grip_col is not None:
            grip_key    = GRIP_COL_TO_KEY[grip_col]
            grip_coords = GRIP_COORDS[grip_key]
        else:
            grip_coords = GRIP_COORDS["n"]   # Neutral als Standard
            grip_key    = "n"

        # ── Griffbreite → elv_angle Basis ─────────────────────────────────
        gw_col = first_true_col(row, [C_GW_NARROW, C_GW_NORMAL, C_GW_WIDE])
        elv_angle_base = GRIP_WIDTH_ELV_ANGLE.get(gw_col, 35.0)

        # ── Bewegungsebene ─────────────────────────────────────────────────
        plane_col = first_true_col(row, [C_PLANE_LAT, C_PLANE_LS, C_PLANE_SAG,
                                         C_PLANE_ST, C_PLANE_TRANS, C_PLANE_TL])
        plane_deg = PLANE_COL_TO_DEG.get(plane_col)  # None wenn nicht gesetzt

        # ── Kabelhöhe ──────────────────────────────────────────────────────
        cable_col = first_true_col(row, [C_CABLE_LOW, C_CABLE_MID, C_CABLE_HIGH])
        cable_height = cable_height_category(cable_col) if cable_col else "mid"

        # ── Stand-Winkel (Körper ↔ Maschine) ──────────────────────────────
        stand_col = first_true_col(row, [C_STAND_0, C_STAND_45, C_STAND_90,
                                          C_STAND_90OS, C_STAND_135, C_STAND_180])
        stand_deg = STAND_COL_TO_DEG.get(stand_col, 0.0)

        # ── Körperposition ─────────────────────────────────────────────────
        if is_true(row[C_POS_LYING]) or is_true(row[C_POS_PRONE]):
            body_pos = "lying"
        elif is_true(row[C_POS_SITTING]) or is_true(row[C_SIT_0]) or is_true(row[C_SIT_90]):
            body_pos = "sit"
        elif is_true(row[C_BENCH_INCL]):
            body_pos = "incline"
        else:
            body_pos = "stand"

        body_coords = BODY_POSITION_COORDS.get(body_pos, BODY_POSITION_COORDS["stand"])

        # ── Kabel-Anzahl ───────────────────────────────────────────────────
        cables_used_raw = row[C_CABLES_1]
        try:
            cables_used = int(float(cables_used_raw)) if not (
                isinstance(cables_used_raw, float) and np.isnan(cables_used_raw)
            ) else 1
        except (ValueError, TypeError):
            cables_used = 1

        superdefault = is_true(row[C_SUPERDEF])

        exercises.append({
            "row_idx":      idx + 1,   # Excel-Zeilennummer (1-basiert)
            "one_handed":   one_handed,
            "kombi":        kombi,
            "name":         name,
            "muscle":       muscle,
            "equipment":    equipment,
            "superdefault": superdefault,
            "default":      default,
            "sides":        sides,
            "grip_key":     grip_key,
            "grip_coords":  grip_coords,
            "elv_angle_base": elv_angle_base,
            "plane_deg":    plane_deg,
            "cable_height": cable_height,
            "stand_deg":    stand_deg,
            "body_pos":     body_pos,
            "body_coords":  body_coords,
            "cables_used":  cables_used,
            "info_eq":      info_eq,
            "info_ex":      info_ex,
        })

    return exercises


# ─── KINEMATIK-DEFINITION AUFLÖSEN ───────────────────────────────────────────

def resolve_kinematics(exercise_name: str, plane_deg_override) -> tuple[dict, float]:
    """
    Sucht die passende Kinematik-Definition für den Exercise-Namen.
    Gibt (kinem_def, plane_deg) zurück.
    """
    name_lower = exercise_name.lower().strip()

    # Exakter Match
    if name_lower in EXERCISE_KINEMATICS:
        kinem = EXERCISE_KINEMATICS[name_lower]
    else:
        # Partieller Match: suche Schlüsselwörter
        kinem = None
        for key, val in EXERCISE_KINEMATICS.items():
            if key.startswith("_"):
                continue
            if key in name_lower or name_lower in key:
                kinem = val
                break
        if kinem is None:
            # Heuristik: Ellbogen-Übung wenn "curl", "extension", "push" im Namen
            elbow_kws = ("curl", "extension", "push", "kick", "dip")
            if any(kw in name_lower for kw in elbow_kws):
                kinem = EXERCISE_KINEMATICS["_default_elbow"]
            else:
                kinem = EXERCISE_KINEMATICS["_default_shoulder"]

    # Bewegungsebene: Excel-Wert hat Vorrang; sonst Default aus Übungs-Def
    if plane_deg_override is not None:
        plane_deg = float(plane_deg_override)
    else:
        plane_deg = kinem.get("default_plane", 35.0)

    return kinem, plane_deg


# ─── HAUPTGENERATOR ───────────────────────────────────────────────────────────

def generate_for_exercise(ex: dict, output_dir: str,
                           n_frames: int = 50, duration: float = 2.0,
                           force_n: float = 200.0):
    """
    Generiert .mot, .sto und .xml für eine Übungs-Konfiguration.

    force_n: Externe Kraft in Newton (Standardwert 200 N ≈ ~20 kg am Kabel).
             In einer echten Pipeline kommt dieser Wert aus der Übungstabelle.
    """
    name_slug   = slugify(ex["name"])
    eq_slug     = slugify(ex["equipment"])
    muscle_slug = slugify(ex["muscle"]) if ex["muscle"] else "unknown"
    kombi_abbr  = kombi_abbreviation(ex["kombi"]) if ex["kombi"] else "XX"
    row_id      = ex["row_idx"]

    # Ausgabe-Unterordner: {KombiKürzel}_{Muscle}_{Übung}_{Equipment}_{ExcelZeile}
    subdir = os.path.join(output_dir, f"{kombi_abbr}_{muscle_slug}_{name_slug}_{eq_slug}_{row_id}")
    os.makedirs(subdir, exist_ok=True)

    mot_filename = f"{name_slug}.mot"
    sto_filename = f"{name_slug}_forces.sto"
    xml_filename = f"{name_slug}_ext_loads.xml"

    mot_path = os.path.join(subdir, mot_filename)
    sto_path = os.path.join(subdir, sto_filename)
    xml_path = os.path.join(subdir, xml_filename)

    # Kinematik-Definition auflösen
    kinem, plane_deg = resolve_kinematics(ex["name"], ex["plane_deg"])

    # Kinematik generieren
    kin_df = generate_kinematics(
        kinem_def    = kinem,
        plane_deg    = plane_deg,
        elv_angle_base = ex["elv_angle_base"],
        grip_coords  = ex["grip_coords"],
        body_coords  = ex["body_coords"],
        n_frames     = n_frames,
        duration     = duration,
        one_handed   = ex["one_handed"],
    )

    # Kraft-Zeitreihe generieren
    force_df = generate_forces(
        kinematics_df = kin_df,
        equipment     = ex["equipment"],
        cable_height  = ex["cable_height"],
        stand_deg     = ex["stand_deg"],
        body_pos      = ex["body_pos"],
        force_n       = force_n,
        sides         = ex["sides"],
        kombi         = ex["kombi"],
    )

    # Dateien schreiben
    write_mot(kin_df, mot_path)
    write_sto(force_df, sto_path)
    write_external_loads_xml(xml_path, sto_filename, mot_filename, ex["sides"])

    return mot_path, sto_path, xml_path


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generiert OpenSim .mot und External Loads .xml aus Exercise-Excel."
    )
    parser.add_argument("--excel",         default=EXCEL_DEFAULT,
                        help="Pfad zur Exercise Excel-Datei")
    parser.add_argument("--out",           default=OUTPUT_DEFAULT,
                        help="Ausgabe-Ordner")
    parser.add_argument("--only-defaults", action="store_true",
                        help="Nur Zeilen mit default=True generieren")
    parser.add_argument("--frames",        type=int, default=50,
                        help="Anzahl der Zeitschritte pro Datei (Standard: 50)")
    parser.add_argument("--duration",      type=float, default=2.0,
                        help="Bewegungsdauer in Sekunden (Standard: 2.0)")
    parser.add_argument("--force",         type=float, default=200.0,
                        help="Externe Kraft in Newton (Standard: 200 N)")
    parser.add_argument("--filter-name",   default=None,
                        help="Nur Übungen mit diesem Namen (Substring-Match)")
    args = parser.parse_args()

    print(f"Lese Excel: {args.excel}")
    exercises = parse_excel(args.excel, only_defaults=args.only_defaults)

    if args.filter_name:
        exercises = [e for e in exercises
                     if args.filter_name.lower() in e["name"].lower()]

    # Superdefaults zuerst, dann restliche Defaults
    exercises.sort(key=lambda e: (0 if e["superdefault"] else 1))

    print(f"Gefundene Konfigurationen: {len(exercises)} "
          f"({sum(e['superdefault'] for e in exercises)} Superdefault, "
          f"{sum(not e['superdefault'] for e in exercises)} Default)")
    os.makedirs(args.out, exist_ok=True)

    ok, err = 0, 0
    for ex in exercises:
        try:
            mot, sto, xml = generate_for_exercise(
                ex          = ex,
                output_dir  = args.out,
                n_frames    = args.frames,
                duration    = args.duration,
                force_n     = args.force,
            )
            status = "***" if ex["superdefault"] else ("DEF" if ex["default"] else "   ")
            plane_str = f"{ex['plane_deg']:5.1f}" if ex['plane_deg'] is not None else "  ---"
            print(f"  [{status}] {ex['name']:30s} | {ex['equipment']:20s} | "
                  f"Ebene={plane_str}° Kabel={ex['cable_height']:4s} "
                  f"Stand={ex['stand_deg']:5.1f}°")
            ok += 1
        except Exception as e:
            print(f"  [ERR] Row {ex['row_idx']}: {ex['name']} / {ex['equipment']}: {e}")
            err += 1

    print(f"\nFertig: {ok} generiert, {err} Fehler.")
    print(f"Ausgabe: {args.out}")


if __name__ == "__main__":
    main()
