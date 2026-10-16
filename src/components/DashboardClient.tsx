'use client';

import React, { useState } from 'react';
import Header from './Header';
import MetricCard from './MetricCard';
import ProcedureModal from './ProcedureModal';
import PurchaseModal from './PurchaseModal';
import PaymentModal from './PaymentModal';
import PricingCalculatorModal from './PricingCalculatorModal';
import { useApp } from '@/context/AppContext';
import {
  Wallet,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Stethoscope,
  Boxes,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';

interface DashboardClientProps {
  initialData: any;
  materials: any[];
  services: any[];
  patients: any[];
  doctors: any[];
  suppliers: any[];
}

export default function DashboardClient({
  initialData,
  materials,
  services,
  patients,
  doctors,
  suppliers,
}: DashboardClientProps) {
  const { t } = useApp();
  const [data, setData] = useState(initialData);

  // Modals state
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const { kpis, chairMetrics, financialAccounts, expiringLots, shortages, procedures } = data;

  const refreshData = async () => {
    // Soft reload
    window.location.reload();
  };

  // Collect invoices for payment modal
  const allInvoices = patients.flatMap((p: any) => p.patientInvoices || []);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={t.nav.dashboard}
        subtitle="متابعة التدفقات المالية الحقيقية، استهلاك الخامات الحيوية، وأرباح العيادة التراكمية"
        onOpenProcedureModal={() => setIsProcedureModalOpen(true)}
        onOpenPurchaseModal={() => setIsPurchaseModalOpen(true)}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        {/* Top Control Bar: Date Filters & Action Triggers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              فترة التقرير:
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              {(['today', 'week', 'month', 'all'] as const).map((filterKey) => {
                const labels = {
                  today: 'اليوم',
                  week: 'هذا الأسبوع',
                  month: 'هذا الشهر',
                  all: 'كامل السجل',
                };
                const isSelected = dateFilter === filterKey;
                return (
                  <button
                    key={filterKey}
                    onClick={() => setDateFilter(filterKey)}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-navy-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {labels[filterKey]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>محاكي التسعير الجبري</span>
            </button>
          </div>
        </div>

        {/* PRIMARY FINANCIAL KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t.finance.netRevenue}
            value={kpis.netEarnedRevenue}
            subtitle={`إجمالي الفواتير: ${kpis.grossBillings.toLocaleString()} ج.م`}
            formulaTooltip="صافي الإيراد المكتسب = إجمالي فواتير الإجراءات المنجزة - الخصومات الممنوحة"
            badge={{ text: 'مكتسب سريرياً', variant: 'positive' }}
            highlight={true}
          />

          <MetricCard
            title={t.finance.cashCollected}
            value={kpis.cashCollected}
            subtitle={`متبقي على المرضى: ${kpis.outstandingPatientBalances.toLocaleString()} ج.م`}
            formulaTooltip="النقدية المحصلة فعلياً = المبالغ المقبوضة فعلياً في الخزينة أو البنك أو انستاباي"
            badge={{
              text: kpis.outstandingPatientBalances > 0 ? 'يوجد آجل' : 'محصل بالكامل',
              variant: kpis.outstandingPatientBalances > 0 ? 'warning' : 'positive',
            }}
          />

          <MetricCard
            title={t.finance.operatingProfit}
            value={kpis.operatingProfit}
            subtitle={`هامش التشغيل: ${kpis.operatingProfitMargin.toFixed(1)}%`}
            formulaTooltip="صافي الربح التشغيلي = صافي الإيراد المكتسب - تكلفة الخامات - المعامل - أتعاب الأطباء - المصروفات الثابتة"
            badge={{
              text: kpis.operatingProfit >= 0 ? 'ربح تشغيلي' : 'عجز مؤقت',
              variant: kpis.operatingProfit >= 0 ? 'positive' : 'warning',
            }}
          />

          <MetricCard
            title={t.finance.breakEvenMonthly}
            value={kpis.breakEvenTarget}
            subtitle={`تكلفة ساعة الكرسي: ${chairMetrics.chairHourCost} ج.م/ساعة`}
            formulaTooltip="مستهدف نقطة التعادل = المصاريف التشغيلية الثابتة شهرياً الواجب تغطيتها"
            badge={{ text: 'هدف شهري', variant: 'accent' }}
          />
        </div>

        {/* SECONDARY COST BREAKDOWN KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t.finance.materialCost}
            value={kpis.directMaterialCost}
            subtitle="كمبوزيت، لاصق، ألياف، بنج"
            formulaTooltip="تكلفة الخامات المستهلكة فعلياً في الحالات المكتملة بناءً على أسعار وحدات الأساس"
          />

          <MetricCard
            title={t.finance.doctorPayout}
            value={kpis.doctorCompensation}
            subtitle="وفق عقود ونسب الأطباء المعتمدة"
            formulaTooltip="أتعاب الأطباء المستحقة = مجموع نسب الأطباء المحسوبة من إيرادات الحالات"
          />

          <MetricCard
            title={t.finance.inventoryValuation}
            value={kpis.inventoryValuation}
            subtitle="الرصيد الحي المتاح باللوتات"
            formulaTooltip="قيمة المخزون الإجمالية = مجموع (رصيد كل لوت متاح × تكلفة وحدة الأساس)"
            badge={{ text: 'أصل مخزني', variant: 'neutral' }}
          />

          <MetricCard
            title={t.finance.supplierPayables}
            value={kpis.supplierPayables}
            subtitle="مستحقات مؤجلة لموردي الخامات"
            formulaTooltip="حسابات الموردين الدائنة (Accounts Payable) الواجب سدادها"
            badge={{
              text: kpis.supplierPayables > 0 ? 'مستحق للموردين' : 'مسدد بالكامل',
              variant: kpis.supplierPayables > 0 ? 'warning' : 'positive',
            }}
          />
        </div>

        {/* CASH BALANCES BY ACCOUNT */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-navy-50 text-navy-800">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">
                أرصدة الخزينة والحسابات المالية النقدية (Cash Balances)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              الرصيد النقدي ≠ الأرباح التشغيلية
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {financialAccounts.map((acc: any) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {acc.nameAr || acc.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {acc.code} ({acc.accountType})
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-lg font-bold font-mono text-navy-900">
                    {acc.currentBalance.toLocaleString()}{' '}
                    <span className="text-xs text-slate-500">ج.م</span>
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 justify-end">
                    <CheckCircle2 className="w-3 h-3" /> مطابق
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INVENTORY ALERTS & EXPOSURE */}
        {(expiringLots.length > 0 || shortages.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiringLots.length > 0 && (
              <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>تنبيه لوتات تقترب من انتهاء الصلاحية (أقل من 90 يوماً)</span>
                </div>
                <div className="space-y-1.5">
                  {expiringLots.map((lot: any) => (
                    <div
                      key={lot.id}
                      className="text-xs bg-white/80 p-2 rounded-lg border border-amber-200 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          {lot.material?.name || 'خامة'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          لوت: {lot.lotNumber}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-amber-800 font-mono font-bold block">
                          {new Date(lot.expiryDate).toLocaleDateString('ar-EG')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          المتبقي: {lot.currentStockBaseUnits} {lot.material?.baseUnit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shortages.length > 0 && (
              <div className="bg-rose-50/80 rounded-xl border border-rose-200 p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>تنبيه خامات قاربت على النفاد (دون حد إعادة الطلب)</span>
                </div>
                <div className="space-y-1.5">
                  {shortages.map((m: any) => (
                    <div
                      key={m.id}
                      className="text-xs bg-white/80 p-2 rounded-lg border border-rose-200 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          {m.nameAr || m.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          SKU: {m.sku}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-rose-700 font-mono font-bold block">
                          دون حد {m.reorderThreshold} عبوة
                        </span>
                        <span className="text-[10px] text-slate-500">
                          يوصى بإصدار أمر شراء
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECENT PROCEDURES & AUDITABLE TRANSACTION LEDGER */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sage-600" />
                سجل الإجراءات السريرية والربحية المكتسبة الموثقة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع تفصيلي لكل حالة: السعر المفوتر، تكلفة الخامات المخصومة، عمولة الطبيب، وهامش المساهمة
              </p>
            </div>
            <button
              onClick={() => setIsProcedureModalOpen(true)}
              className="text-xs font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1"
            >
              <span>+ إضافة حالة جديدة</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">المريض</th>
                  <th className="py-2.5 px-3 text-start">الخدمة السريرية</th>
                  <th className="py-2.5 px-3 text-start">السن / السطح</th>
                  <th className="py-2.5 px-3 text-start">الطبيب</th>
                  <th className="py-2.5 px-3 text-end">السعر المفوتر</th>
                  <th className="py-2.5 px-3 text-end">تكلفة الخامات</th>
                  <th className="py-2.5 px-3 text-end">أتعاب الطبيب</th>
                  <th className="py-2.5 px-3 text-end">هامش المساهمة</th>
                  <th className="py-2.5 px-3 text-end">صافي الربح</th>
                  <th className="py-2.5 px-3 text-center">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {procedures.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-slate-400">
                      لا توجد إجراءات مسجلة بعد. استخدم زر "تسجيل إجراء سريري" بالأعلى.
                    </td>
                  </tr>
                ) : (
                  procedures.map((proc: any) => (
                    <tr key={proc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {proc.patient?.name || 'مريض'}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {proc.patient?.patientNumber}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {proc.service?.nameAr || proc.service?.name || 'خدمة'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {proc.toothNumber ? `#${proc.toothNumber}` : '—'}{' '}
                        {proc.surfaces && `(${proc.surfaces})`}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {proc.doctor?.nameAr || proc.doctor?.name}
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-900">
                        {proc.actualBilledPrice.toLocaleString()} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono text-rose-700 font-semibold">
                        {proc.directMaterialCost.toFixed(1)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono text-amber-700 font-semibold">
                        {proc.doctorCompensation.toFixed(1)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono text-emerald-700 font-bold">
                        {proc.contributionMargin.toFixed(1)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-end font-mono text-navy-800 font-bold">
                        {proc.fullOperatingProfit.toFixed(1)} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-400 text-[11px] font-mono">
                        {new Date(proc.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProcedureModal
        isOpen={isProcedureModalOpen}
        onClose={() => setIsProcedureModalOpen(false)}
        onSuccess={refreshData}
        patients={patients}
        doctors={doctors}
        services={services}
        materials={materials}
      />

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={refreshData}
        suppliers={suppliers}
        materials={materials}
        accounts={financialAccounts}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={refreshData}
        invoices={allInvoices}
        accounts={financialAccounts}
      />

      <PricingCalculatorModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        chairMinuteCost={chairMetrics.chairMinuteCost}
      />
    </div>
  );
}
