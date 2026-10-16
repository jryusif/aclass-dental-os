import React from 'react';
import { prisma } from '@/lib/prisma';
import MaterialsView from '@/components/MaterialsView';
import DbNotice from '@/components/DbNotice';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MaterialsPage() {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return <DbNotice />;

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
  } catch (error) {
    console.error('Error loading materials:', error);
    return <DbNotice />;
  }
}
