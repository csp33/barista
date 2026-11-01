import { Coffee } from '@/core/domain/coffee/Coffee';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { InMemoryCoffeeRepository } from './out/persistence/memory/InMemoryCoffeeRepository';
import { InMemoryRecipeRepository } from './out/persistence/memory/InMemoryRecipeRepository';
import { RoasterScraperAdapter } from './out/scraping/RoasterScraperAdapter';
import { OpenAiVisionScannerAdapter } from './out/ai/OpenAiVisionScannerAdapter';
import { OpenAiSommelierAdapter } from './out/ai/OpenAiSommelierAdapter';
import { AddCoffeeUseCase } from '@/core/application/usecases/AddCoffeeUseCase';
import { LogFeedbackUseCase } from '@/core/application/usecases/LogFeedbackUseCase';
import { GetCoffeeStashUseCase } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { UpdateCoffeeUseCase } from '@/core/application/usecases/UpdateCoffeeUseCase';
import { DeleteCoffeeUseCase } from '@/core/application/usecases/DeleteCoffeeUseCase';

const INITIAL_COFFEES: Coffee[] = [
  new Coffee({
    id: 'coffee-nomad-worka',
    roaster: 'Nomad Coffee',
    name: 'Worka Sakaro',
    originCountry: 'Ethiopia',
    region: 'Gedeb, Yirgacheffe',
    producer: 'Mijane Woresa',
    altitudeMasl: 2050,
    variety: 'Kurume, Wolisho',
    process: 'washed',
    roastLevel: 'light',
    tastingNotes: ['White Peach', 'Jasmine', 'Bergamot', 'Lime'],
    sourceUrl: 'https://nomadcoffee.es/products/worka-sakaro',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    recommendedRestDays: 18,
    status: 'active',
  }),
  new Coffee({
    id: 'coffee-sanjorge-dutra',
    roaster: 'San Jorge Coffee',
    name: 'Fazenda Dutra',
    originCountry: 'Brazil',
    region: 'Matas de Minas',
    producer: 'Walter Dutra',
    altitudeMasl: 1250,
    variety: 'Red Catuai',
    process: 'natural',
    roastLevel: 'medium',
    tastingNotes: ['Milk Chocolate', 'Roasted Hazelnut', 'Caramel'],
    sourceUrl: 'https://sanjorge.coffee/products/fazenda-dutra',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    recommendedRestDays: 8,
    status: 'active',
  }),
  new Coffee({
    id: 'coffee-rightside-elparaiso',
    roaster: 'Right Side Coffee',
    name: 'El Paraiso 92',
    originCountry: 'Colombia',
    region: 'Cauca',
    producer: 'Wilton Benitez',
    altitudeMasl: 1950,
    variety: 'Castillo',
    process: 'anaerobic',
    roastLevel: 'medium_light',
    tastingNotes: ['Tropical Fruit', 'Passionfruit', 'Vanilla cream'],
    sourceUrl: 'https://rightsidecoffee.com/products/el-paraiso-92',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80',
    recommendedRestDays: 12,
    status: 'history',
  }),
];

class ServiceContainer {
  private static instance: ServiceContainer;

  readonly coffeeRepo: InMemoryCoffeeRepository;
  readonly recipeRepo: InMemoryRecipeRepository;
  readonly scraper: RoasterScraperAdapter;
  readonly visionScanner: OpenAiVisionScannerAdapter;
  readonly sommelier: OpenAiSommelierAdapter;

  readonly addCoffeeUseCase: AddCoffeeUseCase;
  readonly logFeedbackUseCase: LogFeedbackUseCase;
  readonly getCoffeeStashUseCase: GetCoffeeStashUseCase;
  readonly updateCoffeeUseCase: UpdateCoffeeUseCase;
  readonly deleteCoffeeUseCase: DeleteCoffeeUseCase;

  private constructor() {
    this.coffeeRepo = new InMemoryCoffeeRepository(INITIAL_COFFEES);
    this.recipeRepo = new InMemoryRecipeRepository();
    this.scraper = new RoasterScraperAdapter();
    this.visionScanner = new OpenAiVisionScannerAdapter();
    this.sommelier = new OpenAiSommelierAdapter();

    for (const coffee of INITIAL_COFFEES) {
      const recipe = RecipeCalculator.calculateInitial(coffee);
      this.recipeRepo.save(recipe);
    }

    this.addCoffeeUseCase = new AddCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo,
      this.scraper,
      this.sommelier
    );
    this.logFeedbackUseCase = new LogFeedbackUseCase(
      this.recipeRepo,
      this.coffeeRepo,
      this.sommelier
    );
    this.getCoffeeStashUseCase = new GetCoffeeStashUseCase(
      this.coffeeRepo,
      this.recipeRepo
    );
    this.updateCoffeeUseCase = new UpdateCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo
    );
    this.deleteCoffeeUseCase = new DeleteCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo
    );
  }

  public static getInstance(): ServiceContainer {
    const g = globalThis as unknown as { __baristaContainer?: ServiceContainer };
    if (!g.__baristaContainer) {
      g.__baristaContainer = new ServiceContainer();
    }
    return g.__baristaContainer;
  }
}

export const container = ServiceContainer.getInstance();
