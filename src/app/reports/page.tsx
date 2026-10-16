import React from 'react';
import { prisma } from '@/lib/prisma';
import ReportsView from '@/components/ReportsView';
import { calculateChairCost } from '@/lib/pricing-engine';
import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const procedures = await prisma.procedure.findMany({
      where: { clinicId: clinic.id, status: 'COMPLETED' },
      include: { service: true, doctor: true, patient: true },
      orderBy: { createdAt: 'desc' },
    });

    const expenses = await prisma.expense.findMany({
      where: { clinicId: clinic.id },
      orderBy: { expenseDate: 'desc' },
    });

    const doctors = await prisma.doctor.findMany({
      where: { clinicId: clinic.id },
      include: {
        procedures: {
          where: { status: 'COMPLETED' },
        },
      },
    });

    const chairMetrics = calculateChairCost({
      activeChairs: clinic.activeChairs,
      workingDaysPerMonth: clinic.workingDaysPerMonth,
      dailyWorkingHours: clinic.dailyWorkingHours,
      occupancyRate: clinic.occupancyRate,
      monthlyFixedExpenses: clinic.monthlyFixedExpenses,
    });

    return (
      <div className="flex-1 flex flex-col">
        <ReportsView
          clinic={clinic}
          procedures={procedures}
          expenses={expenses}
          doctors={doctors}
          chairMetrics={chairMetrics}
        />
      </div>
    );
  } catch (error) {
    console.error('Reports page error:', error);
    return <DbNotice />;
  }
}
