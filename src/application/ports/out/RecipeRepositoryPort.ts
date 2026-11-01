import { Recipe } from '@/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/domain/recipe/ExtractionFeedback';

export interface RecipeRepositoryPort {
  findByCoffeeId(coffeeId: string, userId?: string): Promise<Recipe | null>;
  save(recipe: Recipe): Promise<void>;
  saveFeedback(feedback: ExtractionFeedback): Promise<void>;
  getFeedbackHistory(recipeId: string, userId?: string): Promise<ExtractionFeedback[]>;
  deleteByCoffeeId(coffeeId: string, userId?: string): Promise<boolean>;
}
