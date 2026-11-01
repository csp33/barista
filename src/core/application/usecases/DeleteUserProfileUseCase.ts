import { UserProfileRepositoryPort } from '../ports/out/UserProfileRepositoryPort';

export interface DeleteUserProfileRequest {
  targetUserId: string;
  actingUserRole: string;
  actingUserId: string;
}

export class DeleteUserProfileUseCase {
  constructor(private readonly userProfileRepo: UserProfileRepositoryPort) {}

  async execute(request: DeleteUserProfileRequest): Promise<{ success: boolean; deletedId: string }> {
    if (request.actingUserRole !== 'admin') {
      throw new Error('Unauthorized: Only an administrator can delete user profiles');
    }

    const cleanTargetId = request.targetUserId.trim().toLowerCase();
    const cleanActingId = request.actingUserId.trim().toLowerCase();

    if (cleanTargetId === cleanActingId) {
      throw new Error('Cannot delete your own active profile');
    }

    const existing = await this.userProfileRepo.findById(cleanTargetId);
    if (!existing) {
      throw new Error(`User profile with ID '${cleanTargetId}' not found`);
    }

    if (existing.role === 'admin') {
      throw new Error('Cannot delete an administrator profile');
    }

    const deleted = await this.userProfileRepo.delete(cleanTargetId);
    return { success: deleted, deletedId: cleanTargetId };
  }
}
