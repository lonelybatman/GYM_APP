### 1. Ebene: Der Status (Superdefault)

Dies ist der "Master-Filter" deiner gesamten App.

- **Kriterium:** Spalte B ist exakt `WAHR`.
    
- **Bedeutung:** Diese Übungen sind deine Referenz-Übungen. In der Datenbank markieren wir sie mit `is_superdefault: true`.
    
- **Funktion:** In der Benutzeroberfläche stehen diese Übungen immer ganz oben oder können separat gefiltert werden, um das "Rauschen" der restlichen 900 Übungen auszublenden.
    

### 2. Ebene: Die Identität (Vollname)

- **Kriterium:** Spalte `exercise name`.
    
- **Bedeutung:** Der Name ist die primäre Kennung. Wir übernehmen ihn 1:1, damit die Übung in der App exakt so heißt, wie du sie in deiner Excel-Liste benannt hast.
    

### 3. Ebene: Die Zuordnung (Muskel & Kombi)

- **Kriterium:** Spalten `Target Muscle` und `exercise kombi`.
    
- **Bedeutung:** Dies ordnet die Übung in deine anatomische und technische Struktur ein (z. B. "Triceps" und "Free + Cable").
    
- **Funktion:** Ermöglicht das schnelle Finden von Alternativübungen für denselben Muskel.
    

### 4. Ebene: Die Merkmale (Details)

- **Kriterium:** Alle restlichen 40+ Spalten (Griff, Winkel, Höhe etc.).
    
- **Bedeutung:** Diese Informationen fließen in das `details` JSONB-Feld.
    
- **Funktion:** Sie sind "passiv". Das bedeutet, sie belasten die Suche nicht, sind aber sofort verfügbar, sobald man auf eine Übung klickt, um die genaue Ausführung zu sehen.