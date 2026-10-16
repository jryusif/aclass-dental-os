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
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { verifyClinicalConsumption, ClinicalVerificationResult } from '@/lib/clinical-ai-verifier';

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

  // Load any custom materials saved locally across tabs
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('dental_os_custom_materials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMaterials((prev) => {
            const map = new Map();
            parsed.forEach((m: any) => map.set(m.id, m));
            prev.forEach((m: any) => {
              if (!map.has(m.id)) map.set(m.id, m);
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {
      console.warn('LocalStorage load error in MaterialsView:', e);
    }
  }, []);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'CHEMICAL' | 'DISPOSABLE' | 'REUSABLE_TOOL'>('CHEMICAL');
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formNameAr, setFormNameAr] = useState('');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formClinicalRole, setFormClinicalRole] = useState('');
  const [formPackagePrice, setFormPackagePrice] = useState<number | string>(1400);

  // Capacity & Units Configuration
  const [formCapacityValue, setFormCapacityValue] = useState<number | string>(5);
  const [formCapacityUnit, setFormCapacityUnit] = useState<'ML' | 'G' | 'MG' | 'CM' | 'UNITS'>('ML');
  const [formPackageUnit, setFormPackageUnit] = useState('BOTTLE');
  const [formBaseUnit, setFormBaseUnit] = useState('قطرة (Drop)');
  const [formConversionFactor, setFormConversionFactor] = useState<number | string>(100);
  const [formWastePercent, setFormWastePercent] = useState<number | string>(10);

  // Reusable Tool Fields
  const [formToolUses, setFormToolUses] = useState<number | string>(300);
  const [formToolSteriCost, setFormToolSteriCost] = useState<number | string>(5);
  const [formNotes, setFormNotes] = useState('');

  // AI & Clinical Verification State
  const [verificationResult, setVerificationResult] = useState<ClinicalVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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

  // Trigger Clinical AI Verification
  const runVerification = (nameOverride?: string, capOverride?: number, unitOverride?: string) => {
    const name = nameOverride || formNameAr || formName || 'مادة أسنان عامة';
    const cap = capOverride !== undefined ? capOverride : parseFloat(formCapacityValue as string) || 5;
    const unit = unitOverride || formCapacityUnit;

    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyClinicalConsumption(name, cap, unit);
      setVerificationResult(result);
      setIsVerifying(false);
    }, 250);
  };

  // Apply Verified Standards
  const applyVerifiedStandards = () => {
    if (!verificationResult) return;
    setFormBaseUnit(verificationResult.recommendedBaseUnit);
    setFormConversionFactor(verificationResult.recommendedPackageCapacity);
    setFormWastePercent(verificationResult.standardWastePercent);
    if (!formNotes) {
      setFormNotes(
        `معايرة سريرية معتمدة: ${verificationResult.clinicalRationale} (المرجع: ${verificationResult.evidenceSource})`
      );
    }
  };

  // Open modals
  const openAddModal = (type: 'CHEMICAL' | 'DISPOSABLE' | 'REUSABLE_TOOL') => {
    setModalType(type);
    setVerificationResult(null);

    if (type === 'CHEMICAL') {
      setFormNameAr('');
      setFormName('');
      setFormBrand('Kuraray Noritake / 3M');
      setFormClinicalRole('حشوات وبوند وتخدير');
      setFormPackagePrice(1400);
      setFormCapacityValue(5);
      setFormCapacityUnit('ML');
      setFormPackageUnit('BOTTLE');
      setFormBaseUnit('قطرة (Drop)');
      setFormConversionFactor(100);
      setFormWastePercent(10);
      setFormNotes('');
    } else if (type === 'DISPOSABLE') {
      setFormNameAr('');
      setFormName('');
      setFormBrand('Sanctuary / Young');
      setFormClinicalRole('عزل ومستهلكات أحادية الاستخدام');
      setFormPackagePrice(450);
      setFormCapacityValue(100);
      setFormCapacityUnit('UNITS');
      setFormPackageUnit('BOX');
      setFormBaseUnit('قطعة (Piece)');
      setFormConversionFactor(100);
      setFormWastePercent(5);
      setFormNotes('');
    } else {
      setFormNameAr('');
      setFormName('');
      setFormBrand('LM Arte / Hu-Friedy / Mani');
      setFormClinicalRole('أدوات حشو وجراحة وكشف');
      setFormPackagePrice(1200);
      setFormToolUses(300);
      setFormToolSteriCost(5);
      setFormNotes('');
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
          packageQuantity: parseFloat(formCapacityValue as string) || 1,
          baseUnit: formBaseUnit,
          conversionFactor: conv,
          costPerBaseUnit: parseFloat(unitCost.toFixed(2)),
          unusableWastePercent: waste,
          notes:
            formNotes ||
            (verificationResult
              ? `${verificationResult.clinicalRationale} (المصدر: ${verificationResult.evidenceSource})`
              : ''),
          usedInProcedures: [],
        };

        // Also post to DB via API
        fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicId,
            name: newMat.name,
            nameAr: newMat.nameAr,
            brand: newMat.brand,
            category: newMat.category,
            packagePurchasePrice: price,
            packageQuantity: newMat.packageQuantity,
            packageUnit: newMat.packageUnit,
            baseUnit: newMat.baseUnit,
            conversionFactor: newMat.conversionFactor,
            unusableWastePercent: newMat.unusableWastePercent,
            notes: newMat.notes,
          }),
        }).catch((err) => console.warn('Background material persist error:', err));

        // Save to localStorage so Consumption Calculator and Services immediately see it
        try {
          const stored = localStorage.getItem('dental_os_custom_materials');
          const parsed = stored ? JSON.parse(stored) : [];
          localStorage.setItem('dental_os_custom_materials', JSON.stringify([newMat, ...parsed]));
        } catch (e) {
          console.warn('LocalStorage save error:', e);
        }

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
              className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0 active:scale-95"
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
                  تُحسب بالملليلتر (ml) للبوند والكاشف، وبالجرام (g) للكومبوزيت والبيوسيراميك، وبالسنتيمتر (cm) لأشرطة الفايبر، وبالكاربول للبنج. تذهب تلقائياً لحاسبة الاستهلاك وتدخل في تسعير الخدمات.
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
                  تُقاس بعدد القطع (Units / Pieces) وتُستخدم لحالة واحدة فقط وتُرمى (شيت الرابر دام، الميكروبرش، ماصة اللعاب، إبر البنج، باكت الوقاية).
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
                  أدوات معدنية تعيش لمئات المرات وتُعقم في الأوتوكلاف (طقم أدوات حشو وتشكيل الكومبوزيت، فورسيبس الجراحة، أليفاتورز، طقم الكشف، سنابل التحضير). تكلفتها للحالة = (سعر الشراء ÷ عدد الاستخدامات) + تكلفة دورة التعقيم.
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

      {/* Add Item Modal with AI Verification & Flexible Units */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-sage-600" />
                  {modalType === 'CHEMICAL'
                    ? 'إضافة خامة كيميائية أو جرعة جديدة'
                    : modalType === 'DISPOSABLE'
                    ? 'إضافة مستهلك لمرة واحدة للمريض'
                    : 'إضافة أداة متعددة الاستخدام معقمة'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديد سعة العبوة (مل، جرام، مجم، وحدات) وفحصها بالمعايير السريرية المعتمدة
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  اسم البند بالعربي *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder={
                      modalType === 'CHEMICAL'
                        ? 'مثال: صبغة كاشف التسوس Caries Detector Dye'
                        : modalType === 'DISPOSABLE'
                        ? 'مثال: شيت عازل مطاطي رابر دام'
                        : 'مثال: طقم أدوات تشكيل الكومبوزيت Composite Applicator'
                    }
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white font-bold"
                  />
                  {modalType !== 'REUSABLE_TOOL' && (
                    <button
                      type="button"
                      onClick={() => runVerification()}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs"
                      title="فحص معدل الاستهلاك السريري بناءً على معايير الجمعية الأمريكية لطب الأسنان"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>فحص وحساب تلقائي</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  الاسم التجاري بالإنجليزية (Commercial Name)
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Clearfil SE Bond / Sable Seek / Filtek Z350"
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
                    placeholder="Kuraray Noritake / 3M / Ultradent"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

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
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-white"
                  />
                </div>
              </div>

              {/* Flexible Capacity & Measurement Unit Inputs */}
              {modalType !== 'REUSABLE_TOOL' ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950 flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-sage-600" />
                      سعة وحجم العبوة ووحدة القياس:
                    </span>
                    <GuideTooltip topicId="materialPackaging" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        قيمة الحجم أو السعة:
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={formCapacityValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormCapacityValue(val);
                          runVerification(undefined, parseFloat(val) || 0, undefined);
                        }}
                        placeholder="5 أو 4.9 أو 50"
                        className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold bg-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        وحدة قياس السعة:
                      </label>
                      <select
                        value={formCapacityUnit}
                        onChange={(e: any) => {
                          const unit = e.target.value;
                          setFormCapacityUnit(unit);
                          runVerification(undefined, undefined, unit);
                        }}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                      >
                        <option value="ML">بالملليلتر (ml) — سوائل، بوند، كاشف، غسول</option>
                        <option value="G">بالجرام (g) — سرنجات كومبوزيت، بيوسيراميك</option>
                        <option value="MG">بالملليجرام (mg) — بودرة دقيقة، MTA</option>
                        <option value="UNITS">بعدد الوحدات / القطع / الكاربولات (Units)</option>
                        <option value="CM">بالسنتيمتر (cm) — أشرطة فايبر ريبوند</option>
                      </select>
                    </div>
                  </div>

                  {/* AI & Clinical Standards Verification Card */}
                  {verificationResult && (
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200 space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                          التوثيق السريري المعتمد (ADA & Clinical Evidence):
                        </span>
                        <button
                          type="button"
                          onClick={applyVerifiedStandards}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-all"
                        >
                          اعتماد المعايير تلقائياً ⬅️
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {verificationResult.clinicalRationale}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/80 p-2 rounded-lg border border-blue-100">
                        <div>
                          <span className="text-slate-500 block">وحدة الجرعة المقترحة:</span>
                          <strong className="text-blue-900">{verificationResult.recommendedBaseUnit}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">عدد الحالات المتوقعة:</span>
                          <strong className="text-teal-900 font-mono">
                            تكفي {verificationResult.expectedCasesPerPackage} حالة سريرية
                          </strong>
                        </div>
                      </div>

                      <p className="text-[9px] text-slate-500">
                        المرجع: {verificationResult.evidenceSource}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        عدد الجرعات / الوحدات بالعبوة:
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
                        تسمية وحدة الجرعة:
                      </label>
                      <input
                        type="text"
                        value={formBaseUnit}
                        onChange={(e) => setFormBaseUnit(e.target.value)}
                        placeholder="قطرة / جرعة 0.1 جم / قطعة"
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div>
                    <label className="block text-amber-950 font-semibold mb-1">
                      عدد الاستخدامات المتوقعة للأداة:
                    </label>
                    <input
                      type="number"
                      value={formToolUses}
                      onChange={(e) => setFormToolUses(e.target.value)}
                      placeholder="300"
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">مرات التعقيم قبل الاستبدال</span>
                  </div>

                  <div>
                    <label className="block text-amber-950 font-semibold mb-1">
                      تكلفة دورة التعقيم (ج.م):
                    </label>
                    <input
                      type="number"
                      value={formToolSteriCost}
                      onChange={(e) => setFormToolSteriCost(e.target.value)}
                      placeholder="5"
                      className="w-full p-2 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">كيس الأوتوكلاف ومكافحة العدوى</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ملاحظات أو توثيق سريري
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
                  {isSaving ? 'جاري الحفظ والمزامنة...' : 'حفظ وإرسال لحاسبة الاستهلاك والتسعير'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
