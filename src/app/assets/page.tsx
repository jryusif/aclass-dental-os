import React from 'react';
import { prisma } from '@/lib/prisma';
import DbNotice from '@/components/DbNotice';
import { getActiveClinic } from '@/lib/get-active-clinic';
import AssetsViewClient from '@/components/AssetsViewClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AssetsPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const assets = await prisma.fixedAsset.findMany({
      where: { clinicId: clinic.id },
      orderBy: { purchaseDate: 'asc' },
    });

    const instruments = await prisma.reusableInstrument.findMany({
      where: { clinicId: clinic.id },
      orderBy: { expectedLifetimeUses: 'asc' },
    });

    return (
      <AssetsViewClient
        clinic={JSON.parse(JSON.stringify(clinic))}
        initialAssets={JSON.parse(JSON.stringify(assets))}
        initialInstruments={JSON.parse(JSON.stringify(instruments))}
      />
    );
  } catch (error) {
    console.error('Assets page error:', error);
    return <DbNotice />;
  }
}
