import { Pool } from 'pg';
import { INITIAL_PROFILES, INITIAL_COFFEES } from './seeds';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';
import { PRESET_GRINDERS, PRESET_MACHINES } from '../equipment/EquipmentCatalogRepository';
import { MIGRATION_ADVISORY_LOCK_ID, runMigrationsOnClient } from './migrator';

const connectionString =
  process.env.DATABASE_URL || 'postgresql://barista:baristasecret@localhost:5432/barista_db';

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = runInitDatabase().finally(() => {
      initPromise = null;
    });
  }
  return initPromise;
}

async function runInitDatabase(): Promise<void> {
  if (isInitialized) return;
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_ADVISORY_LOCK_ID]);

    await runMigrationsOnClient(client);

    const usersCountRes = await client.query('SELECT COUNT(*) FROM user_profiles');
    if (parseInt(usersCountRes.rows[0].count, 10) === 0) {
      for (const p of INITIAL_PROFILES) {
        await client.query(
          `INSERT INTO user_profiles (id, name, role, language, active_coffee_id, grinder_id, machine_id, avatar, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.role, p.language, p.activeCoffeeId, p.grinderId, p.machineId, p.avatar, p.createdAt, p.updatedAt]
        );
      }
    }

    const coffeesCountRes = await client.query('SELECT COUNT(*) FROM coffees');
    if (parseInt(coffeesCountRes.rows[0].count, 10) === 0) {
      const seedProfile = INITIAL_PROFILES[0];
      const seedGrinder = PRESET_GRINDERS[0];
      const seedMachine = PRESET_MACHINES[0];

      for (const c of INITIAL_COFFEES) {
        await client.query(
          `INSERT INTO coffees (id, roaster, name, origin_country, region, producer, altitude_masl, variety, process, roast_level, tasting_notes, recommended_rest_days, source_url, image_url, status, sommelier_story, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.roaster, c.name, c.originCountry, c.region, c.producer, c.altitudeMasl, c.variety, c.process, c.roastLevel, JSON.stringify(c.tastingNotes), c.recommendedRestDays, c.sourceUrl, c.imageUrl, c.status, c.sommelierStory, c.createdAt]
        );

        const r = RecipeCalculator.calculateInitial(c, seedGrinder, seedMachine, seedProfile.id);
        await client.query(
          `INSERT INTO recipes (id, coffee_id, user_id, grinder_id, machine_id, dose_grams, yield_grams, ratio, grind_setting, machine_temperature, target_time_seconds, recommended_rest_days, notes, ai_rationale, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (coffee_id, user_id) DO NOTHING`,
          [r.id, r.coffeeId, r.userId, r.grinderId, r.machineId, r.doseGrams, r.yieldGrams, r.ratio, r.grindSetting, r.machineTemperature, r.targetTimeSeconds, r.recommendedRestDays, JSON.stringify(r.notes), r.aiRationale ? JSON.stringify(r.aiRationale) : null, new Date(), new Date()]
        );
      }
    }

    for (const c of INITIAL_COFFEES) {
      await client.query(
        `INSERT INTO user_coffee_statuses (user_id, coffee_id, status)
         SELECT $1, id, $3 FROM coffees WHERE id = $2
         ON CONFLICT (user_id, coffee_id) DO NOTHING`,
        [INITIAL_PROFILES[0].id, c.id, c.status]
      );
    }

    isInitialized = true;
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_ADVISORY_LOCK_ID]).catch(() => {});
    client.release();
  }
}
