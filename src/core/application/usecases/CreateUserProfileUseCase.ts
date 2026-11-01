import { UserProfile, UserRole } from '@/core/domain/user/UserProfile';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';

export interface CreateUserProfileDTO {
  id?: string;
  name: string;
  role?: UserRole;
  language?: 'es' | 'en';
  activeCoffeeId?: string | null;
  grinderId?: string;
  machineId?: string;
}

export class CreateUserProfileUseCase {
  constructor(private readonly userProfileRepo: UserProfileRepositoryPort) {}

  async execute(dto: CreateUserProfileDTO): Promise<UserProfile> {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error('Profile name is required');
    }

    const candidateId = (dto.id || dto.name)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '-');

    const existing = await this.userProfileRepo.findById(candidateId);
    if (existing) {
      throw new Error(`Profile '${candidateId}' already exists`);
    }

    const profile = new UserProfile({
      id: candidateId,
      name: dto.name.trim(),
      role: dto.role ?? 'user',
      language: dto.language ?? 'es',
      activeCoffeeId: dto.activeCoffeeId ?? null,
      grinderId: dto.grinderId ?? 'df64-gen-2',
      machineId: dto.machineId ?? 'sage-barista-touch-impress',
    });

    await this.userProfileRepo.save(profile);
    return profile;
  }
}
