## Datenaufnahme — Sensor + Video gleichzeitig

---

### Anforderungen

- MyoWare Muscle Sensor (einer pro Zielmuskel)
- Kamera (Smartphone reicht) — fixiert auf einem Stativ
- Kamera muss die **gesamte Bewegungsbahn** erfassen (nicht nur den Oberkörper)
- Sensor und Video müssen **zeitlich synchronisiert** sein

---

### Kamera-Setup

Die Kamera wird so positioniert, dass der gesamte Körper + die Maschine sichtbar sind:

| Winkel | Zweck |
|---|---|
| Seitlich (90°) | Gelenkwinkel am präzisesten messbar (Ellenbogen, Knie, Hüfte) |
| Diagonal (45°) | Alternative wenn Seitenaufnahme nicht möglich |

> Frontalaufnahme ist für die Pose-Erkennung weniger geeignet — Gelenkwinkel in der Tiefe sind nicht sichtbar.

---

### Synchronisation

Da MyoWare kein eingebautes Zeitstempel-System hat, braucht es einen einfachen Sync-Trick:

**Methode:** Zu Beginn der Aufnahme kurz in die Hände klatschen (sichtbar im Video + kurzer EMG-Spike durch Körperbewegung). Dieser gemeinsame Peak dient als Nullpunkt für die Ausrichtung beider Zeitreihen.

---

### Ablauf einer Aufnahme-Session

1. Sensoren auf Zielmuskeln kleben (siehe `Muskelgruppen & Sensor Placement.md`)
2. Kamera auf Stativ — Seitenansicht, voller Körper sichtbar
3. Aufnahme starten (Video + EMG-Logging gleichzeitig)
4. Einmal klatschen → Sync-Marker
5. Übung in normalem Tempo ausführen — **3–5 saubere Wiederholungen**
6. Kurze Pause, dann nächste Übung
7. Aufnahme stoppen

---

### Wie viele Übungen werden benötigt

Ziel: das Modell soll lernen wie Körperbewegung + Maschinenphysik zusammen Muskelaktivierung erklären. Dafür braucht es Variation:

| Kategorie | Beispiele | Anzahl |
|---|---|---|
| Drückbewegungen | Chest Press, Shoulder Press | 3–4 |
| Zugbewegungen | Lat Pulldown, Seated Row | 3–4 |
| Fly-Bewegungen | Pec Deck, Reverse Fly | 2–3 |
| Beinmaschinen | Leg Extension, Leg Curl, Leg Press | 3–4 |
| Isolationsübungen | Arm Curl, Trizeps | 2–3 |

**Gesamt: ~15–20 Übungen** reichen für eine solide Trainingsbasis.

---

### Datenformat

Nach der Aufnahme liegen vor:

```
session_01/
├── chest_press_01.mp4          ← Video
├── chest_press_01_emg.csv      ← EMG-Rohdaten (Zeit, mV pro Kanal)
├── lat_pulldown_01.mp4
├── lat_pulldown_01_emg.csv
└── ...
```

Die CSV enthält pro Zeile: `timestamp_ms, sensor_1_mv, sensor_2_mv, sensor_3_mv, ...`
