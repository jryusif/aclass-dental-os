'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, CheckCircle, AlertCircle, Stethoscope, Sparkles } from 'lucide-react';

interface ProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  patients: any[];
  doctors: any[];
  services: any[];
  materials: any[];
}

export default function ProcedureModal({
  isOpen,
  onClose,
  onSuccess,
  patients,
  doctors,
  services,
  materials,
}: ProcedureModalProps) {
  const { currentClinicId, t } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [toothNumber, setToothNumber] = useState('46');
  const [surfaces, setSurfaces] = useState('MOD');
  const [actualBilledPrice, setActualBilledPrice] = useState(1850);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [recipeConsumptions, setRecipeConsumptions] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update defaults when service changes
  useEffect(() => {
    const srv = services.find((s) => s.id === selectedServiceId);
    if (srv) {
      setActualBilledPrice(srv.standardPrice || 1850);
      setDurationMinutes(srv.durationMinutes || 45);

      // Auto-load recipe items
      const defaultRecipe = srv.recipes?.[0];
      if (defaultRecipe && defaultRecipe.items?.length > 0) {
        setRecipeConsumptions(
          defaultRecipe.items.map((it: any) => ({
            materialId: it.materialId,
            materialName: it.material?.name || 'Material',
            actualQuantity: it.standardQuantity,
            unit: it.unit,
            unitCost: it.material?.costPerBaseUnit || 0,
          }))
        );
      } else {
        // Fallback default consumption (e.g. 0.35g composite + 0.15ml bond)
        const comp = materials.find((m) => m.category === 'COMPOSITES') || materials[0];
        const bond = materials.find((m) => m.category === 'ADHESIVES') || materials[1];
        setRecipeConsumptions([
          {
            materialId: comp?.id,
            materialName: comp?.name || 'Composite',
            actualQuantity: 0.35,
            unit: comp?.baseUnit || 'G',
            unitCost: comp?.costPerBaseUnit || 0,
          },
          {
            materialId: bond?.id,
            materialName: bond?.name || 'Bond',
            actualQuantity: 0.15,
            unit: bond?.baseUnit || 'ML',
            unitCost: bond?.costPerBaseUnit || 0,
          },
        ]);
      }
    }
  }, [selectedServiceId, services, materials]);

  if (!isOpen) return null;

  // Real-time calculations
  const totalMaterialCost = recipeConsumptions.reduce(
    (acc, c) => acc + (Number(c.actualQuantity) || 0) * (Number(c.unitCost) || 0),
    0
  );
  const netRevenue = Math.max(0, actualBilledPrice - discountAmount);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const doctorRate = (selectedDoctor?.defaultCommissionRate || 35) / 100;
  const estimatedDoctorComp = netRevenue * doctorRate;
  const estimatedContribution = netRevenue - totalMaterialCost - estimatedDoctorComp;

  const handleQuantityChange = (idx: number, newQty: number) => {
    const updated = [...recipeConsumptions];
    updated[idx].actualQuantity = newQty;
    setRecipeConsumptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/procedures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: currentClinicId,
          patientId: selectedPatientId,
          doctorId: selectedDoctorId,
          serviceId: selectedServiceId,
          toothNumber,
          surfaces,
          actualBilledPrice,
          discountAmount,
          durationMinutes,
          consumptions: recipeConsumptions,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record procedure');

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sage-500/20 text-sage-400 border border-sage-500/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                تسجيل إنجاز إجراء سريري وحسم الخامات
              </h2>
              <p className="text-[11px] text-slate-300">
                تحميل تلقائي لوصفة الخامات الحيوية وحسمها من اللوتات بنظام FEFO
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المريض
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-sage-500"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patientNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الطبيب المعالج
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-sage-500"
                required
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameAr || d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نوع الإجراء / الخدمة السريرية
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-sage-500"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr || s.name} — السعر القياسي: {s.standardPrice} ج.م
                  </option>
                ))}
              </select>
            </div>

            {/* Tooth and Surfaces */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم السن (FDI notation)
              </label>
              <input
                type="text"
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
                placeholder="e.g. 16, 21, 36, 46"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-sage-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الأسطح المعالجة
              </label>
              <input
                type="text"
                value={surfaces}
                onChange={(e) => setSurfaces(e.target.value)}
                placeholder="MOD, DO, MO, Occlusal"
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-sage-500 font-mono"
              />
            </div>

            {/* Pricing Fields */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                السعر المحسوب على المريض (ج.م)
              </label>
              <input
                type="number"
                value={actualBilledPrice}
                onChange={(e) => setActualBilledPrice(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold text-navy-900 focus:ring-1 focus:ring-sage-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الخصم الممنوح (ج.م)
              </label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono text-slate-700 focus:ring-1 focus:ring-sage-500"
              />
            </div>
          </div>

          {/* Recipe & Consumed Materials Accordion */}
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                الخامات المستهلكة فعلياً (تخصم من المخزون بنظام FEFO)
              </span>
              <span className="text-xs font-mono font-bold text-sage-700">
                تكلفة الخامات: {totalMaterialCost.toFixed(2)} ج.م
              </span>
            </div>

            <div className="space-y-2">
              {recipeConsumptions.map((rc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs gap-3"
                >
                  <span className="font-medium text-slate-800 truncate flex-1">
                    {rc.materialName}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      step="0.01"
                      value={rc.actualQuantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      className="w-20 text-xs p-1 border border-slate-300 rounded font-mono text-center focus:ring-1 focus:ring-sage-500"
                    />
                    <span className="text-[11px] text-slate-500 font-mono w-8">
                      {rc.unit}
                    </span>
                    <span className="text-[11px] text-slate-700 font-mono font-medium w-16 text-end">
                      {((Number(rc.actualQuantity) || 0) * (Number(rc.unitCost) || 0)).toFixed(1)} ج.م
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Profit Preview */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-navy-50 rounded-lg border border-navy-100 text-center text-xs">
            <div>
              <p className="text-[10px] text-slate-500">صافي الإيراد المكتسب</p>
              <p className="font-bold text-navy-900 font-mono">{netRevenue} ج.م</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">عمولة الطبيب المتوقعة</p>
              <p className="font-bold text-amber-700 font-mono">
                {estimatedDoctorComp.toFixed(1)} ج.م ({selectedDoctor?.defaultCommissionRate || 35}%)
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">هامش المساهمة للعيادة</p>
              <p className="font-bold text-emerald-700 font-mono">
                {estimatedContribution.toFixed(1)} ج.م
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ملاحظات سريرية أو تشخيصية
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Immediate dentin sealing performed with SE Bond 2 + Majesty"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-1 focus:ring-sage-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-md shadow-sage-700/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الترحيل والحسم...' : 'تأكيد وترحيل الإجراء'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
