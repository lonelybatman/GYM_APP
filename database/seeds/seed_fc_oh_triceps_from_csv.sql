-- AUTO-GENERIERT von data/scripts/generate-fc-oh-triceps-sql.mjs
-- Nicht manuell bearbeiten — Skript neu laufen lassen nach CSV-Änderung.
--
-- Voraussetzung: exercises hat u.a. exercise_name, place, weight_type, muscle_id
-- equipment.has is_default_setup als TEXT ('false'|'true'|'star') — nach migration.sql Phase 1–2.
BEGIN;

INSERT INTO exercises (
  id, exercise_name, muscle_id, is_superdefault, place, weight_type
) VALUES (
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'overhead extension',
  '7924cdc2-796f-496b-8a75-c3e0a9593184'::uuid,
  TRUE,
  'free',
  'cable'
)
ON CONFLICT (id) DO UPDATE SET
  exercise_name = EXCLUDED.exercise_name,
  muscle_id = EXCLUDED.muscle_id,
  is_superdefault = EXCLUDED.is_superdefault,
  place = COALESCE(EXCLUDED.place, exercises.place),
  weight_type = COALESCE(EXCLUDED.weight_type, exercises.weight_type);

INSERT INTO exercises (
  id, exercise_name, muscle_id, is_superdefault, place, weight_type
) VALUES (
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'overhead extension',
  '7924cdc2-796f-496b-8a75-c3e0a9593184'::uuid,
  FALSE,
  'free',
  'cable'
)
ON CONFLICT (id) DO UPDATE SET
  exercise_name = EXCLUDED.exercise_name,
  muscle_id = EXCLUDED.muscle_id,
  is_superdefault = EXCLUDED.is_superdefault,
  place = COALESCE(EXCLUDED.place, exercises.place),
  weight_type = COALESCE(EXCLUDED.weight_type, exercises.weight_type);

