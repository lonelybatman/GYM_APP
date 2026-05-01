## Annotation Strategie — Segmentierung mit SAM

---

### Segmentierung statt Bounding Box

Für jede Komponente wird eine **pixelgenaue Maske** gezeichnet — nicht nur ein Rechteck.

**Warum:** Die KI lernt die exakte Form der Komponente, nicht eine ungefähre Box die auch Rahmenteile und Hintergrund enthält.

**Wie schnell:** CVAT hat SAM (Segment Anything Model) eingebaut. Du klickst einmal auf eine Komponente → SAM zeichnet die Maske automatisch → du korrigierst nur wenn nötig. Kaum langsamer als eine Bounding Box.

---

### Alle Komponenten im Überblick

#### Körperauflage
| Label | Beschreibung | Beispiel |
|---|---|---|
| `pad_backrest` | Langes Rücken- oder Liegepolster | Bank bei Chest Press |
| `pad_sit` | Sitzfläche | Kurzes horizontales Polster |
| `pad_shoulder` | Schulterpolster | Kleine längliche Polster oben |
| `pad_thigh` | Oberschenkelpolster / Fixierung | Knierolle bei Leg Press |

#### Interaktionspunkt
| Label | Beschreibung | Beispiel |
|---|---|---|
| `action_grip` | Griff / Handle | Stange, Hebel, Kabelgriff |
| `action_roller` | Zylindrische Rolle | Beinstrecker, Beinbeuger |
| `action_foot_platform` | Fußplattform | Leg Press, Hack Squat |
| `action_arm_pad` | Arm- oder Ellenbogenpolster | Pec Deck, Reverse Fly |

#### Mechanik
| Label | Beschreibung | Beispiel |
|---|---|---|
| `mech_pivot` | Lager / Drehgelenk Bereich | Achse wo Arm rotiert |
| `mech_lever_arm` | Der bewegliche Hebelarm | Weißer Arm bei Chest Press |
| `mech_weight_stack` | Gewichtsstapel (selectorized) | Plattenturm mit Pin |
| `mech_weight_sleeve` | Gewichtshülse (plate-loaded) | Stange wo Scheiben drauf |
| `mech_cable_pulley` | Kabelrolle / Umlenkrolle | Kabelzug-Maschinen |
| `mech_guide_rail` | Führungsschiene | Leg Press, Hack Squat |

---

### Was sich daraus automatisch ableitet

| Komponenten vorhanden | Abgeleitetes Attribut |
|---|---|
| `pad_backrest` | pad_type: backrest |
| `pad_sit` + `pad_backrest` | pad_type: sit |
| `pad_sit` + `pad_backrest` + `pad_thigh` | pad_type: sit_thigh_pad |
| `mech_weight_stack` | resistance: simple_lever oder complex_lever |
| `mech_cable_pulley` | resistance: linear_cable oder changing_cable |
| `mech_guide_rail` | skeleton_type: linear |
| `mech_pivot` (1x) | joints_count: 1_simple |
| `mech_pivot` (2x) | joints_count: 2_complex |
| `action_grip` | action_point: grip |

Das `machine`-Label braucht dadurch **keine Attribute mehr** — alles wird visuell annotiert.

---

### Workflow pro Bild in CVAT

1. **`R`** → Bounding Box Modus → Box um gesamte Maschine (`machine`)
2. **Segmentierungs-Modus** aktivieren → SAM-Tool wählen
3. Auf jede Komponente klicken → SAM generiert Maske → Label vergeben
4. Reihenfolge: erst Pad-Komponenten, dann Action, dann Mechanik
5. **`N`** → Skelett-Modus → Keypoints setzen (pivot, action_point, pin, support)
6. Verdeckte Keypoints mit **`O`** markieren
7. **`F`** → nächstes Bild

---

### Hinweise

- `mech_pivot` als Maske um den gesamten Lagerbereich zeichnen (nicht nur einen Punkt) — der Keypoint `pivot` im Skelett markiert dann die exakte Mitte
- `mech_lever_arm` umfasst den gesamten beweglichen Arm — von Pivot bis Action Point
- Wenn eine Komponente verdeckt ist: weglassen (keine Maske) — verdeckte Flächen kann SAM nicht sinnvoll segmentieren
- Kleine Komponenten (z.B. Kabelrolle) trotzdem annotieren — auch wenn sie klein wirken
