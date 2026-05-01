## Active Learning — Weniger annotieren, besseres Modell

---

### Das Problem mit klassischem Labeling

Jedes Bild manuell von Grund auf annotieren ist zeitaufwändig. Ab einer gewissen Datenmenge bringt jedes weitere manuell vollständig annotierte Bild kaum noch Gewinn — das Modell hat die Muster bereits gelernt.

**Active Learning löst das:** Das Modell entscheidet selbst welche Bilder noch annotiert werden müssen.

---

### Der Loop

```
Zyklus 1:
20–30 Maschinen manuell annotieren (3 Fotos je)
        ↓
Erstes Modell trainieren
        ↓
Modell pre-annotiert 50 neue Bilder automatisch
        ↓
Du schaust nur drüber und korrigierst Fehler
        ↓
Neu trainieren

Zyklus 2:
Modell ist besser → pre-annotiert 100 neue Bilder
        ↓
Noch weniger Korrekturen nötig
        ↓
Neu trainieren

→ Wiederholen bis Qualität ausreicht
```

---

### Welche Bilder als nächstes annotieren?

Das Modell markiert Bilder wo es **unsicher** ist — erkennbar an niedrigen Confidence-Scores. Diese Bilder bringen den größten Lerngewinn.

```python
from ultralytics import YOLO

model = YOLO("model_components.pt")
results = model.predict("neue_bilder/", conf=0.25)

# Bilder mit niedrigem Confidence filtern
unsichere_bilder = [
    r.path for r in results
    if r.boxes.conf.mean() < 0.6  # unter 60% Konfidenz
]
# → diese zuerst manuell korrigieren
```

---

### Zeitersparnis pro Zyklus

| Zyklus | Annotationsaufwand |
|---|---|
| 1 (manuell) | 100% — alles von Hand |
| 2 (erste Korrekturen) | ~50% — Modell macht grobe Fehler |
| 3 | ~25% — nur noch feine Korrekturen |
| 4+ | ~10% — fast alles korrekt, nur Ausreißer |

---

### Praktischer Ablauf in CVAT

1. Neue Bilder in CVAT hochladen
2. Modell-Vorhersagen über CVAT API importieren (als vorläufige Annotationen)
3. Bilder mit niedrigem Confidence zuerst öffnen
4. Masken und Keypoints korrigieren wo nötig
5. Korrekte Annotationen exportieren → neu trainieren

---

### Wann ist das Modell gut genug?

- **mAP50 > 0.85** für Komponenten-Erkennung
- **OKS > 0.80** für Keypoints
- Physik-Engine liefert realistische Hebelarme (manuell prüfen)
- Neue ungesehene Maschinen werden korrekt segmentiert
