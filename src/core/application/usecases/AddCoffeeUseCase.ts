import { Coffee, CoffeeProps } from '@/core/domain/coffee/Coffee';
import { Recipe } from '@/core/domain/recipe/Recipe';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RoasterScraperPort } from '../ports/out/RoasterScraperPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { CoffeeSommelierPort } from '../ports/out/CoffeeSommelierPort';
import { DuplicateCoffeeError } from '@/core/domain/coffee/DuplicateCoffeeError';

export interface AddCoffeeRequest {
  url?: string;
  manualData?: Partial<CoffeeProps>;
}

export interface AddCoffeeResult {
  coffee: Coffee;
  recipe: Recipe;
  fromCache: boolean;
}

export class AddCoffeeUseCase {
  constructor(
    private readonly coffeeRepo: CoffeeRepositoryPort,
    private readonly recipeRepo: RecipeRepositoryPort,
    private readonly scraper: RoasterScraperPort,
    private readonly sommelier?: CoffeeSommelierPort
  ) {}

  async execute(request: AddCoffeeRequest): Promise<AddCoffeeResult> {
    const url = request.url?.trim();

    if (url) {
      let existing = await this.coffeeRepo.findByUrl(url);
      if (existing) {
        return this.buildResult(existing, true);
      }

      // Cache miss: Scrape roaster page
      const scraped = await this.scraper.scrapeCoffeeUrl(url);

      existing = await this.coffeeRepo.findByRoasterAndName(scraped.roaster, scraped.name);
      if (!existing && scraped.sourceUrl) {
        existing = await this.coffeeRepo.findByUrl(scraped.sourceUrl);
      }
      if (existing) {
        return this.buildResult(existing, true);
      }

      let story = scraped.sommelierStory;
      if (!story && this.sommelier) {
        const tempCoffee = new Coffee({ ...scraped, id: 'temp' });
        story = await this.sommelier.generateStory(tempCoffee);
      }

      const coffee = new Coffee({
        ...scraped,
        sommelierStory: story,
        id: `coffee-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      });

      let recipe = RecipeCalculator.calculateInitial(coffee);
      if (this.sommelier) {
        try {
          const aiRationale = await this.sommelier.generateRationale(coffee, recipe);
          recipe = new Recipe({ ...recipe, aiRationale });
        } catch {
          // Graceful fallback
        }
      }

      await this.coffeeRepo.save(coffee);
      await this.recipeRepo.save(recipe);

      return { coffee, recipe, fromCache: false };
    }

    if (request.manualData && request.manualData.name && request.manualData.roaster) {
      const { roaster, name, sourceUrl } = request.manualData;
      let existing = await this.coffeeRepo.findByRoasterAndName(roaster, name);
      if (!existing && sourceUrl) {
        existing = await this.coffeeRepo.findByUrl(sourceUrl);
      }
      if (existing) {
        throw new DuplicateCoffeeError(existing.roaster, existing.name);
      }

      let story = request.manualData.sommelierStory;
      if (!story && this.sommelier) {
        const tempCoffee = new Coffee({ ...(request.manualData as CoffeeProps), id: 'temp' });
        story = await this.sommelier.generateStory(tempCoffee);
      }

      const coffee = new Coffee({
        ...(request.manualData as CoffeeProps),
        sommelierStory: story,
        id: `coffee-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      });
      let recipe = RecipeCalculator.calculateInitial(coffee);
      if (this.sommelier) {
        try {
          const aiRationale = await this.sommelier.generateRationale(coffee, recipe);
          recipe = new Recipe({ ...recipe, aiRationale });
        } catch {
          // Graceful fallback
        }
      }

      await this.coffeeRepo.save(coffee);
      await this.recipeRepo.save(recipe);

      return { coffee, recipe, fromCache: false };
    }

    throw new Error('Either a roaster URL or complete coffee data is required');
  }

  private async buildResult(coffee: Coffee, fromCache: boolean): Promise<AddCoffeeResult> {
    let recipe = await this.recipeRepo.findByCoffeeId(coffee.id);
    if (!recipe) {
      recipe = RecipeCalculator.calculateInitial(coffee);
      await this.recipeRepo.save(recipe);
    }
    return { coffee, recipe, fromCache };
  }
}
