import { describe, it, expect } from 'vitest';
import { LogFeedbackUseCase } from '@/core/application/usecases/LogFeedbackUseCase';
import { InMemoryRecipeRepository } from '@/infrastructure/out/persistence/memory/InMemoryRecipeRepository';
import { InMemoryCoffeeRepository } from '@/infrastructure/out/persistence/memory/InMemoryCoffeeRepository';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';

describe('LogFeedbackUseCase', () => {
  it('repeatedly recalibrates grind setting on successive channeling feedbacks', async () => {
    const coffee = new Coffee({
      id: 'coffee-dutra',
      roaster: 'San Jorge Coffee',
      name: 'Fazenda Dutra',
      originCountry: 'Brazil',
      variety: 'Red Catuai',
      process: 'natural',
      roastLevel: 'medium',
      tastingNotes: ['chocolate'],
    });

    const coffeeRepo = new InMemoryCoffeeRepository([coffee]);
    const recipeRepo = new InMemoryRecipeRepository();
    const initialRecipe = RecipeCalculator.calculateInitial(
      coffee,
      { id: 'df64', brand: 'DF64', model: 'Gen 2', burrSizeMm: 64, burrType: 'flat', minDial: 0, maxDial: 90, defaultEspressoBaseline: 12 },
      { id: 'sage', brand: 'Sage', model: 'Touch', portafilterSizeMm: 54, standardDoseGrams: 18, availableTemperatures: ['normal'] },
      'test-user'
    );
    await recipeRepo.save(initialRecipe);

    const useCase = new LogFeedbackUseCase(recipeRepo, coffeeRepo);

    // Shot 1: Channeling at 12.5 -> should adjust to 12.0
    const shot1 = await useCase.execute({
      recipeId: initialRecipe.id,
      coffeeId: coffee.id,
      userId: 'test-user',
      actualGrindSetting: 12.5,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 20,
      tasteProfile: 'channeled',
    });

    expect(shot1.adjustedRecipe.grindSetting).toBe(12.0);
    expect(shot1.adjustedRecipe.id).toBe(initialRecipe.id);

    // Shot 2: Channeling again at 12.0 -> should adjust to 11.5
    const shot2 = await useCase.execute({
      recipeId: shot1.adjustedRecipe.id,
      coffeeId: coffee.id,
      userId: 'test-user',
      actualGrindSetting: shot1.adjustedRecipe.grindSetting,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 22,
      tasteProfile: 'channeled',
    });

    expect(shot2.adjustedRecipe.grindSetting).toBe(11.5);
    expect(shot2.adjustedRecipe.id).toBe(initialRecipe.id);

    // Shot 3: Channeling again at 9.0 -> should adjust to 8.5
    const shot3 = await useCase.execute({
      recipeId: shot2.adjustedRecipe.id,
      coffeeId: coffee.id,
      userId: 'test-user',
      actualGrindSetting: 9.0,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 21,
      tasteProfile: 'channeled',
    });

    expect(shot3.adjustedRecipe.grindSetting).toBe(8.5);

    // Verify feedback history is properly recorded
    const history = await recipeRepo.getFeedbackHistory(initialRecipe.id, 'test-user');
    expect(history.length).toBe(3);
  });
});
