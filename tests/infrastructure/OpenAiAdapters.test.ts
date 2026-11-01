import { describe, it, expect } from 'vitest';
import { OpenAiVisionScannerAdapter } from '../../src/infrastructure/out/ai/OpenAiVisionScannerAdapter';
import { OpenAiSommelierAdapter } from '../../src/infrastructure/out/ai/OpenAiSommelierAdapter';
import { Coffee } from '../../src/domain/coffee/Coffee';
import { Recipe } from '../../src/domain/recipe/Recipe';
import { ExtractionFeedback } from '../../src/domain/recipe/ExtractionFeedback';

describe('OpenAiAdapters', () => {
  it('OpenAiVisionScannerAdapter handles local fallback gracefully', async () => {
    const scanner = new OpenAiVisionScannerAdapter();
    const result = await scanner.scanCoffeeBagImage('mockBase64', 'image/jpeg');

    expect(result.name).toBeDefined();
    expect(result.roaster).toBeDefined();
    expect(result.originCountry).toBe('Kenya');
    expect(result.tastingNotes.length).toBeGreaterThan(0);
  });

  it('OpenAiSommelierAdapter generates rich terroir story', async () => {
    const sommelier = new OpenAiSommelierAdapter();
    const coffee = new Coffee({
      id: 'c1',
      roaster: 'Nomad Coffee',
      name: 'Worka Sakaro',
      originCountry: 'Ethiopia',
      variety: 'Kurume',
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['peach', 'jasmine'],
    });

    const story = await sommelier.generateStory(coffee);
    expect(story).toContain('Ethiopia');
    expect(story).toContain('espresso');
  });

  it('OpenAiSommelierAdapter provides actionable barista diagnosis for sour shot', async () => {
    const sommelier = new OpenAiSommelierAdapter();
    const coffee = new Coffee({
      id: 'c2',
      roaster: 'San Jorge',
      name: 'Fazenda Dutra',
      originCountry: 'Brazil',
      variety: 'Catuai',
      process: 'natural',
      roastLevel: 'medium',
      tastingNotes: ['chocolate'],
    });

    const feedback = new ExtractionFeedback({
      id: 'f1',
      recipeId: 'r1',
      userId: 'test-user',
      actualGrindSetting: 12.0,
      actualDoseGrams: 18,
      actualYieldGrams: 36,
      actualTimeSeconds: 19,
      tasteProfile: 'sour',
      userNotes: 'ácido punzante y rápido',
    });

    const diagnosis = await sommelier.diagnoseExtraction(feedback, coffee);
    expect(diagnosis).toContain('Sub-extracción');
    expect(diagnosis).toContain('moler más fino');
  });

  it('OpenAiSommelierAdapter generates recipe rationale with 5 barista pillars', async () => {
    const sommelier = new OpenAiSommelierAdapter();
    const coffee = new Coffee({
      id: 'c3',
      roaster: 'Nomad Coffee',
      name: 'Worka Sakaro',
      originCountry: 'Ethiopia',
      variety: 'Kurume',
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['peach', 'jasmine'],
    });
    const recipe = new Recipe({
      id: 'r3',
      coffeeId: 'c3',
      userId: 'test-user',
      grinderId: 'df64-gen-2',
      machineId: 'sage-touch-impress',
      doseGrams: 18,
      yieldGrams: 41,
      ratio: '1:2.3',
      grindSetting: 9.0,
      machineTemperature: 'very_high',
      targetTimeSeconds: 28,
      recommendedRestDays: 18,
      notes: [],
    });

    const rationale = await sommelier.generateRationale(coffee, recipe);
    expect(rationale.doseWhy).toBeDefined();
    expect(rationale.grindWhy).toBeDefined();
    expect(rationale.tempWhy).toBeDefined();
    expect(rationale.ratioWhy).toBeDefined();
    expect(rationale.restWhy).toBeDefined();
  });
});
