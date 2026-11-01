import { Coffee } from '@/domain/coffee/Coffee';
import { Recipe } from '@/domain/recipe/Recipe';
import { ExtractionFeedback } from '@/domain/recipe/ExtractionFeedback';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';
import { EquipmentRepositoryPort } from '../ports/out/EquipmentRepositoryPort';

export interface StashItemDTO {
  coffee: Coffee;
  recipe: Recipe | null;
  feedbackHistory: ExtractionFeedback[];
}

export class GetCoffeeStashUseCase {
  constructor(
    private readonly coffeeRepo: CoffeeRepositoryPort,
    private readonly recipeRepo: RecipeRepositoryPort,
    private readonly userProfileRepo: UserProfileRepositoryPort,
    private readonly equipmentRepo: EquipmentRepositoryPort
  ) {}

  async execute(userId: string): Promise<StashItemDTO[]> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('UserId is required to fetch coffee stash');
    }

    const cleanUserId = userId.trim().toLowerCase();
    const coffees = this.coffeeRepo.findAllForUser
      ? await this.coffeeRepo.findAllForUser(cleanUserId)
      : await this.coffeeRepo.findAll();
    const userProfile = await this.userProfileRepo.findById(cleanUserId);

    const grinders = await this.equipmentRepo.findAllGrinders();
    const machines = await this.equipmentRepo.findAllMachines();

    const grinder =
      (userProfile && (await this.equipmentRepo.findGrinderById(userProfile.grinderId))) ||
      grinders[0];
    const machine =
      (userProfile && (await this.equipmentRepo.findMachineById(userProfile.machineId))) ||
      machines[0];

    const items: StashItemDTO[] = [];

    for (const coffee of coffees) {
      let recipe = await this.recipeRepo.findByCoffeeId(coffee.id, cleanUserId);
      const customDose = userProfile?.basketDoseGrams;
      const expectedInitial = RecipeCalculator.calculateInitial(
        coffee,
        grinder,
        machine,
        cleanUserId,
        customDose
      );
      const equipmentChanged =
        recipe && (
          recipe.grinderId !== grinder.id ||
          recipe.machineId !== machine.id ||
          (customDose !== undefined && Math.abs(recipe.doseGrams - expectedInitial.doseGrams) > 0.01)
        );

      if (!recipe || equipmentChanged) {
        recipe = expectedInitial;
        await this.recipeRepo.save(recipe);
      }

      const feedbackHistory = await this.recipeRepo.getFeedbackHistory(recipe.id, cleanUserId);

      items.push({
        coffee,
        recipe,
        feedbackHistory,
      });
    }

    return items;
  }
}
