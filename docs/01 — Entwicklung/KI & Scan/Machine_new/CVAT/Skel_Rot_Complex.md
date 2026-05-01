## Skel_Rot_Complex — Komplexer Hebelarm (Viergelenk)

Zwei Drehpunkte (Pivot_1, Pivot_2), die ein Parallelogramm oder eine Koppelkurve bilden. Der Hebelarm verhält sich nicht-linear über die Bewegungsbahn.

**Physik:** Koppelkurven-Physik (Viergelenk)

**Typische Maschinen:** Pec Deck / Fly, Reverse Fly, komplexe Chest Press mit Parallelogramm-Mechanik

---

### Relevante Attribute

| Attribut | Relevanz | Relevante Werte |
|---|---|---|
| `resistance` | Pflicht | `complex_lever` |
| `joints_count` | Pflicht | `2_complex` |
| `action_point` | Pflicht | `grip`, `pad` |
| `pad_type` | Pflicht | `backrest`, `sit` |
| `grip_position` | Wenn `action_point = grip` | `front`, `side`, `n/a` |
| `pad_position` | Wenn `action_point = pad` | `fly`, `r_fly`, `n/a` |
| `roller_position` | nicht relevant | `n/a` |

---

### Keypoints

| Keypoint | Beschreibung |
|---|---|
| `Pivot_1` | Erster Drehpunkt (näher am Rahmen) |
| `Pivot_2` | Zweiter Drehpunkt (näher am Arm) |
| `Action_Point` | Griff oder Polster (Kontakt mit dem Nutzer) |
| `Pin` | Gewichtspin im Stapel |
| `Support_Top` | Oberes Ende des Rahmens |
| `Support_Bottom` | Unteres Ende des Rahmens |
