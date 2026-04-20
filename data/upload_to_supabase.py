#!/usr/bin/env python3
"""
upload_to_supabase.py
---------------------
Reads exercise1.csv and exercise builder perspektiven.csv,
uploads all data directly to Supabase via REST API.

Run with:
  C:\\Users\\kubis\\anaconda3\\python.exe data\\upload_to_supabase.py

You will be asked for your service_role key once.
Find it in: Supabase Dashboard → Settings → API → service_role (secret)
"""

import requests
import csv
import json
import os

# ── Config ──────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://hrsdbcqjuphblgqymvfo.supabase.co"
FILES_DIR    = r"C:\Users\kubis\app\claude code\files"
EXERCISE1    = os.path.join(FILES_DIR, "exercise1.csv")
PERSPEKTIVEN = os.path.join(FILES_DIR, "exercise builder perspektiven.csv")

# Combo label → canonical label (normalized to consistent casing)
COMBO_NORMALIZE = {
    "free + cable":       "Free + Cable",
    "bench + cable":      "Bench + Cable",
    "cable + bench":      "Bench + Cable",
    "bench + freeweight": "Bench + Freeweight",
    "lat pull":           "Lat Pull",
    "lat pull2":          "Lat Pull2",
    "lat row":            "Lat Row",
    "lat row 2":          "Lat Row 2",
    "machine":            "Machine",
    "free + freeweight":  "Free + Freeweight",
    "free + smith":       "Free + Smith",
}

# Combo label → (place, weight_type)
COMBO_MAP = {
    "Free + Cable":       ("free",     "cable"),
    "Bench + Cable":      ("bench",    "cable"),
    "Bench + Freeweight": ("bench",    "freeweight"),
    "Lat Pull":           ("lat_pull", "cable"),
    "Lat Pull2":          ("lat_pull", "cable"),
    "Lat Row":            ("lat_row",  "cable"),
    "Lat Row 2":          ("lat_row",  "cable"),
    "Machine":            ("machine",  "machine"),
    "Free + Freeweight":  ("free",     "freeweight"),
    "Free + Smith":       ("free",     "smith"),
}

def normalize_combo(label):
    return COMBO_NORMALIZE.get(label.strip().lower(), label.strip())

CONFIG_COLS = [
    (6,  "hand_1"),           (7,  "hand_2"),
    (8,  "grip_sup"),         (9,  "grip_sn"),          (10, "grip_n"),
    (11, "grip_np"),          (12, "grip_pro"),
    (13, "plane_lat"),        (14, "plane_ls"),
    (15, "plane_sag"),        (16, "plane_st"),          (17, "plane_trans"),  (18, "plane_tl"),
    (19, "grip_width_05"),    (20, "grip_width_1"),      (21, "grip_width_15"),
    (22, "cable_height_1_8"), (23, "cable_height_9_15"), (24, "cable_height_16_22"),
    (25, "bench_flat"),       (26, "bench_incl"),        (27, "bench_upright"),
    (28, "stand_0"),          (29, "stand_45"),          (30, "stand_90"),
    (31, "stand_90os"),       (32, "stand_135"),         (33, "stand_180"),
    (34, "bench_cable_0"),    (35, "bench_cable_90"),    (36, "bench_cable_180"),
    (37, "body_bench_0"),     (38, "body_bench_45"),     (39, "body_bench_90"),
    (40, "body_bench_135"),   (41, "body_bench_180"),
    (42, "body_pos_lying"),   (43, "body_pos_180"),      (44, "body_pos_sitting"),
    (45, "sit_0"),            (46, "sit_90"),
]

# ── Helpers ──────────────────────────────────────────────────────────────────

def parse_val(s):
    v = s.strip().upper()
    if v == "WAHR*":
        return True, True
    if v in ("WAHR", "TRUE", "1"):
        return True, False
    return False, False

# ── REST API ─────────────────────────────────────────────────────────────────

KEY = None

def headers(extra=None):
    h = {
        "apikey": KEY,
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
    }
    if extra:
        h.update(extra)
    return h

def api_delete_all(table):
    resp = requests.delete(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=headers({"Prefer": "return=minimal"}),
        params={"id": "not.is.null"},
    )
    if not resp.ok:
        print(f"  WARNING delete {table}: {resp.status_code} {resp.text[:200]}")
    return resp.ok

def api_insert(table, rows, batch=200):
    total = len(rows)
    for i in range(0, total, batch):
        chunk = rows[i:i+batch]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=headers({"Prefer": "return=representation"}),
            json=chunk,
        )
        if not resp.ok:
            print(f"  ERROR insert {table}: {resp.status_code} {resp.text[:300]}")
            return None
        print(f"  {table}: {min(i+batch, total)}/{total}", end="\r")
    print(f"  {table}: {total}/{total} ✓")
    return True

