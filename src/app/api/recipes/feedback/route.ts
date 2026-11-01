import { NextResponse } from 'next/server';
import { container } from '@/adapters/ServiceContainer';
import { Logger } from '@/adapters/out/logger/Logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      recipeId,
      actualGrindSetting,
      actualDoseGrams,
      actualYieldGrams,
      actualTimeSeconds,
      tasteProfile,
      userNotes,
    } = body;

    Logger.info('API', 'POST /api/recipes/feedback - Logging shot feedback', {
      recipeId,
      tasteProfile,
      actualGrind: actualGrindSetting,
      actualTime: actualTimeSeconds,
    });

    if (!recipeId || !tasteProfile) {
      return NextResponse.json(
        { success: false, error: 'recipeId and tasteProfile are required' },
        { status: 400 }
      );
    }

    const result = await container.logFeedbackUseCase.execute({
      recipeId,
      actualGrindSetting: Number(actualGrindSetting),
      actualDoseGrams: Number(actualDoseGrams),
      actualYieldGrams: Number(actualYieldGrams),
      actualTimeSeconds: Number(actualTimeSeconds),
      tasteProfile,
      userNotes,
    });

    Logger.info('API', `Shot recalibrated for ${recipeId}`, {
      tasteProfile,
      recalibratedGrind: result.adjustedRecipe.grindSetting,
      recalibratedYield: result.adjustedRecipe.yieldGrams,
      recalibratedTemp: result.adjustedRecipe.machineTemperature,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    Logger.error('API', 'POST /api/recipes/feedback error', error);
    const msg = error instanceof Error ? error.message : 'Failed to log feedback';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
