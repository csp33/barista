import { UserProfile, UserRole } from '@/domain/user/UserProfile';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';

export interface UpdateUserProfileDTO {
  id: string;
  name?: string;
  role?: UserRole;
  language?: 'es' | 'en';
  activeCoffeeId?: string | null;
  grinderId?: string;
  machineId?: string;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userProfileRepo: UserProfileRepositoryPort) {}

  async execute(dto: UpdateUserProfileDTO): Promise<UserProfile> {
    const cleanId = dto.id.trim().toLowerCase();
    const existing = await this.userProfileRepo.findById(cleanId);
    if (!existing) {
      throw new Error(`User profile with id '${dto.id}' not found`);
    }

    const updated = existing.update({
      name: dto.name,
      role: dto.role,
      language: dto.language,
      activeCoffeeId:
        dto.activeCoffeeId !== undefined ? dto.activeCoffeeId : existing.activeCoffeeId,
      grinderId: dto.grinderId !== undefined ? dto.grinderId : existing.grinderId,
      machineId: dto.machineId !== undefined ? dto.machineId : existing.machineId,
    });

    await this.userProfileRepo.save(updated);
    return updated;
  }
}
