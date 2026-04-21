"""
Befuellt exercise_kinematics.xlsx mit biomechanisch korrekten Werten.
primary_motion: "elbow" | "shoulder" | "combined" | "not_modeled"
  elbow    → Ellbogen bewegt sich, Schulter fix (shoulder_elv_fix)
  shoulder → Schulter bewegt sich, Ellbogen fix (elbow_flex_fix)
  combined → beide bewegen sich gleichzeitig
"""

import pandas as pd
import os

XLSX = r'C:\Users\kubis\Projekte\GYM_APP\biomechanics\execution\exercise_kinematics.xlsx'

# ── Kinematik-Definitionen ─────────────────────────────────────────────────────
# Key = normalisierter Uebungsname (lowercase, stripped)
# Fuer Uebungen mit Discriminant: key = "name|disc_val" (lowercase)
# Fallback: nur Name ohne Discriminant

KINEM = {
    # ── TRIZEPS ────────────────────────────────────────────────────────────────
    "pushdown":              {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 15,  "ef_s": 110, "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "pushdown (l-s)":        {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 15,  "ef_s": 110, "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "pushdown (lat)":        {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 15,  "ef_s": 110, "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "extension":             {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 20,  "ef_s": 100, "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "extension (l-s)":       {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 20,  "ef_s": 100, "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "extension (lat)":       {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 20,  "ef_s": 100, "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "extension (sag)":       {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 20,  "ef_s": 100, "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "overhead extension":    {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 165, "ef_s": 140, "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "overhead extension (l-s)":  {"pm": "elbow","sel_s": "",   "sel_e": "",   "sel_f": 165, "ef_s": 140, "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "overhead extension (lat)":  {"pm": "elbow","sel_s": "",   "sel_e": "",   "sel_f": 165, "ef_s": 140, "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "overhead extension (sag)":  {"pm": "elbow","sel_s": "",   "sel_e": "",   "sel_f": 165, "ef_s": 140, "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "skull crusher (sag)":   {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 90,  "ef_s": 140, "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "skull crusher (s-t)":   {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 60,  "ef_s": 140, "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},

    # ── BIZEPS ─────────────────────────────────────────────────────────────────
    "curl":                  {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 10,  "ef_s": 10,  "ef_e": 145, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "curl (0)":              {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 10,  "ef_s": 10,  "ef_e": 145, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "curl (sag)":            {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 10,  "ef_s": 10,  "ef_e": 145, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "bayesian curl":         {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 0,   "ef_s": 10,  "ef_e": 145, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "crossbody curl":        {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 10,  "ef_s": 10,  "ef_e": 145, "ef_f": "",  "elv": "45", "sr_s": "", "sr_e": "", "sr_f": ""},
    "concentration curl":    {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 40,  "ef_s": 10,  "ef_e": 145, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "spider curl":           {"pm": "elbow",    "sel_s": "",   "sel_e": "",   "sel_f": 90,  "ef_s": 10,  "ef_e": 145, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},

    # ── BRUST ─────────────────────────────────────────────────────────────────
    "fly":                   {"pm": "shoulder", "sel_s": 25,   "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "fly (s-t/trans)":       {"pm": "shoulder", "sel_s": 25,   "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "fly (t-l)":             {"pm": "shoulder", "sel_s": 25,   "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "fly (t-l/1-8)":         {"pm": "shoulder", "sel_s": 25,   "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "fly (t-l/16-22)":       {"pm": "shoulder", "sel_s": 25,   "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "fly (trans)":           {"pm": "shoulder", "sel_s": 25,   "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "fly (trans/t-l)":       {"pm": "shoulder", "sel_s": 25,   "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "press (sag/s-t/trans)": {"pm": "combined", "sel_s": 45,   "sel_e": 85,   "sel_f": "",  "ef_s": 90,  "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "press (trans)":         {"pm": "combined", "sel_s": 45,   "sel_e": 85,   "sel_f": "",  "ef_s": 90,  "ef_e": 5,   "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},

    # ── SCHULTER ──────────────────────────────────────────────────────────────
    "lateral raise":         {"pm": "shoulder", "sel_s": 0,    "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 10,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "lateral raise (1-8/9-15)": {"pm": "shoulder","sel_s": 0,  "sel_e": 80,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 10,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "front row":             {"pm": "combined", "sel_s": 0,    "sel_e": 80,   "sel_f": "",  "ef_s": 0,   "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "archer pull":           {"pm": "combined", "sel_s": 0,    "sel_e": 60,   "sel_f": "",  "ef_s": 0,   "ef_e": 120, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "archer pull (1-8)":     {"pm": "combined", "sel_s": 0,    "sel_e": 60,   "sel_f": "",  "ef_s": 0,   "ef_e": 120, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "archer pull (9-15)":    {"pm": "combined", "sel_s": 0,    "sel_e": 60,   "sel_f": "",  "ef_s": 0,   "ef_e": 120, "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "front raise":           {"pm": "shoulder", "sel_s": 0,    "sel_e": 90,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 10,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "front raise (1-8)":     {"pm": "shoulder", "sel_s": 0,    "sel_e": 90,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 10,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "press":                 {"pm": "combined", "sel_s": 90,   "sel_e": 160,  "sel_f": "",  "ef_s": 90,  "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "press (lat)":           {"pm": "combined", "sel_s": 90,   "sel_e": 160,  "sel_f": "",  "ef_s": 90,  "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "press (lat/l-s)":       {"pm": "combined", "sel_s": 90,   "sel_e": 160,  "sel_f": "",  "ef_s": 90,  "ef_e": 10,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "rear raise (t-l)":      {"pm": "shoulder", "sel_s": 30,   "sel_e": 90,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "rear raise (trans/t-l)":{"pm": "shoulder", "sel_s": 30,   "sel_e": 90,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "y raise":               {"pm": "shoulder", "sel_s": 0,    "sel_e": 120,  "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 10,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "rear pull":             {"pm": "combined", "sel_s": 90,   "sel_e": 30,   "sel_f": "",  "ef_s": 0,   "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "rear pull (trans)":     {"pm": "combined", "sel_s": 90,   "sel_e": 30,   "sel_f": "",  "ef_s": 0,   "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "rev fly":               {"pm": "shoulder", "sel_s": 30,   "sel_e": 90,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 20,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},

    # ── RÜCKEN ────────────────────────────────────────────────────────────────
    "face pull":             {"pm": "combined", "sel_s": 0,    "sel_e": 90,   "sel_f": "",  "ef_s": 0,   "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "face pull (t-l)":       {"pm": "combined", "sel_s": 0,    "sel_e": 90,   "sel_f": "",  "ef_s": 0,   "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "kelso shrugg":          {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "kenan flap":            {"pm": "shoulder", "sel_s": 30,   "sel_e": 90,   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": 90,  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "shrugg":                {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "shrugg (sitting)":      {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "row":                   {"pm": "combined", "sel_s": 30,   "sel_e": 80,   "sel_f": "",  "ef_s": 10,  "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "back row":              {"pm": "combined", "sel_s": 30,   "sel_e": 80,   "sel_f": "",  "ef_s": 10,  "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "deadlift":              {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "extension (back)":      {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},

    # ── LAT ───────────────────────────────────────────────────────────────────
    "pull":                  {"pm": "combined", "sel_s": 160,  "sel_e": 30,   "sel_f": "",  "ef_s": 10,  "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "pull (lat/sag)":        {"pm": "combined", "sel_s": 160,  "sel_e": 30,   "sel_f": "",  "ef_s": 10,  "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "pull (sup, s-n = sag)": {"pm": "combined", "sel_s": 160,  "sel_e": 30,   "sel_f": "",  "ef_s": 10,  "ef_e": 90,  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},

    # ── UNTERARM ──────────────────────────────────────────────────────────────
    "flexion":               {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "flexion (sag)":         {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "extension (forearm)":   {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "extension (sag) (forearm)": {"pm": "not_modeled","sel_s":"","sel_e":"",  "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},

    # ── SONSTIGE ──────────────────────────────────────────────────────────────
    "crunch":                {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "hyperextension":        {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "squat":                 {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "romanian deadlift":     {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
    "core":                  {"pm": "not_modeled", "sel_s": "","sel_e": "",   "sel_f": "",  "ef_s": "",  "ef_e": "",  "ef_f": "",  "elv": "",  "sr_s": "", "sr_e": "", "sr_f": ""},
}

# ── Excel laden und befuellen ──────────────────────────────────────────────────
df = pd.read_excel(XLSX, sheet_name='Uebungen')

COL_MAP = {
    'primary_motion':      'pm',
    'shoulder_elv_start':  'sel_s',
    'shoulder_elv_end':    'sel_e',
    'shoulder_elv_fix':    'sel_f',
    'elbow_flex_start':    'ef_s',
    'elbow_flex_end':      'ef_e',
    'elbow_flex_fix':      'ef_f',
    'elv_angle_override':  'elv',
    'shoulder_rot_start':  'sr_s',
    'shoulder_rot_end':    'sr_e',
    'shoulder_rot_fix':    'sr_f',
}

filled = 0
not_found = []

for i, row in df.iterrows():
    name = str(row['Uebung']).strip()
    key  = name.lower()

    # Muscle-Kontext fuer Unterarm-Unterscheidung
    muscle = str(row.get('Muskel', '')).strip().lower()

    # Unterarm-Extensions gesondert behandeln
    if muscle == 'forearm' and 'extension' in key:
        kd = KINEM.get('extension (forearm)')
    elif muscle == 'forearm' and 'flexion' in key:
        kd = KINEM.get('flexion')
    elif muscle == 'back' and key == 'extension':
        kd = KINEM.get('extension (back)')
    else:
        kd = KINEM.get(key)

    if kd is None:
        not_found.append(name)
        continue

    for col, kkey in COL_MAP.items():
        if col in df.columns:
            df.at[i, col] = kd[kkey]
    filled += 1

# Speichern
with pd.ExcelWriter(XLSX, engine='openpyxl') as writer:
    df.to_excel(writer, index=False, sheet_name='Uebungen')
    ws = writer.sheets['Uebungen']
    ws.column_dimensions['A'].width = 40
    ws.column_dimensions['B'].width = 12
    ws.column_dimensions['C'].width = 20
    for col in 'DEFGHIJKLMN':
        ws.column_dimensions[col].width = 12
    for col in ['O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']:
        ws.column_dimensions[col].width = 18

print(f"Befuellt: {filled} Zeilen")
if not_found:
    print(f"Nicht gefunden ({len(not_found)}):")
    for n in not_found:
        print(f"  - {n}")
