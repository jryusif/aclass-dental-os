import React from 'react';
import { prisma } from '@/lib/prisma';
import PriceVersionsView from '@/components/PriceVersionsView';

export const revalidate = 0;

export default async function PriceVersionsPage() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return null;

  const versions = await prisma.priceListVersion.findMany({
    where: { clinicId: clinic.id },
    orderBy: { effectiveDate: 'desc' },
  });

  return (
    <div className="flex-1 flex flex-col">
      <PriceVersionsView versions={versions} clinicId={clinic.id} />
    </div>
  );
}
