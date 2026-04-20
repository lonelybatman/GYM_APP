"""
Erstellt exercise_kinematics.xlsx fuer OpenSim.
Eine Zeile pro einzigartiger Uebungs-Konfiguration.
Var-Detail = Discriminant-Wert aus dem exercise_variant DB-Schema
(plane, cable_height, bench_type, stand, body_pos, hands, cables_used).
"""

import pandas as pd
import numpy as np
import os
from collections import defaultdict

df = pd.read_excel('data/exercise1.xlsx', header=None)
raw = df.iloc[4:].copy().reset_index(drop=True)

# ── Spalten-Mapping ────────────────────────────────────────────────────────────
GRIP_COLS   = {9: 'sup', 10: 's-n', 11: 'n', 12: 'n-p', 13: 'pro'}
PLANE_COLS  = {14: 'lat', 15: 'l-s', 16: 'sag', 17: 's-t', 18: 'trans', 19: 't-l'}
GRIP_W_COLS = {20: 'x0.5', 21: 'x1', 22: 'x1.5'}
CABLE_COLS  = {23: '1-8', 24: '9-15', 25: '16-22'}
BENCH_COLS  = {26: 'flat', 27: 'incl', 28: 'upright'}
STAND_COLS  = {29: '0', 30: '45', 31: '90', 32: '90os', 33: '135', 34: '180'}
BC_COLS     = {35: '0', 36: '90', 37: '180'}
BB_COLS     = {38: '0', 39: '45', 40: '90', 41: '135', 42: '180', 43: 'lying'}
BPOS_COLS   = {44: '180', 45: 'sitting', 46: '0', 47: '90'}

def is_true(v):
    if v is True:
        return True
    if isinstance(v, str) and v.strip().upper() in ('TRUE', 'WAHR', 'WAHR*'):
        return True
    return False

def default_priority(val):
    if isinstance(val, str) and val.strip() == 'WAHR*':
        return 3
    if is_true(val):
        return 2
    return 0

def active_options(row, col_map):
    return [label for col, label in col_map.items() if is_true(row[col])]

def active_str(row, col_map):
    return '/'.join(active_options(row, col_map))

def hands_list(row):
    h = []
    if is_true(row[7]): h.append('1')
    if is_true(row[8]): h.append('2')
    return h

# ── Uebungsgruppen erkennen ────────────────────────────────────────────────────
starts = raw[raw[3].notna()].index.tolist()
starts.append(len(raw))

groups = []
for gi in range(len(starts) - 1):
    s = starts[gi]
    e = starts[gi + 1]
    first = raw.iloc[s]
    name_raw = str(first[3]).strip()
    if not name_raw:
        continue

    muscle_raw = ''
    for idx in range(s, e):
        v = raw.loc[idx, 2]
        if pd.notna(v) and str(v).strip():
            muscle_raw = str(v).strip()
            break

    group_rows = raw.iloc[s:e]

    # Bestes Default-Equipment der Gruppe (WAHR* > True > False)
    best_row = None
    best_prio = -1
    for _, row in group_rows.iterrows():
        p = default_priority(row[6])
        if p > best_prio:
            best_prio = p
            best_row = row
    if best_row is None:
        best_row = group_rows.iloc[0]

    equipment = str(best_row[5]).strip() if pd.notna(best_row[5]) else ''

    # Discriminant-relevante Parameter extrahieren
    plane       = active_options(best_row, PLANE_COLS)
    cable_h     = active_options(best_row, CABLE_COLS)
    bench_t     = active_options(best_row, BENCH_COLS)
    stand       = active_options(best_row, STAND_COLS)
    body_pos    = active_options(best_row, BPOS_COLS)
    hands       = hands_list(best_row)
    body_bench  = active_options(best_row, BB_COLS)
    bench_cable = active_options(best_row, BC_COLS)

    groups.append({
        'name_norm':    name_raw.lower().strip(),
        'muscle_norm':  muscle_raw.lower().strip().rstrip(),
        'name_raw':     name_raw,
        'muscle_raw':   muscle_raw,
        'equipment':    equipment,
        'best_prio':    best_prio,
        'hands':        hands,
        'grip_type':    active_options(best_row, GRIP_COLS),
        'grip_width':   active_options(best_row, GRIP_W_COLS),
        'plane':        plane,
        'cable_h':      cable_h,
        'bench_t':      bench_t,
        'stand':        stand,
        'body_pos':     body_pos,
        'body_bench':   body_bench,
        'bench_cable':  bench_cable,
    })

# ── Discriminant bestimmen ─────────────────────────────────────────────────────
# Innerhalb derselben (muscle, name)-Gruppe: welche Dimension variiert?
# Reihenfolge wie im DB-Schema: plane > cable_height > bench_type > stand > body_pos > hands
DISCRIMINANT_DIMS = [
    ('plane',      lambda g: tuple(g['plane'])),
    ('cable_h',    lambda g: tuple(g['cable_h'])),
    ('bench_t',    lambda g: tuple(g['bench_t'])),
    ('stand',      lambda g: tuple(g['stand'])),
    ('body_pos',   lambda g: tuple(g['body_pos'])),
    ('hands',      lambda g: tuple(g['hands'])),
]

