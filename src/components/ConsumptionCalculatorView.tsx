'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import {
  Calculator,
  Droplet,
  Layers,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Clock,
} from 'lucide-react';
import {
  calculateMaterialEstimation,
  estimateBondingProtocolCost,
} from '@/lib/consumption-estimator';

interface ConsumptionCalculatorViewProps {
  materials: any[];
}

export default function ConsumptionCalculatorView({
  materials,
}: ConsumptionCalculatorViewProps) {
  const { t } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<'bonding' | 'composite' | 'ribbond' | 'calibration'>('bonding');

  // Bonding Protocol State (Clearfil SE Bond 2)
  const [primerBottlePrice, setPrimerBottlePrice] = useState(1100);
  const [primerBottleMl, setPrimerBottleMl] = useState(6);
  const [bondBottlePrice, setBondBottlePrice] = useState(1300);
  const [bondBottleMl, setBondBottleMl] = useState(5);
  const [dropsPerMl, setDropsPerMl] = useState(48);
  const [primerDropsUsed, setPrimerDropsUsed] = useState(1);
  const [bondDropsUsed, setBondDropsUsed] = useState(1);
  const [microbrushesCount, setMicrobrushesCount] = useState(2);
  const [microbrushUnitPrice, setMicrobrushUnitPrice] = useState(1.8);

  const bondCalc = estimateBondingProtocolCost({
    primerBottlePrice,
    primerBottleMl,
    bondBottlePrice,
    bondBottleMl,
    dropsPerMl,
    primerDropsUsed,
    bondDropsUsed,
    microbrushesCount,
    microbrushUnitPrice,
  });

  // Composite Syringe State
  const [compPackagePrice, setCompPackagePrice] = useState(1200);
  const [compPackageGrams, setCompPackageGrams] = useState(4.9);
  const [compWastePercent, setCompWastePercent] = useState(6.0);
  const [compDosePerRestoration, setCompDosePerRestoration] = useState(0.35); // 0.35g
  const [compCurrentGramsInStock, setCompCurrentGramsInStock] = useState(14.7); // 3 syringes

  const compEst = calculateMaterialEstimation({
    packagePrice: compPackagePrice,
    packageQuantity: 1,
    packageUnit: 'SYRINGE',
    baseUnit: 'G',
    conversionFactor: compPackageGrams,
    unusableWastePercent: compWastePercent,
    averageQuantityPerCase: compDosePerRestoration,
    observedCasesCount: 25,
    totalMeasuredQuantityUsed: 8.9,
    evidenceLevel: 'MEASURED_CLINIC',
  });

  // Ribbond Fiber State
  const [ribbondPrice, setRibbondPrice] = useState(2200);
  const [ribbondRollMm, setRibbondRollMm] = useState(220); // 22 cm
  const [ribbondWastePercent, setRibbondWastePercent] = useState(8.0);
  const [ribbondLengthPerTooth, setRibbondLengthPerTooth] = useState(15); // 15 mm
  const [ribbondStockMm, setRibbondStockMm] = useState(220);

  const ribbondEst = calculateMaterialEstimation({
    packagePrice: ribbondPrice,
    packageQuantity: 1,
    packageUnit: 'ROLL',
    baseUnit: 'MM',
    conversionFactor: ribbondRollMm,
    unusableWastePercent: ribbondWastePercent,
    averageQuantityPerCase: ribbondLengthPerTooth,
    observedCasesCount: 12,
    totalMeasuredQuantityUsed: 175,
    evidenceLevel: 'PUBLISHED_EVIDENCE',
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={t.nav.consumption}
        subtitle="حاسبة استهلاك الخامات الجزئية، بروتوكولات اللواصق والألياف، والمعايرة السريرية الواقعية"
      />

      <div className="p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('bonding')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'bonding'
                ? 'border-sage-600 text-sage-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>نظام اللواصق (Primer & Bond Drops)</span>
          </button>

          <button
            onClick={() => setActiveTab('composite')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'composite'
                ? 'border-sage-600 text-sage-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>سرنجات الكمبوزيت والجرعات (Composites)</span>
          </button>

          <button
            onClick={() => setActiveTab('ribbond')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'ribbond'
                ? 'border-sage-600 text-sage-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>أشرطة ريبوند المقواة (Ribbond Fibers)</span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'calibration'
                ? 'border-sage-600 text-sage-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>المعايرة الإحصائية للحالات الواقعية</span>
          </button>
        </div>

        {/* TAB 1: BONDING SYSTEMS */}
        {activeTab === 'bonding' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-sage-600" />
                معايرة قطرات لاصق Clearfil SE Bond 2 (Primer vs Bond)
              </h3>
              <p className="text-xs text-slate-500">
                حساب تكلفة البروتوكول اللاصق بدقة بعدد القطرات المنفصلة للبرايمر والبوند وتكلفة الميكروبرش
              </p>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر عبوة البرايمر (Primer 6ml)
                  </label>
                  <input
                    type="number"
                    value={primerBottlePrice}
                    onChange={(e) => setPrimerBottlePrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر عبوة البوند (Bond 5ml)
                  </label>
                  <input
                    type="number"
                    value={bondBottlePrice}
                    onChange={(e) => setBondBottlePrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    متوسط عدد القطرات بالمليلتر (Drops / ml)
                  </label>
                  <input
                    type="number"
                    value={dropsPerMl}
                    onChange={(e) => setDropsPerMl(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر الميكروبرش الواحدة (ج.م)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={microbrushUnitPrice}
                    onChange={(e) => setMicrobrushUnitPrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    قطرات البرايمر المستهلكة بالحالة
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={primerDropsUsed}
                    onChange={(e) => setPrimerDropsUsed(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    قطرات البوند المستهلكة بالحالة
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={bondDropsUsed}
                    onChange={(e) => setBondDropsUsed(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-850 text-white p-5 rounded-xl shadow-md flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-sage-300 uppercase">
                  التكلفة الدقيقة للبروتوكول اللاصق للحالة
                </span>
                <p className="text-3xl font-extrabold font-mono text-sage-400 mt-1">
                  {bondCalc.totalProtocolCost.toFixed(2)}{' '}
                  <span className="text-sm font-sans text-slate-300">ج.م / ترميم</span>
                </p>
                <p className="text-xs text-slate-300 mt-2">
                  شاملة {primerDropsUsed} قطرة برايمر + {bondDropsUsed} قطرة بوند + {microbrushesCount} ميكروبرش
                </p>
              </div>

              <div className="space-y-2 text-xs pt-4 border-t border-navy-700 text-slate-200">
                <div className="flex justify-between">
                  <span>تكلفة قطرة البرايمر الواحدة:</span>
                  <span className="font-mono font-bold text-white">{bondCalc.costPerPrimerDrop} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>تكلفة قطرة البوند الواحدة:</span>
                  <span className="font-mono font-bold text-white">{bondCalc.costPerBondDrop} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي عدد قطرات زجاجة البرايمر:</span>
                  <span className="font-mono text-slate-300">{primerBottleMl * dropsPerMl} قطرة</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي عدد قطرات زجاجة البوند:</span>
                  <span className="font-mono text-slate-300">{bondBottleMl * dropsPerMl} قطرة</span>
                </div>
              </div>

              <div className="p-2.5 bg-navy-800/80 rounded-lg border border-navy-700 text-[11px] text-slate-300">
                قاعدة سريرية: تجنب إفراز قطرات زائدة في طبق المزج (Dappen dish) لتقليل الفاقد الناتج عن تبخر المذيبات.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPOSITE SYRINGES */}
        {activeTab === 'composite' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sage-600" />
                حاسبة سرنجات الكمبوزيت عالي الكثافة (Clearfil Majesty / G-ænial)
              </h3>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر شراء السرنجة (ج.م)
                  </label>
                  <input
                    type="number"
                    value={compPackagePrice}
                    onChange={(e) => setCompPackagePrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    وزن المادة الصافي بالسرنجة (جرام)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={compPackageGrams}
                    onChange={(e) => setCompPackageGrams(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نسبة الفاقد المتبقي بالسرنجة (% Waste)
                  </label>
                  <input
                    type="number"
                    value={compWastePercent}
                    onChange={(e) => setCompWastePercent(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الجرعة المستهلكة لكل حشوة (جرام)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={compDosePerRestoration}
                    onChange={(e) => setCompDosePerRestoration(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-850 text-white p-5 rounded-xl shadow-md flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-sage-300 uppercase">
                  التكلفة المتوقعة للحشوة الواحدة
                </span>
                <p className="text-3xl font-extrabold font-mono text-sage-400 mt-1">
                  {compEst.expectedCostPerApplication.toFixed(2)}{' '}
                  <span className="text-sm font-sans text-slate-300">ج.م / حالة</span>
                </p>
                <p className="text-xs text-slate-300 mt-2">
                  سعر الجرام الصافي: {compEst.effectiveBaseUnitCost} ج.م / جرام
                </p>
              </div>

              <div className="space-y-2 text-xs pt-4 border-t border-navy-700 text-slate-200">
                <div className="flex justify-between">
                  <span>عدد الحالات النظرية للسرنجة:</span>
                  <span className="font-mono text-white">{compEst.theoreticalApplicationsPerPackage} حالة</span>
                </div>
                <div className="flex justify-between">
                  <span>عدد الحالات الصالحة فعلياً بعد الفاقد:</span>
                  <span className="font-mono font-bold text-sage-300">{compEst.usableApplicationsPerPackage} حالة</span>
                </div>
                <div className="flex justify-between">
                  <span>الحالات المتبقية في رصيد المخزون الحالي:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {compEst.currentStockApplicationsEstimate(compCurrentGramsInStock)} حالة ترميم
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-navy-800/80 rounded-lg border border-navy-700 text-[11px] text-slate-300">
                معايرة إحصائية: {compEst.calibration.recommendation}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RIBBOND FIBERS */}
        {activeTab === 'ribbond' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-sage-600" />
                حاسبة أشرطة ريبوند المقواة (Ribbond THM 2mm Fiber Ribbon)
              </h3>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    سعر شراء لفة ريبوند (ج.م)
                  </label>
                  <input
                    type="number"
                    value={ribbondPrice}
                    onChange={(e) => setRibbondPrice(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    طول اللفة الكلي بالمليمتر (22 سم = 220 مم)
                  </label>
                  <input
                    type="number"
                    value={ribbondRollMm}
                    onChange={(e) => setRibbondRollMm(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نسبة فاقد القص وتطهير الأطراف (%)
                  </label>
                  <input
                    type="number"
                    value={ribbondWastePercent}
                    onChange={(e) => setRibbondWastePercent(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الطول المستهلك لكل سن في البايوبيز (مم)
                  </label>
                  <input
                    type="number"
                    value={ribbondLengthPerTooth}
                    onChange={(e) => setRibbondLengthPerTooth(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-navy-900 to-navy-850 text-white p-5 rounded-xl shadow-md flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-sage-300 uppercase">
                  تكلفة تدعيم السن بألياف ريبوند
                </span>
                <p className="text-3xl font-extrabold font-mono text-sage-400 mt-1">
                  {ribbondEst.expectedCostPerApplication.toFixed(2)}{' '}
                  <span className="text-sm font-sans text-slate-300">ج.م / سن</span>
                </p>
                <p className="text-xs text-slate-300 mt-2">
                  سعر المليمتر الواحد: {ribbondEst.effectiveBaseUnitCost} ج.م / مم
                </p>
              </div>

              <div className="space-y-2 text-xs pt-4 border-t border-navy-700 text-slate-200">
                <div className="flex justify-between">
                  <span>عدد الأسنان المستفيدة من اللفة:</span>
                  <span className="font-mono font-bold text-sage-300">{ribbondEst.usableApplicationsPerPackage} سن</span>
                </div>
                <div className="flex justify-between">
                  <span>فاقد القص المقدر:</span>
                  <span className="font-mono text-slate-400">
                    {((ribbondRollMm * ribbondWastePercent) / 100).toFixed(1)} مم
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-navy-800/80 rounded-lg border border-navy-700 text-[11px] text-slate-300">
                توجيه سريري: استخدام مقص ريبوند الكربيدي المخصص لتجنب تلف وتشقق أطراف النسيج المنسوج المتقاطع.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REAL-WORLD CALIBRATION */}
        {activeTab === 'calibration' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  المعايرة السريرية الواقعية (Clinical Calibration Ledger)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مقارنة الاستهلاك التقديري النظري بالاستهلاك الفعلي المقاس عبر حالات عيادة إيه كلاس الموثقة
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">الخامة الحيوية</th>
                    <th className="py-2.5 px-3 text-center">الاستهلاك المعياري التقديري</th>
                    <th className="py-2.5 px-3 text-center">متوسط الاستهلاك المقاس</th>
                    <th className="py-2.5 px-3 text-center">عدد الحالات المرصودة</th>
                    <th className="py-2.5 px-3 text-center">نسبة التباين (Variance)</th>
                    <th className="py-2.5 px-3 text-center">حالة العينة</th>
                    <th className="py-2.5 px-3 text-start">التوصية السريرية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      Clearfil Majesty Posterior A2
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">0.350 g</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-navy-900">0.356 g</td>
                    <td className="py-3 px-3 text-center font-mono">25 حالة</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">+1.7%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        معايرة ممتازة
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      التوافق وثيق مع الأساس التقديري. الاستمرار في نفس المعايير.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      GC EverX Flow Dentin
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">0.400 g</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-navy-900">0.445 g</td>
                    <td className="py-3 px-3 text-center font-mono">18 حالة</td>
                    <td className="py-3 px-3 text-center font-mono text-amber-700 font-bold">+11.2%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        عينة تمهيدية
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      استهلاك أعلى قليلاً في حالات التجويف العميق. يوصى بمراجعة سماكة طبقة الفلو.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      Ribbond THM 2mm
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium">15.0 mm</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-navy-900">14.6 mm</td>
                    <td className="py-3 px-3 text-center font-mono">12 حالة</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-700 font-bold">-2.6%</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        معايرة أولية
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      استهلاك دقيق ومطابق لقياسات عمق التجويف (Cusp Bio-base).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
