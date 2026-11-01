import { Pool } from 'pg';
import { INITIAL_PROFILES, INITIAL_COFFEES } from './seeds';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';
import { PRESET_GRINDERS, PRESET_MACHINES } from '../equipment/EquipmentCatalogRepository';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://barista:baristasecret@localhost:5432/barista_db';

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

let isInitialized = false;

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;

  await pool.query(`
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

    CREATE TABLE IF NOT EXISTS user_coffee_statuses (
      user_id VARCHAR(64) NOT NULL,
      coffee_id VARCHAR(128) NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
      status VARCHAR(32) NOT NULL DEFAULT 'bodega',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, coffee_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_coffee_statuses_user ON user_coffee_statuses(user_id);

    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS basket_dose_grams NUMERIC(4, 1);
  `);

  // Seed default Carlos profile if table is empty
  const usersCountRes = await pool.query('SELECT COUNT(*) FROM user_profiles');
  if (parseInt(usersCountRes.rows[0].count, 10) === 0) {
    for (const p of INITIAL_PROFILES) {
      await pool.query(
        `INSERT INTO user_profiles (id, name, role, language, active_coffee_id, grinder_id, machine_id, avatar, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [p.id, p.name, p.role, p.language, p.activeCoffeeId, p.grinderId, p.machineId, p.avatar, p.createdAt, p.updatedAt]
      );
    }
  }

  // Seed initial coffees and default recipes if empty
  const coffeesCountRes = await pool.query('SELECT COUNT(*) FROM coffees');
  if (parseInt(coffeesCountRes.rows[0].count, 10) === 0) {
    const seedProfile = INITIAL_PROFILES[0];
    const seedGrinder = PRESET_GRINDERS[0];
    const seedMachine = PRESET_MACHINES[0];

    for (const c of INITIAL_COFFEES) {
      await pool.query(
        `INSERT INTO coffees (id, roaster, name, origin_country, region, producer, altitude_masl, variety, process, roast_level, tasting_notes, recommended_rest_days, source_url, image_url, status, sommelier_story, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [c.id, c.roaster, c.name, c.originCountry, c.region, c.producer, c.altitudeMasl, c.variety, c.process, c.roastLevel, JSON.stringify(c.tastingNotes), c.recommendedRestDays, c.sourceUrl, c.imageUrl, c.status, c.sommelierStory, c.createdAt]
      );

      const r = RecipeCalculator.calculateInitial(c, seedGrinder, seedMachine, seedProfile.id);
      await pool.query(
        `INSERT INTO recipes (id, coffee_id, user_id, grinder_id, machine_id, dose_grams, yield_grams, ratio, grind_setting, machine_temperature, target_time_seconds, recommended_rest_days, notes, ai_rationale, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT (coffee_id, user_id) DO NOTHING`,
        [r.id, r.coffeeId, r.userId, r.grinderId, r.machineId, r.doseGrams, r.yieldGrams, r.ratio, r.grindSetting, r.machineTemperature, r.targetTimeSeconds, r.recommendedRestDays, JSON.stringify(r.notes), r.aiRationale ? JSON.stringify(r.aiRationale) : null, new Date(), new Date()]
      );

      await pool.query(
        `INSERT INTO user_coffee_statuses (user_id, coffee_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, coffee_id) DO NOTHING`,
        [seedProfile.id, c.id, c.status]
      );
    }
  }

  isInitialized = true;
}
