import { UserProfile, UserRole } from '@/core/domain/user/UserProfile';
import { UserProfileRepositoryPort } from '@/core/application/ports/out/UserProfileRepositoryPort';
import { pool, initDatabase } from '../db/postgres';

export class PostgresUserProfileRepository implements UserProfileRepositoryPort {
  async findAll(): Promise<UserProfile[]> {
    await initDatabase();
    const res = await pool.query(
      'SELECT id, name, role, language, active_coffee_id, grinder_id, machine_id, avatar, created_at, updated_at FROM user_profiles ORDER BY created_at ASC'
    );
    return res.rows.map(this.mapRowToUserProfile);
  }

  async findById(id: string): Promise<UserProfile | null> {
    await initDatabase();
    const res = await pool.query(
      'SELECT id, name, role, language, active_coffee_id, grinder_id, machine_id, avatar, created_at, updated_at FROM user_profiles WHERE LOWER(id) = LOWER($1)',
      [id.trim()]
    );
    if (res.rows.length === 0) return null;
    return this.mapRowToUserProfile(res.rows[0]);
  }

  async save(profile: UserProfile): Promise<void> {
    await initDatabase();
    await pool.query(
      `INSERT INTO user_profiles (id, name, role, language, active_coffee_id, grinder_id, machine_id, avatar, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         language = EXCLUDED.language,
         active_coffee_id = EXCLUDED.active_coffee_id,
         grinder_id = EXCLUDED.grinder_id,
         machine_id = EXCLUDED.machine_id,
         avatar = EXCLUDED.avatar,
         updated_at = NOW()`,
      [
        profile.id,
        profile.name,
        profile.role,
        profile.language,
        profile.activeCoffeeId,
        profile.grinderId,
        profile.machineId,
        profile.avatar,
        profile.createdAt,
        profile.updatedAt,
      ]
    );
  }

  async delete(id: string): Promise<boolean> {
    await initDatabase();
    const res = await pool.query('DELETE FROM user_profiles WHERE LOWER(id) = LOWER($1)', [id.trim()]);
    return (res.rowCount ?? 0) > 0;
  }

  private mapRowToUserProfile(row: Record<string, unknown>): UserProfile {
    return new UserProfile({
      id: String(row.id),
      name: String(row.name),
      role: row.role as UserRole,
      language: row.language as 'es' | 'en',
      activeCoffeeId: row.active_coffee_id ? String(row.active_coffee_id) : null,
      grinderId: String(row.grinder_id),
      machineId: String(row.machine_id),
      avatar: row.avatar ? String(row.avatar) : undefined,
      createdAt: new Date(String(row.created_at)),
      updatedAt: new Date(String(row.updated_at)),
    });
  }
}
