"""
sync_exercises.py
=================
Synct exercise1.xlsx gegen die Supabase DB.

Liest xlsx direkt (kein CSV-Export noetig).
Vergleicht details, is_default_setup, is_superdefault.
Updated was abweicht, inseriert Neues.
Setzt is_default_setup='false' fuer Equipment das in XLSX nicht mehr possible ist.

Run:
    cd data
    python sync_exercises.py --dry-run
    python sync_exercises.py
"""

import os, csv, json, uuid
from collections import defaultdict
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

CSV_PATH = "exercise1.csv"

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

# ── Variant-Detail Matching ───────────────────────────────────────────────────
# Exercises with multiple execution variants are distinguished by a "var-detail":
# the detail field whose value uniquely identifies which variant it is.
#
# lat_pull+cable / lat_row+cable groups: ALL exercises use cables_1 vs cables_2
#   (because "Lat pull" and "Lat pull2" both map to lat_pull+cable in COMBO_MAP)
#
# All other variant groups use the specific fields listed below.

VAR_DETAIL_FIELDS = {
    # bench + cable
    ('curl',               'biceps',   'bench', 'cable'):      ['bench_cable_0', 'bench_cable_180'],
    ('extension',          'triceps',  'bench', 'cable'):      ['plane_lat', 'plane_l_s', 'plane_sag'],
    ('fly',                'chest',    'bench', 'cable'):      ['cable_h_1_8', 'cable_h_9_15', 'cable_h_16_22'],
    ('overhead extension', 'triceps',  'bench', 'cable'):      ['plane_lat', 'plane_l_s', 'plane_sag'],
    # free + cable
    ('curl',               'biceps',   'free',  'cable'):      ['stand_0', 'stand_180'],
    ('extension',          'triceps',  'free',  'cable'):      ['plane_lat', 'plane_sag'],
    ('overhead extension', 'triceps',  'free',  'cable'):      ['plane_lat', 'plane_l_s', 'plane_sag'],
    # bench + freeweight
    ('press',              'chest',    'bench', 'freeweight'): ['bench_flat', 'bench_incl'],
    ('rear raise',         'shoulders','bench', 'freeweight'): ['body_pos_180', 'body_pos_sitting'],
    ('skull crusher',      'triceps',  'bench', 'freeweight'): ['plane_sag', 'plane_s_t'],
    # overhead extension bench+freeweight: compound key (hands + plane)
    ('overhead extension', 'triceps',  'bench', 'freeweight'): ['hands_1', 'hands_2',
                                                                  'plane_lat', 'plane_l_s', 'plane_sag'],
}


def get_var_detail_fields(key):
    """Return the var-detail field list for a given exercise key, or [] if no variants."""
    name, muscle, place, weight_type = key
    # lat_pull+cable and lat_row+cable: all exercises use cables_1/cables_2
    if place in ('lat_pull', 'lat_row') and weight_type == 'cable':
        return ['cables_1', 'cables_2']
    return VAR_DETAIL_FIELDS.get(key, [])


def variant_key_from_details(details_dict, var_fields):
    """Return frozenset of active var-detail fields (value in 'true'/'star')."""
    active = frozenset(
        f for f in var_fields
        if details_dict.get(f) in ('true', 'star', True)
    )
    return active


def variant_key_csv(xlsx_blk, var_fields):
    """Get variant key from a CSV block by scanning all equipment details."""
    combined = {}
    for eq in xlsx_blk['equipment']:
        for f in var_fields:
            if eq['details'].get(f) in ('true', 'star'):
                combined[f] = eq['details'][f]
    return frozenset(f for f in var_fields if combined.get(f) in ('true', 'star'))


def variant_key_db(db_ex_id, eq_by_exercise, var_fields):
    """Get variant key from a DB exercise by scanning all equipment details."""
    active = set()
    for eq in eq_by_exercise.get(db_ex_id, []):
        raw = eq.get('details')
        det = json.loads(raw) if isinstance(raw, str) else (raw or {})
        for f in var_fields:
            if normalize_db_detail(det.get(f)) in ('true', 'star'):
                active.add(f)
    return frozenset(active)


