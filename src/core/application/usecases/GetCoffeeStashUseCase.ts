import { Coffee } from '@/core/domain/coffee/Coffee';
import { Recipe } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/core/domain/recipe/ExtractionFeedback';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';

export interface StashItemDTO {
  coffee: Coffee;
  recipe: Recipe | null;
  feedbackHistory: ExtractionFeedback[];
}

export class GetCoffeeStashUseCase {
  constructor(
    private readonly coffeeRepo: CoffeeRepositoryPort,
    private readonly recipeRepo: RecipeRepositoryPort
  ) {}

  async execute(): Promise<StashItemDTO[]> {
    const coffees = await this.coffeeRepo.findAll();
    const items: StashItemDTO[] = [];

    for (const coffee of coffees) {
      const recipe = await this.recipeRepo.findByCoffeeId(coffee.id);
      const feedbackHistory = recipe
        ? await this.recipeRepo.getFeedbackHistory(recipe.id)
        : [];

      items.push({
        coffee,
        recipe,
        feedbackHistory,
      });
    }

    return items;
  }
}
