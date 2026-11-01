import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_ADVISORY_LOCK_ID = 728391;
const MIGRATIONS_DIR = path.resolve(__dirname, '../src/infrastructure/db/migrations');

function resolveConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const user = process.env.POSTGRES_USER || process.env.PGUSER || 'barista';
  const password = process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || 'baristasecret';
  const host = process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost';
  const port = process.env.POSTGRES_PORT || process.env.PGPORT || '5432';
  const db = process.env.POSTGRES_DB || process.env.PGDATABASE || 'barista_db';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${db}`;
}

function computeChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function listMigrationsOnDisk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function runCliMigrations() {
  const pool = new Pool({
    connectionString: resolveConnectionString(),
    max: 2,
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_ADVISORY_LOCK_ID]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows } = await client.query('SELECT name, checksum FROM schema_migrations');
    const applied = new Map(rows.map((r) => [r.name, r.checksum]));
    const files = listMigrationsOnDisk(MIGRATIONS_DIR);
    let appliedCount = 0;

    for (const name of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, name), 'utf8');
      const sum = computeChecksum(sql);

      if (applied.has(name)) {
        if (applied.get(name) !== sum) {
          throw new Error(
            `Migration checksum mismatch for ${name}: database=${applied.get(name)} disk=${sum}`
          );
        }
        continue;
      }

      console.log(`[db:migrate] Applying migration: ${name}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
          [name, sum]
        );
        await client.query('COMMIT');
        appliedCount += 1;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }

    console.log(
      `[db:migrate] Completed successfully (${appliedCount} applied, ${files.length} total)`
    );
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_ADVISORY_LOCK_ID]).catch(() => {});
    client.release();
    await pool.end();
  }
}

runCliMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[db:migrate] Migration failed:', err.message || err);
    process.exit(1);
  });
