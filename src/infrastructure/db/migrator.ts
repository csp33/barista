import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Pool, PoolClient } from 'pg';

export interface MigrationResult {
  applied: number;
  total: number;
  appliedMigrations: string[];
}

export const MIGRATION_ADVISORY_LOCK_ID = 728391;

export function resolveDefaultMigrationsDir(): string {
  return path.join(process.cwd(), 'src/infrastructure/db/migrations');
}

export function computeChecksum(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function listMigrationsOnDisk(migrationsDir: string): string[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ migrationsDir)) return [];
  return fs
    .readdirSync(/*turbopackIgnore: true*/ migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function ensureMigrationsTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function listAppliedMigrations(client: PoolClient): Promise<Map<string, string>> {
  const { rows } = await client.query<{ name: string; checksum: string }>(
    'SELECT name, checksum FROM schema_migrations'
  );
  return new Map(rows.map((r) => [r.name, r.checksum]));
}

export async function runMigrationsOnClient(
  client: PoolClient,
  migrationsDir: string = resolveDefaultMigrationsDir()
): Promise<MigrationResult> {
  await ensureMigrationsTable(client);
  const appliedMap = await listAppliedMigrations(client);
  const filesOnDisk = listMigrationsOnDisk(migrationsDir);
  const appliedMigrations: string[] = [];

  for (const fileName of filesOnDisk) {
    const filePath = path.join(/*turbopackIgnore: true*/ migrationsDir, fileName);
    const sql = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf8');
    const sum = computeChecksum(sql);

    if (appliedMap.has(fileName)) {
      const existingChecksum = appliedMap.get(fileName);
      if (existingChecksum !== sum) {
        throw new Error(
          `Migration checksum mismatch for ${fileName}: database has ${existingChecksum}, disk has ${sum}`
        );
      }
      continue;
    }

    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
        [fileName, sum]
      );
      await client.query('COMMIT');
      appliedMigrations.push(fileName);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  return {
    applied: appliedMigrations.length,
    total: filesOnDisk.length,
    appliedMigrations,
  };
}

export async function runMigrations(
  pool: Pool,
  migrationsDir: string = resolveDefaultMigrationsDir()
): Promise<MigrationResult> {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_ADVISORY_LOCK_ID]);
    return await runMigrationsOnClient(client, migrationsDir);
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_ADVISORY_LOCK_ID]).catch(() => {});
    client.release();
  }
}