INSERT INTO exercises (
  id, exercise_name, muscle_id, is_superdefault, place, weight_type
) VALUES (
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'overhead extension',
  '7924cdc2-796f-496b-8a75-c3e0a9593184'::uuid,
  FALSE,
  'free',
  'cable'
)
ON CONFLICT (id) DO UPDATE SET
  exercise_name = EXCLUDED.exercise_name,
  muscle_id = EXCLUDED.muscle_id,
  is_superdefault = EXCLUDED.is_superdefault,
  place = COALESCE(EXCLUDED.place, exercises.place),
  weight_type = COALESCE(EXCLUDED.weight_type, exercises.weight_type);

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'b527b988-9d88-4553-b9f9-39866ecc63c6'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  '1rope',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": false, "grip_pro": false, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": true, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'fb6fafea-1ee8-489b-93d8-2ee0c73c34f3'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  '90° bend',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": true, "grip_pro": false, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'ee85fd79-b286-4a69-98e7-efc49a68808f'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'cuff',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": true, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": true, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": true, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'bb48a9f3-30b4-4428-bbad-e20da8c1e50e'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'd-handle fix',
  'false',
  '{"hands_1": false, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": false, "grip_pro": false, "plane_lat": false, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": false, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": false, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '2d22ac30-566c-4bee-a90d-aabf09a6a255'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'd-handle var',
  'false',
  '{"hands_1": true, "hands_2": true, "grip_sup": false, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": false, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": true, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false, "info_equipment": "1=135°, 2=180°"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'c17ed9ac-346e-447c-98b7-183fd1df401d'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'EZ bend',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": true, "grip_pro": false, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'f173bbf5-07f7-44cb-8024-babfa2873c18'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'nooses',
  'star',
  '{"hands_1": true, "hands_2": true, "grip_sup": true, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": true, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'b063322c-ec90-4b40-a8fd-dc0e73a545db'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'raw',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": true, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": true, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '4120d8e8-7fd4-4029-b6d4-9942c6c32db6'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'ropes',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": false, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '03afabc2-cad2-47d0-bf7a-78a869029eb8'::uuid,
  '307f2e6f-4403-4ed6-8805-25099c660dce'::uuid,
  'staight',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": true, "grip_s_n": false, "grip_n": false, "grip_n_p": false, "grip_pro": true, "plane_lat": false, "plane_l_s": true, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '73571c9d-6601-4192-9e85-435a298d3afb'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  '1rope',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false, "info_equipment": "1=90°, wenn das ausgewählt dann kommt eine weitere Auswahlmöglichkeit dazu: knieend"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'bb67844d-4663-42d0-82d3-65fe1191c94e'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  '90° bend',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": true, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '34b596d8-b01f-407c-9d88-5fe8ea81fc55'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'cuff',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": false, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false, "info_equipment": "1=90°, wenn das ausgewählt dann kommt eine weitere Auswahlmöglichkeit dazu: knieend"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '3b4dc173-e6ff-418b-ae72-362c5ff8893a'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'd-handle fix',
  'false',
  '{"hands_1": false, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": false, "grip_pro": false, "plane_lat": false, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": false, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": false, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'b10b1892-b129-4ff9-9a7c-d87c1b3f654f'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'd-handle var',
  'false',
  '{"hands_1": true, "hands_2": true, "grip_sup": false, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false, "info_equipment": "1=90°, wenn das ausgewählt dann kommt eine weitere Auswahlmöglichkeit dazu: knieend"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '75e8def6-18be-42e9-9895-3287329073f9'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'EZ bend',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": true, "grip_n": false, "grip_n_p": true, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '960dc352-790f-481e-9342-1f3ffc2285b2'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'nooses',
  'false',
  '{"hands_1": true, "hands_2": true, "grip_sup": false, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '3fa7b172-04d5-4781-833f-36550ed998fe'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'raw',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false, "info_equipment": "1=90°, wenn das ausgewählt dann kommt eine weitere Auswahlmöglichkeit dazu: knieend"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'd70a1cd9-8045-4dde-962c-1d805944bbec'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'ropes',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": false, "plane_lat": true, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '1f759f58-aa43-491d-910a-19c1e0df088c'::uuid,
  'a79a30bd-d721-4117-a45c-6fbd44152dfb'::uuid,
  'staight',
  'false',
  '{"hands_1": false, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": false, "grip_pro": false, "plane_lat": false, "plane_l_s": false, "plane_sag": false, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": false, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": false, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '23d0180d-b3c6-447b-afde-aff4344c319f'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  '1rope',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": false, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '84665e88-57a9-4b6d-af8b-ab00bd169504'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  '90° bend',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": false, "grip_n": false, "grip_n_p": true, "grip_pro": false, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '7148b8fb-b42b-4901-85e3-892a47b60abe'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'cuff',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": true, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": true, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'f7dbeeed-7924-4c70-bc93-fb71bf9482ac'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'd-handle fix',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": true, "grip_s_n": false, "grip_n": false, "grip_n_p": false, "grip_pro": true, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": false, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'f8c32323-e107-4774-8897-8fa0d3bf59b4'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'd-handle var',
  'false',
  '{"hands_1": true, "hands_2": true, "grip_sup": true, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": true, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '5ab32e10-08b7-44b0-910a-b5ef47b5e1e7'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'EZ bend',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": true, "grip_n": false, "grip_n_p": true, "grip_pro": false, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'a1566110-3532-49e7-a75b-dc0401c28af2'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'nooses',
  'false',
  '{"hands_1": true, "hands_2": true, "grip_sup": true, "grip_s_n": true, "grip_n": true, "grip_n_p": true, "grip_pro": true, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'd682318a-bb60-4f76-8beb-96ba4119df20'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'raw',
  'false',
  '{"hands_1": true, "hands_2": false, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": true, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  '87aa0bdc-0725-49ef-9250-38657c412b4e'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'ropes',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": false, "grip_s_n": false, "grip_n": true, "grip_n_p": false, "grip_pro": false, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": true, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

INSERT INTO equipment (
  id, exercise_id, equipment_name, is_default_setup, details
) VALUES (
  'ac0f7571-eb7c-4a99-857b-8ad75d2a9960'::uuid,
  'e4236f7e-d066-4d5e-a76a-777eeea053de'::uuid,
  'staight',
  'false',
  '{"hands_1": false, "hands_2": true, "grip_sup": true, "grip_s_n": false, "grip_n": false, "grip_n_p": false, "grip_pro": true, "plane_lat": false, "plane_l_s": false, "plane_sag": true, "plane_s_t": false, "plane_trans": false, "plane_t_l": false, "width_x05": false, "width_x1": false, "width_x15": false, "cable_h_1_8": false, "cable_h_9_15": true, "cable_h_16_22": false, "bench_flat": false, "bench_incl": false, "bench_upright": false, "stand_0": false, "stand_45": false, "stand_90": false, "stand_90os": false, "stand_135": false, "stand_180": true, "bench_cable_0": false, "bench_cable_90": false, "bench_cable_180": false, "body_bench_0": false, "body_bench_45": false, "body_bench_90": false, "body_bench_135": false, "body_bench_180": false, "body_pos_lying": false, "body_pos_180": false, "body_pos_sitting": false, "sit_0": false, "sit_90": false, "cables_1": true, "cables_2": false}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  equipment_name = EXCLUDED.equipment_name,
  is_default_setup = EXCLUDED.is_default_setup,
  details = EXCLUDED.details;

COMMIT;

-- Anschließend: exercise_variant_schema.sql + exercise_variant_seed_execution_duplicates.sql
-- (falls noch nicht), damit Gruppe …000017 die drei exercise_id verknüpft.