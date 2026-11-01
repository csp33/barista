import { Coffee, CoffeeStatus, RoastLevel, CoffeeProcess } from '@/domain/coffee/Coffee';
import { CoffeeRepositoryPort } from '@/application/ports/out/CoffeeRepositoryPort';
import { pool, initDatabase } from '../db/postgres';

export class PostgresCoffeeRepository implements CoffeeRepositoryPort {
  async findById(id: string): Promise<Coffee | null> {
    await initDatabase();
    const res = await pool.query('SELECT * FROM coffees WHERE id = $1', [id]);
    return res.rows[0] ? this.mapRow(res.rows[0]) : null;
  }

  async findByUrl(url: string): Promise<Coffee | null> {
    await initDatabase();
    const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
    const res = await pool.query(
      'SELECT * FROM coffees WHERE LOWER(RTRIM(source_url, \'/\')) = $1',
      [cleanUrl]
    );
    return res.rows[0] ? this.mapRow(res.rows[0]) : null;
  }

  async findByRoasterAndName(roaster: string, name: string): Promise<Coffee | null> {
    await initDatabase();
    const res = await pool.query(
      'SELECT * FROM coffees WHERE LOWER(roaster) = LOWER($1) AND LOWER(name) = LOWER($2)',
      [roaster.trim(), name.trim()]
    );
    return res.rows[0] ? this.mapRow(res.rows[0]) : null;
  }

  async findAll(): Promise<Coffee[]> {
    await initDatabase();
    const res = await pool.query('SELECT * FROM coffees ORDER BY created_at DESC');
    return res.rows.map(this.mapRow);
  }

  async findAllForUser(userId: string): Promise<Coffee[]> {
    await initDatabase();
    const cleanUserId = userId.trim().toLowerCase();
    const res = await pool.query(
      `SELECT c.*, ucs.status AS user_status
       FROM coffees c
       LEFT JOIN user_coffee_statuses ucs ON c.id = ucs.coffee_id AND ucs.user_id = $1
       ORDER BY c.created_at DESC`,
      [cleanUserId]
    );
    return res.rows.map(row => {
      const coffee = this.mapRow(row);
      const userStatus = row.user_status
        ? (String(row.user_status) as CoffeeStatus)
        : cleanUserId === 'carlos'
          ? coffee.status
          : 'bodega';
      return coffee.withStatus(userStatus);
    });
  }

  async setUserStatus(coffeeId: string, userId: string, status: CoffeeStatus): Promise<void> {
    await initDatabase();
    const cleanUserId = userId.trim().toLowerCase();
    await pool.query(
      `INSERT INTO user_coffee_statuses (user_id, coffee_id, status, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, coffee_id)
       DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`,
      [cleanUserId, coffeeId, status]
    );
  }

  async getUserStatus(coffeeId: string, userId: string): Promise<CoffeeStatus | null> {
    await initDatabase();
    const cleanUserId = userId.trim().toLowerCase();
    const res = await pool.query(
      'SELECT status FROM user_coffee_statuses WHERE user_id = $1 AND coffee_id = $2',
      [cleanUserId, coffeeId]
    );
    return res.rows[0] ? (String(res.rows[0].status) as CoffeeStatus) : null;
  }

  async save(coffee: Coffee): Promise<void> {
    await initDatabase();
    await pool.query(
      `INSERT INTO coffees (id, roaster, name, origin_country, region, producer, altitude_masl, variety, process, roast_level, tasting_notes, recommended_rest_days, source_url, image_url, status, sommelier_story, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         roaster = EXCLUDED.roaster,
         name = EXCLUDED.name,
         origin_country = EXCLUDED.origin_country,
         region = EXCLUDED.region,
         producer = EXCLUDED.producer,
         altitude_masl = EXCLUDED.altitude_masl,
         variety = EXCLUDED.variety,
         process = EXCLUDED.process,
         roast_level = EXCLUDED.roast_level,
         tasting_notes = EXCLUDED.tasting_notes,
         recommended_rest_days = EXCLUDED.recommended_rest_days,
         source_url = EXCLUDED.source_url,
         image_url = EXCLUDED.image_url,
         status = EXCLUDED.status,
         sommelier_story = EXCLUDED.sommelier_story`,
      [
        coffee.id,
        coffee.roaster,
        coffee.name,
        coffee.originCountry,
        coffee.region,
        coffee.producer,
        coffee.altitudeMasl,
        coffee.variety,
        coffee.process,
        coffee.roastLevel,
        JSON.stringify(coffee.tastingNotes),
        coffee.recommendedRestDays,
        coffee.sourceUrl,
        coffee.imageUrl,
        coffee.status,
        coffee.sommelierStory,
        coffee.createdAt,
      ]
    );
  }

  async delete(id: string): Promise<boolean> {
    await initDatabase();
    const res = await pool.query('DELETE FROM coffees WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  private mapRow(row: Record<string, unknown>): Coffee {
    return new Coffee({
      id: String(row.id),
      roaster: String(row.roaster),
      name: String(row.name),
      originCountry: String(row.origin_country),
      region: row.region ? String(row.region) : undefined,
      producer: row.producer ? String(row.producer) : undefined,
      altitudeMasl: row.altitude_masl ? parseInt(String(row.altitude_masl), 10) : undefined,
      variety: String(row.variety),
      process: row.process as CoffeeProcess,
      roastLevel: row.roast_level as RoastLevel,
      tastingNotes: Array.isArray(row.tasting_notes) ? (row.tasting_notes as string[]) : JSON.parse(String(row.tasting_notes || '[]')),
      recommendedRestDays: row.recommended_rest_days ? parseInt(String(row.recommended_rest_days), 10) : 14,
      sourceUrl: row.source_url ? String(row.source_url) : undefined,
      imageUrl: row.image_url ? String(row.image_url) : undefined,
      status: (String(row.status || 'active')) as CoffeeStatus,
      sommelierStory: row.sommelier_story ? String(row.sommelier_story) : undefined,
      createdAt: new Date(String(row.created_at)),
    });
  }
}
