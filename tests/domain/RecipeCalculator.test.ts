import { describe, it, expect } from 'vitest';
import { Coffee } from '@/domain/coffee/Coffee';
import { RecipeCalculator } from '@/domain/recipe/RecipeCalculator';
import { ExtractionFeedback } from '@/domain/recipe/ExtractionFeedback';
import { Grinder } from '@/domain/equipment/Grinder';
import { EspressoMachine, SAGE_TEMPERATURE_SCALE } from '@/domain/equipment/EspressoMachine';

const testGrinder: Grinder = {
  id: 'df64-gen-2',
  brand: 'DF64',
  model: 'Gen 2',
  burrSizeMm: 64,
  burrType: 'flat',
  minDial: 0,
  maxDial: 90,
  defaultEspressoBaseline: 12.0,
};

const testMachine: EspressoMachine = {
  id: 'sage-barista-touch-impress',
  brand: 'Sage',
  model: 'Barista Touch Impress',
  portafilterSizeMm: 54,
  standardDoseGrams: 18.0,
  availableTemperatures: SAGE_TEMPERATURE_SCALE,
};

const testUserId = 'test-user';

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

    const recipe = RecipeCalculator.calculateInitial(ethiopia, testGrinder, testMachine, testUserId);

    expect(recipe.doseGrams).toBe(18.0);
    expect(recipe.machineTemperature).toBe('hot_3');
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

    const recipe = RecipeCalculator.calculateInitial(brazil, testGrinder, testMachine, testUserId);

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

    const recipe = RecipeCalculator.calculateInitial(indiaMalabar, testGrinder, testMachine, testUserId);

    // Monsooned beans lose density and require fine grind to build 9 bar resistance
    expect(recipe.grindSetting).toBe(5.5);
    expect(recipe.doseGrams).toBe(16.5);
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

    const initial = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId);
    const feedback = new ExtractionFeedback({
      id: 'fb-1',
      recipeId: initial.id,
      userId: testUserId,
      actualGrindSetting: initial.grindSetting,
      actualDoseGrams: 18.0,
      actualYieldGrams: initial.yieldGrams,
      actualTimeSeconds: 22,
      tasteProfile: 'sour',
    });

    const adjusted = RecipeCalculator.adjustFromFeedback(initial, feedback, testGrinder);

    // Sour -> grind finer (subtract 0.5), step temperature warmer (hot_2 -> hot_3) and raise yield
    expect(adjusted.grindSetting).toBe(initial.grindSetting - 0.5);
    expect(adjusted.machineTemperature).toBe('hot_3');
    expect(adjusted.yieldGrams).toBe(initial.yieldGrams + 2);
    expect(adjusted.notes.some(n => n.includes('finer grind'))).toBe(true);
  });

  it('adjusts temperature based on actualTemperature reported in feedback across Sage 9-step scale', () => {
    const coffee = new Coffee({
      id: 'c-temp-test',
      roaster: 'Nomad',
      name: 'Colombia',
      originCountry: 'Colombia',
      variety: 'Caturra',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['caramel'],
    });

    const initial = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId);
    expect(initial.machineTemperature).toBe('normal');

    // User pulled at 'cold_1' and it tasted sour -> should raise 1 step to 'normal'
    const sourAtCold1 = new ExtractionFeedback({
      id: 'fb-temp-1',
      recipeId: initial.id,
      userId: testUserId,
      actualGrindSetting: 12.0,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 24,
      actualTemperature: 'cold_1',
      tasteProfile: 'sour',
    });
    const afterSour = RecipeCalculator.adjustFromFeedback(initial, sourAtCold1, testGrinder, testMachine);
    expect(afterSour.machineTemperature).toBe('normal');

    // User pulled at 'cold_2' and it tasted bitter -> should lower 1 step to 'cold_3'
    const bitterAtCold2 = new ExtractionFeedback({
      id: 'fb-temp-2',
      recipeId: initial.id,
      userId: testUserId,
      actualGrindSetting: 11.5,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 34,
      actualTemperature: 'cold_2',
      tasteProfile: 'bitter',
    });
    const afterBitter = RecipeCalculator.adjustFromFeedback(afterSour, bitterAtCold2, testGrinder, testMachine);
    expect(afterBitter.machineTemperature).toBe('cold_3');
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

    const initial = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId); // 12.5
    const feedback = new ExtractionFeedback({
      id: 'fb-channeled',
      recipeId: initial.id,
      userId: testUserId,
      actualGrindSetting: 9.0,
      actualDoseGrams: 18.0,
      actualYieldGrams: 36,
      actualTimeSeconds: 20, // fast flow channeling
      tasteProfile: 'channeled',
    });

    const adjusted = RecipeCalculator.adjustFromFeedback(initial, feedback, testGrinder);

    // Fast channeling -> grind finer (-0.5) to build puck resistance
    expect(adjusted.grindSetting).toBe(8.5);
    expect(adjusted.notes.some(n => n.includes('finer'))).toBe(true);
  });

  it('enforces 0.5 increments for grind settings on all grinders (e.g. Kingrinder K6)', () => {
    const k6Grinder: Grinder = {
      id: 'kingrinder-k6',
      brand: 'KINGrinder',
      model: 'K6',
      burrSizeMm: 48,
      burrType: 'conical',
      minDial: 0,
      maxDial: 180,
      defaultEspressoBaseline: 35.0,
    };
    const coffee = new Coffee({
      id: 'c-malabar-k6',
      roaster: 'Café de Especialidad',
      name: 'India Malabar Monsooned',
      originCountry: 'India',
      variety: 'Kent',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cacao', 'spices'],
    });

    const recipe = RecipeCalculator.calculateInitial(coffee, k6Grinder, testMachine, testUserId);
    // 35 * 0.46 = 16.1 -> rounded to nearest 0.5 = 16.0
    expect(recipe.grindSetting).toBe(16.0);
    expect(recipe.grindSetting % 0.5).toBe(0);
  });

  it('respects user custom basket dose capacity (e.g. 20g IMS basket)', () => {
    const coffee = new Coffee({
      id: 'c-medium',
      roaster: 'Nomad',
      name: 'Fazenda',
      originCountry: 'Brazil',
      variety: 'Catuai',
      process: 'natural',
      roastLevel: 'medium',
      tastingNotes: ['chocolate'],
    });

    const standardRecipe = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId);
    expect(standardRecipe.doseGrams).toBe(18.0);
    expect(standardRecipe.yieldGrams).toBe(36); // 1:2.0 ratio

    const customRecipe = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId, 20.0);
    expect(customRecipe.doseGrams).toBe(20.0);
    expect(customRecipe.yieldGrams).toBe(40); // 20 * 2.0 = 40
  });
});
