## 3D Rekonstruktion — Tiefenschätzung aus 3 Fotos

---

### Das Problem mit 2D

YOLO liefert Pixel-Koordinaten (x, y) — keine Tiefeninformation. Ein Hebelarm der in die Tiefe geht wird aus einem einzelnen Foto falsch berechnet.

---

### Zwei kombinierte Methoden

#### Methode 1 — DepthAnything V2 (Monokulare Tiefenschätzung)

DepthAnything V2 (Meta, kostenlos) schätzt aus **einem einzelnen Foto** eine relative Tiefenkarte — jeder Pixel bekommt einen Tiefenwert.

```python
from depth_anything_v2.dpt import DepthAnythingV2
import cv2

model = DepthAnythingV2(encoder="vitl")
model.load_state_dict(torch.load("depth_anything_v2_vitl.pth"))
model.eval()

image = cv2.imread("maschine_front.jpg")
depth_map = model.infer_image(image)
# depth_map: Array mit relativem Tiefenwert pro Pixel
```

**Vorteil:** Funktioniert mit einem einzigen Foto.
**Nachteil:** Liefert relative Tiefen (kein absoluter Maßstab in cm).

---

#### Methode 2 — Multi-View Triangulation (aus 3 Fotos)

Da du 3 Fotos aus bekannten Winkeln (0°, 45°, 90°) aufnimmst, können Keypoints die in mehreren Fotos erkannt werden trianguliert werden — echte 3D-Positionen.

```python
import numpy as np

def trianguliere_punkt(punkt_frontal, punkt_seite, winkel_deg=90):
    """
    Berechnet 3D-Position aus zwei 2D-Punkten
    bei bekanntem Kamerawinkel.
    """
    winkel_rad = np.radians(winkel_deg)
    # x aus Frontalfoto, z (Tiefe) aus Seitenfoto
    x = punkt_frontal[0]
    y = punkt_frontal[1]  # Höhe bleibt gleich
    z = punkt_seite[0]    # Seitenfoto x = Tiefe
    return np.array([x, y, z])
```

**Vorteil:** Echte 3D-Positionen, skalierbar auf cm wenn Referenzmaß bekannt.
**Nachteil:** Braucht denselben Punkt in mindestens 2 Fotos erkannt.

---

### Kombination beider Methoden

```
Frontalfoto → DepthAnything → relative Tiefenkarte
        +
Seitenfoto → DepthAnything → relative Tiefenkarte
        +
Keypoints aus beiden Fotos → Triangulation → absolute 3D-Position
        ↓
Kalibrierung via Referenzmaß (Gewichtsscheibe = 45cm Durchmesser)
        ↓
Echte Hebelarmlänge in cm
```

---

### Kalibrierung (Maßstab bestimmen)

Ohne Kalibrierung kennt das System nur relative Abstände. Mit einem bekannten Referenzmaß im Bild wird daraus ein absoluter Wert.

**Einfachste Methode:** Gewichtsscheiben haben Standarddurchmesser:
- Standard Olympic Scheibe: **45 cm** Durchmesser
- Das Modell misst den Scheibendurchmesser in Pixeln → berechnet px/cm Faktor → alle anderen Abstände werden umgerechnet

```python
def berechne_kalibrierung(pixel_durchmesser, echter_durchmesser_cm=45):
    return echter_durchmesser_cm / pixel_durchmesser  # cm pro Pixel

px_pro_cm = berechne_kalibrierung(pixel_durchmesser=180)
hebelarm_cm = hebelarm_pixel * px_pro_cm
```

---

### Output für die Physik-Engine

Nach der 3D-Rekonstruktion stehen bereit:
- Echte 3D-Koordinaten aller Keypoints in cm
- Hebelarmlänge in cm
- Winkel in Grad (ohne Perspektivfehler)
- → Drehmoment in Nm (bei bekanntem Gewicht)
