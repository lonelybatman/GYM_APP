
 Projekt-Konfiguration

  ┌──────────────────────────────────┬────────────────────────────────────────────────┐
  │              Datei               │                     Zweck                      │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ package.json / package-lock.json │ npm-Abhängigkeiten & Skripte                   │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ tsconfig.json                    │ TypeScript-Konfiguration                       │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ babel.config.js                  │ Babel-Transpiler-Einstellungen                 │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ metro.config.js                  │ Metro Bundler (React Native)                   │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ app.json                         │ Expo App-Metadaten (Name, Icons, etc.)         │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ .env.local                       │ Lokale Umgebungsvariablen (Supabase Keys etc.) │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ .gitignore / .npmrc              │ Git & npm Einstellungen                        │
  ├──────────────────────────────────┼────────────────────────────────────────────────┤
  │ .expo/                           │ Expo interne Cache-Dateien                     │
  └──────────────────────────────────┴────────────────────────────────────────────────┘

  ---
  App-Screens (Routen)

  ┌───────────────────────────────────────┬──────────────────────────────────────┐
  │                 Datei                 │                Zweck                 │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/_layout.tsx                       │ Root-Layout (Navigation, Auth-Guard) │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/(auth)/login.tsx                  │ Login-Screen                         │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/(auth)/register.tsx               │ Registrierungs-Screen                │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/(tabs)/index.tsx                  │ Home-Tab                             │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/(tabs)/new.tsx                    │ Neues Training starten               │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/(tabs)/plans.tsx                  │ Trainingsplan-Übersicht              │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/(tabs)/profile.tsx                │ Profil-Screen                        │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/(tabs)/settings.tsx               │ Einstellungen                        │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/create-plan/step1–4.tsx           │ Wizard zum Erstellen eines Plans     │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/day-overview/[planDayId].tsx      │ Übersicht eines Trainingstages       │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/exercise-builder/[exerciseId].tsx │ Übung konfigurieren                  │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/plan-detail/[planId].tsx          │ Plandetails                          │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/progress/[planExerciseId].tsx     │ Fortschrittsanzeige                  │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/set-tracking/[planExerciseId].tsx │ Sätze tracken                        │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/scan/bench-angle.tsx              │ Scan: Bankwinkel erkennen            │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/scan/weights.tsx                  │ Scan: Gewichte erkennen              │
  ├───────────────────────────────────────┼──────────────────────────────────────┤
  │ app/scan/plan-import.tsx              │ Scan: Plan importieren               │
  └───────────────────────────────────────┴──────────────────────────────────────┘

  ---
  Komponenten

  ┌────────────────────────────────────────────────────────┬─────────────────────────────────────┐
  │                         Datei                          │                Zweck                │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/PlanCard.tsx                                │ Karte für einen Trainingsplan       │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/DayTabSelector.tsx                          │ Tab-Auswahl für Trainingstage       │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/ProgressChart.tsx                           │ Fortschritts-Diagramm               │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/StepHeader.tsx                              │ Header im Wizard                    │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/exercise-builder/HumanModel3D.tsx           │ 3D-Menschenmodell für Muskelauswahl │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/exercise-builder/MuscleActivationBar.tsx    │ Balken für Muskelaktivierung        │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/exercise-builder/BenchAnglePicker.tsx       │ Bankwinkel-Auswahl                  │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/exercise-builder/StickFigure.tsx            │ 2D-Strichmännchen                   │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/exercise-builder/ParamRow.tsx               │ Parameter-Zeile im Builder          │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/exercise-builder/PerspectivePlaceholder.tsx │ Platzhalter für Perspektive         │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/set-tracking/SetRow.tsx                     │ Eine Satz-Zeile beim Tracking       │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/set-tracking/NumPad.tsx                     │ Nummernpad für Gewicht/Wdh.         │
  ├────────────────────────────────────────────────────────┼─────────────────────────────────────┤
  │ components/set-tracking/ExtraWeightPanel.tsx           │ Panel für Zusatzgewicht             │
  └────────────────────────────────────────────────────────┴─────────────────────────────────────┘

  ---
  Business Logic / Lib

  ┌────────────────────────────────────────────┬─────────────────────────────────────┐
  │                   Datei                    │                Zweck                │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/supabase.ts                            │ Supabase-Client-Initialisierung     │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/auth.ts / lib/auth-context.tsx         │ Authentifizierungslogik & Context   │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/create-plan-store.tsx                  │ Zustand beim Plan-Erstellen (Store) │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/local-storage.ts                       │ Lokaler Speicher (AsyncStorage)     │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/muscle-data.ts                         │ Muskeldaten (Positionen, Gruppen)   │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/muscle-hierarchy.ts                    │ Muskel-Hierarchie-Struktur          │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/claude-vision.ts                       │ Claude AI Vision API Integration    │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/i18n.ts                                │ Mehrsprachigkeit (i18n)             │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/exercise-builder/types.ts              │ TypeScript-Typen für den Builder    │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/exercise-builder/config-utils.ts       │ Hilfsfunktionen für Konfiguration   │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/exercise-builder/variant-resolution.ts │ Variantenauflösung                  │
  ├────────────────────────────────────────────┼─────────────────────────────────────┤
  │ lib/exercise-builder/abbreviation.ts       │ Abkürzungslogik                     │
  └────────────────────────────────────────────┴─────────────────────────────────────┘

  ---
  Datenbank-Queries

  ┌──────────────────────────────────┬─────────────────────────┐
  │              Datei               │          Zweck          │
  ├──────────────────────────────────┼─────────────────────────┤
  │ lib/queries/exercises.ts         │ Übungen laden/speichern │
  ├──────────────────────────────────┼─────────────────────────┤
  │ lib/queries/exercise-variants.ts │ Übungsvarianten         │
  ├──────────────────────────────────┼─────────────────────────┤
  │ lib/queries/muscles.ts           │ Muskeldaten aus DB      │
  ├──────────────────────────────────┼─────────────────────────┤
  │ lib/queries/set-tracking.ts      │ Sätze speichern/laden   │
  ├──────────────────────────────────┼─────────────────────────┤
  │ lib/queries/training-plans.ts    │ Trainingspläne          │
  └──────────────────────────────────┴─────────────────────────┘

  ---
  Datenbank – SQL & Migrations

  ┌───────────────────────────────────────────────────────┬─────────────────────────────┐
  │                         Datei                         │            Zweck            │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ migration.sql                                         │ Haupt-Datenbankmigrierung   │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/exercise_variant_schema.sql                      │ Schema für Übungsvarianten  │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/exercise_variant_seed_lat_pull_row.sql           │ Seed-Daten: Lat-Zug/Rudern  │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/exercise_variant_seed_execution_duplicates.sql   │ Seed: Duplikat-Fixes        │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/exercise_variant_guide_free_cable_oh_triceps.sql │ Seed: Kabelzug Trizeps      │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/seed_fc_oh_triceps_from_csv.sql                  │ Seed aus CSV                │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/prep_muscle_groups.sql                           │ Muskelgruppen vorbereiten   │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/fix_details_star.sql                             │ Bugfix für Details-Felder   │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/output.sql                                       │ Generiertes SQL-Output      │
  ├───────────────────────────────────────────────────────┼─────────────────────────────┤
  │ data/new_DB/schema_missing_tables.sql                 │ Fehlende Tabellen im Schema │
  └───────────────────────────────────────────────────────┴─────────────────────────────┘

  ---
  Datenbank – Rohdaten / CSV

  ┌─────────────────────────────────────────┬─────────────────────────┐
  │                  Datei                  │          Zweck          │
  ├─────────────────────────────────────────┼─────────────────────────┤
  │ data/exercise1.csv / .xlsx              │ Übungsdaten (Rohdaten)  │
  ├─────────────────────────────────────────┼─────────────────────────┤
  │ data/muscle.xlsx                        │ Muskeldaten             │
  ├─────────────────────────────────────────┼─────────────────────────┤
  │ data/abkürzungen_ex1.xlsx               │ Abkürzungen für Übungen │
  ├─────────────────────────────────────────┼─────────────────────────┤
  │ data/exercise builder perspektiven.xlsx │ Perspektiven-Daten      │
  ├─────────────────────────────────────────┼─────────────────────────┤
  │ data/new_DB/exercises_rows.csv          │ Übungen für neue DB     │
  ├─────────────────────────────────────────┼─────────────────────────┤
  │ data/new_DB/muscles_rows.csv            │ Muskeln für neue DB     │
  ├─────────────────────────────────────────┼─────────────────────────┤
  │ data/new_DB/equipment_rows.csv          │ Equipment für neue DB   │
  └─────────────────────────────────────────┴─────────────────────────┘

  ---
  Skripte (Import / Maintenance)

  ┌─────────────────────────────────────────────┬───────────┬───────────────────────────────────┐
  │                    Datei                    │  Sprache  │               Zweck               │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/import_exercises.py / .js              │ Python/JS │ Übungen importieren               │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/upload_to_supabase.py                  │ Python    │ Daten zu Supabase hochladen       │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/sync_exercises.py                      │ Python    │ Übungen synchronisieren           │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/migrate_exercises_v2.py                │ Python    │ Übungen migrieren v2              │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/check_duplicate_exercises.py           │ Python    │ Duplikate prüfen                  │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/check_extension_bug.py                 │ Python    │ Extension-Bug debuggen            │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/fix_details_star.py                    │ Python    │ Details-Felder fixen              │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/fix_extension_1rope.py                 │ Python    │ 1-Rope Extension fixen            │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ data/scripts/generate-fc-oh-triceps-sql.mjs │ JS        │ SQL generieren                    │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ check-db.mjs                                │ JS        │ DB-Check-Skript                   │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ find-duplicate-exercises.mjs                │ JS        │ Duplikate finden                  │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ list-exercises-for-variants.mjs             │ JS        │ Übungen für Varianten listen      │
  ├─────────────────────────────────────────────┼───────────┼───────────────────────────────────┤
  │ read-bones.js                               │ JS        │ Knochen-Daten aus 3D-Modell lesen │
  └─────────────────────────────────────────────┴───────────┴───────────────────────────────────┘

  ---
  Dokumentation / Konzepte

  ┌──────────────────────────────────┬─────────────────────────────┐
  │              Datei               │            Zweck            │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/gym_app_briefing.docx       │ Gesamtes App-Briefing       │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/exercise_builder_logic.docx │ Logik des Exercise Builders │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/abbreviation_logic_v2.docx  │ Abkürzungslogik v2          │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/perspective_logic.docx      │ Perspektiven-Logik          │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/set_tracking_logic_v2.docx  │ Set-Tracking-Logik v2       │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/muscle_hierarchy.docx       │ Muskel-Hierarchie-Konzept   │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/briefing_text.txt           │ Briefing als Text           │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/hierarchy_text.txt          │ Hierarchie als Text         │
  ├──────────────────────────────────┼─────────────────────────────┤
  │ data/set_tracking_text.txt       │ Set-Tracking als Text       │
  └──────────────────────────────────┴─────────────────────────────┘

  ---
  3D-Modelle (Blender)

  ┌────────────────────────────────────┬────────────────────────────────────┐
  │               Datei                │               Zweck                │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ assets/models/human.glb            │ 3D-Menschenmodell (in App genutzt) │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ blender/human.blend                │ Blender-Quelldatei Mensch          │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ blender/bench.blend / bench2.blend │ Blender-Quelldateien Bank          │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ blender/bench.glb                  │ Exportiertes Bank-Modell           │
  └────────────────────────────────────┴────────────────────────────────────┘

  ---
  Lokalisierung & Typen

  ┌─────────────────────┬──────────────────────────┐
  │        Datei        │          Zweck           │
  ├─────────────────────┼──────────────────────────┤
  │ locales/de.json     │ Deutsche Übersetzungen   │
  ├─────────────────────┼──────────────────────────┤
  │ locales/en.json     │ Englische Übersetzungen  │
  ├─────────────────────┼──────────────────────────┤
  │ types/index.ts      │ Globale TypeScript-Typen │
  ├─────────────────────┼──────────────────────────┤
  │ constants/colors.ts │ Farb-Konstanten          │
  └─────────────────────┴──────────────────────────┘

  ---
  Sonstiges

  ┌──────────────────────┬──────────────────────────────────────────────────┐
  │        Datei         │                      Zweck                       │
  ├──────────────────────┼──────────────────────────────────────────────────┤
  │ App.tsx / index.ts   │ App-Einstiegspunkt                               │
  ├──────────────────────┼──────────────────────────────────────────────────┤
  │ lib/supabase-test.ts │ Supabase Verbindungstest                         │
  ├──────────────────────┼──────────────────────────────────────────────────┤
  │ data/.env            │ Umgebungsvariablen für Datenskripte              │
  ├──────────────────────┼──────────────────────────────────────────────────┤
  │ git lernen/          │ Git-Lernmaterialien (kein App-Code)              │
  ├──────────────────────┼──────────────────────────────────────────────────┤
  │ app_gym/ / gym_app/  │ Duplikate des Projekts (unklar ob aktiv genutzt) │
  └──────────────────────┴──────────────────────────────────────────────────┘
