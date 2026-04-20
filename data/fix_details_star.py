"""
fix_details_star.py
====================
Liest exercise1.csv neu und aktualisiert equipment.details in Supabase:
  WAHR*  →  "star"
  WAHR   →  "true"
  FALSCH →  "false"

Die bisherige Migration hat WAHR* und WAHR beide als "true" gespeichert
(da der Import-Script Booleans nutzte). Dieses Script stellt die
Stern-Information wieder her und setzt alle Details korrekt.

Setup:
    pip install pandas supabase python-dotenv

Ausführen:
    cd data
    python fix_details_star.py --dry-run   # Überprüfen ohne Schreiben
    python fix_details_star.py             # Tatsächlich updaten
"""

import os, json, math
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
EXERCISE_CSV = "exercise1.csv"

# ── Spalten-Index → DB-Feldname (in details JSON) ────────────────────────────
DETAIL_COLS = {
    7:  "hands_1",        8:  "hands_2",
    9:  "grip_sup",       10: "grip_s_n",       11: "grip_n",
    12: "grip_n_p",       13: "grip_pro",
    14: "plane_lat",      15: "plane_l_s",       16: "plane_sag",
    17: "plane_s_t",      18: "plane_trans",     19: "plane_t_l",
    20: "width_x05",      21: "width_x1",        22: "width_x15",
    23: "cable_h_1_8",    24: "cable_h_9_15",    25: "cable_h_16_22",
    26: "bench_flat",     27: "bench_incl",      28: "bench_upright",
    29: "stand_0",        30: "stand_45",        31: "stand_90",
    32: "stand_90os",     33: "stand_135",       34: "stand_180",
    35: "bench_cable_0",  36: "bench_cable_90",  37: "bench_cable_180",
    38: "body_bench_0",   39: "body_bench_45",   40: "body_bench_90",
    41: "body_bench_135", 42: "body_bench_180",
    43: "body_pos_lying", 44: "body_pos_180",    45: "body_pos_sitting",
    46: "sit_0",          47: "sit_90",
    50: "cables_1",       51: "cables_2",
}

# Combo-String → (place, weight_type)
COMBO_MAP = {
    "free + cable":       ("free",     "cable"),
    "bench + freeweight": ("bench",    "freeweight"),
    "lat pull":           ("lat_pull", "cable"),
    "lat pull2":          ("lat_pull", "cable"),
    "lat row":            ("lat_row",  "cable"),
    "lat row 2":          ("lat_row",  "cable"),
    "cable + bench":      ("bench",    "cable"),
    "free + freeweight":  ("free",     "freeweight"),
}

# Muskel-Alias: CSV-Name → name_en im DB (lowercase)
MUSCLE_ALIAS = {
    "abs":      "core",
    "lat":      "back",
    "shoulder": "shoulders",
}

# ── Hilfsfunktionen ───────────────────────────────────────────────────────────

def cell_to_detail_value(val) -> str | None:
    """Wandelt einen CSV-Zellenwert in 'star' / 'true' / 'false' um."""
    if val is None:
        return "false"
    s = str(val).strip()
    if s == "WAHR*":
        return "star"
    if s in ("WAHR", "True", "TRUE", "1"):
        return "true"
    # FALSCH / False / leer / nan → false
    return "false"

def is_true(val) -> bool:
    if val is True:
        return True
    if isinstance(val, str):
        return val.strip() in ("WAHR", "WAHR*")
    if isinstance(val, (int, float)) and not isinstance(val, bool):
        return val == 1
    return False

def clean(val) -> str | None:
    if val is None:
        return None
    if isinstance(val, float) and math.isnan(val):
        return None
    s = str(val).strip()
    return s if s and s.lower() not in ("nan", "") else None

def is_sub_header(row) -> bool:
    h = clean(row[7])
    i = clean(row[8])
    return h in ("1", "1.0") and i in ("2", "2.0")

