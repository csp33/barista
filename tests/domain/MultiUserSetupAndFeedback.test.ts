import { describe, it, expect, beforeEach } from 'vitest';
import { Coffee } from '@/domain/coffee/Coffee';
import { UserProfile } from '@/domain/user/UserProfile';
import { MockCoffeeRepository as InMemoryCoffeeRepository } from '../mocks/MockCoffeeRepository';
import { MockRecipeRepository as InMemoryRecipeRepository } from '../mocks/MockRecipeRepository';
import { MockUserProfileRepository as InMemoryUserProfileRepository } from '../mocks/MockUserProfileRepository';
import { EquipmentCatalogRepository } from '@/infrastructure/equipment/EquipmentCatalogRepository';
import { GetCoffeeStashUseCase } from '@/application/usecases/GetCoffeeStashUseCase';
import { LogFeedbackUseCase } from '@/application/usecases/LogFeedbackUseCase';

describe('Multiuser Equipment, Recipe & Feedback Isolation', () => {
  let coffeeRepo: InMemoryCoffeeRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let userRepo: InMemoryUserProfileRepository;
  let equipmentRepo: EquipmentCatalogRepository;
  let getStashUseCase: GetCoffeeStashUseCase;
  let logFeedbackUseCase: LogFeedbackUseCase;

  const coffee = new Coffee({
    id: 'coffee-worka',
    roaster: 'Nomad',
    name: 'Worka Sakaro',
    originCountry: 'Ethiopia',
    altitudeMasl: 2050,
    variety: 'Kurume',
    process: 'washed',
    roastLevel: 'light',
    tastingNotes: ['Peach', 'Jasmine'],
    recommendedRestDays: 18,
  });

  beforeEach(async () => {
    coffeeRepo = new InMemoryCoffeeRepository([coffee]);
    recipeRepo = new InMemoryRecipeRepository();
    equipmentRepo = new EquipmentCatalogRepository();
    userRepo = new InMemoryUserProfileRepository([
      new UserProfile({
        id: 'carlos',
        name: 'Carlos',
        grinderId: 'df64-gen-2',
        machineId: 'sage-barista-touch-impress',
      }),
      new UserProfile({
        id: 'maria',
        name: 'Maria',
        grinderId: 'comandante-c40',
        machineId: 'gaggia-classic-pro',
      }),
    ]);

    getStashUseCase = new GetCoffeeStashUseCase(coffeeRepo, recipeRepo, userRepo, equipmentRepo);
    logFeedbackUseCase = new LogFeedbackUseCase(recipeRepo, coffeeRepo, undefined, equipmentRepo);
  });

  it('generates independent equipment-specific recipes for different users on the same coffee', async () => {
    const carlosStash = await getStashUseCase.execute('carlos');
    const mariaStash = await getStashUseCase.execute('maria');

    expect(carlosStash).toHaveLength(1);
    expect(mariaStash).toHaveLength(1);

    const carlosRecipe = carlosStash[0].recipe!;
    const mariaRecipe = mariaStash[0].recipe!;

    // Carlos setup: DF64 Gen 2 (64mm flat) + Sage (54mm basket) -> 18.5g dose
    expect(carlosRecipe.grinderId).toBe('df64-gen-2');
    expect(carlosRecipe.machineId).toBe('sage-barista-touch-impress');
    expect(carlosRecipe.doseGrams).toBe(18.5);

    // Maria setup: Comandante C40 (39mm conical) + Gaggia Classic (58mm basket) -> 19.5g dose
    expect(mariaRecipe.grinderId).toBe('comandante-c40');
    expect(mariaRecipe.machineId).toBe('gaggia-classic-pro');
    expect(mariaRecipe.doseGrams).toBe(19.5);
  });

  it('keeps extraction feedback and adaptive recipe recalibration strictly isolated per user', async () => {
    // 1. Carlos and Maria load their stash
    const carlosInitial = await getStashUseCase.execute('carlos');
    const mariaInitial = await getStashUseCase.execute('maria');

    const carlosRecipeId = carlosInitial[0].recipe!.id;
    const mariaRecipeId = mariaInitial[0].recipe!.id;

    // 2. Carlos pulls a shot and logs "sour" feedback
    await logFeedbackUseCase.execute({
      recipeId: carlosRecipeId,
      coffeeId: coffee.id,
      userId: 'carlos',
      actualGrindSetting: carlosInitial[0].recipe!.grindSetting,
      actualDoseGrams: carlosInitial[0].recipe!.doseGrams,
      actualYieldGrams: carlosInitial[0].recipe!.yieldGrams,
      actualTimeSeconds: 22,
      tasteProfile: 'sour',
      userNotes: 'Slightly bright, needs finer grind',
    });

    // 3. Verify Carlos's recipe adapted, but Maria's recipe is completely untouched
    const carlosAfter = await getStashUseCase.execute('carlos');
    const mariaAfter = await getStashUseCase.execute('maria');

    // Carlos has 1 feedback history entry and an adjusted yield/grind
    expect(carlosAfter[0].feedbackHistory).toHaveLength(1);
    expect(carlosAfter[0].recipe?.yieldGrams).toBe(carlosInitial[0].recipe!.yieldGrams + 2);

    // Maria has 0 feedback history entries and her recipe is unchanged
    expect(mariaAfter[0].feedbackHistory).toHaveLength(0);
    expect(mariaAfter[0].recipe?.yieldGrams).toBe(mariaInitial[0].recipe!.yieldGrams);

    // 4. Maria logs feedback "bitter"
    await logFeedbackUseCase.execute({
      recipeId: mariaRecipeId,
      coffeeId: coffee.id,
      userId: 'maria',
      actualGrindSetting: mariaInitial[0].recipe!.grindSetting,
      actualDoseGrams: mariaInitial[0].recipe!.doseGrams,
      actualYieldGrams: mariaInitial[0].recipe!.yieldGrams,
      actualTimeSeconds: 38,
      tasteProfile: 'bitter',
      userNotes: 'Too astringent',
    });

    // 5. Verify Maria has her own feedback, Carlos still has only his 1 feedback
    const carlosFinal = await getStashUseCase.execute('carlos');
    const mariaFinal = await getStashUseCase.execute('maria');

    expect(carlosFinal[0].feedbackHistory).toHaveLength(1);
    expect(mariaFinal[0].feedbackHistory).toHaveLength(1);
    expect(mariaFinal[0].feedbackHistory[0].tasteProfile).toBe('bitter');
    expect(carlosFinal[0].feedbackHistory[0].tasteProfile).toBe('sour');
  });

  it('allows user to change equipment and adapts subsequent initial recipes', async () => {
    // Maria initially has Comandante + Gaggia
    const initialStash = await getStashUseCase.execute('maria');
    expect(initialStash[0].recipe?.grinderId).toBe('comandante-c40');
    expect(initialStash[0].recipe?.machineId).toBe('gaggia-classic-pro');

    const maria = await userRepo.findById('maria');
    expect(maria).not.toBeNull();

    // Maria changes to Kingrinder K6 + Casabrews CM5418
    const updatedMaria = maria!.withEquipment('kingrinder-k6', 'casabrews-cm5418');
    await userRepo.save(updatedMaria);

    const saved = await userRepo.findById('maria');
    expect(saved?.grinderId).toBe('kingrinder-k6');
    expect(saved?.machineId).toBe('casabrews-cm5418');

    // Fetching stash recalibrates recipe to Kingrinder K6 & Casabrews CM5418
    const updatedStash = await getStashUseCase.execute('maria');
    expect(updatedStash[0].recipe?.grinderId).toBe('kingrinder-k6');
    expect(updatedStash[0].recipe?.machineId).toBe('casabrews-cm5418');
    expect(updatedStash[0].recipe?.doseGrams).toBe(15.0); // Casabrews 51mm light roast dose
  });
});
