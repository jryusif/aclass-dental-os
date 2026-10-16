import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Receipt, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const revalidate = 0;

export default async function InvoicesPage() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return null;

  const invoices = await prisma.patientInvoice.findMany({
    where: { clinicId: clinic.id },
    include: { patient: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const totalReceivables = invoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="الفواتير والتحصيلات (Invoices & Collections)"
        subtitle="إدارة فواتير المرضى المفوترة ومتابعة التحصيلات النقدية وأرصدة المدينين Accounts Receivable"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي مبالغ الفواتير الصادرة</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {totalInvoiced.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">النقدية المحصلة فعلياً من المرضى</span>
            <p className="text-2xl font-black font-mono text-emerald-700 mt-1">
              {totalCollected.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">مستحقات على المرضى (آجل)</span>
            <p className="text-2xl font-black font-mono text-rose-700 mt-1">
              {totalReceivables.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900">سجل فواتير المرضى الصادرة</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">رقم الفاتورة</th>
                  <th className="py-2.5 px-3 text-start">المريض</th>
                  <th className="py-2.5 px-3 text-end">إجمالي الفاتورة</th>
                  <th className="py-2.5 px-3 text-end">المسدد نقداً</th>
                  <th className="py-2.5 px-3 text-end">المتبقي الآجل</th>
                  <th className="py-2.5 px-3 text-center">حالة السداد</th>
                  <th className="py-2.5 px-3 text-center">تاريخ الإصدار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-navy-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {inv.patient?.name} ({inv.patient?.patientNumber})
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-900">
                      {inv.totalAmount.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-emerald-700">
                      {inv.paidAmount.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-rose-700">
                      {inv.balance.toLocaleString()} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {inv.status === 'PAID' ? 'خالص' : 'سداد جزئي'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {new Date(inv.issueDate).toLocaleDateString('ar-EG')}
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
