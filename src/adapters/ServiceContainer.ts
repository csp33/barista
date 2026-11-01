import { Coffee } from '@/core/domain/coffee/Coffee';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { InMemoryCoffeeRepository } from './out/persistence/memory/InMemoryCoffeeRepository';
import { InMemoryRecipeRepository } from './out/persistence/memory/InMemoryRecipeRepository';
import { RoasterScraperAdapter } from './out/scraping/RoasterScraperAdapter';
import { AddCoffeeUseCase } from '@/core/application/usecases/AddCoffeeUseCase';
import { LogFeedbackUseCase } from '@/core/application/usecases/LogFeedbackUseCase';
import { GetCoffeeStashUseCase } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { UpdateCoffeeUseCase } from '@/core/application/usecases/UpdateCoffeeUseCase';

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
    recommendedRestDays: 18,
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
    recommendedRestDays: 8,
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
    recommendedRestDays: 12,
  }),
];

class ServiceContainer {
  private static instance: ServiceContainer;

  readonly coffeeRepo: InMemoryCoffeeRepository;
  readonly recipeRepo: InMemoryRecipeRepository;
  readonly scraper: RoasterScraperAdapter;

  readonly addCoffeeUseCase: AddCoffeeUseCase;
  readonly logFeedbackUseCase: LogFeedbackUseCase;
  readonly getCoffeeStashUseCase: GetCoffeeStashUseCase;
  readonly updateCoffeeUseCase: UpdateCoffeeUseCase;

  private constructor() {
    this.coffeeRepo = new InMemoryCoffeeRepository(INITIAL_COFFEES);
    this.recipeRepo = new InMemoryRecipeRepository();
    this.scraper = new RoasterScraperAdapter();

    for (const coffee of INITIAL_COFFEES) {
      const recipe = RecipeCalculator.calculateInitial(coffee);
      this.recipeRepo.save(recipe);
    }

    this.addCoffeeUseCase = new AddCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo,
      this.scraper
    );
    this.logFeedbackUseCase = new LogFeedbackUseCase(this.recipeRepo);
    this.getCoffeeStashUseCase = new GetCoffeeStashUseCase(
      this.coffeeRepo,
      this.recipeRepo
    );
    this.updateCoffeeUseCase = new UpdateCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo
    );
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
}

export const container = ServiceContainer.getInstance();
