import React from 'react';
import { prisma } from '@/lib/prisma';
import DbNotice from '@/components/DbNotice';
import { getActiveClinic } from '@/lib/get-active-clinic';
import ExpensesChairEngineClient from '@/components/ExpensesChairEngineClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const expenses = await prisma.expense.findMany({
      where: { clinicId: clinic.id },
      include: { financialAccount: true },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <ExpensesChairEngineClient
        clinic={clinic}
        initialExpenses={JSON.parse(JSON.stringify(expenses))}
      />
    );
  } catch (error) {
    console.error('Expenses page error:', error);
    return <DbNotice />;
  }
}
