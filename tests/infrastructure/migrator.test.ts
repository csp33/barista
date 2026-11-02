import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import fs from 'fs';
import type { PoolClient } from 'pg';
import {
  computeChecksum,
  listMigrationsOnDisk,
  resolveDefaultMigrationsDir,
  runMigrationsOnClient,
} from '@/infrastructure/db/migrator';

describe('Database Migrator', () => {
  const defaultDir = resolveDefaultMigrationsDir();

  it('lists all versioned SQL migrations in lexicographical order', () => {
    const files = listMigrationsOnDisk(defaultDir);
    expect(files).toEqual([
      '0001_initial_schema.sql',
      '0002_user_basket_dose.sql',
      '0003_user_coffee_statuses.sql',
      '0004_extraction_feedback_temperature.sql',
    ]);
  });

  it('applies unapplied migrations and records their SHA-256 checksums', async () => {
    const executedQueries: { text: string; values?: unknown[] }[] = [];
    const mockClient = {
      query: vi.fn(async (text: string, values?: unknown[]) => {
        executedQueries.push({ text, values });
        if (text.includes('SELECT name, checksum FROM schema_migrations')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as PoolClient;

    const result = await runMigrationsOnClient(mockClient, defaultDir);

    expect(result.total).toBe(4);
    expect(result.applied).toBe(4);
    expect(result.appliedMigrations).toEqual([
      '0001_initial_schema.sql',
      '0002_user_basket_dose.sql',
      '0003_user_coffee_statuses.sql',
      '0004_extraction_feedback_temperature.sql',
    ]);

    const insertCalls = executedQueries.filter((q) =>
      q.text.includes('INSERT INTO schema_migrations')
    );
    expect(insertCalls).toHaveLength(4);
  });

  it('skips migrations that are already applied with matching checksums', async () => {
    const files = listMigrationsOnDisk(defaultDir);
    const existingRows = files.map((file) => ({
      name: file,
      checksum: computeChecksum(fs.readFileSync(path.join(defaultDir, file), 'utf8')),
    }));

    const mockClient = {
      query: vi.fn(async (text: string) => {
        if (text.includes('SELECT name, checksum FROM schema_migrations')) {
          return { rows: existingRows };
        }
        return { rows: [] };
      }),
    } as unknown as PoolClient;

    const result = await runMigrationsOnClient(mockClient, defaultDir);

    expect(result.total).toBe(4);
    expect(result.applied).toBe(0);
    expect(result.appliedMigrations).toEqual([]);
  });

  it('throws an error when an applied migration has a checksum mismatch', async () => {
    const mockClient = {
      query: vi.fn(async (text: string) => {
        if (text.includes('SELECT name, checksum FROM schema_migrations')) {
          return {
            rows: [{ name: '0001_initial_schema.sql', checksum: 'tampered-checksum' }],
          };
        }
        return { rows: [] };
      }),
    } as unknown as PoolClient;

    await expect(runMigrationsOnClient(mockClient, defaultDir)).rejects.toThrow(
      /Migration checksum mismatch for 0001_initial_schema\.sql/
    );
  });

  it('rolls back transaction if a migration fails during execution', async () => {
    const executedQueries: string[] = [];
    const mockClient = {
      query: vi.fn(async (text: string) => {
        executedQueries.push(text.trim());
        if (text.includes('SELECT name, checksum FROM schema_migrations')) {
          return { rows: [] };
        }
        if (text.includes('CREATE TABLE IF NOT EXISTS user_profiles')) {
          throw new Error('Syntax error in SQL');
        }
        return { rows: [] };
      }),
    } as unknown as PoolClient;

    await expect(runMigrationsOnClient(mockClient, defaultDir)).rejects.toThrow(
      'Syntax error in SQL'
    );
    expect(executedQueries).toContain('BEGIN');
    expect(executedQueries).toContain('ROLLBACK');
  });
});