def api_upsert(table, rows, on_conflict, batch=200):
    total = len(rows)
    for i in range(0, total, batch):
        chunk = rows[i:i+batch]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=headers({
                "Prefer": f"return=representation,resolution=merge-duplicates",
                "x-upsert": on_conflict,
            }),
            json=chunk,
        )
        if not resp.ok:
            print(f"  ERROR upsert {table}: {resp.status_code} {resp.text[:300]}")
            return None
        print(f"  {table}: {min(i+batch, total)}/{total}", end="\r")
    print(f"  {table}: {total}/{total} ✓")
    return True

def api_get(table, select="*", filters=None):
    params = {"select": select}
    if filters:
        params.update(filters)
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=headers(),
        params=params,
    )
    if not resp.ok:
        print(f"  ERROR get {table}: {resp.status_code} {resp.text[:200]}")
        return []
    return resp.json()

def api_sql(sql):
    """Execute raw SQL via Supabase's pg/query endpoint (service_role only)."""
    resp = requests.post(
        f"{SUPABASE_URL}/pg/query",
        headers=headers({"Content-Type": "application/json"}),
        json={"query": sql},
    )
    return resp.ok

# ── Parse exercise1.csv ──────────────────────────────────────────────────────

def parse_exercise1():
    combos   = {}
    ex_dict  = {}   # ex_key -> exercise dict (allows updating is_superdefault)
    eq_opts  = []

    cur_combo        = None
    cur_superdefault = False
    cur_muscle       = None
    cur_ex           = None

    with open(EXERCISE1, encoding="utf-8-sig") as f:
        rows = list(csv.reader(f, delimiter=";"))

    for row in rows[4:]:
        row = row + [""] * (49 - len(row))

        if row[0].strip(): cur_combo        = normalize_combo(row[0])
        if row[1].strip(): cur_superdefault, _ = parse_val(row[1])
        if row[2].strip(): cur_muscle       = row[2].strip()
        if row[3].strip(): cur_ex           = row[3].strip()

        eq_name = row[4].strip()
        if not eq_name or not cur_combo or not cur_ex:
            continue

        if cur_combo not in combos:
            combos[cur_combo] = COMBO_MAP.get(cur_combo, ("free", "cable"))

        ex_key = (cur_combo, cur_ex, cur_muscle or "")
        if ex_key not in ex_dict:
            ex_dict[ex_key] = {
                "combo":           cur_combo,
                "name":            cur_ex,
                "muscle":          cur_muscle or "",
                "is_superdefault": cur_superdefault,
                "info":            row[48].strip() or None,
            }
        elif cur_superdefault:
            ex_dict[ex_key]["is_superdefault"] = True

        is_avail, _ = parse_val(row[5])
        config = {}
        is_star = False
        for col_idx, key in CONFIG_COLS:
            val, star = parse_val(row[col_idx])
            config[key] = val
            if star: is_star = True

        eq_opts.append({
            "combo":           cur_combo,
            "exercise":        cur_ex,
            "muscle":          cur_muscle or "",
            "name":            eq_name,
            "is_available":    is_avail,
            "is_default":      is_avail and is_star,
            "is_default_star": is_star,
            "config":          config,
            "info_equipment":  row[47].strip() or None,
        })

    exercises = list(ex_dict.values())
    return combos, exercises, eq_opts

