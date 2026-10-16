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
  Wrench,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';

interface MaterialsViewProps {
  initialMaterials: any[];
  initialInstruments?: any[];
  suppliers?: any[];
  clinicId: string;
}

export default function MaterialsView({
  initialMaterials,
  initialInstruments = [],
  clinicId,
}: MaterialsViewProps) {
  const { t } = useApp();
  const [materials, setMaterials] = useState(initialMaterials);
  const [instruments, setInstruments] = useState(initialInstruments);
  const [activeTab, setActiveTab] = useState<'CHEMICALS' | 'DISPOSABLES' | 'REUSABLE_TOOLS'>('CHEMICALS');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'CHEMICAL' | 'DISPOSABLE' | 'REUSABLE_TOOL'>('CHEMICAL');
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formNameAr, setFormNameAr] = useState('');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formClinicalRole, setFormClinicalRole] = useState('');
  const [formPackagePrice, setFormPackagePrice] = useState<number | string>(1200);
  const [formPackageQuantity, setFormPackageQuantity] = useState<number | string>(1);
  const [formPackageUnit, setFormPackageUnit] = useState('BOTTLE');
  const [formBaseUnit, setFormBaseUnit] = useState('APPLICATION');
  const [formConversionFactor, setFormConversionFactor] = useState<number | string>(100);
  const [formWastePercent, setFormWastePercent] = useState<number | string>(10);
  // For Reusable Tool
  const [formToolUses, setFormToolUses] = useState<number | string>(300);
  const [formToolSteriCost, setFormToolSteriCost] = useState<number | string>(5);
  const [formNotes, setFormNotes] = useState('');

  // Tab Filtering
  const chemicalMaterials = materials.filter(
    (m) => m.category !== 'SINGLE_USE_DISPOSABLE' && m.category !== 'ISOLATION' && m.category !== 'CONSUMABLES'
  );

  const disposableMaterials = materials.filter(
    (m) => m.category === 'SINGLE_USE_DISPOSABLE' || m.category === 'ISOLATION' || m.category === 'CONSUMABLES'
  );

  const filterItems = (list: any[]) => {
    return list.filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.nameAr?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.clinicalRole?.toLowerCase().includes(q)
      );
    });
  };

  const displayedChemicals = filterItems(chemicalMaterials);
  const displayedDisposables = filterItems(disposableMaterials);
  const displayedInstruments = filterItems(instruments);

  // Open modals
  const openAddModal = (type: 'CHEMICAL' | 'DISPOSABLE' | 'REUSABLE_TOOL') => {
    setModalType(type);
    if (type === 'CHEMICAL') {
      setFormNameAr('');
      setFormName('');
      setFormBrand('Kuraray Noritake / 3M');
      setFormClinicalRole('حشوات وبوند وتخدير');
      setFormPackagePrice(1400);
      setFormPackageQuantity(1);
      setFormPackageUnit('BOTTLE');
      setFormBaseUnit('قطرة (Drop)');
      setFormConversionFactor(100);
      setFormWastePercent(10);
    } else if (type === 'DISPOSABLE') {
      setFormNameAr('');
      setFormName('');
      setFormBrand('Sanctuary / Young');
      setFormClinicalRole('عزل ومستهلكات أحادية الاستخدام');
      setFormPackagePrice(450);
      setFormPackageQuantity(1);
      setFormPackageUnit('BOX');
      setFormBaseUnit('قطعة (Piece)');
      setFormConversionFactor(100);
      setFormWastePercent(5);
    } else {
      setFormNameAr('');
      setFormName('');
      setFormBrand('LM Arte / Hu-Friedy / Mani');
      setFormClinicalRole('أدوات حشو وجراحة وكشف');
      setFormPackagePrice(1200);
      setFormToolUses(300);
      setFormToolSteriCost(5);
    }
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (modalType === 'REUSABLE_TOOL') {
        const price = parseFloat(formPackagePrice as string) || 0;
        const uses = parseInt(formToolUses as string) || 300;
        const steri = parseFloat(formToolSteriCost as string) || 5;
        const costPerUse = uses > 0 ? price / uses : 0;

        const newTool = {
          id: `tool-${Date.now().toString().slice(-6)}`,
          name: formName || formNameAr,
          nameAr: formNameAr || formName,
          category: 'CUSTOM_INSTRUMENT',
          purchasePrice: price,
          expectedLifetimeUses: uses,
          costPerUse: parseFloat(costPerUse.toFixed(2)),
          sterilizationCycleCost: steri,
          totalPerPatientCost: parseFloat((costPerUse + steri).toFixed(2)),
          notes: formNotes || 'أداة معتمدة بالعيادة',
          usedInProcedures: [],
        };

        setInstruments([newTool, ...instruments]);
        setIsModalOpen(false);
      } else {
        const price = parseFloat(formPackagePrice as string) || 0;
        const conv = parseFloat(formConversionFactor as string) || 1;
        const waste = parseFloat(formWastePercent as string) || 10;
        const unitCost = conv > 0 ? (price / conv) * (1 + waste / 100) : 0;

        const newMat = {
          id: `mat-${Date.now().toString().slice(-6)}`,
          sku: `MAT-${Date.now().toString().slice(-5)}`,
          name: formName || formNameAr,
          nameAr: formNameAr || formName,
          brand: formBrand || 'Clinical',
          manufacturer: formBrand || 'Clinical',
          category: modalType === 'DISPOSABLE' ? 'SINGLE_USE_DISPOSABLE' : 'CHEMICAL_DOSING',
          clinicalRole: formClinicalRole,
          packageUnit: formPackageUnit,
          packageQuantity: parseFloat(formPackageQuantity as string) || 1,
          baseUnit: formBaseUnit,
          conversionFactor: conv,
          costPerBaseUnit: parseFloat(unitCost.toFixed(2)),
          unusableWastePercent: waste,
          notes: formNotes || '',
          usedInProcedures: [],
        };

        setMaterials([newMat, ...materials]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving item:', err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="دليل الخامات الكيميائية ومستهلكات المريض والأدوات المعقمة"
        subtitle="تفصيل دقيق وشامل لكافة المواد والأدوات بالعيادة مع حساب تكلفة الجرعة وتكلفة الاستخدام الواحد"
      />

      <div className="p-6 space-y-6">
        {/* Top 3-Category Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('CHEMICALS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'CHEMICALS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-200'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>1. الخامات الكيميائية والجرعات ({chemicalMaterials.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('DISPOSABLES')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'DISPOSABLES'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>2. مستهلكات الاستخدام لمرة واحدة ({disposableMaterials.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('REUSABLE_TOOLS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'REUSABLE_TOOLS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>3. الأدوات متعددة الاستخدام المعقمة ({instruments.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                openAddModal(
                  activeTab === 'CHEMICALS'
                    ? 'CHEMICAL'
                    : activeTab === 'DISPOSABLES'
                    ? 'DISPOSABLE'
                    : 'REUSABLE_TOOL'
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeTab === 'CHEMICALS'
                  ? 'إضافة خامة كيميائية'
                  : activeTab === 'DISPOSABLES'
                  ? 'إضافة مستهلك مرة واحدة'
                  : 'إضافة أداة معقمة'}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو الاستخدام (بوند، ماجيستي، رابر دام، فورسيبس، أليفاتور، كاشف تسوس)..."
            className="w-full text-xs ps-9 pe-3 py-2.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-white shadow-2xs"
          />
        </div>

        {/* TAB 1: CHEMICALS & DOSING */}
        {activeTab === 'CHEMICALS' && (
          <div className="space-y-4">
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-950">
              <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">الخامات الكيميائية ومستهلكات الجرعات (Dosed Clinical Chemicals):</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  هذه الخامات تُستهلك تدريجياً بحجم الجرعة (القطرة للبوند والكاشف، والجرام للكومبوزيت، والسنتيمتر للفايبر، والكاربول للبنج). الرقم المكتوب بالأسفل هو التكلفة الصافية للجرعة الواحدة متضمنة نسبة الهدر.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedChemicals.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all p-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-100">
                        {mat.sku}
                      </span>
                      <span className="text-[11px] text-blue-700 font-semibold bg-blue-50/60 px-2 py-0.5 rounded-md">
                        {mat.clinicalRole || 'خامة علاجية'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-navy-950">{mat.nameAr || mat.name}</h3>
                    <p className="text-xs text-slate-500">{mat.name} • {mat.brand}</p>

                    {mat.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                        {mat.notes}
                      </p>
                    )}

                    {mat.usedInProcedures && mat.usedInProcedures.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {mat.usedInProcedures.map((proc: string, i: number) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            {proc}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">سعة العبوة:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {mat.conversionFactor} {mat.baseUnit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">سعر شراء العبوة:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {mat.defaultPurchasePrice ? `${mat.defaultPurchasePrice} ج.م` : 'معتمد'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">تكلفة الجرعة السريرية:</span>
                      <span className="text-lg font-black font-mono text-blue-900">
                        {mat.costPerBaseUnit.toFixed(2)}{' '}
                        <span className="text-xs font-sans text-slate-600">ج.م / {mat.baseUnit}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SINGLE-USE DISPOSABLES */}
        {activeTab === 'DISPOSABLES' && (
          <div className="space-y-4">
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-950">
              <Package className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">مستهلكات الاستخدام لمرة واحدة لكل مريض (Single-Use Disposables):</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  هذه المستلزمات تُفتح وتُستخدم لمريض واحد فقط وتُرمى فوراً (شيت الرابر دام، الميكروبرش، ماصة اللعاب، إبر البنج، باكت الوقاية). تكلفتها ثابتة وقطعية لكل جلسة علاج.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedDisposables.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all p-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-100">
                        {mat.sku}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50/60 px-2 py-0.5 rounded-md">
                        {mat.clinicalRole || 'مستهلك مريض'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-navy-950">{mat.nameAr || mat.name}</h3>
                    <p className="text-xs text-slate-500">{mat.name} • {mat.brand}</p>

                    {mat.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                        {mat.notes}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">محتويات العبوة:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {mat.conversionFactor} {mat.baseUnit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">سعر شراء العبوة:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {mat.defaultPurchasePrice ? `${mat.defaultPurchasePrice} ج.م` : 'معتمد'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">تكلفة القطعة للمريض:</span>
                      <span className="text-lg font-black font-mono text-emerald-900">
                        {mat.costPerBaseUnit.toFixed(2)}{' '}
                        <span className="text-xs font-sans text-slate-600">ج.م / قطعة</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REUSABLE STERILIZED INSTRUMENTS */}
        {activeTab === 'REUSABLE_TOOLS' && (
          <div className="space-y-4">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
              <Wrench className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">الأدوات متعددة الاستخدام المعقمة (Reusable Sterilized Instruments - Cost Per Use):</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  أدوات معدنية تعيش لمئات المرات وتُعقم في الأوتوكلاف لكل مريض (طقم أدوات حشو وتشكيل الكومبوزيت، فورسيبس الجراحة، أليفاتورز، طقم الكشف، سنابل التحضير). تكلفتها للحالة = (سعر الشراء ÷ عدد الاستخدامات) + تكلفة كيس ودورة التعقيم.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedInstruments.map((inst) => (
                <div
                  key={inst.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all p-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-200">
                        {inst.category}
                      </span>
                      <span className="text-[11px] text-amber-800 font-semibold bg-amber-50/60 px-2 py-0.5 rounded-md">
                        معقم في أوتوكلاف B
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-navy-950">{inst.nameAr || inst.name}</h3>
                    <p className="text-xs text-slate-500">{inst.name}</p>

                    {inst.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed">
                        {inst.notes}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-[9px] text-slate-400 block">سعر الشراء:</span>
                        <span className="font-mono font-bold text-slate-800">{inst.purchasePrice} ج.م</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-[9px] text-slate-400 block">العمر المتوقع:</span>
                        <span className="font-mono font-bold text-slate-800">{inst.expectedLifetimeUses} مرة</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-[9px] text-slate-400 block">دورة التعقيم:</span>
                        <span className="font-mono font-bold text-slate-800">{inst.sterilizationCycleCost} ج.م</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-600 font-semibold block">إجمالي تكلفة الاستخدام الواحد:</span>
                      <span className="text-lg font-black font-mono text-amber-950">
                        {(inst.totalPerPatientCost || (inst.costPerUse + inst.sterilizationCycleCost)).toFixed(2)}{' '}
                        <span className="text-xs font-sans text-slate-600">ج.م / حالة</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sage-600" />
                {modalType === 'CHEMICAL'
                  ? 'إضافة خامة كيميائية أو جرعة جديدة'
                  : modalType === 'DISPOSABLE'
                  ? 'إضافة مستهلك لمرة واحدة للمريض'
                  : 'إضافة أداة متعددة الاستخدام معقمة'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  اسم البند بالعربي *
                </label>
                <input
                  type="text"
                  required
                  value={formNameAr}
                  onChange={(e) => setFormNameAr(e.target.value)}
                  placeholder={
                    modalType === 'CHEMICAL'
                      ? 'مثال: صبغة كاشف التسوس Caries Detector'
                      : modalType === 'DISPOSABLE'
                      ? 'مثال: شيت عازل مطاطي رابر دام'
                      : 'مثال: فورسيبس خلع الضروس العلوية'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white font-bold"
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
                  placeholder="Commercial English Name"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    الماركة / الشركة المصنعة
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Kuraray / 3M / Hu-Friedy"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    سعر الشراء الإجمالي (ج.م) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formPackagePrice}
                    onChange={(e) => setFormPackagePrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                  />
                </div>
              </div>

              {modalType === 'REUSABLE_TOOL' ? (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-amber-950 font-semibold mb-1">
                      عدد الاستخدامات المتوقعة
                    </label>
                    <input
                      type="number"
                      value={formToolUses}
                      onChange={(e) => setFormToolUses(e.target.value)}
                      placeholder="300"
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">عدد مرات التعقيم قبل التجديد</span>
                  </div>

                  <div>
                    <label className="block text-amber-950 font-semibold mb-1">
                      تكلفة دورة التعقيم (ج.م)
                    </label>
                    <input
                      type="number"
                      value={formToolSteriCost}
                      onChange={(e) => setFormToolSteriCost(e.target.value)}
                      placeholder="5"
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">كيس الأوتوكلاف والبخار</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      عدد الوحدات بالعبوة (جرعات/قطع)
                    </label>
                    <input
                      type="number"
                      value={formConversionFactor}
                      onChange={(e) => setFormConversionFactor(e.target.value)}
                      placeholder="100"
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      وحدة الاستخدام
                    </label>
                    <input
                      type="text"
                      value={formBaseUnit}
                      onChange={(e) => setFormBaseUnit(e.target.value)}
                      placeholder="قطرة / جرام / قطعة"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ملاحظات أو بروتوكول الاستخدام
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات سريرية حول الاستخدام..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ وإدراج في الدليل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
