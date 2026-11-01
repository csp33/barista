import { describe, it, expect } from 'vitest';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { RecipeCalculator } from '@/core/domain/recipe/RecipeCalculator';
import { ExtractionFeedback } from '@/core/domain/recipe/ExtractionFeedback';

describe('RecipeCalculator Domain Service', () => {
  it('calculates optimal recipe for light roast, washed, high altitude Ethiopian coffee', () => {
    const ethiopia = new Coffee({
      id: 'c1',
      roaster: 'Nomad Coffee',
      name: 'Worka Sakaro',
      originCountry: 'Ethiopia',
      altitudeMasl: 2050,
      variety: 'Kurume, Wolisho',
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['peach', 'jasmine', 'bergamot'],
    });

    const recipe = RecipeCalculator.calculateInitial(ethiopia);

    expect(recipe.doseGrams).toBe(18.0);
    expect(recipe.machineTemperature).toBe('very_high');
    expect(recipe.yieldGrams).toBe(41);
    expect(recipe.ratio).toBe('1:2.3');
    // Base 16 - 2.0 (light) - 0.5 (high altitude > 1800) = 13.5
    expect(recipe.grindSetting).toBe(13.5);
    expect(recipe.recommendedRestDays).toBe(18);
  });

  it('calculates optimal recipe for medium roast, natural Brazilian coffee', () => {
    const brazil = new Coffee({
      id: 'c2',
      roaster: 'San Jorge Coffee',
      name: 'Fazenda Dutra',
      originCountry: 'Brazil',
      altitudeMasl: 1200,
      variety: 'Red Catuai',
      process: 'natural',
      roastLevel: 'medium',
      tastingNotes: ['milk chocolate', 'hazelnut', 'brown sugar'],
    });

    const recipe = RecipeCalculator.calculateInitial(brazil);

    expect(recipe.doseGrams).toBe(18.0);
    expect(recipe.machineTemperature).toBe('normal');
    expect(recipe.yieldGrams).toBe(36);
    expect(recipe.ratio).toBe('1:2.0');
    // Base 16 + 1.0 (natural) = 17.0
    expect(recipe.grindSetting).toBe(17.0);
    expect(recipe.recommendedRestDays).toBe(8);
  });

  it('adjusts recipe when coffee is under-extracted (sour)', () => {
    const coffee = new Coffee({
      id: 'c3',
      roaster: 'Right Side',
      name: 'El Paraiso',
      originCountry: 'Colombia',
      variety: 'Castillo',
      process: 'anaerobic',
      roastLevel: 'medium_light',
      tastingNotes: ['tropical fruit'],
    });

    const initial = RecipeCalculator.calculateInitial(coffee);
    const feedback = new ExtractionFeedback({
      id: 'fb-1',
      recipeId: initial.id,
      actualGrindSetting: initial.grindSetting,
      actualDoseGrams: 18.0,
      actualYieldGrams: initial.yieldGrams,
      actualTimeSeconds: 22,
      tasteProfile: 'sour',
    });

    const adjusted = RecipeCalculator.adjustFromFeedback(initial, feedback);

    // Sour -> grind finer (subtract 1.0) and raise yield
    expect(adjusted.grindSetting).toBe(initial.grindSetting - 1.0);
    expect(adjusted.yieldGrams).toBe(initial.yieldGrams + 2);
    expect(adjusted.notes.some(n => n.includes('finer grind'))).toBe(true);
  });

  it('adjusts recipe when coffee is over-extracted (bitter)', () => {
    const coffee = new Coffee({
      id: 'c4',
      roaster: 'Syra',
      name: 'Dark Matter',
      originCountry: 'Guatemala',
      variety: 'Bourbon',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cacao'],
    });

    const initial = RecipeCalculator.calculateInitial(coffee);
    const feedback = new ExtractionFeedback({
      id: 'fb-2',
      recipeId: initial.id,
      actualGrindSetting: 17.0,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 36,
      tasteProfile: 'bitter',
    });

    const adjusted = RecipeCalculator.adjustFromFeedback(initial, feedback);

    // Bitter -> grind coarser (add 1.0) and reduce yield
    expect(adjusted.grindSetting).toBe(18.0);
    expect(adjusted.yieldGrams).toBe(34);
    expect(adjusted.notes.some(n => n.includes('coarser grind'))).toBe(true);
  });
});
