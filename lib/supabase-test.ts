import { supabase } from './supabase';

/**
 * Kurzer Verbindungs-/RLS-Test. Tutorial-Code nutzt oft `exercises` + `category` — hier im Projekt:
 * Tabelle `exercise`, sinnvolle Spalten z. B. `name`, `is_superdefault`; „Kategorie“-ähnlich: Combo per Join.
 * Nach dem Test diese Datei oder den Aufruf wieder entfernen.
 */
export async function testSupabase() {
  const { data, error } = await supabase
    .from('exercise')
    .select('id, name, is_superdefault, combo:exercise_combo(label)')
    .limit(3);

  if (error) {
    console.error(
      'Supabase-Fehler (Tabelle/Spalten/RLS prüfen, Policy für SELECT gespeichert?):',
      error.message,
    );
    return { ok: false as const, error };
  }

  console.log('Erfolg! Beispiel-Daten:', data);
  return { ok: true as const, data };
}
