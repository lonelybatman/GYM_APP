## Muskelaktivierung — Überblick

---

### Ziel

Ein Modell trainieren, das aus **Video alleine** (ohne Sensoren) vorhersagen kann, welche Muskeln bei einer Übung wie stark arbeiten — basierend auf Körperbewegung und Maschinenphysik.

---

### Grundidee

In einer einmaligen Trainingsphase werden Sensoren + Video gleichzeitig aufgenommen. Das Modell lernt die Verbindung zwischen dem was man **sieht** (Gelenkwinkel, Bewegung, Maschinengeometrie) und dem was die Muskeln **tun** (EMG-Signal).

Danach reicht Video alleine.

---

### Warum das funktioniert

Die Beziehung zwischen Gelenkwinkel und Muskelaktivierung ist physikalisch begründet:

- Ein gestreckter Muskel verhält sich anders als ein kontrahierter (Längen-Spannungs-Kurve)
- Wenn die Maschine mechanisch am schwersten ist (höchstes Drehmoment), arbeiten die Zielmuskeln am härtesten
- Diese Muster sind im Video **sichtbar** — Gelenkwinkel, Geschwindigkeit, Maschinenposition

Das Modell lernt nicht zufällige Korrelationen, sondern biomechanisch begründete Zusammenhänge.

---

### Was das Modell kann und was nicht

| Vorhersage | Realistisch |
|---|---|
| Welcher Muskel ist primär / sekundär | Ja |
| Wann im ROM der Muskel am meisten arbeitet | Ja |
| Relative Verhältnisse (z.B. Brust 60%, Schulter 25%, Trizeps 15%) | Annäherungsweise |
| Übertragung auf andere Personen | Approximation — nicht exakt |
| Absolute Muskelkraft in Newton | Nein |
| Exakte klinische EMG-Messung | Nein |

---

### Die drei Bausteine

```
1. MyoWare Sensoren  →  tatsächliche Muskelaktivierung (Trainingsdaten)
         +
2. Video + MediaPipe  →  Körper-Pose (Gelenkwinkel, Geschwindigkeit)
         +
3. YOLO + Physik-Engine  →  Maschinenwiderstand pro Frame
         ↓
4. Kleines neuronales Netz lernt die Verbindung
         ↓
5. Später: nur Video + Maschinen-Scan → Muskelvorhersage
```

---

### Dateien in diesem Ordner

- `Datenaufnahme.md` — Wie Sensor + Video gleichzeitig aufgenommen werden
- `Muskelgruppen & Sensor Placement.md` — Welche Sensoren wo kleben
- `Modell Training.md` — Wie das Vorhersagemodell trainiert wird
