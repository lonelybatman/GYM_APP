## Modell Training — Von Sensor+Video zu reiner Video-Vorhersage

---

### Überblick

Ein kleines neuronales Netz lernt die Verbindung zwischen:
- **Input:** Körper-Pose (aus Video) + Maschinenwiderstand (aus Physik-Engine)
- **Output:** Relative Muskelaktivierung pro Frame

Nach dem Training: nur noch Video + Maschinen-Scan nötig.

---

### Schritt 1 — Körper-Pose aus Video extrahieren (MediaPipe)

MediaPipe Pose erkennt 33 Körper-Landmarks pro Frame — kostenlos, läuft auf dem Smartphone.

```python
import mediapipe as mp
import cv2

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

cap = cv2.VideoCapture("chest_press_01.mp4")
frames_data = []

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if results.pose_landmarks:
        landmarks = [(lm.x, lm.y, lm.z) for lm in results.pose_landmarks.landmark]
        frames_data.append(landmarks)
```

Aus den Landmarks werden berechnet:
- **Gelenkwinkel** (Ellenbogen, Schulter, Hüfte, Knie) via Vektorrechnung
- **Bewegungsgeschwindigkeit** (Differenz zwischen aufeinanderfolgenden Frames)

---

### Schritt 2 — Maschinenwiderstand pro Frame

Die Physik-Engine liefert für jeden Frame den aktuellen Widerstand basierend auf dem erkannten Hebelarm-Winkel (aus YOLO-Keypoints im Video).

```python
# Für jeden Frame:
widerstand_frame = physik_engine.berechne_widerstand(
    keypoints=yolo_model.predict(frame),
    gewicht_kg=gewicht
)
```

---

### Schritt 3 — EMG synchronisieren

EMG-CSV und Video über den Sync-Marker (Klatschen) ausrichten → pro Frame ein EMG-Wert pro Sensor.

EMG normalisieren: pro Muskel auf den maximalen Wert der Session skalieren (0–1). So werden absolute Unterschiede eliminiert, die relativen Muster bleiben erhalten.

---

### Schritt 4 — Feature-Vektor pro Frame zusammenstellen

```python
# Pro Frame ein Vektor:
features = [
    winkel_ellenbogen,        # Grad
    winkel_schulter,          # Grad
    winkel_hufte,             # Grad
    geschwindigkeit_hand,     # Pixel/Frame
    widerstand_normalisiert,  # 0–1
    # ... weitere Gelenkwinkel
]

target = [
    emg_brust_normalisiert,   # 0–1
    emg_schulter_normalisiert,
    emg_trizeps_normalisiert,
]
```

---

### Schritt 5 — Modell trainieren

Ein einfaches Feed-Forward Netz reicht für den Anfang:

```python
import torch
import torch.nn as nn

class MuskelModell(nn.Module):
    def __init__(self, input_dim, output_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, output_dim),
            nn.Sigmoid()  # Output 0–1
        )

    def forward(self, x):
        return self.net(x)
```

**Training:**
- Loss: MSE (Mean Squared Error) zwischen vorhergesagtem und echtem EMG
- Optimizer: Adam
- Epochs: 200–500 (Datenmenge ist klein, Modell ist klein)
- Train/Val Split: 80/20 auf Übungs-Ebene (nicht Frame-Ebene)

---

### Schritt 6 — Evaluation

Nach dem Training prüfen:
- Korrelation zwischen vorhergesagtem und echtem EMG-Verlauf (Kurvenform)
- Stimmt der Peak-Zeitpunkt überein?
- Stimmt die Rangfolge der Muskeln (Primär/Sekundär)?

Ein Pearson-Korrelationskoeffizient > 0.75 zwischen vorhergesagter und echter Kurve ist ein gutes erstes Ziel.

---

### Was das fertige System liefert

```
Nutzer scannt Maschine (3 Fotos)
        ↓
YOLO erkennt Keypoints → Physik-Engine berechnet Widerstandsprofil
        ↓
Nutzer macht Übung → Video wird aufgenommen
        ↓
MediaPipe extrahiert Pose pro Frame
        ↓
Muskel-Modell kombiniert Pose + Widerstand
        ↓
Output: "Brust: 58%  |  Schulter: 26%  |  Trizeps: 16%"
        + Kurve: wann welcher Muskel am meisten arbeitet
```
