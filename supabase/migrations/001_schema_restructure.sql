-- ================================================================
-- DB MIGRATION: Gym App Schema Restructuring :)
-- Run in Supabase SQL Editor : 
--
-- Split into two phases: :D
--   Phase 1 (migration-phase1): Add new columns + populate data
--   Phase 2 (migration-phase2): Drop old columns (run AFTER
--                                new code is deployed)
-- ================================================================

-- ================================================================
-- PHASE 1 — safe to run while old code is still deployed
-- ================================================================

BEGIN;

-- ── exercises: add place + weight_type ───────────────────────────
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS place TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS weight_type TEXT;

UPDATE exercises SET
  place = CASE LOWER(TRIM(exercise_kombi))
    WHEN 'free + cable'       THEN 'free'
    WHEN 'bench + freeweight' THEN 'bench'
    WHEN 'lat pull'           THEN 'lat_pull'
    WHEN 'lat pull2'          THEN 'lat_pull'
    WHEN 'lat row'            THEN 'lat_row'
    WHEN 'lat row 2'          THEN 'lat_row'
    WHEN 'cable + bench'      THEN 'bench'
    WHEN 'free + freeweight'  THEN 'free'
    ELSE NULL
  END,
  weight_type = CASE LOWER(TRIM(exercise_kombi))
    WHEN 'free + cable'       THEN 'cable'
    WHEN 'bench + freeweight' THEN 'freeweight'
    WHEN 'lat pull'           THEN 'cable'
    WHEN 'lat pull2'          THEN 'cable'
    WHEN 'lat row'            THEN 'cable'
    WHEN 'lat row 2'          THEN 'cable'
    WHEN 'cable + bench'      THEN 'cable'
    WHEN 'free + freeweight'  THEN 'freeweight'
    ELSE NULL
  END;

-- ── equipment: add is_default TEXT column ────────────────────────
-- (parallel to existing is_default_setup bool)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS is_default TEXT;

-- Base values from existing possible + is_default_setup
UPDATE equipment SET is_default =
  CASE
    WHEN possible = false                            THEN 'false'
    WHEN possible = true AND is_default_setup = true THEN 'star'
    ELSE                                                  'true'
  END;

-- ── equipment: convert details JSON booleans → text strings ──────
-- true  → "true"
-- false → "false"
-- (info_equipment is already a text string — leave unchanged)
UPDATE equipment
SET details = (
  SELECT jsonb_object_agg(
    key,
    CASE
      WHEN key = 'info_equipment'    THEN value
      WHEN value = 'true'::jsonb     THEN to_jsonb('true'::text)
      WHEN value = 'false'::jsonb    THEN to_jsonb('false'::text)
      ELSE value
    END
  )
  FROM jsonb_each(details)
)
WHERE details IS NOT NULL AND jsonb_typeof(details) = 'object';

-- ── muscles: delete duplicate entries ────────────────────────────
-- Keep only primary entries (those that exercises.muscle_id reference).
-- The guard "NOT IN (SELECT muscle_id FROM exercises)" is a safety net:
-- it prevents deletion if any exercise still points to a "duplicate" id.
DELETE FROM muscles
WHERE id IN (
  '2ad6a940-e6e5-49e1-bc37-080e249e5a15', -- Back (dup)
  '84bdfc5e-4cb8-4c03-868d-b66893b0aaa3', -- Back (dup)
  'fd1ff5fb-6883-4d91-bd6b-73d0ca70ad6e', -- Back (dup)
  '2fb37ae1-26b7-4880-894d-47ca460e5be9', -- Chest (dup)
  '96dc2fc9-14f6-4de0-a818-3365746d315f', -- Chest (dup)
  '4369767a-9202-4788-a887-ee577504a612', -- Triceps (dup)
  'a068ca0e-074b-4c0f-96dc-86bddf3a10a2', -- Triceps (dup)
  '6d4d2807-59e5-42a0-8aa1-d59896450034', -- Shoulders (dup)
  'c6a91d57-0b48-4393-b488-475cafe8e473', -- Shoulders (dup)
  '4965a63a-c6ec-42ac-bfd9-d7ffda8152e2', -- Biceps (dup)
  'c0ba6c62-ca0a-4877-aea1-095f2f71ec6e', -- Legs (dup)
  '7382d769-d616-4084-98d7-a63d5ed2a58e', -- Core (dup)
  '45ef2874-51a8-4bd4-a23c-3e965dc741ea', -- Forearm (dup)
  'f55de23e-2b72-4d4a-8c8c-1f8abe0ded87', -- Forearm (dup)
  'a9262bcd-a628-43ff-986f-63dafc41b407', -- Glute (dup)
  'ecac8d42-d5ec-4f01-94cf-bf8b679e7596'  -- Glute (dup)
)
AND id NOT IN (SELECT DISTINCT muscle_id FROM exercises WHERE muscle_id IS NOT NULL);

COMMIT;

-- ================================================================
-- PHASE 2 — run AFTER the new TypeScript code is deployed
-- ================================================================

BEGIN;

-- exercises: drop redundant columns
ALTER TABLE exercises DROP COLUMN IF EXISTS exercise_kombi;
ALTER TABLE exercises DROP COLUMN IF EXISTS full_name;
ALTER TABLE exercises DROP COLUMN IF EXISTS target_muscle;

-- equipment: drop old bool columns, rename new text column
ALTER TABLE equipment DROP COLUMN IF EXISTS possible;
ALTER TABLE equipment DROP COLUMN IF EXISTS is_default_setup;
ALTER TABLE equipment RENAME COLUMN is_default TO is_default_setup;

-- muscles: drop translation columns (moved to i18n files)
ALTER TABLE muscles DROP COLUMN IF EXISTS name_de;
ALTER TABLE muscles DROP COLUMN IF EXISTS name_latin;

COMMIT;
