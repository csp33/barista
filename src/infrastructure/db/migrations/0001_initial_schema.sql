CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  language VARCHAR(8) NOT NULL DEFAULT 'es',
  active_coffee_id VARCHAR(128),
  grinder_id VARCHAR(64) NOT NULL,
  machine_id VARCHAR(64) NOT NULL,
  avatar VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coffees (
  id VARCHAR(128) PRIMARY KEY,
  roaster VARCHAR(128) NOT NULL,
  name VARCHAR(128) NOT NULL,
  origin_country VARCHAR(128) NOT NULL,
  region VARCHAR(128),
  producer VARCHAR(128),
  altitude_masl INT,
  variety VARCHAR(128) NOT NULL,
  process VARCHAR(64) NOT NULL,
  roast_level VARCHAR(64) NOT NULL,
  tasting_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_rest_days INT NOT NULL DEFAULT 14,
  source_url TEXT,
  image_url TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  sommelier_story TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coffees_roaster_name ON coffees(roaster, name);

CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(256) PRIMARY KEY,
  coffee_id VARCHAR(128) NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
  user_id VARCHAR(64) NOT NULL,
  grinder_id VARCHAR(64) NOT NULL,
  machine_id VARCHAR(64) NOT NULL,
  dose_grams NUMERIC(4, 1) NOT NULL,
  yield_grams INT NOT NULL,
  ratio VARCHAR(16) NOT NULL,
  grind_setting NUMERIC(5, 1) NOT NULL,
  machine_temperature VARCHAR(32) NOT NULL,
  target_time_seconds INT NOT NULL DEFAULT 28,
  recommended_rest_days INT NOT NULL DEFAULT 14,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_rationale JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_coffee_user ON recipes(coffee_id, user_id);

CREATE TABLE IF NOT EXISTS extraction_feedbacks (
  id VARCHAR(128) PRIMARY KEY,
  recipe_id VARCHAR(256) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  actual_grind_setting NUMERIC(5, 1) NOT NULL,
  actual_dose_grams NUMERIC(4, 1) NOT NULL,
  actual_yield_grams INT NOT NULL,
  actual_time_seconds INT NOT NULL,
  taste_profile VARCHAR(32) NOT NULL,
  user_notes TEXT,
  ai_diagnosis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_recipe ON extraction_feedbacks(recipe_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON extraction_feedbacks(user_id);
