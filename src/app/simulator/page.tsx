import React from 'react';
import { prisma } from '@/lib/prisma';
import WhatIfSimulatorView from '@/components/WhatIfSimulatorView';

export const revalidate = 0;

export default async function SimulatorPage() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return null;

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
}
