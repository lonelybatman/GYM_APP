

> Verwandte Notizen: [[3D Modell in der App]] · [[Ausführungen]] · [[MOC — Gym App]]

### Ansatz 1: Die Vektor-Mathematik + Heuristik (Der pragmatische Weg)

Für eine mobile App ist eine Live-Simulation oft zu rechenintensiv. Stattdessen baust du eine eigene 3D-Vektorberechnung, die Gelenkmomente berechnet und diese über eine Datenbank auf Muskeln verteilt.

1. **Das 3D-Gelenkmodell:** Du definierst den Körper als vereinfachtes Strichmännchen im 3D-Raum (Koordinatensystem).
    
2. **Vektoren definieren:** Du nimmst die App-Daten und übersetzt sie in Kraftvektoren.
    
    - _Freihantel:_ Der Kraftvektor $\vec{F}$ zeigt immer stur nach unten (Schwerkraft).
        
    - _Kabelzug:_ Der Kraftvektor $\vec{F}$ zeigt vom Griffpunkt in Richtung der Rolle am Kabelzugturm.
        
3. **Drehmoment (Torque) berechnen:** Du berechnest für jedes Gelenk, wie stark der Widerstand an diesem Gelenk zieht. Das ist reine Physik (Kreuzprodukt aus Hebelarm und Kraft):
    
    $$\vec{\tau} = \vec{r} \times \vec{F}$$
    
4. **Muskel-Mapping (Die Heuristik):** Du erstellst eine Datenbank. Wenn auf das Schultergelenk ein Drehmoment $\vec{\tau}$ in Richtung Abduktion (Seitheben) wirkt, schaut das System nach, welche Muskeln für Abduktion zuständig sind (z. B. Deltoideus lateral) und weist ihnen basierend auf ihrem physiologischen Querschnitt Aktivierungsprozente zu.
    

### Ansatz 2: Die OpenSim API (Der wissenschaftliche Weg)

Wenn du es anatomisch absolut korrekt machen willst, nutzt du die im vorherigen Schritt erwähnte Software _OpenSim_, steuerst sie aber im Hintergrund per Code.

1. **Setup:** Du installierst die OpenSim Python API (`pyopensim`) auf einem Server.
    
2. **Parametrisierung:** Wenn ein Nutzer in der App eine Übung loggt, schickt die App die Parameter (z. B. "Bank 30 Grad, Hantel") an dein Python-Skript.
    
3. **Skripting:** Das Skript passt das generische OpenSim-Modell an diese Startposition an und fügt eine externe Kraft (die Hantel) an den virtuellen Händen hinzu.
    
4. **Static Optimization:** Du lässt OpenSim berechnen: "Um diese Position gegen dieses Gewicht zu halten, wie müssen die Muskeln feuern?"
    
5. **Output:** OpenSim spuckt dir die Aktivierung (0.0 bis 1.0, also 0% bis 100%) für jeden einzelnen Muskel aus, die du in der App anzeigst.


### Ansatz 3: Surrogate Modeling (Die moderne KI-Lösung)

Das ist der Weg, den die meisten hochmodernen Sport-Tech-Firmen heute gehen, da Ansatz 2 für eine App mit vielen Nutzern Serverkosten explodieren ließe.

1. **Daten generieren:** Du nutzt OpenSim lokal auf deinem Rechner. Du programmierst ein Skript, das tausende Variationen durchrechnet (Bankdrücken bei 0°, 15°, 30°, 45° mit Kurzhanteln vs. Langhantel).
    
2. **KI trainieren:** Du nimmst diese hunderttausenden Ergebnisse und trainierst ein einfaches Machine-Learning-Modell (z. B. einen Random Forest oder ein kleines neuronales Netz).
    
    - _Input:_ Winkel Bank, Griffart, Widerstandsart.
        
    - _Output:_ Muskelaktivierung in %.
        
3. **Integration:** Dieses trainierte KI-Modell ist winzig (wenige Megabyte) und kann direkt offline in der App auf dem Smartphone des Nutzers in Sekundenbruchteilen die Prozentzahlen ausspucken.