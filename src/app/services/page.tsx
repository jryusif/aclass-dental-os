import React from 'react';
import { prisma } from '@/lib/prisma';
import ServicesView from '@/components/ServicesView';

export const revalidate = 0;

export default async function ServicesPage() {
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
      doctorOverrides: true,
    },
    orderBy: { category: 'asc' },
  });

  return (
    <div className="flex-1 flex flex-col">
      <ServicesView services={services} clinicId={clinic.id} />
    </div>
  );
}
