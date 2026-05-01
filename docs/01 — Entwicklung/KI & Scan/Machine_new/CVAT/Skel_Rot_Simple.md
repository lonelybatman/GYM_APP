## Skel_Rot_Simple — Einfacher Rotationsarm

Ein einziger Drehpunkt (Pivot). Der Hebelarm dreht sich um diesen Punkt, der Widerstand ändert sich je nach Winkel.

**Physik:** `M = F · r · sin(θ)`

**Typische Maschinen:** Beinstrecker, Beinbeuger, einfache Chest Press, Shoulder Raise, Hip Thrust (Hebelarm)

---

### Relevante Attribute

| Attribut | Relevanz | Relevante Werte |
|---|---|---|
| `resistance` | Pflicht | `simple_lever` |
| `joints_count` | Pflicht | `1_simple` |
| `action_point` | Pflicht | `grip`, `roller`, `pad`, `foot_platform` |
| `pad_type` | Pflicht | `backrest`, `sit`, `sit_thigh_pad`, `thigh_pad`, `shoulder_pad`, `none` |
| `grip_position` | Wenn `action_point = grip` | `front`, `rear`, `side`, `overhead`, `shoulderheight`, `n/a` |
| `roller_position` | Wenn `action_point = roller` | `leg_ext`, `leg_curl`, `shoulder_raise`, `hip_thrust`, `back_ext`, `n/a` |
| `pad_position` | Wenn `action_point = pad` | `leg_ext`, `leg_curl`, `pull_over`, `calve_raise`, `n/a` |

---

### Keypoints

| Keypoint | Beschreibung |
|---|---|
| `Pivot` | Drehpunkt / Kugellager |
| `Action_Point` | Griff, Rolle oder Polster (Kontakt mit dem Nutzer) |
| `Pin` | Gewichtspin im Stapel |
| `Support_Top` | Oberes Ende des Rahmens / Lehne oben |
| `Support_Bottom` | Unteres Ende des Rahmens / Lehne unten |
