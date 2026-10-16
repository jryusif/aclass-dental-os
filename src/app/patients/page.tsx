import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Users, Phone, MapPin, AlertCircle, FileText, Plus } from 'lucide-react';

import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const patients = await prisma.patient.findMany({
      where: { clinicId: clinic.id },
      include: {
        visits: {
          include: { procedures: { include: { service: true } } },
        },
        patientInvoices: true,
        patientPayments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="ملفات المرضى والحالات السريرية (Patients & Clinical Cases)"
        subtitle="إدارة بيانات المرضى، التاريخ الطبي، الإجراءات المنجزة، والفواتير والمدفوعات المرتبطة"
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-navy-900">سجل المرضى النشطين بالعيادة</h3>
            <p className="text-xs text-slate-500">إجمالي المرضى المسجلين: {patients.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((pt) => {
            const totalProcedures = pt.visits.reduce((acc, v) => acc + v.procedures.length, 0);

            return (
              <div
                key={pt.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-50 text-navy-800 font-bold border border-navy-100">
                        {pt.patientNumber}
                      </span>
                      <h4 className="text-base font-bold text-navy-950 mt-1">
                        {pt.name}
                      </h4>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                        pt.currentBalance > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {pt.currentBalance > 0 ? `مدين: ${pt.currentBalance} ج.م` : 'خالص'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{pt.phone}</span>
                    </p>
                    {pt.address && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pt.address}</span>
                      </p>
                    )}
                    {pt.medicalHistory && (
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] mt-2">
                        <span className="font-bold block">ملاحظات طبية:</span>
                        {pt.medicalHistory}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>عدد الزيارات: {pt.visits.length}</span>
                  <span className="font-semibold text-slate-800">
                    {totalProcedures} إجراءات منجزة
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} catch (error) {
  console.error('Patients page error:', error);
  return <DbNotice />;
}
}

