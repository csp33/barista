import { NextResponse } from 'next/server';
import { container } from '@/adapters/ServiceContainer';
import { Logger } from '@/adapters/out/logger/Logger';

export async function GET() {
  Logger.info('API', 'GET /api/coffees - Fetching coffee stash');
  try {
    const stash = await container.getCoffeeStashUseCase.execute();
    Logger.info('API', `GET /api/coffees - Loaded ${stash.length} stash items`);
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
    Logger.info('API', 'POST /api/coffees - Adding coffee', { url: body.url });

    const result = await container.addCoffeeUseCase.execute({
      url: body.url,
      manualData: body.manualData,
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
    const msg = error instanceof Error ? error.message : 'Failed to add coffee';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
