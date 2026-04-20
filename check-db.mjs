import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(url, key)

async function test() {
  // 1. How many exercises total?
  const { data: all, error: e1 } = await supabase
    .from('exercises')
    .select('id, exercise_name, muscle_id, is_superdefault')

  if (e1) { console.error('❌ exercises query failed:', e1.message); return }
  console.log(`✅ Total exercises: ${all.length}`)

  // 2. Group by muscle_id
  const byMuscle = {}
  for (const ex of all) {
    byMuscle[ex.muscle_id] = (byMuscle[ex.muscle_id] ?? 0) + 1
  }
  console.log('\n📊 Exercises per muscle_id:')
  for (const [id, count] of Object.entries(byMuscle)) {
    console.log(`  ${id}  →  ${count} exercises`)
  }

  // 3. How many muscles in muscles table?
  const { data: muscles, error: e2 } = await supabase
    .from('muscles')
    .select('id, name_en, name_de')
  if (e2) { console.error('❌ muscles query failed:', e2.message); return }
  console.log(`\n✅ Total muscles: ${muscles.length}`)

  // 4. Cross-check: are all exercise muscle_ids in the muscles table?
  const muscleIds = new Set(muscles.map(m => m.id))
  const missing = Object.keys(byMuscle).filter(id => !muscleIds.has(id))
  if (missing.length > 0) {
    console.log('\n⚠️  Exercise muscle_ids NOT found in muscles table:')
    missing.forEach(id => console.log(`  ${id}  (${byMuscle[id]} exercises)`))
  } else {
    console.log('\n✅ All exercise muscle_ids exist in muscles table')
  }

  // 5. Superdefault count per muscle
  const superByMuscle = {}
  for (const ex of all.filter(e => e.is_superdefault)) {
    superByMuscle[ex.muscle_id] = (superByMuscle[ex.muscle_id] ?? 0) + 1
  }
  console.log('\n⭐ Superdefaults per muscle_id:')
  for (const [id, count] of Object.entries(superByMuscle)) {
    const name = muscles.find(m => m.id === id)?.name_en ?? '?'
    console.log(`  ${name} (${id.slice(0,8)})  →  ${count}`)
  }
}

test()
