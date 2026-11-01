import { Recipe } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/core/domain/recipe/ExtractionFeedback';

export interface RecipeRepositoryPort {
  findByCoffeeId(coffeeId: string): Promise<Recipe | null>;
  save(recipe: Recipe): Promise<void>;
  saveFeedback(feedback: ExtractionFeedback): Promise<void>;
  getFeedbackHistory(recipeId: string): Promise<ExtractionFeedback[]>;
  deleteByCoffeeId(coffeeId: string): Promise<boolean>;
}
