import { describe, it, expect } from 'vitest';
import { Coffee } from '../../src/domain/coffee/Coffee';
import { RecipeCalculator } from '../../src/domain/recipe/RecipeCalculator';
import { RecipeExplainer } from '../../src/domain/recipe/RecipeExplainer';
import { Grinder } from '../../src/domain/equipment/Grinder';
import { EspressoMachine, SAGE_TEMPERATURE_SCALE } from '../../src/domain/equipment/EspressoMachine';

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

describe('RecipeExplainer', () => {
  it('explains monsooned malabar low density grind requirement', () => {
    const coffee = new Coffee({
      id: 'c1',
      roaster: 'Cafés El Criollo',
      name: 'India Malabar Monsooned',
      originCountry: 'India',
      variety: 'Kent, Catimor',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cereal', 'pimienta', 'cedro'],
      recommendedRestDays: 14,
    });

    const recipe = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId);
    const rationale = RecipeExplainer.explain(coffee, recipe, testMachine);

    expect(rationale.doseWhy.es).toContain('16.5g');
    expect(rationale.doseWhy.es).toContain('cesta de 54mm');
    expect(rationale.doseWhy.en).toContain('16.5g');
    expect(rationale.grindWhy.es).toContain('Grano monsonado poroso');
    expect(rationale.grindWhy.es).toContain('5.5');
    expect(rationale.grindWhy.en).toContain('Monsooned beans');
    expect(rationale.tempWhy.es).toContain('93°C');
  });

  it('explains brazil origin fines and sweet spot grind setting', () => {
    const coffee = new Coffee({
      id: 'c2',
      roaster: 'Nomad Coffee',
      name: 'Brasil Fazenda Ambiental',
      originCountry: 'Brasil',
      variety: 'Catuai',
      process: 'natural',
      roastLevel: 'medium',
      tastingNotes: ['chocolate', 'nueces'],
      recommendedRestDays: 14,
    });

    const recipe = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId);
    const rationale = RecipeExplainer.explain(coffee, recipe, testMachine);

    expect(rationale.doseWhy.es).toContain('18g');
    expect(rationale.doseWhy.es).toContain('cesta de 54mm');
    expect(rationale.grindWhy.es).toContain('Brasil');
    expect(rationale.grindWhy.es).toContain('rango 10-15');
    expect(rationale.grindWhy.en).toContain('Brazil');
  });

  it('explains high-altitude light roast dense extraction', () => {
    const coffee = new Coffee({
      id: 'c3',
      roaster: 'San Jorge',
      name: 'Ethiopia Yirgacheffe Chelchele',
      originCountry: 'Ethiopia',
      variety: 'Kurume',
      altitudeMasl: 2000,
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['jazmín', 'bergamota', 'melocotón'],
      recommendedRestDays: 21,
    });

    const recipe = RecipeCalculator.calculateInitial(coffee, testGrinder, testMachine, testUserId);
    const rationale = RecipeExplainer.explain(coffee, recipe, testMachine);

    expect(rationale.doseWhy.es).toContain('18g');
    expect(rationale.doseWhy.es).toContain('Grano denso');
    expect(rationale.tempWhy.es).toContain('Caliente 3 (96°C)');
    expect(rationale.tempWhy.en).toContain('Hot 3 temperature (96°C)');
    expect(rationale.ratioWhy.es).toContain('Ratio alargado');
  });
});
