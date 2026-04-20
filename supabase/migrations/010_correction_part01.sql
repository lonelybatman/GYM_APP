-- free|cable|pushdown|90° bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'ccf05113-d73f-439e-87dd-3200f98f1c43';

-- free|cable|extension|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":"WAHR*","hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":"WAHR*","width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'fb854ba1-a38a-46b4-a051-a9c8241895e7';

-- free|cable|extension|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":"WAHR*","stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'd5dd110c-4c52-4e9f-b228-0d2ff15dae69';

-- free|cable|extension|ropes
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"Default ändert sich wenn 1 Hand used:  ropes = FALSCH, nooses = WAHR, raw = WAHR, cuff = WAHR*","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '16eb9c0f-2e5a-49e1-b998-37a781ab0d37';

-- free|cable|extension|nooses
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":"WAHR*","cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"Default ändert sich wenn 1 Hand used:  ropes = FALSCH, nooses = WAHR, raw = WAHR, cuff = WAHR*","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'd1720859-5fb5-4b97-ade0-fa7f8c877645';

-- free|cable|extension|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"Default ändert sich wenn 1 Hand used:  ropes = FALSCH, nooses = WAHR, raw = WAHR, cuff = WAHR*","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'aa34b093-870f-4538-a0d4-37a15c75a797';

-- free|cable|extension|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '322223b3-ead5-47c9-b13b-3d17d720ed56';

-- free|cable|extension|90° bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '16c961eb-63fe-47fd-a09a-115c9c007eaf';

-- free|cable|extension|staight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f2835e27-19ab-490b-a0fd-dfe80c215196';

-- free|cable|overhead extension|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f7dbeeed-7924-4c70-bc93-fb71bf9482ac';

-- free|cable|overhead extension|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '23d0180d-b3c6-447b-afde-aff4344c319f';

-- free|cable|fly|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":"WAHR*","width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":true,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":true,"cable_h_1_8":true,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '7c58fc49-2580-4a6b-bac8-ee06ae3edb93';

-- free|cable|fly|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":"WAHR*","stand_45":false,"stand_90":"WAHR*","width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":true,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":true,"cable_h_1_8":true,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f7a0c38e-a075-443e-a285-545d546db600';

-- free|cable|lateral raise|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'baccf4ca-2fb7-4257-b33c-b31966b0eb9c';

-- free|cable|lateral raise|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '457b70ea-244a-4535-ae69-f08cfc5af7cc';

-- free|cable|front row|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":"WAHR*","cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '5a9c9f00-5eaa-4967-83bb-859d1f6894b8';

-- free|cable|front row|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":"WAHR*","cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '34734e05-87d0-461e-821a-a1fccafae895';

-- free|cable|front row|ropes
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":"WAHR*","cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"n-p = neutral greifen aber handgelenke während der Ausführung nach außen rotieren lassen, pro = köpfe mit pro Griff halten","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '4754d325-5afa-421b-9340-8533732be5b0';

-- free|cable|front row|staight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '9c76a1f3-27df-4408-8c00-c710bfa96244';

-- free|cable|archer pull|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":true,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '73103f16-cccf-4e51-bd80-b5477a38e748';

-- free|cable|archer pull|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":true,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'de36c2ab-03b5-47bb-98b0-e5aecfb6b247';

-- free|cable|archer pull|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":true,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f528b347-5abe-444c-b0d3-de261dc34700';

-- free|cable|archer pull|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":true,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '8cc65022-5bac-4b1d-9f2a-f693032515be';

-- free|cable|front raise|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '8815af00-29e7-4c0a-bd77-32bb0926105c';

-- free|cable|front raise|ropes
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '8363dc3d-3357-4983-8637-5e9fdc88e814';

-- free|cable|front raise|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'a23e0383-4f01-4ece-8e84-f282f9da115c';

-- free|cable|front raise|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f2441b42-e4ca-448e-8f2e-bedc3f3a5c73';

-- free|cable|front raise|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '30759df8-e5b0-432b-9b94-72117b184e2b';

