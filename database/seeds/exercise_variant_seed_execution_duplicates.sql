-- =============================================================================
-- Seed: Ausführungs-Dubletten (var-Details) — exercise IDs aus data/new_DB/exercises_rows.csv
-- Im Supabase SQL Editor als Postgres ausführen (nicht anonyme App-Rolle).
-- Voraussetzung: exercise_variant_schema.sql; Lat Pull/Row: exercise_variant_seed_lat_pull_row.sql
--
-- Free+Cable curl: Zusätzlich d70ccdb3-1432-4804-8986-7740fe5aed3f ≈ gleiche Stand-Variante
-- wie 332a451d — nicht mit eindeutigem discriminant in derselben Gruppe; ggf. DB-Duplikat löschen.
-- =============================================================================

BEGIN;

INSERT INTO exercise_variant_group (id, label, notes) VALUES
  ('a1000000-0000-4000-8000-000000000010', 'Lat Pull — Crunch (Kabel)', 'abs crunch: Lat pull vs Lat pull2'),
  ('a1000000-0000-4000-8000-000000000011', 'Bench+Cable — Biceps curl', 'bench : cable 0° vs 180°'),
  ('a1000000-0000-4000-8000-000000000012', 'Bench+Cable — Triceps extension', 'planes lat / l-s / sag'),
  ('a1000000-0000-4000-8000-000000000013', 'Bench+Cable — Brust fly', 'cable height 1–8 / 9–15 / 16–22'),
  ('a1000000-0000-4000-8000-000000000014', 'Bench+Cable — OH Triceps extension', 'planes'),
  ('a1000000-0000-4000-8000-000000000015', 'Free+Cable — Biceps curl', 'stand 0° vs 180°'),
  ('a1000000-0000-4000-8000-000000000016', 'Free+Cable — Triceps extension', 'planes lat / sag'),
  ('a1000000-0000-4000-8000-000000000017', 'Free+Cable — OH Triceps extension', 'planes'),
  ('a1000000-0000-4000-8000-000000000018', 'Bench+FW — Brust press', 'flat vs incl'),
  ('a1000000-0000-4000-8000-000000000019', 'Bench+FW — Schulter rear raise', 'body pos 180° vs sitting'),
  ('a1000000-0000-4000-8000-00000000001a', 'Bench+FW — Skull crusher', 'plane sag vs s-t'),
  ('a1000000-0000-4000-8000-00000000001b', 'Bench+FW — OH Triceps extension', 'Hands used + Plane')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercise_variant_axis (group_id, axis_index, dimension_key, label_de) VALUES
  ('a1000000-0000-4000-8000-000000000010', 1, 'cables_used', 'Cables used'),
  ('a1000000-0000-4000-8000-000000000011', 1, 'bench_cable_angle', 'bench : cable'),
  ('a1000000-0000-4000-8000-000000000012', 1, 'plane', 'planes'),
  ('a1000000-0000-4000-8000-000000000013', 1, 'cable_height', 'Cable height'),
  ('a1000000-0000-4000-8000-000000000014', 1, 'plane', 'planes'),
  ('a1000000-0000-4000-8000-000000000015', 1, 'stand', 'stand'),
  ('a1000000-0000-4000-8000-000000000016', 1, 'plane', 'planes'),
  ('a1000000-0000-4000-8000-000000000017', 1, 'plane', 'planes'),
  ('a1000000-0000-4000-8000-000000000018', 1, 'bench_type', 'Bank (flat / incl)'),
  ('a1000000-0000-4000-8000-000000000019', 1, 'body_pos', 'body pos'),
  ('a1000000-0000-4000-8000-00000000001a', 1, 'plane', 'plane'),
  ('a1000000-0000-4000-8000-00000000001b', 1, 'hands', 'Hands used'),
  ('a1000000-0000-4000-8000-00000000001b', 2, 'plane', 'planes')
ON CONFLICT (group_id, axis_index) DO NOTHING;

-- Member zuerst löschen (gleicher Grund wie lat_pull_row.sql): UNIQUE (group_id, discriminant)
DELETE FROM exercise_variant_member
WHERE group_id IN (
  'a1000000-0000-4000-8000-000000000010',
  'a1000000-0000-4000-8000-000000000011',
  'a1000000-0000-4000-8000-000000000012',
  'a1000000-0000-4000-8000-000000000013',
  'a1000000-0000-4000-8000-000000000014',
  'a1000000-0000-4000-8000-000000000015',
  'a1000000-0000-4000-8000-000000000016',
  'a1000000-0000-4000-8000-000000000017',
  'a1000000-0000-4000-8000-000000000018',
  'a1000000-0000-4000-8000-000000000019',
  'a1000000-0000-4000-8000-00000000001a',
  'a1000000-0000-4000-8000-00000000001b'
);

