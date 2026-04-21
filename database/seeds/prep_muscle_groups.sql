-- ============================================================
-- prep_muscle_groups.sql
-- Run this BEFORE output.sql in Supabase SQL Editor
-- ============================================================

-- 1. Rename 'Delts' → 'Shoulder' (CSV uses 'shoulder')
UPDATE muscle_group SET name_en = 'Shoulder' WHERE name_en = 'Delts';

-- 2. Remove wrongly added Lat/Abs muscle_groups (these are now individual muscles, not groups)
--    Must clear exercise FK chain first (output.sql will re-insert everything)
TRUNCATE set_log, plan_exercise, equipment_option CASCADE;
DELETE FROM exercise;
DELETE FROM muscle_group WHERE LOWER(name_en) IN ('lat', 'abs');

-- Verify muscle_groups:
SELECT name_en FROM muscle_group ORDER BY name_en;


-- ============================================================
-- muscle table (individual muscles for activation tracking)
-- ============================================================
DROP TABLE IF EXISTS exercise_muscle_activation;
DROP TABLE IF EXISTS muscle CASCADE;
CREATE TABLE muscle (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en  TEXT NOT NULL UNIQUE,
  group_id UUID REFERENCES muscle_group(id)
);

ALTER TABLE muscle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read muscle" ON muscle;
CREATE POLICY "Public read muscle" ON muscle FOR SELECT USING (true);

-- Insert individual muscles (grouped under their muscle_group)
INSERT INTO muscle (name_en, group_id)
SELECT m.name_en, mg.id
FROM (VALUES
  ('Lat',          'Back'),
  ('Upper Back',   'Back'),
  ('Mid Back',     'Back'),
  ('Lower Back',   'Back'),
  ('Front Delt',   'Shoulder'),
  ('Side Delt',    'Shoulder'),
  ('Rear Delt',    'Shoulder'),
  ('Long Head Biceps',      'Biceps'),
  ('Short Head Biceps',     'Biceps'),
  ('Long Head Triceps',     'Triceps'),
  ('Lateral Head Triceps',  'Triceps'),
  ('Medial Head Triceps',   'Triceps'),
  ('Forearm',      'Forearm'),
  ('Upper Chest',  'Chest'),
  ('Mid Chest',    'Chest'),
  ('Lower Chest',  'Chest'),
  ('Abs',          'Core'),
  ('Obliques',     'Core'),
  ('Quads',        'Legs'),
  ('Hamstrings',   'Legs'),
  ('Glutes',       'Glute'),
  ('Calves',       'Calves')
) AS m(name_en, group_name)
JOIN muscle_group mg ON LOWER(mg.name_en) = LOWER(m.group_name)
ON CONFLICT (name_en) DO NOTHING;

-- Verify muscles:
SELECT m.name_en AS muscle, mg.name_en AS muscle_group
FROM muscle m
JOIN muscle_group mg ON m.group_id = mg.id
ORDER BY mg.name_en, m.name_en;


-- ============================================================
-- exercise_muscle_activation table
-- Stores activation % per exercise per muscle (filled later)
-- ============================================================
CREATE TABLE IF NOT EXISTS exercise_muscle_activation (
  exercise_id  UUID        NOT NULL REFERENCES exercise(id)  ON DELETE CASCADE,
  muscle_id    UUID        NOT NULL REFERENCES muscle(id),
  activation   NUMERIC(5,2) NOT NULL CHECK (activation >= 0 AND activation <= 100),
  PRIMARY KEY (exercise_id, muscle_id)
);

ALTER TABLE exercise_muscle_activation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read exercise_muscle_activation" ON exercise_muscle_activation;
CREATE POLICY "Public read exercise_muscle_activation"
  ON exercise_muscle_activation FOR SELECT USING (true);
