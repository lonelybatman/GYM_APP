## CVAT Setup — Labels, Attribute & Skelette anlegen

---

## Vorbereitung

- CVAT läuft via Docker
- Erstes Projekt ist bereits erstellt
- Öffne dein Projekt und gehe zu **"Edit Labels"**

---

## Schritt 1 — Erstes Label anlegen: `machine`

Dieses Label wird als **Bounding Box** über die gesamte Maschine gezogen.

1. Klicke auf **"Add label"**
2. Name: `machine`
3. Typ: **Rectangle** (Bounding Box)
4. Farbe: beliebig

---

## Schritt 2 — Attribute zum Label `machine` hinzufügen

Für jedes Attribut: Klicke auf **"Add attribute"** innerhalb des `machine`-Labels.

> `skeleton_type` wird **nicht** als Attribut geführt — der Skelett-Typ ergibt sich direkt aus dem Skelett-Label das du pro Bild setzt (`skel_rot_simple`, `skel_rot_complex`, `skel_linear`). Alle 3 Skelette existieren im selben Projekt und du wählst pro Maschine einfach das passende aus.

### Attribut 1: `resistance`
| Feld  | Wert                                                              |
| ----- | ----------------------------------------------------------------- |
| Name  | `resistance`                                                      |
| Typ   | `Select`                                                          |
| Werte | `simple_lever`, `complex_lever`, `linear_cable`, `changing_cable` |

---

### Attribut 2: `pad_type`
| Feld | Wert |
|---|---|
| Name | `pad_type` |
| Typ | `Select` |
| Werte | `backrest`, `sit`, `shoulder_pad`, `thigh_pad`, `sit_thigh_pad`, `none` |

---

### Attribut 3: `action_point`
| Feld  | Wert                                     |
| ----- | ---------------------------------------- |
| Name  | `action_point`                           |
| Typ   | `Select`                                 |
| Werte | `grip`, `foot_platform`, `roller`, `pad` |

---

### Attribut 4: `grip_position`
| Feld  | Wert                                                         |
| ----- | ------------------------------------------------------------ |
| Name  | `grip_position`                                              |
| Typ   | `Select`                                                     |
| Werte | `front`, `rear`, `side`, `overhead`, `shoulderheight`, `n/a` |

---

### Attribut 5: `roller_position`
| Feld  | Wert                                                                                     |
| ----- | ---------------------------------------------------------------------------------------- |
| Name  | `roller_position`                                                                        |
| Typ   | `Select`                                                                                 |
| Werte | `shoulder_raise`, `fly`, `r_fly`, `leg_ext`, `leg_curl`, `back_ext`, `hip_thrust`, `n/a` |

---

### Attribut 6: `pad_position`
| Feld  | Wert                                                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| Name  | `pad_position`                                                                                                               |
| Typ   | `Select`                                                                                                                     |
| Werte | `shoulder_raise`, `fly`, `r_fly`, `leg_ext`, `leg_curl`, `pull_over`, `leg_abduction`, `leg_adduction`, `calve_raise`, `n/a` |

---

### Attribut 7: `joints_count`
| Feld  | Wert                    |
| ----- | ----------------------- |
| Name  | `joints_count`          |
| Typ   | `Select`                |
| Werte | `1_simple`, `2_complex` |

---

Speichern nicht vergessen: **"Continue"** oder **"Submit"** klicken.

---

## Schritt 3 — Skelette anlegen

Jetzt legst du die 3 Skelett-Labels an. Jedes ist ein eigenes Label vom Typ **Skeleton**.

---

### Skelett 1: `skel_rot_simple`

1. Klicke auf **"Add label"**
2. Name: `skel_rot_simple`
3. Typ: **Skeleton**

Dann die Keypoints in dieser Reihenfolge hinzufügen (je **"Add point"**):

| Nr. | Name | Bedeutung |
|---|---|---|
| 1 | `pivot` | Drehpunkt / Kugellager |
| 2 | `action_point` | Griff, Rolle oder Polster |
| 3 | `pin` | Gewichtspin im Stapel |
| 4 | `support_top` | Rahmen oben / Lehne oben |
| 5 | `support_bottom` | Rahmen unten / Lehne unten |

Verbindungen (Edges) zwischen den Punkten:
- `pivot` → `action_point`
- `pivot` → `pin`
- `support_top` → `support_bottom`

---

### Skelett 2: `skel_rot_complex`

