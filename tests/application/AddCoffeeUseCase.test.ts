import { describe, it, expect, vi } from 'vitest';
import { AddCoffeeUseCase } from '@/core/application/usecases/AddCoffeeUseCase';
import { CoffeeRepositoryPort } from '@/core/application/ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '@/core/application/ports/out/RecipeRepositoryPort';
import { RoasterScraperPort } from '@/core/application/ports/out/RoasterScraperPort';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { Recipe } from '@/core/domain/recipe/Recipe';

describe('AddCoffeeUseCase', () => {
  it('returns cached coffee and recipe when URL already exists in database', async () => {
    const existingCoffee = new Coffee({
      id: 'existing-1',
      roaster: 'Nomad',
      name: 'Worka',
      originCountry: 'Ethiopia',
      variety: 'Heirloom',
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['floral'],
      sourceUrl: 'https://nomadcoffee.es/products/worka',
    });

    const mockCoffeeRepo: CoffeeRepositoryPort = {
      findById: vi.fn(),
      findByUrl: vi.fn().mockResolvedValue(existingCoffee),
      findByRoasterAndName: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
    };

    const mockRecipe = new Recipe({
      id: 'r-1',
      coffeeId: existingCoffee.id,
      grinderId: 'df64',
      machineId: 'sage',
      doseGrams: 18,
      yieldGrams: 40,
      ratio: '1:2.2',
      grindSetting: 14,
      machineTemperature: 'high',
      targetTimeSeconds: 28,
      recommendedRestDays: 14,
      notes: [],
    });

    const mockRecipeRepo: RecipeRepositoryPort = {
      findByCoffeeId: vi.fn().mockResolvedValue(mockRecipe),
      save: vi.fn(),
      saveFeedback: vi.fn(),
      getFeedbackHistory: vi.fn(),
    };

    const mockScraper: RoasterScraperPort = {
      scrapeCoffeeUrl: vi.fn(),
    };

    const useCase = new AddCoffeeUseCase(mockCoffeeRepo, mockRecipeRepo, mockScraper);

    const result = await useCase.execute({ url: 'https://nomadcoffee.es/products/worka' });

    expect(result.fromCache).toBe(true);
    expect(result.coffee.name).toBe('Worka');
    expect(mockScraper.scrapeCoffeeUrl).not.toHaveBeenCalled();
  });

  it('scrapes roaster URL and saves coffee + recipe when cache misses', async () => {
    const mockCoffeeRepo: CoffeeRepositoryPort = {
      findById: vi.fn(),
      findByUrl: vi.fn().mockResolvedValue(null),
      findByRoasterAndName: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn(),
    };

    const mockRecipeRepo: RecipeRepositoryPort = {
      findByCoffeeId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      saveFeedback: vi.fn(),
      getFeedbackHistory: vi.fn(),
    };

    const mockScraper: RoasterScraperPort = {
      scrapeCoffeeUrl: vi.fn().mockResolvedValue({
        roaster: 'San Jorge Coffee Roasters',
        name: 'Guatemala Peña Blanca',
        originCountry: 'Guatemala',
        variety: 'Bourbon',
        process: 'washed',
        roastLevel: 'medium_light',
        tastingNotes: ['red apple', 'caramel', 'chocolate'],
        sourceUrl: 'https://sanjorge.coffee/products/pena-blanca',
      }),
    };

    const useCase = new AddCoffeeUseCase(mockCoffeeRepo, mockRecipeRepo, mockScraper);

    const result = await useCase.execute({ url: 'https://sanjorge.coffee/products/pena-blanca' });

    expect(result.fromCache).toBe(false);
    expect(result.coffee.roaster).toBe('San Jorge Coffee Roasters');
    expect(result.recipe.doseGrams).toBe(18);
    expect(mockCoffeeRepo.save).toHaveBeenCalled();
    expect(mockRecipeRepo.save).toHaveBeenCalled();
  });
});
