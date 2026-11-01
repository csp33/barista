import { CoffeeRepositoryPort } from '../ports/out/CoffeeRepositoryPort';
import { RecipeRepositoryPort } from '../ports/out/RecipeRepositoryPort';

export interface DeleteCoffeeRequest {
  coffeeId: string;
  userRole: 'admin' | 'user';
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

    if (coffee.status !== 'history') {
      throw new Error('Only archived coffees in history can be permanently deleted');
    }

    await this.coffeeRepo.delete(request.coffeeId);
    await this.recipeRepo.deleteByCoffeeId(request.coffeeId);

    return { success: true, deletedId: request.coffeeId };
  }
}
