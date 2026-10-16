'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, CheckCircle, AlertCircle, Truck, PackagePlus } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  suppliers: any[];
  materials: any[];
  accounts: any[];
}

export default function PurchaseModal({
  isOpen,
  onClose,
  onSuccess,
  suppliers,
  materials,
  accounts,
}: PurchaseModalProps) {
  const { currentClinicId, t } = useApp();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || '');
  const [lotNumber, setLotNumber] = useState(`LOT-${new Date().getFullYear()}-01`);
  const [expiryDate, setExpiryDate] = useState('2028-06-30');
  const [packagesCount, setPackagesCount] = useState(2);
  const [packagePrice, setPackagePrice] = useState(1200);
  const [isPaidNow, setIsPaidNow] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);
  const totalPackages = Number(packagesCount) || 1;
  const pkgPrice = Number(packagePrice) || 0;
  const totalPurchaseCost = totalPackages * pkgPrice;
  const totalBaseUnits = totalPackages * (selectedMaterial?.conversionFactor || 1);
  const costPerBaseUnit = totalBaseUnits > 0 ? totalPurchaseCost / totalBaseUnits : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: currentClinicId,
          supplierId: selectedSupplierId,
          materialId: selectedMaterialId,
          lotNumber,
          expiryDate,
          packagesCount,
          packagePrice,
          isPaidNow,
          financialAccountId: isPaidNow ? selectedAccountId : null,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record purchase');

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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-navy-800 text-sage-400 border border-navy-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                استلام شحنة خامات وتوليد لوت مخزني
              </h2>
              <p className="text-[11px] text-slate-300">
                تسجيل تاريخ الصلاحية وحساب تكلفة وحدة الأساس دون المساس بفواتير المرضى التاريخية
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المورد المعتمد
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-sage-500"
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الخامة المستلمة
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => {
                  setSelectedMaterialId(e.target.value);
                  const m = materials.find((mat) => mat.id === e.target.value);
                  if (m) setPackagePrice(m.costPerBaseUnit * m.conversionFactor || 1200);
                }}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-sage-500"
                required
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameAr || m.name} ({m.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                رقم التشغيلة / اللوت (Lot/Batch No.)
              </label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                تاريخ انتهاء الصلاحية (FEFO Control)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                عدد العبوات المستلمة
              </label>
              <input
                type="number"
                min="1"
                value={packagesCount}
                onChange={(e) => setPackagesCount(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                سعر شراء العبوة الواحدة (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={packagePrice}
                onChange={(e) => setPackagePrice(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                required
              />
            </div>
          </div>

          {/* Unit Conversion & Effective Cost Breakdown */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>إجمالي قيمة فاتورة الشراء:</span>
              <span className="font-bold text-navy-900 font-mono">{totalPurchaseCost.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>إجمالي الرصيد المضاف بالوحدات الأساسية:</span>
              <span className="font-bold text-slate-900 font-mono">
                {totalBaseUnits} {selectedMaterial?.baseUnit || 'G/ML'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>التكلفة الفعلية لوحدة الأساس المحسوبة:</span>
              <span className="font-bold text-sage-700 font-mono">
                {costPerBaseUnit.toFixed(2)} ج.م / {selectedMaterial?.baseUnit || 'وحدة'}
              </span>
            </div>
          </div>

          {/* Payment Terms (Cash vs Accounts Payable) */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-900">
              <input
                type="checkbox"
                checked={isPaidNow}
                onChange={(e) => setIsPaidNow(e.target.checked)}
                className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
              />
              <span>سداد الفاتورة نقداً الآن (خصم من رصيد الخزينة / البنك فوراً)</span>
            </label>
            <p className="text-[10px] text-amber-800">
              {isPaidNow
                ? 'سيتم تسجيل حركة صرف من الحساب المختار وخفض الرصيد النقدي.'
                : 'شراء آجل: ستضاف القيمة لمستحقات المورد (حسابات الدائنين Accounts Payable) دون التأثير على رصيد الخزينة الآن.'}
            </p>

            {isPaidNow && (
              <div className="pt-2 border-t border-amber-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اختر حساب الصرف
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  required={isPaidNow}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nameAr || a.name} (الرصيد: {a.currentBalance.toLocaleString()} ج.م)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-navy-850 hover:bg-navy-900 text-white text-xs font-bold shadow-md shadow-navy-900/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <PackagePlus className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الاستلام والتوليد...' : 'استلام وإضافة للمخزون'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
