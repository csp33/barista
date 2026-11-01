import { UserProfile } from '@/core/domain/user/UserProfile';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';

export class GetUserProfileUseCase {
  constructor(private readonly userProfileRepo: UserProfileRepositoryPort) {}

  async execute(id: string): Promise<UserProfile | null> {
    if (!id || id.trim().length === 0) {
      return null;
    }
    return this.userProfileRepo.findById(id.trim().toLowerCase());
  }
}
