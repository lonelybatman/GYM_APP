## System Plan — Von CVAT bis zur laufenden KI

---

### Überblick der Phasen

```
Phase 1: CVAT Setup & Labeling
Phase 2: Daten exportieren & aufbereiten
Phase 3: Modell trainieren (Google Colab)
Phase 4: Physik-Engine bauen
Phase 5: Alles zusammenführen
```

---

## Phase 1 — CVAT: Labels & Annotation

**Status: CVAT läuft, erstes Projekt erstellt**

### 1.1 Labels in CVAT definieren

Pro Skelett-Typ ein eigenes Label mit den jeweiligen Attributen anlegen (siehe Skel_Rot_Simple / Skel_Rot_Complex / Skel_Linear).

Jedes Label besteht aus:
- **Bounding Box** über die gesamte Maschine
- **Attribute** (Dropdown) gemäß Tabelle
- **Keypoints / Skeleton** mit den spezifischen Punkten des Skelett-Typs

### 1.2 Bilder sammeln

Pro Maschine werden **3 Fotos** aus festen Winkeln aufgenommen:

| Foto | Winkel | Zweck |
|---|---|---|
| Foto 1 | Frontal (0°) | Gesamtgeometrie, Höhe, Breite, Referenzpunkt |
| Foto 2 | Diagonal (45°) | 3D-Struktur, verdeckte Teile sichtbar machen |
| Foto 3 | Seite (90°) | Exakte Hebelarmlänge für die Physik-Berechnung |

```
         Maschine
            |
  45° ------+-------- 90°
            |
          0° Frontal
```

- Möglichst verschiedene Hersteller und Modelle
- Ziel für den Start: **mind. 20–30 Maschinen pro Skelett-Typ** (= 60–90 Bilder)
- Kein Mensch im Bild nötig — die Maschine alleine reicht
- Alle 3 Fotos immer von derselben Maschine aufnehmen (als Gruppe zusammenhalten)

### 1.3 Annotieren

Reihenfolge pro Bild:
1. Bounding Box um die gesamte Maschine ziehen
2. Skelett-Typ manuell auswählen (du gibst es vor)
3. Attribute setzen (pad_type, action_point, grip_position usw.)
4. Keypoints setzen (Pivot, Action_Point, Pin, Support usw.)
5. Verdeckte Punkte mit `O` (Occluded) markieren — nicht weglassen

### 1.4 Qualitätskontrolle

- Keypoints müssen konsistent gesetzt sein (immer an derselben Stelle des Bauteils)
- Lieber weniger aber saubere Bilder als viele schlechte

---

## Phase 2 — Export & Datenaufbereitung

### 2.1 Export aus CVAT

Format: **COCO Keypoints 1.0** (einfachste Weiterverarbeitung für YOLOv8-Pose)

Alternativ: **Ultralytics HUB Format** falls direkt zu YOLO exportiert werden soll.

### 2.2 Datensatz aufteilen

Die 3 Fotos pro Maschine werden zusammen in denselben Split eingeteilt — nie aufteilen (sonst trainiert das Modell auf Fotos von Maschinen, die es im Test-Set aus anderem Winkel sieht):

```
dataset/
├── train/   (80 %)   ← alle 3 Fotos einer Maschine landen hier
├── val/     (15 %)   ← oder alle 3 hier
└── test/    (5 %)    ← oder alle 3 hier
```

Pro Skelett-Typ ein eigener Datensatz.

### 2.3 Konvertierung

Ein kurzes Python-Skript konvertiert den CVAT-Export ins YOLOv8-Pose Format (`.yaml` + `.txt` Annotationen). Dafür gibt es fertige Tools (`supervision`, `roboflow` SDK oder manuell).

---

## Phase 3 — Training (Google Colab)

### 3.1 Modell-Strategie

Da du das Skelett vorgibst, trainieren wir **separate Modelle pro Skelett-Typ**:

| Modell | Erkennt | Keypoints |
|---|---|---|
| `model_rot_simple.pt` | Skel_Rot_Simple Maschinen | Pivot, Action_Point, Pin, Support_Top, Support_Bottom |
| `model_rot_complex.pt` | Skel_Rot_Complex Maschinen | Pivot_1, Pivot_2, Action_Point, Pin, Support_Top, Support_Bottom |
| `model_linear.pt` | Skel_Linear Maschinen | Rail_Start, Rail_End, Action_Point, Pin, Support |

