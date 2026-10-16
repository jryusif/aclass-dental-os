import React from 'react';
import { prisma } from '@/lib/prisma';
import { getDashboardData, getMaterialsWithLots, getServicesWithRecipes, getPatientsWithCases, getDoctors, getSuppliers } from '@/lib/data-service';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  let defaultClinic: any = null;
  let dashboardData: any = null;
  let materials: any[] = [];
  let services: any[] = [];
  let patients: any[] = [];
  let doctors: any[] = [];
  let suppliers: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      defaultClinic = await prisma.clinic.findFirst();
      if (defaultClinic) {
        dashboardData = await getDashboardData(defaultClinic.id);
        materials = await getMaterialsWithLots(defaultClinic.id);
        services = await getServicesWithRecipes(defaultClinic.id);
        patients = await getPatientsWithCases(defaultClinic.id);
        doctors = await getDoctors(defaultClinic.id);
        suppliers = await getSuppliers(defaultClinic.id);
      }
    }
  } catch (err) {
    console.warn('Database query during page load warning:', err);
  }

  if (!defaultClinic || !dashboardData) {
    return (
      <div className="p-8 text-center text-slate-600 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-navy-900 mb-2">يرجى إضافة متغير البيئة DATABASE_URL في Vercel</h2>
        <p className="text-sm text-slate-500 mb-4">
          تم نشر التطبيق بنجاح! لربطه بقاعدة بيانات PostgreSQL السحابية، يرجى لصق قيمة DATABASE_URL في إعدادات Vercel Environment Variables ثم الضغط على Redeploy.
        </p>
      </div>
    );
  }

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
