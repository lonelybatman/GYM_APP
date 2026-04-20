-- ============================================================
-- Missing tables for new Supabase DB
-- Run in: Supabase SQL Editor → new DB
-- ============================================================

-- 1. training_plans (was: training_plan)
CREATE TABLE IF NOT EXISTS training_plans (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          TEXT        NOT NULL,
  cycle_days    INTEGER     NOT NULL,
  training_days INTEGER     NOT NULL,
  cover_image_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. plan_days (was: plan_day)
CREATE TABLE IF NOT EXISTS plan_days (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id    UUID    REFERENCES training_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  name       TEXT    NOT NULL,
  is_rest_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. plan_day_muscle_groups (was: plan_day_muscle_group)
--    References muscles table (flat — no separate muscle_group table in new DB)
CREATE TABLE IF NOT EXISTS plan_day_muscle_groups (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_day_id UUID REFERENCES plan_days(id) ON DELETE CASCADE NOT NULL,
  muscle_id   UUID REFERENCES muscles(id)   ON DELETE CASCADE NOT NULL
);

-- 4. plan_day_muscles (was: plan_day_muscle)
CREATE TABLE IF NOT EXISTS plan_day_muscles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_day_id UUID REFERENCES plan_days(id) ON DELETE CASCADE NOT NULL,
  muscle_id   UUID REFERENCES muscles(id)   ON DELETE CASCADE NOT NULL
);

-- 5. plan_exercises (was: plan_exercise)
--    equipment_id references equipment (was: equipment_option_id → equipment_option)
CREATE TABLE IF NOT EXISTS plan_exercises (
  id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_day_id  UUID    REFERENCES plan_days(id)  ON DELETE CASCADE NOT NULL,
  exercise_id  UUID    REFERENCES exercises(id)   ON DELETE CASCADE NOT NULL,
  equipment_id UUID    REFERENCES equipment(id)   ON DELETE SET NULL,
  sort_order   INTEGER DEFAULT 0,
  default_sets INTEGER DEFAULT 3,
  custom_config JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 6. workout_sessions (was: workout_session)
CREATE TABLE IF NOT EXISTS workout_sessions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_day_id UUID        REFERENCES plan_days(id)  ON DELETE CASCADE NOT NULL,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- 7. set_logs (was: set_log)
CREATE TABLE IF NOT EXISTS set_logs (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id       UUID        REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  plan_exercise_id UUID        REFERENCES plan_exercises(id)   ON DELETE CASCADE NOT NULL,
  set_type         TEXT        NOT NULL,
  parent_set_type  TEXT,
  hand             CHAR(1)     CHECK (hand IN ('L', 'R')),
  kg               NUMERIC,
  reps             INTEGER,
  extra_weight     NUMERIC     DEFAULT 0,
  logged_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS: Enable + public read/write per user
-- ============================================================

ALTER TABLE training_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days           ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_day_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_day_muscles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE set_logs            ENABLE ROW LEVEL SECURITY;

-- training_plans: user sees/modifies only their own
CREATE POLICY "user own plans"    ON training_plans      FOR ALL USING (auth.uid() = user_id);

-- plan_days: accessible if the plan belongs to the user
CREATE POLICY "user own days"     ON plan_days           FOR ALL USING (
  EXISTS (SELECT 1 FROM training_plans tp WHERE tp.id = plan_days.plan_id AND tp.user_id = auth.uid())
);

-- plan_day_muscle_groups
CREATE POLICY "user own day muscles groups" ON plan_day_muscle_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM plan_days pd
    JOIN training_plans tp ON tp.id = pd.plan_id
    WHERE pd.id = plan_day_muscle_groups.plan_day_id AND tp.user_id = auth.uid()
  )
);

-- plan_day_muscles
CREATE POLICY "user own day muscles" ON plan_day_muscles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM plan_days pd
    JOIN training_plans tp ON tp.id = pd.plan_id
    WHERE pd.id = plan_day_muscles.plan_day_id AND tp.user_id = auth.uid()
  )
);

-- plan_exercises
CREATE POLICY "user own exercises" ON plan_exercises FOR ALL USING (
  EXISTS (
    SELECT 1 FROM plan_days pd
    JOIN training_plans tp ON tp.id = pd.plan_id
    WHERE pd.id = plan_exercises.plan_day_id AND tp.user_id = auth.uid()
  )
);

-- workout_sessions
CREATE POLICY "user own sessions" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- set_logs
CREATE POLICY "user own logs" ON set_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workout_sessions ws
    WHERE ws.id = set_logs.session_id AND ws.user_id = auth.uid()
  )
);
