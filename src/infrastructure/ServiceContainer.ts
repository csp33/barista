import { PostgresCoffeeRepository } from './repositories/PostgresCoffeeRepository';
import { PostgresRecipeRepository } from './repositories/PostgresRecipeRepository';
import { PostgresUserProfileRepository } from './repositories/PostgresUserProfileRepository';
import { EquipmentCatalogRepository } from './equipment/EquipmentCatalogRepository';
import { RoasterScraperAdapter } from './out/scraping/RoasterScraperAdapter';
import { OpenAiVisionScannerAdapter } from './out/ai/OpenAiVisionScannerAdapter';
import { OpenAiSommelierAdapter } from './out/ai/OpenAiSommelierAdapter';
import { AddCoffeeUseCase } from '@/core/application/usecases/AddCoffeeUseCase';
import { ExtractCoffeeUseCase } from '@/core/application/usecases/ExtractCoffeeUseCase';
import { LogFeedbackUseCase } from '@/core/application/usecases/LogFeedbackUseCase';
import { GetCoffeeStashUseCase } from '@/core/application/usecases/GetCoffeeStashUseCase';
import { UpdateCoffeeUseCase } from '@/core/application/usecases/UpdateCoffeeUseCase';
import { DeleteCoffeeUseCase } from '@/core/application/usecases/DeleteCoffeeUseCase';
import { GetUserProfilesUseCase } from '@/core/application/usecases/GetUserProfilesUseCase';
import { GetUserProfileUseCase } from '@/core/application/usecases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@/core/application/usecases/UpdateUserProfileUseCase';
import { CreateUserProfileUseCase } from '@/core/application/usecases/CreateUserProfileUseCase';
import { DeleteUserProfileUseCase } from '@/core/application/usecases/DeleteUserProfileUseCase';

class ServiceContainer {
  private static instance: ServiceContainer;

  readonly coffeeRepo: PostgresCoffeeRepository;
  readonly recipeRepo: PostgresRecipeRepository;
  readonly userProfileRepo: PostgresUserProfileRepository;
  readonly equipmentRepo: EquipmentCatalogRepository;
  readonly scraper: RoasterScraperAdapter;
  readonly visionScanner: OpenAiVisionScannerAdapter;
  readonly sommelier: OpenAiSommelierAdapter;

  readonly addCoffeeUseCase: AddCoffeeUseCase;
  readonly extractCoffeeUseCase: ExtractCoffeeUseCase;
  readonly logFeedbackUseCase: LogFeedbackUseCase;
  readonly getCoffeeStashUseCase: GetCoffeeStashUseCase;
  readonly updateCoffeeUseCase: UpdateCoffeeUseCase;
  readonly deleteCoffeeUseCase: DeleteCoffeeUseCase;
  readonly getUserProfilesUseCase: GetUserProfilesUseCase;
  readonly getUserProfileUseCase: GetUserProfileUseCase;
  readonly updateUserProfileUseCase: UpdateUserProfileUseCase;
  readonly createUserProfileUseCase: CreateUserProfileUseCase;
  readonly deleteUserProfileUseCase: DeleteUserProfileUseCase;

  private constructor() {
    this.coffeeRepo = new PostgresCoffeeRepository();
    this.recipeRepo = new PostgresRecipeRepository();
    this.userProfileRepo = new PostgresUserProfileRepository();
    this.equipmentRepo = new EquipmentCatalogRepository();
    this.scraper = new RoasterScraperAdapter();
    this.visionScanner = new OpenAiVisionScannerAdapter();
    this.sommelier = new OpenAiSommelierAdapter();

    this.addCoffeeUseCase = new AddCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo,
      this.scraper,
      this.sommelier,
      this.userProfileRepo,
      this.equipmentRepo
    );
    this.extractCoffeeUseCase = new ExtractCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo,
      this.scraper,
      this.visionScanner,
      this.sommelier,
      this.userProfileRepo,
      this.equipmentRepo
    );
    this.logFeedbackUseCase = new LogFeedbackUseCase(
      this.recipeRepo,
      this.coffeeRepo,
      this.sommelier,
      this.equipmentRepo
    );
    this.getCoffeeStashUseCase = new GetCoffeeStashUseCase(
      this.coffeeRepo,
      this.recipeRepo,
      this.userProfileRepo,
      this.equipmentRepo
    );
    this.updateCoffeeUseCase = new UpdateCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo,
      this.userProfileRepo,
      this.equipmentRepo
    );
    this.deleteCoffeeUseCase = new DeleteCoffeeUseCase(
      this.coffeeRepo,
      this.recipeRepo
    );
    this.getUserProfilesUseCase = new GetUserProfilesUseCase(this.userProfileRepo);
    this.getUserProfileUseCase = new GetUserProfileUseCase(this.userProfileRepo);
    this.updateUserProfileUseCase = new UpdateUserProfileUseCase(this.userProfileRepo);
    this.createUserProfileUseCase = new CreateUserProfileUseCase(this.userProfileRepo);
    this.deleteUserProfileUseCase = new DeleteUserProfileUseCase(this.userProfileRepo);
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
