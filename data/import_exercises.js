#!/usr/bin/env node
/**
 * import_exercises.js
 * Node.js port of import_exercises.py
 * Reads exercise1.csv and generates data/output.sql to run in Supabase SQL Editor.
 *
 * Usage (from gym-app folder):
 *   node data/import_exercises.js
 */

const fs = require('fs');
const path = require('path');

// ── Paths (exercise1.csv next to this script; override via env EXERCISE1_CSV if needed) ──
const OUTPUT_SQL = path.join(__dirname, 'output.sql');
const EXERCISE1_CSV =
  process.env.EXERCISE1_CSV || path.join(__dirname, 'exercise1.csv');
const PERSPEKTIVEN_CSV =
  process.env.PERSPEKTIVEN_CSV ||
  path.join(__dirname, 'exercise builder perspektiven.csv');

// ── CSV muscle name → DB muscle_group name ────────────────────────────────
// 'lat' and 'abs' are individual muscles (in `muscle` table), not muscle_groups.
// Exercises with these CSV names map to their parent muscle_group in the DB.
const MUSCLE_GROUP_MAP = {
  'lat': 'back',
  'abs': 'core',
};

// ── Combo label → (place, weight_type) ───────────────────────────────────
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

/** Canonical labels for exercise_combo (fixes CSV casing like "Lat pull" → "Lat Pull"). */
function normalizeComboLabel(label) {
  const key = label.trim().toLowerCase().replace(/\s+/g, ' ');
  const map = {
    'lat pull': 'Lat Pull',
    'lat pull2': 'Lat Pull2',
    'lat row': 'Lat Row',
    'lat row 2': 'Lat Row 2',
  };
  return map[key] ?? label.trim();
}

// ── Config columns: [csv_col_index, json_key]
// (Indices +1 after "possible" column between exercise name and equipment.)
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

