import { describe, it, expect } from 'vitest';
import { UserProfile } from '@/core/domain/user/UserProfile';
import { PostgresUserProfileRepository } from '@/infrastructure/repositories/PostgresUserProfileRepository';
import { InMemoryUserProfileRepository } from '@/infrastructure/out/persistence/memory/InMemoryUserProfileRepository';

describe('UserProfile Repositories', () => {
  it('InMemoryUserProfileRepository saves, finds by id, lists and deletes profiles', async () => {
    const repo = new InMemoryUserProfileRepository();
    const user = new UserProfile({ id: 'test-mem', name: 'Test Mem', role: 'user' });

    await repo.save(user);

    const found = await repo.findById('test-mem');
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Test Mem');

    const all = await repo.findAll();
    expect(all).toHaveLength(1);

    const deleted = await repo.delete('test-mem');
    expect(deleted).toBe(true);

    const afterDelete = await repo.findById('test-mem');
    expect(afterDelete).toBeNull();
  });

  it('PostgresUserProfileRepository saves, finds by id, lists and deletes profiles in Postgres', async () => {
    const repo = new PostgresUserProfileRepository();
    const testId = 'test-pg-user';
    await repo.delete(testId);

    const user = new UserProfile({ id: testId, name: 'PG User', role: 'user', grinderId: 'kingrinder-k6', machineId: 'casabrews-cm5418' });
    await repo.save(user);

    const found = await repo.findById(testId);
    expect(found).not.toBeNull();
    expect(found?.name).toBe('PG User');
    expect(found?.grinderId).toBe('kingrinder-k6');
    expect(found?.machineId).toBe('casabrews-cm5418');

    const all = await repo.findAll();
    expect(all.some(u => u.id === testId)).toBe(true);

    const deleted = await repo.delete(testId);
    expect(deleted).toBe(true);

    const afterDelete = await repo.findById(testId);
    expect(afterDelete).toBeNull();
  });
});
