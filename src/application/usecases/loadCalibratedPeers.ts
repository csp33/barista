import { CalibratedPeer } from '@/domain/recipe/GrindCalibrationLearner';
import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';

export async function loadCalibratedPeers(
  coffeeRepo: CoffeeRepositoryPort,
  recipeRepo: RecipeRepositoryPort,
  userId: string
): Promise<CalibratedPeer[]> {
  const cleanUserId = userId.trim().toLowerCase();
  const coffees =
    (coffeeRepo.findAllForUser
      ? await coffeeRepo.findAllForUser(cleanUserId)
      : await coffeeRepo.findAll()) || [];

  const peers: CalibratedPeer[] = [];
  for (const coffee of coffees) {
    const recipe = await recipeRepo.findByCoffeeId(coffee.id, cleanUserId);
    if (!recipe) continue;
    const history = (await recipeRepo.getFeedbackHistory(recipe.id, cleanUserId)) || [];
    peers.push({
      coffee,
      recipe,
      hasFeedback: history.length > 0,
    });
  }
  return peers;
}