-- Crunch
INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000010', '15c91401-dc97-4802-b497-54d24d79925d', true,  '{"cables_used": 1}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000010', 'ca1ac485-c5ad-4314-8d0a-4849db150506', false, '{"cables_used": 2}'::jsonb, 1);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000011', '2763d7a3-edd9-4109-b4c9-b614066e72e3', true,  '{"bench_cable_angle": 180}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000011', '4c3f10d1-dd93-491c-ba7f-10fdfe971628', false, '{"bench_cable_angle": 0}'::jsonb, 1);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000012', '49e6b7f1-77d1-4633-9e41-5a282cf69d47', true,  '{"plane": "ls"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000012', '906fd428-0187-425b-90c6-ec64357a8e62', false, '{"plane": "sag"}'::jsonb, 1),
  ('a1000000-0000-4000-8000-000000000012', 'edbb69b4-1f27-429d-93b3-2654d3a3f776', false, '{"plane": "lat"}'::jsonb, 2);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000013', '7f82cfec-ebb2-4a63-8409-b8737f05e075', false, '{"cable_height": "1_8"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000013', '13519442-949c-497a-a1ba-0699a26b9d9e', true,  '{"cable_height": "9_15"}'::jsonb, 1),
  ('a1000000-0000-4000-8000-000000000013', '4fc4c4f7-f39a-44d7-baa2-d654ca2639a9', false, '{"cable_height": "16_22"}'::jsonb, 2);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000014', '27d4fbaf-d9b3-46c0-ba2e-07719c54cf43', false, '{"plane": "sag"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000014', '50f86a78-95d1-4521-91c0-ecaa3d86d78c', false, '{"plane": "lat"}'::jsonb, 1),
  ('a1000000-0000-4000-8000-000000000014', 'e0725795-5708-49bc-ad7f-b3149c6feb5c', true,  '{"plane": "ls"}'::jsonb, 2);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000015', '332a451d-2048-4500-99eb-8c13b3f37579', true,  '{"stand": "0"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000015', '6d3cfaae-7d72-44e3-bb38-a3de5970085b', false, '{"stand": "180"}'::jsonb, 1);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000016', '5defc1c9-ab8d-427a-8c4e-d055fd6ab823', true,  '{"plane": "sag"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000016', '4aeced89-4339-4bf4-9a25-5df484b35b18', false, '{"plane": "lat"}'::jsonb, 1);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000017', '307f2e6f-4403-4ed6-8805-25099c660dce', true,  '{"plane": "ls"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000017', 'a79a30bd-d721-4117-a45c-6fbd44152dfb', false, '{"plane": "lat"}'::jsonb, 1),
  ('a1000000-0000-4000-8000-000000000017', 'e4236f7e-d066-4d5e-a76a-777eeea053de', false, '{"plane": "sag"}'::jsonb, 2);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000018', '4db67245-b612-4968-a378-f90f3f87a6a2', true,  '{"bench_type": "flat"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000018', '6bf8b940-db1a-4dc9-8828-74356b543ff0', false, '{"bench_type": "incl"}'::jsonb, 1);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000019', '20f6c002-84d1-41d3-8d24-d11630b75f28', true,  '{"body_pos": "sitting"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-000000000019', '8730ed42-c32e-4961-aadd-4faaf44731c7', false, '{"body_pos": "180"}'::jsonb, 1);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-00000000001a', 'e7f73fec-4b61-4cf5-8e74-85b5c0068b70', true,  '{"plane": "sag"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-00000000001a', '3d4519b0-2dcd-4445-a060-877feb2ceeca', false, '{"plane": "st"}'::jsonb, 1);

INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order) VALUES
  ('a1000000-0000-4000-8000-00000000001b', 'a4d76f8e-8767-41ac-9dd4-87604a5ff16b', true,  '{"hands": 2, "plane": "ls"}'::jsonb, 0),
  ('a1000000-0000-4000-8000-00000000001b', '8446f2f9-a451-46c8-89bd-f97312313f96', false, '{"hands": 2, "plane": "lat"}'::jsonb, 1),
  ('a1000000-0000-4000-8000-00000000001b', 'd386d043-89e7-4b41-8edb-b9ddc29efa5b', false, '{"hands": 1}'::jsonb, 3);

-- „hands 2 + plane sag“: Export-UUID kann in Supabase anders sein → passende Zeile aus exercises wählen
INSERT INTO exercise_variant_member (group_id, exercise_id, is_default_entry, discriminant, sort_order)
SELECT
  'a1000000-0000-4000-8000-00000000001b',
  e.id,
  false,
  '{"hands": 2, "plane": "sag"}'::jsonb,
  2
FROM exercises e
JOIN muscles m ON m.id = e.muscle_id
WHERE e.exercise_name = 'overhead extension'
  AND m.name_en ILIKE '%triceps%'
  AND e.id NOT IN (
    'a4d76f8e-8767-41ac-9dd4-87604a5ff16b'::uuid,
    '8446f2f9-a451-46c8-89bd-f97312313f96'::uuid,
    'd386d043-89e7-4b41-8edb-b9ddc29efa5b'::uuid
  )
  AND e.place = 'bench'
  AND e.weight_type = 'freeweight'
LIMIT 1;

-- Liefert der SELECT oben keine Zeile (andere Spaltenwerte): in Supabase unter
-- exercises die passende „overhead extension“-Bench+FW-Zeile suchen und manuell einfügen:
-- INSERT INTO exercise_variant_member (...) VALUES ('...01b', '<deine-uuid>', false, '{"hands":2,"plane":"sag"}', 2);

COMMIT;
