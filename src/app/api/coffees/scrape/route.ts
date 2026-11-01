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

    // Check if coffee already exists in repo
    const existing = await container.coffeeRepo.findByUrl(url);
    if (existing) {
      Logger.info('API', `Found existing coffee for URL: ${existing.name}`);
      return NextResponse.json({ success: true, data: existing, isExisting: true });
    }

    // Scrape roaster
    const scraped = await container.scraper.scrapeCoffeeUrl(url);
    Logger.info('API', `Scraped roaster data successfully: ${scraped.name}`, {
      roaster: scraped.roaster,
      origin: scraped.originCountry,
      process: scraped.process,
      variety: scraped.variety,
    });

    return NextResponse.json({ success: true, data: scraped, isExisting: false });
  } catch (err) {
    Logger.error('API', 'POST /api/coffees/scrape error', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Scraping failed' },
      { status: 400 }
    );
  }
}
