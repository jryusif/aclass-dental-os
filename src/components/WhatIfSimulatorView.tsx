'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  ArrowRight,
  Save,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
} from 'lucide-react';
import { calculateChairCost, solveServicePrice } from '@/lib/pricing-engine';
import { calculateBreakEven } from '@/lib/break-even';

interface WhatIfSimulatorViewProps {
  clinic: any;
  services: any[];
  savedScenarios: any[];
}

export default function WhatIfSimulatorView({
  clinic,
  services,
  savedScenarios: initialScenarios,
}: WhatIfSimulatorViewProps) {
  const { t } = useApp();
  const [scenarios, setScenarios] = useState(initialScenarios);

  // Baseline Constants
  const baseRent = 14000;
  const baseSalaries = 12000;
  const baseUtilities = 4000;
  const baseFixedExpenses = clinic.monthlyFixedExpenses || 30000;
  const baseChairs = clinic.activeChairs || 2;
  const baseHours = clinic.dailyWorkingHours || 8;
  const baseDays = clinic.workingDaysPerMonth || 26;
  const baseOccupancy = clinic.occupancyRate || 0.70;
  const baseDoctorCommission = 35;
  const baseTargetMargin = 30;
  const baseBuffer = 5;

  // Simulator Interactive States
  const [rent, setRent] = useState(baseRent);
  const [salaries, setSalaries] = useState(baseSalaries);
  const [utilities, setUtilities] = useState(baseUtilities);
  const [chairs, setChairs] = useState(baseChairs);
  const [occupancyRate, setOccupancyRate] = useState(baseOccupancy);
  const [doctorCommissionPercent, setDoctorCommissionPercent] = useState(baseDoctorCommission);
  const [targetMarginPercent, setTargetMarginPercent] = useState(baseTargetMargin);
  const [bufferPercent, setBufferPercent] = useState(baseBuffer);

  const [scenarioTitle, setScenarioTitle] = useState('سيناريو رفع إشغال الكراسي إلى 85% مع زيادة الإيجار');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Computations:
  const simFixedExpenses = rent + salaries + utilities;

  // Baseline Chair Cost
  const baseChair = calculateChairCost({
    activeChairs: baseChairs,
    workingDaysPerMonth: baseDays,
    dailyWorkingHours: baseHours,
    occupancyRate: baseOccupancy,
    monthlyFixedExpenses: baseFixedExpenses,
  });

  // Simulated Chair Cost
  const simChair = calculateChairCost({
    activeChairs: chairs,
    workingDaysPerMonth: baseDays,
    dailyWorkingHours: baseHours,
    occupancyRate: occupancyRate,
    monthlyFixedExpenses: simFixedExpenses,
  });

  // Break-Even Baseline vs Simulated
  const baseBreakEven = calculateBreakEven({
    monthlyFixedExpenses: baseFixedExpenses,
    averageRevenuePerProcedure: 1850,
    averageVariableCostPerProcedure: 925,
    workingDaysPerMonth: baseDays,
    activeChairs: baseChairs,
  });

  const simBreakEven = calculateBreakEven({
    monthlyFixedExpenses: simFixedExpenses,
    averageRevenuePerProcedure: 1850,
    averageVariableCostPerProcedure: 1850 * (doctorCommissionPercent / 100) + 200,
    workingDaysPerMonth: baseDays,
    activeChairs: chairs,
  });

  // Calculate prices for a sample Biomimetic Class II Restoration
  const baseClass2Price = solveServicePrice({
    directMaterialCost: 153.5,
    reusableInstrumentCost: 25,
    singleUseConsumablesCost: 30,
    procedureDurationMinutes: 50,
    chairMinuteCost: baseChair.chairMinuteCost,
    laboratoryCost: 0,
    doctorCommissionBase: 'COLLECTED_PRICE',
    doctorCommissionPercent: baseDoctorCommission,
    clinicTargetMarginPercent: baseTargetMargin,
    bufferContingencyPercent: baseBuffer,
  });

  const simClass2Price = solveServicePrice({
    directMaterialCost: 153.5,
    reusableInstrumentCost: 25,
    singleUseConsumablesCost: 30,
    procedureDurationMinutes: 50,
    chairMinuteCost: simChair.chairMinuteCost,
    laboratoryCost: 0,
    doctorCommissionBase: 'COLLECTED_PRICE',
    doctorCommissionPercent: doctorCommissionPercent,
    clinicTargetMarginPercent: targetMarginPercent,
    bufferContingencyPercent: bufferPercent,
  });

  const resetToBaseline = () => {
    setRent(baseRent);
    setSalaries(baseSalaries);
    setUtilities(baseUtilities);
    setChairs(baseChairs);
    setOccupancyRate(baseOccupancy);
    setDoctorCommissionPercent(baseDoctorCommission);
    setTargetMarginPercent(baseTargetMargin);
    setBufferPercent(baseBuffer);
  };

  const handleSaveScenario = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: clinic.id,
          title: scenarioTitle,
          baseParameters: {
            rent,
            salaries,
            utilities,
            chairs,
            occupancyRate,
            doctorCommissionPercent,
            targetMarginPercent,
            bufferPercent,
            simFixedExpenses,
          },
          comparisonResults: {
            simChairHourCost: simChair.chairHourCost,
            simBreakEvenCases: simBreakEven.breakEvenProceduresMonthly,
            simRecommendedPriceClass2: simClass2Price.recommendedSellingPrice,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={t.nav.simulator}
        subtitle="محاكي التسعير وماذا لو التفاعلي: دراسة أثر تغيير الإيجار، الرواتب، الكراسي، ونسب الأطباء على نقطة التعادل وهوامش الربح دون التأثير على القوائم المعتمدة"
      />

      <div className="p-6 space-y-6">
        {/* Top Summary Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              تكلفة ساعة الكرسي (Chair-Hour Cost)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-navy-900">
                {simChair.chairHourCost} ج.م
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">
                {baseChair.chairHourCost} ج.م
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {simChair.chairHourCost > baseChair.chairHourCost ? (
                <span className="text-rose-600 font-bold">
                  زيادة +{(simChair.chairHourCost - baseChair.chairHourCost).toFixed(1)} ج.م/ساعة
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">
                  وفورات -{(baseChair.chairHourCost - simChair.chairHourCost).toFixed(1)} ج.م/ساعة
                </span>
              )}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              حالات نقطة التعادل الشهرية
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-navy-900">
                {simBreakEven.breakEvenProceduresMonthly} حالة/شهر
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">
                {baseBreakEven.breakEvenProceduresMonthly} حالة
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              معدل يومي: {simBreakEven.breakEvenProceduresPerDay} حالة / يوم عمل
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">
              السعر المقترح لحشوة صنف ثاني حيوية
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-sage-800">
                {simClass2Price.recommendedSellingPrice} ج.م
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">
                {baseClass2Price.recommendedSellingPrice} ج.م
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              هامش مساهمة مقدر: {simClass2Price.effectiveContributionMarginPercent}%
            </p>
          </div>
        </div>

        {/* Simulator Controls & Scenario Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sage-600" />
                <h3 className="text-sm font-bold text-navy-900">
                  لوحة تعديل المتغيرات الافتراضية للسيناريو
                </h3>
              </div>
              <button
                onClick={resetToBaseline}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تعيين للأصل</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Rent */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>إيجار العيادة الشهري (ج.م):</span>
                  <span className="font-mono text-navy-900">{rent.toLocaleString()} ج.م</span>
                </div>
                <input
                  type="range"
                  min="8000"
                  max="30000"
                  step="500"
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                  className="w-full accent-navy-800"
                />
              </div>

              {/* Salaries */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>رواتب التمريض والإدارة الثابتة (ج.م):</span>
                  <span className="font-mono text-navy-900">{salaries.toLocaleString()} ج.م</span>
                </div>
                <input
                  type="range"
                  min="6000"
                  max="25000"
                  step="500"
                  value={salaries}
                  onChange={(e) => setSalaries(Number(e.target.value))}
                  className="w-full accent-navy-800"
                />
              </div>

              {/* Chairs Count */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>عدد الكراسي النشطة بالعيادة:</span>
                  <span className="font-mono text-navy-900">{chairs} كراسي</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={chairs}
                  onChange={(e) => setChairs(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
              </div>

              {/* Occupancy Rate */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>معدل إشغال الكرسي الفعلي (%):</span>
                  <span className="font-mono text-navy-900">{(occupancyRate * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.95"
                  step="0.05"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(Number(e.target.value))}
                  className="w-full accent-sage-600"
                />
              </div>

              {/* Doctor Commission */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>نسبة عمولة الطبيب المقترحة (%):</span>
                  <span className="font-mono text-amber-700 font-bold">{doctorCommissionPercent}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="55"
                  step="1"
                  value={doctorCommissionPercent}
                  onChange={(e) => setDoctorCommissionPercent(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Target Margin */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>هامش ربح العيادة المستهدف (%):</span>
                  <span className="font-mono text-emerald-700 font-bold">{targetMarginPercent}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Save Scenario Box */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                placeholder="عنوان السيناريو للمقارنة..."
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-sage-500"
              />
              <button
                onClick={handleSaveScenario}
                disabled={isSaving}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-navy-850 hover:bg-navy-900 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ السيناريو'}</span>
              </button>
            </div>
            {saveSuccess && (
              <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-4 h-4" />
                تم حفظ السيناريو بنجاح في قاعدة البيانات دون المساس بقائمة الأسعار المعتمدة.
              </p>
            )}
          </div>

          {/* Side Audit Card */}
          <div className="lg:col-span-4 bg-navy-900 text-white p-5 rounded-xl shadow-md flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-sage-300 font-bold">
                حساب الأثر المالي التراكمي
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                إجمالي المصاريف الثابتة بعد المحاكاة
              </h4>
              <p className="text-3xl font-extrabold font-mono text-sage-400 mt-2">
                {simFixedExpenses.toLocaleString()} <span className="text-sm text-slate-300">ج.م / شهر</span>
              </p>
              <p className="text-xs text-slate-300 mt-2">
                الفرق عن الأساس: {(simFixedExpenses - baseFixedExpenses > 0 ? '+' : '')}
                {(simFixedExpenses - baseFixedExpenses).toLocaleString()} ج.م
              </p>
            </div>

            <div className="space-y-2 text-xs pt-4 border-t border-navy-700 text-slate-200">
              <div className="flex justify-between">
                <span>ساعات الكرسي المنتجة شهرياً:</span>
                <span className="font-mono text-white">{simChair.productiveOccupiedHours} ساعة</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة دقيقة الكرسي:</span>
                <span className="font-mono font-bold text-sage-300">{simChair.chairMinuteCost} ج.م/دقيقة</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الإيراد المطلوب للتعادل:</span>
                <span className="font-mono font-bold text-amber-300">
                  {simBreakEven.breakEvenRevenueMonthly.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <div className="p-3 bg-navy-800/80 rounded-lg border border-navy-700 text-[11px] text-slate-300">
              مبدأ المحاسبة: لا يتم اعتماد أسعار السيناريو كقائمة رسمية إلا بعد تحويلها لنسخة Draft واعتمادها رسمياً من مدير العيادة.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
