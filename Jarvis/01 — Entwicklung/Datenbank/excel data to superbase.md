> Verwandte Notizen: [[DB/1 gemini]] · [[DB/2 gemini]] · [[DB/claude code die Struktur erklären]] · [[MOC — Gym App]]

  Wenn du exercise1.xlsx aktualisierst:
  1. Datei als CSV (Semikolon-getrennt) speichern → C:\Users\kubis\app\claude
  code\files\exercise1.csv
  2. Script ausführen: C:\Users\kubis\anaconda3\python.exe
  data\import_exercises.py
  3. Die generierte data\output.sql im Supabase SQL Editor ausführen

  Was das Script macht:
  - Liest exercise1.csv → 8 Combos, 73 Übungen, 872 Equipment-Optionen (mit
  allen 41 Config-Spalten — bisher fehlten 17)
  - Liest exercise builder perspektiven.csv → neue Tabelle exercise_perspective
  in Supabase
  - Generiert UPSERT-SQL das sicher re-importiert werden kann

  Wichtig: Das Script löscht vorhandene exercise + equipment_option Daten (inkl.
   plan_exercise durch CASCADE). Solange du noch keine echten Nutzerdaten hast,
  ist das kein Problem.