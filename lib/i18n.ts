/**
 * i18n – minimal string table, English only for Phase 1.
 * Add 'de' to Lang and DE object when German is needed (Phase 3).
 *
 * Usage:
 *   import { t } from '../lib/i18n';
 *   <Text>{t('cancel')}</Text>
 *
 * To switch language at runtime:
 *   import { setLang } from '../lib/i18n';
 *   setLang('de');
 */

export type Lang = 'en'; // | 'de'

// ── String keys ───────────────────────────────────────────────────────────────

export type StringKey =
  // Common actions
  | 'cancel'
  | 'confirm'
  | 'save'
  | 'delete'
  | 'retry'
  | 'back'
  | 'next'
  | 'done'
  | 'edit'
  | 'add'
  | 'scan'
  // Navigation tabs
  | 'tab_home'
  | 'tab_plans'
  | 'tab_settings'
  | 'tab_profile'
  // Home screen
  | 'home_title'
  | 'home_last_workout'
  | 'home_featured'
  | 'home_no_workouts'
  | 'home_no_workouts_sub'
  | 'home_continue'
  | 'home_view'
  // Plans screen
  | 'plans_title'
  | 'plans_empty'
  | 'plans_empty_sub'
  | 'plans_create'
  | 'plans_import'
  | 'plans_new'
  // Settings screen
  | 'settings_title'
  | 'settings_account'
  | 'settings_exercise_builder'
  | 'settings_body_bench_visible'
  | 'settings_scan_ai'
  | 'settings_claude_api_key'
  | 'settings_extra_weights'
  | 'settings_extra_weights_hint'
  | 'settings_sign_out'
  | 'settings_sign_out_confirm'
  // Exercise builder
  | 'builder_equipment'
  | 'builder_attachment'
  | 'builder_hands'
  | 'builder_grip'
  | 'builder_grip_width'
  | 'builder_cables'
  | 'builder_cable_height'
  | 'builder_stand_position'
  | 'builder_position_mode'
  | 'builder_stand_angle'
  | 'builder_sit_angle'
  | 'builder_bench_position'
  | 'builder_bench_cable_angle'
  | 'builder_body_bench'
  | 'builder_body_position'
  | 'builder_standing'
  | 'builder_sitting'
  | 'builder_incline_angle'
  | 'builder_custom_angle'
  // Set tracking
  | 'tracking_set'
  | 'tracking_previous'
  | 'tracking_kg'
  | 'tracking_reps'
  | 'tracking_add_set'
  // Error / loading
  | 'error_generic'
  | 'loading';

// ── English strings ───────────────────────────────────────────────────────────

const EN: Record<StringKey, string> = {
  // Common
  cancel: 'Cancel',
  confirm: 'Confirm',
  save: 'Save',
  delete: 'Delete',
  retry: 'Retry',
  back: 'Back',
  next: 'Next',
  done: 'Done',
  edit: 'Edit',
  add: 'Add',
  scan: 'Scan',
  // Tabs
  tab_home: 'Home',
  tab_plans: 'Plans',
  tab_settings: 'Settings',
  tab_profile: 'Profile',
  // Home
  home_title: 'Home',
  home_last_workout: 'LAST WORKOUT',
  home_featured: 'FEATURED EXERCISES',
  home_no_workouts: 'No workouts yet',
  home_no_workouts_sub: 'Start a training plan to track your progress',
  home_continue: 'Continue →',
  home_view: 'View →',
  // Plans
  plans_title: 'Training Plans',
  plans_empty: 'No training plans yet',
  plans_empty_sub: 'Tap "+ New" to create your first plan',
  plans_create: 'Create Plan',
  plans_import: 'Import',
  plans_new: '+ New',
  // Settings
  settings_title: 'Settings',
  settings_account: 'ACCOUNT',
  settings_exercise_builder: 'EXERCISE BUILDER',
  settings_body_bench_visible: 'Show Body Position (Bench+Cable)',
  settings_scan_ai: 'SCAN / AI',
  settings_claude_api_key: 'Claude API Key',
  settings_extra_weights: 'EXTRA WEIGHTS',
  settings_extra_weights_hint: 'e.g. 1.25, 2.5, 5',
  settings_sign_out: 'Sign Out',
  settings_sign_out_confirm: 'Are you sure you want to sign out?',
  // Exercise builder
  builder_equipment: 'Equipment',
  builder_attachment: 'Attachment',
  builder_hands: 'Hands',
  builder_grip: 'Grip',
  builder_grip_width: 'Grip Width',
  builder_cables: 'Cables',
  builder_cable_height: 'Cable Height',
  builder_stand_position: 'Stand Position',
  builder_position_mode: 'Position Mode',
  builder_stand_angle: 'Stand Angle',
  builder_sit_angle: 'Sit Angle',
  builder_bench_position: 'BENCH POSITION',
  builder_bench_cable_angle: 'Bench : Cable Angle',
  builder_body_bench: 'Body : Bench',
  builder_body_position: 'Body Position',
  builder_standing: 'Standing',
  builder_sitting: 'Sitting',
  builder_incline_angle: 'Incline Angle',
  builder_custom_angle: 'Custom °',
  // Set tracking
  tracking_set: 'Set',
  tracking_previous: 'Previous',
  tracking_kg: 'kg',
  tracking_reps: 'Reps',
  tracking_add_set: '+ Add Set',
  // Errors
  error_generic: 'Something went wrong',
  loading: 'Loading…',
};

// ── Runtime ───────────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<Lang, Record<StringKey, string>> = {
  en: EN,
  // de: DE,  // uncomment when German strings are added
};

let currentLang: Lang = 'en';

/** Switch the active language at runtime. */
export function setLang(lang: Lang): void {
  currentLang = lang;
}

/** Get the current language code. */
export function getLang(): Lang {
  return currentLang;
}

/** Translate a key to the current language string. */
export function t(key: StringKey): string {
  return TRANSLATIONS[currentLang][key] ?? key;
}
