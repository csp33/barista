import { Coffee, CoffeeProps } from '@/domain/coffee/Coffee';
import { Recipe, AiRationale } from '@/domain/recipe/Recipe';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';
import { Grinder } from '@/domain/equipment/Grinder';
import { EspressoMachine, SAGE_TEMPERATURE_SCALE } from '@/domain/equipment/EspressoMachine';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RoasterScraperPort } from '../ports/out/RoasterScraperPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { CoffeeSommelierPort } from '../ports/out/CoffeeSommelierPort';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';
import { EquipmentRepositoryPort } from '../ports/out/EquipmentRepositoryPort';
import { DuplicateCoffeeError } from '@/domain/coffee/DuplicateCoffeeError';

export interface AddCoffeeRequest {
  url?: string;
  manualData?: Partial<CoffeeProps> & { aiRationale?: AiRationale };
  aiRationale?: AiRationale;
  userId?: string;
  grinder?: Grinder;
  machine?: EspressoMachine;
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
    private readonly sommelier?: CoffeeSommelierPort,
    private readonly userProfileRepo?: UserProfileRepositoryPort,
    private readonly equipmentRepo?: EquipmentRepositoryPort
  ) {}

  async execute(request: AddCoffeeRequest): Promise<AddCoffeeResult> {
    const eqUser = await this.resolveEquipmentAndUser(request);
    const url = request.url?.trim();

    if (url) {
      const existing = await this.coffeeRepo.findByUrl(url);
      if (existing) return this.buildResult(existing, true, eqUser);

      const scraped = await this.scraper.scrapeCoffeeUrl(url);
      const match = (await this.coffeeRepo.findByRoasterAndName(scraped.roaster, scraped.name)) ||
        (scraped.sourceUrl ? await this.coffeeRepo.findByUrl(scraped.sourceUrl) : null);
      if (match) return this.buildResult(match, true, eqUser);

      return this.finalizeAndSave(scraped as CoffeeProps, eqUser);
    }

    if (request.manualData?.name && request.manualData.roaster) {
      const { roaster, name, sourceUrl } = request.manualData;
      const match = (await this.coffeeRepo.findByRoasterAndName(roaster, name)) ||
        (sourceUrl ? await this.coffeeRepo.findByUrl(sourceUrl) : null);
      if (match) throw new DuplicateCoffeeError(match.roaster, match.name);

      const preRationale = request.manualData.aiRationale || request.aiRationale;
      return this.finalizeAndSave(request.manualData as CoffeeProps, eqUser, preRationale);
    }

    throw new Error('Either a roaster URL or complete coffee data is required');
  }

  private async finalizeAndSave(
    raw: CoffeeProps,
    eq: { grinder: Grinder; machine: EspressoMachine; userId: string },
    precomputedRationale?: AiRationale
  ): Promise<AddCoffeeResult> {
    let story = raw.sommelierStory;
    if (!story && this.sommelier) {
      story = await this.sommelier.generateStory(new Coffee({ ...raw, id: 'temp' }));
    }

    const initialStatus = raw.status || 'active';
    const coffee = new Coffee({
      ...raw,
      status: this.coffeeRepo.setUserStatus ? 'bodega' : initialStatus,
      sommelierStory: story,
      id: `coffee-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    });

    let recipe = RecipeCalculator.calculateInitial(coffee, eq.grinder, eq.machine, eq.userId);
    const rationale = precomputedRationale || (this.sommelier ? await this.sommelier.generateRationale(coffee, recipe).catch(() => undefined) : undefined);
    if (rationale) recipe = new Recipe({ ...recipe, aiRationale: rationale });

    await this.coffeeRepo.save(coffee);
    if (this.coffeeRepo.setUserStatus) {
      await this.coffeeRepo.setUserStatus(coffee.id, eq.userId, initialStatus);
    }
    await this.recipeRepo.save(recipe);
    return { coffee: coffee.withStatus(initialStatus), recipe, fromCache: false };
  }

  private async resolveEquipmentAndUser(req: AddCoffeeRequest): Promise<{ grinder: Grinder; machine: EspressoMachine; userId: string }> {
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

  private async buildResult(coffee: Coffee, fromCache: boolean, eq: { grinder: Grinder; machine: EspressoMachine; userId: string }): Promise<AddCoffeeResult> {
    if (this.coffeeRepo.setUserStatus) {
      await this.coffeeRepo.setUserStatus(coffee.id, eq.userId, 'active');
    }
    let recipe = await this.recipeRepo.findByCoffeeId(coffee.id, eq.userId);
    if (!recipe) {
      recipe = RecipeCalculator.calculateInitial(coffee, eq.grinder, eq.machine, eq.userId);
      await this.recipeRepo.save(recipe);
    }
    return { coffee: coffee.withStatus('active'), recipe, fromCache };
  }
}
