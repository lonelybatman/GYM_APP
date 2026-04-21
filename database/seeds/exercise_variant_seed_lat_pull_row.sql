-- =============================================================================
-- Seed: Lat Pull + Lat Row (1 vs 2 Cables) — im Supabase SQL Editor ausführen
-- (als Postgres / Bypass RLS, nicht mit anonymer App-Rolle)
-- =============================================================================
-- IDs aus deinem Projekt (Apr 2026). Falls Kabel-Zuordnung invertiert wirkt,
-- tausche die beiden exercise_id in den INSERTs für exercise_variant_member.
-- =============================================================================

BEGIN;

-- Gruppen (idempotent)
INSERT INTO exercise_variant_group (id, label, notes) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Lat Pull — Cables', '1 vs 2 Kabel → zwei exercises')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercise_variant_group (id, label, notes) VALUES
  ('a1000000-0000-4000-8000-000000000002', 'Lat Row — Cables', '1 vs 2 Kabel → zwei exercises')
ON CONFLICT (id) DO NOTHING;

-- Achsen
INSERT INTO exercise_variant_axis (group_id, axis_index, dimension_key, label_de) VALUES
  ('a1000000-0000-4000-8000-000000000001', 1, 'cables_used', 'Cables used')
ON CONFLICT (group_id, axis_index) DO NOTHING;

INSERT INTO exercise_variant_axis (group_id, axis_index, dimension_key, label_de) VALUES
  ('a1000000-0000-4000-8000-000000000002', 1, 'cables_used', 'Cables used')
ON CONFLICT (group_id, axis_index) DO NOTHING;

-- Vor dem erneuten Einspielen: alte Member entfernen. Sonst verletzt ein UPDATE
-- (vertauschte cables_used) UNIQUE (group_id, discriminant), weil kurz zwei Zeilen
-- dasselbe discriminant hätten.
DELETE FROM exercise_variant_member
WHERE group_id IN (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002'
);

-- Member Lat Pull: 1 Kabel = Place „Lat pull“, 2 Kabel = „Lat pull2“ (vgl. exercises_rows.csv)
INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000001', '2ff05c39-55fd-4817-befb-c91070dbcf75', true,  '{"cables_used": 1}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000001', '5d78b37a-c8e7-464a-a716-fef70371ecc2', false, '{"cables_used": 2}'::jsonb, 1);

-- Member Lat Row
INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000002', 'b42d14f1-0195-4da1-b07a-2ea72d25803c', true,  '{"cables_used": 1}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000002', '1daeea47-278b-4942-ac2f-1ebeab1c713e', false, '{"cables_used": 2}'::jsonb, 1);

COMMIT;

-- Prüfen:
-- SELECT * FROM exercise_variant_member WHERE group_id = 'a1000000-0000-4000-8000-000000000001';