function detectCableUsedCols(rows) {
  const subHeader = rows[2] ?? [];
  const oneCols = [];
  const twoCols = [];
  for (let i = 0; i < subHeader.length; i++) {
    const v = (subHeader[i] ?? '').trim();
    if (v === '1') oneCols.push(i);
    if (v === '2') twoCols.push(i);
  }
  return {
    cable1Col: oneCols.length > 0 ? oneCols[oneCols.length - 1] : null,
    cable2Col: twoCols.length > 0 ? twoCols[twoCols.length - 1] : null,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function parseVal(s) {
  const v = s.trim().toUpperCase();
  if (v === 'WAHR*') return { val: true, star: true };
  if (v === 'WAHR' || v === 'TRUE' || v === '1') return { val: true, star: false };
  return { val: false, star: false };
}

function q(s) {
  if (s == null) return 'NULL';
  s = String(s).trim();
  if (s === '') return 'NULL';
  return "'" + s.replace(/'/g, "''") + "'";
}

function b(v) {
  return v ? 'TRUE' : 'FALSE';
}

// ── Simple CSV parser (semicolon-delimited) ───────────────────────────────

function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8').replace(/^\uFEFF/, ''); // strip BOM
  const lines = content.split(/\r?\n/);
  return lines.map(line => line.split(';'));
}

// ── Parse exercise1.csv ───────────────────────────────────────────────────

function parseExercise1() {
  const rows = parseCSV(EXERCISE1_CSV);
  const { cable1Col, cable2Col } = detectCableUsedCols(rows);
  const minCols = Math.max(50, (cable1Col ?? 0) + 1, (cable2Col ?? 0) + 1);
  const combos = {};
  const exercises = [];
  const exKeys = new Set();
  // Map from "combo||exercise||muscle||eqName" → index in eqOpts, for deduplication
  const eqOptMap = new Map();
  const eqOpts = [];

  let curCombo = null;
  let curSuperdefault = false;
  let curMuscle = null;
  let curEx = null;

  // Rows 0-3 are header/separator rows; data starts at index 4
  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    while (row.length < minCols) row.push('');

    // Forward-fill
    if (row[0].trim()) curCombo = normalizeComboLabel(row[0]);
    if (row[1].trim()) curSuperdefault = parseVal(row[1]).val;
    if (row[2].trim()) curMuscle = row[2].trim();
    if (row[3].trim()) curEx = row[3].trim();

    const eqName = row[5].trim();
    if (!eqName || !curCombo || !curEx) continue;

    const { val: isPossible } = parseVal(row[4]);

    // Register combo
    if (!combos[curCombo]) {
      combos[curCombo] = COMBO_MAP[curCombo.toLowerCase()] || ['free', 'cable'];
    }

    // Register exercise (deduplicated, but OR the superdefault across all groups)
    const exKey = `${curCombo}||${curEx}||${curMuscle || ''}`;
    if (!exKeys.has(exKey)) {
      exKeys.add(exKey);
      exercises.push({
        combo:           curCombo,
        name:            curEx,
        muscle:          curMuscle || '',
        is_superdefault: curSuperdefault,
        info:            row[49].trim() || null,
      });
    } else if (curSuperdefault) {
      // A later group for the same exercise has Superdefault=WAHR → upgrade
      const ex = exercises.find(e => e.combo === curCombo && e.name === curEx && e.muscle === (curMuscle || ''));
      if (ex) ex.is_superdefault = true;
    }

    // col[6] = "default" marker: WAHR* = preselected default, WAHR = also good, FALSCH = not the default
    const { val: isColDefault, star: isStar } = parseVal(row[6]);

    // Build config — store 'WAHR*' string for starred defaults so config-utils can detect them
    const config = {};
    for (const [colIdx, key] of CONFIG_COLS) {
      const { val, star } = parseVal(row[colIdx]);
      config[key] = star ? 'WAHR*' : val;
    }
    if (cable1Col != null) {
      const { val, star } = parseVal(row[cable1Col] ?? '');
      config.cables_used_1 = star ? 'WAHR*' : val;
    }
    if (cable2Col != null) {
      const { val, star } = parseVal(row[cable2Col] ?? '');
      config.cables_used_2 = star ? 'WAHR*' : val;
    }

    // is_available = "possible" (CSV) AND at least one meaningful config value (WAHR or WAHR*)
    // col[6]=FALSCH does NOT mean unavailable — it just means "not the preselected default"
    const isAvail =
      isPossible && Object.values(config).some(v => v === true || v === 'WAHR*');
    config.possible = isPossible;

    // Track priority for deduplication and later post-processing:
    // 4 = superdefault group + WAHR* (strongest default)
    // 3 = superdefault group + WAHR
    // 2 = superdefault group + has config (FALSCH in col[5] but still belongs to main version)
    // 1 = non-superdefault group + has config
    // 0 = not available
    const starPriority = !isAvail ? 0
      : curSuperdefault && isStar        ? 4
      : curSuperdefault && isColDefault  ? 3
      : curSuperdefault                  ? 2
      : 1;

    const newOpt = {
      combo:           curCombo,
      exercise:        curEx,
      muscle:          curMuscle || '',
      name:            eqName,
      is_available:    isAvail,
      is_default:      isColDefault,
      is_default_star: false,   // set in post-processing below
      _starPriority:   starPriority,
      config,
      info_equipment:  row[48].trim() || null,
    };

    // Deduplicate: same exercise + equipment name → highest priority wins
    const optKey = `${curCombo}||${curEx}||${curMuscle || ''}||${eqName}`;
    if (!eqOptMap.has(optKey)) {
      eqOptMap.set(optKey, eqOpts.length);
      eqOpts.push(newOpt);
    } else {
      const existingIdx = eqOptMap.get(optKey);
      if (newOpt._starPriority > eqOpts[existingIdx]._starPriority) {
        eqOpts[existingIdx] = newOpt;
      }
    }
  }

  // Post-process: per exercise, exactly one option gets is_default_star=TRUE
  // (the highest _starPriority one; ties broken by first occurrence)
  const exOptGroups = new Map();
  eqOpts.forEach((opt, idx) => {
    const key = `${opt.combo}||${opt.exercise}||${opt.muscle}`;
    if (!exOptGroups.has(key)) exOptGroups.set(key, []);
    exOptGroups.get(key).push(idx);
  });
  for (const indices of exOptGroups.values()) {
    let bestIdx = -1, bestPriority = 0;
    for (const idx of indices) {
      if (eqOpts[idx]._starPriority > bestPriority) {
        bestPriority = eqOpts[idx]._starPriority;
        bestIdx = idx;
      }
    }
    if (bestIdx >= 0 && bestPriority >= 3) {
      eqOpts[bestIdx].is_default_star = true;
    }
  }
  // Remove internal _starPriority field before SQL generation
  eqOpts.forEach(opt => delete opt._starPriority);

  return { combos, exercises, eqOpts };
}

// ── Parse perspektiven.csv ────────────────────────────────────────────────

function parsePerspektiven() {
  if (!fs.existsSync(PERSPEKTIVEN_CSV)) {
    console.warn(`  (skip) Perspective file not found: ${PERSPEKTIVEN_CSV}`);
    return [];
  }
  const rows = parseCSV(PERSPEKTIVEN_CSV);
  const result = [];
  // skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    while (row.length < 4) row.push('');
    const name = row[0].trim();
    if (!name) continue;
    const top   = parseVal(row[1]).val;
    const front = parseVal(row[2]).val;
    const side  = parseVal(row[3]).val;
    result.push([name, top, front, side]);
  }
  return result;
}

// ── Generate SQL ──────────────────────────────────────────────────────────

