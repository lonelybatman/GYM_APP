/**
 * Findet exercises mit identischem Quadrupel:
 *   place + weight_type + muscle_id + exercise_name
 * Nutzung: node find-duplicate-exercises.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / KEY in .env.local fehlen.');
  process.exit(1);
}

const supabase = createClient(url, key);

function norm(s) {
  return String(s ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

async function main() {
  const { data: exercises, error: e1 } = await supabase
    .from('exercises')
    .select('id, exercise_name, place, weight_type, muscle_id, is_superdefault');

  if (e1) {
    console.error('exercises:', e1.message);
    process.exit(1);
  }

  const { data: muscles, error: e2 } = await supabase.from('muscles').select('id, name_en');
  if (e2) {
    console.error('muscles:', e2.message);
    process.exit(1);
  }

  const muscleName = Object.fromEntries((muscles ?? []).map((m) => [m.id, m.name_en ?? '?']));

  /** @type {Map<string, typeof exercises>} */
  const groups = new Map();
  for (const row of exercises ?? []) {
    const en = norm(row.exercise_name).toLowerCase();
    const pl = norm(row.place).toLowerCase();
    const wt = norm(row.weight_type).toLowerCase();
    const mid = String(row.muscle_id ?? '');
    const key = JSON.stringify([pl, wt, mid, en]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const dups = [...groups.entries()].filter(([, rows]) => rows.length > 1);
  dups.sort((a, b) => b[1].length - a[1].length);

  console.log(`Gesamt exercises: ${exercises?.length ?? 0}`);
  console.log(`Eindeutige Kombinationen (place+weight_type+muscle+name): ${groups.size}`);
  console.log(`Kombinationen mit mehreren Zeilen: ${dups.length}\n`);

  for (const [k, rows] of dups) {
    const [pl, wt, mid, exName] = JSON.parse(k);
    console.log('—'.repeat(72));
    console.log(
      `×${rows.length}  place="${pl}"  weight_type="${wt}"  muscle="${muscleName[mid] ?? mid}" (${String(mid).slice(0, 8)}…)\n    exercise_name="${exName}"`,
    );
    for (const r of rows) {
      console.log(
        `    • id=${r.id}  superdefault=${r.is_superdefault}  raw_name="${r.exercise_name}"`,
      );
    }
  }
}

main();
