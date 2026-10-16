import React from 'react';
import { prisma } from '@/lib/prisma';
import ConsumptionCalculatorView from '@/components/ConsumptionCalculatorView';
import DbNotice from '@/components/DbNotice';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ConsumptionPage() {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return <DbNotice />;

    const materials = await prisma.material.findMany({
      where: { clinicId: clinic.id },
      include: {
        lots: true,
        procedureConsumptions: true,
      },
      orderBy: { category: 'asc' },
    });

    return (
      <div className="flex-1 flex flex-col">
        <ConsumptionCalculatorView materials={materials} />
      </div>
    );
  } catch (error) {
    console.error('Error loading consumption:', error);
    return <DbNotice />;
  }
}
