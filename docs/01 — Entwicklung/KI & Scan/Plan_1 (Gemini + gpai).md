
> Verwandte Notizen: [[Plan_2 (Gemini + gpai)]] · [[Wegweiser für Cursor]] · [[MOC — Gym App]]

### 1. Gewichte & Trainingspläne (Text-Extraktion)

- **Technik:** OCR (Texterkennung) + NLP (Sprachverarbeitung).
    
- **Der Clou:** Wir nutzen eine **Plausibilitätsprüfung**. Wenn die Kamera Zahlen überspringt, errechnet der Algorithmus über die Steigung ($w_n = w_0 + n \cdot \Delta w$) die fehlenden Werte. Bei Trainingsplänen sorgt **Semantic Search** dafür, dass "Bankdrücken" und "Bench Press" als dieselbe Übung erkannt werden.
    

### 2. Bankwinkel (Geometrie-Analyse)

- **Technik:** Computer Vision + Handy-Sensoren (IMU).
    
- **Der Clou:** Die App erkennt nicht nur die Linien der Bank, sondern nutzt das **Gyroskop des Handys**, um Schräghalten auszugleichen. So wird der Winkel absolut präzise gemessen. Danach erfolgt ein Mapping: "Winkel $X = \text{Lochzahl } Y$".
    

### 3. Griffe & Freeweights (Objekt-Erkennung)

- **Technik:** Metric Learning (Vektor-Fingerabdrücke).
    
- **Der Clou:** Anstatt jeden Griff einzeln zu programmieren, erstellt die KI einen **digitalen Fingerabdruck** (Embedding). Neue Griffe werden einfach mit vorhandenen in der Tabelle `exercise1` verglichen. Für unbekannte Gewichte prüft eine **Skelettierung** den Durchmesser des Objekts, um Griffflächen vorzuschlagen.
    

### 4. Maschinen-Simulation (Mechanik-Analyse)

- **Technik:** Keypoint Detection + Kinematische Ketten.
    
- **Der Clou:** Die KI identifiziert Drehpunkte (Pivots) und Griffe. Sie berechnet die **Trajektorie** (die Kurve, auf der sich der Griff bewegt). Ein virtuelles **Mannequin** zeigt dem Nutzer visuell an, wie er sich basierend auf der Polster-Position in die Maschine setzen muss.
    

---

### Der ideale Tech-Stack für dich

|**Komponente**|**Empfohlene Technologie**|
|---|---|
|**KI-Framework**|**TensorFlow Lite** oder **PyTorch Mobile** (für On-Device Scan ohne Cloud)|
|**Objekterkennung**|**YOLOv8** (extrem schnell für Live-Kameras)|
|**Texterkennung**|**Google ML Kit** (sehr robust bei schlechtem Licht)|
|**Sprachlogik**|**Sentence-BERT** (für das Matching von Übungsnamen)|

### Mein Tipp für die Umsetzung

Beginne mit dem **Gewicht- und Winkel-Scan**. Diese Features haben den höchsten direkten Nutzen für den User und sind technisch schneller stabil umsetzbar als die komplexe Maschinen-Simulation.