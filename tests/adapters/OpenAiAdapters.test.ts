import { describe, it, expect } from 'vitest';
import { OpenAiVisionScannerAdapter } from '../../src/adapters/out/ai/OpenAiVisionScannerAdapter';
import { OpenAiSommelierAdapter } from '../../src/adapters/out/ai/OpenAiSommelierAdapter';
import { Coffee } from '../../src/core/domain/coffee/Coffee';
import { ExtractionFeedback } from '../../src/core/domain/recipe/ExtractionFeedback';

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
      actualGrindSetting: 12.0,
      actualDoseGrams: 18,
      actualYieldGrams: 36,
      actualTimeSeconds: 19,
      tasteProfile: 'sour',
      userNotes: 'ácido punzante y rápido',
    });

    const diagnosis = await sommelier.diagnoseExtraction(feedback, coffee);
    expect(diagnosis).toContain('Sub-extracción');
    expect(diagnosis).toContain('DF64');
  });
});
