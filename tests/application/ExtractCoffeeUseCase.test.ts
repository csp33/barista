import { describe, it, expect, vi } from 'vitest';
import { ExtractCoffeeUseCase } from '@/core/application/usecases/ExtractCoffeeUseCase';
import { CoffeeRepositoryPort } from '@/core/application/ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '@/core/application/ports/out/RecipeRepositoryPort';
import { RoasterScraperPort } from '@/core/application/ports/out/RoasterScraperPort';
import { CoffeeSommelierPort } from '@/core/application/ports/out/CoffeeSommelierPort';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { Recipe } from '@/core/domain/recipe/Recipe';

describe('ExtractCoffeeUseCase', () => {
  it('returns existing coffee and recipe when URL is already in database', async () => {
    const existingCoffee = new Coffee({
      id: 'c-cached',
      roaster: 'Nomad',
      name: 'Worka Sakaro',
      originCountry: 'Ethiopia',
      variety: 'Kurume',
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['floral', 'peach'],
      sourceUrl: 'https://nomadcoffee.es/products/worka-sakaro',
      sommelierStory: 'Cached editorial story',
    });

    const mockCoffeeRepo: CoffeeRepositoryPort = {
      findById: vi.fn(),
      findByUrl: vi.fn().mockResolvedValue(existingCoffee),
      findByRoasterAndName: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    const mockRecipe = new Recipe({
      id: 'r-1',
      coffeeId: existingCoffee.id,
      userId: 'default-user',
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
      deleteByCoffeeId: vi.fn(),
    };

    const mockScraper: RoasterScraperPort = {
      scrapeCoffeeUrl: vi.fn(),
    };

    const useCase = new ExtractCoffeeUseCase(mockCoffeeRepo, mockRecipeRepo, mockScraper);
    const result = await useCase.execute({ url: 'https://nomadcoffee.es/products/worka-sakaro' });

    expect(result.isExisting).toBe(true);
    expect(result.coffee.name).toBe('Worka Sakaro');
    expect(result.coffee.sommelierStory).toBe('Cached editorial story');
    expect(mockScraper.scrapeCoffeeUrl).not.toHaveBeenCalled();
  });

  it('scrapes URL, calculates recipe, and enriches with AI sommelier concurrently', async () => {
    const mockCoffeeRepo: CoffeeRepositoryPort = {
      findById: vi.fn(),
      findByUrl: vi.fn().mockResolvedValue(null),
      findByRoasterAndName: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    const mockRecipeRepo: RecipeRepositoryPort = {
      findByCoffeeId: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      saveFeedback: vi.fn(),
      getFeedbackHistory: vi.fn(),
      deleteByCoffeeId: vi.fn(),
    };

    const mockScraper: RoasterScraperPort = {
      scrapeCoffeeUrl: vi.fn().mockResolvedValue({
        roaster: 'San Jorge Coffee Roasters',
        name: 'Guatemala Peña Blanca',
        originCountry: 'Guatemala',
        variety: 'Bourbon',
        process: 'washed',
        roastLevel: 'medium_light',
        tastingNotes: ['red apple', 'caramel'],
        sourceUrl: 'https://sanjorge.coffee/products/pena-blanca',
      }),
    };

    const mockSommelier: CoffeeSommelierPort = {
      generateStory: vi.fn().mockResolvedValue('Elegante café con notas a manzana roja.'),
      diagnoseExtraction: vi.fn(),
      generateRationale: vi.fn().mockResolvedValue({
        grindWhy: 'Punto medio para lavado',
        tempWhy: 'Temp normal',
        ratioWhy: 'Ratio 1:2',
        restWhy: '14 días de reposo',
      }),
    };

    const useCase = new ExtractCoffeeUseCase(
      mockCoffeeRepo,
      mockRecipeRepo,
      mockScraper,
      undefined,
      mockSommelier
    );

    const result = await useCase.execute({ url: 'https://sanjorge.coffee/products/pena-blanca' });

    expect(result.isExisting).toBe(false);
    expect(result.coffee.roaster).toBe('San Jorge Coffee Roasters');
    expect(result.coffee.sommelierStory).toBe('Elegante café con notas a manzana roja.');
    expect(result.coffee.aiRationale?.grindWhy).toBe('Punto medio para lavado');
    expect(result.recipe?.aiRationale?.tempWhy).toBe('Temp normal');
    expect(mockSommelier.generateStory).toHaveBeenCalled();
    expect(mockSommelier.generateRationale).toHaveBeenCalled();
  });

  it('uses precomputed story and rationale in AddCoffeeUseCase to save without re-invoking AI', async () => {
    const mockCoffeeRepo: CoffeeRepositoryPort = {
      findById: vi.fn(),
      findByUrl: vi.fn().mockResolvedValue(null),
      findByRoasterAndName: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    const mockRecipeRepo: RecipeRepositoryPort = {
      findByCoffeeId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
      saveFeedback: vi.fn(),
      getFeedbackHistory: vi.fn(),
      deleteByCoffeeId: vi.fn(),
    };

    const mockScraper: RoasterScraperPort = {
      scrapeCoffeeUrl: vi.fn(),
    };

    const mockSommelier: CoffeeSommelierPort = {
      generateStory: vi.fn(),
      diagnoseExtraction: vi.fn(),
      generateRationale: vi.fn(),
    };

    const { AddCoffeeUseCase } = await import('@/core/application/usecases/AddCoffeeUseCase');
    const addUseCase = new AddCoffeeUseCase(
      mockCoffeeRepo,
      mockRecipeRepo,
      mockScraper,
      mockSommelier
    );

    const saveResult = await addUseCase.execute({
      manualData: {
        roaster: 'San Jorge',
        name: 'Peña Blanca',
        originCountry: 'Guatemala',
        variety: 'Bourbon',
        process: 'washed',
        roastLevel: 'medium_light',
        tastingNotes: ['apple'],
        sommelierStory: 'Precomputed story',
        aiRationale: {
          grindWhy: 'Precomputed grind',
          tempWhy: 'Precomputed temp',
          ratioWhy: 'Precomputed ratio',
          restWhy: 'Precomputed rest',
        },
      },
    });

    expect(saveResult.coffee.sommelierStory).toBe('Precomputed story');
    expect(saveResult.recipe.aiRationale?.grindWhy).toBe('Precomputed grind');
    expect(mockSommelier.generateStory).not.toHaveBeenCalled();
    expect(mockSommelier.generateRationale).not.toHaveBeenCalled();
    expect(mockCoffeeRepo.save).toHaveBeenCalled();
    expect(mockRecipeRepo.save).toHaveBeenCalled();
  });
});
