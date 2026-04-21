
 Option A — Procedurales SVG (Erweiterung des aktuellen Ansatzes)
  Strichmännchenposition wird aus den Einstellungen berechnet (Bench-Winkel, Body:Bench, Grip etc.) und dynamisch gezeichnet. Kein Internet nötig, 100%
  kontrollierbar, aber wir müssen jede Pose manuell definieren.

  Option B — Pre-rendered Bilderset
  Für jede Übung + Perspektive + Konfiguration ein Bild erstellen (z.B. mit Blender, Adobe Illustrator, oder einer 3D-Figur). Die App wählt dann anhand der
  Einstellungen das richtige Bild aus. Aufwändig zu erstellen, aber beste Qualität.

  Option C — KI-Bilderzeugung (DALL-E / Stable Diffusion)
  Beim ersten Öffnen einer Konfiguration wird ein Bild generiert und gecacht. Gute Qualität, aber langsam, teuer pro Request, und inkonsistent zwischen
  Übungen.

  Option D — 3D-Modell (Three.js / Sketchfab)
  Ein animierbares 3D-Menschenmodell wird mit dem richtigen Kamerawinkel gerendert. Beste langfristige Lösung, aber komplex zu implementieren.

  ---
  Meine Empfehlung: Option A kurzfristig (wir haben schon die Grundlage), Option B mittelfristig — du erstellst einmal gute Bilder pro Übung+Perspektive,
  wir verknüpfen sie mit den Einstellungen.