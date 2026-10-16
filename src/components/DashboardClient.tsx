'use client';

import React, { useState } from 'react';
import Header from './Header';
import PricingCalculatorModal from './PricingCalculatorModal';
import GuideTooltip from './GuideTooltip';
import Link from 'next/link';
import {
  Clock,
  Sparkles,
  Stethoscope,
  FlaskConical,
  Wrench,
  Wallet,
  TrendingUp,
  Plus,
  Calculator,
  Building2,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface DashboardClientProps {
  initialData: any;
  materials: any[];
  services: any[];
  patients?: any[];
  doctors?: any[];
  suppliers?: any[];
}

export default function DashboardClient({
  initialData,
  materials,
  services,
}: DashboardClientProps) {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const { chairMetrics, clinic } = initialData;

  // Chair metrics
  const chairHourCost = chairMetrics?.chairHourCost || 153.8;
  const minuteCost = chairMetrics?.chairMinuteCost || (chairHourCost / 60);
  const monthlyFixedExpenses = clinic?.monthlyFixedExpenses || 30000;
  const activeChairs = clinic?.activeChairs || 2;
  const dailyHours = clinic?.dailyWorkingHours || 8;
  const workingDays = clinic?.workingDaysPerMonth || 26;
  const occupancyRate = clinic?.occupancyRate || 0.70;

  // Active Branch Name
  const branchName = clinic?.nameAr || clinic?.name || 'فرع كوم امبو';

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="لوحة حسابات التكاليف وساعة التشغيل (Operating Cost & Pricing Hub)"
        subtitle={`حساب دقيق لتكلفة ساعة الكرسي، استهلاك الخامات، وتسعير الخدمات لـ ${branchName}`}
      />

      <div className="p-6 space-y-6">
        {/* Branch Context Banner & Quick Actions */}
        <div className="bg-gradient-to-l from-navy-900 via-navy-850 to-teal-950 text-white rounded-2xl p-6 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                الفرع النشط حالياً
              </span>
              <span className="text-xs text-slate-300">
                {clinic?.location || 'كوم امبو - أسوان'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              {branchName}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              يقوم النظام تلقائياً بدمج تكلفة الخامات المستهلكة + تكلفة الدقيقة للكرسي + التعقيم لحساب السعر الموصى به لكل خدمة مع ضمان هامش ربحك الصافي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>حساب تسعيرة خدمة سريرية</span>
            </button>

            <Link
              href="/simulator"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-teal-300" />
              <span>محاكي التسعير وماذا لو</span>
            </Link>
          </div>
        </div>

        {/* 4 CORE COST & OVERHEAD METRIC CARDS WITH GUIDE TOOLTIPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Chair-Hour Rate */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">تكلفة ساعة الكرسي المباشرة</span>
              <GuideTooltip topicId="occupancyRate" label="دليل ساعة الكرسي" />
            </div>
            <p className="text-3xl font-black font-mono text-navy-950">
              {chairHourCost.toFixed(1)} <span className="text-sm font-sans font-normal text-slate-500">ج.م/ساعة</span>
            </p>
            <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              تكلفة كل دقيقة سريرية: {minuteCost.toFixed(2)} ج.م/دقيقة
            </p>
          </div>

          {/* 2. Monthly Fixed Expenses (Overhead) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">المصروفات الثابتة والمرتبات</span>
              <GuideTooltip topicId="breakEvenTarget" label="دليل التكاليف الثابتة" />
            </div>
            <p className="text-3xl font-black font-mono text-navy-950">
              {monthlyFixedExpenses.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-500">ج.م/شهر</span>
            </p>
            <p className="text-[11px] text-slate-500">
              إيجار المقر، مرتبات الطاقم، الكهرباء، والصيانة
            </p>
          </div>

          {/* 3. Operational Capacity (Chairs & Hours) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">الطاقة التشغيلية للكراسي</span>
              <GuideTooltip topicId="dailyWorkingHours" label="دليل ساعات العمل" />
            </div>
            <p className="text-3xl font-black font-mono text-navy-950">
              {activeChairs} <span className="text-sm font-sans font-normal text-slate-500">كراسي فعال</span>
            </p>
            <p className="text-[11px] text-slate-500">
              {dailyHours} ساعات يومياً • {workingDays} يوم/شهر • إشغال {(occupancyRate * 100).toFixed(0)}%
            </p>
          </div>

          {/* 4. Target Margin Standard */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">هامش الربح الصافي المستهدف</span>
              <GuideTooltip topicId="clinicMargin" label="دليل هامش الربح" />
            </div>
            <p className="text-3xl font-black font-mono text-emerald-700">
              40% <span className="text-sm font-sans font-normal text-slate-500">صافي العيادة</span>
            </p>
            <p className="text-[11px] text-emerald-700/90 font-medium">
              النسبة الموصى بها أكاديمياً لطب الأسنان الحيوي
            </p>
          </div>
        </div>

        {/* SECTION 1: SERVICES & ACCURATE PRICING TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                دليل الخدمات السريرية وتفاصيل حساب التكلفة والتسعير
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                حساب آلي للتكلفة: (الخامات المستهلكة + وقت الكرسي + التعقيم) ⬅️ ثم احتساب السعر المقترح لتحقيق هامش الربح
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/services"
                className="text-xs text-teal-700 hover:text-teal-900 font-bold px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
              >
                إدارة كافة الخدمات بالتفصيل ⬅️
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-start">اسم الخدمة السريرية</th>
                  <th className="py-3 px-3 text-center">وقت الكرسي</th>
                  <th className="py-3 px-3 text-end">تكلفة الخامات</th>
                  <th className="py-3 px-3 text-end">تكلفة وقت الكرسي</th>
                  <th className="py-3 px-3 text-end">تكلفة التعقيم</th>
                  <th className="py-3 px-3 text-end font-bold text-navy-900">إجمالي التكلفة</th>
                  <th className="py-3 px-3 text-end font-bold text-teal-800">السعر المقترح</th>
                  <th className="py-3 px-3 text-center">هامش الربح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((srv: any) => {
                  const minutes = srv.defaultDurationMinutes || 45;
                  const chairCostForService = minutes * minuteCost;
                  const matCost = srv.defaultDirectMaterialCost || 120;
                  const sterilizationCost = srv.defaultSterilizationCost || 75;
                  const totalCost = matCost + chairCostForService + sterilizationCost;
                  const targetPrice = srv.basePrice || Math.round(totalCost / 0.60);
                  const netProfit = targetPrice - totalCost;
                  const marginPct = targetPrice > 0 ? (netProfit / targetPrice) * 100 : 40;

                  return (
                    <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-navy-900 block">{srv.nameAr || srv.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{srv.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {minutes} دقيقة
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end font-mono text-slate-700">
                        {matCost.toFixed(1)} ج.م
                      </td>
                      <td className="py-3 px-3 text-end font-mono text-slate-700">
                        {chairCostForService.toFixed(1)} ج.م
                      </td>
                      <td className="py-3 px-3 text-end font-mono text-slate-700">
                        {sterilizationCost.toFixed(1)} ج.م
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-navy-950 bg-slate-50/50">
                        {totalCost.toFixed(1)} ج.م
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-black text-teal-800 text-sm bg-teal-50/40">
                        {targetPrice.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {marginPct.toFixed(0)}% صافي
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: MATERIALS & PACKAGING DOSING LIBRARY */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-600" />
                مكتبة الخامات والأدوات وأسعار الشراء وتكلفة الجرعة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                سعر العبوة الإجمالية وحجمها وتكلفة الجرعة الواحدة (بالقطرة، الجرام، أو المليمتر)
              </p>
            </div>

            <Link
              href="/materials"
              className="text-xs text-teal-700 hover:text-teal-900 font-bold px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              عرض وتعديل الخامات والأحجام ⬅️
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-start">اسم المادة / الأداة</th>
                  <th className="py-3 px-3 text-center">التصنيف السريري</th>
                  <th className="py-3 px-3 text-center">نوع وسعة العبوة</th>
                  <th className="py-3 px-3 text-end">سعر شراء العبوة</th>
                  <th className="py-3 px-3 text-end font-bold text-teal-800">تكلفة وحدة الجرعة</th>
                  <th className="py-3 px-3 text-center">معامل الفاقد المعتمد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.slice(0, 8).map((mat: any) => {
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-navy-900 block">{mat.nameAr || mat.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{mat.name}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {mat.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {mat.packageSize} {mat.packageUnit} ({mat.conversionFactor} {mat.baseUnit})
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-semibold text-slate-800">
                        {mat.defaultPurchasePrice?.toLocaleString()} ج.م
                      </td>
                      <td className="py-3 px-3 text-end font-mono font-bold text-teal-800 text-xs bg-teal-50/30">
                        {mat.unitCostBaseUnit?.toFixed(2)} ج.م / {mat.baseUnit}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-slate-600">{mat.wastePercentage}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: FIXED EXPENSES & EQUIPMENT BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses & Salaries Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-teal-600" />
                بنود المصروفات الثابتة والمرتبات ({branchName})
              </h3>
              <Link
                href="/expenses"
                className="text-xs text-teal-700 hover:text-teal-900 font-bold"
              >
                تعديل البنود ⬅️
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">إيجار مقر الفرع الشهري:</span>
                <span className="font-mono font-bold text-navy-900">14,000 ج.م</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">رواتب التمريض والسكرتارية والمعاونين:</span>
                <span className="font-mono font-bold text-navy-900">12,000 ج.م</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">الكهرباء، المياه، والإنترنت والبرمجيات:</span>
                <span className="font-mono font-bold text-navy-900">4,000 ج.م</span>
              </div>
              <div className="flex justify-between p-2.5 bg-teal-50 border border-teal-200 rounded-lg font-bold">
                <span className="text-teal-900">إجمالي المصروفات الثابتة الداخلة في ساعة الكرسي:</span>
                <span className="font-mono text-teal-950">{monthlyFixedExpenses.toLocaleString()} ج.م / شهر</span>
              </div>
            </div>
          </div>

          {/* Equipment & Depreciation Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                الأجهزة السريرية وإهلاكها المحسوب
              </h3>
              <Link
                href="/assets"
                className="text-xs text-teal-700 hover:text-teal-900 font-bold"
              >
                سجل الأجهزة بالكامل ⬅️
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">وحدة أسنان شاملة (Dental Chair Unit):</span>
                <span className="font-mono font-bold text-slate-800">قسط إهلاك: 1,500 ج.م/شهر</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">جهاز تعقيم فئة B (Class B Autoclave):</span>
                <span className="font-mono font-bold text-slate-800">قسط إهلاك: 850 ج.م/شهر</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-600">جهاز أشعة رقمي وسنسور (Digital RVG Sensor):</span>
                <span className="font-mono font-bold text-slate-800">قسط إهلاك: 900 ج.م/شهر</span>
              </div>
              <div className="flex justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-lg font-bold">
                <span className="text-amber-900">احتياطي الإهلاك الشهري لتجديد الأجهزة:</span>
                <span className="font-mono text-amber-950">3,250 ج.م / شهر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Calculator Modal */}
      {isPricingModalOpen && (
        <PricingCalculatorModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          chairHourCost={chairHourCost}
          materials={materials}
        />
      )}
    </div>
  );
}
