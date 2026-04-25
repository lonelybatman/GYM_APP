---
title: "Erklärung Schulter-Koordinaten (MoBL-ARMS)"
tags: [opensim, kinematik, schulter, mobl-arms]
type: reference
---

# Schulter-Koordinaten — MoBL-ARMS OpenSim Modell

## Gelenkkette im Modell

Das Modell zerlegt das Schultergelenk in **3 hintereinandergeschaltete Phantom-Joints**:

```
scapphant_r
  └─ shoulder0_r  →  elv_angle_r      (Rotation um Scapula-Y-Achse)
       └─ humphant_r
            └─ shoulder1_r  →  shoulder_elv_r   (Elevation in der Ebene)
                 └─ humphant1_r
                      └─ shoulder2_r  →  shoulder_rot_r   (Axialrotation Humerus)
                           └─ humerus_r
```

Das ist eine **YXY Euler-Zerlegung** des Glenohumeralgelenks.

---

## Die drei Koordinaten

### 1. `elv_angle` — *Welche Ebene?*

> [!INFO] Referenzframe: **Scapula** (`scapphant_r`)
> Rotation um die Y-Achse der Scapula — wählt die Ebene, bevor der Arm sich bewegt.

| Wert | Bedeutung |
|---|---|
| `0°` | Sagittalebene — Arm geht nach vorne |
| `90°` | Frontalebene — Arm geht seitlich |
| `-90°` | Arm geht nach hinten |

**Quelle im .osim:** Joint `shoulder0_r`, Achse `≈ (0, 1, 0)` im Scapula-Frame.

---

### 2. `shoulder_elv` — *Wie hoch?*

> [!INFO] Referenzframe: **humphant_r** (nach `elv_angle`-Rotation)
> Elevation des Arms innerhalb der zuvor gewählten Ebene.

| Wert | Bedeutung |
|---|---|
| `0°` | Arm hängt herunter |
| `90°` | Arm horizontal |
| `180°` | Arm senkrecht nach oben |

---

### 3. `shoulder_rot` — *Wie gedreht?*

> [!INFO] Referenzframe: **Humerus-Längsachse**
> Axialrotation des Humerus um seine eigene Längsachse — unabhängig von `elv_angle`.

| Wert | Bedeutung |
|---|---|
| `0°` | Neutral |
| `> 0°` | Außenrotation |
| `< 0°` | Innenrotation |

---

## `elv_angle_override` vs. `elv_angle_world`

> [!WARNING] Wichtiger Unterschied
> Weil die **Scapula sich mit dem Körper dreht** (z.B. beim Liegen), weichen Scapula-Frame und Weltframe voneinander ab.

| Spalte | Frame | Wann verwenden |
|---|---|---|
| `elv_angle_override` | **Scapula-Frame** | Bewegungsebene ist relativ zum Körper definiert (z.B. freie Gewichte im Liegen) |
| `elv_angle_world` | **Weltframe** | Ebene durch externe Kraftrichtung fixiert (z.B. Kabelübungen im Stehen) |

**Beispiel Flachbank-Drücken (liegend):**
- Körper ist 90° zur Welt gedreht
- `elv_angle_override` (Scapula-Frame) = `0°` → sagittal zum Körper
- `elv_angle_world` = `90°` → Arm drückt senkrecht nach oben in der Welt

**Wenn beide `None`** → automatische Berechnung aus der `Ebene`-Spalte (sag=0°, l-s=67.5°, lat=90° etc.)

---

## Entscheidungshilfe: Was setze ich wann?

```
Übung hat feste Bewegungsebene relativ zum Körper?
  → elv_angle_override

Übung hat feste Kraftrichtung in der Welt (Kabel, Schwerkraft)?
  → elv_angle_world

Standardebene aus "Ebene"-Spalte reicht?
  → beide None lassen
```
