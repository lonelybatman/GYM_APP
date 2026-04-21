---
tags:
  - opensim
  - muskelaktivierung
  - ki
  - python
status: in-progress
erstellt: 2026-04-17
---

> Verwandte Notizen: [[Berechnung von der Muskelaktivierung]] · [[3D Modell in der App]] · [[MOC — Gym App]]

# Muskelaktivierung — OpenSim Fortschritt

## Was bisher gemacht wurde

### Setup (fertig)
- **Conda-Umgebung:** `opensim-env` mit OpenSim 4.5.2 + scipy
- **Modell:** MoBL-ARMS Bimanual — hat beide Arme mit allen relevanten Muskeln
- **Ansatz:** OpenSim für Moment-Arme + scipy SLSQP für Static Optimization

> [!SUCCESS] Erster Durchlauf funktioniert
> Bankdrücken (Langhantel) mit 6 Winkeln (0°/15°/30°/45°/60°/90°) läuft durch und produziert eine JSON-Datei mit Muskelaktivierungen.

### Warum nicht der Standard OpenSim Workflow?
Manager + AnalyzeTool crashen bei diesem Modell (massless thorax + locked coordinates → C++ Segfault). Deshalb eigener Ansatz:
1. OpenSim setzt Gelenkwinkel + liefert Moment-Arme
2. scipy löst das SO-Problem selbst

---

## Erste Ergebnisse (Bankdrücken, 60 kg)

| Winkel | PECM1 | PECM2 | PECM3 | DELT1 | DELT2 |
|--------|-------|-------|-------|-------|-------|
| 0° (flat) | 1.00 | 0.00 | 0.00 | 1.00 | 1.00 |
| 45° (incline) | 1.00 | 0.45 | 0.00 | 1.00 | 1.00 |
| 60° | 1.00 | 0.57 | 0.39 | 1.00 | 0.71 |
| 90° (shoulder press) | 1.00 | 1.00 | 1.00 | 1.00 | 0.00 |

**Trend stimmt:** Höherer Winkel → mehr Pec-Köpfe aktiv, weniger mittlerer Deltoid.

---

## Bekannte Probleme

> [!BUG] Trizeps zeigt 0.0
> Ellbogen-Constraint nicht korrekt formuliert → Trizeps-Beteiligung fehlt komplett.

> [!BUG] Griffweite fehlt
> `elv_angle` (Elevationsebene) ist immer 0 — muss griffbreitenabhängig sein.
> - Eng: ~0–10°
> - Standard: ~30–40°
> - Weit: ~60–75°

> [!BUG] SO konvergiert suboptimal
> Einige Muskeln maxen auf 1.0. Mögliche Lösung: Penalty-Ansatz statt harter Equality-Constraints.

---

## Nächste Schritte

- [ ] Griffweite als Parameter einbauen (`elv_angle` variabel)
- [ ] Trizeps-Fix: Ellbogen-Extension korrekt als Constraint
- [ ] SO stabilisieren (Penalty-Ansatz oder Inequality-Constraints)
- [ ] Weitere Übungen: Kabelzug → Rajagopal-Modell (Unterkörper)
- [ ] JSON-Output in App integrieren → 3D Muscle Highlighting

---

## Relevante Dateien

| Was | Pfad |
|-----|------|
| Hauptskript | `gym-app/OpenSim/scripts/bench_press.py` |
| Modell-Inspector | `gym-app/OpenSim/scripts/inspect_model.py` |
| Koordinaten & Muskeln | `gym-app/OpenSim/scripts/model_info.txt` |
| MoBL-ARMS Modell | `gym-app/OpenSim/MobL_ARMS_OpenSim3_bimanual_model/...` |
| Rajagopal Modell | `gym-app/OpenSim/FullBodyModel-4.0/...` |
| Output JSON | `gym-app/OpenSim/results/bench_press_activations.json` |

## Key Koordinaten (MoBL-ARMS)

```
elv_angle_r/l      → Elevationsebene (Griffweite)
shoulder_elv_r/l   → Schulter-Elevation (Bank-Winkel)
shoulder_rot_r/l   → Schulterrotation
elbow_flexion_r/l  → Ellbogen
pro_sup_r/l        → Pronation/Supination
```

## Key Muskeln

```
PECM1/2/3  → Pectoralis Major (3 Köpfe)
DELT1/2/3  → Deltoid (anterior / medial / posterior)
TRIlong/lat/med → Trizeps (3 Köpfe)
LAT1/2/3   → Latissimus
BIClong/short → Bizeps
```
