import { Recipe } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback, TasteProfile } from '@/core/domain/recipe/ExtractionFeedback';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { CoffeeSommelierPort } from '../ports/out/CoffeeSommelierPort';

export interface LogFeedbackRequest {
  recipeId: string;
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
    private readonly sommelier?: CoffeeSommelierPort
  ) {}

  async execute(request: LogFeedbackRequest): Promise<{
    feedback: ExtractionFeedback;
    adjustedRecipe: Recipe;
  }> {
    const coffeeId = request.recipeId.replace('recipe-', '');
    let currentRecipe = await this.recipeRepo.findByCoffeeId(coffeeId);
    const coffee = this.coffeeRepo ? await this.coffeeRepo.findById(coffeeId) : null;

    if (!currentRecipe) {
      if (coffee) {
        currentRecipe = RecipeCalculator.calculateInitial(coffee);
      } else {
        currentRecipe = new Recipe({
          id: request.recipeId,
          coffeeId,
          grinderId: 'df64-gen-2',
          machineId: 'sage-touch-impress',
          doseGrams: request.actualDoseGrams || 18,
          yieldGrams: request.actualYieldGrams || 36,
          ratio: '1:2.0',
          grindSetting: request.actualGrindSetting || 12.0,
          machineTemperature: 'normal',
          targetTimeSeconds: request.actualTimeSeconds || 28,
          recommendedRestDays: 14,
          notes: ['Auto-calibrated baseline recipe'],
        });
      }
      await this.recipeRepo.save(currentRecipe);
    }

    let aiDiagnosis: string | undefined;
    if (coffee && this.sommelier) {
      const tempFeedback = new ExtractionFeedback({
        id: 'temp',
        recipeId: request.recipeId,
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
      recipeId: request.recipeId,
      actualGrindSetting: request.actualGrindSetting,
      actualDoseGrams: request.actualDoseGrams,
      actualYieldGrams: request.actualYieldGrams,
      actualTimeSeconds: request.actualTimeSeconds,
      tasteProfile: request.tasteProfile,
      userNotes: request.userNotes,
      aiDiagnosis,
    });

    const adjustedRecipe = RecipeCalculator.adjustFromFeedback(currentRecipe, feedback);
    if (aiDiagnosis) {
      adjustedRecipe.notes.push(`Diagnóstico IA: ${aiDiagnosis}`);
    }

    await this.recipeRepo.saveFeedback(feedback);
    await this.recipeRepo.save(adjustedRecipe);

    return { feedback, adjustedRecipe };
  }
}