# Gruppen nach (muscle, name) zusammenfassen
by_name = defaultdict(list)
for g in groups:
    by_name[(g['muscle_norm'], g['name_norm'])].append(g)

def discriminant_value(g, dim):
    """Gibt den Display-String fuer den Discriminant-Wert einer Gruppe."""
    val = g[dim]
    if not val:
        return None
    if dim == 'plane':
        return '/'.join(val)
    if dim == 'cable_h':
        return '/'.join(val)
    if dim == 'bench_t':
        return '/'.join(val)
    if dim == 'stand':
        return '/'.join(v + '°' for v in val)
    if dim == 'body_pos':
        return '/'.join(val)
    if dim == 'hands':
        return '/'.join(val) + ' Hand'
    return '/'.join(val)

# Fuer jede (muscle, name)-Gruppe den Discriminant bestimmen
# und Duplikate (gleiche Discriminant-Werte) zusammenfuehren
records = []
for (muscle_norm, name_norm), grp_list in by_name.items():
    if len(grp_list) == 1:
        # Keine Varianten → kein Discriminant
        g = grp_list[0]
        records.append({**g, 'discriminant': '', 'disc_val': ''})
        continue

    # Welche Dimension variiert?
    disc_dim = None
    for dim, key_fn in DISCRIMINANT_DIMS:
        vals = set(key_fn(g) for g in grp_list)
        if len(vals) > 1:
            disc_dim = dim
            break

    # Fuer jeden eindeutigen Discriminant-Wert die beste Gruppe waehlen
    seen = {}
    for g in grp_list:
        if disc_dim:
            dv = discriminant_value(g, disc_dim) or ''
        else:
            dv = ''
        if dv not in seen or g['best_prio'] > seen[dv]['best_prio']:
            seen[dv] = g

    for dv, g in seen.items():
        records.append({**g, 'discriminant': disc_dim or '', 'disc_val': dv})

# ── Sortierung ─────────────────────────────────────────────────────────────────
MUSCLE_ORDER = ['triceps', 'biceps', 'chest', 'shoulder', 'back', 'lat',
                'forearm', 'abs', 'glute', 'legs', 'core']

def sort_key(r):
    m = r['muscle_norm']
    try:
        mo = MUSCLE_ORDER.index(m)
    except ValueError:
        mo = 99
    return (mo, r['name_norm'], r['disc_val'])

records.sort(key=sort_key)

# ── Display-Namen bauen ────────────────────────────────────────────────────────
rows_out = []
for r in records:
    if r['disc_val']:
        display = f"{r['name_raw']} ({r['disc_val']})"
    else:
        display = r['name_raw']

    rows_out.append({
        'Uebung':            display,
        'Muskel':            r['muscle_raw'],
        'Equipment_default': r['equipment'],
        'Haende':            '/'.join(r['hands']),
        'Griff':             '/'.join(r['grip_type']),
        'Ebene':             '/'.join(r['plane']),
        'Griffweite':        '/'.join(r['grip_width']),
        'Kabel_Hoehe':       '/'.join(r['cable_h']),
        'Bank':              '/'.join(r['bench_t']),
        'Stand_deg':         '/'.join(r['stand']),
        'Bank_Kabel':        '/'.join(r['bench_cable']),
        'Koerper_Bank':      '/'.join(r['body_bench']),
        'Koerper_Pos':       '/'.join(r['body_pos']),
        'Discriminant_Dim':  r['discriminant'],
        # Kinematik (leer zum Ausfuellen)
        'primary_motion':       '',
        'shoulder_elv_start':   '',
        'shoulder_elv_end':     '',
        'shoulder_elv_fix':     '',
        'elbow_flex_start':     '',
        'elbow_flex_end':       '',
        'elbow_flex_fix':       '',
        'elv_angle_override':   '',
        'Notizen':              '',
    })

out = pd.DataFrame(rows_out)

# ── Excel speichern ────────────────────────────────────────────────────────────
os.makedirs(r'OpenSim\execution', exist_ok=True)
outpath = r'OpenSim\execution\exercise_kinematics.xlsx'

with pd.ExcelWriter(outpath, engine='openpyxl') as writer:
    out.to_excel(writer, index=False, sheet_name='Uebungen')
    ws = writer.sheets['Uebungen']
    ws.column_dimensions['A'].width = 40
    ws.column_dimensions['B'].width = 12
    ws.column_dimensions['C'].width = 20
    for col in 'DEFGHIJKLMN':
        ws.column_dimensions[col].width = 12
    ws.column_dimensions['O'].width = 16
    for col in ['P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']:
        ws.column_dimensions[col].width = 18

print(f"Saved: {outpath}")
print(f"Total rows: {len(out)}")
print()
for _, row in out[['Uebung', 'Muskel', 'Discriminant_Dim']].iterrows():
    disc = f"  [{row['Discriminant_Dim']}]" if row['Discriminant_Dim'] else ''
    print(f"  {row['Muskel']:12s} | {row['Uebung']}{disc}")
