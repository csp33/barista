import { Coffee, CoffeeProps } from '@/domain/coffee/Coffee';
import { Recipe } from '@/domain/recipe/Recipe';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';
import { Grinder } from '@/domain/equipment/Grinder';
import { EspressoMachine } from '@/domain/equipment/EspressoMachine';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';
import { EquipmentRepositoryPort } from '../ports/out/EquipmentRepositoryPort';

export interface UpdateCoffeeRequest {
  id: string;
  data: Partial<CoffeeProps>;
  userId?: string;
  grinder?: Grinder;
  machine?: EspressoMachine;
}

export interface UpdateCoffeeResult {
  coffee: Coffee;
  recipe: Recipe;
}

export class UpdateCoffeeUseCase {
  constructor(
    private readonly coffeeRepo: CoffeeRepositoryPort,
    private readonly recipeRepo: RecipeRepositoryPort,
    private readonly userProfileRepo?: UserProfileRepositoryPort,
    private readonly equipmentRepo?: EquipmentRepositoryPort
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

    const eq = await this.resolveEquipmentAndUser(request);
    if (request.data.status && eq.userId && this.coffeeRepo.setUserStatus) {
      await this.coffeeRepo.setUserStatus(updated.id, eq.userId, request.data.status);
    }

    const existingRecipe = await this.recipeRepo.findByCoffeeId(updated.id, eq.userId);
    const recipe = RecipeCalculator.calculateInitial(
      updated,
      eq.grinder,
      eq.machine,
      existingRecipe?.userId || eq.userId
    );

    await this.coffeeRepo.save(updated);
    await this.recipeRepo.save(recipe);

    const effectiveStatus = request.data.status ?? existing.status;
    return { coffee: updated.withStatus(effectiveStatus), recipe };
  }

  private async resolveEquipmentAndUser(req: UpdateCoffeeRequest): Promise<{ grinder: Grinder; machine: EspressoMachine; userId: string }> {
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
      machine: machine || { id: 'sage-barista-touch-impress', brand: 'Sage', model: 'Barista Touch Impress', portafilterSizeMm: 54, standardDoseGrams: 18.0, availableTemperatures: ['low', 'normal', 'high', 'very_high'] },
      userId,
    };
  }
}
