## Neuer Ansatz — Komponentenbasierte Maschinenanalyse

---

### Warum der neue Ansatz

Bounding Boxes sind ungenau — sie decken immer auch Teile ab die nicht zur Komponente gehören. Die KI lernt dadurch Rauschen mit.

Der neue Ansatz setzt auf **pixelgenaue Segmentierungsmasken** für jede einzelne Komponente, kombiniert mit einem **Active Learning Loop** der den Annotationsaufwand mit der Zeit drastisch reduziert.

---

### Kernprinzip: Die Maschine als Baukastensystem

Statt eine Maschine als Ganzes zu klassifizieren, lernt die KI die **Bausteine** — und leitet daraus alle relevanten Informationen ab:

```
Komponenten erkannt
        ↓
pad_sit + pad_backrest + action_grip (front) + mech_weight_stack
        ↓
→ Skeleton: rot_simple
→ Resistance: simple_lever
→ pad_type: sit
→ action_point: grip / front
```

Keine manuellen Attribute mehr nötig — alles wird aus den visuellen Komponenten abgeleitet.

---

### Die drei Ebenen pro Bild

```
Ebene 1 — Maschine gesamt
    Bounding Box als Referenzrahmen

Ebene 2 — Komponenten (Segmentierungsmasken)
    Pixelgenaue Masken für jede Komponente

Ebene 3 — Physik (Keypoints)
    Skelett-Punkte für die Physik-Engine
```

---

### Dateien in diesem Ordner

- `Annotation Strategie.md` — Komponenten, SAM, Workflow
- `Modelle & Training.md` — Modell-Architektur, YOLOv8-seg, YOLOv8-pose
- `Active Learning.md` — Wie der Loop funktioniert und Annotationsaufwand sinkt
- `3D Rekonstruktion.md` — Tiefenschätzung mit DepthAnything V2
