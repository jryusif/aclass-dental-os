import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MaterialCategory, PackageUnit, BaseUnit, EvidenceLevel } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    const materials = await prisma.material.findMany({
      where: clinicId ? { OR: [{ clinicId }, { clinicId: null }] } : undefined,
      include: {
        lots: {
          where: { status: 'ACTIVE' },
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, materials });
  } catch (error: any) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clinicId,
      name,
      nameAr,
      brand,
      manufacturer,
      category,
      packageUnit,
      packageQuantity = 1.0,
      baseUnit,
      conversionFactor = 1.0,
      unusableWastePercent = 10.0,
      packagePurchasePrice = 0.0,
      notes,
    } = body;

    if (!name && !nameAr) {
      return NextResponse.json({ error: 'اسم المادة مطلوب' }, { status: 400 });
    }

    // Auto-calculate cost per base unit with waste factor
    // Total base units in package = packageQuantity * conversionFactor
    const totalBaseUnits = (parseFloat(packageQuantity) || 1.0) * (parseFloat(conversionFactor) || 1.0);
    const price = parseFloat(packagePurchasePrice) || 0.0;
    const wasteFactor = 1 + (parseFloat(unusableWastePercent) || 0) / 100;
    const calculatedCostPerBaseUnit = totalBaseUnits > 0 ? (price / totalBaseUnits) * wasteFactor : 0.0;

    const sku =
      body.sku ||
      `MAT-${Date.now().toString().slice(-6)}-${(name || nameAr || 'ITEM').slice(0, 3).toUpperCase()}`;

    const material = await prisma.material.create({
      data: {
        clinicId: clinicId || null,
        sku,
        name: name || nameAr,
        nameAr: nameAr || name,
        brand: brand || 'Standard Clinical',
        manufacturer: manufacturer || 'Biomimetic Grade',
        category: (category as MaterialCategory) || MaterialCategory.CONSUMABLES,
        packageUnit: (packageUnit as PackageUnit) || PackageUnit.SYRINGE,
        packageQuantity: parseFloat(packageQuantity) || 1.0,
        baseUnit: (baseUnit as BaseUnit) || BaseUnit.DOSE,
        conversionFactor: parseFloat(conversionFactor) || 1.0,
        unusableWastePercent: parseFloat(unusableWastePercent) || 10.0,
        costPerBaseUnit: parseFloat(calculatedCostPerBaseUnit.toFixed(4)),
        reorderThreshold: 1.0,
        minStockLevel: 1.0,
        evidenceLevel: EvidenceLevel.MEASURED_CLINIC,
        notes: notes || `تمت الإضافة: سعر العبوة ${price} ج.م لسعة ${totalBaseUnits} ${baseUnit}`,
      },
    });

    // Optionally create an active stock lot so this material is immediately usable
    if (clinicId && price > 0) {
      await prisma.materialLot.create({
        data: {
          clinicId,
          materialId: material.id,
          lotNumber: `LOT-${Date.now().toString().slice(-5)}`,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 years expiry default
          purchasePrice: price,
          purchaseQuantityUnits: parseFloat(packageQuantity) || 1.0,
          currentStockBaseUnits: totalBaseUnits * 5, // 5 packs active baseline
          unitCostBaseUnit: parseFloat(calculatedCostPerBaseUnit.toFixed(4)),
        },
      });
    }

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error('Error creating material:', error);
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
      brand,
      category,
      packagePurchasePrice,
      packageQuantity,
      conversionFactor,
      unusableWastePercent,
      baseUnit,
      packageUnit,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المادة مطلوب' }, { status: 400 });
    }

    const current = await prisma.material.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 });
    }

    const packQty = parseFloat(packageQuantity ?? current.packageQuantity) || 1.0;
    const conv = parseFloat(conversionFactor ?? current.conversionFactor) || 1.0;
    const waste = parseFloat(unusableWastePercent ?? current.unusableWastePercent) || 0.0;
    const price = parseFloat(packagePurchasePrice ?? (current.costPerBaseUnit * packQty * conv));

    const totalBaseUnits = packQty * conv;
    const calculatedCost = totalBaseUnits > 0 ? (price / totalBaseUnits) * (1 + waste / 100) : current.costPerBaseUnit;

    const updated = await prisma.material.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameAr && { nameAr }),
        ...(brand && { brand }),
        ...(category && { category: category as MaterialCategory }),
        ...(packageUnit && { packageUnit: packageUnit as PackageUnit }),
        ...(baseUnit && { baseUnit: baseUnit as BaseUnit }),
        packageQuantity: packQty,
        conversionFactor: conv,
        unusableWastePercent: waste,
        costPerBaseUnit: parseFloat(calculatedCost.toFixed(4)),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ success: true, material: updated });
  } catch (error: any) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
