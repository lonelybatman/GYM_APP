> Verwandte Notizen: [[Plan_1 (Gemini + gpai)]] · [[Wegweiser für Cursor]] · [[MOC — Gym App]]

### 1. Live-Scan: Steckgewichte & Zusatzgewichte

- **Fokus:** Geschwindigkeit und Fehlertoleranz während der Übung.
    
- **Technik:** Live-OCR (z. B. Google ML Kit) direkt auf dem Smartphone.
    
- **KI-Gehirn:** Ein **Regressionsmodell** korrigiert Lesefehler. Wenn die Kamera die „45“ nicht erkennt, aber sieht, dass sie zwischen „40“ und „50“ liegt, berechnet sie den Wert logisch:
    
    $$w_n = w_0 + n \cdot \Delta w$$
    
- **UX-Kniff:** Ein Stabilitätsfilter sorgt dafür, dass das Gewicht erst gespeichert wird, wenn die Kamera den Wert für eine Sekunde lang ruhig im Fokus hat.
    

### 2. Plan-Migration: Screenshot-Import

- **Fokus:** Präzision und semantisches Verständnis von Fremd-Apps.
    
- **Technik:** Statische Bildanalyse + **NLP (Natural Language Processing)**.
    
- **KI-Gehirn:** **Named Entity Recognition (NER)** identifiziert Übungen, Sätze und Wiederholungen. Mittels **Sentence-BERT** (semantische Suche) wird „SBD“ automatisch als „Schrägbankdrücken“ in deiner Datenbank erkannt.
    
- **Daten-Logik:** Die App extrahiert Tabellenstrukturen aus dem Bild und wandelt sie in ein sauberes Datenformat um.
    

---

### 3. Freeweights & Griff-Erkennung

- **Technik:** **Instanz-Segmentierung** (Mask R-CNN), um das Objekt vom Boden zu isolieren.
    
- **KI-Gehirn:** Ein Algorithmus zur **Skelettierung** sucht nach zylindrischen Formen mit einem Durchmesser von $d \in [25\,\text{mm}, 50\,\text{mm}]$. Das sind die idealen Greifpunkte.
    
- **Fallback:** Bei komplexen Formen (z. B. Sandbags) markiert der Nutzer den Griffbereich manuell im Bild.
    

### 4. Bench-Winkel (Geometrie)

- **Technik:** Hough-Transformation zur Linienerkennung + **IMU-Fusion**.
    
- **KI-Gehirn:** Die App nutzt den Beschleunigungssensor des Handys, um den Schwerkraftvektor $\vec{g}$ zu bestimmen. So wird der Winkel der Lehne zur Horizontalen berechnet, selbst wenn du das Handy schräg hältst:
    
    $$\cos(\alpha) = \frac{\vec{v} \cdot \vec{h}}{|\vec{v}| |\vec{h}|}$$
    
- **Mapping:** Einmal gemessen, speichert die App: „Loch 3 bei dieser Bank = $30^{\circ}$“.
    

### 5. Attachments (Griffe)

- **Technik:** **Metric Learning** via ResNet.
    
- **KI-Gehirn:** Statt starrer Kategorien erstellt die KI einen **Vektor-Fingerabdruck** des Griffs. Dieser wird mit deiner Tabelle `exercise1` abgeglichen. Ist die Ähnlichkeit hoch genug, wird das Attachment automatisch zugeordnet.
    

### 6. Maschinen-Simulation (Kinematik)

- **Technik:** Keypoint Detection & Trajektorien-Vorhersage.
    
- **KI-Gehirn:** Die Maschine wird als **kinematische Kette** (starre Körper und Gelenke) modelliert. Die KI berechnet den Bewegungsradius des Griffs:
    
    $$\vec{p}(\theta) = \vec{p}_{pivot} + r \begin{pmatrix} \cos(\theta) \\ \sin(\theta) \end{pmatrix}$$
    
- **Visualisierung:** Ein virtuelles **Mannequin** wird in das Live-Bild projiziert, um dem Nutzer die korrekte Sitzposition zu zeigen.
    

---

### Zusammenfassung der Architektur

|**Modul**|**Input**|**Rechenort**|**Schwierigkeit**|
|---|---|---|---|
|**Live-Gewichte**|Video-Stream|Lokal (Handy)|Mittel|
|**Pläne/Screenshots**|Bild-Datei|Cloud / Server|Hoch|
|**Bankwinkel**|Foto + Sensoren|Lokal (Handy)|Mittel|
|**Maschinen**|Foto / Video|Server (KI)|Sehr Hoch|

---

> **Mein Fazit:** Du hast jetzt einen Bauplan, der sowohl die physikalische Welt (Winkel, Mechanik) als auch die digitale Welt (Screenshots, Datenbank-Matching) abdeckt.