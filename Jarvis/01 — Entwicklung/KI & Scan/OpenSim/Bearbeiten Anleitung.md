
Koordinaten verstehen (MoBL-ARMS)

  ![[Pasted image 20260419162657.png]] 
  ---
  Dein Fix-Workflow

  1. OpenSim → Coordinates-Panel
  Zieh die Slider bis der Arm so steht wie du es willst. Lies die Werte ab.

  2. .mot-Datei in Texteditor öffnen
  Die Datei ist Tab-getrennt. Jede Spalte ist eine Koordinate, jede Zeile ein Frame.

  Für dein Problem (Arm liegt am Körper an) ist shoulder_elv_r zu niedrig. Beim Pushdown sollte er ~15–20° sein mit elv_angle_r ~0° (Arm hängt leicht vor
  dem Körper).

  3. Spalte ändern
  In VS Code: Ctrl+H → Spaltenname suchen → Wert ersetzen.
  Oder direkt: die Spalte shoulder_elv_r ist komplett konstant — einfach alle Werte auf deinen abgelesenen Wert setzen.

  4. Motion neu laden
  In OpenSim: File → Load Motion nochmal auf dieselbe Datei.

  ---
  Schneller: Python-Einzeiler

  # Am Ende der .mot eine Spalte komplett überschreiben:
  python -c "
  import pandas as pd
  path = r'OpenSim/generated_inputs/pushdown_staight_13/pushdown.mot'
  df = pd.read_csv(path, sep='\t', skiprows=6)
  df['shoulder_elv_r'] = 20.0   # <-- dein Wert
  df['shoulder_elv_l'] = 20.0
  df['elv_angle_r']    = 0.0    # Arm vor dem Körper
  df['elv_angle_l']    = 0.0

  # Header erhalten
  header = open(path).readlines()[:7]
  with open(path, 'w') as f:
      f.writelines(header)
      df.to_csv(f, sep='\t', index=False, lineterminator='\n')
  "