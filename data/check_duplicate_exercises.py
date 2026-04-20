"""
check_duplicate_exercises.py
============================
Sucht alle Faelle wo mehrere DB-Exercises denselben
(exercise_name, muscle, place, weight_type) haben —
das sind potenzielle Opfer des fix_details_star-Mapping-Bugs.

Fuer jede Duplicate-Gruppe: vergleicht DB-details mit dem CSV.

Run:
    cd data
    python check_duplicate_exercises.py
"""

import os, csv, json, math
from collections import defaultdict
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

DETAIL_COLS = {
    7:'hands_1', 8:'hands_2',
    9:'grip_sup', 10:'grip_s_n', 11:'grip_n', 12:'grip_n_p', 13:'grip_pro',
    14:'plane_lat', 15:'plane_l_s', 16:'plane_sag', 17:'plane_s_t', 18:'plane_trans', 19:'plane_t_l',
    20:'width_x05', 21:'width_x1', 22:'width_x15',
    23:'cable_h_1_8', 24:'cable_h_9_15', 25:'cable_h_16_22',
    26:'bench_flat', 27:'bench_incl', 28:'bench_upright',
    29:'stand_0', 30:'stand_45', 31:'stand_90', 32:'stand_90os', 33:'stand_135', 34:'stand_180',
    35:'bench_cable_0', 36:'bench_cable_90', 37:'bench_cable_180',
    38:'body_bench_0', 39:'body_bench_45', 40:'body_bench_90', 41:'body_bench_135', 42:'body_bench_180',
    43:'body_pos_lying', 44:'body_pos_180', 45:'body_pos_sitting',
    46:'sit_0', 47:'sit_90',
    50:'cables_1', 51:'cables_2',
}

COMBO_MAP = {
    "free + cable":       ("free",     "cable"),
    "bench + freeweight": ("bench",    "freeweight"),
    "lat pull":           ("lat_pull", "cable"),
    "lat pull2":          ("lat_pull", "cable"),
    "lat row":            ("lat_row",  "cable"),
    "lat row 2":          ("lat_row",  "cable"),
    "cable + bench":      ("bench",    "cable"),
    "free + freeweight":  ("free",     "freeweight"),
    "free + smith":       ("free",     "smith"),
    "machine":            ("machine",  "machine"),
}

MUSCLE_ALIAS = {"abs": "core", "lat": "back", "shoulder": "shoulders"}

def clean(val):
    if val is None: return None
    s = str(val).strip()
    return s if s and s.lower() not in ("nan", "") else None

def cell_val(v):
    s = str(v).strip() if v else ''
    if s == 'WAHR*': return 'star'
    if s in ('WAHR',): return 'true'
    return 'false'

def is_sub_header(row):
    h = clean(row[7]) if len(row) > 7 else None
    i = clean(row[8]) if len(row) > 8 else None
    return h in ('1', '1.0') and i in ('2', '2.0')

def is_empty_row(row):
    return all(clean(row[i]) in (None, 'FALSCH', 'FALSE', 'False') for i in range(min(52, len(row))))

# ── CSV einlesen ──────────────────────────────────────────────────────────────