def clean(val):
    if val is None: return None
    s = str(val).strip()
    return s if s and s.lower() not in ("nan", "", "none") else None


def cell_val(v):
    """Convert xlsx cell value (Python bool, 'WAHR*', 'WAHR', 'FALSCH', etc.) to 'star'/'true'/'false'."""
    if v is True:  return 'true'
    if v is False: return 'false'
    s = clean(v)
    if s is None:  return 'false'
    if s == 'WAHR*': return 'star'
    if s.upper() in ('WAHR', 'TRUE'): return 'true'
    return 'false'


def is_available(v):
    return cell_val(v) in ('true', 'star')


def is_def_active(v):
    """True if is_default_setup means 'active' (not false/null).
    Handles DB string values ('false'/'true'/'star') and Python booleans."""
    return v not in ('false', False, None, '')



def normalize_db_detail(v):
    """Normalize DB detail value (bool or string) to 'star'/'true'/'false'."""
    if v is True:       return 'true'
    if v is False:      return 'false'
    if v == 'true':     return 'true'
    if v == 'star':     return 'star'
    return 'false'


# ── CSV Parsing ───────────────────────────────────────────────────────────────

def is_sub_header_csv(row):
    h = clean(row[7]) if len(row) > 7 else None
    i = clean(row[8]) if len(row) > 8 else None
    return h in ('1', '1.0') and i in ('2', '2.0')

def is_empty_row_csv(row):
    return all(clean(row[i]) in (None, 'FALSCH', 'FALSE', 'False') for i in range(min(52, len(row))))

def parse_csv(path):
    """
    Returns list of exercise blocks:
    {exercise_name, muscle, place, weight_type, is_superdefault, kombi,
     equipment: [{name, is_def_str, details}]}

    is_def_str: 'star' | 'true' | 'false'
      - 'star'  = column G was 'WAHR*'
      - 'true'  = column G was 'WAHR'
      - 'false' = column G was 'FALSCH' / empty
    """
    with open(path, encoding='utf-8-sig') as f:
        rows = list(csv.reader(f, delimiter=';'))

    blocks = []
    cur_block = None
    cur_kombi = None

    for i in range(4, len(rows)):
        row = rows[i] + [''] * (52 - len(rows[i]))

        if is_sub_header_csv(row) or is_empty_row_csv(row):
            continue

        c_kombi   = clean(row[0])
        c_super   = clean(row[1])
        c_muscle  = clean(row[2])
        c_name    = clean(row[3])
        c_poss    = clean(row[4])
        c_equip   = clean(row[5])
        c_default = clean(row[6])

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
                'kombi': cur_kombi,
                'equipment': [],
            }
            blocks.append(cur_block)

        if c_equip and cur_block and cur_block['place']:
            poss_upper = c_poss.strip().upper() if c_poss else ''
            if poss_upper not in ('WAHR', 'WAHR*'):
                continue

            details = {}
            for col_idx, field in DETAIL_COLS.items():
                details[field] = cell_val(row[col_idx]) if col_idx < len(row) else 'false'

            info = clean(row[48]) if len(row) > 48 else None
            if info:
                details['info_equipment'] = info

            is_def_str = cell_val(c_default)  # 'star', 'true', or 'false'

            cur_block['equipment'].append({
                'name': c_equip.strip(),
                'is_def_str': is_def_str,
                'details': details,
            })

    return blocks


# ── DB Load ───────────────────────────────────────────────────────────────────

def load_db(client):
    muscles = client.table('muscles').select('id, name_en').execute().data or []
    muscle_id_to_name = {m['id']: m['name_en'].strip().lower() for m in muscles}
    muscle_name_to_id = {m['name_en'].strip().lower(): m['id'] for m in muscles}

    exercises = (
        client.table('exercises')
        .select('id, exercise_name, place, weight_type, muscle_id, is_superdefault')
        .execute().data or []
    )

    equipment = (
        client.table('equipment')
        .select('id, exercise_id, equipment_name, is_default_setup, details')
        .execute().data or []
    )
    eq_by_exercise = defaultdict(list)
    for eq in equipment:
        eq_by_exercise[eq['exercise_id']].append(eq)

    return muscle_id_to_name, muscle_name_to_id, exercises, eq_by_exercise