def parse_perspektiven():
    rows = []
    with open(PERSPEKTIVEN, encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)
        for row in reader:
            row = row + [""] * (4 - len(row))
            name = row[0].strip()
            if not name: continue
            top,   _ = parse_val(row[1])
            front, _ = parse_val(row[2])
            side,  _ = parse_val(row[3])
            rows.append({"exercise_name": name, "view_top": top, "view_front": front, "view_side": side})
    return rows

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    global KEY
    print("=" * 60)
    print("Supabase Exercise Upload")
    print("=" * 60)
    KEY = input("\nService_role key (Supabase > Settings > API): ").strip()
    if not KEY:
        print("No key entered. Exiting.")
        return

    # ── Parse files
    print("\nParsing exercise1.csv ...")
    combos, exercises, eq_opts = parse_exercise1()
    print(f"  {len(combos)} combos, {len(exercises)} exercises, {len(eq_opts)} equipment options")

    print("Parsing perspektiven.csv ...")
    perspectives = parse_perspektiven()
    print(f"  {len(perspectives)} perspective entries")

    # ── Schema: add is_superdefault column + UNIQUE constraint + perspective table
    print("\nApplying schema changes ...")
    schema_sql = """
        ALTER TABLE exercise ADD COLUMN IF NOT EXISTS is_superdefault BOOLEAN DEFAULT FALSE;
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'exercise_combo_label_key') THEN
            ALTER TABLE exercise_combo ADD CONSTRAINT exercise_combo_label_key UNIQUE (label);
          END IF;
        END $$;
        CREATE TABLE IF NOT EXISTS exercise_perspective (
          exercise_name TEXT PRIMARY KEY,
          view_top      BOOLEAN DEFAULT FALSE,
          view_front    BOOLEAN DEFAULT FALSE,
          view_side     BOOLEAN DEFAULT FALSE
        );
        ALTER TABLE exercise_perspective ENABLE ROW LEVEL SECURITY;
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read exercise_perspective') THEN
            CREATE POLICY "Public read exercise_perspective" ON exercise_perspective FOR SELECT USING (true);
          END IF;
        END $$;
    """.strip()
    if api_sql(schema_sql):
        print("  Schema changes applied ✓")
    else:
        print("  Schema via pg/query failed — trying to continue anyway ...")

    # ── Fetch muscle_group UUIDs
    print("\nFetching muscle groups ...")
    muscle_rows = api_get("muscle_group", select="id,name_en")
    muscle_map  = {row["name_en"].lower(): row["id"] for row in muscle_rows}
    print(f"  {len(muscle_map)} muscle groups found")

    # ── Step 1: Delete existing data (order matters for FK)
    print("\nClearing existing data ...")
    api_delete_all("equipment_option")
    # Delete exercises without deleting plan_exercise — warn if FK issue
    resp = requests.delete(
        f"{SUPABASE_URL}/rest/v1/exercise",
        headers=headers({"Prefer": "return=minimal"}),
        params={"id": "not.is.null"},
    )
    if not resp.ok and "foreign key" in resp.text.lower():
        print("  NOTE: Could not delete exercises because training plans reference them.")
        print("  Run this SQL in Supabase first, then re-run this script:")
        print("    TRUNCATE plan_exercise;")
        print("    DELETE FROM exercise;")
        return
    print("  Done ✓")

    # ── Step 2: Upsert exercise_combos
    print("\nUpserting exercise combos ...")
    combo_rows = [
        {"label": label, "place": place, "weight_type": wt}
        for label, (place, wt) in combos.items()
    ]
    api_upsert("exercise_combo", combo_rows, on_conflict="label")

    # Fetch combo UUIDs
    combo_db   = api_get("exercise_combo", select="id,label")
    combo_map  = {row["label"]: row["id"] for row in combo_db}

    # ── Step 3: Insert exercises
    print("\nInserting exercises ...")
    ex_rows = []
    skipped = 0
    for ex in exercises:
        combo_id  = combo_map.get(ex["combo"])
        muscle_id = muscle_map.get(ex["muscle"].lower())
        if not combo_id or not muscle_id:
            skipped += 1
            continue
        ex_rows.append({
            "exercise_combo_id": combo_id,
            "target_muscle_id":  muscle_id,
            "name":              ex["name"],
            "is_default":        False,
            "is_superdefault":   ex["is_superdefault"],
            "info":              ex["info"],
        })
    if skipped:
        print(f"  WARNING: {skipped} exercises skipped (muscle group not found)")
    api_insert("exercise", ex_rows)

    # Fetch exercise UUIDs
    ex_db  = api_get("exercise", select="id,name,exercise_combo_id")
    # Build map: (combo_id, name) → exercise_id
    ex_map = {(row["exercise_combo_id"], row["name"]): row["id"] for row in ex_db}

    # ── Step 4: Insert equipment_options
    print("\nInserting equipment options ...")
    opt_rows = []
    skipped  = 0
    for opt in eq_opts:
        combo_id = combo_map.get(opt["combo"])
        ex_id    = ex_map.get((combo_id, opt["exercise"])) if combo_id else None
        if not ex_id:
            skipped += 1
            continue
        opt_rows.append({
            "exercise_id":      ex_id,
            "name":             opt["name"],
            "is_available":     opt["is_available"],
            "is_default":       opt["is_default"],
            "is_default_star":  opt["is_default_star"],
            "config":           opt["config"],
            "info_equipment":   opt["info_equipment"],
        })
    if skipped:
        print(f"  WARNING: {skipped} equipment options skipped (exercise not found)")
    api_insert("equipment_option", opt_rows, batch=100)

    # ── Step 5: Upsert perspectives
    print("\nUpserting exercise perspectives ...")
    api_delete_all("exercise_perspective")
    api_insert("exercise_perspective", perspectives)

    print("\n" + "=" * 60)
    print("Upload complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
