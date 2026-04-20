-- bench|cable|overhead extension|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":"WAHR*","cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'f47a7f31-e4df-496c-b479-8eeda08de419';

-- bench|cable|overhead extension|EZ bend
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '405b9126-d49d-4bf1-8407-7a9bfc891d61';

-- bench|cable|overhead extension|90° bend
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '4dc264a1-cc80-4d7a-bd36-4f7831954f78';

-- bench|cable|overhead extension|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":"WAHR*","hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":"WAHR*","cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"blickrichtung : Oberarm","bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '91fa1ab0-01cc-4471-b8d7-90c2cc302bcd';

-- bench|cable|overhead extension|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":"WAHR*","cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '238a70e5-c5a1-4bbe-a58c-8a378b43351f';

-- bench|cable|curl|EZ bend
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":"WAHR*","grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '417f440e-3735-4ca4-9447-7cac44c4bb35';

-- bench|cable|curl|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '49c2d4cb-af31-4b18-a90f-38b1ca720905';

-- bench|cable|curl|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'eed2226d-d608-4d92-9403-6967d22f0fb2';

-- bench|cable|curl|staight
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '68a5d249-f98e-45c7-86be-ce1266845112';

-- bench|cable|fly|d-handle fix
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":"WAHR*","grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":true,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":true,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c82b754a-8d5d-46cf-b3b1-2edbc3539bed';

-- bench|cable|archer pull|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '7616540b-d50b-4943-bbe5-485789d1db49';

-- bench|cable|archer pull|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'befd9c6f-17d4-4527-bbdd-9a476045aa74';

-- bench|cable|archer pull|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '451231be-ad50-4aa5-80f7-0a6a56dfa187';

-- bench|cable|archer pull|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'f616ca0d-b81a-4aaa-8b89-1c2f08c1d253';

-- bench|cable|archer pull|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '3574882e-0309-441c-8ea2-1817d89ecd8c';

-- bench|cable|rev fly|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":"WAHR*","bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"info_equipment":"rev. n-grip","bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'c03d2596-02ea-44c7-9453-998216622497';

-- bench|cable|rev fly|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":"WAHR*","bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '934b66dd-ca2b-4ffc-8831-239543e367d7';

-- bench|cable|rev fly|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":"WAHR*","bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'cd3f6905-ae9b-44a1-a1af-f2ce2b96a92c';

-- bench|cable|rev fly|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":"WAHR*","bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":"WAHR*","body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'af2cd30d-f22a-41b2-bffb-b194e79133d7';

-- bench|cable|front raise|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '18038b17-c4ef-4192-b85b-8031241aa751';

-- bench|cable|front raise|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f40d9998-1428-4f07-a181-6bf1367f0aa3';

-- bench|cable|front raise|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c57db42d-a37e-46a2-b5a5-eb8d02938e16';

-- bench|cable|front raise|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '19b8a5fe-2527-49a8-b332-5cc2b4d95978';

-- bench|cable|front raise|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '2b5c8b4c-9c46-4bb4-8ce8-9db2a6973b7e';

-- bench|cable|front raise|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '4b257f92-56d8-443f-9fbb-2a8a3873c405';

-- bench|cable|front raise|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '7b7b0b2f-8530-4b06-b709-576c3bdb0cad';

-- bench|cable|front raise|staight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":true,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '626ca810-1394-4ebb-bdcf-277060d6e7f6';

-- bench|cable|kenan flap|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'f3e0c01f-fb22-48e5-9921-97dd1177ed41';

-- bench|cable|kenan flap|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '85e1376e-5e26-46c6-91df-67df77c01a8e';

-- bench|cable|kenan flap|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '7afee5e9-d55d-4128-8aa5-4489ef382f39';

-- bench|cable|kenan flap|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '9872dc53-5e59-46fe-bfbf-66a2d902ae9a';

-- bench|cable|pull|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":true,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'c0c32de5-ac47-4018-bd0b-8dbb58c1c420';

-- bench|cable|pull|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":true,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '5437978e-6281-46ae-89e1-af3437121a02';

-- bench|cable|pull|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":true,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '3b6e5b43-0ae8-470d-81e8-f0cc2ffcb8ad';

-- bench|cable|pull|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":true,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '10fda4af-0be7-47ce-927a-bea8aed6abb0';

-- lat_pull|cable|pull|neutral wide
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":true,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '1c0579c7-a33e-41b0-af5e-9f11ac3dbe48';

