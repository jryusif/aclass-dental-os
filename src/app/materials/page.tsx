import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import MaterialsView from '@/components/MaterialsView';

export const revalidate = 0;

export default async function MaterialsPage() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return null;

  const materials = await prisma.material.findMany({
    where: { clinicId: clinic.id },
    include: {
      lots: {
        orderBy: { expiryDate: 'asc' }, // FEFO
        include: { supplier: true },
      },
      wasteRecords: true,
    },
    orderBy: { category: 'asc' },
  });

  const suppliers = await prisma.supplier.findMany({
    where: { clinicId: clinic.id },
  });

  return (
    <div className="flex-1 flex flex-col">
      <MaterialsView initialMaterials={materials} suppliers={suppliers} clinicId={clinic.id} />
    </div>
  );
}
