import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Boxes, Clock, ArrowDownRight, ArrowUpRight, ShieldCheck, History } from 'lucide-react';

import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const lots = await prisma.materialLot.findMany({
      where: { clinicId: clinic.id },
      include: { material: true, supplier: true },
      orderBy: { expiryDate: 'asc' }, // FEFO order
    });

    const movements = await prisma.stockMovement.findMany({
      where: { clinicId: clinic.id },
      include: { material: true, lot: true, procedure: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

  const totalValuation = lots.reduce((acc, l) => acc + (l.currentStockBaseUnits * l.unitCostBaseUnit), 0);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="سجل المخزون واللوتات (Inventory & Lot Ledger)"
        subtitle="تتبع دقيق لكافة حركات الصرف والاستلام بنظام المنتهي أولاً يخرج أولاً (FEFO) مع سجل تدقيق غير قابل للحذف"
      />

      <div className="p-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي تقييم المخزون الحي</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {totalValuation.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              محسوب بتكلفة وحدة الأساس الفعلية لكل لوت
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">عدد اللوتات النشطة بالمستودع</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {lots.filter(l => l.status === 'ACTIVE').length} لوت
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> متطابقة مع سجل الشراء
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">حركات الصرف والاستلام المسجلة</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {movements.length} حركة
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              أحدث الحركات المحفوظة في دفتر الأستاذ
            </span>
          </div>
        </div>

        {/* Active Lots FEFO Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sage-600" />
            أرصدة لوتات المخزون مرتبة بنظام الصلاحية الأقرب (FEFO Table)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">رقم اللوت (Lot No.)</th>
                  <th className="py-2.5 px-3 text-start">اسم الخامة</th>
                  <th className="py-2.5 px-3 text-start">المورد المعتمد</th>
                  <th className="py-2.5 px-3 text-center">تاريخ الصلاحية</th>
                  <th className="py-2.5 px-3 text-end">سعر وحدة الأساس</th>
                  <th className="py-2.5 px-3 text-end">الرصيد المتبقي</th>
                  <th className="py-2.5 px-3 text-end">إجمالي القيمة</th>
                  <th className="py-2.5 px-3 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-navy-800">
                      {lot.lotNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {lot.material?.nameAr || lot.material?.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {lot.supplier?.name || 'مستودع العيادة'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {new Date(lot.expiryDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono text-slate-700">
                      {lot.unitCostBaseUnit.toFixed(2)} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-sage-800">
                      {lot.currentStockBaseUnits} {lot.material?.baseUnit}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-950">
                      {(lot.currentStockBaseUnits * lot.unitCostBaseUnit).toFixed(1)} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {lot.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Movements Audit Log Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <History className="w-4 h-4 text-navy-700" />
            دفتر أستاذ حركات المخزون غير القابل للتعديل (Stock Movement Ledger)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">نوع الحركة</th>
                  <th className="py-2.5 px-3 text-start">الخامة</th>
                  <th className="py-2.5 px-3 text-start">اللوت المرتبط</th>
                  <th className="py-2.5 px-3 text-end">الكمية المصروفة / المضافة</th>
                  <th className="py-2.5 px-3 text-end">تكلفة الحركة</th>
                  <th className="py-2.5 px-3 text-start">السبب / المرجع</th>
                  <th className="py-2.5 px-3 text-center">التاريخ والتوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold">
                      {m.movementType === 'PURCHASE_RECEIPT' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          <ArrowDownRight className="w-3 h-3" /> استلام شراء
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                          <ArrowUpRight className="w-3 h-3" /> صرف لحالة سريرية
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {m.material?.nameAr || m.material?.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {m.lot?.lotNumber || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-900">
                      {m.quantityBaseUnits > 0 ? `+${m.quantityBaseUnits}` : m.quantityBaseUnits} {m.unit}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono text-slate-800 font-semibold">
                      {m.totalCost.toFixed(1)} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {m.reason}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {new Date(m.createdAt).toLocaleString('ar-EG')}
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
} catch (error) {
  console.error('Inventory page error:', error);
  return <DbNotice />;
}
}

