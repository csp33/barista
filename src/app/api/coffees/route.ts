import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/ServiceContainer';
import { Logger } from '@/infrastructure/out/logger/Logger';
import { DuplicateCoffeeError } from '@/domain/coffee/DuplicateCoffeeError';

export async function GET(request: Request) {
  const url = new URL(request.url);
  let userId = url.searchParams.get('userId') || request.headers.get('x-user-id');
  if (!userId) {
    const profiles = await container.getUserProfilesUseCase.execute();
    userId = profiles[0]?.id;
  }

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'User profile is required to fetch stash' },
      { status: 400 }
    );
  }

  Logger.info('API', `GET /api/coffees - Fetching coffee stash for user: ${userId}`);
  try {
    const stash = await container.getCoffeeStashUseCase.execute(userId);
    Logger.info('API', `GET /api/coffees - Loaded ${stash.length} stash items for ${userId}`);
    return NextResponse.json({ success: true, data: stash });
  } catch (error) {
    Logger.error('API', 'GET /api/coffees error', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const userId = body.userId || url.searchParams.get('userId') || request.headers.get('x-user-id');
    Logger.info('API', 'POST /api/coffees - Adding coffee', { url: body.url, userId });

    const result = await container.addCoffeeUseCase.execute({
      url: body.url,
      manualData: body.manualData,
      userId: userId || undefined,
    });

    Logger.info('API', `Coffee processed: ${result.coffee.name}`, {
      fromCache: result.fromCache,
      roaster: result.coffee.roaster,
      grindSetting: result.recipe.grindSetting,
      machineTemp: result.recipe.machineTemperature,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    Logger.error('API', 'POST /api/coffees error', error);
    const isDuplicate = error instanceof DuplicateCoffeeError;
    const msg = error instanceof Error ? error.message : 'Failed to add coffee';
    return NextResponse.json(
      { success: false, error: msg, code: isDuplicate ? 'DUPLICATE_COFFEE' : undefined },
      { status: isDuplicate ? 409 : 400 }
    );
  }
}
