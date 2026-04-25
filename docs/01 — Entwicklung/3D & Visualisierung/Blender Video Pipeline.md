
  OpenSim → Blender → Video

  .mot (Gelenkwinkel pro Frame)
      ↓
  Python-Skript (konvertiert OpenSim-Koordinaten → Bone-Rotationen)
      ↓
  Blender Python API (bpy) (wendet Rotationen auf Rig an → rendert Video)
      ↓
  .mp4

  ---
  Warum Blender:
  - Kostenlos
  - Hat eine vollständige Python API (bpy) → 100% automatisierbar
  - Du richtest das Rig einmal ein, danach läuft alles per Skript
  - Beliebige Render-Qualität (simpel bis realistisch)

  ---
  Die 3 Schritte einmalig einrichten:

  1. Rig in Blender — ein vereinfachtes Menschenmodell mit Bones für Schulter, Ellenbogen, Unterarm etc. (z.B. von Mixamo, einmalig kostenlos)

  2. Koordinaten-Mapping — ein Python-Skript das OpenSim-Koordinaten (shoulder_elv, elv_angle, elbow_flexion etc.) auf die entsprechenden Blender-Bones mappt

  3. Render-Skript — Blender im Hintergrund starten, .mot einlesen, Bones setzen, Video rendern, fertig

  ---
  Sobald eingerichtet:
  python render_exercise.py --mot curl.mot --output curl.mp4
  → läuft vollautomatisch für alle Übungen