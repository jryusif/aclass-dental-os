import React from 'react';
import { prisma } from '@/lib/prisma';
import MaterialsView from '@/components/MaterialsView';
import DbNotice from '@/components/DbNotice';
import { getActiveClinic } from '@/lib/get-active-clinic';
import {
  MASTER_CHEMICAL_MATERIALS,
  MASTER_DISPOSABLE_MATERIALS,
  MASTER_REUSABLE_INSTRUMENTS,
} from '@/lib/clinical-catalog-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MaterialsPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    // Fetch DB materials & DB instruments
    const dbMaterials = await prisma.material.findMany({
      orderBy: { name: 'asc' },
    });

    const dbInstruments = await prisma.reusableInstrument.findMany({
      orderBy: { name: 'asc' },
    });

    // Merge chemical materials
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

    // Merge reusable instruments
    const instrumentsMap = new Map<string, any>();
    MASTER_REUSABLE_INSTRUMENTS.forEach((inst) => {
      instrumentsMap.set(inst.id, inst);
    });
    dbInstruments.forEach((inst) => {
      instrumentsMap.set(inst.id, {
        id: inst.id,
        name: inst.name,
        nameAr: inst.nameAr,
        category: inst.category,
        purchasePrice: inst.purchasePrice,
        expectedLifetimeUses: inst.expectedLifetimeUses,
        costPerUse: inst.costPerUse,
        sterilizationCycleCost: inst.sterilizationCycleCost,
        totalPerPatientCost: inst.costPerUse + inst.sterilizationCycleCost,
        notes: 'أداة معتمدة بالعيادة',
        usedInProcedures: [],
      });
    });

    const combinedInstruments = Array.from(instrumentsMap.values());

    return (
      <div className="flex-1 flex flex-col">
        <MaterialsView
          initialMaterials={JSON.parse(JSON.stringify(combinedMaterials))}
          initialInstruments={JSON.parse(JSON.stringify(combinedInstruments))}
          suppliers={[]}
          clinicId={clinic.id}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading materials:', error);
    return <DbNotice />;
  }
}
