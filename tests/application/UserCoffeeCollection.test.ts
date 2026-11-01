import { describe, it, expect, beforeEach } from 'vitest';
import { UserProfile } from '@/domain/user/UserProfile';
import { MockCoffeeRepository } from '../mocks/MockCoffeeRepository';
import { MockRecipeRepository } from '../mocks/MockRecipeRepository';
import { MockUserProfileRepository } from '../mocks/MockUserProfileRepository';
import { EquipmentCatalogRepository } from '@/infrastructure/equipment/EquipmentCatalogRepository';
import { AddCoffeeUseCase } from '@/application/usecases/AddCoffeeUseCase';
import { GetCoffeeStashUseCase } from '@/application/usecases/GetCoffeeStashUseCase';
import { UpdateCoffeeUseCase } from '@/application/usecases/UpdateCoffeeUseCase';
import { CoffeeProps } from '@/domain/coffee/Coffee';

describe('Per-Profile Coffee Collections & Shared Inventory', () => {
  let coffeeRepo: MockCoffeeRepository;
  let recipeRepo: MockRecipeRepository;
  let userRepo: MockUserProfileRepository;
  let equipmentRepo: EquipmentCatalogRepository;
  let addCoffeeUseCase: AddCoffeeUseCase;
  let getStashUseCase: GetCoffeeStashUseCase;
  let updateCoffeeUseCase: UpdateCoffeeUseCase;

  beforeEach(() => {
    coffeeRepo = new MockCoffeeRepository();
    recipeRepo = new MockRecipeRepository();
    equipmentRepo = new EquipmentCatalogRepository();
    userRepo = new MockUserProfileRepository([
      new UserProfile({ id: 'carlos', name: 'Carlos', role: 'admin' }),
      new UserProfile({ id: 'sofia', name: 'Sofia', role: 'user' }),
    ]);

    addCoffeeUseCase = new AddCoffeeUseCase(
      coffeeRepo,
      recipeRepo,
      { scrapeCoffeeUrl: async () => ({} as CoffeeProps) },
      undefined,
      userRepo,
      equipmentRepo
    );
    getStashUseCase = new GetCoffeeStashUseCase(coffeeRepo, recipeRepo, userRepo, equipmentRepo);
    updateCoffeeUseCase = new UpdateCoffeeUseCase(coffeeRepo, recipeRepo, userRepo, equipmentRepo);
  });

  it('shares the inventory, but a newly added coffee appears active for creator and in bodega for other users', async () => {
    // 1. Carlos adds a coffee to his stash
    const addResult = await addCoffeeUseCase.execute({
      userId: 'carlos',
      manualData: {
        roaster: 'Nomad',
        name: 'Worka Sakaro',
        originCountry: 'Ethiopia',
        variety: 'Kurume',
        process: 'washed',
        roastLevel: 'light',
        tastingNotes: ['Peach', 'Jasmine'],
        status: 'active',
      },
    });

    const coffeeId = addResult.coffee.id;

    // 2. Carlos fetches his stash -> it is active ('en uso')
    const carlosStash = await getStashUseCase.execute('carlos');
    expect(carlosStash).toHaveLength(1);
    expect(carlosStash[0].coffee.id).toBe(coffeeId);
    expect(carlosStash[0].coffee.status).toBe('active');

    // 3. Sofia fetches her stash -> she sees the coffee in shared inventory, but in 'bodega'
    const sofiaStash = await getStashUseCase.execute('sofia');
    expect(sofiaStash).toHaveLength(1);
    expect(sofiaStash[0].coffee.id).toBe(coffeeId);
    expect(sofiaStash[0].coffee.status).toBe('bodega');
  });

  it('allows Sofia to move the coffee to en uso without altering Carlos status', async () => {
    // 1. Carlos adds a coffee
    const addResult = await addCoffeeUseCase.execute({
      userId: 'carlos',
      manualData: {
        roaster: 'San Jorge',
        name: 'Fazenda Dutra',
        originCountry: 'Brazil',
        variety: 'Catuai',
        process: 'natural',
        roastLevel: 'medium',
        tastingNotes: ['Chocolate', 'Caramel'],
        status: 'active',
      },
    });
    const coffeeId = addResult.coffee.id;

    // 2. Sofia moves the coffee from bodega to active ('en uso') in her profile
    await updateCoffeeUseCase.execute({
      id: coffeeId,
      userId: 'sofia',
      data: { status: 'active' },
    });

    // 3. Sofia now has it active
    const sofiaStash = await getStashUseCase.execute('sofia');
    expect(sofiaStash[0].coffee.status).toBe('active');

    // 4. Carlos still has it active as well
    const carlosStash = await getStashUseCase.execute('carlos');
    expect(carlosStash[0].coffee.status).toBe('active');

    // 5. Carlos moves his copy to bodega
    await updateCoffeeUseCase.execute({
      id: coffeeId,
      userId: 'carlos',
      data: { status: 'bodega' },
    });

    // 6. Carlos now has it in bodega, but Sofia STILL has it active ('en uso')
    const carlosStashAfter = await getStashUseCase.execute('carlos');
    const sofiaStashAfter = await getStashUseCase.execute('sofia');
    expect(carlosStashAfter[0].coffee.status).toBe('bodega');
    expect(sofiaStashAfter[0].coffee.status).toBe('active');
  });

  it('does not put a coffee in use for Carlos when Sofia adds or activates a coffee', async () => {
    // 1. Sofia adds a coffee
    const addResult = await addCoffeeUseCase.execute({
      userId: 'sofia',
      manualData: {
        roaster: 'Right Side',
        name: 'El Paraiso 92',
        originCountry: 'Colombia',
        variety: 'Castillo',
        process: 'anaerobic',
        roastLevel: 'medium_light',
        tastingNotes: ['Passionfruit'],
        status: 'active',
      },
    });
    const coffeeId = addResult.coffee.id;

    // 2. Sofia sees it active, Carlos sees it in bodega (Catalog)
    const sofiaStash = await getStashUseCase.execute('sofia');
    const carlosStash = await getStashUseCase.execute('carlos');
    expect(sofiaStash[0].coffee.status).toBe('active');
    expect(carlosStash[0].coffee.status).toBe('bodega');

    // 3. Sofia moves it to bodega, then back to active -> Carlos must STILL have it in bodega
    await updateCoffeeUseCase.execute({ id: coffeeId, userId: 'sofia', data: { status: 'bodega' } });
    await updateCoffeeUseCase.execute({ id: coffeeId, userId: 'sofia', data: { status: 'active' } });

    const carlosAfter = await getStashUseCase.execute('carlos');
    const sofiaAfter = await getStashUseCase.execute('sofia');
    expect(sofiaAfter[0].coffee.status).toBe('active');
    expect(carlosAfter[0].coffee.status).toBe('bodega');
  });
});
