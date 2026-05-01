
| **Attribut-Name**     | **Typ** | **Werte (Dropdown-Optionen)**                                                                                                |
| --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **`pad_type`**        | Select  | `backrest`, `sit`, `shoulder_pad`, `thigh_pad`, `sit_thigh_pad`, `none`                                                      |
| **`action_point`**    | Select  | `grip`, `foot_platform`, `roller`, `pad`                                                                                     |
| **`grip_position`**   | Select  | `front`, `rear`, `side`, `overhead`, `shoulderheight`, `n/a`                                                                 |
| **`roller_position`** | Select  | `shoulder_raise`, `fly`, `r_fly`, `leg_ext`, `leg_curl`, `back_ext`, `hip_thrust`, `n/a`                                     |
| **`pad_position`**    | Select  | `shoulder_raise`, `fly`, `r_fly`, `leg_ext`, `leg_curl`, `pull_over`, `leg_abduction`, `leg_adduction`, `calve_raise`, `n/a` |
| **`joints_count`**    | Select  | `1_simple`, `2_complex`                                                                                                      |
| **`resistance`**      | Select  | `linear_cable`, `changing_cable`, `simple_lever`, `complex_lever`                                                            |
pad_type erkennen
1. lang & horizontal = backrest
2. lang & aufrecht + kurz & horizontal = sit
3. kleine längliche & parallel oben = shoulder_pad
4. kurz & horizontal + kleine längliche darüber = thigh_pad
5. lang & aufrecht + kurz & horizontal + kleine längliche & deckungsgleich darüber = sit_thigh_pad

Action_point
1. Grip (Vektorberechnung oder Drehmoment vom Hebel)
2. foot_platform
3. roller (Drehmoment vom Hebel)
4. pad (seitheben, wadenheben, fly) 


wenn Action_point = Grip, dann nächste Verzweigung Grip_position 
1. front 
2. rear
3. side
4. overhead 
5. shoulderheight

wenn Action_point =  foot_platform, dann nächste Verzweigung guide_rods 
1. guided_platform
2. guided_pad

wenn Action_point =  roller, dann nächste Verzweigung roller_position
1. shoulder_raise
2. fly
3. r_fly
4. leg_ext
5. leg_curl
6. back_ext
7. hip_thrust 

wenn Action_point =  pad, dann nächste Verzweigung pad_position
1. shoulder_raise
2. fly
3. r_fly
4. leg_ext
5. leg_curl
6. pull_over 
7. leg_abduction
8. leg_adduction
9. calve_raise

Wie viele Gelenke je Action_point
1. Simple Rotation 
2. Complex Linkage

Widerstandsprofil 
1. linear cable 
2. changing cable 
3. simple lever
4. complex lever 