Vorteil: Jedes Modell ist klein und spezialisiert. Weniger Verwechslungsgefahr.

### 3.2 Training mit YOLOv8-Pose

```python
from ultralytics import YOLO

model = YOLO("yolov8n-pose.pt")  # Startpunkt: vortrainiertes Pose-Modell

model.train(
    data="dataset_rot_simple.yaml",
    epochs=100,
    imgsz=640,
    batch=16,
    device="cuda"   # GPU in Colab
)
```

**Empfehlung:** Mit `yolov8n-pose` (nano) starten — schnell und reicht für den Anfang. Später auf `yolov8s-pose` wechseln wenn mehr Daten vorhanden.

### 3.3 Evaluation

Nach dem Training prüfen:
- **mAP** (mean Average Precision) — Gesamtgenauigkeit
- **OKS** (Object Keypoint Similarity) — wie präzise die Keypoints sitzen
- Bilder aus dem Test-Set visuell kontrollieren

---

## Phase 4 — Physik-Engine (Python)

Sobald YOLO die Keypoint-Koordinaten liefert, übernimmt ein Python-Skript die Berechnung.

### 4.1 Input

```python
keypoints = {
    "Pivot":        (x1, y1),
    "Action_Point": (x2, y2),
    "Pin":          (x3, y3)
}
gewicht_kg = 40  # manuell eingegeben oder aus Bild geschätzt
```

### 4.2 Berechnung (Beispiel Skel_Rot_Simple)

```python
import numpy as np

# Hebelarm (Distanz Pivot → Action_Point)
r = np.linalg.norm(np.array(keypoints["Action_Point"]) - np.array(keypoints["Pivot"]))

# Winkel des Hebels relativ zur Vertikalen
delta = np.array(keypoints["Action_Point"]) - np.array(keypoints["Pivot"])
theta = np.arctan2(delta[0], delta[1])  # Winkel in Rad

# Effektives Drehmoment
F = gewicht_kg * 9.81
drehmoment = F * r * np.sin(theta)
```

### 4.3 Output

- Hebelarm in Pixeln → umrechnen in cm (Kalibrierung nötig)
- Winkel in Grad
- Drehmoment in Nm
- Widerstandsprofil über die gesamte Bewegungsbahn (ROM)

---

## Phase 5 — Zusammenführen

### Ablauf im fertigen System

```
1. Nutzer wählt Skelett-Typ (oder scannt QR-Code der Maschine)
         ↓
2. Passendes YOLO-Modell wird geladen
         ↓
3. Kamera-Feed → YOLO erkennt Keypoints in Echtzeit
         ↓
4. Physik-Engine berechnet Hebelarm & Drehmoment pro Frame
         ↓
5. App zeigt Widerstandsprofil & biomechanische Daten an
```

### Kalibrierung (wichtig)

YOLO liefert Pixel-Koordinaten. Um echte physikalische Werte (cm, Nm) zu berechnen, braucht es einen Referenzpunkt im Bild — z.B. eine bekannte Länge (Gewichtsplatten haben Standardmaße: 45cm Durchmesser).

Das Seitenfoto (90°) liefert den Hebelarm direkt ohne Perspektivkorrektur — es wird primär für die Physik-Berechnung genutzt. Das Diagonalfoto ergänzt die 3D-Struktur. Das Frontalfoto dient als Referenzanker für die Triangulation.

---

## Nächste konkrete Schritte

- [ ] Labels und Attribute in CVAT anlegen (Skelett-Schema aus den 3 Dateien)
- [ ] Erste Maschinen fotografieren: je 3 Fotos (0°, 45°, 90°), Fokus: **Skel_Rot_Simple**
- [ ] Fotos in CVAT importieren und annotieren (pro Maschine alle 3 Bilder)
- [ ] 20 Maschinen (= 60 Bilder) → erstes Test-Training in Colab
- [ ] Physik-Skript schreiben und mit Dummy-Koordinaten testen
- [ ] Ergebnisse evaluieren → Datensatz erweitern
