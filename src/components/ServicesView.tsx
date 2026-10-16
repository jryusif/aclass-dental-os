'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import GuideTooltip from './GuideTooltip';
import {
  Stethoscope,
  Clock,
  Sparkles,
  Layers,
  Search,
  Plus,
  Edit3,
  CheckCircle2,
  HelpCircle,
  X,
  Trash2,
  DollarSign,
  Calculator,
  ShieldCheck,
  Wrench,
  Package,
  Zap,
  BookmarkCheck,
} from 'lucide-react';
import { ReusableToolItem, PresetProcedureRecipe } from '@/lib/clinical-catalog-data';

interface ServicesViewProps {
  services: any[];
  clinic: any;
  materials: any[];
  reusableTools?: ReusableToolItem[];
  presetRecipes?: PresetProcedureRecipe[];
  clinicId: string;
}

export default function ServicesView({
  services: initialServices,
  clinic,
  materials = [],
  reusableTools = [],
  presetRecipes = [],
  clinicId,
}: ServicesViewProps) {
  const { t } = useApp();
  const [services, setServices] = useState(initialServices);
  const [materialsList, setMaterialsList] = useState(materials);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Load custom materials saved locally across tabs so they immediately appear in dropdowns
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('dental_os_custom_materials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map();
          parsed.forEach((m: any) => map.set(m.id, m));
          materials.forEach((m: any) => {
            if (!map.has(m.id)) map.set(m.id, m);
          });
          setMaterialsList(Array.from(map.values()));
        }
      }
    } catch (e) {
      console.warn('LocalStorage load error in ServicesView:', e);
    }
  }, [materials]);

  // Branch Chair-Minute Rate Calculation
  const chairs = clinic?.activeChairs || 2;
  const dailyHours = clinic?.dailyWorkingHours || 8;
  const workingDays = clinic?.workingDaysPerMonth || 26;
  const occupancy = clinic?.occupancyRate > 1 ? clinic.occupancyRate / 100 : (clinic?.occupancyRate || 0.7);
  const monthlyExpenses = clinic?.monthlyFixedExpenses || 35000;
  const effectiveMonthlyHours = chairs * dailyHours * workingDays * occupancy;
  const chairMinuteRate = effectiveMonthlyHours > 0 ? (monthlyExpenses / effectiveMonthlyHours) / 60 : 3.0;

  // Modal State for Add / Costing Calculator
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formNameAr, setFormNameAr] = useState('');
  const [formName, setFormName] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('Biomimetic Restorative');
  const [formCategory, setFormCategory] = useState('DIRECT_RESTORATION');
  const [formDuration, setFormDuration] = useState<number | string>(35);
  const [formSterilization, setFormSterilization] = useState<number | string>(75);
  const [formLabCost, setFormLabCost] = useState<number | string>(0);
  const [formCommissionRate, setFormCommissionRate] = useState<number | string>(35);
  const [formClinicMargin, setFormClinicMargin] = useState<number | string>(40);
  const [formDescription, setFormDescription] = useState('');

  // 1. Dosed Chemical Materials (بوند، كومبوزيت، بنج، كاشف تسوس)
  interface ChemicalItemDraft {
    materialId: string;
    quantity: number;
    notes?: string;
  }
  const [selectedChemicals, setSelectedChemicals] = useState<ChemicalItemDraft[]>([
    { materialId: materials[0]?.id || 'mat-se-bond-2', quantity: 1, notes: 'بوند عاجي حيوي' },
    { materialId: materials[2]?.id || 'mat-majesty-posterior', quantity: 3, notes: '3 جرعات كومبوزيت خلفي' },
  ]);

  // 2. Single-Use Disposables (شيت رابر دام، ميكروبرش، سحب لعاب، باكت وقاية)
  interface DisposableItemDraft {
    materialId: string;
    quantity: number;
    notes?: string;
  }
  const [selectedDisposables, setSelectedDisposables] = useState<DisposableItemDraft[]>([
    { materialId: 'disp-rubber-dam-sheet', quantity: 1, notes: 'عزل مطاطي' },
    { materialId: 'disp-microbrush', quantity: 2, notes: 'ميكروبرش سريري' },
    { materialId: 'disp-saliva-ejector', quantity: 1, notes: 'ماصة سحب لعاب' },
  ]);

  // 3. Reusable Instruments (أدوات الكومبوزيت، فورسيبس، أليفاتورز، كيت كشف، سنابل)
  interface ReusableToolDraft {
    toolId: string;
    notes?: string;
  }
  const [selectedTools, setSelectedTools] = useState<ReusableToolDraft[]>([
    { toolId: 'tool-diagnostic-kit', notes: 'طقم كشف وفحص معقم' },
    { toolId: 'tool-composite-applicator-kit', notes: 'طقم أدوات حشو وتشكيل الكومبوزيت' },
    { toolId: 'tool-diamond-prep-bur', notes: 'سنبلة دايموند لتحضير التجويف' },
  ]);

  const categories = [
    { key: 'ALL', label: 'جميع الخدمات السريرية' },
    { key: 'DIRECT_RESTORATION', label: 'حشوات وترميمات مباشرة (Biomimetic Composite)' },
    { key: 'INDIRECT_RESTORATION', label: 'تركيبات حيوية وإنلاي وأوفرلاي (Inlay & Overlay)' },
    { key: 'ENDODONTICS', label: 'علاج الجذور المجهري (Endodontics)' },
    { key: 'SURGERY_IMPLANT', label: 'جراحة وخلع وزراعة (Surgery & Implants)' },
    { key: 'PREVENTIVE', label: 'تنظيف وعزل ووقاية (Preventive & Hygiene)' },
  ];

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.nameAr && srv.nameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      srv.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || srv.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate live costs
  const numDuration = parseFloat(formDuration as string) || 35;
  const numSterilization = parseFloat(formSterilization as string) || 75;
  const numLab = parseFloat(formLabCost as string) || 0;
  const numCommission = (parseFloat(formCommissionRate as string) || 35) / 100;
  const numMargin = (parseFloat(formClinicMargin as string) || 40) / 100;

  // Absorbed chair cost = duration in minutes * chair minute rate
  const absorbedChairCost = numDuration * chairMinuteRate;

  // 1. Chemicals Total Cost
  const chemicalTotalCost = selectedChemicals.reduce((acc, item) => {
    const mat = materialsList.find((m) => m.id === item.materialId);
    if (!mat) return acc;
    const wasteFactor = 1 + (mat.unusableWastePercent || 10) / 100;
    return acc + (item.quantity * mat.costPerBaseUnit * wasteFactor);
  }, 0);

  // 2. Disposables Total Cost
  const disposablesTotalCost = selectedDisposables.reduce((acc, item) => {
    const mat = materialsList.find((m) => m.id === item.materialId);
    if (!mat) return acc;
    const wasteFactor = 1 + (mat.unusableWastePercent || 5) / 100;
    return acc + (item.quantity * mat.costPerBaseUnit * wasteFactor);
  }, 0);

  // 3. Reusable Tools Total Cost (Cost Per Use + Sterilization)
  const reusableToolsTotalCost = selectedTools.reduce((acc, item) => {
    const tool = reusableTools.find((t) => t.id === item.toolId);
    if (!tool) return acc;
    return acc + (tool.totalPerPatientCost || (tool.costPerUse + tool.sterilizationCycleCost) || 12);
  }, 0);

  // Grand Direct Costs = Chemicals + Disposables + Reusable Tools Wear + Chair Time + Lab
  const totalDirectProcedureCost = chemicalTotalCost + disposablesTotalCost + reusableToolsTotalCost + absorbedChairCost + numLab;

  // Pricing Tiers
  // 1. Zero-Profit Break-Even Fee (سعر استرداد التكلفة الصفرية)
  const zeroProfitBreakEven = totalDirectProcedureCost;

  // 2. Target Contribution Price (تغطية التكاليف المتغيرة مع عمولة الطبيب)
  const targetContribution = (chemicalTotalCost + disposablesTotalCost + numLab) / Math.max(0.2, 1 - numCommission);

  // 3. Full Recommended Patient Price (السعر الكامل الموصى به للمريض المحقق لهامش العيادة)
  const remainingShare = 1 - numCommission - numMargin;
  const fullRecommendedPrice = remainingShare > 0.1
    ? zeroProfitBreakEven / remainingShare
    : zeroProfitBreakEven * 1.8;

  // Preset Recipe Loader
  const loadPresetRecipe = (presetId: string) => {
    const preset = presetRecipes.find((p) => p.id === presetId);
    if (!preset) return;

    setFormNameAr(preset.nameAr);
    setFormName(preset.nameEn);
    setFormSpecialty(preset.specialty);
    setFormDuration(preset.durationMinutes);
    setFormDescription(preset.description);

    setSelectedChemicals(preset.chemicalMaterials.map((c) => ({
      materialId: c.materialId,
      quantity: c.quantity,
      notes: c.notes,
    })));

    setSelectedDisposables(preset.singleUseDisposables.map((d) => ({
      materialId: d.materialId,
      quantity: d.quantity,
      notes: d.notes,
    })));

    setSelectedTools(preset.reusableInstruments.map((t) => ({
      toolId: t.toolId,
      notes: t.notes,
    })));
  };

  const openAddModal = () => {
    setFormNameAr('حشو كمبوزيت مباشر بسيط كلاس 1 (Direct Composite Simple Class 1)');
    setFormName('Direct Composite Simple Class 1');
    setFormSpecialty('Biomimetic Restorative');
    setFormCategory('DIRECT_RESTORATION');
    setFormDuration(35);
    setFormSterilization(75);
    setFormLabCost(0);
    setFormCommissionRate(35);
    setFormClinicMargin(40);
    setFormDescription('عزل مطاطي رابر دام، إزالة تسوس مع كاشف Caries Detector، تخريش انتقائي، بوند SE Bond، حشو نانو كمبوزيت Majesty/Filtek وتشذيب وتلميع.');

    // Default to Preset 1 (Class 1)
    if (presetRecipes.length > 0) {
      loadPresetRecipe(presetRecipes[0].id);
    }
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          name: formName || formNameAr,
          nameAr: formNameAr || formName,
          specialty: formSpecialty,
          category: formCategory,
          durationMinutes: numDuration,
          standardPrice: Math.round(fullRecommendedPrice),
          minCostRecoveryPrice: Math.round(zeroProfitBreakEven),
          targetContributionPrice: Math.round(targetContribution),
          targetFullMarginPrice: Math.round(fullRecommendedPrice),
          description: formDescription,
          recipeItems: [
            ...selectedChemicals.map((c) => ({ materialId: c.materialId, quantity: c.quantity, unit: 'DOSE' })),
            ...selectedDisposables.map((d) => ({ materialId: d.materialId, quantity: d.quantity, unit: 'PIECE' })),
          ],
        }),
      });

      const data = await res.json();
      if (data.success && data.service) {
        setServices([data.service, ...services]);
        setIsModalOpen(false);
      } else {
        alert(data.error || 'فشل حفظ الخدمة');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      alert('حدث خطأ أثناء حفظ الخدمة');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="دليل وحاسبة تسعير الخدمات السريرية"
        subtitle={`حساب تسعيرة كل خدمة بناءً على استهلاك الخامات الكيميائية + مستهلكات المريض + الأدوات المعقمة + وقت الكرسي (${chairMinuteRate.toFixed(2)} ج.م/دقيقة)`}
      />

      <div className="p-6 space-y-6">
        {/* Branch Context Strip */}
        <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-slate-900 text-white rounded-2xl p-5 border border-navy-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold shadow-inner">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-white flex items-center gap-2">
                <span>معايير تسعير {clinic.nameAr || clinic.name}:</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                  {clinic.code}
                </span>
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                دقيقة الكرسي الممتصة: <strong className="font-mono text-teal-300">{chairMinuteRate.toFixed(2)} ج.م/دقيقة</strong> | تعقيم وأدوات: <strong className="font-mono text-teal-300">محسوبة بالاستخدام</strong> | هامش ربح العيادة: <strong className="font-mono text-teal-300">40%</strong>
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            حاسبة تسعير خدمة سريرية (Class 1, Class 2, خلع)
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو الكود (Direct Composite Class 1, Biomimetic Class 2, Extraction)..."
              className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            عدد الخدمات المعتمدة: {filteredServices.length}
          </span>
        </div>

        {/* Services List Cards */}
        <div className="space-y-4">
          {filteredServices.map((srv) => {
            const chairCostForService = (srv.durationMinutes || 35) * chairMinuteRate;

            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs p-5 transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-navy-50 text-navy-800 font-mono text-[10px] font-bold border border-navy-100">
                        {srv.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {srv.specialty}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-navy-950 mt-1">
                      {srv.nameAr || srv.name}
                    </h3>
                    <p className="text-xs text-slate-500">{srv.name}</p>
                  </div>

                  {/* Standard Price Badge */}
                  <div className="text-end">
                    <span className="text-[10px] text-slate-400 block">السعر المعتمد للمريض</span>
                    <span className="text-2xl font-black font-mono text-navy-900">
                      {srv.standardPrice.toLocaleString()} <span className="text-xs text-slate-500">ج.م</span>
                    </span>
                  </div>
                </div>

                {srv.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    {srv.description}
                  </p>
                )}

                {/* 3 Pricing Calculations Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>1. استرداد التكلفة الصفرية</span>
                      <span title="تغطي الخامات والكرسي والأدوات والمعمل دون أي أرباح" className="cursor-help">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <p className="text-base font-bold font-mono text-slate-700 mt-1">
                      {srv.minCostRecoveryPrice.toLocaleString()} ج.م
                    </p>
                    <span className="text-[10px] text-slate-400">خامات + أدوات + كرسي (دون ربح)</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>2. سعر تغطية العمولة</span>
                      <span title="تغطي التكاليف المتغيرة مع عمولة الطبيب" className="cursor-help">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <p className="text-base font-bold font-mono text-sage-700 mt-1">
                      {srv.targetContributionPrice.toLocaleString()} ج.م
                    </p>
                    <span className="text-[10px] text-slate-400">تغطي المصاريف وعمولة الطبيب</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>3. السعر النهائي الموصى به</span>
                      <GuideTooltip topicId="clinicMargin" />
                    </div>
                    <p className="text-base font-bold font-mono text-navy-900 mt-1">
                      {srv.targetFullMarginPrice.toLocaleString()} ج.م
                    </p>
                    <span className="text-[10px] text-slate-400">شامل هامش ربح العيادة (40%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-sage-600" />
                    مدة الجلسة: <strong className="font-mono text-navy-900">{srv.durationMinutes} دقيقة</strong>
                    <span className="text-slate-400 font-normal">
                      (نصيب وقت الكرسي: {chairCostForService.toFixed(1)} ج.م)
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Costing Calculator Modal with 3 Categories + Presets */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-sage-600" />
                  حاسبة تسعير الإجراءات السريرية المتقدمة (Clinical Costing Engine)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حساب دقيق يشمل: الخامات الكيميائية + مستهلكات المريض + استهلاك الأدوات المعقمة + وقت الكرسي
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
            <form onSubmit={handleSaveService} className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Preset Procedure Quick Loader */}
              <div className="bg-gradient-to-r from-amber-50/90 to-teal-50/90 p-3.5 rounded-2xl border border-amber-200/80 space-y-2">
                <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-amber-700" />
                  ⚡ قوالب جاهزة بضغطة زر (اختر القالب ليملأ الخامات والأدوات والوقت فورياً):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {presetRecipes.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => loadPresetRecipe(preset.id)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-navy-950 text-xs font-bold border border-amber-300 shadow-2xs transition-all active:scale-95"
                    >
                      {preset.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    اسم الإجراء السريري بالعربي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: حشو كمبوزيت مباشر بسيط كلاس 1"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    الاسم بالإنجليزية (Clinical English)
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Direct Composite Simple Class 1"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Operating Time & Margins */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-navy-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sage-600" />
                  معايير وقت الكرسي، عمولة الطبيب وهامش العيادة:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>مدة الجلسة (بالدقائق) *</span>
                      <GuideTooltip topicId="chairMinuteAbsorption" />
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      required
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      نصيب الكرسي: <strong className="font-mono text-teal-700">{absorbedChairCost.toFixed(1)} ج.م</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      تكلفة المعمل (إن وجدت)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formLabCost}
                      onChange={(e) => setFormLabCost(e.target.value)}
                      placeholder="0 للحشو المباشر"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">0 للحشو المباشر</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>عمولة الطبيب %</span>
                      <GuideTooltip topicId="doctorCommission" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formCommissionRate}
                      onChange={(e) => setFormCommissionRate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">الموصى به: 35% من الصافي</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>هامش ربح العيادة %</span>
                      <GuideTooltip topicId="clinicMargin" />
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="70"
                      value={formClinicMargin}
                      onChange={(e) => setFormClinicMargin(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">المعيار الذهبي: 40%</span>
                  </div>
                </div>
              </div>

              {/* CATEGORY 1: CHEMICALS & DOSING (الخامات الكيميائية والجرعات) */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      1. الخامات الكيميائية ومستهلكات الجرعات (بوند، كومبوزيت، كاشف تسوس، بنج):
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      تستهلك تدريجياً بالقطرة أو الجرام أو الكاربول
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedChemicals([
                        ...selectedChemicals,
                        { materialId: materials[0]?.id || 'mat-se-bond-2', quantity: 1, notes: '' },
                      ])
                    }
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة خامة كيميائية
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedChemicals.map((chem, idx) => {
                    const mat = materialsList.find((m) => m.id === chem.materialId);
                    const cost = mat
                      ? chem.quantity * mat.costPerBaseUnit * (1 + (mat.unusableWastePercent || 10) / 100)
                      : 0;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-blue-100 shadow-2xs"
                      >
                        <select
                          value={chem.materialId}
                          onChange={(e) =>
                            setSelectedChemicals(
                              selectedChemicals.map((c, i) =>
                                i === idx ? { ...c, materialId: e.target.value } : c
                              )
                            )
                          }
                          className="flex-1 p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium"
                        >
                          {materialsList
                            .filter((m) => m.category !== 'SINGLE_USE_DISPOSABLE')
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nameAr || m.name} ({m.costPerBaseUnit.toFixed(2)} ج.م / {m.baseUnit})
                              </option>
                            ))}
                        </select>

                        <div className="w-20">
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            value={chem.quantity}
                            onChange={(e) =>
                              setSelectedChemicals(
                                selectedChemicals.map((c, i) =>
                                  i === idx ? { ...c, quantity: parseFloat(e.target.value) || 1 } : c
                                )
                              )
                            }
                            placeholder="الكمية"
                            className="w-full p-2 rounded-lg border border-slate-300 font-mono text-center bg-white text-xs font-bold"
                          />
                        </div>

                        <span className="text-xs font-mono text-slate-500 w-16 text-center">
                          {mat?.baseUnit || 'جرعة'}
                        </span>

                        <span className="font-mono font-bold text-blue-900 w-24 text-end text-xs">
                          {cost.toFixed(1)} ج.م
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedChemicals(selectedChemicals.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="text-end text-xs font-semibold text-slate-700 bg-blue-100/60 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-blue-900">إجمالي الخامات الكيميائية المباشرة:</span>
                  <strong className="font-mono text-blue-950 text-sm">{chemicalTotalCost.toFixed(1)} ج.م</strong>
                </div>
              </div>

              {/* CATEGORY 2: SINGLE-USE DISPOSABLES (مستهلكات الاستخدام لمرة واحدة) */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy-950 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      2. مستهلكات الاستخدام لمرة واحدة للمريض (شيت رابر دام، ميكروبرش، سحب لعاب):
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      تُستخدم لحالة واحدة وتُرمى فوراً وتكلفتها قطعية لكل مريض
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedDisposables([
                        ...selectedDisposables,
                        { materialId: 'disp-rubber-dam-sheet', quantity: 1, notes: '' },
                      ])
                    }
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة مستهلك لمرة واحدة
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedDisposables.map((disp, idx) => {
                    const mat = materialsList.find((m) => m.id === disp.materialId);
                    const cost = mat
                      ? disp.quantity * mat.costPerBaseUnit * (1 + (mat.unusableWastePercent || 5) / 100)
                      : 0;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs"
                      >
                        <select
                          value={disp.materialId}
                          onChange={(e) =>
                            setSelectedDisposables(
                              selectedDisposables.map((d, i) =>
                                i === idx ? { ...d, materialId: e.target.value } : d
                              )
                            )
                          }
                          className="flex-1 p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium"
                        >
                          {materialsList.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nameAr || m.name} ({m.costPerBaseUnit.toFixed(2)} ج.م / {m.baseUnit})
                            </option>
                          ))}
                        </select>

                        <div className="w-20">
                          <input
                            type="number"
                            step="any"
                            min="1"
                            value={disp.quantity}
                            onChange={(e) =>
                              setSelectedDisposables(
                                selectedDisposables.map((d, i) =>
                                  i === idx ? { ...d, quantity: parseFloat(e.target.value) || 1 } : d
                                )
                              )
                            }
                            placeholder="العدد"
                            className="w-full p-2 rounded-lg border border-slate-300 font-mono text-center bg-white text-xs font-bold"
                          />
                        </div>

                        <span className="text-xs font-mono text-slate-500 w-16 text-center">
                          {mat?.baseUnit || 'قطعة'}
                        </span>

                        <span className="font-mono font-bold text-emerald-900 w-24 text-end text-xs">
                          {cost.toFixed(1)} ج.م
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDisposables(selectedDisposables.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="text-end text-xs font-semibold text-slate-700 bg-emerald-100/60 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-emerald-900">إجمالي مستهلكات المريض أحادية الاستخدام:</span>
                  <strong className="font-mono text-emerald-950 text-sm">{disposablesTotalCost.toFixed(1)} ج.م</strong>
                </div>
              </div>

              {/* CATEGORY 3: REUSABLE STERILIZED INSTRUMENTS (الأدوات المعقمة متكررة الاستخدام) */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-navy-950 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-700" />
                      3. الأدوات متعددة الاستخدام المعقمة (أدوات الكومبوزيت، فورسيبس، أليفاتورز، سنابل):
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      تُعقم وتُستخدم لمئات المرات، وتكلفتها = (سعر الشراء ÷ عدد الاستخدامات) + دورة التعقيم
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTools([
                        ...selectedTools,
                        { toolId: reusableTools[0]?.id || 'tool-diagnostic-kit', notes: '' },
                      ])
                    }
                    className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة أداة معقمة
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedTools.map((toolDraft, idx) => {
                    const tool = reusableTools.find((t) => t.id === toolDraft.toolId);
                    const costPerCase = tool
                      ? tool.totalPerPatientCost || (tool.costPerUse + tool.sterilizationCycleCost) || 12
                      : 0;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs"
                      >
                        <select
                          value={toolDraft.toolId}
                          onChange={(e) =>
                            setSelectedTools(
                              selectedTools.map((t, i) =>
                                i === idx ? { ...t, toolId: e.target.value } : t
                              )
                            )
                          }
                          className="flex-1 p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-medium"
                        >
                          {reusableTools.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nameAr || t.name} (نصيب الحالة: {(t.totalPerPatientCost || 12).toFixed(1)} ج.م شامل التعقيم)
                            </option>
                          ))}
                        </select>

                        <div className="text-xs text-slate-500 font-mono">
                          {tool ? `عمر ${tool.expectedLifetimeUses} مرة` : ''}
                        </div>

                        <span className="font-mono font-bold text-amber-950 w-24 text-end text-xs">
                          {costPerCase.toFixed(1)} ج.م
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTools(selectedTools.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="text-end text-xs font-semibold text-slate-700 bg-amber-100/60 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-amber-900">إجمالي استهلاك الأدوات المعقمة والتعقيم:</span>
                  <strong className="font-mono text-amber-950 text-sm">{reusableToolsTotalCost.toFixed(1)} ج.م</strong>
                </div>
              </div>

              {/* Automatic Live Price Calculation Results */}
              <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border-2 border-emerald-400 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ملخص التكاليف وحساب السعر التلقائي:
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    مدة الجلسة: {numDuration} دقيقة
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">الخامات الكيميائية:</span>
                    <span className="font-mono font-bold text-blue-900">{chemicalTotalCost.toFixed(1)} ج.م</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">مستهلكات المريض:</span>
                    <span className="font-mono font-bold text-emerald-900">{disposablesTotalCost.toFixed(1)} ج.م</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">استهلاك الأدوات:</span>
                    <span className="font-mono font-bold text-amber-900">{reusableToolsTotalCost.toFixed(1)} ج.م</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">وقت الكرسي:</span>
                    <span className="font-mono font-bold text-teal-900">{absorbedChairCost.toFixed(1)} ج.م</span>
                  </div>
                </div>

                {/* 3 Pricing Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">1. استرداد التكلفة الصفرية:</span>
                    <p className="text-lg font-black font-mono text-slate-800 mt-1">
                      {Math.round(zeroProfitBreakEven).toLocaleString()} ج.م
                    </p>
                    <span className="text-[9px] text-slate-400">خامات + أدوات + كرسي (دون ربح)</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">2. سعر تغطية العمولة:</span>
                    <p className="text-lg font-black font-mono text-teal-800 mt-1">
                      {Math.round(targetContribution).toLocaleString()} ج.م
                    </p>
                    <span className="text-[9px] text-slate-400">تغطي المصاريف وعمولة الطبيب</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border-2 border-emerald-500 shadow-sm">
                    <span className="text-[10px] text-emerald-900 font-bold block">
                      3. السعر النهائي المقترح للمريض:
                    </span>
                    <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                      {Math.round(fullRecommendedPrice).toLocaleString()} ج.م
                    </p>
                    <span className="text-[9px] text-emerald-700 font-medium">شامل هامش ربح العيادة (40%)</span>
                  </div>
                </div>
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
                  className="px-6 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold transition-all shadow-md disabled:opacity-50 text-xs"
                >
                  {isSaving ? 'جاري الحفظ...' : 'اعتماد وحفظ الخدمة بقائمة الأسعار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
