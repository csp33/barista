import { Coffee, CoffeeStatus } from '@/domain/coffee/Coffee';
import { CoffeeRepositoryPort } from '@/application/ports/out/CoffeeRepositoryPort';

export class MockCoffeeRepository implements CoffeeRepositoryPort {
  private coffees: Map<string, Coffee> = new Map();
  private userStatuses: Map<string, CoffeeStatus> = new Map();

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

  async findAllForUser(userId: string): Promise<Coffee[]> {
    const cleanUserId = userId.trim().toLowerCase();
    const all = await this.findAll();
    return all.map(c => {
      const key = `${cleanUserId}:${c.id}`;
      const status = this.userStatuses.get(key) || (cleanUserId === 'carlos' ? c.status : 'bodega');
      return c.withStatus(status);
    });
  }

  async setUserStatus(coffeeId: string, userId: string, status: CoffeeStatus): Promise<void> {
    const cleanUserId = userId.trim().toLowerCase();
    this.userStatuses.set(`${cleanUserId}:${coffeeId}`, status);
  }

  async getUserStatus(coffeeId: string, userId: string): Promise<CoffeeStatus | null> {
    const cleanUserId = userId.trim().toLowerCase();
    return this.userStatuses.get(`${cleanUserId}:${coffeeId}`) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    for (const key of Array.from(this.userStatuses.keys())) {
      if (key.endsWith(`:${id}`)) this.userStatuses.delete(key);
    }
    return this.coffees.delete(id);
  }
}
export { MockCoffeeRepository as InMemoryCoffeeRepository };
