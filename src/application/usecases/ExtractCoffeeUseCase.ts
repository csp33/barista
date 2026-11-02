import { Coffee } from '@/domain/coffee/Coffee';
import { Recipe, AiRationale } from '@/domain/recipe/Recipe';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';
import { Grinder } from '@/domain/equipment/Grinder';
import { EspressoMachine, SAGE_TEMPERATURE_SCALE } from '@/domain/equipment/EspressoMachine';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { RoasterScraperPort, ScrapedCoffeeData } from '../ports/out/RoasterScraperPort';
import { CoffeeVisionScannerPort } from '../ports/out/CoffeeVisionScannerPort';
import { CoffeeSommelierPort } from '../ports/out/CoffeeSommelierPort';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';
import { EquipmentRepositoryPort } from '../ports/out/EquipmentRepositoryPort';

export interface ExtractCoffeeRequest {
  url?: string;
  imageBase64?: string;
  mimeType?: string;
  userId?: string;
  grinder?: Grinder;
  machine?: EspressoMachine;
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
    private readonly sommelier?: CoffeeSommelierPort,
    private readonly userProfileRepo?: UserProfileRepositoryPort,
    private readonly equipmentRepo?: EquipmentRepositoryPort
  ) {}

  async execute(request: ExtractCoffeeRequest): Promise<ExtractCoffeeResult> {
    const eq = await this.resolveEquipmentAndUser(request);
    const url = request.url?.trim();

    if (url) {
      const existing = await this.coffeeRepo.findByUrl(url);
      if (existing) return this.buildExistingResult(existing, eq.userId);
    }

    let scraped: ScrapedCoffeeData;
    if (url) {
      scraped = await this.scraper.scrapeCoffeeUrl(url);
    } else if (request.imageBase64 && this.visionScanner) {
      scraped = await this.visionScanner.scanCoffeeBagImage(request.imageBase64, request.mimeType || 'image/jpeg');
    } else {
      throw new Error('Either a valid roaster URL or image data is required');
    }

    const match = (await this.coffeeRepo.findByRoasterAndName(scraped.roaster, scraped.name)) ||
      (scraped.sourceUrl ? await this.coffeeRepo.findByUrl(scraped.sourceUrl) : null);
    if (match) return this.buildExistingResult(match, eq.userId);

    const tempCoffee = new Coffee({ ...scraped, id: 'temp-extract' });
    const initialRecipe = RecipeCalculator.calculateInitial(tempCoffee, eq.grinder, eq.machine, eq.userId);
    let sommelierStory = scraped.sommelierStory;
    let aiRationale: AiRationale | undefined;

    if (this.sommelier) {
      const storyP = !sommelierStory ? this.sommelier.generateStory(tempCoffee) : Promise.resolve(sommelierStory);
      const ratP = this.sommelier.generateRationale(tempCoffee, initialRecipe);
      const [storyRes, ratRes] = await Promise.allSettled([storyP, ratP]);
      if (storyRes.status === 'fulfilled' && storyRes.value) sommelierStory = storyRes.value;
      if (ratRes.status === 'fulfilled' && ratRes.value) aiRationale = ratRes.value;
    }

    const finalRecipe = aiRationale ? new Recipe({ ...initialRecipe, aiRationale }) : initialRecipe;
    return {
      coffee: { ...scraped, sommelierStory, aiRationale },
      recipe: finalRecipe,
      isExisting: false,
    };
  }

  private async buildExistingResult(existing: Coffee, userId: string): Promise<ExtractCoffeeResult> {
    const recipe = await this.recipeRepo.findByCoffeeId(existing.id, userId);
    return {
      coffee: {
        roaster: existing.roaster, name: existing.name, originCountry: existing.originCountry,
        region: existing.region, producer: existing.producer, altitudeMasl: existing.altitudeMasl,
        variety: existing.variety, process: existing.process, roastLevel: existing.roastLevel,
        tastingNotes: existing.tastingNotes, recommendedRestDays: existing.recommendedRestDays,
        sourceUrl: existing.sourceUrl, imageUrl: existing.imageUrl, sommelierStory: existing.sommelierStory,
        aiRationale: recipe?.aiRationale,
      },
      recipe: recipe ?? undefined,
      isExisting: true,
    };
  }

  private async resolveEquipmentAndUser(req: ExtractCoffeeRequest): Promise<{ grinder: Grinder; machine: EspressoMachine; userId: string }> {
    const userId = req.userId?.trim() || (this.userProfileRepo ? (await this.userProfileRepo.findAll())[0]?.id : undefined) || 'default-user';
    let grinder = req.grinder;
    let machine = req.machine;

    if (this.equipmentRepo && this.userProfileRepo) {
      const p = await this.userProfileRepo.findById(userId);
      if (p) {
        grinder = grinder || ((await this.equipmentRepo.findGrinderById(p.grinderId)) ?? undefined);
        machine = machine || ((await this.equipmentRepo.findMachineById(p.machineId)) ?? undefined);
      }
      grinder = grinder || (await this.equipmentRepo.findAllGrinders())[0];
      machine = machine || (await this.equipmentRepo.findAllMachines())[0];
    }

    return {
      grinder: grinder || { id: 'df64-gen-2', brand: 'DF64', model: 'Gen 2', burrSizeMm: 64, burrType: 'flat', minDial: 0, maxDial: 90, defaultEspressoBaseline: 12.0 },
      machine: machine || { id: 'sage-barista-touch-impress', brand: 'Sage', model: 'Barista Touch Impress', portafilterSizeMm: 54, standardDoseGrams: 18.0, availableTemperatures: SAGE_TEMPERATURE_SCALE },
      userId,
    };
  }
}
