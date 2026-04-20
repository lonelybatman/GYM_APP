import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://abxfmcxuvdvguzzajymt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFieGZtY3h1dmR2Z3V6emFqeW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzkxOTYsImV4cCI6MjA5MDc1NTE5Nn0.q67VzDYnJmRfW5MT12HS2HMZcMwnPyXMuZuPpTgjWZQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
