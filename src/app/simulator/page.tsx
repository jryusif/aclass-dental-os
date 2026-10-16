import React from 'react';
import { prisma } from '@/lib/prisma';
import WhatIfSimulatorView from '@/components/WhatIfSimulatorView';
import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SimulatorPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const services = await prisma.serviceCatalog.findMany({
      where: { clinicId: clinic.id },
      include: {
        recipes: {
          include: {
            items: {
              include: { material: true },
            },
          },
        },
      },
    });

    const savedScenarios = await prisma.whatIfScenario.findMany({
      where: { clinicId: clinic.id },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <div className="flex-1 flex flex-col">
        <WhatIfSimulatorView
          clinic={clinic}
          services={services}
          savedScenarios={savedScenarios}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading simulator:', error);
    return <DbNotice />;
  }
}
