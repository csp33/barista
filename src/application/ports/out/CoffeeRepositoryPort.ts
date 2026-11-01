import { Coffee, CoffeeStatus } from '@/domain/coffee/Coffee';

export interface CoffeeRepositoryPort {
  findById(id: string): Promise<Coffee | null>;
  findByUrl(url: string): Promise<Coffee | null>;
  findByRoasterAndName(roaster: string, name: string): Promise<Coffee | null>;
  save(coffee: Coffee): Promise<void>;
  findAll(): Promise<Coffee[]>;
  delete(id: string): Promise<boolean>;
  findAllForUser?(userId: string): Promise<Coffee[]>;
  setUserStatus?(coffeeId: string, userId: string, status: CoffeeStatus): Promise<void>;
  getUserStatus?(coffeeId: string, userId: string): Promise<CoffeeStatus | null>;
}
