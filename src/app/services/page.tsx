import React from 'react';
import { prisma } from '@/lib/prisma';
import ServicesView from '@/components/ServicesView';
import DbNotice from '@/components/DbNotice';
import { getActiveClinic } from '@/lib/get-active-clinic';
import {
  MASTER_CHEMICAL_MATERIALS,
  MASTER_DISPOSABLE_MATERIALS,
  MASTER_REUSABLE_INSTRUMENTS,
  PRESET_PROCEDURE_RECIPES,
} from '@/lib/clinical-catalog-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    // Fetch DB services
    const dbServices = await prisma.serviceCatalog.findMany({
      where: { clinicId: clinic.id },
      include: {
        recipes: {
          include: {
            items: {
              include: { material: true },
            },
          },
        },
        doctorOverrides: true,
      },
      orderBy: { category: 'asc' },
    });

    // Fetch DB materials
    const dbMaterials = await prisma.material.findMany({
      orderBy: { name: 'asc' },
    });

    // Combine DB materials with Master Clinical Data ensuring no empty dropdowns
    const allMaterialsMap = new Map<string, any>();
    [...MASTER_CHEMICAL_MATERIALS, ...MASTER_DISPOSABLE_MATERIALS].forEach((m) => {
      allMaterialsMap.set(m.id, {
        id: m.id,
        sku: m.sku,
        name: m.name,
        nameAr: m.nameAr,
        brand: m.brand,
        category: m.category,
        clinicalRole: m.clinicalRole,
        packageUnit: m.packageUnit,
        baseUnit: m.baseUnit,
        conversionFactor: m.conversionFactor,
        costPerBaseUnit: m.unitCostBaseUnit,
        unusableWastePercent: m.unusableWastePercent,
        notes: m.notes,
      });
    });

    dbMaterials.forEach((m) => {
      allMaterialsMap.set(m.id, {
        id: m.id,
        sku: m.sku,
        name: m.name,
        nameAr: m.nameAr,
        brand: m.brand,
        category: m.category,
        clinicalRole: m.category,
        packageUnit: m.packageUnit,
        baseUnit: m.baseUnit,
        conversionFactor: m.conversionFactor,
        costPerBaseUnit: m.costPerBaseUnit,
        unusableWastePercent: m.unusableWastePercent,
        notes: m.notes,
      });
    });

    const combinedMaterials = Array.from(allMaterialsMap.values());

    return (
      <div className="flex-1 flex flex-col">
        <ServicesView
          services={JSON.parse(JSON.stringify(dbServices))}
          clinic={JSON.parse(JSON.stringify(clinic))}
          materials={JSON.parse(JSON.stringify(combinedMaterials))}
          reusableTools={JSON.parse(JSON.stringify(MASTER_REUSABLE_INSTRUMENTS))}
          presetRecipes={JSON.parse(JSON.stringify(PRESET_PROCEDURE_RECIPES))}
          clinicId={clinic.id}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading services:', error);
    return <DbNotice />;
  }
}
