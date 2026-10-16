import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AssetStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    const assets = await prisma.fixedAsset.findMany({
      where: clinicId ? { clinicId } : undefined,
      orderBy: { purchaseDate: 'desc' },
    });

    const instruments = await prisma.reusableInstrument.findMany({
      where: clinicId ? { clinicId } : undefined,
      orderBy: { expectedLifetimeUses: 'asc' },
    });

    return NextResponse.json({ success: true, assets, instruments });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clinicId,
      assetType = 'DEVICE', // 'DEVICE' or 'REUSABLE_INSTRUMENT'
      name,
      nameAr,
      category = 'CHAIR_UNIT',
      purchasePrice = 0,
      usefulLifeYears = 5,
      // For reusable instruments:
      expectedLifetimeUses = 20,
      sterilizationCycleCost = 5,
      notes,
    } = body;

    if (!clinicId || (!name && !nameAr)) {
      return NextResponse.json({ error: 'البيانات الأساسية ناقصة' }, { status: 400 });
    }

    const price = parseFloat(purchasePrice) || 0;

    if (assetType === 'DEVICE') {
      const years = parseFloat(usefulLifeYears) || 5;
      const usefulLifeMonths = Math.max(1, Math.round(years * 12));
      const monthlyDepreciation = usefulLifeMonths > 0 ? price / usefulLifeMonths : 0;
      const assetCode = `EQP-${Date.now().toString().slice(-5)}`;

      const asset = await prisma.fixedAsset.create({
        data: {
          clinicId,
          assetCode,
          name: name || nameAr,
          nameAr: nameAr || name,
          category,
          purchaseDate: new Date(),
          historicalCost: price,
          usefulLifeMonths,
          accumulatedDepreciation: 0,
          monthlyDepreciation: parseFloat(monthlyDepreciation.toFixed(2)),
          replacementCostEstimate: price * 1.25, // 25% inflation buffer
          status: AssetStatus.ACTIVE,
          notes: notes || `العمر الافتراضي ${years} سنوات بقسط شهري ${monthlyDepreciation.toFixed(1)} ج.م`,
        },
      });

      return NextResponse.json({ success: true, asset });
    } else {
      // Reusable Instrument
      const uses = parseInt(expectedLifetimeUses) || 20;
      const costPerUse = uses > 0 ? price / uses : 0;

      const inst = await prisma.reusableInstrument.create({
        data: {
          clinicId,
          name: name || nameAr,
          nameAr: nameAr || name,
          category: category || 'BUR_DIAMOND',
          purchasePrice: price,
          expectedLifetimeUses: uses,
          currentUseCount: 0,
          costPerUse: parseFloat(costPerUse.toFixed(2)),
          sterilizationCycleCost: parseFloat(sterilizationCycleCost) || 5,
          retirementThresholdUses: Math.round(uses * 1.2),
          status: 'ACTIVE',
        },
      });

      return NextResponse.json({ success: true, instrument: inst });
    }
  } catch (error: any) {
    console.error('Error creating asset:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
