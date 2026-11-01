import { describe, it, expect } from 'vitest';
import { UserProfile } from '@/core/domain/user/UserProfile';

describe('UserProfile Domain Entity', () => {
  it('creates a valid user profile with defaults', () => {
    const profile = new UserProfile({
      id: 'carlos',
      name: 'Carlos',
    });

    expect(profile.id).toBe('carlos');
    expect(profile.name).toBe('Carlos');
    expect(profile.role).toBe('user');
    expect(profile.language).toBe('es');
    expect(profile.activeCoffeeId).toBeNull();
    expect(profile.avatar).toBe('CA');
    expect(profile.createdAt).toBeInstanceOf(Date);
  });

  it('throws error if id or name is missing or empty', () => {
    expect(() => new UserProfile({ id: '', name: 'Carlos' })).toThrow('User ID is required');
    expect(() => new UserProfile({ id: 'carlos', name: '   ' })).toThrow('User name is required');
  });

  it('updates role immutably', () => {
    const original = new UserProfile({ id: 'carlos', name: 'Carlos', role: 'user' });
    const updated = original.withRole('admin');

    expect(updated.role).toBe('admin');
    expect(original.role).toBe('user');
  });

  it('updates language and activeCoffee immutably', () => {
    const original = new UserProfile({ id: 'carlos', name: 'Carlos' });
    const withLang = original.withLanguage('en');
    const withCoffee = withLang.withActiveCoffee('coffee-nomad-worka');

    expect(withLang.language).toBe('en');
    expect(original.language).toBe('es');
    expect(withCoffee.activeCoffeeId).toBe('coffee-nomad-worka');
  });

  it('supports general update patch', () => {
    const original = new UserProfile({ id: 'carlos', name: 'Carlos', role: 'user' });
    const updated = original.update({
      name: 'Carlos Barista',
      role: 'admin',
      language: 'en',
    });

    expect(updated.id).toBe('carlos');
    expect(updated.name).toBe('Carlos Barista');
    expect(updated.role).toBe('admin');
    expect(updated.language).toBe('en');
  });
});
