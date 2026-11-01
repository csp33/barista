import { Coffee, CoffeeProps } from '@/core/domain/coffee/Coffee';
import { Recipe } from '@/core/domain/recipe/Recipe';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';

export interface UpdateCoffeeRequest {
  id: string;
  data: Partial<CoffeeProps>;
}

export interface UpdateCoffeeResult {
  coffee: Coffee;
  recipe: Recipe;
}

export class UpdateCoffeeUseCase {
  constructor(
    private readonly coffeeRepo: CoffeeRepositoryPort,
    private readonly recipeRepo: RecipeRepositoryPort
  ) {}

  async execute(request: UpdateCoffeeRequest): Promise<UpdateCoffeeResult> {
    const existing = await this.coffeeRepo.findById(request.id);
    if (!existing) {
      throw new Error(`Coffee with ID ${request.id} not found`);
    }

    const updated = new Coffee({
      id: existing.id,
      roaster: request.data.roaster ?? existing.roaster,
      name: request.data.name ?? existing.name,
      originCountry: request.data.originCountry ?? existing.originCountry,
      region: request.data.region ?? existing.region,
      producer: request.data.producer ?? existing.producer,
      altitudeMasl: request.data.altitudeMasl ?? existing.altitudeMasl,
      variety: request.data.variety ?? existing.variety,
      process: request.data.process ?? existing.process,
      roastLevel: request.data.roastLevel ?? existing.roastLevel,
      tastingNotes: request.data.tastingNotes ?? existing.tastingNotes,
      recommendedRestDays: request.data.recommendedRestDays ?? existing.recommendedRestDays,
      sourceUrl: existing.sourceUrl,
      imageUrl: request.data.imageUrl ?? existing.imageUrl,
      status: request.data.status ?? existing.status,
      createdAt: existing.createdAt,
    });

    const recipe = RecipeCalculator.calculateInitial(updated);

    await this.coffeeRepo.save(updated);
    await this.recipeRepo.save(recipe);

    return { coffee: updated, recipe };
  }
}
