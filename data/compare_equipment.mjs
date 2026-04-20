/**
 * compare_equipment.mjs
 *
 * Liest exercise1.csv, lädt die aktuelle Supabase `equipment`-Tabelle
 * und generiert ein Korrektur-SQL (correction_equipment.sql).
 *
 * Usage (aus gym-app Ordner):
 *   node data/compare_equipment.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://abxfmcxuvdvguzzajymt.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieGZtY3h1dmR2Z3V6emFqeW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzkxOTYsImV4cCI6MjA5MDc1NTE5Nn0.q67VzDYnJmRfW5MT12HS2HMZcMwnPyXMuZuPpTgjWZQ';

const EXERCISE1_CSV = path.join(__dirname, 'exercise1.csv');
const OUTPUT_SQL = path.join(__dirname, 'correction_equipment.sql');

// ── Combo → (place, weight_type) ──────────────────────────────────────────
const COMBO_MAP = {
  'free + cable':       ['free',     'cable'],
  'bench + cable':      ['bench',    'cable'],
  'cable + bench':      ['bench',    'cable'],
  'bench + freeweight': ['bench',    'freeweight'],
  'lat pull':           ['lat_pull', 'cable'],
  'lat pull2':          ['lat_pull', 'cable'],
  'lat row':            ['lat_row',  'cable'],
  'lat row 2':          ['lat_row',  'cable'],
  'machine':            ['machine',  'machine'],
  'free + freeweight':  ['free',     'freeweight'],
  'free + smith':       ['free',     'smith'],
};

// ── CSV key → DB details key ───────────────────────────────────────────────
const KEY_MAP = {
  hand_1:             'hands_1',
  hand_2:             'hands_2',
  grip_sup:           'grip_sup',
  grip_sn:            'grip_s_n',
  grip_n:             'grip_n',
  grip_np:            'grip_n_p',
  grip_pro:           'grip_pro',
  plane_lat:          'plane_lat',
  plane_ls:           'plane_l_s',
  plane_sag:          'plane_sag',
  plane_st:           'plane_s_t',
  plane_trans:        'plane_trans',
  plane_tl:           'plane_t_l',
  grip_width_05:      'width_x05',
  grip_width_1:       'width_x1',
  grip_width_15:      'width_x15',
  cable_height_1_8:   'cable_h_1_8',
  cable_height_9_15:  'cable_h_9_15',
  cable_height_16_22: 'cable_h_16_22',
  bench_flat:         'bench_flat',
  bench_incl:         'bench_incl',
  bench_upright:      'bench_upright',
  stand_0:            'stand_0',
  stand_45:           'stand_45',
  stand_90:           'stand_90',
  stand_90os:         'stand_90os',
  stand_135:          'stand_135',
  stand_180:          'stand_180',
  bench_cable_0:      'bench_cable_0',
  bench_cable_90:     'bench_cable_90',
  bench_cable_180:    'bench_cable_180',
  body_bench_0:       'body_bench_0',
  body_bench_45:      'body_bench_45',
  body_bench_90:      'body_bench_90',
  body_bench_135:     'body_bench_135',
  body_bench_180:     'body_bench_180',
  body_pos_lying:     'body_pos_lying',
  body_pos_180:       'body_pos_180',
  body_pos_sitting:   'body_pos_sitting',
  sit_0:              'sit_0',
  sit_90:             'sit_90',
  cables_used_1:      'cables_1',
  cables_used_2:      'cables_2',
};

const CONFIG_COLS = [
  [7,  'hand_1'],           [8,  'hand_2'],
  [9,  'grip_sup'],         [10, 'grip_sn'],        [11, 'grip_n'],
  [12, 'grip_np'],          [13, 'grip_pro'],
  [14, 'plane_lat'],        [15, 'plane_ls'],
  [16, 'plane_sag'],        [17, 'plane_st'],        [18, 'plane_trans'],   [19, 'plane_tl'],
  [20, 'grip_width_05'],    [21, 'grip_width_1'],    [22, 'grip_width_15'],
  [23, 'cable_height_1_8'], [24, 'cable_height_9_15'], [25, 'cable_height_16_22'],
  [26, 'bench_flat'],       [27, 'bench_incl'],      [28, 'bench_upright'],
  [29, 'stand_0'],          [30, 'stand_45'],        [31, 'stand_90'],
  [32, 'stand_90os'],       [33, 'stand_135'],       [34, 'stand_180'],
  [35, 'bench_cable_0'],    [36, 'bench_cable_90'],  [37, 'bench_cable_180'],
  [38, 'body_bench_0'],     [39, 'body_bench_45'],   [40, 'body_bench_90'],
  [41, 'body_bench_135'],   [42, 'body_bench_180'],
  [43, 'body_pos_lying'],   [44, 'body_pos_180'],    [45, 'body_pos_sitting'],
  [46, 'sit_0'],            [47, 'sit_90'],
];

// ── Helpers ────────────────────────────────────────────────────────────────

function parseVal(s) {
  const v = (s ?? '').trim().toUpperCase();
  if (v === 'WAHR*') return 'star';
  if (v === 'WAHR' || v === 'TRUE' || v === '1') return 'true';
  return 'false';
}

function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8').replace(/^\uFEFF/, '');
  return content.split(/\r?\n/).map(l => l.split(';'));
}

function detectCableUsedCols(rows) {
  const sub = rows[2] ?? [];
  let c1 = null, c2 = null;
  for (let i = 0; i < sub.length; i++) {
    const v = (sub[i] ?? '').trim();
    if (v === '1') c1 = i;
    if (v === '2') c2 = i;
  }
  return { cable1Col: c1, cable2Col: c2 };
}

async function fetchAll(path) {
  const pageSize = 1000;
  let offset = 0;
  const allRows = [];
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${path}&limit=${pageSize}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    allRows.push(...rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return allRows;
}

function q(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/'/g, "''") + "'";
}

// ── Parse CSV into expected equipment data ─────────────────────────────────

function parseExerciseCSV() {
  const rows = parseCSV(EXERCISE1_CSV);
  const { cable1Col, cable2Col } = detectCableUsedCols(rows);
  const minCols = Math.max(50, (cable1Col ?? 0) + 1, (cable2Col ?? 0) + 1);

  // Map: "place|weight_type|exercise_name|equipment_name" → { is_default_setup, details }
  const result = new Map();

  let curCombo = null;
  let curEx = null;

  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    while (row.length < minCols) row.push('');

    if (row[0].trim()) curCombo = row[0].trim().toLowerCase().replace(/\s+/g, ' ');
    if (row[3].trim()) curEx = row[3].trim();

    const eqName = row[5].trim();
    if (!eqName || !curCombo || !curEx) continue;

    const [place, weightType] = COMBO_MAP[curCombo] ?? [];
    if (!place) continue;

    const possible = parseVal(row[4]);
    const defaultVal = parseVal(row[6]);

    // Build details (using DB key names)
    const details = {};
    for (const [colIdx, csvKey] of CONFIG_COLS) {
      const dbKey = KEY_MAP[csvKey];
      details[dbKey] = parseVal(row[colIdx]);
    }
    if (cable1Col != null) details['cables_1'] = parseVal(row[cable1Col]);
    if (cable2Col != null) details['cables_2'] = parseVal(row[cable2Col]);

    // is_default_setup maps from col[6]: star/true/false
    // But: if possible=false AND all details are false → is_default_setup='false'
    const isAvailable = possible !== 'false';
    let is_default_setup = defaultVal; // 'false', 'true', or 'star'

    const csvKey = `${place}|${weightType}|${curEx}|${eqName}`;

    // Keep highest-priority version if duplicate
    if (result.has(csvKey)) {
      const prev = result.get(csvKey);
      const priority = { star: 3, true: 2, false: 1 };
      if (priority[is_default_setup] <= priority[prev.is_default_setup]) continue;
    }

    result.set(csvKey, {
      place,
      weight_type: weightType,
      exercise_name: curEx,
      equipment_name: eqName,
      is_default_setup,
      is_available: isAvailable,
      details,
    });
  }

  return result;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Parsing exercise1.csv ...');
  const csvData = parseExerciseCSV();
  console.log(`  ${csvData.size} equipment entries from CSV`);

  console.log('Fetching exercises from Supabase ...');
  const exercises = await fetchAll('exercises?select=id,exercise_name,place,weight_type');
  console.log(`  ${exercises.length} exercises`);

  console.log('Fetching equipment from Supabase ...');
  const equipment = await fetchAll('equipment?select=id,exercise_id,equipment_name,is_default_setup,details');
  console.log(`  ${equipment.length} equipment rows`);

  // Build lookup: exercise_id → { exercise_name, place, weight_type }
  const exById = new Map(exercises.map(e => [e.id, e]));

  // Build lookup: "place|weight_type|exercise_name" → [exercise_id, ...]
  const exByKey = new Map();
  for (const ex of exercises) {
    const k = `${ex.place}|${ex.weight_type}|${ex.exercise_name}`;
    if (!exByKey.has(k)) exByKey.set(k, []);
    exByKey.get(k).push(ex.id);
  }

  const sql = [];
  sql.push('-- ============================================================');
  sql.push('-- correction_equipment.sql');
  sql.push('-- Generated by compare_equipment.mjs');
  sql.push('-- Targets: equipment_option table (equipment is a read-only view)');
  sql.push('-- Run in Supabase SQL Editor');
  sql.push('-- ============================================================');
  sql.push('');

  let updateCount = 0;
  let notFoundInDB = 0;
  let notFoundInCSV = 0;
  const diffReport = [];

  // Convert view value ('false'/'true'/'star') → equipment_option.config value (false/true/'WAHR*')
  function toConfigVal(v) {
    if (v === 'star') return 'WAHR*';
    if (v === 'true') return true;
    return false;
  }

  // Convert view value → is_default / is_default_star booleans
  function toDefaultFlags(v) {
    return {
      is_default_star: v === 'star',
      is_default: v === 'star' || v === 'true',
    };
  }

  // ── Check each DB row against CSV ──
  for (const eq of equipment) {
    const ex = exById.get(eq.exercise_id);
    if (!ex) continue;

    const csvKey = `${ex.place}|${ex.weight_type}|${ex.exercise_name}|${eq.equipment_name.trim()}`;
    const expected = csvData.get(csvKey);

    if (!expected) {
      notFoundInCSV++;
      diffReport.push(`  [CSV MISSING] ${csvKey}`);
      continue;
    }

    const diffs = [];

    // Check is_default_setup
    if (eq.is_default_setup !== expected.is_default_setup) {
      diffs.push(`is_default_setup: DB=${eq.is_default_setup} → CSV=${expected.is_default_setup}`);
    }

    // Check each details field
    const dbDetails = eq.details ?? {};
    for (const dbKey of Object.values(KEY_MAP)) {
      const dbVal = dbDetails[dbKey] ?? 'false';
      const csvVal = expected.details[dbKey] ?? 'false';
      if (dbVal !== csvVal) {
        diffs.push(`details.${dbKey}: DB=${dbVal} → CSV=${csvVal}`);
      }
    }

    if (diffs.length > 0) {
      updateCount++;
      diffReport.push(`  [DIFF] ${csvKey}`);
      for (const d of diffs) diffReport.push(`    ${d}`);

      // Build new config for equipment_option (boolean values, 'WAHR*' for star)
      const newConfig = { ...dbDetails };
      for (const dbKey of Object.values(KEY_MAP)) {
        newConfig[dbKey] = toConfigVal(expected.details[dbKey] ?? 'false');
      }

      const { is_default_star, is_default } = toDefaultFlags(expected.is_default_setup);

      sql.push(`-- ${csvKey}`);
      sql.push(`UPDATE equipment_option`);
      sql.push(`SET`);
      sql.push(`  is_default = ${is_default},`);
      sql.push(`  is_default_star = ${is_default_star},`);
      sql.push(`  config = ${q(JSON.stringify(newConfig))}::jsonb`);
      sql.push(`WHERE id = '${eq.id}';`);
      sql.push('');
    }
  }

  // ── Check CSV entries that have no DB row ──
  for (const [csvKey, expected] of csvData) {
    const exKey = `${expected.place}|${expected.weight_type}|${expected.exercise_name}`;
    const exIds = exByKey.get(exKey) ?? [];

    let found = false;
    for (const exId of exIds) {
      const dbRow = equipment.find(
        e => e.exercise_id === exId && e.equipment_name.trim() === expected.equipment_name
      );
      if (dbRow) { found = true; break; }
    }

    if (!found && expected.is_available) {
      notFoundInDB++;
      diffReport.push(`  [DB MISSING] ${csvKey}`);
    }
  }

  if (updateCount === 0 && notFoundInDB === 0) {
    sql.push('-- Keine Unterschiede gefunden. Die DB stimmt mit der CSV überein.');
  }

  const sqlStr = sql.join('\n');
  fs.writeFileSync(OUTPUT_SQL, sqlStr, 'utf-8');

  console.log('\n─── Ergebnis ───────────────────────────────');
  console.log(`Unterschiede (Updates): ${updateCount}`);
  console.log(`In DB, nicht in CSV:    ${notFoundInCSV}`);
  console.log(`In CSV, nicht in DB:    ${notFoundInDB}`);
  console.log('\nDetails:');
  diffReport.slice(0, 80).forEach(l => console.log(l));
  if (diffReport.length > 80) console.log(`  ... und ${diffReport.length - 80} weitere`);
  console.log(`\nSQL gespeichert: ${OUTPUT_SQL}`);
}

main().catch(err => { console.error(err); process.exit(1); });
