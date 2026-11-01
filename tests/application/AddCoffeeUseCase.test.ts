import { describe, it, expect, vi } from 'vitest';
import { AddCoffeeUseCase } from '@/application/usecases/AddCoffeeUseCase';
import { CoffeeRepositoryPort } from '@/application/ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '@/application/ports/out/RecipeRepositoryPort';
import { RoasterScraperPort } from '@/application/ports/out/RoasterScraperPort';
import { Coffee } from '@/domain/coffee/Coffee';
import { Recipe } from '@/domain/recipe/Recipe';
import { DuplicateCoffeeError } from '@/domain/coffee/DuplicateCoffeeError';

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

  it('throws DuplicateCoffeeError when adding manual coffee that already exists', async () => {
    const existingCoffee = new Coffee({
      id: 'existing-elcriollo',
      roaster: 'Cafés el Criollo',
      name: 'India Malabar Monsooned',
      originCountry: 'India',
      variety: 'Kent',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cereal'],
    });

    const mockCoffeeRepo: CoffeeRepositoryPort = {
      findById: vi.fn(),
      findByUrl: vi.fn().mockResolvedValue(null),
      findByRoasterAndName: vi.fn().mockResolvedValue(existingCoffee),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };

    const mockRecipeRepo: RecipeRepositoryPort = {
      findByCoffeeId: vi.fn(),
      save: vi.fn(),
      saveFeedback: vi.fn(),
      getFeedbackHistory: vi.fn(),
      deleteByCoffeeId: vi.fn(),
    };

    const mockScraper: RoasterScraperPort = {
      scrapeCoffeeUrl: vi.fn(),
    };

    const useCase = new AddCoffeeUseCase(mockCoffeeRepo, mockRecipeRepo, mockScraper);

    await expect(
      useCase.execute({
        manualData: {
          roaster: 'Cafés El Criollo',
          name: 'Café India Malabar Monsooned',
          originCountry: 'India',
          variety: 'Kent',
          process: 'washed',
          roastLevel: 'medium',
          tastingNotes: ['cereal'],
        },
      })
    ).rejects.toThrow(DuplicateCoffeeError);

    expect(mockCoffeeRepo.save).not.toHaveBeenCalled();
  });

  it('returns cached coffee when scraped roaster & name matches existing coffee', async () => {
    const existingCoffee = new Coffee({
      id: 'existing-elcriollo',
      roaster: 'Cafés el Criollo',
      name: 'India Malabar Monsooned',
      originCountry: 'India',
      variety: 'Kent',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cereal'],
      sourceUrl: 'https://cafeselcriollo.com/producto/cafe-india/',
    });

    const mockCoffeeRepo: CoffeeRepositoryPort = {
      findById: vi.fn(),
      findByUrl: vi.fn().mockResolvedValue(null),
      findByRoasterAndName: vi.fn().mockResolvedValue(existingCoffee),
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
        roaster: 'Cafés el Criollo',
        name: 'India Malabar Monsooned',
        originCountry: 'India',
        variety: 'Kent',
        process: 'washed',
        roastLevel: 'medium',
        tastingNotes: ['cereal'],
        sourceUrl: 'https://cafeselcriollo.com/producto/cafe-india/',
      }),
    };

    const useCase = new AddCoffeeUseCase(mockCoffeeRepo, mockRecipeRepo, mockScraper);

    const result = await useCase.execute({ url: 'https://cafeselcriollo.com/producto/cafe-india/' });

    expect(result.fromCache).toBe(true);
    expect(result.coffee.id).toBe('existing-elcriollo');
    expect(mockCoffeeRepo.save).not.toHaveBeenCalled();
  });
});
