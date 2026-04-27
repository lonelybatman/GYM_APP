Um eine App zu entwickeln, die Biomechanik und Kinetik von Fitnessgeräten analysiert, müssen physikalische Prinzipien der Statik und Dynamik auf die Geometrie der Maschine angewendet werden. Die Analyse gliedert sich in die Bestimmung des Widerstandsprofils und die Ableitung des Muskelaktivierungsprofils.

### 1. Bestimmung des Widerstandsprofils

Das Widerstandsprofil beschreibt, wie sich das effektive Drehmoment MresM_{\text{res}}Mres​, das der Nutzer überwinden muss, über den Bewegungsumfang (Range of Motion, ROM) verändert.

- **Geometrische Erfassung:** Aus den Bildern oder Videos müssen die Drehpunkte (Gelenke der Maschine), Hebelarme und die Position des Gewichtsblocks extrahiert werden.
- **Berechnung des Drehmoments:** Das Widerstandsmoment an der Kontaktstelle (z. B. Griff oder Polster) wird durch das Hebelgesetz bestimmt:  
    M=Fg⋅r⊥M = F_{\text{g}} \cdotp r_{\perp}M=Fg​⋅r⊥​  
    wobei FgF_{\text{g}}Fg​ die Gewichtskraft und r⊥r_{\perp}r⊥​ der senkrechte Abstand (Hebelarm) zum Drehpunkt ist.
- **Einfluss von Exzentern (Cams):** Viele moderne Maschinen nutzen unrunde Scheiben (Exzenter), um den Hebelarm r(θ)r(\theta)r(θ) in Abhängigkeit vom Winkel θ\thetaθ zu verändern. Das Profil ergibt sich aus:  
    M(θ)=FKabel⋅rcam(θ)M(\theta) = F_{\text{Kabel}} \cdotp r_{\text{cam}}(\theta)M(θ)=FKabel​⋅rcam​(θ)

![Visual content](https://files.gpai.app/visuals/vis_1777162013411_khp3hioc/vvr_1777162027875_1awz6x8u.png)

Bearbeiten

Neu generieren

Herunterladen

### 2. Analyse des Muskelaktivierungsprofils

Das Muskelaktivierungsprofil korreliert mit der Drehmoment-Winkel-Beziehung des menschlichen Gelenks.

- **Internes vs. Externes Drehmoment:** Damit eine Bewegung stattfindet, muss das interne Drehmoment der Muskeln MintM_{\text{int}}Mint​ das externe Widerstandsmoment MextM_{\text{ext}}Mext​ übersteigen:  
    Mint=∑(Fmuskel⋅dmuskel)M_{\text{int}} = \sum (F_{\text{muskel}} \cdotp d_{\text{muskel}})Mint​=∑(Fmuskel​⋅dmuskel​)  
    Hierbei ist dmuskeld_{\text{muskel}}dmuskel​ der Lastarm der Sehne zum Gelenkzentrum.
- **Längen-Spannungs-Beziehung:** Die Fähigkeit eines Muskels, Kraft zu erzeugen, variiert mit seiner Länge. Die App muss die Gelenkwinkel des Nutzers (via Pose Estimation) erfassen, um zu bestimmen, in welchem Abschnitt der Längen-Spannungs-Kurve sich der Muskel befindet (verkürzt, neutral, gedehnt).

### 3. Mathematische Modellierung der Lastkurve

Um das Profil zu berechnen, wird das Verhältnis von externem Lastarm Lext(θ)L_{\text{ext}}(\theta)Lext​(θ) zu internem Hebelarm dint(θ)d_{\text{int}}(\theta)dint​(θ) über die Zeit ttt oder den Winkel θ\thetaθ integriert:

Relative Last(θ)=Mext(θ)Mmax, isometrisch(θ)Mext(θ)=FLast⋅Rcam(θ)Rhebel\begin{aligned} \text{Relative Last}(\theta) &= \frac{M_{\text{ext}}(\theta)}{M_{\text{max, isometrisch}}(\theta)} \\[10pt] M_{\text{ext}}(\theta) &= F_{\text{Last}} \cdotp \frac{R_{\text{cam}}(\theta)}{R_{\text{hebel}}} \end{aligned}Relative Last(θ)Mext​(θ)​=Mmax, isometrisch​(θ)Mext​(θ)​=FLast​⋅Rhebel​Rcam​(θ)​​

### 4. Implementierungsschritte für die App

2. **Bildverarbeitung:** Nutzung eines Convolutional Neural Networks (CNN) zur Identifikation der Maschinenteile und deren Rotationsachsen.
3. **Vektoranalyse:**
    
    - Identifikation des Lastvektors (Schwerkraftrichtung).
    - Berechnung des effektiven Hebelarms in 15-Grad-Schritten über die gesamte ROM.
    
4. **Zuordnung der Muskelgruppen:** Abgleich der Bewegungsamplitude mit einer biomechanischen Datenbank (z. B. OpenSim), um Primärbeweger (Agonisten) und Hilfsmuskeln (Synergisten) zu definieren.
5. **Ausgabe:** Erstellung eines Graphen, der die "Difficulty" (Schwierigkeit) gegen den "Stretch" (Dehnungsgrad des Muskels) aufträgt.

---

**Zusammenfassung der Analyseergebnisse:**

- **Widerstandsprofil:** Zeigt, ob die Maschine in der gedehnten Position (unten/vorne) oder in der kontrahierten Position (oben/hinten) am schwersten ist.
- **Muskelaktivierung:** Prognostiziert basierend auf der elektromyographischen (EMG) Erwartungshaltung, welche Fasern bei der gegebenen Lastkurve am stärksten rekrutiert werden.