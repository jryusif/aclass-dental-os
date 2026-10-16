import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clinicId, title, notes, baseParameters, comparisonResults } = body;

    if (!clinicId || !title) {
      return NextResponse.json({ error: 'Missing clinicId or title' }, { status: 400 });
    }

    const scenario = await prisma.whatIfScenario.create({
      data: {
        clinicId,
        title,
        notes: notes || 'Simulated what-if scenario',
        baseParameters: baseParameters || {},
        comparisonResults: comparisonResults || {},
      },
    });

    return NextResponse.json({ success: true, data: scenario });
  } catch (err: any) {
    console.error('Error saving scenario:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
