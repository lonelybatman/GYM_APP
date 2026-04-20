
> Verwandte Notizen: [[To Do's_1]] · [[To Do's_2]] · [[claude code die Struktur erklären]] · [[MOC — Gym App]]

![[Pasted image 20260405221643.png]]



Warum gibt es Dubletten in der Excel Tabelle? Da es von der gleichen Übung verschiedene Ausführungsvarianten gibt, welche sich mit den Details von den anderen Ausführungsvarianten unterscheidet, werden sie auch als eigene Exercises betrachtet aber sind dennoch im selben Exercise Builder auszuwählen. Es gibt immer ein ausschlaggebendes Detail, welches bei Änderung zwischen den Exercises switchen soll. Ich werde diese ausschlaggebende Details in dieser Erklärung als "var-Detail" bezeichnen. Im folgenden werde ich dir bei Lat Pull die Funktionsweise erklären und bei den darauffolgenden nur sagen welche Details die var-Details sind. 

Bei Lat Pull soll man im Exercise Builder bei dem Detail "Cables used" 1 oder 2 wählen können. Diese zwei Möglichkeiten werden in der Excel Tabelle getrennt beschrieben. Wenn man 1 cable wählt dann verwendet man den Exercise Place was in der Excel Tabelle als "Lat pull" beschrieben ist. Wenn man 2 Cable used wählt verwendet man den Exercise Place was in der Excel Tabelle als "Lat pull2" beschrieben ist. Sie sollen als zwei verschiedene Exercise Places betrachtet werden, aber sollen zusammen in einem Exercise Builder stehen. Man wechselt also den Exercise Place zwischen "Lat Pull" und "Lat Pull2" indem man das Detail "Cables used" ändert. 
Durch diese Erklärung kann man die Duplikate crunch, curl, extension und pull klar definieren.

Bei Lat Row soll es genau gleich funktionieren. 

bench + cable: 
curl: var-Detail = "bench : cable" mit den Auswahlmöglichkeiten 180° und 0° 
extension: var-Detail = "planes" mit den Auswahlmöglichkeiten lat, l-s und sag
fly: var-Detail = "cable height" mit den Auswahlmöglichkeiten 1-8, 9-15 und 16-22
overhead extension: var-Detail = "planes" mit den Auswahlmöglichkeiten lat, l-s und sag

free + cable: 
curl: var-Detail = "stand" mit den Auswahlmöglichkeiten 180° und 0° 
extension: var-Detail = "planes" mit den Auswahlmöglichkeiten lat und sag
overhead extension: var-Detail = "planes" mit den Auswahlmöglichkeiten lat, l-s und sag

bench + freeweight:  
press: var-Detail = "becnh" mit den Auswahlmöglichkeiten flat und incl
rear raise: var-Detail = "body pos" mit den Auswahlmöglichkeiten 180° und sitting
skull crusher: var-Detail = "plane" mit den Auswahlmöglichkeiten sag und s-t

overhead extension: das sind insgesamt 4 Ausführungsvarianten. hier gibt es zwei var-Details. 3 davon haben "Hands used"=2 aber unterschiedliche Planes. Eine davon hat bei "Hands used"=1 aber keine plane. Also var-Detail_1 = "plane" mit den Auswahlmöglichkeiten lat, l-s und sag. var-Detail_2 = "Hands used" mit den Auswahlmöglichkeiten 1 und 2. Funktionsweise im Exercise Builder: Wenn man Bench + Freeweight triceps overhead extension öffnet, dann wird zuerst Hands used = 2 und Plane = l-s, weil die Superdefault Exercise diese Details eingestellt hat. Wenn man nun auf Hands used 1 drückt soll es zur Exercise wechseln welche bei Hands used = 1 hat und keine Plane zum auswählen hat. Wenn man wieder auf Hands used 2 drückt soll wieder die Superdefault Voreinstellung ausgewählt werden. Wenn man dann Plane = lat auswählt, dann soll es zur Exercise wechseln welche bei Hands used = 2 und Plane = lat eingestellt hat. 