import React from 'react';
import { prisma } from '@/lib/prisma';
import ConsumptionCalculatorView from '@/components/ConsumptionCalculatorView';
import DbNotice from '@/components/DbNotice';
import { getActiveClinic } from '@/lib/get-active-clinic';
import {
  MASTER_CHEMICAL_MATERIALS,
  MASTER_DISPOSABLE_MATERIALS,
} from '@/lib/clinical-catalog-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ConsumptionPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const dbMaterials = await prisma.material.findMany({
      orderBy: { name: 'asc' },
    });

    const materialsMap = new Map<string, any>();
    [...MASTER_CHEMICAL_MATERIALS, ...MASTER_DISPOSABLE_MATERIALS].forEach((m) => {
      materialsMap.set(m.id, {
        id: m.id,
        sku: m.sku,
        name: m.name,
        nameAr: m.nameAr,
        brand: m.brand,
        manufacturer: m.manufacturer,
        category: m.category,
        clinicalRole: m.clinicalRole,
        packageUnit: m.packageUnit,
        packageQuantity: m.packageQuantity,
        baseUnit: m.baseUnit,
        conversionFactor: m.conversionFactor,
        costPerBaseUnit: m.unitCostBaseUnit,
        unusableWastePercent: m.unusableWastePercent,
        notes: m.notes,
        usedInProcedures: m.usedInProcedures,
      });
    });

    dbMaterials.forEach((m) => {
      materialsMap.set(m.id, {
        id: m.id,
        sku: m.sku,
        name: m.name,
        nameAr: m.nameAr,
        brand: m.brand,
        manufacturer: m.manufacturer,
        category: m.category,
        clinicalRole: m.category,
        packageUnit: m.packageUnit,
        packageQuantity: m.packageQuantity,
        baseUnit: m.baseUnit,
        conversionFactor: m.conversionFactor,
        costPerBaseUnit: m.costPerBaseUnit,
        unusableWastePercent: m.unusableWastePercent,
        notes: m.notes,
        usedInProcedures: [],
      });
    });

    const combinedMaterials = Array.from(materialsMap.values());

    return (
      <div className="flex-1 flex flex-col">
        <ConsumptionCalculatorView materials={JSON.parse(JSON.stringify(combinedMaterials))} />
      </div>
    );
  } catch (error) {
    console.error('Error loading consumption:', error);
    return <DbNotice />;
  }
}
