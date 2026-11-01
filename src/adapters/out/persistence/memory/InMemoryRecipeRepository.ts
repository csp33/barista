import { Recipe } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/core/domain/recipe/ExtractionFeedback';
import { RecipeRepositoryPort } from '@/core/application/ports/out/RecipeRepositoryPort';

export class InMemoryRecipeRepository implements RecipeRepositoryPort {
  private recipes: Map<string, Recipe> = new Map();
  private feedbacks: ExtractionFeedback[] = [];

  constructor(initialRecipes: Recipe[] = []) {
    for (const r of initialRecipes) {
      this.recipes.set(r.coffeeId, r);
    }
  }

  async findByCoffeeId(coffeeId: string): Promise<Recipe | null> {
    return this.recipes.get(coffeeId) || null;
  }

  async save(recipe: Recipe): Promise<void> {
    this.recipes.set(recipe.coffeeId, recipe);
  }

  async saveFeedback(feedback: ExtractionFeedback): Promise<void> {
    this.feedbacks.unshift(feedback);
  }

  async getFeedbackHistory(recipeId: string): Promise<ExtractionFeedback[]> {
    const cleanId = recipeId.replace(/-\d{13,}$/, '');
    return this.feedbacks.filter(f => f.recipeId === cleanId || f.recipeId === recipeId);
  }

  async deleteByCoffeeId(coffeeId: string): Promise<boolean> {
    const deleted = this.recipes.delete(coffeeId);
    this.feedbacks = this.feedbacks.filter(f => f.recipeId !== `recipe-${coffeeId}`);
    return deleted;
  }
}
