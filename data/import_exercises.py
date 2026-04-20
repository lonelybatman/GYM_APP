#!/usr/bin/env python3
"""
import_exercises.py
-------------------
Reads exercise1.csv and exercise builder perspektiven.csv,
generates data/output.sql to run in Supabase SQL Editor.

Usage (from gym-app folder):
    python data/import_exercises.py

Then open data/output.sql and run it in Supabase SQL Editor.

WARNING: Clears existing exercise + equipment_option data and re-inserts.
         plan_exercise rows that reference deleted exercises will also be deleted.
"""

import csv
import json
import os

# ── Paths (CSV next to this script; override with env EXERCISE1_CSV / PERSPEKTIVEN_CSV) ──
_DATA_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_SQL = os.path.join(_DATA_DIR, "output.sql")
EXERCISE1_CSV = os.environ.get("EXERCISE1_CSV", os.path.join(_DATA_DIR, "exercise1.csv"))
PERSPEKTIVEN_CSV = os.environ.get(
    "PERSPEKTIVEN_CSV", os.path.join(_DATA_DIR, "exercise builder perspektiven.csv")
)

# ── Combo label → (place, weight_type) ─────────────────────────────────────
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

# ── Config columns: (csv_col_index, json_key) ───────────────────────────────
CONFIG_COLS = [
    (6,  "hand_1"),           (7,  "hand_2"),
    (8,  "grip_sup"),         (9,  "grip_sn"),        (10, "grip_n"),
    (11, "grip_np"),          (12, "grip_pro"),
    (13, "plane_lat"),        (14, "plane_ls"),
    (15, "plane_sag"),        (16, "plane_st"),        (17, "plane_trans"),   (18, "plane_tl"),
    (19, "grip_width_05"),    (20, "grip_width_1"),    (21, "grip_width_15"),
    (22, "cable_height_1_8"), (23, "cable_height_9_15"), (24, "cable_height_16_22"),
    (25, "bench_flat"),       (26, "bench_incl"),      (27, "bench_upright"),
    (28, "stand_0"),          (29, "stand_45"),        (30, "stand_90"),
    (31, "stand_90os"),       (32, "stand_135"),       (33, "stand_180"),
    (34, "bench_cable_0"),    (35, "bench_cable_90"),  (36, "bench_cable_180"),
    (37, "body_bench_0"),     (38, "body_bench_45"),   (39, "body_bench_90"),
    (40, "body_bench_135"),   (41, "body_bench_180"),
    (42, "body_pos_lying"),   (43, "body_pos_180"),    (44, "body_pos_sitting"),
    (45, "sit_0"),            (46, "sit_90"),
]

def detect_cable_used_cols(rows):
    sub_header = rows[2] if len(rows) > 2 else []
    one_cols = []
    two_cols = []
    for i, raw in enumerate(sub_header):
        v = (raw or "").strip()
        if v == "1":
            one_cols.append(i)
        if v == "2":
            two_cols.append(i)
    return (
        one_cols[-1] if one_cols else None,
        two_cols[-1] if two_cols else None,
    )

# ── Helpers ─────────────────────────────────────────────────────────────────

def parse_val(s):
    """Returns (bool_value, is_star). WAHR* → (True, True)."""
    v = s.strip().upper()
    if v == "WAHR*":
        return True, True
    if v in ("WAHR", "TRUE", "1"):
        return True, False
    return False, False

def q(s):
    """Wrap value in SQL single-quotes, or return NULL."""
    if s is None:
        return "NULL"
    s = str(s).strip()
    if s == "":
        return "NULL"
    return "'" + s.replace("'", "''") + "'"

def b(v):
    return "TRUE" if v else "FALSE"

COMBO_LABEL_NORMALIZE = {
    "lat pull": "Lat Pull",
    "lat pull2": "Lat Pull2",
    "lat row": "Lat Row",
    "lat row 2": "Lat Row 2",
}

def normalize_combo_label(label: str) -> str:
    key = " ".join(label.strip().lower().split())
    return COMBO_LABEL_NORMALIZE.get(key, label.strip())

# ── Parse exercise1.csv ─────────────────────────────────────────────────────