function generateSQL(combos, exercises, eqOpts, perspectives) {
  const L = [];

  L.push(
    '-- ============================================================',
    '-- Generated by import_exercises.js',
    '-- Run in Supabase SQL Editor',
    '-- ============================================================',
    '',
    '-- 0. Rename muscle group if needed',
    "UPDATE muscle_group SET name_en = 'Shoulder' WHERE name_en = 'Delts';",
    '',
    '-- 1. Add UNIQUE constraint on exercise_combo.label (needed for ON CONFLICT)',
    'DO $$ BEGIN',
    '  IF NOT EXISTS (',
    "    SELECT 1 FROM pg_constraint WHERE conname = 'exercise_combo_label_key'",
    '  ) THEN',
    '    ALTER TABLE exercise_combo ADD CONSTRAINT exercise_combo_label_key UNIQUE (label);',
    '  END IF;',
    'END $$;',
    '',
    '-- 2. Clear existing exercise data (FK chain: set_log → plan_exercise → equipment_option → exercise)',
    'TRUNCATE set_log, plan_exercise, equipment_option CASCADE;',
    'DELETE FROM exercise;',
    '',
    '-- 3. Upsert exercise combos',
  );

  for (const [label, [place, weightType]] of Object.entries(combos).sort()) {
    L.push(
      `INSERT INTO exercise_combo (label, place, weight_type) VALUES ` +
      `(${q(label)}, ${q(place)}, ${q(weightType)}) ` +
      `ON CONFLICT (label) DO UPDATE SET place = EXCLUDED.place, weight_type = EXCLUDED.weight_type;`
    );
  }

  L.push(
    '',
    '-- Add is_superdefault column if not exists',
    'ALTER TABLE exercise ADD COLUMN IF NOT EXISTS is_superdefault BOOLEAN DEFAULT FALSE;',
    '',
    '-- 4. Insert exercises (matched via combo label + muscle group name)',
  );

  for (const ex of exercises) {
    const dbMuscle = MUSCLE_GROUP_MAP[ex.muscle.toLowerCase()] || ex.muscle;
    L.push(
      `INSERT INTO exercise (exercise_combo_id, target_muscle_id, name, is_default, is_superdefault, info)` +
      ` SELECT ec.id, mg.id, ${q(ex.name)}, FALSE, ${b(ex.is_superdefault)}, ${q(ex.info)}` +
      ` FROM exercise_combo ec` +
      ` JOIN muscle_group mg ON LOWER(mg.name_en) = LOWER(${q(dbMuscle)})` +
      ` WHERE ec.label = ${q(ex.combo)};`
    );
  }

  L.push('', '-- 5. Insert equipment options');

  for (const opt of eqOpts) {
    const cfg = JSON.stringify(opt.config);
    L.push(
      `INSERT INTO equipment_option` +
      ` (exercise_id, name, is_available, is_default, is_default_star, config, info_equipment)` +
      ` SELECT e.id, ${q(opt.name)}, ${b(opt.is_available)}, ${b(opt.is_default)},` +
      ` ${b(opt.is_default_star)}, ${q(cfg)}::jsonb, ${q(opt.info_equipment)}` +
      ` FROM exercise e` +
      ` JOIN exercise_combo ec ON e.exercise_combo_id = ec.id` +
      ` WHERE e.name = ${q(opt.exercise)} AND ec.label = ${q(opt.combo)};`
    );
  }

  L.push(
    '',
    '-- 6. Create exercise_perspective table (for Exercise Builder views)',
    'CREATE TABLE IF NOT EXISTS exercise_perspective (',
    '  exercise_name  TEXT PRIMARY KEY,',
    '  view_top       BOOLEAN DEFAULT FALSE,',
    '  view_front     BOOLEAN DEFAULT FALSE,',
    '  view_side      BOOLEAN DEFAULT FALSE',
    ');',
    '',
    'ALTER TABLE exercise_perspective ENABLE ROW LEVEL SECURITY;',
    'DROP POLICY IF EXISTS "Public read exercise_perspective" ON exercise_perspective;',
    'CREATE POLICY "Public read exercise_perspective"',
    '  ON exercise_perspective FOR SELECT USING (true);',
    '',
    'TRUNCATE exercise_perspective;',
  );

  for (const [name, top, front, side] of perspectives) {
    L.push(
      `INSERT INTO exercise_perspective (exercise_name, view_top, view_front, view_side)` +
      ` VALUES (${q(name)}, ${b(top)}, ${b(front)}, ${b(side)});`
    );
  }

  L.push('');
  return L.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────

console.log('Parsing exercise1.csv ...');
const { combos, exercises, eqOpts } = parseExercise1();
console.log(`  ${Object.keys(combos).length} combos, ${exercises.length} exercises, ${eqOpts.length} equipment options`);

console.log('Parsing exercise builder perspektiven.csv ...');
const perspectives = parsePerspektiven();
console.log(`  ${perspectives.length} perspective entries`);

// Show muscle names found (for verification)
const muscles = [...new Set(exercises.map(e => e.muscle))].sort();
console.log('\nMuscle names in CSV:', muscles);

console.log('\nGenerating SQL ...');
const sql = generateSQL(combos, exercises, eqOpts, perspectives);

fs.writeFileSync(OUTPUT_SQL, sql, 'utf-8');
console.log(`\nDone! Output written to:\n  ${OUTPUT_SQL}`);
console.log('\nNext step: open that file and run it in Supabase SQL Editor.');
console.log('\nIMPORTANT: First run this SQL in Supabase to rename the muscle group:');
console.log("  UPDATE muscle_group SET name_en = 'Shoulder' WHERE name_en = 'Delts';");
