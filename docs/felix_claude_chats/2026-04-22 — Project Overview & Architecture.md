# 2026-04-22 — Project Overview & Architecture

## Topics Covered
- Full codebase explanation
- End-to-end user flow
- Scaling to 2000+ users
- Hosting & infrastructure

---

## What the App Is

**GYM_APP** is a React Native / Expo mobile fitness app for:
- Creating and managing personalized workout plans
- Logging sets in real-time during workouts
- Tracking progress over time (best weight, volume, 1RM)
- Configuring exercises with detailed parameters (grip, bench angle, equipment, etc.)
- AI-powered image scanning via Claude API

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + Expo (~55) |
| Routing | Expo Router (file-based) |
| Language | TypeScript |
| Backend | Supabase (no custom server) |
| Database | PostgreSQL (hosted via Supabase) |
| Auth | Supabase Auth (email/password + JWT) |
| 3D Graphics | Three.js + Expo GL + Blender models |
| AI | Claude API (image recognition) |
| Local Storage | AsyncStorage (settings, presets) |

---

## Architecture

There is **no custom backend server**. The Expo app talks directly to Supabase via HTTPS.

```
User's Phone (Expo App)
       │
       │  HTTPS (Supabase JS SDK)
       ▼
  Supabase Cloud
  ├── Auth Service  ← login/session/JWT
  └── PostgreSQL    ← all user data

       (separately)
  Claude API        ← image scanning feature
```

---

## Database Tables (PostgreSQL via Supabase)

| Table | Purpose |
|---|---|
| `exercises` | ~500+ exercises with place, weight_type, muscle_id |
| `equipment` | Equipment options per exercise (JSONB config) |
| `muscles` | Muscle groups with boolean flags |
| `training_plans` | User's plans |
| `plan_days` | Individual days within a plan |
| `plan_exercises` | Exercises per day + custom_config (JSONB) |
| `workout_sessions` | A single workout instance |
| `set_logs` | Logged sets — kg, reps, hand (L/R), extra_weight |
| `exercise_variant_group/axis/member` | Variant system for exercise alternatives |

---

## End-to-End User Flow

### Login
1. App checks AsyncStorage for existing JWT on launch
2. If none → redirect to login screen
3. `supabase.auth.signInWithPassword()` → returns JWT
4. JWT stored in AsyncStorage, auto-refreshed silently
5. `onAuthStateChange()` in `auth-context.tsx` picks up session globally

### Creating a Plan
1. 4-step wizard — state lives in `CreatePlanContext` (in-memory)
2. On step 4 "Save": 3 sequential DB inserts (plan → days → exercises)
3. Nothing saved to DB until final step

### Logging a Workout
1. User opens a plan day → fetches exercises from `plan_exercises`
2. Taps "Start Workout" → `getOrCreateSession()` inserts a `workout_sessions` row
3. Each set logged immediately → `upsertSetLog()` inserts/updates `set_logs`
4. No batching — every set hits the DB in real-time
5. If phone dies mid-workout, all previous sets are already saved

### Returning the Next Day
- JWT still in AsyncStorage, auto-refreshed by Supabase
- User lands directly on home screen (no re-login)
- All plans, sessions, set_logs waiting in DB

---

## Scaling

### Current Architecture Scales to ~50k Users Without Changes

| Scale | Status |
|---|---|
| 2,000 users | No problem — Supabase Pro ($25/mo) |
| 50,000 users | Still fine with connection pooling |
| 500,000+ | Need read replicas, caching (Redis) |
| 5M+ | Self-host Postgres on AWS RDS |

### What's Actually Needed to Host This

- **App**: Distributed via App Store / Play Store (no server needed)
- **Backend**: One Supabase Pro project (~$25/month)
- **AI**: Claude API, pay-per-use (users provide own key in settings)

### Key Things to Get Right for Scale
1. **Row-Level Security (RLS)** on all tables — enforced at DB level, not just app level
2. **Indexes** on `user_id` columns (training_plans, workout_sessions) and `session_id` (set_logs)
3. Without indexes, queries full-scan the table as rows grow

---

## Project Structure

```
app/              ← Screens (Expo Router)
  (auth)/         ← login, register
  (tabs)/         ← home, plans, settings, profile
  create-plan/    ← 4-step wizard
  exercise-builder/ ← exercise configurator
  set-tracking/   ← real-time workout logging
  progress/       ← progress charts

lib/
  auth.ts         ← signIn/signUp/signOut
  auth-context.tsx← Global auth state
  supabase.ts     ← Supabase client init
  queries/        ← All DB queries
  exercise-builder/ ← Config types + utilities

components/       ← Reusable UI components
supabase/migrations/ ← SQL schema migrations
docs/             ← This Obsidian vault
```
