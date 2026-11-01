import { NextResponse } from 'next/server';
import { container } from '@/adapters/ServiceContainer';

export async function GET() {
  try {
    const stash = await container.getCoffeeStashUseCase.execute();
    return NextResponse.json({ success: true, data: stash });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await container.addCoffeeUseCase.execute({
      url: body.url,
      manualData: body.manualData,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to add coffee';
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
