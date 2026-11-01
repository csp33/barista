import { NextResponse } from 'next/server';
import { container } from '@/infrastructure/ServiceContainer';
import { Logger } from '@/infrastructure/out/logger/Logger';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let base64 = '';
    let mime = 'image/jpeg';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      base64 = body.imageBase64;
      mime = body.mimeType || 'image/jpeg';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      base64 = Buffer.from(arrayBuffer).toString('base64');
      mime = file.type || 'image/jpeg';
    }

    if (!base64) {
      return NextResponse.json({ success: false, error: 'Image data is required' }, { status: 400 });
    }

    Logger.info('API', 'POST /api/coffees/scan-image - Running vision OCR scanner');
    const result = await container.extractCoffeeUseCase.execute({
      imageBase64: base64,
      mimeType: mime,
    });
    Logger.info('API', `Vision scanner result: ${result.coffee.name} (${result.coffee.roaster})`, {
      hasStory: Boolean(result.coffee.sommelierStory),
      hasAiRationale: Boolean(result.coffee.aiRationale),
    });

    const existing = await container.coffeeRepo.findByRoasterAndName(result.coffee.roaster, result.coffee.name);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `El café "${existing.name}" (${existing.roaster}) ya existe en tu colección`,
          isExisting: true,
          data: existing,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.coffee,
      recipe: result.recipe,
      isExisting: result.isExisting,
    });
  } catch (err) {
    Logger.error('API', 'POST /api/coffees/scan-image failed', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Vision scan failed' },
      { status: 500 }
    );
  }
}
