import { NextResponse } from 'next/server';
import { container } from '@/adapters/ServiceContainer';

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

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to log feedback';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
