import { describe, it, expect } from 'vitest';
import { LogFeedbackUseCase } from '@/application/usecases/LogFeedbackUseCase';
import { MockRecipeRepository as InMemoryRecipeRepository } from '../mocks/MockRecipeRepository';
import { MockCoffeeRepository as InMemoryCoffeeRepository } from '../mocks/MockCoffeeRepository';
import { Coffee } from '@/domain/coffee/Coffee';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';

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

  it('records actualTemperature and adjusts recipe temperature step-by-step on sour/bitter shots', async () => {
    const coffee = new Coffee({
      id: 'coffee-ethiopia',
      roaster: 'Nomad',
      name: 'Worka',
      originCountry: 'Ethiopia',
      variety: 'Heirloom',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['jasmine'],
    });

    const coffeeRepo = new InMemoryCoffeeRepository([coffee]);
    const recipeRepo = new InMemoryRecipeRepository();
    const initialRecipe = RecipeCalculator.calculateInitial(
      coffee,
      { id: 'df64', brand: 'DF64', model: 'Gen 2', burrSizeMm: 64, burrType: 'flat', minDial: 0, maxDial: 90, defaultEspressoBaseline: 12 },
      {
        id: 'sage',
        brand: 'Sage',
        model: 'Touch Impress',
        portafilterSizeMm: 54,
        standardDoseGrams: 18,
        availableTemperatures: ['cold_4', 'cold_3', 'cold_2', 'cold_1', 'normal', 'hot_1', 'hot_2', 'hot_3', 'hot_4'],
      },
      'test-user'
    );
    await recipeRepo.save(initialRecipe);

    const useCase = new LogFeedbackUseCase(recipeRepo, coffeeRepo);

    // Shot 1: User pulled at hot_1, tasted sour -> should step up to hot_2
    const shot1 = await useCase.execute({
      recipeId: initialRecipe.id,
      coffeeId: coffee.id,
      userId: 'test-user',
      actualGrindSetting: 12.0,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 23,
      actualTemperature: 'hot_1',
      tasteProfile: 'sour',
    });

    expect(shot1.feedback.actualTemperature).toBe('hot_1');
    expect(shot1.adjustedRecipe.machineTemperature).toBe('hot_2');

    // Shot 2: User pulled at cold_1, tasted bitter -> should step down to cold_2
    const shot2 = await useCase.execute({
      recipeId: initialRecipe.id,
      coffeeId: coffee.id,
      userId: 'test-user',
      actualGrindSetting: 11.5,
      actualDoseGrams: 18.0,
      actualYieldGrams: 38,
      actualTimeSeconds: 33,
      actualTemperature: 'cold_1',
      tasteProfile: 'bitter',
    });

    expect(shot2.feedback.actualTemperature).toBe('cold_1');
    expect(shot2.adjustedRecipe.machineTemperature).toBe('cold_2');
  });
});