-- lat_pull|cable|pull|mag neutral wide
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '1d8a148d-2b7e-4837-a859-0cb100e852ba';

-- lat_pull|cable|pull|mag neutral middle
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'bb166b72-a864-4198-a11b-e7b1b592c4dc';

-- lat_pull|cable|pull|mag middle n-p
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '5e786819-1c89-4634-aeeb-32e784418ce1';

-- lat_pull|cable|pull|neutral close
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'fd533bcb-554f-40de-810a-534756ff1217';

-- lat_pull|cable|pull|mag close n-s
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '285eff34-c75f-4aa9-83ae-c984400dce6d';

-- free|cable|curl|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":true,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '487c779f-3ea8-4a06-94c5-afb582d4fbd9';

-- lat_row|cable|curl|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'd1ba76e3-6cda-4e94-90f0-b4f04ca42eb0';

-- lat_row|cable|curl|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":"WAHR*","grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b9b97d19-5311-4200-93ec-938f39bc77d6';

-- lat_row|cable|curl|straight
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'a3cbc0ad-cd74-42a5-9e80-32dcb3ef9d19';

-- lat_row|cable|curl|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"conzentration curls?","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '834d0a3a-1d55-4d94-bdc8-b7f7303a7afb';

-- lat_row|cable|curl|ropes
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '485633d6-5071-422d-afa2-88a7331dad7e';

-- lat_row|cable|curl|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":"WAHR*","grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '16908eaa-294d-4124-b6ea-e4406f31ea49';

-- lat_row|cable|extension|straight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b6b6012e-b907-454a-95a3-3deeff22ac5b';

-- lat_row|cable|extension|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'ad34fff5-e5a5-4d4a-b3d1-21d26dd9f40b';

-- lat_row|cable|extension|straight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '3699478e-ea3b-4f1b-aca6-e1695c06e540';

-- bench|cable|extension|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'c5adb124-13af-4504-ad03-bab662bd24b9';

-- bench|cable|extension|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '1effe456-48c7-4505-a88a-9a79905c5d50';

-- bench|cable|extension|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":true,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'd37027a6-6f0d-48b4-946e-f0204a26e31b';

-- free|cable|extension|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":true,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"Default ändert sich wenn 1 Hand used:  ropes = FALSCH, nooses = WAHR, raw = WAHR, cuff = WAHR*","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '961407b6-51b4-43ca-a8c7-16069d2a4691';

-- lat_row|cable|flexion|straight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '9062ba6a-1504-4111-994a-620c20c7d5ce';

-- lat_row|cable|flexion|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '0c95c080-dcc9-4361-8a82-97cfdd4cfa96';

-- bench|cable|fly|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":"WAHR*","grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":true,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":true,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '8557cb84-7027-4b2d-8318-240724475e61';

-- bench|cable|fly|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":"WAHR*","grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":true,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":true,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '7c2f2181-7185-4667-ab24-3db1ca16bc98';

-- bench|cable|fly|d-handle fix
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":"WAHR*","grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":true,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":true,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '66d2f71f-1e05-4d0a-b1c8-21a857522562';

-- bench|cable|fly|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":"WAHR*","grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":true,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":true,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'faf50489-fae9-42ba-a4ac-cac570bd6df0';

-- bench|cable|fly|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":"WAHR*","grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":true,"plane_trans":false,"body_bench_0":"WAHR*","body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":true,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":true,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b88a65e3-36d9-4c6a-aeb8-bb0d93bdcb7c';

-- bench|cable|overhead extension|1rope
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":"WAHR*","cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = '1b196a02-3007-407b-97c3-3700a1800785';

-- bench|cable|overhead extension|cuff
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":true,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":"WAHR*","cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":true,"body_pos_sitting":false}'::jsonb
WHERE id = 'fdd70198-af5e-4b28-8add-5b6b9e9065aa';

-- bench|freeweight|overhead extension|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":true,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":true,"info_equipment":"man nimmt eine Hantel mit beiden Händen. Dabei zeigen die Handflächen nach oben und greifen auf der runden Fläche der Hantel","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '08c53a32-336c-4c25-90f6-756892384574';

-- lat_pull|cable|pull|straight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":"WAHR*","plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":true,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '2f047160-18ce-4b54-8b13-d7344e819a64';

