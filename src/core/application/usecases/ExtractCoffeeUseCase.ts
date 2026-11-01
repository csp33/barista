import { Coffee } from '@/core/domain/coffee/Coffee';
import { Recipe, AiRationale } from '@/core/domain/recipe/Recipe';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { RoasterScraperPort, ScrapedCoffeeData } from '../ports/out/RoasterScraperPort';
import { CoffeeVisionScannerPort } from '../ports/out/CoffeeVisionScannerPort';
import { CoffeeSommelierPort } from '../ports/out/CoffeeSommelierPort';

export interface ExtractCoffeeRequest {
  url?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface ExtractCoffeeResult {
  coffee: ScrapedCoffeeData;
  recipe?: Recipe;
  isExisting: boolean;
}

export class ExtractCoffeeUseCase {
  constructor(
    private readonly coffeeRepo: CoffeeRepositoryPort,
    private readonly recipeRepo: RecipeRepositoryPort,
    private readonly scraper: RoasterScraperPort,
    private readonly visionScanner?: CoffeeVisionScannerPort,
    private readonly sommelier?: CoffeeSommelierPort
  ) {}

  async execute(request: ExtractCoffeeRequest): Promise<ExtractCoffeeResult> {
    const url = request.url?.trim();

    if (url) {
      const existing = await this.coffeeRepo.findByUrl(url);
      if (existing) {
        const recipe = await this.recipeRepo.findByCoffeeId(existing.id);
        const data: ScrapedCoffeeData = {
          roaster: existing.roaster,
          name: existing.name,
          originCountry: existing.originCountry,
          region: existing.region,
          producer: existing.producer,
          altitudeMasl: existing.altitudeMasl,
          variety: existing.variety,
          process: existing.process,
          roastLevel: existing.roastLevel,
          tastingNotes: existing.tastingNotes,
          recommendedRestDays: existing.recommendedRestDays,
          sourceUrl: existing.sourceUrl,
          imageUrl: existing.imageUrl,
          sommelierStory: existing.sommelierStory,
          aiRationale: recipe?.aiRationale,
        };
        return { coffee: data, recipe: recipe ?? undefined, isExisting: true };
      }
    }

    let scraped: ScrapedCoffeeData;
    if (url) {
      scraped = await this.scraper.scrapeCoffeeUrl(url);
    } else if (request.imageBase64 && this.visionScanner) {
      scraped = await this.visionScanner.scanCoffeeBagImage(
        request.imageBase64,
        request.mimeType || 'image/jpeg'
      );
    } else {
      throw new Error('Either a valid roaster URL or image data is required');
    }

    let existingMatch = await this.coffeeRepo.findByRoasterAndName(scraped.roaster, scraped.name);
    if (!existingMatch && scraped.sourceUrl) {
      existingMatch = await this.coffeeRepo.findByUrl(scraped.sourceUrl);
    }
    if (existingMatch) {
      const recipe = await this.recipeRepo.findByCoffeeId(existingMatch.id);
      const data: ScrapedCoffeeData = {
        roaster: existingMatch.roaster,
        name: existingMatch.name,
        originCountry: existingMatch.originCountry,
        region: existingMatch.region,
        producer: existingMatch.producer,
        altitudeMasl: existingMatch.altitudeMasl,
        variety: existingMatch.variety,
        process: existingMatch.process,
        roastLevel: existingMatch.roastLevel,
        tastingNotes: existingMatch.tastingNotes,
        recommendedRestDays: existingMatch.recommendedRestDays,
        sourceUrl: existingMatch.sourceUrl,
        imageUrl: existingMatch.imageUrl,
        sommelierStory: existingMatch.sommelierStory,
        aiRationale: recipe?.aiRationale,
      };
      return { coffee: data, recipe: recipe ?? undefined, isExisting: true };
    }

    const tempCoffee = new Coffee({
      ...scraped,
      id: 'temp-extract',
    });

    const initialRecipe = RecipeCalculator.calculateInitial(tempCoffee);
    let sommelierStory = scraped.sommelierStory;
    let aiRationale: AiRationale | undefined;

    if (this.sommelier) {
      const storyPromise = !sommelierStory
        ? this.sommelier.generateStory(tempCoffee)
        : Promise.resolve(sommelierStory);
      const rationalePromise = this.sommelier.generateRationale(tempCoffee, initialRecipe);

      const [storyRes, rationaleRes] = await Promise.allSettled([
        storyPromise,
        rationalePromise,
      ]);

      if (storyRes.status === 'fulfilled' && storyRes.value) {
        sommelierStory = storyRes.value;
      }
      if (rationaleRes.status === 'fulfilled' && rationaleRes.value) {
        aiRationale = rationaleRes.value;
      }
    }

    const finalRecipe = aiRationale
      ? new Recipe({ ...initialRecipe, aiRationale })
      : initialRecipe;

    return {
      coffee: {
        ...scraped,
        sommelierStory,
        aiRationale,
      },
      recipe: finalRecipe,
      isExisting: false,
    };
  }
}
