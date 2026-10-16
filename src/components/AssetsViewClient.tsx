'use client';

import React, { useState } from 'react';
import Header from './Header';
import GuideTooltip from './GuideTooltip';
import {
  Wrench,
  ShieldAlert,
  RotateCcw,
  Plus,
  Clock,
  Sparkles,
  X,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

interface AssetsViewClientProps {
  clinic: any;
  initialAssets: any[];
  initialInstruments: any[];
}

export default function AssetsViewClient({
  clinic,
  initialAssets,
  initialInstruments,
}: AssetsViewClientProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [instruments, setInstruments] = useState(initialInstruments);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetType, setAssetType] = useState<'DEVICE' | 'REUSABLE_INSTRUMENT'>('DEVICE');
  const [formNameAr, setFormNameAr] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('CHAIR_UNIT');
  const [formPrice, setFormPrice] = useState<number | string>(85000);
  const [formYears, setFormYears] = useState<number | string>(5);
  const [formUses, setFormUses] = useState<number | string>(20);
  const [formSterilization, setFormSterilization] = useState<number | string>(5);
  const [isSaving, setIsSaving] = useState(false);

  // Calculations
  const totalHistoricalCost = assets.reduce((acc, a) => acc + (a.historicalCost || 0), 0);
  const monthlyDepreciation = assets.reduce((acc, a) => acc + (a.monthlyDepreciation || 0), 0);

  // Live preview for modal
  const numPrice = parseFloat(formPrice as string) || 0;
  const numYears = parseFloat(formYears as string) || 5;
  const numUses = parseInt(formUses as string) || 20;
  const previewMonthlyDep = (numYears * 12) > 0 ? numPrice / (numYears * 12) : 0;
  const previewCostPerUse = numUses > 0 ? numPrice / numUses : 0;

  const openAddModal = (type: 'DEVICE' | 'REUSABLE_INSTRUMENT') => {
    setAssetType(type);
    if (type === 'DEVICE') {
      setFormNameAr('');
      setFormName('');
      setFormCategory('CHAIR_UNIT');
      setFormPrice(120000);
      setFormYears(5);
    } else {
      setFormNameAr('');
      setFormName('');
      setFormCategory('BUR_DIAMOND');
      setFormPrice(450);
      setFormUses(15);
      setFormSterilization(5);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: clinic.id,
          assetType,
          name: formName || formNameAr,
          nameAr: formNameAr || formName,
          category: formCategory,
          purchasePrice: numPrice,
          usefulLifeYears: numYears,
          expectedLifetimeUses: numUses,
          sterilizationCycleCost: parseFloat(formSterilization as string) || 5,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (assetType === 'DEVICE' && data.asset) {
          setAssets([data.asset, ...assets]);
        } else if (data.instrument) {
          setInstruments([data.instrument, ...instruments]);
        }
        setIsModalOpen(false);
      } else {
        alert(data.error || 'فشل حفظ الأصل');
      }
    } catch (err) {
      console.error('Error saving asset:', err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="الأجهزة الطبية وسجل إهلاك الأصول والأدوات"
        subtitle={`إدارة الأجهزة السريرية وإهلاكها بـ ${clinic.nameAr || clinic.name} وحساب نصيب ساعة التشغيل من احتياطي الإحلال`}
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">إجمالي القيمة الاستثمارية للأجهزة</span>
            <p className="text-2xl font-black font-mono text-navy-900 mt-1">
              {totalHistoricalCost.toLocaleString()} <span className="text-xs font-sans text-slate-500">ج.م</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              وحدات الأسنان، أوتوكلاف، أشعة، موتورات
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 block">قسط الإهلاك الشهري المحسوب</span>
              <GuideTooltip topicId="equipmentDepreciation" />
            </div>
            <p className="text-2xl font-black font-mono text-teal-700 mt-1">
              {monthlyDepreciation.toFixed(1)} <span className="text-xs font-sans text-slate-500">ج.م / شهر</span>
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block">
              يدخل ضمن التكاليف الثابتة لحساب ساعة الكرسي
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">إجراءات سريعة</span>
              <p className="text-xs text-slate-600 mt-1">إضافة أجهزة جديدة أو أدوات متعددة الاستخدام</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => openAddModal('DEVICE')}
                className="flex-1 px-3 py-1.5 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة جهاز طبي
              </button>
              <button
                onClick={() => openAddModal('REUSABLE_INSTRUMENT')}
                className="flex-1 px-3 py-1.5 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                أداة متكررة
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Assets Register */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-sage-600" />
              سجل الأجهزة الطبية والأصول الثابتة
            </h3>
            <button
              onClick={() => openAddModal('DEVICE')}
              className="text-xs font-bold text-sage-700 hover:text-sage-900 flex items-center gap-1 bg-sage-50 px-3 py-1.5 rounded-lg border border-sage-200"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة جهاز
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">الكود</th>
                  <th className="py-2.5 px-3 text-start">اسم الجهاز</th>
                  <th className="py-2.5 px-3 text-start">الفئة</th>
                  <th className="py-2.5 px-3 text-end">سعر الشراء</th>
                  <th className="py-2.5 px-3 text-center">العمر الافتراضي</th>
                  <th className="py-2.5 px-3 text-end">الإهلاك الشهري</th>
                  <th className="py-2.5 px-3 text-start">ملاحظات</th>
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
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-900">
                      {asset.historicalCost > 0 ? `${asset.historicalCost.toLocaleString()} ج.م` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                      {((asset.usefulLifeMonths || 60) / 12).toFixed(1)} سنوات
                    </td>
                    <td className="py-2.5 px-3 text-end font-mono font-bold text-teal-800">
                      {asset.monthlyDepreciation > 0 ? `${asset.monthlyDepreciation.toFixed(1)} ج.م` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {asset.notes || 'معتمد ضمن مصاريف التشغيل'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reusable Instruments Cost Per Use */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              سجل الأدوات متعددة الاستخدام وتكلفة الاستخدام الواحد (Cost Per Use)
            </h3>
            <button
              onClick={() => openAddModal('REUSABLE_INSTRUMENT')}
              className="text-xs font-bold text-navy-800 hover:text-navy-950 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة أداة
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">اسم الأداة</th>
                  <th className="py-2.5 px-3 text-start">الفئة</th>
                  <th className="py-2.5 px-3 text-end">سعر الشراء</th>
                  <th className="py-2.5 px-3 text-center">الاستخدامات المتوقعة</th>
                  <th className="py-2.5 px-3 text-end">تكلفة الاستخدام الواحد</th>
                  <th className="py-2.5 px-3 text-end">تكلفة التعقيم</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-sage-600" />
                {assetType === 'DEVICE' ? 'إضافة جهاز طبي وحساب إهلاكه' : 'إضافة أداة متكررة وحساب تكلفة الاستخدام'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  اسم {assetType === 'DEVICE' ? 'الجهاز' : 'الأداة'} بالعربي *
                </label>
                <input
                  type="text"
                  required
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  placeholder={assetType === 'DEVICE' ? 'مثلاً: جهاز روتاري كودياك' : 'مثلاً: سنبلة دايموند خشنة'}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    سعر الشراء (ج.م) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                  />
                </div>

                {assetType === 'DEVICE' ? (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>العمر الافتراضي (سنوات)</span>
                      <GuideTooltip topicId="equipmentDepreciation" />
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="15"
                      value={formYears}
                      onChange={(e) => setFormYears(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      عدد الاستخدامات المتوقعة
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formUses}
                      onChange={(e) => setFormUses(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-teal-950 block">
                    {assetType === 'DEVICE' ? 'قسط الإهلاك الشهري المحسوب:' : 'تكلفة الاستخدام الواحد المحسوبة:'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {assetType === 'DEVICE' ? 'يضاف تلقائياً للمصاريف الثابتة' : 'شامل استهلاك الأداة'}
                  </span>
                </div>
                <span className="text-xl font-black font-mono text-teal-800">
                  {assetType === 'DEVICE' ? `${previewMonthlyDep.toFixed(1)} ج.م/شهر` : `${previewCostPerUse.toFixed(2)} ج.م`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-sage-600 hover:bg-sage-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ وإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
