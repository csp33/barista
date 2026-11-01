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
    const currentRecipe = await this.recipeRepo.findByCoffeeId(coffeeId);
    if (!currentRecipe) {
      throw new Error(`Recipe not found for ID ${request.recipeId}`);
    }

    let aiDiagnosis: string | undefined;
    if (this.coffeeRepo && this.sommelier) {
      const coffee = await this.coffeeRepo.findById(coffeeId);
      if (coffee) {
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
