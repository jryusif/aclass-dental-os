import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Building2, Package, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

import DbNotice from '@/components/DbNotice';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LabsPage() {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) return <DbNotice />;

    const labs = await prisma.dentalLab.findMany({
      where: { clinicId: clinic.id },
      include: { labOrders: { include: { patient: true } } },
    });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="معامل الأسنان والتركيبات (Dental Laboratories)"
        subtitle="متابعة أوامر تصنيع التركيبات الثابتة والزركونيا والإيماكس وحالات الإعادة (Remakes) ومستحقات المعامل"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-950">{lab.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{lab.phone}</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                  الرصيد: {lab.currentBalance} ج.م
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-2">أوامر المعمل المسجلة:</p>
                {lab.labOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">لا توجد أوامر معمل حالية</p>
                ) : (
                  <div className="space-y-1.5">
                    {lab.labOrders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {ord.restorationType} (سن #{ord.toothNumber})
                          </span>
                          <span className="text-[10px] text-slate-500">
                            المريض: {ord.patient?.name}
                          </span>
                        </div>
                        <div className="text-end">
                          <span className="font-mono font-bold text-navy-900 block">
                            {ord.finalCost} ج.م
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} catch (error) {
  console.error('Labs page error:', error);
  return <DbNotice />;
}
}

