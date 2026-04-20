# Supabase Migrations

Alle SQL-Dateien die in der Supabase DB ausgeführt wurden, in chronologischer Reihenfolge.

## Regel

**Erst committen, dann in Supabase ausführen.**
Für Korrekturen immer eine neue Datei anlegen (nie alte Dateien überschreiben).

---

## Migrations

| Datei | Beschreibung | Status |
|-------|-------------|--------|
| `001_schema_restructure.sql` | Haupt-Schema-Migration: fügt `place` + `weight_type` zu `exercises` hinzu, ändert `is_default_setup` von Boolean zu Text ('false'/'true'/'star') | ✅ ausgeführt |
| `002_missing_tables.sql` | Fehlende Tabellen: `training_plans`, `plan_days`, `plan_day_muscle_groups`, `workout_sessions`, `set_logs` | ✅ ausgeführt |
| `003_prep_muscle_groups.sql` | Vorbereitung vor Import: Delts→Shoulder umbenennen, `muscle`-Tabelle anlegen, `exercise_muscle_activation`-Tabelle anlegen | ✅ ausgeführt |
| `004_import_exercises_legacy.sql` | Generiert von `import_exercises.js` (altes Format mit `exercise_combo`/`equipment_option`) — archiviert, nicht mehr ausführbar | ⚠️ legacy |
| `005_fix_details_star.sql` | Bugfix: WAHR\* Werte in `details`-JSONB auf 'star' korrigiert | ✅ ausgeführt |
| `006_exercise_variant_schema.sql` | Varianten-System: `exercise_variant_group`, `exercise_variant_axis`, `exercise_variant_member` Tabellen | ✅ ausgeführt |
| `007_seed_lat_pull_row_variants.sql` | Seed: Lat Pull + Lat Row (1 vs 2 Cables) Varianten-Gruppen | ✅ ausgeführt |
| `008_seed_execution_duplicates.sql` | Seed: alle weiteren var-Detail Gruppen (curl, extension, overhead extension, etc.) | ✅ ausgeführt |
| `009_seed_fc_oh_triceps.sql` | Seed: Free + Cable Triceps Overhead Extension (auto-generiert aus CSV) | ✅ ausgeführt |
| `010_correction_equipment.sql` | Korrektur: 419 falsche Einträge in `equipment.details` und `is_default_setup` aus CSV richtiggestellt | ⏳ noch nicht ausgeführt |

---

## Docs

| Datei | Beschreibung |
|-------|-------------|
| `docs/guide_fc_oh_triceps.sql` | Erklärungs-Dokument für das Free+Cable OH Triceps DB-Modell (kein ausführbares SQL) |

---

## Neue Migration anlegen

1. Neue Datei anlegen: `011_beschreibung.sql`
2. Git committen
3. In Supabase SQL Editor ausführen
4. Status in dieser README auf ✅ setzen
