import { describe, it, expect, beforeEach } from 'vitest';
import { Coffee } from '../../src/core/domain/coffee/Coffee';
import { RecipeCalculator } from '../../src/core/domain/recipe/RecipeCalculator';
import { InMemoryCoffeeRepository } from '../../src/adapters/out/persistence/memory/InMemoryCoffeeRepository';
import { InMemoryRecipeRepository } from '../../src/adapters/out/persistence/memory/InMemoryRecipeRepository';
import { DeleteCoffeeUseCase } from '../../src/core/application/usecases/DeleteCoffeeUseCase';

describe('DeleteCoffeeUseCase', () => {
  let coffeeRepo: InMemoryCoffeeRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let useCase: DeleteCoffeeUseCase;

  beforeEach(() => {
    coffeeRepo = new InMemoryCoffeeRepository();
    recipeRepo = new InMemoryRecipeRepository();
    useCase = new DeleteCoffeeUseCase(coffeeRepo, recipeRepo);
  });

  it('rejects deletion if user is not admin', async () => {
    const coffee = new Coffee({
      id: 'c1',
      roaster: 'Nomad',
      name: 'Test',
      originCountry: 'Colombia',
      variety: 'Caturra',
      process: 'washed',
      roastLevel: 'light',
      status: 'history',
      tastingNotes: ['floral'],
    });
    await coffeeRepo.save(coffee);

    await expect(
      useCase.execute({ coffeeId: 'c1', userRole: 'user' })
    ).rejects.toThrow('Unauthorized: Only administrators can delete coffees from history');
  });

  it('rejects deletion if coffee is active instead of history', async () => {
    const coffee = new Coffee({
      id: 'c2',
      roaster: 'Nomad',
      name: 'Active Coffee',
      originCountry: 'Colombia',
      variety: 'Caturra',
      process: 'washed',
      roastLevel: 'light',
      status: 'active',
      tastingNotes: ['floral'],
    });
    await coffeeRepo.save(coffee);

    await expect(
      useCase.execute({ coffeeId: 'c2', userRole: 'admin' })
    ).rejects.toThrow('Only archived coffees in history can be permanently deleted');
  });

  it('successfully deletes archived coffee and associated recipe when admin', async () => {
    const coffee = new Coffee({
      id: 'c3',
      roaster: 'San Jorge',
      name: 'History Coffee',
      originCountry: 'Guatemala',
      variety: 'Bourbon',
      process: 'washed',
      roastLevel: 'medium',
      status: 'history',
      tastingNotes: ['chocolate'],
    });
    const recipe = RecipeCalculator.calculateInitial(coffee);

    await coffeeRepo.save(coffee);
    await recipeRepo.save(recipe);

    const result = await useCase.execute({ coffeeId: 'c3', userRole: 'admin' });
    expect(result.success).toBe(true);
    expect(result.deletedId).toBe('c3');

    const foundCoffee = await coffeeRepo.findById('c3');
    expect(foundCoffee).toBeNull();

    const foundRecipe = await recipeRepo.findByCoffeeId('c3');
    expect(foundRecipe).toBeNull();
  });
});
