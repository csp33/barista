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
    // Base 12 - 2.0 (light) - 1.0 (high altitude > 1800m) = 9.0
    expect(recipe.grindSetting).toBe(9.0);
    expect(recipe.recommendedRestDays).toBe(18);
  });

  it('calculates optimal recipe for medium roast, natural Brazilian coffee (sweet spot 10-15)', () => {
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
    // Base 12 + 0.5 (natural) = 12.5 (within 10-15 range)
    expect(recipe.grindSetting).toBe(12.5);
    expect(recipe.recommendedRestDays).toBe(8);
  });

  it('calculates fine grind for India Monsooned Malabar (sweet spot 5-6)', () => {
    const indiaMalabar = new Coffee({
      id: 'c-malabar',
      roaster: 'Café de Especialidad',
      name: 'Comprar Café India Malabar Monsooned',
      originCountry: 'India',
      variety: 'Kent, S.795',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cacao', 'spices', 'tobacco'],
    });

    const recipe = RecipeCalculator.calculateInitial(indiaMalabar);

    // Monsooned beans lose density and require fine grind to build 9 bar resistance
    expect(recipe.grindSetting).toBe(5.5);
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

    // Sour -> grind finer (subtract 0.5) and raise yield
    expect(adjusted.grindSetting).toBe(initial.grindSetting - 0.5);
    expect(adjusted.yieldGrams).toBe(initial.yieldGrams + 2);
    expect(adjusted.notes.some(n => n.includes('finer grind'))).toBe(true);
  });

  it('adjusts recipe finer when shot suffers from fast flow channeling (under-extracted)', () => {
    const coffee = new Coffee({
      id: 'c4',
      roaster: 'San Jorge Coffee',
      name: 'Fazenda Dutra',
      originCountry: 'Brazil',
      variety: 'Red Catuai',
      process: 'natural',
      roastLevel: 'medium',
      tastingNotes: ['chocolate'],
    });

    const initial = RecipeCalculator.calculateInitial(coffee); // 12.5
    const feedback = new ExtractionFeedback({
      id: 'fb-channeled',
      recipeId: initial.id,
      actualGrindSetting: 9.0,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 20, // fast flow channeling
      tasteProfile: 'channeled',
    });

    const adjusted = RecipeCalculator.adjustFromFeedback(initial, feedback);

    // Fast channeling -> grind finer (-0.5) to build puck resistance
    expect(adjusted.grindSetting).toBe(8.5);
    expect(adjusted.notes.some(n => n.includes('finer'))).toBe(true);
  });
});
