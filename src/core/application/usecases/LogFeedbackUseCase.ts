import { Recipe } from '@/core/domain/recipe/Recipe';
import { ExtractionFeedback, TasteProfile } from '@/core/domain/recipe/ExtractionFeedback';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';

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
  constructor(private readonly recipeRepo: RecipeRepositoryPort) {}

  async execute(request: LogFeedbackRequest): Promise<{
    feedback: ExtractionFeedback;
    adjustedRecipe: Recipe;
  }> {
    const feedback = new ExtractionFeedback({
      id: `feedback-${Date.now()}`,
      recipeId: request.recipeId,
      actualGrindSetting: request.actualGrindSetting,
      actualDoseGrams: request.actualDoseGrams,
      actualYieldGrams: request.actualYieldGrams,
      actualTimeSeconds: request.actualTimeSeconds,
      tasteProfile: request.tasteProfile,
      userNotes: request.userNotes,
    });

    const currentRecipe = await this.recipeRepo.findByCoffeeId(request.recipeId.replace('recipe-', ''));
    if (!currentRecipe) {
      throw new Error(`Recipe not found for ID ${request.recipeId}`);
    }

    const adjustedRecipe = RecipeCalculator.adjustFromFeedback(currentRecipe, feedback);

    await this.recipeRepo.saveFeedback(feedback);
    await this.recipeRepo.save(adjustedRecipe);

    return { feedback, adjustedRecipe };
  }
}
