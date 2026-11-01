import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/ServiceContainer';
import { Logger } from '@/infrastructure/out/logger/Logger';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await container.getUserProfileUseCase.execute(id);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    Logger.error('API', 'GET /api/profiles/[id] error', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await container.updateUserProfileUseCase.execute({
      id,
      name: body.name,
      role: body.role,
      language: body.language,
      activeCoffeeId: body.activeCoffeeId,
      grinderId: body.grinderId,
      machineId: body.machineId,
    });
    Logger.info('API', `Profile updated: ${updated.name} (${updated.id})`);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    Logger.error('API', 'PUT /api/profiles/[id] error', error);
    const msg = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actingRole = request.headers.get('x-user-role') || 'user';
    const actingUserId = request.headers.get('x-user-id') || '';

    const result = await container.deleteUserProfileUseCase.execute({
      targetUserId: id,
      actingUserRole: actingRole,
      actingUserId,
    });
    Logger.info('API', `Profile deleted: ${id}`);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    Logger.error('API', 'DELETE /api/profiles/[id] error', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete profile';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