-- lat_pull|cable|pull|long light bend
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":"WAHR*","plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":"WAHR*","bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c92a7250-b8cd-4235-b662-42cc0812498c';

-- bench|freeweight|rear raise|dumbell
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":true,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"bench unter 45° = t-l","bench_cable_180":false,"body_pos_sitting":true}'::jsonb
WHERE id = 'badf77bf-97df-4f8c-907e-76c3de308c16';

-- lat_row|cable|row|straight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":true,"grip_s_n":false,"grip_sup":"WAHR*","stand_45":false,"stand_90":false,"width_x1":"WAHR*","plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":true,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '90858b79-82ff-4329-8065-3b0330ccaf0d';

-- lat_row|cable|row|mag close n-s
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f10df28f-b4b9-4ecf-9580-20a0c7e6215f';

-- lat_row|cable|row|long light bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":"WAHR*","grip_s_n":false,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":"WAHR*","bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '5f895594-88ed-4310-a4bd-1529dec4dd04';

-- lat_row|cable|row|mag neutral wide
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":true,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c2605487-8dbd-466b-a942-8e9703590592';

-- lat_row|cable|row|mag close n-s
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":true,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '12918a41-7105-430a-b9bb-5bf956ebbf31';

-- lat_row|cable|row|d-handle var
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":"WAHR*","grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":true,"plane_sag":"WAHR*","plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":true,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '5a146ecc-d205-49ea-a235-897a28fb8c27';

-- lat_row|cable|row|nooses
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":true,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":true,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '020d46ed-81b1-495b-a124-0344c1135623';

-- free|cable|overhead extension|1rope
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b527b988-9d88-4553-b9f9-39866ecc63c6';

-- free|cable|overhead extension|d-handle fix
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'bb48a9f3-30b4-4428-bbad-e20da8c1e50e';

-- free|cable|overhead extension|d-handle var
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":"WAHR*","hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":"WAHR*","width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"info_equipment":"1=135°, 2=180°","bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '2d22ac30-566c-4bee-a90d-aabf09a6a255';

-- free|cable|overhead extension|EZ bend
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":"WAHR*","grip_pro":false,"grip_s_n":true,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'c17ed9ac-346e-447c-98b7-183fd1df401d';

-- free|cable|overhead extension|nooses
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = true,
  config = '{"sit_0":false,"grip_n":"WAHR*","sit_90":false,"hands_1":true,"hands_2":"WAHR*","stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":true,"grip_s_n":true,"grip_sup":true,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'f173bbf5-07f7-44cb-8024-babfa2873c18';

-- free|cable|overhead extension|raw
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":true,"hands_2":false,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":true,"width_x1":false,"plane_l_s":false,"plane_lat":true,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'b063322c-ec90-4b40-a8fd-dc0e73a545db';

-- free|cable|overhead extension|ropes
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":true,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '4120d8e8-7fd4-4029-b6d4-9942c6c32db6';

-- free|cable|overhead extension|staight
UPDATE equipment_option
SET
  is_default = false,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":false,"stand_0":false,"cables_1":false,"cables_2":false,"grip_n_p":false,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":false,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":false,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":false,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = '03afabc2-cad2-47d0-bf7a-78a869029eb8';

-- free|cable|overhead extension|90° bend
UPDATE equipment_option
SET
  is_default = true,
  is_default_star = false,
  config = '{"sit_0":false,"grip_n":false,"sit_90":false,"hands_1":false,"hands_2":true,"stand_0":false,"cables_1":true,"cables_2":false,"grip_n_p":true,"grip_pro":false,"grip_s_n":false,"grip_sup":false,"stand_45":false,"stand_90":false,"width_x1":false,"plane_l_s":true,"plane_lat":false,"plane_s_t":false,"plane_sag":false,"plane_t_l":false,"stand_135":false,"stand_180":true,"width_x05":false,"width_x15":false,"bench_flat":false,"bench_incl":false,"stand_90os":false,"cable_h_1_8":false,"plane_trans":false,"body_bench_0":false,"body_pos_180":false,"cable_h_9_15":true,"bench_cable_0":false,"bench_upright":false,"body_bench_45":false,"body_bench_90":false,"cable_h_16_22":false,"bench_cable_90":false,"body_bench_135":false,"body_bench_180":false,"body_pos_lying":false,"bench_cable_180":false,"body_pos_sitting":false}'::jsonb
WHERE id = 'bb67844d-4663-42d0-82d3-65fe1191c94e';
