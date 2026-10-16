import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Settings, Shield, Clock, Database, Users, Key, AlertTriangle } from 'lucide-react';

import DbNotice from '@/components/DbNotice';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  let clinic: any = null;
  let users: any[] = [];
  let auditLogs: any[] = [];

  try {
    clinic = await prisma.clinic.findFirst();
    if (!clinic) return <DbNotice />;

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
        title="إعدادات العيادة وسجل التدقيق (Clinic Settings & Audit Trail)"
        subtitle="تهيئة ساعات العمل، عدد الكراسي، المصاريف الشهرية، وصلاحيات المستخدمين، وسجل التدقيق الرقابي"
      />

      <div className="p-6 space-y-6">
        {/* Clinic Baseline Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-sage-600" />
              البيانات التشغيلية والافتراضات المعتمدة للعيادة
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sage-50 text-sage-800 font-bold border border-sage-200">
              {clinic.code}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[10px] block">اسم العيادة الرسمي</span>
              <p className="font-bold text-navy-900 mt-1">{clinic.nameAr}</p>
              <p className="text-[10px] text-slate-400 font-sans">{clinic.name}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[10px] block">الموقع الجغرافي والفرع</span>
              <p className="font-bold text-navy-900 mt-1">{clinic.location}</p>
              <p className="text-[10px] text-slate-400">العملة الأساسية: {clinic.currency}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[10px] block">المصاريف التشغيلية الثابتة شهرياً</span>
              <p className="font-bold font-mono text-navy-900 mt-1">
                {clinic.monthlyFixedExpenses.toLocaleString()} ج.م
              </p>
              <p className="text-[10px] text-slate-400">أساس احتساب نقطة التعادل</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[10px] block">عدد الكراسي النشطة بالعيادة</span>
              <p className="font-bold font-mono text-navy-900 mt-1">{clinic.activeChairs} كراسي</p>
              <p className="text-[10px] text-slate-400">ساعات العمل اليومية: {clinic.dailyWorkingHours} ساعات</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[10px] block">أيام العمل الشهرية</span>
              <p className="font-bold font-mono text-navy-900 mt-1">{clinic.workingDaysPerMonth} يوماً / شهر</p>
              <p className="text-[10px] text-slate-400">معدل الإشغال المخطط: {(clinic.occupancyRate * 100).toFixed(0)}%</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[10px] block">قاعدة البيانات السحابية (Neon)</span>
              <p className="font-bold font-mono text-emerald-700 mt-1">AWS us-east-2</p>
              <p className="text-[10px] text-slate-400">PostgreSQL 18</p>
            </div>
          </div>
        </div>

        {/* Roles and Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-navy-700" />
            صلاحيات المستخدمين السريريين والإداريين (Role-Based Access)
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
