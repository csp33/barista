import { describe, it, expect } from 'vitest';
import { Coffee } from '../../src/core/domain/coffee/Coffee';
import { RecipeCalculator } from '../../src/core/domain/recipe/RecipeCalculator';
import { RecipeExplainer } from '../../src/core/domain/recipe/RecipeExplainer';

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

    const recipe = RecipeCalculator.calculateInitial(coffee);
    const rationale = RecipeExplainer.explain(coffee, recipe);

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

    const recipe = RecipeCalculator.calculateInitial(coffee);
    const rationale = RecipeExplainer.explain(coffee, recipe);

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

    const recipe = RecipeCalculator.calculateInitial(coffee);
    const rationale = RecipeExplainer.explain(coffee, recipe);

    expect(rationale.tempWhy.es).toContain('Muy Alta (96°C)');
    expect(rationale.tempWhy.en).toContain('Very High temperature (96°C)');
    expect(rationale.ratioWhy.es).toContain('Ratio alargado');
  });
});
