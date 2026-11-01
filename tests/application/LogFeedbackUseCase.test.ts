import { describe, it, expect } from 'vitest';
import { LogFeedbackUseCase } from '@/core/application/usecases/LogFeedbackUseCase';
import { InMemoryRecipeRepository } from '@/adapters/out/persistence/memory/InMemoryRecipeRepository';
import { InMemoryCoffeeRepository } from '@/adapters/out/persistence/memory/InMemoryCoffeeRepository';
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
    const initialRecipe = RecipeCalculator.calculateInitial(coffee); // Baseline 12.5
    await recipeRepo.save(initialRecipe);

    const useCase = new LogFeedbackUseCase(recipeRepo, coffeeRepo);

    // Shot 1: Channeling at 12.5 -> should adjust to 12.0
    const shot1 = await useCase.execute({
      recipeId: initialRecipe.id,
      coffeeId: coffee.id,
      actualGrindSetting: 12.5,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 20,
      tasteProfile: 'channeled',
    });

    expect(shot1.adjustedRecipe.grindSetting).toBe(12.0);
    expect(shot1.adjustedRecipe.id).toBe(`recipe-${coffee.id}`);

    // Shot 2: Channeling again at 12.0 -> should adjust to 11.5
    const shot2 = await useCase.execute({
      recipeId: shot1.adjustedRecipe.id,
      coffeeId: coffee.id,
      actualGrindSetting: shot1.adjustedRecipe.grindSetting,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 22,
      tasteProfile: 'channeled',
    });

    expect(shot2.adjustedRecipe.grindSetting).toBe(11.5);
    expect(shot2.adjustedRecipe.id).toBe(`recipe-${coffee.id}`);

    // Shot 3: Channeling again at 9.0 -> should adjust to 8.5
    const shot3 = await useCase.execute({
      recipeId: shot2.adjustedRecipe.id,
      actualGrindSetting: 9.0,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 21,
      tasteProfile: 'channeled',
    });

    expect(shot3.adjustedRecipe.grindSetting).toBe(8.5);

    // Verify feedback history is properly recorded
    const history = await recipeRepo.getFeedbackHistory(`recipe-${coffee.id}`);
    expect(history.length).toBe(3);
  });
});