def parse_csv(path):
    """Gibt Liste von CSV-Bloecken zurueck: {exercise_name, muscle, place, weight_type, is_superdefault, equipment: [{name, details}]}"""
    with open(path, encoding='utf-8-sig') as f:
        rows = list(csv.reader(f, delimiter=';'))

    blocks = []
    cur_block = None
    cur_kombi = None

    for i in range(4, len(rows)):
        row = rows[i] + [''] * (52 - len(rows[i]))

        if is_sub_header(row) or is_empty_row(row):
            continue

        c_kombi  = clean(row[0])
        c_super  = clean(row[1])
        c_muscle = clean(row[2])
        c_name   = clean(row[3])
        c_poss   = clean(row[4])
        c_equip  = clean(row[5])

        if c_muscle and c_muscle.lower() not in ('target muscle',):
            if c_kombi:
                cur_kombi = c_kombi
            muscle_lower = c_muscle.strip().lower()
            muscle_lower = MUSCLE_ALIAS.get(muscle_lower, muscle_lower)
            place_wt = COMBO_MAP.get(cur_kombi.lower().strip()) if cur_kombi else None
            is_super = c_super is not None and c_super.strip().upper() in ('WAHR', 'WAHR*')
            cur_block = {
                'exercise_name': c_name.strip() if c_name else None,
                'muscle': muscle_lower,
                'place': place_wt[0] if place_wt else None,
                'weight_type': place_wt[1] if place_wt else None,
                'is_superdefault': is_super,
                'equipment': [],
            }
            blocks.append(cur_block)

        if c_equip and cur_block and cur_block['place']:
            # is_true fuer possible
            poss_upper = c_poss.strip().upper() if c_poss else ''
            possible = poss_upper in ('WAHR', 'WAHR*')
            if not possible:
                continue
            details = {}
            for col_idx, field in DETAIL_COLS.items():
                details[field] = cell_val(row[col_idx]) if col_idx < len(row) else 'false'
            info = clean(row[48]) if len(row) > 48 else None
            if info:
                details['info_equipment'] = info
            cur_block['equipment'].append({'name': c_equip.strip(), 'details': details})

    return blocks

# ── DB laden ──────────────────────────────────────────────────────────────────

def load_db(client):
    muscles = client.table('muscles').select('id, name_en').execute().data or []
    muscle_id_to_name = {m['id']: m['name_en'].strip().lower() for m in muscles}
    muscle_name_to_id = {m['name_en'].strip().lower(): m['id'] for m in muscles}

    exercises = client.table('exercises').select('id, exercise_name, place, weight_type, muscle_id, is_superdefault').execute().data or []

    equipment = client.table('equipment').select('id, exercise_id, equipment_name, is_default_setup, details').execute().data or []
    eq_by_exercise = defaultdict(list)
    for eq in equipment:
        eq_by_exercise[eq['exercise_id']].append(eq)

    return muscle_id_to_name, muscle_name_to_id, exercises, eq_by_exercise

# ── Duplikate finden ──────────────────────────────────────────────────────────

def find_duplicates(exercises, muscle_id_to_name):
    groups = defaultdict(list)
    for ex in exercises:
        muscle_name = muscle_id_to_name.get(ex['muscle_id'], '')
        key = (ex['exercise_name'].strip().lower(), muscle_name, ex['place'], ex['weight_type'])
        groups[key].append(ex)
    return {k: v for k, v in groups.items() if len(v) > 1}

# ── Details vergleichen ───────────────────────────────────────────────────────

def normalize_val(v):
    """Normalisiert DB-Wert zu 'true'/'false'/'star' fuer Vergleich."""
    if v is True or v == 'true' or v == 'star':
        return 'avail'  # available (star oder true)
    return 'false'

def details_match(db_details_raw, csv_details):
    """Prueft ob DB-details mit CSV uebereinstimmen (ignoriert star vs. true Unterschied)."""
    db = json.loads(db_details_raw) if isinstance(db_details_raw, str) else (db_details_raw or {})
    mismatches = {}
    for field, csv_val in csv_details.items():
        if field == 'info_equipment':
            continue
        db_val = db.get(field)
        db_norm = normalize_val(db_val)
        csv_norm = normalize_val(csv_val)
        if db_norm != csv_norm:
            mismatches[field] = {'db': db_val, 'csv': csv_val}
    return mismatches

# ── Main ──────────────────────────────────────────────────────────────────────

