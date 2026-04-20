"""
fix_extension_1rope.py
======================
Korrigiert das falsche details-JSON fuer:
  Exercise 5defc1c9 (Free+Cable triceps extension, is_superdefault=true)
  Equipment  6e32e4ee (1rope)

Problem: fix_details_star.py hat beide Extension-Varianten auf denselben
DB-Eintrag gemappt und die non-superdefault Daten (stand_90) ueberschrieben
die korrekten superdefault Daten (stand_0).

Korrekte Werte laut exercise1.csv (superdefault Block, Zeilen 26-35):
  stand_0  = WAHR  -> "true"
  stand_90 = FALSCH -> "false"

Run:
    cd data
    python fix_extension_1rope.py --dry-run
    python fix_extension_1rope.py
"""

import os, json
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

EQUIPMENT_ID  = "6e32e4ee-c626-4949-beb5-6f685a55d10b"
EXERCISE_ID   = "5defc1c9-ab8d-427a-8c4e-d055fd6ab823"

# Korrektes details-JSON laut CSV-Block 2 (superdefault extension, 1rope)
# WAHR* -> "star", WAHR -> "true", FALSCH -> "false"
CORRECT_DETAILS = {
    "hands_1":         "true",
    "hands_2":         "false",
    "grip_sup":        "false",
    "grip_s_n":        "false",
    "grip_n":          "true",
    "grip_n_p":        "false",
    "grip_pro":        "false",
    "plane_lat":       "false",
    "plane_l_s":       "false",
    "plane_sag":       "true",
    "plane_s_t":       "false",
    "plane_trans":     "false",
    "plane_t_l":       "false",
    "width_x05":       "false",
    "width_x1":        "false",
    "width_x15":       "false",
    "cable_h_1_8":     "false",
    "cable_h_9_15":    "false",
    "cable_h_16_22":   "true",
    "bench_flat":      "false",
    "bench_incl":      "false",
    "bench_upright":   "false",
    "stand_0":         "true",   # <- KORREKTUR: war falschlicherweise "false"
    "stand_45":        "false",
    "stand_90":        "false",  # <- KORREKTUR: war falschlicherweise "true"
    "stand_90os":      "false",
    "stand_135":       "false",
    "stand_180":       "false",
    "bench_cable_0":   "false",
    "bench_cable_90":  "false",
    "bench_cable_180": "false",
    "body_bench_0":    "false",
    "body_bench_45":   "false",
    "body_bench_90":   "false",
    "body_bench_135":  "false",
    "body_bench_180":  "false",
    "body_pos_lying":  "false",
    "body_pos_180":    "false",
    "body_pos_sitting":"false",
    "sit_0":           "false",
    "sit_90":          "false",
    "cables_1":        "true",
    "cables_2":        "false",
}


def main(dry_run: bool):
    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Aktuellen Stand abrufen
    current = (
        client.table("equipment")
        .select("id, exercise_id, equipment_name, details")
        .eq("id", EQUIPMENT_ID)
        .single()
        .execute()
    )
    row = current.data
    if not row:
        print("ERROR: Equipment-Eintrag nicht gefunden!")
        return

    raw = row.get("details")
    det = json.loads(raw) if isinstance(raw, str) else (raw or {})
    print(f"Equipment: {row['equipment_name']}  (exercise_id: {row['exercise_id'][:8]}...)")
    print(f"  IST  stand_0={det.get('stand_0')!r}  stand_90={det.get('stand_90')!r}")
    print(f"  SOLL stand_0='true'              stand_90='false'")

    if dry_run:
        print("\nDry-run - kein Update.")
        return

    result = (
        client.table("equipment")
        .update({"details": CORRECT_DETAILS})
        .eq("id", EQUIPMENT_ID)
        .execute()
    )
    updated = result.data
    if not updated:
        print("ERROR: Update fehlgeschlagen!")
        return

    # Verifizieren
    verify = (
        client.table("equipment")
        .select("details")
        .eq("id", EQUIPMENT_ID)
        .single()
        .execute()
    )
    vdet_raw = verify.data.get("details")
    vdet = json.loads(vdet_raw) if isinstance(vdet_raw, str) else (vdet_raw or {})
    print(f"\nNach Update:")
    print(f"  stand_0={vdet.get('stand_0')!r}  stand_90={vdet.get('stand_90')!r}")
    print("Fertig!")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL / SUPABASE_SERVICE_KEY fehlen in .env")
        raise SystemExit(1)

    main(dry_run=args.dry_run)
