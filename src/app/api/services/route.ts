import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    const services = await prisma.serviceCatalog.findMany({
      where: clinicId ? { clinicId } : undefined,
      include: {
        recipes: {
          include: {
            items: {
              include: { material: true },
            },
          },
        },
      },
      orderBy: { category: 'asc' },
    });

    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clinicId,
      code,
      name,
      nameAr,
      specialty = 'Biomimetic Restorative',
      category = 'DIRECT_RESTORATION',
      durationMinutes = 45,
      standardPrice = 1200,
      minCostRecoveryPrice = 450,
      targetContributionPrice = 850,
      targetFullMarginPrice = 1200,
      description,
      recipeItems = [],
    } = body;

    if (!clinicId || (!name && !nameAr)) {
      return NextResponse.json({ error: 'بيانات الخدمة غير مكتملة' }, { status: 400 });
    }

    const serviceCode =
      code || `SRV-${(name || nameAr || 'BIO').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const service = await prisma.serviceCatalog.create({
      data: {
        clinicId,
        code: serviceCode,
        name: name || nameAr,
        nameAr: nameAr || name,
        specialty,
        category,
        durationMinutes: parseInt(durationMinutes) || 45,
        chairTimeMinutes: parseInt(durationMinutes) || 45,
        standardPrice: parseFloat(standardPrice) || 0,
        minCostRecoveryPrice: parseFloat(minCostRecoveryPrice) || 0,
        targetContributionPrice: parseFloat(targetContributionPrice) || 0,
        targetFullMarginPrice: parseFloat(targetFullMarginPrice) || 0,
        description: description || null,
      },
    });

    // Create recipe if items provided
    if (recipeItems.length > 0) {
      const recipe = await prisma.consumptionRecipe.create({
        data: {
          clinicId,
          serviceId: service.id,
          name: `معيار ${nameAr || name}`,
          isDefault: true,
        },
      });

      for (const item of recipeItems) {
        if (item.materialId) {
          await prisma.recipeItem.create({
            data: {
              recipeId: recipe.id,
              materialId: item.materialId,
              standardQuantity: parseFloat(item.quantity) || 1,
              unit: item.unit || 'APPLICATION',
              wasteAllowancePercent: parseFloat(item.wastePercent) || 10,
            },
          });
        }
      }
    }

    const fullService = await prisma.serviceCatalog.findUnique({
      where: { id: service.id },
      include: {
        recipes: {
          include: {
            items: {
              include: { material: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, service: fullService });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      nameAr,
      durationMinutes,
      standardPrice,
      minCostRecoveryPrice,
      targetContributionPrice,
      targetFullMarginPrice,
      description,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف الخدمة مطلوب' }, { status: 400 });
    }

    const updated = await prisma.serviceCatalog.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameAr && { nameAr }),
        ...(durationMinutes !== undefined && {
          durationMinutes: parseInt(durationMinutes) || 45,
          chairTimeMinutes: parseInt(durationMinutes) || 45,
        }),
        ...(standardPrice !== undefined && { standardPrice: parseFloat(standardPrice) || 0 }),
        ...(minCostRecoveryPrice !== undefined && {
          minCostRecoveryPrice: parseFloat(minCostRecoveryPrice) || 0,
        }),
        ...(targetContributionPrice !== undefined && {
          targetContributionPrice: parseFloat(targetContributionPrice) || 0,
        }),
        ...(targetFullMarginPrice !== undefined && {
          targetFullMarginPrice: parseFloat(targetFullMarginPrice) || 0,
        }),
        ...(description !== undefined && { description }),
      },
      include: {
        recipes: {
          include: {
            items: {
              include: { material: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
