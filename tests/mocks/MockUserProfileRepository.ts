import { UserProfile } from '@/domain/user/UserProfile';
import { UserProfileRepositoryPort } from '@/application/ports/out/UserProfileRepositoryPort';

export class MockUserProfileRepository implements UserProfileRepositoryPort {
  private profiles: Map<string, UserProfile> = new Map();

  constructor(initialProfiles: UserProfile[] = []) {
    for (const p of initialProfiles) {
      this.profiles.set(p.id, p);
    }
  }

  async findAll(): Promise<UserProfile[]> {
    return Array.from(this.profiles.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async findById(id: string): Promise<UserProfile | null> {
    return this.profiles.get(id.toLowerCase().trim()) || null;
  }

  async save(profile: UserProfile): Promise<void> {
    this.profiles.set(profile.id.toLowerCase().trim(), profile);
  }

  async delete(id: string): Promise<boolean> {
    return this.profiles.delete(id.toLowerCase().trim());
  }
}
export { MockUserProfileRepository as InMemoryUserProfileRepository };
