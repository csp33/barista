import { Coffee, CoffeeProps } from '@/core/domain/coffee/Coffee';
import { Recipe } from '@/core/domain/recipe/Recipe';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RoasterScraperPort } from '../ports/out/RoasterScraperPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { CoffeeSommelierPort } from '../ports/out/CoffeeSommelierPort';

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
      const existing = await this.coffeeRepo.findByUrl(url);
      if (existing) {
        let recipe = await this.recipeRepo.findByCoffeeId(existing.id);
        if (!recipe) {
          recipe = RecipeCalculator.calculateInitial(existing);
          await this.recipeRepo.save(recipe);
        }
        return { coffee: existing, recipe, fromCache: true };
      }

      // Cache miss: Scrape roaster page
      const scraped = await this.scraper.scrapeCoffeeUrl(url);
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

      const recipe = RecipeCalculator.calculateInitial(coffee);

      await this.coffeeRepo.save(coffee);
      await this.recipeRepo.save(recipe);

      return { coffee, recipe, fromCache: false };
    }

    if (request.manualData && request.manualData.name && request.manualData.roaster) {
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
      const recipe = RecipeCalculator.calculateInitial(coffee);

      await this.coffeeRepo.save(coffee);
      await this.recipeRepo.save(recipe);

      return { coffee, recipe, fromCache: false };
    }

    throw new Error('Either a roaster URL or complete coffee data is required');
  }
}
