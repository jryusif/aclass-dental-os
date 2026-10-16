import React from 'react';
import { prisma } from '@/lib/prisma';
import PriceVersionsView from '@/components/PriceVersionsView';
import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PriceVersionsPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const versions = await prisma.priceListVersion.findMany({
      where: { clinicId: clinic.id },
      orderBy: { effectiveDate: 'desc' },
    });

    return (
      <div className="flex-1 flex flex-col">
        <PriceVersionsView versions={versions} clinicId={clinic.id} />
      </div>
    );
  } catch (error) {
    console.error('Price versions page error:', error);
    return <DbNotice />;
  }
}