# ── Comparison ────────────────────────────────────────────────────────────────

def details_diff(db_raw, xlsx_details):
    """Returns dict of fields that differ (only DETAIL_COLS fields, not info_equipment)."""
    db = json.loads(db_raw) if isinstance(db_raw, str) else (db_raw or {})
    diffs = {}
    for field in DETAIL_COLS.values():
        db_norm   = normalize_db_detail(db.get(field))
        xlsx_norm = xlsx_details.get(field, 'false')
        if db_norm != xlsx_norm:
            diffs[field] = {'db': db.get(field), 'xlsx': xlsx_norm}
    return diffs


# ── Main ──────────────────────────────────────────────────────────────────────

def main(dry_run=False):
    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Lade DB ...")
    muscle_id_to_name, muscle_name_to_id, exercises, eq_by_exercise = load_db(client)
    print(f"  {len(exercises)} exercises, {sum(len(v) for v in eq_by_exercise.values())} equipment rows")

    print(f"Lese {CSV_PATH} ...")
    xlsx_blocks = parse_csv(CSV_PATH)
    print(f"  {len(xlsx_blocks)} Bloecke gelesen")

    # ── Gruppen bilden ──
    db_groups = defaultdict(list)
    for ex in exercises:
        muscle_name = muscle_id_to_name.get(ex['muscle_id'], '')
        key = (
            ex['exercise_name'].strip().lower() if ex['exercise_name'] else '',
            muscle_name,
            ex['place'],
            ex['weight_type'],
        )
        db_groups[key].append(ex)

    xlsx_groups = defaultdict(list)
    for block in xlsx_blocks:
        if not block['exercise_name'] or not block['place']:
            continue
        key = (block['exercise_name'].lower(), block['muscle'], block['place'], block['weight_type'])
        xlsx_groups[key].append(block)

    # ── Vergleich ──
    eq_updates       = []   # {id, exercise_name, equipment_name, new_details?, new_is_default_setup?}
    eq_disable       = []   # {id, exercise_name, equipment_name} — removed from xlsx, set is_default_setup='false'
    eq_inserts       = []   # full equipment dicts (new rows)
    ex_updates       = []   # {id, is_superdefault}
    ex_inserts       = []   # full exercise dicts (new)
    db_only_exercises = []  # exercises in DB but not in xlsx

    all_keys = set(xlsx_groups.keys()) | set(db_groups.keys())

    for key in sorted(all_keys):
        xlsx_blks = xlsx_groups.get(key, [])
        db_exs    = db_groups.get(key, [])

        if not xlsx_blks:
            db_only_exercises.append(key)
            # Mark all their equipment as disabled
            for db_ex in db_exs:
                for eq in eq_by_exercise.get(db_ex['id'], []):
                    if is_def_active(eq.get('is_default_setup')):
                        eq_disable.append({
                            'id': eq['id'],
                            'exercise_name': db_ex['exercise_name'],
                            'equipment_name': eq['equipment_name'],
                        })
            continue

        if not db_exs:
            for blk in xlsx_blks:
                muscle_id = muscle_name_to_id.get(blk['muscle'])
                if not muscle_id:
                    print(f"  [SKIP] Muskel nicht gefunden: {blk['muscle']} fuer {key}")
                    continue
                kombi = blk.get('kombi', '')
                full_name = " > ".join(filter(None, [kombi, blk['muscle'], blk['exercise_name']]))
                ex_id = str(uuid.uuid4())
                ex_inserts.append({
                    'id': ex_id,
                    'full_name': full_name,
                    'exercise_kombi': kombi,
                    'target_muscle': blk['muscle'],
                    'exercise_name': blk['exercise_name'],
                    'muscle_id': muscle_id,
                    'place': blk['place'],
                    'weight_type': blk['weight_type'],
                    'is_superdefault': blk['is_superdefault'],
                })
                for eq in blk['equipment']:
                    eq_inserts.append({
                        'id': str(uuid.uuid4()),
                        'exercise_id': ex_id,
                        'equipment_name': eq['name'],
                        'possible': True,
                        'is_default_setup': eq['is_def_str'],
                        'details': eq['details'],
                    })
            continue

        var_fields = get_var_detail_fields(key)

        if var_fields:
            # Match by var-detail key
            csv_by_var = {variant_key_csv(blk, var_fields): blk for blk in xlsx_blks}
            db_by_var  = {variant_key_db(db_ex['id'], eq_by_exercise, var_fields): db_ex
                          for db_ex in db_exs}
            matched_pairs = [(db_ex, csv_by_var.get(vk)) for vk, db_ex in db_by_var.items()]
        else:
            # Fallback: sort by is_superdefault
            db_sorted   = sorted(db_exs,    key=lambda e: (not e['is_superdefault'], e['id']))
            xlsx_sorted = sorted(xlsx_blks, key=lambda b: (not b['is_superdefault']))
            if len(db_sorted) != len(xlsx_sorted):
                print(f"  [WARN] {key[0]}: {len(db_sorted)} DB vs {len(xlsx_sorted)} XLSX (count mismatch)")
            matched_pairs = list(zip(db_sorted, xlsx_sorted))

        for db_ex, xlsx_blk in matched_pairs:
            if xlsx_blk is None:
                continue

            # is_superdefault changed?
            if db_ex['is_superdefault'] != xlsx_blk['is_superdefault']:
                ex_updates.append({
                    'id': db_ex['id'],
                    'is_superdefault': xlsx_blk['is_superdefault'],
                    'name': db_ex['exercise_name'],
                })

            db_eq_rows  = eq_by_exercise.get(db_ex['id'], [])
            db_eq_map   = {e['equipment_name'].strip().lower(): e for e in db_eq_rows}
            xlsx_eq_map = {e['name'].strip().lower(): e for e in xlsx_blk['equipment']}

            # Equipment in XLSX: update or insert
            for eq_name_lower, xlsx_eq in xlsx_eq_map.items():
                db_eq = db_eq_map.get(eq_name_lower)
                if db_eq is None:
                    eq_inserts.append({
                        'id': str(uuid.uuid4()),
                        'exercise_id': db_ex['id'],
                        'equipment_name': xlsx_eq['name'],
                        'possible': True,
                        'is_default_setup': xlsx_eq['is_def_str'],
                        'details': xlsx_eq['details'],
                    })
                    continue

                diffs = details_diff(db_eq.get('details'), xlsx_eq['details'])

                # Compare is_default_setup: 'active' vs 'active', not string equality
                # to avoid spurious updates between 'star' and 'true' (functionally same)
                db_active   = is_def_active(db_eq.get('is_default_setup'))
                xlsx_active = is_def_active(xlsx_eq['is_def_str'])
                def_changed = db_active != xlsx_active

                if diffs or def_changed:
                    upd = {
                        'id': db_eq['id'],
                        'exercise_name': db_ex['exercise_name'],
                        'equipment_name': db_eq['equipment_name'],
                    }
                    if diffs:
                        upd['details_diffs'] = diffs
                        upd['new_details'] = xlsx_eq['details']
                    if def_changed:
                        upd['new_is_default_setup'] = xlsx_eq['is_def_str']
                    eq_updates.append(upd)

            # Equipment in DB but not in XLSX (was possible, no longer is)
            for eq_name_lower, db_eq in db_eq_map.items():
                if eq_name_lower not in xlsx_eq_map:
                    if is_def_active(db_eq.get('is_default_setup')):
                        eq_disable.append({
                            'id': db_eq['id'],
                            'exercise_name': db_ex['exercise_name'],
                            'equipment_name': db_eq['equipment_name'],
                        })

    # ── Report ──
    print(f"\n=== Zusammenfassung ===")
    print(f"  {len(eq_updates):4d}  equipment updates (details / is_default_setup)")
    print(f"  {len(eq_disable):4d}  equipment deaktiviert (nicht mehr possible in XLSX)")
    print(f"  {len(eq_inserts):4d}  neue equipment rows")
    print(f"  {len(ex_updates):4d}  exercise is_superdefault updates")
    print(f"  {len(ex_inserts):4d}  neue exercises")
    if db_only_exercises:
        print(f"  {len(db_only_exercises):4d}  exercises nur in DB (nicht mehr in XLSX):")
        for k in db_only_exercises[:5]:
            print(f"    {k[0]} | {k[1]} | {k[2]}+{k[3]}")

    if eq_updates:
        print(f"\nEquipment-Updates (erste 15):")
        for upd in eq_updates[:15]:
            print(f"  {upd['exercise_name']} / {upd['equipment_name']}")
            if 'details_diffs' in upd:
                for field, vals in list(upd['details_diffs'].items())[:3]:
                    print(f"    {field}: {vals['db']!r} -> {vals['xlsx']!r}")
            if 'new_is_default_setup' in upd:
                print(f"    is_default_setup: -> {upd['new_is_default_setup']!r}")

    if eq_disable:
        print(f"\nDeaktivierte equipment (erste 10):")
        for d in eq_disable[:10]:
            print(f"  {d['exercise_name']} / {d['equipment_name']}")

    if ex_inserts:
        print(f"\nNeue Exercises:")
        for ex in ex_inserts[:10]:
            print(f"  {ex['exercise_name']} | {ex['place']}+{ex['weight_type']} | superdefault={ex['is_superdefault']}")

    if dry_run:
        print("\nDry-run -- kein Update.")
        return

    # ── Anwenden ──
    print("\nWende Aenderungen an ...")

    # 1) Exercise updates (is_superdefault)
    ok = fail = 0
    for upd in ex_updates:
        res = client.table('exercises').update({'is_superdefault': upd['is_superdefault']}).eq('id', upd['id']).execute()
        if res.data: ok += 1
        else:
            fail += 1
            print(f"  FEHLER exercise: {upd['name']}")
    if ex_updates:
        print(f"  Exercise-Updates: {ok} OK, {fail} fehlgeschlagen")

    # 2) New exercises
    if ex_inserts:
        client.table('exercises').insert(ex_inserts).execute()
        print(f"  {len(ex_inserts)} neue exercises inserted")

    # 3) Equipment updates (details / is_default_setup)
    ok = fail = 0
    for upd in eq_updates:
        patch = {}
        if 'new_details' in upd:
            patch['details'] = upd['new_details']
        if 'new_is_default_setup' in upd:
            patch['is_default_setup'] = upd['new_is_default_setup']
        res = client.table('equipment').update(patch).eq('id', upd['id']).execute()
        if res.data: ok += 1
        else:
            fail += 1
            print(f"  FEHLER equipment: {upd['exercise_name']} / {upd['equipment_name']}")
    if eq_updates:
        print(f"  Equipment-Updates: {ok} OK, {fail} fehlgeschlagen")

    # 4) Disable equipment no longer in XLSX
    ok = fail = 0
    for d in eq_disable:
        res = (
            client.table('equipment')
            .update({'is_default_setup': 'false', 'possible': False})
            .eq('id', d['id'])
            .execute()
        )
        if res.data: ok += 1
        else:
            fail += 1
            print(f"  FEHLER disable: {d['exercise_name']} / {d['equipment_name']}")
    if eq_disable:
        print(f"  Equipment deaktiviert: {ok} OK, {fail} fehlgeschlagen")

    # 5) New equipment
    if eq_inserts:
        batch = []
        for eq in eq_inserts:
            e = dict(eq)
            e['details'] = json.dumps(e['details'], ensure_ascii=False)
            batch.append(e)
        BATCH = 500
        for k in range(0, len(batch), BATCH):
            client.table('equipment').insert(batch[k:k+BATCH]).execute()
        print(f"  {len(eq_inserts)} neue equipment rows inserted")

    print("\nFertig!")


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Nur pruefen, kein Update')
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: .env fehlt (SUPABASE_URL / SUPABASE_SERVICE_KEY)")
        raise SystemExit(1)

    main(dry_run=args.dry_run)
