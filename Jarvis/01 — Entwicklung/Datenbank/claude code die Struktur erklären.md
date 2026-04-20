> Verwandte Notizen: [[1 gemini]] · [[2 gemini]] · [[excel data to superbase]] · [[MOC — Gym App]]

zuerst werden 3 Daten ausgewählt nach denen gefiltert wird: Place, Weighttype und Muscle. Danach wird gewählt ob man nach den Superdefaults sucht oder nach all exercises (all exercises beinhaltet die superdefaults auch). All diese Informationen stehen schon in der Tabelle exercises und ich denke, dass diese auch so passt. Wenn du Einwände hast sag es. 

Wenn man nach Superdefault sucht und auf eine dieser Exercises drückt soll diese Superdefault exercise in der Tabelle equipment gesucht werden. In der Spalte is_default_setup soll es die Möglichkeiten "star", "true" oder "false" geben. star ist dabei die Voreinstellung des Equipments. Es ist egal ob man die Exercise bei Superdefault oder bei All Exercises ausgewählt hat, die Voreinstellung des Equipments soll immer Star sein. Wenn es für die Exercise kein star gibt, dann gibt es ein true welches das voreingestellte Equipment ist. Nun gehen wir eine Ebene tiefer, aber dennoch in der selben Tabelle: die Voreinstellung der Details eines Equipments für eine bestimmte exercise. In meiner Excel Tabelle habe ich die möglichkeiten "WAHR*", "WAHR" und "FALSCH". Diese sollen in der Tabelle auf "star", "true" und "false" geändert werden. Das Prinzip für die Voreinstellung ist die selbe wie zuvor. Wenn es ein star gibt hat dieser Vorrang zu den true. false soll nicht angezeigt werden. Wenn man das Equipment in der App ändert, soll auch die Auswahl der Details sich auf das ändern was in der Tabelle dafür steht. Bei einem Wechsel des Equipments sollen die voreingestellten Details für dieses Equipment gewählt werden. 

Wenn die Spalte is_default_setup so geändert wird wie oben besprochen ist die Spalte possible redundant und kann gelöscht werden.

Danach wird gefiltert nach Place, Weighttype und muscle. In der Tabelle

In der Tabelle exercises stehen die verschiedenen Kombinationen aus Place, Weighttype und deren mögliche exercises. Es steht auf drinnen ob diese Exercise eine Superdefault Exercise ist. 


Die Spalte possible ist redundant und kann gelöscht werden.




  
1. Place & Weighttype 
2. muscle 
3. exercise name (0-1 Superdefault)
4. equipment (0-1 Superdefault pro Ausführung, 0-2 default pro Ausführung)
5. details (0-1 default pro detail)



 


in welcher Art werden die Daten gespeichert? 
Wenn bulk dann werden die details möglichkeiten hintereinander geschrieben und gespeichert. wenn die Details ín der .csv Datei als WAHR* gespeichert sind, sollen sie in der DB so 

oder wenn es so nicht gut genug ist dann machen wir für jedes datail 2 Spalten:
all.grip = alle mögliche grip types
def.grip = default grip types 

immer 1 WAHR* ausbessern in der csv Datei



