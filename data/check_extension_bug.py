"""
check_extension_bug.py
======================
Queries the live Supabase DB to diagnose why "F C triceps extension 1rope"
shows stand_90 instead of stand_0 in the Exercise Builder.

Run:
    cd data
    python check_extension_bug.py
"""
import os, json
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY not set in .env")
    raise SystemExit(1)

from supabase import create_client
client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 1) Find the triceps muscle ID
print("=== Muscles ===")
muscles = client.table("muscles").select("id, name_en").execute().data or []
triceps = next((m for m in muscles if m["name_en"].strip().lower() == "triceps"), None)
if not triceps:
    print("ERROR: Triceps muscle not found!")
    raise SystemExit(1)
print(f"Triceps muscle_id: {triceps['id']}")

# 2) Find all Free+Cable triceps extension exercises
print("\n=== Free+Cable triceps extension exercises ===")
exs = (
    client.table("exercises")
    .select("id, exercise_name, place, weight_type, muscle_id, is_superdefault")
    .eq("muscle_id", triceps["id"])
    .eq("place", "free")
    .eq("weight_type", "cable")
    .ilike("exercise_name", "%extension%")
    .execute().data or []
)
for ex in exs:
    print(f"  [{ex['id'][:8]}...] name='{ex['exercise_name']}' superdefault={ex['is_superdefault']}")

# 3) For each exercise, fetch 1rope equipment options
print("\n=== 1rope equipment for each extension exercise ===")
for ex in exs:
    equipment = (
        client.table("equipment")
        .select("id, exercise_id, equipment_name, is_default_setup, details")
        .eq("exercise_id", ex["id"])
        .eq("equipment_name", "1rope")
        .execute().data or []
    )
    print(f"\nExercise '{ex['exercise_name']}' [{ex['id'][:8]}] (superdefault={ex['is_superdefault']}):")
    if not equipment:
        print("  NO 1rope equipment found!")
    for eq in equipment:
        raw_det = eq.get("details") or {}
        det = json.loads(raw_det) if isinstance(raw_det, str) else (raw_det or {})
        stands = {k: v for k, v in det.items() if k.startswith("stand_")}
        print(f"  Equipment ID: {eq['id'][:8]}...")
        print(f"  is_default_setup: {eq['is_default_setup']!r} (type: {type(eq['is_default_setup']).__name__})")
        print(f"  Stand values: {stands}")

# 4) Also check what fetchEquipmentOptions would return (neq is_default_setup 'false')
print("\n=== fetchEquipmentOptions simulation (neq is_default_setup 'false') ===")
for ex in exs:
    if "extension" not in ex["exercise_name"].lower():
        continue
    equipment = (
        client.table("equipment")
        .select("id, exercise_id, equipment_name, is_default_setup, details")
        .eq("exercise_id", ex["id"])
        .neq("is_default_setup", "false")
        .execute().data or []
    )
    names = [eq["equipment_name"] for eq in equipment]
    print(f"  [{ex['id'][:8]}] '{ex['exercise_name']}' superdefault={ex['is_superdefault']}: {names}")

print("\nDone.")