def parse_exercise1():
    """
    Returns:
      combos   : dict  label → (place, weight_type)
      exercises: list  of dicts {combo, muscle, name, info}
      eq_opts  : list  of dicts {combo, exercise, muscle, name, is_available,
                                  is_default, is_default_star, config, info_equipment}
    """
    combos    = {}
    exercises = []   # ordered, deduplicated by (combo, name, muscle)
    ex_keys   = set()
    eq_opts   = []

    cur_combo       = None
    cur_superdefault = False
    cur_muscle      = None
    cur_ex          = None

    with open(EXERCISE1_CSV, encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        rows = list(reader)
    cable1_col, cable2_col = detect_cable_used_cols(rows)
    min_cols = max(
        49,
        (cable1_col + 1) if cable1_col is not None else 0,
        (cable2_col + 1) if cable2_col is not None else 0,
    )

    # Rows 0-3 are header/separator rows; data starts at index 4
    for row in rows[4:]:
        row = row + [""] * (min_cols - len(row))  # pad

        # Forward-fill
        if row[0].strip():
            cur_combo = normalize_combo_label(row[0])
        if row[1].strip():
            cur_superdefault, _ = parse_val(row[1])
        if row[2].strip():
            cur_muscle = row[2].strip()
        if row[3].strip():
            cur_ex = row[3].strip()

        eq_name = row[4].strip()
        if not eq_name or not cur_combo or not cur_ex:
            continue

        # Register combo
        if cur_combo not in combos:
            combos[cur_combo] = COMBO_MAP.get(cur_combo, ("free", "cable"))

        # Register exercise (deduplicated)
        ex_key = (cur_combo, cur_ex, cur_muscle or "")
        if ex_key not in ex_keys:
            ex_keys.add(ex_key)
            exercises.append({
                "combo":           cur_combo,
                "name":            cur_ex,
                "muscle":          cur_muscle or "",
                "is_superdefault": cur_superdefault,
                "info":            row[48].strip() or None,
            })

        # Parse is_available
        is_avail, _ = parse_val(row[5])

        # Build config + detect is_default_star
        config = {}
        is_star = False
        for col_idx, key in CONFIG_COLS:
            val, star = parse_val(row[col_idx])
            config[key] = val
            if star:
                is_star = True
        if cable1_col is not None:
            val, _ = parse_val(row[cable1_col])
            config["cables_used_1"] = val
        if cable2_col is not None:
            val, _ = parse_val(row[cable2_col])
            config["cables_used_2"] = val

        eq_opts.append({
            "combo":            cur_combo,
            "exercise":         cur_ex,
            "muscle":           cur_muscle or "",
            "name":             eq_name,
            "is_available":     is_avail,
            "is_default":       is_avail and is_star,
            "is_default_star":  is_star,
            "config":           config,
            "info_equipment":   row[47].strip() or None,
        })

    return combos, exercises, eq_opts

# ── Parse exercise builder perspektiven.csv ─────────────────────────────────

def parse_perspektiven():
    rows = []
    if not os.path.isfile(PERSPEKTIVEN_CSV):
        print(f"  (skip) Perspective file not found: {PERSPEKTIVEN_CSV}")
        return rows
    with open(PERSPEKTIVEN_CSV, encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=";")
        next(reader)  # skip header row
        for row in reader:
            row = row + [""] * (4 - len(row))
            name = row[0].strip()
            if not name:
                continue
            top,   _ = parse_val(row[1])
            front, _ = parse_val(row[2])
            side,  _ = parse_val(row[3])
            rows.append((name, top, front, side))
    return rows

# ── Generate SQL ─────────────────────────────────────────────────────────────

def generate_sql(combos, exercises, eq_opts, perspectives):
    L = []

    L += [
        "-- ============================================================",
        "-- Generated by import_exercises.py",
        "-- Run in Supabase SQL Editor",
        "-- ============================================================",
        "",
        "-- 1. Add UNIQUE constraint on exercise_combo.label (needed for ON CONFLICT)",
        "DO $$ BEGIN",
        "  IF NOT EXISTS (",
        "    SELECT 1 FROM pg_constraint WHERE conname = 'exercise_combo_label_key'",
        "  ) THEN",
        "    ALTER TABLE exercise_combo ADD CONSTRAINT exercise_combo_label_key UNIQUE (label);",
        "  END IF;",
        "END $$;",
        "",
        "-- 2. Clear existing exercise data (CASCADE removes equipment_option + plan_exercise refs)",
        "TRUNCATE equipment_option;",
        "DELETE FROM exercise;",
        "",
        "-- 3. Upsert exercise combos",
    ]

    for label, (place, weight_type) in sorted(combos.items()):
        L.append(
            f"INSERT INTO exercise_combo (label, place, weight_type) VALUES "
            f"({q(label)}, {q(place)}, {q(weight_type)}) "
            f"ON CONFLICT (label) DO UPDATE SET place = EXCLUDED.place, weight_type = EXCLUDED.weight_type;"
        )

    L += [
        "",
        "-- Add is_superdefault column if not exists",
        "ALTER TABLE exercise ADD COLUMN IF NOT EXISTS is_superdefault BOOLEAN DEFAULT FALSE;",
        "",
        "-- 4. Insert exercises (matched via combo label + muscle group name)",
    ]

    for ex in exercises:
        L.append(
            f"INSERT INTO exercise (exercise_combo_id, target_muscle_id, name, is_default, is_superdefault, info)"
            f" SELECT ec.id, mg.id, {q(ex['name'])}, FALSE, {b(ex['is_superdefault'])}, {q(ex['info'])}"
            f" FROM exercise_combo ec"
            f" JOIN muscle_group mg ON LOWER(mg.name_en) = LOWER({q(ex['muscle'])})"
            f" WHERE ec.label = {q(ex['combo'])};"
        )

    L += ["", "-- 5. Insert equipment options"]

    for opt in eq_opts:
        cfg = json.dumps(opt["config"], ensure_ascii=False)
        L.append(
            f"INSERT INTO equipment_option"
            f" (exercise_id, name, is_available, is_default, is_default_star, config, info_equipment)"
            f" SELECT e.id, {q(opt['name'])}, {b(opt['is_available'])}, {b(opt['is_default'])},"
            f" {b(opt['is_default_star'])}, {q(cfg)}::jsonb, {q(opt['info_equipment'])}"
            f" FROM exercise e"
            f" JOIN exercise_combo ec ON e.exercise_combo_id = ec.id"
            f" WHERE e.name = {q(opt['exercise'])} AND ec.label = {q(opt['combo'])};"
        )

    L += [
        "",
        "-- 6. Create exercise_perspective table (for Exercise Builder views)",
        "CREATE TABLE IF NOT EXISTS exercise_perspective (",
        "  exercise_name  TEXT PRIMARY KEY,",
        "  view_top       BOOLEAN DEFAULT FALSE,",
        "  view_front     BOOLEAN DEFAULT FALSE,",
        "  view_side      BOOLEAN DEFAULT FALSE",
        ");",
        "",
        "ALTER TABLE exercise_perspective ENABLE ROW LEVEL SECURITY;",
        "DROP POLICY IF EXISTS \"Public read exercise_perspective\" ON exercise_perspective;",
        "CREATE POLICY \"Public read exercise_perspective\"",
        "  ON exercise_perspective FOR SELECT USING (true);",
        "",
        "TRUNCATE exercise_perspective;",
    ]

    for name, top, front, side in perspectives:
        L.append(
            f"INSERT INTO exercise_perspective (exercise_name, view_top, view_front, view_side)"
            f" VALUES ({q(name)}, {b(top)}, {b(front)}, {b(side)});"
        )

    L.append("")
    return "\n".join(L)

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("Parsing exercise1.csv ...")
    combos, exercises, eq_opts = parse_exercise1()
    print(f"  {len(combos)} combos, {len(exercises)} exercises, {len(eq_opts)} equipment options")

    print("Parsing exercise builder perspektiven.csv ...")
    perspectives = parse_perspektiven()
    print(f"  {len(perspectives)} perspective entries")

    print("Generating SQL ...")
    sql = generate_sql(combos, exercises, eq_opts, perspectives)

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write(sql)

    print(f"\nDone! Output written to:\n  {OUTPUT_SQL}")
    print("\nNext step: open that file and run it in Supabase SQL Editor.")

if __name__ == "__main__":
    main()
