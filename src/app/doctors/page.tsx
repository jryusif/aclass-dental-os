import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { UserCheck, Award, Percent, DollarSign } from 'lucide-react';

export const revalidate = 0;

export default async function DoctorsPage() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return null;

  const doctors = await prisma.doctor.findMany({
    where: { clinicId: clinic.id },
    include: {
      procedures: { where: { status: 'COMPLETED' } },
      compensationRules: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="الأطباء وعقود التعويض والعمولات (Doctors & Compensation)"
        subtitle="إدارة نماذج تعويض الأطباء (نسبة من المحصل، نسبة بعد خصم المعمل، نسبة بعد المعمل والخامات، أو راتب ثابت)"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {doctors.map((doc) => {
            const procs = doc.procedures || [];
            const billed = procs.reduce((acc, p) => acc + (p.standardPrice || 0), 0);
            const netRev = procs.reduce((acc, p) => acc + (p.netEarnedRevenue || 0), 0);
            const compTotal = procs.reduce((acc, p) => acc + (p.doctorCompensation || 0), 0);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block">
                      طبيب معتمد
                    </span>
                    <h3 className="text-base font-bold text-navy-950 mt-0.5">
                      {doc.nameAr || doc.name}
                    </h3>
                    <p className="text-xs text-slate-500">{doc.specialty}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {doc.defaultCommissionRate}% عمولة
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>نموذج التعويض المعتمد:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {doc.compensationModel}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>عدد الحالات السريرية المنجزة:</span>
                    <span className="font-mono font-bold text-navy-900">{procs.length} حالات</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>إجمالي الإيرادات المكتسبة للحالات:</span>
                    <span className="font-mono font-bold text-navy-900">{netRev.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                    <span className="font-bold text-navy-900">أتعاب الطبيب المستحقة:</span>
                    <span className="font-mono font-extrabold text-amber-700 text-sm">
                      {compTotal.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
