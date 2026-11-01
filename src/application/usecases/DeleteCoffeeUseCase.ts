import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';

export interface DeleteCoffeeRequest {
  coffeeId: string;
  userRole: 'admin' | 'user';
  userId?: string;
}

export class DeleteCoffeeUseCase {
  constructor(
    private readonly coffeeRepo: CoffeeRepositoryPort,
    private readonly recipeRepo: RecipeRepositoryPort
  ) {}

  async execute(request: DeleteCoffeeRequest): Promise<{ success: boolean; deletedId: string }> {
    if (request.userRole !== 'admin') {
      throw new Error('Unauthorized: Only administrators can delete coffees from history');
    }

    const coffee = await this.coffeeRepo.findById(request.coffeeId);
    if (!coffee) {
      throw new Error(`Coffee not found with ID ${request.coffeeId}`);
    }

    const userStatus =
      request.userId && this.coffeeRepo.getUserStatus
        ? await this.coffeeRepo.getUserStatus(request.coffeeId, request.userId)
        : null;
    const effectiveStatus = userStatus ?? coffee.status;

    if (effectiveStatus !== 'history' && effectiveStatus !== 'bodega') {
      throw new Error('Only archived coffees in history or bodega can be permanently deleted');
    }

    await this.coffeeRepo.delete(request.coffeeId);
    await this.recipeRepo.deleteByCoffeeId(request.coffeeId);

    return { success: true, deletedId: request.coffeeId };
  }
}
