import { describe, it, expect } from 'vitest';
import { Coffee } from '@/core/domain/coffee/Coffee';
import { DuplicateCoffeeError } from '@/core/domain/coffee/DuplicateCoffeeError';
import { InMemoryCoffeeRepository } from '@/adapters/out/persistence/memory/InMemoryCoffeeRepository';

describe('Coffee Duplicate Normalization & Repository Matching', () => {
  it('correctly matches coffees despite differences in "Café" prefix, accents and casing', () => {
    const existing = new Coffee({
      id: 'c-1',
      roaster: 'Cafés el Criollo',
      name: 'India Malabar Monsooned',
      originCountry: 'India',
      variety: 'Kent',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cereal', 'spices'],
      sourceUrl: 'https://cafeselcriollo.com/producto/cafe-india/',
    });

    // Same roaster with different casing & accent, same name with "Café " prefix
    expect(existing.matches('Cafes El Criollo', 'Café India Malabar Monsooned')).toBe(true);
    expect(existing.matches('el criollo', 'india malabar monsooned')).toBe(true);
    expect(existing.matches('Cafés el Criollo', 'India Malabar Monsooned')).toBe(true);

    // Roaster variation with "Coffee" suffix
    const nomad = new Coffee({
      id: 'c-2',
      roaster: 'Nomad Coffee',
      name: 'Worka Sakaro',
      originCountry: 'Ethiopia',
      variety: 'Kurume',
      process: 'washed',
      roastLevel: 'light',
      tastingNotes: ['floral', 'peach'],
    });

    expect(nomad.matches('Nomad', 'Worka Sakaro')).toBe(true);
    expect(nomad.matches('Nomad Coffee Roasters', 'Café Worka Sakaro')).toBe(true);
    expect(nomad.matches('San Jorge', 'Worka Sakaro')).toBe(false);
  });

  it('normalizes URLs ignoring protocol, www, and trailing slash', () => {
    expect(Coffee.normalizeUrl('https://cafeselcriollo.com/producto/cafe-india/')).toBe(
      'cafeselcriollo.com/producto/cafe-india'
    );
    expect(Coffee.normalizeUrl('http://www.cafeselcriollo.com/producto/cafe-india')).toBe(
      'cafeselcriollo.com/producto/cafe-india'
    );
  });

  it('finds existing coffee in InMemoryCoffeeRepository by normalized url and roaster/name', async () => {
    const coffee = new Coffee({
      id: 'c-1',
      roaster: 'Cafés el Criollo',
      name: 'India Malabar Monsooned',
      originCountry: 'India',
      variety: 'Kent',
      process: 'washed',
      roastLevel: 'medium',
      tastingNotes: ['cereal'],
      sourceUrl: 'https://cafeselcriollo.com/producto/cafe-india/',
    });

    const repo = new InMemoryCoffeeRepository([coffee]);

    const byUrl = await repo.findByUrl('http://www.cafeselcriollo.com/producto/cafe-india');
    expect(byUrl).not.toBeNull();
    expect(byUrl?.id).toBe('c-1');

    const byName = await repo.findByRoasterAndName('El Criollo', 'Café India Malabar Monsooned');
    expect(byName).not.toBeNull();
    expect(byName?.id).toBe('c-1');
  });

  it('creates DuplicateCoffeeError with roaster and coffeeName properties', () => {
    const error = new DuplicateCoffeeError('Cafés el Criollo', 'India Malabar Monsooned');
    expect(error.roaster).toBe('Cafés el Criollo');
    expect(error.coffeeName).toBe('India Malabar Monsooned');
    expect(error.message).toContain('already exists');
  });
});
