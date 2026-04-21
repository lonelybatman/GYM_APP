-- =============================================================================
-- exercise_variant_* — Zusammenhang von Ausführungsvarianten (gleicher Builder)
-- =============================================================================
-- Ziel: Kein Hardcoding im App-Code, welche exercises „sich umschalten“.
--
-- Klarstellung: Place / weight_type / exercise_name können in der DB pro Zeile
-- unterschiedlich sein (z. B. lat_pull vs lat_pull2). In der App bleibt die
-- Darstellung einheitlich; gewechselt wird die zugrunde liegende exercise_id,
-- dadurch ändern sich die erlaubten Detail-Optionen (Equipment-Configs).
--
-- Konzept:
--   exercise_variant_group     … eine logische „Familie“
--   exercise_variant_axis      … var-Detail Achsen, sortiert (axis_index)
--   exercise_variant_member    … eine DB-Zeile exercises + discriminant JSON
--
-- discriminant-Beispiele (alle Keys müssen in exercise_variant_axis vorkommen):
--   {"cables_used": 1}
--   {"cables_used": 2}
--   {"hands": 2, "plane": "ls"}
--   {"hands": 1}
--   {"plane": "lat"}
--   {"bench_cable_angle": 180}
--   {"cable_height": "9_15"}
--   {"bench_type": "flat"}
--   {"body_pos": "180"}
--   {"stand": "180"}
--
-- dimension_key Vokabular (an Builder-State / config-utils angelehnt):
--   cables_used       → number 1 | 2
--   hands             → number 1 | 2
--   plane             → string lat | ls | sag | st | trans | tl
--   bench_cable_angle → number 0 | 90 | 180  (Bench + Cable „bench : cable“)
--   cable_height      → string 1_8 | 9_15 | 16_22
--   bench_type        → string flat | incl | upright
--   body_pos          → string lying | 180 | sitting  (Bench + FW)
--   stand             → string 0 | 45 | 90 | 90os | 135 | 180
--
-- Nach dem Anlegen in Supabase: Policies für SELECT (z. B. anon) wie bei exercises.
-- =============================================================================

CREATE TABLE IF NOT EXISTS exercise_variant_group (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label      text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercise_variant_axis (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES exercise_variant_group(id) ON DELETE CASCADE,
  axis_index  int  NOT NULL CHECK (axis_index >= 1),
  dimension_key text NOT NULL,
  label_de    text,
  label_en    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, axis_index),
  UNIQUE (group_id, dimension_key)
);

CREATE INDEX IF NOT EXISTS idx_exercise_variant_axis_group
  ON exercise_variant_axis (group_id);

CREATE TABLE IF NOT EXISTS exercise_variant_member (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES exercise_variant_group(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  is_default_entry boolean NOT NULL DEFAULT false,
  discriminant jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exercise_id),
  UNIQUE (group_id, discriminant)
);

CREATE INDEX IF NOT EXISTS idx_exercise_variant_member_group
  ON exercise_variant_member (group_id);

CREATE INDEX IF NOT EXISTS idx_exercise_variant_member_exercise
  ON exercise_variant_member (exercise_id);

COMMENT ON TABLE exercise_variant_group IS
  'Logische Gruppe von exercises, die im selben Exercise Builder bedient werden.';
COMMENT ON TABLE exercise_variant_axis IS
  'Welche var-Detail-Achsen es gibt und in welcher Reihenfolge (axis_index).';
COMMENT ON TABLE exercise_variant_member IS
  'Zuordnung exercise_id ↔ discriminant; genau eine Zeile pro exercise_id.';

-- -----------------------------------------------------------------------------
-- RLS (anpassen wenn nötig)
-- -----------------------------------------------------------------------------
ALTER TABLE exercise_variant_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variant_axis ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_variant_member ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exercise_variant_group_select_anon" ON exercise_variant_group;
DROP POLICY IF EXISTS "exercise_variant_axis_select_anon" ON exercise_variant_axis;
DROP POLICY IF EXISTS "exercise_variant_member_select_anon" ON exercise_variant_member;

CREATE POLICY "exercise_variant_group_select_anon"
  ON exercise_variant_group FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "exercise_variant_axis_select_anon"
  ON exercise_variant_axis FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "exercise_variant_member_select_anon"
  ON exercise_variant_member FOR SELECT
  TO anon, authenticated
  USING (true);

-- Schreibzugriff typisch nur Admin / Service Role — keine INSERT-Policies für anon.

-- -----------------------------------------------------------------------------
-- Beispiel Lat Pull (Platzhalter-UUIDs durch echte ersetzen):
-- -----------------------------------------------------------------------------
-- INSERT INTO exercise_variant_group (id, label) VALUES
--   ('11111111-1111-1111-1111-111111111111', 'Lat Pull Familie');
--
-- INSERT INTO exercise_variant_axis (group_id, axis_index, dimension_key, label_de)
-- VALUES
--   ('11111111-1111-1111-1111-111111111111', 1, 'cables_used', 'Cables used');
--
-- INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant)
-- VALUES
--   ('11111111-1111-1111-1111-111111111111', '<uuid exercise lat_pull 1 cable>', true, '{"cables_used": 1}'),
--   ('11111111-1111-1111-1111-111111111111', '<uuid exercise lat_pull2 2 cable>', false, '{"cables_used": 2}');
--
-- Lat Row: gleiches Muster mit exercises für „Lat Row“ / „Lat Row 2“.
--
-- App-Integration (nach Datenpflege):
--   • lib/exercise-builder/variant-resolution.ts — discriminant ↔ Builder-State
--   • app/exercise-builder/[exerciseId].tsx — lädt Gruppe, routet per setParams
-- Solange keine Zeilen in exercise_variant_member existieren, ändert sich nichts.