def is_empty_row(row) -> bool:
    return all(
        clean(row[i]) in (None, "FALSCH", "FALSE", "False")
        for i in range(52)
    )

# ── CSV lesen ─────────────────────────────────────────────────────────────────

def parse_csv(path: str):
    """
    Gibt Liste von dicts zurück:
      { exercise_name, muscle_lower, place, weight_type,
        equipment_name, possible, details }
    """
    df = pd.read_csv(path, sep=";", header=None, encoding="utf-8-sig", dtype=str)

    results = []
    current_kombi = None
    current_muscle = None
    current_exercise_name = None
    current_possible_override = None  # falls Übungszeile possible hat

    for i in range(4, len(df)):
        row = list(df.iloc[i])

        if is_sub_header(row) or is_empty_row(row):
            continue

        c_kombi  = clean(row[0])
        c_muscle = clean(row[2])
        c_name   = clean(row[3])
        c_poss   = clean(row[4])
        c_equip  = clean(row[5])

        # Neue Übung
        if c_muscle and c_muscle.lower() not in ("target muscle",):
            if c_kombi:
                current_kombi = c_kombi
            current_muscle = c_muscle.strip().lower()
            current_muscle = MUSCLE_ALIAS.get(current_muscle, current_muscle)
            current_exercise_name = c_name.strip() if c_name else None

        if not c_equip or not current_kombi or not current_exercise_name:
            continue

        place_wt = COMBO_MAP.get(current_kombi.lower().strip())
        if not place_wt:
            continue
        place, weight_type = place_wt

        # Details aufbauen
        details: dict[str, str] = {}
        for col_idx, field_name in DETAIL_COLS.items():
            if col_idx < len(row):
                details[field_name] = cell_to_detail_value(row[col_idx])
            else:
                details[field_name] = "false"

        # info_equipment (Spalte 48)
        info = clean(row[48]) if len(row) > 48 else None
        if info:
            details["info_equipment"] = info

        results.append({
            "exercise_name":  current_exercise_name,
            "muscle_lower":   current_muscle,
            "place":          place,
            "weight_type":    weight_type,
            "equipment_name": c_equip.strip(),
            "possible":       is_true(c_poss),
            "details":        details,
        })

    return results

# ── DB-Daten laden ────────────────────────────────────────────────────────────

def load_db(client):
    """Lädt exercises + muscles + equipment aus Supabase."""
    print("Lade muscles …")
    muscles_data = client.table("muscles").select("id, name_en").execute().data or []
    muscle_id_to_name = {m["id"]: m["name_en"].strip().lower() for m in muscles_data}
    print(f"  {len(muscles_data)} muscles")

    print("Lade exercises …")
    exercises_data = (
        client.table("exercises")
        .select("id, exercise_name, place, weight_type, muscle_id")
        .execute().data or []
    )
    print(f"  {len(exercises_data)} exercises")

    print("Lade equipment …")
    equipment_data = (
        client.table("equipment")
        .select("id, exercise_id, equipment_name, is_default_setup")
        .execute().data or []
    )
    print(f"  {len(equipment_data)} equipment")

    # Lookup: (exercise_name_lower, muscle_lower, place, weight_type) → exercise_id
    exercise_lookup: dict[tuple, str] = {}
    for ex in exercises_data:
        key = (
            ex["exercise_name"].strip().lower(),
            muscle_id_to_name.get(ex["muscle_id"], ""),
            ex["place"],
            ex["weight_type"],
        )
        exercise_lookup[key] = ex["id"]

    # Lookup: (exercise_id, equipment_name_lower) → equipment_id
    equipment_lookup: dict[tuple, str] = {}
    for eq in equipment_data:
        key = (eq["exercise_id"], eq["equipment_name"].strip().lower())
        equipment_lookup[key] = eq["id"]

    return exercise_lookup, equipment_lookup

# ── Matching ──────────────────────────────────────────────────────────────────

