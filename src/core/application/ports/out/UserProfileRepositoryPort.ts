import { UserProfile } from '@/core/domain/user/UserProfile';

export interface UserProfileRepositoryPort {
  findAll(): Promise<UserProfile[]>;
  findById(id: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  delete(id: string): Promise<boolean>;
}
