
### 1. Die "Gesichter" der App (Wo du den Inhalt änderst)

Alles, was du auf dem Bildschirm siehst, liegt im Ordner **`app/`**. Das ist das "Routing" deiner App:

- **Die Hauptansicht:** `app/(tabs)/index.tsx` (Das ist meistens der Home-Screen).
    
- **Die Tabs:** Wenn du die Buttons unten in der Leiste ändern willst, schau in `app/(tabs)/_layout.tsx`.
    
- **Spezielle Screens:** Willst du das Design beim Scannen ändern? Dann ist es `app/scan/`. Willst du den Trainingsplan ändern? Dann `app/plan-detail/`.
    

### 2. Die "Bausteine" (Wo du das Design änderst)

Wenn du globale Dinge ändern willst (wie Buttons, Karten oder Diagramme), schau in den Ordner **`components/`**.

- **`PlanCard.tsx`**: Wie ein Trainingsplan-Eintrag aussieht.
    
- **`ProgressChart.tsx`**: Wie deine Fortschritte grafisch dargestellt werden.
    

### 3. Farben und Styling

Das ist der wichtigste Punkt für eine schnelle UI-Änderung:

- **`constants/colors.ts`**: Hier sind wahrscheinlich alle Farben (Primärfarbe, Hintergrund etc.) definiert. Wenn du hier eine Farbe änderst, ändert sie sich in der **ganzen App**.