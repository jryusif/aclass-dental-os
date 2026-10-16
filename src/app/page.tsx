import React from 'react';
import { prisma } from '@/lib/prisma';
import { getDashboardData, getMaterialsWithLots, getServicesWithRecipes, getPatientsWithCases, getDoctors, getSuppliers } from '@/lib/data-service';
import DashboardClient from '@/components/DashboardClient';

export const revalidate = 0; // dynamic data

export default async function DashboardPage() {
  const defaultClinic = await prisma.clinic.findFirst();
  if (!defaultClinic) {
    return (
      <div className="p-8 text-center text-slate-600">
        لم يتم العثور على عيادة مسجلة. يرجى تهيئة قاعدة البيانات.
      </div>
    );
  }

  const dashboardData = await getDashboardData(defaultClinic.id);
  const materials = await getMaterialsWithLots(defaultClinic.id);
  const services = await getServicesWithRecipes(defaultClinic.id);
  const patients = await getPatientsWithCases(defaultClinic.id);
  const doctors = await getDoctors(defaultClinic.id);
  const suppliers = await getSuppliers(defaultClinic.id);

  return (
    <DashboardClient
      initialData={dashboardData}
      materials={materials}
      services={services}
      patients={patients}
      doctors={doctors}
      suppliers={suppliers}
    />
  );
}
