## Skel_Linear — Kabelzug / Geführte Schiene

Keine Rotation. Der Widerstand wirkt entlang einer geraden oder durch eine Umlenkrolle geführten Linie. Bei `changing_cable` verändert sich der Hebelarm durch eine Exzenterscheibe (Cam).

**Physik:** Vektor-Physik auf einer Geraden — `F = m · g` (direkt oder mit Cam-Faktor)

**Typische Maschinen:** Lat Pulldown, Seated Row, Leg Press, Hack Squat, Kabelzugturm

---

### Relevante Attribute

| Attribut | Relevanz | Relevante Werte |
|---|---|---|
| `resistance` | Pflicht | `linear_cable`, `changing_cable` |
| `action_point` | Pflicht | `grip`, `foot_platform` |
| `pad_type` | Pflicht | `backrest`, `sit`, `shoulder_pad`, `thigh_pad`, `none` |
| `grip_position` | Wenn `action_point = grip` | `overhead`, `rear`, `front`, `n/a` |
| `joints_count` | nicht relevant | — |
| `roller_position` | nicht relevant | `n/a` |
| `pad_position` | nicht relevant | `n/a` |

---

### Keypoints

| Keypoint | Beschreibung |
|---|---|
| `Rail_Start` | Startpunkt der Schiene / obere Umlenkrolle |
| `Rail_End` | Endpunkt der Schiene / untere Führung |
| `Action_Point` | Griff oder Fußplattform (Kontakt mit dem Nutzer) |
| `Pin` | Gewichtspin im Stapel |
| `Support` | Hauptrahmen / Stütze |
