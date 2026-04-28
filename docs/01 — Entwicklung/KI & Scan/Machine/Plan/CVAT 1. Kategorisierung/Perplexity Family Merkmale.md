## Was noch fehlt

Nicht vollständig abgedeckt sind vor allem:

- **Leg Press / Hack Squat / Pendulum Squat**: andere Sitz- und Fußplattform-Geometrie, kein klassisches Griff-Setup.
    
- **Hip Thrust / Glute Drive / Glute Kickback**: eigenes Becken-/Rückenpolster-Layout, oft weder Front- noch Side-Handle-Muster.
    
- **Ab-/Adduktor**: Sitzposition mit seitlich geführten Beinen, eigener Mechaniktyp.
    
- **Calf Raise**: meist stehende oder sitzende Plattform-/Polster-Konstruktion.
    
- **Arm-Isolationsmaschinen** wie Bizeps Curl, Trizeps Press/Dip, Deltoid Raise: eigene Armführung statt der von dir definierten Standard-Griffmuster.
    
- **Cable Machines / Functional Trainers**: sehr viele Bewegungsmuster, oft nicht sinnvoll in eine einzelne deiner Klassen pressbar.

Ja — für dein Ziel solltest du pro **Machine Family** nur die Merkmale wählen, die visuell stabil sind, eindeutig trennbar bleiben und von einem Modell mit Bounding Boxes oder Segmentierung gut gelernt werden können. Am besten sind das **Form-, Lage-, Polster-, Griff- und Gelenkmerkmale**; Muskelziel oder exakter Geräte-Name sind oft zu semantisch und zwischen Herstellern zu variabel.

## Geeignete Merkmale

Für jede Familie würde ich diese Feature-Arten prüfen:

- **Sitztyp**: mit/ohne Sitz, Rückenlehne, Brustpolster, Bauchpolster.
    
- **Polstertyp**: Rolle/Zylinder, breites Pad, schmaler Kontaktpunkt, Oberschenkel-Fixierung.
    
- **Griffposition**: vorne, hinten, seitlich, über Kopf, neutral, niedrig.
    
- **Armmechanik**: einarmig, beidarmig, zwei separate Hebel, geführte Bahn, Kabelzug.
    
- **Beinmechanik**: Fußplattform, Knie-/Schienbeinrolle, seitliche Beinführung.
    
- **Körperhaltung**: sitzend, liegend, stehgend, kniend.
    
- **Rahmenform**: hoher Turm, flacher Rahmen, kompakte Station, Plate-loaded Hebelarm.
    
- **Bewegungsachse**: vertikal, horizontal, diagonal, rotierend.
    

Diese Merkmale sind für Vision oft gut erkennbar, weil sie auf sichtbaren Bauteilen beruhen und nicht auf Trainingszielen.

| Familie                        | Essenzielle Merkmale                                                              |
| ------------------------------ | --------------------------------------------------------------------------------- |
| **Seated Front Handles**       | Sitz, Rückenlehne, Griffposition vorne, Bewegungsrichtung der Arme                |
| **Rear Handles / Row-Lat**     | Sitz, Brust-/Oberschenkel-Fixierung, Griffposition hinten, Zugbahn                |
| **Side Handles / Fly**         | Sitz, seitliche Griffe, 1 oder 2 Gelenke pro Seite, Arm-Spreizbahn                |
| **Prone Pad**                  | Bauch-/Brustpolster, Liegeposition, Hebelarm oder Kopf-/Fußauflage                |
| **Leg Extension / Curl**       | Sitz, Schienbein-/Knöchelrolle, Fuß-/Knieposition, Bewegungsrichtung des Polsters |
| **Leg Press / Hack Squat**     | große Fußplattform, Rücken-/Schulterpolster, Schlitten- oder Hebelbahn            |
| **Hip / Glute**                | Hüftpolster, Rückenstütze, Beckenauflage, Hebelarm hinter dem Körper              |
| **Ab / Adductor**              | seitliche Beinpolster, Sitz, Rotationspunkt der Beine                             |
| **Arm Isolation**              | Armauflage oder Ellenbogenpad, einseitige/ beidseitige Hebel, kompakte Bauform    |
| **Cable / Functional Trainer** | Kabelrollen, verstellbare Säulen, Griffseile, keine festen Arme                   |
| **Core / Crunch**              | Brust- oder Schulterpolster, Rumpfbeugung, kompakter Sitzrahmen                   |
| **Specialty / Other**          | ungewöhnliche Geometrie, nicht standardisierte Kombinationen                      |



oder vereinfacht 

- chest_press_shoulder_press
    
- row_lat_pulldown
    
- fly_reverse_fly
    
- prone_pad
    
- leg_extension_leg_curl
    
- leg_press_hack_squat
    
- hip_glute
    
- specialty_machine