-- free|cable|front raise|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'bf1fd22b-7543-43ef-a974-e636e487655b';

-- free|cable|front raise|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '318ba8ff-5a23-47ce-8743-82989ba2a7d9';

-- free|cable|front raise|90° bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b027d771-1360-4832-9811-71d796cfc5c7';

-- free|cable|front raise|staight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":"WAHR*","width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '95d81d94-3c79-464b-9b3a-00ae1d8aa3f0';

-- free|cable|curl|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":"WAHR*","hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '3540cf0e-b784-4d64-971b-b33a83537c14';

-- free|cable|curl|ropes
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":"WAHR*","stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '4b56729f-1f5e-448c-b583-4f4e0b360bf0';

-- free|cable|curl|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c43885e2-8679-41ff-aef6-9b47a706940d';

-- free|cable|curl|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":true,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '26b5f8d6-1bd0-45c9-8c8d-93b52a9022ce';

-- free|cable|Bayesian curl|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '2d868332-f2eb-4f1b-bdbc-af7885a0dd90';

-- free|cable|Bayesian curl|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '6c01bd6b-1634-4fe8-a7a6-3e62b821499e';

-- free|cable|crossbody curl|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":"WAHR*","width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":true,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"1 = 90 os, 2 = 90","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '1ea40fb7-2155-4bc2-abbc-39e96cb330da';

-- free|cable|face pull|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":true,"grip_n":"WAHR*","sit_90":false,"hands_1":false,"hands_2":true,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '04ae0277-6160-444f-ab7a-09bdde9ef48f';

-- bench|freeweight|overhead extension|ez bar
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":true,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '097b5a4d-91a8-4237-b765-527c83ac68f2';

-- bench|freeweight|skull crusher|ez bar
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":"WAHR*","bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c1268fae-245d-4524-8bc2-09db6232aa00';

-- bench|freeweight|skull crusher|nose bar
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":"WAHR*","bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b468825b-065a-40d4-b6a0-5ebf2d738401';

-- bench|freeweight|skull crusher|barbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":"WAHR*","bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c65b9f1c-d52a-4144-b518-bcdab6b0a578';

-- bench|freeweight|curl|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":true,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"info_equipment":"arm auf der Bank abstützen und curls machen","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '21324cd1-fbfb-43d4-923c-41d4d328c03f';

-- bench|freeweight|concentration curl|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":true,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"der Anfang vom Trizeps auf der seite vom Ellenbogen liegt auf der Innenseite des Beines auf","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '811c4ca8-2821-45cd-aede-9a0cb22572cd';

-- bench|freeweight|spider curl|ez bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":true,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b455a272-d220-4f73-8454-b5065c15636a';

-- bench|freeweight|spider curl|nose bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":true,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '8125910c-236f-47b6-bb90-ca1255d04886';

-- bench|freeweight|spider curl|barbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":true,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'fb6635fc-8600-4888-b7ae-0d1708a3d5aa';

-- bench|freeweight|fly|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":"WAHR*","bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":"WAHR*","body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"info_equipment":"15°-30° Bench Winkel für obere Brust","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'da8fcf82-6d2a-4280-829d-23bc15926c03';

-- bench|freeweight|press|nose bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":"WAHR*","grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"B6 sup x0.5","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '923614ef-8228-4ccf-ad8d-cf44980c17a1';

-- bench|freeweight|press|barbell
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c1984a57-4dd7-4171-9bfc-7ebfb73349b2';

-- bench|freeweight|press|dumbell
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":"WAHR*","plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '805dda83-bc7d-4b7b-ac9d-144c0328d80a';

-- bench|freeweight|press|nose bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":"WAHR*","grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '02055983-2df5-4222-a6b2-d41d4ca36bce';

-- bench|freeweight|press|barbell
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'a7ba693a-af0f-4093-9e13-664f493e60c5';

-- bench|freeweight|kelso shrugg|dumbell
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":"WAHR*","stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":true,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"B45°  bodypos=180° mit ausgestreckten Beinen","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '9e9d0018-915a-48a0-a2cb-066028052165';

