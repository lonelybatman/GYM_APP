
## Unterklassen als Attribute

Wenn du später mehr Genauigkeit willst, kannst du pro Hauptlabel Attribute verwenden:

- **body_position**: seated, standing, prone, kneeling.
    
- **handle_position**: front, rear, side, overhead, none.
    
- **pad_type**: chest_pad, backrest, thigh_pad, roller_pad, shoulder_pad, foot_platform.
    
- **mechanism_type**: selectorized, plate_loaded, lever, guided_track.
    
- **movement_direction**: press, pull, fly, curl, extension, rotation, abduction, adduction.
    

## Empfohlene Annotation-Logik

Ich würde es so aufbauen:

- **Bounding Box** für die komplette Maschine.
    
- **Optional Attribute** für die wichtigsten Merkmale.
    
- **Keine Annotation** für Kabelturm, Bank, Griffe oder lose Attachments.