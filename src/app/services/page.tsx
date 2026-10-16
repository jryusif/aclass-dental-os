import React from 'react';
import { prisma } from '@/lib/prisma';
import ServicesView from '@/components/ServicesView';
import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

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
  } catch (error) {
    console.error('Error loading services:', error);
    return <DbNotice />;
  }
}
