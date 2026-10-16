import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Wrench, ShieldAlert, CheckCircle, Clock, RotateCcw } from 'lucide-react';

import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AssetsPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const assets = await prisma.fixedAsset.findMany({
      where: { clinicId: clinic.id },
      orderBy: { purchaseDate: 'asc' },
    });

    const instruments = await prisma.reusableInstrument.findMany({
      where: { clinicId: clinic.id },
      orderBy: { expectedLifetimeUses: 'asc' },
    });

  const totalHistoricalCost = assets.reduce((acc, a) => acc + (a.historicalCost || 0), 0);
  const totalAccumulatedDepreciation = assets.reduce((acc, a) => acc + (a.accumulatedDepreciation || 0), 0);
  const monthlyDepreciation = assets.reduce((acc, a) => acc + (a.monthlyDepreciation || 0), 0);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="الأصول الثابتة وسجل الأدوات المتكررة (Fixed Assets & Instruments)"
        subtitle="سجل إهلاك الأصول السريرية واحتياطي الإحلال المستقبلي، وحساب تكلفة السنابل والأدوات لكل استخدام"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي التكلفة التاريخية للأصول</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {totalHistoricalCost.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              قيمة شراء وحدات الأسنان والأجهزة
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">مجمع الإهلاك المحاسبي</span>
            <p className="text-2xl font-black font-mono text-amber-700 mt-1">
              {totalAccumulatedDepreciation.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              القيمة الدفترية المتبقية: {(totalHistoricalCost - totalAccumulatedDepreciation).toLocaleString()} ج.م
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">قسط الإهلاك الشهري الإجمالي</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {monthlyDepreciation.toFixed(1)} <span className="text-xs font-sans text-slate-500">ج.م / شهر</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              يدخل ضمن التكاليف الثابتة للعيادة
            </span>
          </div>
        </div>

        {/* Fixed Assets Register */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sage-600" />
            سجل الأصول الثابتة السريرية (Fixed Asset Register)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">كود الأصل</th>
                  <th className="py-2.5 px-3 text-start">اسم الأصل والموديل</th>
                  <th className="py-2.5 px-3 text-start">الفئة</th>
                  <th className="py-2.5 px-3 text-center">تاريخ الشراء</th>
                  <th className="py-2.5 px-3 text-end">التكلفة التاريخية</th>
                  <th className="py-2.5 px-3 text-end">الإهلاك الشهري</th>
                  <th className="py-2.5 px-3 text-end">تقدير تكلفة الإحلال</th>
                  <th className="py-2.5 px-3 text-start">ملاحظات التحقق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-navy-800">
                      {asset.assetCode}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {asset.nameAr || asset.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{asset.category}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {new Date(asset.purchaseDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-900">
                      {asset.historicalCost > 0 ? `${asset.historicalCost.toLocaleString()} ج.م` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono text-slate-700">
                      {asset.monthlyDepreciation > 0 ? `${asset.monthlyDepreciation.toFixed(1)} ج.م` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono text-slate-600">
                      {asset.replacementCostEstimate
                        ? `${asset.replacementCostEstimate.toLocaleString()} ج.م`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      {asset.notes && asset.notes.includes('FLAG') ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          {asset.notes}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">معتمد وموثق</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reusable Instruments Cost Per Use */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            سجل الأدوات متعددة الاستخدام وتكلفة الاستخدام الواحد (Cost Per Use)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">اسم الأداة</th>
                  <th className="py-2.5 px-3 text-start">الفئة السريرية</th>
                  <th className="py-2.5 px-3 text-end">سعر الشراء</th>
                  <th className="py-2.5 px-3 text-center">الاستخدامات المتوقعة</th>
                  <th className="py-2.5 px-3 text-end">تكلفة الاستخدام الواحد</th>
                  <th className="py-2.5 px-3 text-end">تكلفة دورة التعقيم</th>
                  <th className="py-2.5 px-3 text-center">حد التقاعد والإتلاف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instruments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {inst.nameAr || inst.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{inst.category}</td>
                    <td className="py-2.5 px-3 text-end font-mono text-navy-900">
                      {inst.purchasePrice} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {inst.expectedLifetimeUses} مرات
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-sage-800">
                      {inst.costPerUse} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono text-slate-700">
                      {inst.sterilizationCycleCost} ج.م
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {inst.retirementThresholdUses} استخدام
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
  console.error('Assets page error:', error);
  return <DbNotice />;
}
}