def main(client=None):
    if client is None:
        from supabase import create_client
        client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Lade DB ...")
    muscle_id_to_name, muscle_name_to_id, exercises, eq_by_exercise = load_db(client)
    print(f"  {len(exercises)} exercises, {sum(len(v) for v in eq_by_exercise.values())} equipment rows")

    print("Suche Duplikate ...")
    duplicates = find_duplicates(exercises, muscle_id_to_name)
    print(f"  {len(duplicates)} Gruppen mit mehreren DB-Eintraegen:\n")
    for key, exs in sorted(duplicates.items()):
        names = [(e['id'][:8], e['is_superdefault']) for e in exs]
        print(f"  {key[0]} | {key[1]} | {key[2]}+{key[3]}: {names}")

    print("\nLese CSV ...")
    csv_blocks = parse_csv('exercise1.csv')
    print(f"  {len(csv_blocks)} CSV-Bloecke")

    # CSV-Bloecke nach (name, muscle, place, weight_type) gruppieren
    csv_groups = defaultdict(list)
    for block in csv_blocks:
        if not block['exercise_name'] or not block['place']:
            continue
        key = (block['exercise_name'].lower(), block['muscle'], block['place'], block['weight_type'])
        csv_groups[key].append(block)

    print("\n=== Pruefe jede Duplikat-Gruppe ===\n")
    errors_found = []

    for key, db_exs in sorted(duplicates.items()):
        csv_blks = csv_groups.get(key, [])
        if not csv_blks:
            print(f"[SKIP] {key} — kein CSV-Block gefunden")
            continue

        # Sortiere DB-exercises nach is_superdefault (superdefault zuerst)
        db_exs_sorted = sorted(db_exs, key=lambda e: (not e['is_superdefault'], e['id']))

        # Sortiere CSV-Bloecke nach is_superdefault
        csv_blks_sorted = sorted(csv_blks, key=lambda b: (not b['is_superdefault']))

        if len(db_exs_sorted) != len(csv_blks_sorted):
            print(f"[WARN] {key}: {len(db_exs_sorted)} DB-Eintraege vs {len(csv_blks_sorted)} CSV-Bloecke")

        for i, db_ex in enumerate(db_exs_sorted):
            csv_blk = csv_blks_sorted[i] if i < len(csv_blks_sorted) else None
            eq_rows = eq_by_exercise.get(db_ex['id'], [])
            eq_rows_avail = [e for e in eq_rows if e.get('is_default_setup') != 'false']

            if not csv_blk:
                continue

            # Pruefe jedes Equipment
            for eq in eq_rows_avail:
                eq_name = eq['equipment_name'].strip().lower()
                csv_eq = next((e for e in csv_blk['equipment'] if e['name'].strip().lower() == eq_name), None)
                if not csv_eq:
                    continue
                mismatches = details_match(eq.get('details'), csv_eq['details'])
                if mismatches:
                    errors_found.append({
                        'exercise_id': db_ex['id'],
                        'exercise_name': db_ex['exercise_name'],
                        'is_superdefault': db_ex['is_superdefault'],
                        'equipment_id': eq['id'],
                        'equipment_name': eq['equipment_name'],
                        'mismatches': mismatches,
                        'correct_details': csv_eq['details'],
                    })

    if not errors_found:
        print("Keine Fehler gefunden!")
    else:
        print(f"{len(errors_found)} fehlerhafte Equipment-Zeilen:\n")
        for err in errors_found:
            print(f"  Exercise: {err['exercise_name']} [{err['exercise_id'][:8]}] superdefault={err['is_superdefault']}")
            print(f"  Equipment: {err['equipment_name']} [{err['equipment_id'][:8]}]")
            for field, vals in err['mismatches'].items():
                print(f"    {field}: DB={vals['db']!r}  CSV={vals['csv']!r}")
            print()

    print(f"\nFertig. {len(errors_found)} Fehler gefunden.")
    return errors_found

def apply_fixes(errors_found, client):
    print(f"\nWende {len(errors_found)} Korrekturen an ...")
    ok = 0
    fail = 0
    for err in errors_found:
        result = (
            client.table("equipment")
            .update({"details": err["correct_details"]})
            .eq("id", err["equipment_id"])
            .execute()
        )
        if result.data:
            ok += 1
        else:
            fail += 1
            print(f"  FEHLER bei {err['equipment_name']} [{err['equipment_id'][:8]}]")
    print(f"  {ok} erfolgreich, {fail} fehlgeschlagen.")


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--fix", action="store_true", help="Korrekturen direkt in die DB schreiben")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: .env fehlt")
        raise SystemExit(1)

    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    errors = main(client)

    if args.fix:
        if not errors:
            print("Nichts zu korrigieren.")
        else:
            apply_fixes(errors, client)
    else:
        if errors:
            print("\nMit --fix ausfuehren um alle Fehler zu beheben.")