1. Klicke auf **"Add label"**
2. Name: `skel_rot_complex`
3. Typ: **Skeleton**

Keypoints:

| Nr. | Name | Bedeutung |
|---|---|---|
| 1 | `pivot_1` | Erster Drehpunkt (Rahmen-nah) |
| 2 | `pivot_2` | Zweiter Drehpunkt (Arm-nah) |
| 3 | `action_point` | Griff oder Polster |
| 4 | `pin` | Gewichtspin im Stapel |
| 5 | `support_top` | Rahmen oben |
| 6 | `support_bottom` | Rahmen unten |

Verbindungen:
- `pivot_1` → `pivot_2`
- `pivot_2` → `action_point`
- `pivot_1` → `pin`
- `support_top` → `support_bottom`

---

### Skelett 3: `skel_linear`

1. Klicke auf **"Add label"**
2. Name: `skel_linear`
3. Typ: **Skeleton**

Keypoints:

| Nr. | Name | Bedeutung |
|---|---|---|
| 1 | `rail_start` | Startpunkt der Schiene / obere Umlenkrolle |
| 2 | `rail_end` | Endpunkt der Schiene / untere Führung |
| 3 | `action_point` | Griff oder Fußplattform |
| 4 | `pin` | Gewichtspin im Stapel |
| 5 | `support` | Hauptrahmen / Stütze |

Verbindungen:
- `rail_start` → `rail_end`
- `rail_start` → `action_point`
- `rail_start` → `pin`

---

## Schritt 4 — Task erstellen & Bilder hochladen

Pro Maschine werden **3 Fotos** aus festen Winkeln aufgenommen, bevor sie in CVAT geladen werden:

| Foto | Winkel | Zweck |
|---|---|---|
| `_front.jpg` | 0° Frontal | Gesamtgeometrie, Referenzpunkt |
| `_diag.jpg` | 45° Diagonal | 3D-Struktur, verdeckte Teile |
| `_side.jpg` | 90° Seite | Exakter Hebelarm für die Physik |

**Empfehlung für die Benennung:** `leg_ext_01_front.jpg`, `leg_ext_01_diag.jpg`, `leg_ext_01_side.jpg` — so bleiben Gruppen zusammen und nachvollziehbar.

1. Gehe zurück zum Projekt
2. Klicke auf **"Create new task"**
3. Name z.B. `rot_simple_batch_01`
4. Alle 3 Fotos einer Maschine gemeinsam hochladen
5. Labels werden automatisch aus dem Projekt übernommen
6. **"Submit & Open"** klicken

> Wichtig: Die 3 Fotos einer Maschine immer im selben Task halten — nie aufteilen.

---

## Schritt 5 — Erste Annotation (Workflow pro Bild)

Pro Maschine alle 3 Bilder annotieren — immer dieselben Keypoints an denselben Bauteilen setzen:

1. **`N`** drücken → Bounding Box Modus
2. Box um die gesamte Maschine ziehen → Label `machine` wählen
3. Attribute rechts im Panel ausfüllen (resistance, pad_type, action_point usw.)
4. **`N`** erneut → Skelett-Modus
5. Passendes Skelett-Label wählen (`skel_rot_simple` etc.)
6. Keypoints setzen (Reihenfolge wie oben definiert)
7. Verdeckte Punkte mit **`O`** als Occluded markieren — nie weglassen
8. **`F`** → nächstes Bild (gleiches Skelett, gleiche Maschine, anderer Winkel)

**Winkel-Hinweise beim Annotieren:**
- **Frontalbild:** Alle Punkte gut sichtbar — als Referenz starten
- **Diagonalbild:** Manche Punkte jetzt klarer (z.B. Pivot von der Seite), manche verdeckt → `O` setzen
- **Seitenbild:** `pivot` und `action_point` hier besonders präzise setzen — dieses Bild wird für die Hebelarm-Berechnung verwendet

---

## Hinweise

- Starte mit **`skel_rot_simple`** — das ist der häufigste Typ und der einfachste Einstieg.
- Qualität vor Quantität: 50 saubere Annotationen bringen mehr als 200 schlechte.
- Konsistenz ist entscheidend: `pivot` immer genau auf die Achsmitte setzen, nicht daneben.
- Wenn ein Keypoint nicht sichtbar ist: trotzdem setzen (ca. Position schätzen) und mit `O` als Occluded markieren. Nie weglassen.