def match_and_build_updates(csv_rows, exercise_lookup, equipment_lookup):
    updates = []
    skipped = 0
    matched = 0

    for row in csv_rows:
        ex_key = (
            row["exercise_name"].lower(),
            row["muscle_lower"],
            row["place"],
            row["weight_type"],
        )
        exercise_id = exercise_lookup.get(ex_key)
        if not exercise_id:
            # Fallback: ohne Muskel-Match (wenn Muskel-Name variiert)
            for k, v in exercise_lookup.items():
                if k[0] == ex_key[0] and k[2] == ex_key[2] and k[3] == ex_key[3]:
                    exercise_id = v
                    break

        if not exercise_id:
            skipped += 1
            continue

        eq_key = (exercise_id, row["equipment_name"].lower())
        equipment_id = equipment_lookup.get(eq_key)
        if not equipment_id:
            skipped += 1
            continue

        matched += 1
        updates.append({
            "id":      equipment_id,
            "details": row["details"],
        })

    return updates, matched, skipped

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Nur prüfen, kein Schreiben")
    args = parser.parse_args()

    print(f"Lese {EXERCISE_CSV} …")
    csv_rows = parse_csv(EXERCISE_CSV)
    print(f"  {len(csv_rows)} Equipment-Zeilen in CSV")

    # Statistik: Wieviele WAHR* Werte gibt es?
    star_count = sum(
        1 for row in csv_rows
        for v in row["details"].values()
        if v == "star"
    )
    print(f"  Davon {star_count} WAHR*-Werte (werden zu 'star')")

    if args.dry_run:
        print("\nDry run – erste 3 CSV-Zeilen:")
        for row in csv_rows[:3]:
            print(f"  {row['exercise_name']} / {row['equipment_name']}")
            true_fields = {k: v for k, v in row["details"].items() if v != "false"}
            print(f"    true/star: {true_fields}")
        print("\nDry run – kein Upload.")
        raise SystemExit(0)

    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    exercise_lookup, equipment_lookup = load_db(client)

    print("\nMatche CSV <-> DB ...")
    updates, matched, skipped = match_and_build_updates(
        csv_rows, exercise_lookup, equipment_lookup
    )
    print(f"  Matched: {matched}, Skipped: {skipped}")

    if skipped > 0:
        print(f"  ⚠  {skipped} Zeilen konnten nicht zugeordnet werden")
        print("     (abweichende Equipment- oder Übungsnamen zwischen CSV und DB)")

    # SQL-Datei generieren statt API-Calls (effizient, 1 Statement im SQL-Editor)
    sql_path = "fix_details_star.sql"
    print(f"\nGeneriere SQL -> {sql_path} ...")
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("-- fix_details_star.sql\n")
        f.write("-- Korrigiert equipment.details: WAHR* -> 'star', WAHR -> 'true', FALSCH -> 'false'\n")
        f.write("-- Im Supabase SQL Editor ausfuehren\n\n")
        f.write("BEGIN;\n\n")

        CHUNK = 100
        for k in range(0, len(updates), CHUNK):
            chunk = updates[k : k + CHUNK]
            # UPDATE mit VALUES-Liste via CTE
            f.write("UPDATE equipment AS e\n")
            f.write("SET details = v.new_details::jsonb\n")
            f.write("FROM (VALUES\n")
            rows = []
            for u in chunk:
                eid = u["id"].replace("'", "''")
                det = json.dumps(u["details"], ensure_ascii=False).replace("'", "''")
                rows.append(f"  ('{eid}'::uuid, '{det}'::jsonb)")
            f.write(",\n".join(rows))
            f.write("\n) AS v(id, new_details)\n")
            f.write("WHERE e.id = v.id;\n\n")

        f.write("COMMIT;\n")

    print(f"  {len(updates)} Updates in {sql_path} geschrieben.")
    print(f"\n=> Bitte '{sql_path}' im Supabase SQL Editor ausfuehren.")

    print("\n✅ Fertig!")