-- bench|freeweight|kelso shrugg|barbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":"WAHR*","bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":"WAHR*","body_bench_0":false,"body_pos_180":true,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"bei trans auf einer erhöhten flat bench wo man die Arme ausstrecken kann","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '5c37dd36-741b-4a68-83e1-61460925e3ac';

-- bench|freeweight|shrugg|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"dumbells seitlich von dein Beinen. Da man nur die Schultern nach oben zieht braucht man keine plane","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '67dd2fb4-f8e5-47d7-917e-103e01f39ac1';

-- bench|freeweight|lateral raise|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = 'e79f8192-358a-4f0e-85d2-24220ca6bfd3';

-- bench|freeweight|Y raise|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":true,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":"WAHR*","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '1a087f47-9cb2-4339-96aa-c55d19f5b691';

-- bench|freeweight|front raise|ez bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":true,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '17c0191e-f85b-4524-9016-ffa84f9ebb76';

-- bench|freeweight|front raise|nose bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":true,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = 'd3f7a334-6f66-4995-aef6-a9e81c0f48f8';

-- bench|freeweight|front raise|barbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":true,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":true,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '18bbb005-e6b2-4fc0-82ba-5730ac0f23aa';

-- bench|freeweight|flexion|ez bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"knieend und sitzend möglich","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = 'ecef1324-fa15-425c-b58e-a470ee85070f';

-- bench|freeweight|flexion|nose bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":"WAHR*","width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"knieend und sitzend möglich","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = 'b48df3f5-dd46-4a27-a854-f50afe150f03';

-- bench|freeweight|flexion|barbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"knieend und sitzend möglich","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '26d8f63e-4b1d-444e-9a40-ce1d9eb97d00';

-- bench|freeweight|extension|ez bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"knieend und sitzend möglich","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '21825cfa-fe84-4601-9018-4456011d9335';

-- free|cable|extension|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '6e32e4ee-c626-4949-beb5-6f685a55d10b';

-- bench|freeweight|extension|nose bar
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":"WAHR*","width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"knieend und sitzend möglich","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '19a6cfc2-8830-4d6b-8014-fc15754b0f33';

-- bench|freeweight|extension|barbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":true,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"knieend und sitzend möglich","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = '1247d9dd-acd9-4cff-9da7-b4a20d7a3ffa';

-- bench|cable|pushdown|staight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'd18be3cc-9123-4979-864d-a76eb78afc70';

-- bench|cable|extension|d-handle var
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":"WAHR*","hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":true,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '06b6edf7-00e7-4fa8-9878-1e60d13338e4';

-- bench|cable|extension|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '2b28fe36-64bf-40fb-9121-20f5488153d0';

-- bench|cable|extension|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'e2bab0eb-9678-4528-a0f8-f3e75b269948';

-- bench|cable|extension|nooses
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"da kann man Fäuste machen und diese in die Schlaufen einharken","bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'f3166fbf-d117-4ee1-8d83-19e48468c9d2';

-- bench|cable|extension|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'd69150d8-d8fc-4f33-a83b-93e1cde68da1';

-- bench|cable|extension|cuff
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":true,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '7249255c-87fd-4204-ae51-36db30831f7a';

-- bench|cable|extension|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '51918182-38cc-4e1c-8a83-8824e0d29dc7';

-- bench|cable|extension|90° bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f9e6e89b-b5c0-460f-9b89-55860b9a2d5a';

-- bench|cable|extension|staight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b858cba7-4069-4363-aab7-702e13b23155';

-- bench|cable|curl|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":"WAHR*","hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'fe6cf4ec-72d6-4eec-85d1-0c5c611eb61f';

-- bench|cable|overhead extension|ropes
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '6369bcd7-85cf-44bf-8671-d679aed68933';

-- bench|cable|overhead extension|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'd1af3cda-52d6-43be-b1f2-56274bedb2cc';

-- bench|cable|overhead extension|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":"WAHR*","cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '31df3bc3-4c6d-4d16-8859-dbb840c90a63';
