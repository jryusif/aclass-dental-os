'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Calculator, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { solveServicePrice, DoctorCommissionBase } from '@/lib/pricing-engine';

interface PricingCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chairMinuteCost?: number;
}

export default function PricingCalculatorModal({
  isOpen,
  onClose,
  chairMinuteCost = 1.717,
}: PricingCalculatorModalProps) {
  const { t } = useApp();

  const [directMaterialCost, setDirectMaterialCost] = useState(153.5);
  const [reusableInstrumentCost, setReusableInstrumentCost] = useState(25.0);
  const [singleUseConsumablesCost, setSingleUseConsumablesCost] = useState(30.0);
  const [procedureDurationMinutes, setProcedureDurationMinutes] = useState(50);
  const [laboratoryCost, setLaboratoryCost] = useState(0);
  const [laboratoryMarkupPercent, setLaboratoryMarkupPercent] = useState(0);
  const [doctorCommissionBase, setDoctorCommissionBase] = useState<DoctorCommissionBase>('COLLECTED_PRICE');
  const [doctorCommissionPercent, setDoctorCommissionPercent] = useState(38);
  const [clinicTargetMarginPercent, setClinicTargetMarginPercent] = useState(32);
  const [bufferContingencyPercent, setBufferContingencyPercent] = useState(5);
  const [taxPercent, setTaxPercent] = useState(0);

  if (!isOpen) return null;

  const result = solveServicePrice({
    directMaterialCost,
    reusableInstrumentCost,
    singleUseConsumablesCost,
    procedureDurationMinutes,
    chairMinuteCost,
    laboratoryCost,
    laboratoryMarkupPercent,
    doctorCommissionBase,
    doctorCommissionPercent,
    clinicTargetMarginPercent,
    bufferContingencyPercent,
    taxPercent,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sage-500/20 text-sage-400 border border-sage-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                محرك التسعير الجبري الموحد (Unified Pricing Engine)
              </h2>
              <p className="text-[11px] text-slate-300">
                حل المعادلة الجبرية لتحديد السعر الموصى به وهامش المساهمة بدقة رياضية صارمة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تكلفة الخامات المباشرة (ج.م)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={directMaterialCost}
                  onChange={(e) => setDirectMaterialCost(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  استهلاك السنابل والأدوات (ج.م)
                </label>
                <input
                  type="number"
                  step="1"
                  value={reusableInstrumentCost}
                  onChange={(e) => setReusableInstrumentCost(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  مستهلكات وحيدة الاستخدام (ج.م)
                </label>
                <input
                  type="number"
                  step="1"
                  value={singleUseConsumablesCost}
                  onChange={(e) => setSingleUseConsumablesCost(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  مدة شغل الكرسي (بالدقائق)
                </label>
                <input
                  type="number"
                  step="5"
                  value={procedureDurationMinutes}
                  onChange={(e) => setProcedureDurationMinutes(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  تكلفة المعمل / التركيبات (ج.م)
                </label>
                <input
                  type="number"
                  step="50"
                  value={laboratoryCost}
                  onChange={(e) => setLaboratoryCost(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  أساس احتساب عمولة الطبيب
                </label>
                <select
                  value={doctorCommissionBase}
                  onChange={(e) => setDoctorCommissionBase(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 font-medium"
                >
                  <option value="COLLECTED_PRICE">السعر المحصل (Collected)</option>
                  <option value="BILLED_PRICE">السعر المفوتر (Billed)</option>
                  <option value="PRICE_LESS_LAB">السعر بعد خصم المعمل</option>
                  <option value="PRICE_LESS_LAB_AND_MATERIALS">السعر بعد المعمل والخامات</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نسبة عمولة الطبيب (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={doctorCommissionPercent}
                  onChange={(e) => setDoctorCommissionPercent(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold text-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  هامش ربح العيادة المستهدف (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={clinicTargetMarginPercent}
                  onChange={(e) => setClinicTargetMarginPercent(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نسبة الطوارئ والتقلبات (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={bufferContingencyPercent}
                  onChange={(e) => setBufferContingencyPercent(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نسبة الضرائب (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-4">
            {!result.isValid ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>خطأ في التوزيع النسبي</span>
                </div>
                <p>{result.errorMessage}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-center p-3 bg-navy-900 text-white rounded-xl shadow-xs">
                  <p className="text-[11px] text-slate-300">السعر النهائي الموصى به</p>
                  <p className="text-3xl font-extrabold font-mono text-sage-400 mt-0.5">
                    {result.recommendedSellingPrice.toLocaleString()} <span className="text-sm text-slate-200">ج.م</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    يحقق هامش مساهمة {result.effectiveContributionMarginPercent}% وصافي ربح تشغيلي {result.effectiveNetMarginPercent}%
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>إجمالي التكاليف المباشرة:</span>
                    <span className="font-mono font-semibold text-slate-800">{result.directCostsTotal} ج.م</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>تحميل الكرسي ({procedureDurationMinutes} دقيقة):</span>
                    <span className="font-mono font-semibold text-slate-800">{result.allocatedOverhead} ج.م</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>سعر استرداد التكلفة الأدنى:</span>
                    <span className="font-mono font-semibold text-slate-700">{result.costRecoveryMinimumPrice} ج.م</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>أتعاب الطبيب المحسوبة:</span>
                    <span className="font-mono font-semibold text-amber-700">{result.doctorCompensationAmount} ج.م</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
                    <span>مبلغ الطوارئ والتقلبات:</span>
                    <span className="font-mono font-semibold text-slate-700">{result.bufferContingencyAmount} ج.م</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span className="font-bold text-navy-900">صافي ربح العيادة التشغيلي:</span>
                    <span className="font-mono font-bold text-emerald-700">{result.clinicNetOperatingProfit} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 bg-navy-850 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition-colors"
            >
              إغلاق الحاسبة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
