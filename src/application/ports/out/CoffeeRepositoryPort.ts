import { Coffee } from '@/domain/coffee/Coffee';

export interface CoffeeRepositoryPort {
  findById(id: string): Promise<Coffee | null>;
  findByUrl(url: string): Promise<Coffee | null>;
  findByRoasterAndName(roaster: string, name: string): Promise<Coffee | null>;
  save(coffee: Coffee): Promise<void>;
  findAll(): Promise<Coffee[]>;
  delete(id: string): Promise<boolean>;
}
