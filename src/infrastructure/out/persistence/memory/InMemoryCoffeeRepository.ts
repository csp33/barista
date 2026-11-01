import { Coffee } from '@/core/domain/coffee/Coffee';
import { CoffeeRepositoryPort } from '@/core/application/ports/out/CoffeeRepositoryPort';

export class InMemoryCoffeeRepository implements CoffeeRepositoryPort {
  private coffees: Map<string, Coffee> = new Map();

  constructor(initialCoffees: Coffee[] = []) {
    for (const coffee of initialCoffees) {
      this.coffees.set(coffee.id, coffee);
    }
  }

  async findById(id: string): Promise<Coffee | null> {
    return this.coffees.get(id) || null;
  }

  async findByUrl(url: string): Promise<Coffee | null> {
    const norm = Coffee.normalizeUrl(url);
    for (const coffee of this.coffees.values()) {
      if (coffee.sourceUrl && Coffee.normalizeUrl(coffee.sourceUrl) === norm) {
        return coffee;
      }
    }
    return null;
  }

  async findByRoasterAndName(roaster: string, name: string): Promise<Coffee | null> {
    for (const coffee of this.coffees.values()) {
      if (coffee.matches(roaster, name)) {
        return coffee;
      }
    }
    return null;
  }

  async save(coffee: Coffee): Promise<void> {
    this.coffees.set(coffee.id, coffee);
  }

  async findAll(): Promise<Coffee[]> {
    return Array.from(this.coffees.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.coffees.delete(id);
  }
}
