import { NextResponse } from 'next/server';
import { container } from '@/adapters/ServiceContainer';
import { Logger } from '@/adapters/out/logger/Logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    Logger.info('API', `POST /api/coffees/scrape - Extracting from ${url}`);

    const result = await container.extractCoffeeUseCase.execute({ url });
    if (result.isExisting) {
      return NextResponse.json(
        {
          success: false,
          error: `El café "${result.coffee.name}" (${result.coffee.roaster}) ya existe en tu colección`,
          isExisting: true,
          data: result.coffee,
        },
        { status: 409 }
      );
    }

    Logger.info('API', `Extracted coffee successfully: ${result.coffee.name}`, {
      roaster: result.coffee.roaster,
      origin: result.coffee.originCountry,
      process: result.coffee.process,
      variety: result.coffee.variety,
      hasStory: Boolean(result.coffee.sommelierStory),
      hasAiRationale: Boolean(result.coffee.aiRationale),
    });

    return NextResponse.json({
      success: true,
      data: result.coffee,
      recipe: result.recipe,
      isExisting: result.isExisting,
    });
  } catch (err) {
    Logger.error('API', 'POST /api/coffees/scrape error', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Scraping failed' },
      { status: 400 }
    );
  }
}
