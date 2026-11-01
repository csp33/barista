import { Coffee, CoffeeStatus, RoastLevel, CoffeeProcess } from '@/core/domain/coffee/Coffee';
import { CoffeeRepositoryPort } from '@/core/application/ports/out/CoffeeRepositoryPort';
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
