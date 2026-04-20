

## 1. Die Identität (Eindeutigkeit)

Ganz oben steht der **Vollständige Name** (`exercise name`).

- **Regel:** Wir übernehmen den Namen zu 100 % aus deiner Liste.
    
- **Warum:** Damit du in der App genau das liest, was du in deiner Excel-Tabelle gepflegt hast. Keine kryptischen Codes, sondern z. B. „Triceps Pushdown“.
    

## 2. Die Priorisierung (Superdefaults)

Gleich darunter folgt die Einteilung in **Wichtigkeit** (`is_superdefault`).

- **Logik:** Wenn in Spalte B deiner Datei `WAHR*` steht, bekommt die Übung einen „Gold-Status“.
    
- **Nutzen:** In der App kannst du später einen Schalter umlegen: „Nur Basis-Übungen anzeigen“. Das filtert die 920 Übungen sofort auf deine wichtigsten Favoriten herunter.
    

## 3. Die Kategorisierung (Struktur)

Hier ordnen wir die Übung technologisch und anatomisch ein:

- **Kombi (`exercise kombi`):** Ist es eine Übung an der Bank mit Kabelzug (`Bench + Cable`), frei im Raum (`Free + Cable`) oder an einer Maschine?
    
- **Muskelgruppe (`Target Muscle`):** Welcher Muskel ist das Primärziel? (Wird später mit der `muscle.xlsx` verknüpft).
    

## 4. Die „Daten-Box“ (Details)

Alles andere landet in einem **JSON-Feld** namens `details`. Das ist wie eine digitale Schublade, in der alle restlichen 40+ Spalten unberührt mitwandern.

- **Inhalt:** Griffart, Bankwinkel, Kabelhöhe, Standposition, etc.
    
- **Vorteil:** Die Datenbank-Tabelle bleibt extrem schlank und schnell, aber du verlierst keine einzige Information aus deiner Original-Datei.