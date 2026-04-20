import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'gym-app://login' },
  });
  if (error) throw error;

  // Create user_profile immediately after sign-up
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profile')
      .insert({ id: data.user.id, display_name: displayName });
    // Don't throw — profile creation failing shouldn't block the user
    if (profileError) console.warn('user_profile insert failed:', profileError.message);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
