## Modelle & Training

---

### Zwei spezialisierte Modelle

#### Modell A — Komponenten-Detektor (YOLOv8-seg)

Erkennt und segmentiert alle Komponenten der Maschine.

- **Input:** Foto der Maschine (frontal, diagonal oder seitlich)
- **Output:** Segmentierungsmasken + Label für jede erkannte Komponente
- **Daraus abgeleitet:** pad_type, action_point, resistance, skeleton_type — alles automatisch

```python
from ultralytics import YOLO

model_seg = YOLO("yolov8n-seg.pt")  # Segmentierungs-Variante

model_seg.train(
    data="components.yaml",
    epochs=150,
    imgsz=640,
    batch=16,
    device="cuda"
)
```

---

#### Modell B — Physik-Detektor (YOLOv8-pose)

Erkennt die Keypoints für die Physik-Engine. Wird von Modell A unterstützt — da Modell A bereits weiß wo `mech_pivot` und `action_grip` liegen, kann Modell B präziser suchen.

- **Input:** Foto + (optional) Komponenten-Masken aus Modell A
- **Output:** Keypoint-Koordinaten (pivot, action_point, pin, support)
- **Pro Skelett-Typ ein eigenes Modell** (rot_simple, rot_complex, linear)

---

### Ablauf im fertigen System

```
3 Fotos der Maschine
        ↓
Modell A erkennt alle Komponenten + leitet Attribute ab
        ↓
Skelett-Typ wird bestimmt → passendes Modell B geladen
        ↓
Modell B erkennt Keypoints
        ↓
DepthAnything V2 schätzt Tiefe aus den 3 Fotos
        ↓
Triangulation → echte 3D-Keypoint-Positionen
        ↓
Physik-Engine berechnet Widerstandsprofil
```

---

### Modellgröße — Empfehlung

| Phase | Modell | Warum |
|---|---|---|
| Erste Tests | `yolov8n-seg` / `yolov8n-pose` | Schnell, wenig Daten nötig |
| Mehr Daten (100+ Maschinen) | `yolov8s-seg` / `yolov8s-pose` | Bessere Genauigkeit |
| Produktiv | `yolov8m-seg` / `yolov8m-pose` | Optimales Verhältnis Größe/Genauigkeit |

---

### Datensatz-Struktur

```
dataset/
├── components/          ← für Modell A (Segmentierung)
│   ├── train/
│   │   ├── images/
│   │   └── labels/      ← Masken als Polygon-Koordinaten
│   ├── val/
│   └── test/
│
└── keypoints/           ← für Modell B (Pose)
    ├── rot_simple/
    ├── rot_complex/
    └── linear/
```

---

### Evaluation

**Modell A (Segmentierung):**
- **mAP50** — Genauigkeit der Komponenten-Erkennung
- **mAP50-95** — Genauigkeit der Masken-Form
- Visuell: Stimmen die Masken mit den echten Komponenten überein?

**Modell B (Keypoints):**
- **OKS** (Object Keypoint Similarity) — wie präzise die Keypoints sitzen
- Physikalisch: Ergibt der berechnete Hebelarm einen realistischen Wert?
