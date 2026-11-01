import { Recipe } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback, TasteProfile } from '@/core/domain/recipe/ExtractionFeedback';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { CoffeeSommelierPort } from '../ports/out/CoffeeSommelierPort';
import { EquipmentRepositoryPort } from '../ports/out/EquipmentRepositoryPort';

export interface LogFeedbackRequest {
  recipeId: string;
  coffeeId?: string;
  userId: string;
  actualGrindSetting: number;
  actualDoseGrams: number;
  actualYieldGrams: number;
  actualTimeSeconds: number;
  tasteProfile: TasteProfile;
  userNotes?: string;
}

export class LogFeedbackUseCase {
  constructor(
    private readonly recipeRepo: RecipeRepositoryPort,
    private readonly coffeeRepo?: CoffeeRepositoryPort,
    private readonly sommelier?: CoffeeSommelierPort,
    private readonly equipmentRepo?: EquipmentRepositoryPort
  ) {}

  async execute(request: LogFeedbackRequest): Promise<{
    feedback: ExtractionFeedback;
    adjustedRecipe: Recipe;
  }> {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('UserId is required to log extraction feedback');
    }

    const userId = request.userId.trim().toLowerCase();
    const rawId = request.coffeeId || request.recipeId;
    const coffeeId = rawId
      .replace(/^recipe-/, '')
      .replace(new RegExp(`^${userId}-`), '')
      .replace(/-\d{13,}$/, '');

    const currentRecipe = await this.recipeRepo.findByCoffeeId(coffeeId, userId);
    if (!currentRecipe) {
      throw new Error(`Recipe not found for coffee '${coffeeId}' and user '${userId}'`);
    }

    const coffee = this.coffeeRepo ? await this.coffeeRepo.findById(coffeeId) : null;
    let aiDiagnosis: string | undefined;

    if (coffee && this.sommelier) {
      const tempFeedback = new ExtractionFeedback({
        id: 'temp',
        recipeId: currentRecipe.id,
        userId,
        actualGrindSetting: request.actualGrindSetting,
        actualDoseGrams: request.actualDoseGrams,
        actualYieldGrams: request.actualYieldGrams,
        actualTimeSeconds: request.actualTimeSeconds,
        tasteProfile: request.tasteProfile,
        userNotes: request.userNotes,
      });
      aiDiagnosis = await this.sommelier.diagnoseExtraction(tempFeedback, coffee);
    }

    const feedback = new ExtractionFeedback({
      id: `feedback-${Date.now()}`,
      recipeId: currentRecipe.id,
      userId,
      actualGrindSetting: request.actualGrindSetting,
      actualDoseGrams: request.actualDoseGrams,
      actualYieldGrams: request.actualYieldGrams,
      actualTimeSeconds: request.actualTimeSeconds,
      tasteProfile: request.tasteProfile,
      userNotes: request.userNotes,
      aiDiagnosis,
    });

    const grinder = this.equipmentRepo
      ? (await this.equipmentRepo.findGrinderById(currentRecipe.grinderId)) || undefined
      : undefined;

    const adjustedRecipe = RecipeCalculator.adjustFromFeedback(currentRecipe, feedback, grinder);
    if (aiDiagnosis) {
      adjustedRecipe.notes.push(`Diagnóstico IA: ${aiDiagnosis}`);
    }

    await this.recipeRepo.saveFeedback(feedback);
    await this.recipeRepo.save(adjustedRecipe);

    return { feedback, adjustedRecipe };
  }
}
