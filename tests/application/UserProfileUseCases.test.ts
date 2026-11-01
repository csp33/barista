import { describe, it, expect, beforeEach } from 'vitest';
import { UserProfile } from '@/domain/user/UserProfile';
import { MockUserProfileRepository as InMemoryUserProfileRepository } from '../mocks/MockUserProfileRepository';
import { GetUserProfilesUseCase } from '@/application/usecases/GetUserProfilesUseCase';
import { GetUserProfileUseCase } from '@/application/usecases/GetUserProfileUseCase';
import { CreateUserProfileUseCase } from '@/application/usecases/CreateUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@/application/usecases/UpdateUserProfileUseCase';

describe('UserProfile Application Use Cases', () => {
  let repo: InMemoryUserProfileRepository;
  let getProfilesUseCase: GetUserProfilesUseCase;
  let getProfileUseCase: GetUserProfileUseCase;
  let createProfileUseCase: CreateUserProfileUseCase;
  let updateProfileUseCase: UpdateUserProfileUseCase;

  beforeEach(() => {
    repo = new InMemoryUserProfileRepository([
      new UserProfile({
        id: 'carlos',
        name: 'Carlos',
        role: 'admin',
        language: 'es',
        activeCoffeeId: 'coffee-nomad-worka',
      }),
    ]);
    getProfilesUseCase = new GetUserProfilesUseCase(repo);
    getProfileUseCase = new GetUserProfileUseCase(repo);
    createProfileUseCase = new CreateUserProfileUseCase(repo);
    updateProfileUseCase = new UpdateUserProfileUseCase(repo);
  });

  it('retrieves all user profiles including pre-seeded Carlos', async () => {
    const profiles = await getProfilesUseCase.execute();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].id).toBe('carlos');
    expect(profiles[0].name).toBe('Carlos');
    expect(profiles[0].role).toBe('admin');
  });

  it('retrieves user profile by id case-insensitively', async () => {
    const profile = await getProfileUseCase.execute('CARLOS');
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe('Carlos');
  });

  it('creates a new user profile with normalized id', async () => {
    const created = await createProfileUseCase.execute({
      name: 'Maria Barista',
      role: 'user',
      language: 'en',
    });

    expect(created.id).toBe('maria-barista');
    expect(created.name).toBe('Maria Barista');
    expect(created.language).toBe('en');

    const all = await getProfilesUseCase.execute();
    expect(all).toHaveLength(2);
  });

  it('prevents duplicate profile ids', async () => {
    await expect(
      createProfileUseCase.execute({ name: 'carlos' })
    ).rejects.toThrow("Profile 'carlos' already exists");
  });

  it('updates an existing user profile active coffee and role', async () => {
    const updated = await updateProfileUseCase.execute({
      id: 'carlos',
      activeCoffeeId: 'coffee-sanjorge-dutra',
      role: 'admin',
      language: 'en',
    });

    expect(updated.activeCoffeeId).toBe('coffee-sanjorge-dutra');
    expect(updated.language).toBe('en');

    const retrieved = await getProfileUseCase.execute('carlos');
    expect(retrieved?.activeCoffeeId).toBe('coffee-sanjorge-dutra');
  });

  it('updates profile equipment and custom basket dose', async () => {
    const updated = await updateProfileUseCase.execute({
      id: 'carlos',
      grinderId: 'kingrinder-k6',
      machineId: 'gaggia-classic-pro',
      basketDoseGrams: 20.0,
    });

    expect(updated.grinderId).toBe('kingrinder-k6');
    expect(updated.machineId).toBe('gaggia-classic-pro');
    expect(updated.basketDoseGrams).toBe(20.0);
  });

  it('throws when updating non-existent profile', async () => {
    await expect(
      updateProfileUseCase.execute({ id: 'non-existent', name: 'Ghost' })
    ).rejects.toThrow("User profile with id 'non-existent' not found");
  });
});
