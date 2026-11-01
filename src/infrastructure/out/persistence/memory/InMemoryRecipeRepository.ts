import { Recipe } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/core/domain/recipe/ExtractionFeedback';
import { RecipeRepositoryPort } from '@/core/application/ports/out/RecipeRepositoryPort';

export class InMemoryRecipeRepository implements RecipeRepositoryPort {
  private recipes: Map<string, Recipe> = new Map();
  private feedbacks: ExtractionFeedback[] = [];

  constructor(initialRecipes: Recipe[] = []) {
    for (const r of initialRecipes) {
      this.save(r);
    }
  }

  private makeKey(coffeeId: string, userId: string): string {
    return `${userId.toLowerCase().trim()}::${coffeeId.trim()}`;
  }

  async findByCoffeeId(coffeeId: string, userId?: string): Promise<Recipe | null> {
    if (userId) {
      const key = this.makeKey(coffeeId, userId);
      return this.recipes.get(key) || null;
    }
    for (const [key, recipe] of this.recipes.entries()) {
      if (recipe.coffeeId === coffeeId || key.endsWith(`::${coffeeId.trim()}`)) {
        return recipe;
      }
    }
    return null;
  }

  async save(recipe: Recipe): Promise<void> {
    const key = this.makeKey(recipe.coffeeId, recipe.userId);
    this.recipes.set(key, recipe);
  }

  async saveFeedback(feedback: ExtractionFeedback): Promise<void> {
    this.feedbacks.unshift(feedback);
  }

  async getFeedbackHistory(recipeId: string, userId?: string): Promise<ExtractionFeedback[]> {
    const cleanId = recipeId.replace(/-\d{13,}$/, '');
    return this.feedbacks.filter((f) => {
      const matchRecipe = f.recipeId === cleanId || f.recipeId === recipeId || f.recipeId.includes(cleanId);
      if (!matchRecipe) return false;
      if (userId) {
        return f.userId.toLowerCase().trim() === userId.toLowerCase().trim();
      }
      return true;
    });
  }

  async deleteByCoffeeId(coffeeId: string, userId?: string): Promise<boolean> {
    if (userId) {
      return this.recipes.delete(this.makeKey(coffeeId, userId));
    }
    let anyDeleted = false;
    for (const key of Array.from(this.recipes.keys())) {
      if (key.endsWith(`::${coffeeId}`)) {
        this.recipes.delete(key);
        anyDeleted = true;
      }
    }
    this.feedbacks = this.feedbacks.filter((f) => !f.recipeId.includes(coffeeId));
    return anyDeleted;
  }
}
