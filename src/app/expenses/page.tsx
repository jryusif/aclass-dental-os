import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Wallet, DollarSign, ArrowDownLeft, ShieldCheck, Tag } from 'lucide-react';

export const revalidate = 0;

export default async function ExpensesPage() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return null;

  const expenses = await prisma.expense.findMany({
    where: { clinicId: clinic.id },
    include: { financialAccount: true },
    orderBy: { expenseDate: 'desc' },
  });

  const accounts = await prisma.financialAccount.findMany({
    where: { clinicId: clinic.id },
    orderBy: { code: 'asc' },
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalCashBalance = accounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="المصروفات التشغيلية وإدارة الحسابات النقدية (Expenses & Cash)"
        subtitle="فصل صارم بين حركة النقدية والمصروفات المحاسبية (شراء الأصول والمخزون ليس مصروفاً تشغيلياً مباشراً)"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي المصروفات التشغيلية المسجلة</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {totalExpenses.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              إيجار، رواتب، كهرباء، صيانة، برمجيات
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي السيولة النقدية المتاحة بالحسابات</span>
            <p className="text-2xl font-black font-mono text-emerald-700 mt-1">
              {totalCashBalance.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              خزينة العيادة + بنك CIB + انستاباي
            </span>
          </div>
        </div>

        {/* Expenses List Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900">سجل بنود المصروفات التشغيلية</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">البند</th>
                  <th className="py-2.5 px-3 text-start">الفئة</th>
                  <th className="py-2.5 px-3 text-start">الحساب المالي المنصرف منه</th>
                  <th className="py-2.5 px-3 text-end">المبلغ</th>
                  <th className="py-2.5 px-3 text-center">دورية التكرار</th>
                  <th className="py-2.5 px-3 text-center">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {exp.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {exp.category}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {exp.financialAccount?.nameAr || exp.financialAccount?.name || 'الخزينة'}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-rose-700">
                      {exp.amount.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        {exp.isRecurring ? 'شهري ثابت' : 'مرة واحدة'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                      {new Date(exp.expenseDate).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
