import { NextResponse } from 'next/server';
import { container } from '@/adapters/ServiceContainer';
import { Logger } from '@/adapters/out/logger/Logger';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  Logger.info('API', `PUT /api/coffees/${id} requested`);

  try {
    const body = await request.json();
    const result = await container.updateCoffeeUseCase.execute({
      id,
      data: body,
    });

    Logger.info('API', `Coffee ${id} updated successfully`, {
      name: result.coffee.name,
      newGrind: result.recipe.grindSetting,
      newTemp: result.recipe.machineTemperature,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    Logger.error('API', `Failed to update coffee ${id}`, error);
    const msg = error instanceof Error ? error.message : 'Failed to update coffee';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
