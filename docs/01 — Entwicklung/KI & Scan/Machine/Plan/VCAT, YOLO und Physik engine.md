
### 1. CVAT (Das "Lehrer-Tool")

CVAT ist dein Werkzeug, um der KI zu zeigen, was was ist. Da du Winkel und Hebel berechnen willst, nutzt du hier nicht nur Rahmen (Boxes), sondern **Punkte (Keypoints)**.

- **Input:** Deine rohen Videos oder Fotos der plattenbeladenen Maschinen.
    
- **Deine Aufgabe:** Du setzt manuell Punkte auf jedes Bild: Punkt 1 = Kugellager, Punkt 2 = Griff, Punkt 3 = Pin, Punkt 4 = Ende der Lehne.
    
- **Output:** Eine Datei (meist im XML- oder JSON-Format), in der steht: _"Bild_01.jpg: Kugellager ist bei X=450, Y=300"_.
    
- **Kurz gesagt:** CVAT liefert die **Wahrheit**, mit der die KI lernt.
    

---

### 2. YOLOv8-Pose (Das "Gehirn")

YOLO ist die KI, die später _alleine_ arbeitet. Nachdem du sie mit den Daten aus CVAT trainiert hast, schaut sie sich ein neues Video an und "sieht" die Punkte in Millisekunden.

- **Input:** Ein Live-Kamerabild oder ein neues Video einer Maschine, die die KI noch nie gesehen hat.
    
- **Aufgabe:** YOLO scannt das Bild nach den gelernten Mustern (z. B. wie sieht ein Kugellager aus?).
    
- **Output:** Die **Koordinaten $(x, y)$** der Punkte in Echtzeit für jeden Frame des Videos.
    
    - _Beispiel-Output:_ `Kugellager: [500, 310]`, `Griff: [700, 450]`.
        
- **Kurz gesagt:** YOLO wandelt **visuelle Pixel** in **digitale Standorte** um.
    

---

### 3. Die Physik-Engine / Mathematik (Der "Analyst")

Das ist kein fertiges Programm, das man kauft, sondern ein Skript (meist in Python), das die Zahlen von YOLO nimmt und daraus echtes Wissen macht.

- **Input:** Die $(x, y)$ Koordinaten von YOLO (z. B. Position von Kugellager und Griff).
    
- **Aufgabe:** Anwendung von Trigonometrie.
    
    - **Winkel:** Über den Arkustangens ($\arctan$) berechnet das Programm den Winkel der Lehne relativ zum Boden.
        
    - **Hebelarm:** Es berechnet die Distanz (den Vektor) zwischen Kugellager (Drehpunkt) und Griff oder Pin.
        
    - **Physik:** Wenn du weißt, dass 20 kg auf dem Pin liegen, berechnet das Skript über den Hebelarm das tatsächliche Drehmoment, das am Griff ankommt.
        
- **Output:** Konkrete Werte wie: _"Lehnenwinkel: 110°"_, _"Hebelarm: 65 cm"_, _"Effektive Last: 14,5 kg"_.
    
- **Kurz gesagt:** Die Mathematik macht aus **Punkten** verwertbare **biomechanische Date**

### **Zusammenfassung** 

| **Tool**       | **Was macht es?**            | **Ergebnis**                  |
| -------------- | ---------------------------- | ----------------------------- |
| **CVAT**       | Du markierst Punkte manuell. | Trainingsdaten (Lernmaterial) |
| **YOLO**       | Erkennt Punkte automatisch.  | Koordinaten (X, Y)            |
| **Mathematik** | Rechnet mit Koordinaten.     | Winkel, Hebel, Kräfte         |
