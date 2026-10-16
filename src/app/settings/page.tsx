import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Settings, Shield, Users } from 'lucide-react';
import DbNotice from '@/components/DbNotice';
import { getActiveClinic } from '@/lib/get-active-clinic';
import BranchSettingsClient from '@/components/BranchSettingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  let clinic: any = null;
  let allClinics: any[] = [];
  let users: any[] = [];
  let auditLogs: any[] = [];

  try {
    clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    allClinics = await prisma.clinic.findMany({
      orderBy: { createdAt: 'asc' },
    });

    users = await prisma.user.findMany({
      where: { clinicId: clinic.id },
      select: { id: true, name: true, email: true, role: true, phone: true, active: true },
      orderBy: { role: 'asc' },
    });

    auditLogs = await prisma.auditLog.findMany({
      where: { clinicId: clinic.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch (error) {
    console.error('Settings page error:', error);
    return <DbNotice />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="إعدادات فروع المركز وسجل التدقيق (Clinic Settings & Branches)"
        subtitle="إدارة بيانات الفروع وساعات العمل وعدد الكراسي والمصروفات الثابتة المستقلة لكل فرع، ودليل النسب الاستشاري، وصلاحيات المستخدمين"
      />

      <div className="p-6 space-y-6">
        {/* Dynamic Branch Settings with GuideTooltips */}
        <BranchSettingsClient
          initialClinics={allClinics}
          activeClinicId={clinic.id}
        />

        {/* Roles and Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-navy-700" />
            صلاحيات المستخدمين السريريين والإداريين بالفرع النشط (Role-Based Access)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">الاسم</th>
                  <th className="py-2.5 px-3 text-start">البريد الإلكتروني</th>
                  <th className="py-2.5 px-3 text-center">الدور والصلاحية (Role)</th>
                  <th className="py-2.5 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy-50 text-navy-800 border border-navy-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        مفعل
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Immutable Audit Log Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            سجل التدقيق الرقابي للمعاملات المالية والإجرائية (Audit Log)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">الإجراء الرقابي</th>
                  <th className="py-2.5 px-3 text-start">الكيان المتأثر</th>
                  <th className="py-2.5 px-3 text-start">السبب الموثق</th>
                  <th className="py-2.5 px-3 text-center">التاريخ والتوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      لا توجد سجلات تدقيق سابقة
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-navy-800">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {log.entityName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {log.reason || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {new Date(log.createdAt).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
