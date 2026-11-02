import { Recipe, AiRationale } from '@/domain/recipe/Recipe';
import { ExtractionFeedback, TasteProfile } from '@/domain/recipe/ExtractionFeedback';
import { normalizeTemperatureSetting } from '@/domain/equipment/EspressoMachine';
import { RecipeRepositoryPort } from '@/application/ports/out/RecipeRepositoryPort';
import { pool, initDatabase } from '../db/postgres';

export class PostgresRecipeRepository implements RecipeRepositoryPort {
  async findByCoffeeId(coffeeId: string, userId?: string): Promise<Recipe | null> {
    await initDatabase();
    let query = 'SELECT * FROM recipes WHERE coffee_id = $1';
    const params: string[] = [coffeeId.trim()];

    if (userId) {
      query += ' AND LOWER(user_id) = LOWER($2)';
      params.push(userId.trim());
    }
    query += ' ORDER BY updated_at DESC LIMIT 1';

    const res = await pool.query(query, params);
    return res.rows[0] ? this.mapRecipe(res.rows[0]) : null;
  }

  async save(recipe: Recipe): Promise<void> {
    await initDatabase();
    await pool.query(
      `INSERT INTO recipes (id, coffee_id, user_id, grinder_id, machine_id, dose_grams, yield_grams, ratio, grind_setting, machine_temperature, target_time_seconds, recommended_rest_days, notes, ai_rationale, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       ON CONFLICT (coffee_id, user_id) DO UPDATE SET
         id = EXCLUDED.id,
         grinder_id = EXCLUDED.grinder_id,
         machine_id = EXCLUDED.machine_id,
         dose_grams = EXCLUDED.dose_grams,
         yield_grams = EXCLUDED.yield_grams,
         ratio = EXCLUDED.ratio,
         grind_setting = EXCLUDED.grind_setting,
         machine_temperature = EXCLUDED.machine_temperature,
         target_time_seconds = EXCLUDED.target_time_seconds,
         recommended_rest_days = EXCLUDED.recommended_rest_days,
         notes = EXCLUDED.notes,
         ai_rationale = EXCLUDED.ai_rationale,
         updated_at = NOW()`,
      [
        recipe.id,
        recipe.coffeeId,
        recipe.userId,
        recipe.grinderId,
        recipe.machineId,
        recipe.doseGrams,
        recipe.yieldGrams,
        recipe.ratio,
        recipe.grindSetting,
        recipe.machineTemperature,
        recipe.targetTimeSeconds,
        recipe.recommendedRestDays,
        JSON.stringify(recipe.notes),
        recipe.aiRationale ? JSON.stringify(recipe.aiRationale) : null,
        new Date(),
        new Date(),
      ]
    );
  }

  async saveFeedback(fb: ExtractionFeedback): Promise<void> {
    await initDatabase();
    await pool.query(
      `INSERT INTO extraction_feedbacks (id, recipe_id, user_id, actual_grind_setting, actual_dose_grams, actual_yield_grams, actual_time_seconds, actual_temperature, taste_profile, user_notes, ai_diagnosis, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        fb.id,
        fb.recipeId,
        fb.userId,
        fb.actualGrindSetting,
        fb.actualDoseGrams,
        fb.actualYieldGrams,
        fb.actualTimeSeconds,
        fb.actualTemperature ?? 'normal',
        fb.tasteProfile,
        fb.userNotes,
        fb.aiDiagnosis,
        fb.createdAt,
      ]
    );
  }

  async getFeedbackHistory(recipeId: string, userId?: string): Promise<ExtractionFeedback[]> {
    await initDatabase();
    const cleanId = recipeId.replace(/-\d{13,}$/, '');
    let query = 'SELECT * FROM extraction_feedbacks WHERE (recipe_id = $1 OR recipe_id = $2 OR recipe_id LIKE $3)';
    const params: string[] = [cleanId, recipeId, `%${cleanId}%`];

    if (userId) {
      query += ' AND LOWER(user_id) = LOWER($4)';
      params.push(userId.trim());
    }
    query += ' ORDER BY created_at DESC';

    const res = await pool.query(query, params);
    return res.rows.map(this.mapFeedback);
  }

  async deleteByCoffeeId(coffeeId: string, userId?: string): Promise<boolean> {
    await initDatabase();
    let query = 'DELETE FROM recipes WHERE coffee_id = $1';
    const params: string[] = [coffeeId];
    if (userId) {
      query += ' AND LOWER(user_id) = LOWER($2)';
      params.push(userId.trim());
    }
    const res = await pool.query(query, params);
    return (res.rowCount ?? 0) > 0;
  }

  private mapRecipe(row: Record<string, unknown>): Recipe {
    return new Recipe({
      id: String(row.id),
      coffeeId: String(row.coffee_id),
      userId: String(row.user_id),
      grinderId: String(row.grinder_id),
      machineId: String(row.machine_id),
      doseGrams: parseFloat(String(row.dose_grams)),
      yieldGrams: parseInt(String(row.yield_grams), 10),
      ratio: String(row.ratio),
      grindSetting: parseFloat(String(row.grind_setting)),
      machineTemperature: normalizeTemperatureSetting(String(row.machine_temperature)),
      targetTimeSeconds: parseInt(String(row.target_time_seconds), 10),
      recommendedRestDays: parseInt(String(row.recommended_rest_days), 10),
      notes: Array.isArray(row.notes) ? (row.notes as string[]) : JSON.parse(String(row.notes || '[]')),
      aiRationale: row.ai_rationale ? (typeof row.ai_rationale === 'string' ? JSON.parse(row.ai_rationale) : (row.ai_rationale as AiRationale)) : undefined,
    });
  }

  private mapFeedback(row: Record<string, unknown>): ExtractionFeedback {
    return new ExtractionFeedback({
      id: String(row.id),
      recipeId: String(row.recipe_id),
      userId: String(row.user_id),
      actualGrindSetting: parseFloat(String(row.actual_grind_setting)),
      actualDoseGrams: parseFloat(String(row.actual_dose_grams)),
      actualYieldGrams: parseInt(String(row.actual_yield_grams), 10),
      actualTimeSeconds: parseFloat(String(row.actual_time_seconds)),
      actualTemperature: row.actual_temperature ? normalizeTemperatureSetting(String(row.actual_temperature)) : undefined,
      tasteProfile: row.taste_profile as TasteProfile,
      userNotes: row.user_notes ? String(row.user_notes) : undefined,
      aiDiagnosis: row.ai_diagnosis ? String(row.ai_diagnosis) : undefined,
    });
  }
}
