---
tags:
  - opensim
  - muskelaktivierung
  - ki
  - python
---
> Verwandte Notizen: [[Berechnung von der Muskelaktivierung]] · [[3D Modell in der App]] · [[MOC — Gym App]]

## 1. Das passende Modell wählen

Bevor du rechnest, brauchst du ein digitales Skelett mit Muskelsträngen. OpenSim bietet Standardmodelle (wie das _Gait2392_ oder das _HPL Upper Extremity Model_).

- **Wichtig:** Wähle ein Modell, das die für deine Übung relevanten Freiheitsgrade und Muskelgruppen enthält (z. B. ein Modell mit detailliertem Schultergürtel für Bench Press).
    

## 2. Bewegungsdaten importieren (Kinematik)

OpenSim muss wissen, wie sich der Körper bewegt. Das funktioniert meist über zwei Wege:

- **Motion Capture Daten (.trc):** Du importierst Marker-Daten aus Systemen wie Vicon oder OptiTrack.
    
- **Manuelle Keyframes:** Du kannst Gelenkwinkel auch manuell in einer `.mot` Datei definieren, falls du keine echten Messdaten hast.
    

## 3. Der Simulations-Workflow

Um die Muskelaktivierung zu berechnen, durchläufst du in der Regel diese Kette von Tools innerhalb von OpenSim:

### A. Scaling (Skalierung)

Das Standardmodell wird an die anthropometrischen Daten (Größe, Gewicht) deines Probanden angepasst.

### B. Inverse Kinematics (IK)

Hier berechnet OpenSim aus den Markerpositionen die Gelenkwinkel über die Zeit. Das Ergebnis ist eine Datei, die beschreibt, wie sich die Gelenke während der Übung bewegen.

### C. Inverse Dynamics (ID)

Hier werden die Kräfte und Momente berechnet, die in den Gelenken wirken müssen, um die Bewegung (unter Berücksichtigung von Gravitation und Bodenreaktionskräften) zu erzeugen.

### D. Static Optimization (Statische Optimierung)

Dies ist der entscheidende Schritt für deine Frage. Da unser Körper "redundant" ist (mehrere Muskeln können ein Gelenk bewegen), löst OpenSim ein Optimierungsproblem:

> Welche Muskelkombination ist am effizientesten, um das geforderte Gelenkmoment zu erzeugen?

Das Ergebnis ist die **Muskelaktivierung** (ein Wert zwischen 0 und 1) und die **Muskelkraft** (in Newton).

---

## 4. Externe Kräfte einbeziehen

Für Fitnessübungen sind externe Lasten (Hanteln, Widerstandsbänder) essenziell:

- Du musst die Last als **External Load** definieren.
    
- Eine Hantel kann als "Body" zum Modell hinzugefügt oder als externe Kraft, die an der Hand angreift, simuliert werden.
    

---

## 5. Analyse der Ergebnisse

Nach der Simulation kannst du die Daten exportieren und visualisieren:

- **Activation:** Zeigt dir, wie "stark" das Signal vom Nervensystem an den Muskel ist.
    
- **Fiber Length:** Spannend, um zu sehen, ob der Muskel in der gedehnten oder verkürzten Position arbeitet.
    
- **Moment Arms:** Welchen Hebelarm hat der Muskel in welcher Phase der Übung?
    

---

### Tipps für den Einstieg

- **GUI vs. Scripting:** Für einzelne Übungen ist die grafische Oberfläche (GUI) super. Wenn du 50 Varianten einer Kniebeuge berechnen willst, solltest du dich in das **Matlab- oder Python-Interface** von OpenSim einarbeiten.
    
- **OpenSim Dokumentation:** Suche nach dem "Introduction to Muscle Modeling" Tutorial auf _Confluence_ (der offiziellen Doku-Plattform von OpenSim).
    
- **Validierung:** Sei vorsichtig mit den absoluten Werten. OpenSim ist perfekt, um Tendenzen zu vergleichen (z.B. "Wie ändert sich die Aktivierung des Gluteus, wenn ich die Fußstellung verändere?").