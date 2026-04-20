/**
 * Liest data/new_DB/exercises_rows.csv + equipment_rows.csv und erzeugt
 * data/seed_fc_oh_triceps_from_csv.sql — nur die drei Free+Cable-Overhead-Triceps-IDs.
 *
 * Ausführung (Repo-Root):  node data/scripts/generate-fc-oh-triceps-sql.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DATA_NEW = path.join(ROOT, 'data', 'new_DB');
const OUT_SQL = path.join(ROOT, 'data', 'seed_fc_oh_triceps_from_csv.sql');

const TARGET_IDS = new Set([
  '307f2e6f-4403-4ed6-8805-25099c660dce', // l-s (Default)
  'a79a30bd-d721-4117-a45c-6fbd44152dfb', // lat
  'e4236f7e-d066-4d5e-a76a-777eeea053de', // sag
]);

function sqlStr(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

/** exercise_kombi → place / weight_type (wie migration.sql) */
function placeWeight(exKombi) {
  const k = String(exKombi ?? '').toLowerCase().trim();
  if (k === 'free + cable') return { place: 'free', weight_type: 'cable' };
  return { place: null, weight_type: null };
}

function truthySetup(v) {
  if (v === true || v === 'true' || v === 'TRUE') return true;
  if (v === 'star') return true;
  return false;
}

function readCsv(file) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function coerceDetails(detailsCell) {
  if (detailsCell == null || detailsCell === '') return '{}';
  if (typeof detailsCell === 'object') return JSON.stringify(detailsCell);
  return String(detailsCell);
}

async function main() {
  const exPath = path.join(DATA_NEW, 'exercises_rows.csv');
  const eqPath = path.join(DATA_NEW, 'equipment_rows.csv');
  if (!fs.existsSync(exPath) || !fs.existsSync(eqPath)) {
    console.error('Fehlt:', exPath, 'oder', eqPath);
    process.exit(1);
  }

  const allEx = await readCsv(exPath);
  const exercises = allEx.filter((r) => TARGET_IDS.has(r.id));

  if (exercises.length !== 3) {
    console.warn(
      'Erwartet 3 exercises-Zeilen, gefunden:',
      exercises.length,
      '(IDs prüfen / CSV pfad)',
    );
  }

  const allEq = await readCsv(eqPath);
  const equipment = allEq.filter((r) => TARGET_IDS.has(r.exercise_id));

  /** Sortiert: stabiler „erster Default“ → star (Rest true), wie App pickDefault + star erwartet */
  const byEx = new Map();
  for (const r of equipment) {
    if (!byEx.has(r.exercise_id)) byEx.set(r.exercise_id, []);
    byEx.get(r.exercise_id).push(r);
  }
  for (const [, rows] of byEx) {
    rows.sort((a, b) => String(a.equipment_name).localeCompare(b.equipment_name));
  }
  const starKey = new Set();
  for (const [, rows] of byEx) {
    const defaults = rows.filter((r) => truthySetup(r.is_default_setup));
    if (defaults.length > 0) starKey.add(`${defaults[0].exercise_id}\t${defaults[0].id}`);
  }
  const normSetup = (row) => {
    const isDef = truthySetup(row.is_default_setup);
    if (!isDef) return 'false';
    return starKey.has(`${row.exercise_id}\t${row.id}`) ? 'star' : 'true';
  };

  const lines = [];
  lines.push(`-- AUTO-GENERIERT von data/scripts/generate-fc-oh-triceps-sql.mjs`);
  lines.push(`-- Nicht manuell bearbeiten — Skript neu laufen lassen nach CSV-Änderung.`);
  lines.push(`--`);
  lines.push(`-- Voraussetzung: exercises hat u.a. exercise_name, place, weight_type, muscle_id`);
  lines.push(`-- equipment.has is_default_setup als TEXT ('false'|'true'|'star') — nach migration.sql Phase 1–2.`);
  lines.push(`BEGIN;`);
  lines.push(``);

  for (const r of exercises) {
    const { place, weight_type } = placeWeight(r.exercise_kombi);
    lines.push(`INSERT INTO exercises (`);
    lines.push(`  id, exercise_name, muscle_id, is_superdefault, place, weight_type`);
    lines.push(`) VALUES (`);
    lines.push(`  ${sqlStr(r.id)}::uuid,`);
    lines.push(`  ${sqlStr(r.exercise_name)},`);
    lines.push(`  ${sqlStr(r.muscle_id)}::uuid,`);
    lines.push(`  ${r.is_superdefault === 'true' || r.is_superdefault === true ? 'TRUE' : 'FALSE'},`);
    lines.push(`  ${place ? sqlStr(place) : 'NULL'},`);
    lines.push(`  ${weight_type ? sqlStr(weight_type) : 'NULL'}`);
    lines.push(`)`);
    lines.push(`ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`  exercise_name = EXCLUDED.exercise_name,`);
    lines.push(`  muscle_id = EXCLUDED.muscle_id,`);
    lines.push(`  is_superdefault = EXCLUDED.is_superdefault,`);
    lines.push(`  place = COALESCE(EXCLUDED.place, exercises.place),`);
    lines.push(`  weight_type = COALESCE(EXCLUDED.weight_type, exercises.weight_type);`);
    lines.push(``);
  }

  equipment.sort((a, b) => {
    const c = String(a.exercise_id).localeCompare(String(b.exercise_id));
    return c !== 0 ? c : String(a.equipment_name).localeCompare(b.equipment_name);
  });

  for (const r of equipment) {
    const djson = coerceDetails(r.details);
    const setup = normSetup(r);
    lines.push(`INSERT INTO equipment (`);
    lines.push(`  id, exercise_id, equipment_name, is_default_setup, details`);
    lines.push(`) VALUES (`);
    lines.push(`  ${sqlStr(r.id)}::uuid,`);
    lines.push(`  ${sqlStr(r.exercise_id)}::uuid,`);
    lines.push(`  ${sqlStr(r.equipment_name)},`);
    lines.push(`  ${sqlStr(setup)},`);
    lines.push(`  ${sqlStr(djson)}::jsonb`);
    lines.push(`)`);
    lines.push(`ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`  equipment_name = EXCLUDED.equipment_name,`);
    lines.push(`  is_default_setup = EXCLUDED.is_default_setup,`);
    lines.push(`  details = EXCLUDED.details;`);
    lines.push(``);
  }

  lines.push(`COMMIT;`);
  lines.push(``);
  lines.push(`-- Anschließend: exercise_variant_schema.sql + exercise_variant_seed_execution_duplicates.sql`);
  lines.push(`-- (falls noch nicht), damit Gruppe …000017 die drei exercise_id verknüpft.`);

  fs.writeFileSync(OUT_SQL, lines.join('\n'), 'utf8');
  console.log('OK →', OUT_SQL);
  console.log('  exercises:', exercises.length, '  equipment:', equipment.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
