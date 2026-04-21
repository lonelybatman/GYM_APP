
Um OpenSim optimal auf deine MoCap-Daten (egal ob von MediaPipe oder OpenCap) vorzubereiten, müssen wir das Modell "kalibrierungsbereit" machen. Der wichtigste Prozess hierbei ist das **Scaling Setup**. Wenn das Modell nicht perfekt zu deiner Körperstatur passt, werden alle späteren Muskelberechnungen ungenau.

Hier ist die Checkliste und die Vorbereitung in OpenSim, um dein Modell "MoCap-ready" zu machen:

---

### 1. Das Modell vorbereiten (Marker Platzierung)

OpenSim muss wissen, welcher Punkt in deinem Video welchem Punkt am digitalen Skelett entspricht.

- **Virtuelle Marker:** In der OpenSim GUI siehst du kleine rosa Kugeln am Modell. Wenn du MediaPipe nutzt, hast du meist nur "Gelenkzentren" (z.B. `Knee_Joint`). Du musst sicherstellen, dass dein Modell Marker an genau diesen Stellen hat.
    
- **Anpassung:** Du kannst im `Navigator`-Fenster unter `Markers` neue Marker hinzufügen oder bestehende verschieben, damit sie exakt dort sitzen, wo die KI im Video deine Gelenke vermutet.
    

### 2. Die Skalierungs-Datei (.xml) vorbereiten

Bevor du die Berechnung startest, musst du das **Scale Tool** konfigurieren. Das ist das Herzstück der Vorbereitung.

- **Static Pose:** Du brauchst einen Frame aus deinem Video, in dem du möglichst gerade stehst (die "T-Pose" oder eine aufrechte "Neutral Pose").
    
- **Mass & Height:** Notiere dir dein exaktes Gewicht und deine Größe. OpenSim nutzt diese Daten, um die Trägheitsmomente der einzelnen Körpersegmente (Oberschenkel, Rumpf etc.) zu berechnen.
    

---

### 3. Die Zeitreihen-Datei (.trc) vorbereiten

Deine Video-Daten müssen in einem Format vorliegen, das OpenSim lesen kann. Eine `.trc` Datei ist im Grunde eine Tabelle.

- **Header:** Die Datei muss Informationen über die Frequenz (Bilder pro Sekunde, z.B. 30 oder 60 fps) enthalten.
    
- **Einheiten:** OpenSim rechnet standardmäßig in **Metern**. Wenn dein MediaPipe-Skript Daten in Pixeln oder Millimetern ausgibt, musst du diese vorher konvertieren.
    
- **Filterung:** Da Videodaten oft "rauschen" (leichtes Zittern), solltest du die Daten bereits in der Vorbereitung filtern (Low-pass Butterworth Filter, ca. 6 Hz).
    

### 4. Koordinatensystem-Check (Ganz wichtig!)

Ein häufiger Fehler: In Videos ist "Oben" oft die Y-Achse, in OpenSim ist "Oben" aber standardmäßig die **Y-Achse** (Gait-Modelle) oder die **Z-Achse**.

- Prüfe, ob deine Bodenplatte in OpenSim mit dem Boden in deinem Video übereinstimmt. Falls dein Modell beim Importieren auf dem Rücken liegt, musst du die Rotationsmatrix in deiner Vorbereitung anpassen.
    

---

### Praktische Übung zur Vorbereitung:

Um zu testen, ob OpenSim bereit ist, kannst du folgendes tun:

1. Lade ein Standardmodell (z.B. `Rajagopal_2016.osim`).
    
2. Öffne das **Scale Tool** (`Tools` -> `Scale Model...`).
    
3. Wähle unter **Settings** deine (noch zu erstellende) `.trc` Datei aus.
    
4. Klicke auf den Reiter **Scale Factors** und schaue dir an, welche Abstände (z.B. zwischen Hüft-Marker und Knie-Marker) zur Skalierung genutzt werden sollen.