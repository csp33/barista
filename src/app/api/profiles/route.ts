import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/ServiceContainer';
import { Logger } from '@/infrastructure/out/logger/Logger';

export async function GET() {
  try {
    const profiles = await container.getUserProfilesUseCase.execute();
    return NextResponse.json({ success: true, data: profiles });
  } catch (error) {
    Logger.error('API', 'GET /api/profiles error', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile = await container.createUserProfileUseCase.execute({
      id: body.id,
      name: body.name,
      role: body.role,
      language: body.language,
      activeCoffeeId: body.activeCoffeeId,
      grinderId: body.grinderId,
      machineId: body.machineId,
    });
    Logger.info('API', `Profile created: ${profile.name} (${profile.id})`);
    return NextResponse.json({ success: true, data: profile }, { status: 201 });
  } catch (error) {
    Logger.error('API', 'POST /api/profiles error', error);
    const msg = error instanceof Error ? error.message : 'Failed to create profile';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
