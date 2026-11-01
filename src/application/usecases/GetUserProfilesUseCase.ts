import { UserProfile } from '@/domain/user/UserProfile';
import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';

export class GetUserProfilesUseCase {
  constructor(private readonly userProfileRepo: UserProfileRepositoryPort) {}

  async execute(): Promise<UserProfile[]> {
    return this.userProfileRepo.findAll();
  }
}
