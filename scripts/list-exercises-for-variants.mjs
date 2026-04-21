/**
 * Hilft beim Befüllen von exercise_variant_*: listet exercises mit Filtern.
 * Nutzung: node list-exercises-for-variants.mjs
 * Optional: node list-exercises-for-variants.mjs lat
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!url || !key) {
  console.error('Keys in .env.local fehlen.');
  process.exit(1);
}

const supabase = createClient(url, key);
const needle = (process.argv[2] ?? 'pull').toLowerCase();

async function main() {
  const { data, error } = await supabase
    .from('exercises')
    .select('id, exercise_name, place, weight_type, is_superdefault')
    .ilike('exercise_name', `%${needle}%`)
    .order('place')
    .order('exercise_name');

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  console.log(`Gefiltert (name ILIKE %${needle}%): ${data?.length ?? 0} Zeilen\n`);
  for (const row of data ?? []) {
    console.log(
      `${row.id}  place=${row.place}  wt=${row.weight_type}  super=${row.is_superdefault}  name="${row.exercise_name}"`,
    );
  }
}

main();
