'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import GuideTooltip from './GuideTooltip';
import {
  FlaskConical,
  Search,
  Plus,
  Layers,
  Sparkles,
  Edit3,
  CheckCircle2,
  X,
  Tag,
  DollarSign,
  Package,
  Sliders,
  Scale,
} from 'lucide-react';

interface MaterialsViewProps {
  initialMaterials: any[];
  suppliers: any[];
  clinicId: string;
}

export default function MaterialsView({
  initialMaterials,
  suppliers,
  clinicId,
}: MaterialsViewProps) {
  const { t } = useApp();
  const [materials, setMaterials] = useState(initialMaterials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('ADHESIVES');
  const [formPackagePrice, setFormPackagePrice] = useState<number | string>(1200);
  const [formPackageQuantity, setFormPackageQuantity] = useState<number | string>(1);
  const [formPackageUnit, setFormPackageUnit] = useState('BOTTLE');
  const [formBaseUnit, setFormBaseUnit] = useState('APPLICATION');
  const [formConversionFactor, setFormConversionFactor] = useState<number | string>(100);
  const [formWastePercent, setFormWastePercent] = useState<number | string>(15);
  const [formNotes, setFormNotes] = useState('');

  const categories = [
    { key: 'ALL', label: 'جميع الخامات والأدوات' },
    { key: 'ADHESIVES', label: 'أنظمة الربط واللواصق (Adhesives)' },
    { key: 'COMPOSITES', label: 'كمبوزيت حشوات وترميم (Composites)' },
    { key: 'BIOMIMETIC_FIBERS', label: 'ألياف حيوية مقواة (Ribbond & EverX)' },
    { key: 'ENDODONTICS', label: 'علاج الجذور وبيوسيراميك (Endodontics)' },
    { key: 'ISOLATION', label: 'العزل الميداني (Rubber Dam)' },
    { key: 'ANESTHETICS', label: 'المخدر الموضعي (Anesthetics)' },
    { key: 'BURS_POLISHING', label: 'سنابل التشذيب والتلميع (Burs & Polishing)' },
    { key: 'CONSUMABLES', label: 'مستهلكات عامة وميكروبرش' },
  ];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.nameAr && m.nameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate live preview in modal
  const numPrice = parseFloat(formPackagePrice as string) || 0;
  const numPackQty = parseFloat(formPackageQuantity as string) || 1;
  const numConversion = parseFloat(formConversionFactor as string) || 1;
  const numWaste = parseFloat(formWastePercent as string) || 0;
  const totalBaseUnits = numPackQty * numConversion;
  const netUnitCost = totalBaseUnits > 0 ? numPrice / totalBaseUnits : 0;
  const effectiveUnitCost = netUnitCost * (1 + numWaste / 100);

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormName('');
    setFormNameAr('');
    setFormBrand('Kuraray / GC / 3M');
    setFormCategory('ADHESIVES');
    setFormPackagePrice(1400);
    setFormPackageQuantity(1);
    setFormPackageUnit('BOTTLE');
    setFormBaseUnit('APPLICATION');
    setFormConversionFactor(100);
    setFormWastePercent(15);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (mat: any) => {
    setEditingMaterial(mat);
    setFormName(mat.name || '');
    setFormNameAr(mat.nameAr || '');
    setFormBrand(mat.brand || '');
    setFormCategory(mat.category || 'ADHESIVES');
    const estPackPrice = (mat.costPerBaseUnit || 0) * (mat.conversionFactor || 1) * (mat.packageQuantity || 1) / (1 + (mat.unusableWastePercent || 15) / 100);
    setFormPackagePrice(Math.round(estPackPrice) || 500);
    setFormPackageQuantity(mat.packageQuantity || 1);
    setFormPackageUnit(mat.packageUnit || 'BOTTLE');
    setFormBaseUnit(mat.baseUnit || 'APPLICATION');
    setFormConversionFactor(mat.conversionFactor || 100);
    setFormWastePercent(mat.unusableWastePercent || 15);
    setFormNotes(mat.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingMaterial) {
        // PUT update
        const res = await fetch('/api/materials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingMaterial.id,
            name: formName,
            nameAr: formNameAr,
            brand: formBrand,
            category: formCategory,
            packagePurchasePrice: numPrice,
            packageQuantity: numPackQty,
            packageUnit: formPackageUnit,
            baseUnit: formBaseUnit,
            conversionFactor: numConversion,
            unusableWastePercent: numWaste,
            notes: formNotes,
          }),
        });

        const data = await res.json();
        if (data.success && data.material) {
          setMaterials((prev) =>
            prev.map((m) => (m.id === data.material.id ? { ...m, ...data.material } : m))
          );
          setIsModalOpen(false);
        } else {
          alert(data.error || 'فشل تحديث بيانات المادة');
        }
      } else {
        // POST create
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicId,
            name: formName,
            nameAr: formNameAr,
            brand: formBrand,
            category: formCategory,
            packagePurchasePrice: numPrice,
            packageQuantity: numPackQty,
            packageUnit: formPackageUnit,
            baseUnit: formBaseUnit,
            conversionFactor: numConversion,
            unusableWastePercent: numWaste,
            notes: formNotes,
          }),
        });

        const data = await res.json();
        if (data.success && data.material) {
          setMaterials((prev) => [data.material, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(data.error || 'فشل إضافة المادة');
        }
      }
    } catch (err: any) {
      console.error('Error saving material:', err);
      alert('حدث خطأ أثناء حفظ المادة');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="دليل الخامات والأسعار والأحجام وحساب الجرعات"
        subtitle="إضافة وتعديل أسعار وسعات المواد والأدوات السريرية مع حساب تكلفة الجرعة والقطرة والجرام تلقائياً"
      />

      <div className="p-6 space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الخامة، الماركة (Clearfil, Ribbond, Filtek, EverX)..."
                className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              عدد الخامات: {filteredMaterials.length}
            </span>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة خامة / أداة جديدة
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-sage-50/70 border border-sage-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-sage-900">
          <Sparkles className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">
              حساب تكلفة الجرعة والقطرة التلقائي (Automatic Clinical Dose Costing):
            </p>
            <p className="text-slate-600 leading-relaxed">
              يقوم النظام تلقائياً بقسمة سعر شراء العبوة على حجمها وعدد جرعاتها، مع إضافة نسبة الهدر الطبيعية (10% - 15%). الرقم المحسوب بالأسفل هو التكلفة الدقيقة التي تدخل في تسعيرة الحشوات والخدمات السريرية.
            </p>
          </div>
          <GuideTooltip topicId="materialPackaging" />
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => {
            const packCostEstimate =
              mat.costPerBaseUnit *
              mat.conversionFactor *
              mat.packageQuantity /
              (1 + (mat.unusableWastePercent || 15) / 100);

            return (
              <div
                key={mat.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-sage-300 hover:shadow-md transition-all p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-50 text-navy-800 font-bold border border-navy-100">
                        {mat.sku}
                      </span>
                      <h3 className="text-sm font-bold text-navy-950 mt-1.5">
                        {mat.nameAr || mat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 font-sans">
                        {mat.name !== mat.nameAr ? `${mat.name} • ` : ''}
                        {mat.brand}
                      </p>
                    </div>

                    <button
                      onClick={() => openEditModal(mat)}
                      className="p-1.5 text-slate-400 hover:text-sage-700 hover:bg-sage-50 rounded-lg transition-colors"
                      title="تعديل السعر أو الحجم"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {mat.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-2.5 border border-slate-100 line-clamp-2">
                      {mat.notes}
                    </p>
                  )}

                  {/* Packaging Details */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">سعة وحجم العبوة:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {mat.packageQuantity} {mat.packageUnit}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">الوحدات الأساسية:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {mat.conversionFactor} {mat.baseUnit}
                      </span>
                    </div>
                  </div>

                  {/* Waste Factor Tag */}
                  <div className="mt-2 flex items-center justify-between text-[11px] px-2 py-1 bg-amber-50/60 rounded border border-amber-200/60 text-amber-900">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-amber-700" />
                      نسبة الفاقد والهدر:
                    </span>
                    <span className="font-mono font-bold">
                      {mat.unusableWastePercent}%
                    </span>
                  </div>
                </div>

                {/* Live Unit Cost Highlight Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 bg-gradient-to-r from-sage-50/80 to-transparent p-2.5 rounded-lg border border-sage-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        تكلفة الجرعة / القطرة السريرية:
                      </span>
                      <span className="text-lg font-black font-mono text-sage-900">
                        {mat.costPerBaseUnit.toFixed(2)}{' '}
                        <span className="text-xs font-sans text-slate-600">ج.م / {mat.baseUnit}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => openEditModal(mat)}
                      className="px-2.5 py-1 text-xs font-semibold text-sage-700 hover:text-sage-900 bg-white hover:bg-sage-100 rounded-md border border-sage-200 transition-colors shadow-2xs"
                    >
                      تعديل
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-sage-600" />
                  {editingMaterial ? 'تعديل بيانات الخامة وسعرها' : 'إضافة خامة أو أداة سريرية جديدة'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حساب تلقائي لتكلفة الجرعة السريرية الواحدة بناءً على سعة العبوة وسعر الشراء
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    اسم الخامة بالعربي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثلاً: كليرفيل إس إي بوند"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    الاسم بالإنجليزية (Commercial Name)
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Clearfil SE Bond Bottle"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    الشركة المصنعة / الماركة
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Kuraray Noritake / 3M ESPE"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    التصنيف السريري
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                  >
                    <option value="ADHESIVES">أنظمة الربط واللواصق (Adhesives)</option>
                    <option value="COMPOSITES">كمبوزيت حشوات وترميم (Composites)</option>
                    <option value="BIOMIMETIC_FIBERS">ألياف حيوية مقواة (Ribbond & EverX)</option>
                    <option value="ENDODONTICS">علاج الجذور وبيوسيراميك (Endodontics)</option>
                    <option value="ISOLATION">العزل الميداني (Rubber Dam)</option>
                    <option value="ANESTHETICS">المخدر الموضعي (Anesthetics)</option>
                    <option value="BURS_POLISHING">سنابل وتشذيب وتلميع (Burs)</option>
                    <option value="CONSUMABLES">مستهلكات عامة وميكروبرش</option>
                  </select>
                </div>
              </div>

              {/* Price & Package Size */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-navy-950 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-sage-600" />
                    بيانات شراء العبوة والسعة:
                  </h4>
                  <GuideTooltip topicId="materialPackaging" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      سعر شراء العبوة بالكامل (ج.م) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formPackagePrice}
                      onChange={(e) => setFormPackagePrice(e.target.value)}
                      placeholder="1400"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold focus:ring-1 focus:ring-sage-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      نوع العبوة (Package Unit)
                    </label>
                    <select
                      value={formPackageUnit}
                      onChange={(e) => setFormPackageUnit(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="BOTTLE">زجاجة (Bottle)</option>
                      <option value="SYRINGE">سرنجة (Syringe)</option>
                      <option value="BOX">علبة / باكت (Box)</option>
                      <option value="ROLL">بكرة / شريط (Roll)</option>
                      <option value="PACK">مجموعة (Pack)</option>
                      <option value="KIT">طقم كامل (Kit)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      وحدة الاستخدام السريري (Base Unit)
                    </label>
                    <select
                      value={formBaseUnit}
                      onChange={(e) => setFormBaseUnit(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="APPLICATION">قطرة / استخدام (Drop / Application)</option>
                      <option value="G">جرام (Gram)</option>
                      <option value="ML">مليلتر (Milliliter)</option>
                      <option value="MM">مليمتر / سم (Length)</option>
                      <option value="DOSE">جرعة واحدة (Single Dose)</option>
                      <option value="PIECE">قطعة واحدة (Piece)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>عدد الوحدات الأساسية بالعبوة (Conversion) *</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formConversionFactor}
                      onChange={(e) => setFormConversionFactor(e.target.value)}
                      placeholder="مثال: 100 قطرة أو 40 جرعة"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono focus:ring-1 focus:ring-sage-500 bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      مثال: زجاجة بوند 5 مل = 100 قطرة | سرنجة كومبوزيت 4 جم = 40 جرعة حشو
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>نسبة الفاقد والهدر المتوقع %</span>
                      <GuideTooltip topicId="bufferWasteFactor" />
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formWastePercent}
                      onChange={(e) => setFormWastePercent(e.target.value)}
                      placeholder="15"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono focus:ring-1 focus:ring-sage-500 bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      الموصى به دولياً: 10% - 15% لتغطية المتبقي بالسرنجة وتقلب الأسعار
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Calculation Preview Banner */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 block">
                    الحساب التلقائي اللحظي للجرعة (Live Dose Cost):
                  </span>
                  <p className="text-xs text-emerald-950 mt-0.5">
                    العبوة تنتج <span className="font-mono font-bold">{totalBaseUnits}</span> {formBaseUnit} بتكلفة صافية{' '}
                    <span className="font-mono font-bold">{netUnitCost.toFixed(2)} ج.م</span> للوحدة.
                  </p>
                </div>

                <div className="text-center sm:text-end shrink-0 bg-white px-4 py-2 rounded-lg border border-emerald-300 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block">تكلفة الجرعة بعد إضافة الهدر:</span>
                  <span className="text-xl font-black font-mono text-emerald-700">
                    {effectiveUnitCost.toFixed(2)}{' '}
                    <span className="text-xs font-sans text-slate-600">ج.م / {formBaseUnit}</span>
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ملاحظات أو مواصفات سريرية
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات حول طريقة الحفظ أو البروتوكول السريري الموصى به..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Modal Actions */}
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
                  className="px-5 py-2 rounded-lg bg-sage-600 hover:bg-sage-700 text-white font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? 'جاري الحفظ...' : editingMaterial ? 'تحديث السعر والبيانات' : 'حفظ وإضافة الخامة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
