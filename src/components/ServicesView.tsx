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
} from 'lucide-react';

interface ServicesViewProps {
  services: any[];
  clinic: any;
  materials: any[];
  clinicId: string;
}

export default function ServicesView({
  services: initialServices,
  clinic,
  materials = [],
  clinicId,
}: ServicesViewProps) {
  const { t } = useApp();
  const [services, setServices] = useState(initialServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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
  const [formDuration, setFormDuration] = useState<number | string>(45);
  const [formSterilization, setFormSterilization] = useState<number | string>(75);
  const [formLabCost, setFormLabCost] = useState<number | string>(0);
  const [formCommissionRate, setFormCommissionRate] = useState<number | string>(35);
  const [formClinicMargin, setFormClinicMargin] = useState<number | string>(40);
  const [formDescription, setFormDescription] = useState('');

  // Recipe Builder Items
  interface RecipeDraftItem {
    materialId: string;
    materialName: string;
    unitCost: number;
    unit: string;
    quantity: number;
    wastePercent: number;
  }
  const [recipeItems, setRecipeItems] = useState<RecipeDraftItem[]>([
    {
      materialId: materials[0]?.id || '',
      materialName: materials[0]?.nameAr || materials[0]?.name || 'لاصق بوند',
      unitCost: materials[0]?.costPerBaseUnit || 13,
      unit: materials[0]?.baseUnit || 'APPLICATION',
      quantity: 2,
      wastePercent: 10,
    },
  ]);

  const categories = [
    { key: 'ALL', label: 'جميع الخدمات السريرية' },
    { key: 'DIRECT_RESTORATION', label: 'حشوات وترميمات مباشرة (Biomimetic Composite)' },
    { key: 'INDIRECT_RESTORATION', label: 'تركيبات حيوية وإنلاي وأوفرلاي (Inlay & Overlay)' },
    { key: 'ENDODONTICS', label: 'علاج الجذور المجهري (Endodontics)' },
    { key: 'SURGERY_IMPLANT', label: 'جراحة وزراعة أسنان (Surgery & Implants)' },
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

  // Live Costing Calculator Engine for Form
  const numDuration = parseFloat(formDuration as string) || 45;
  const numSterilization = parseFloat(formSterilization as string) || 75;
  const numLab = parseFloat(formLabCost as string) || 0;
  const numCommission = (parseFloat(formCommissionRate as string) || 35) / 100;
  const numMargin = (parseFloat(formClinicMargin as string) || 40) / 100;

  // Direct Chair Time Cost = duration in mins * chairMinuteRate
  const absorbedChairCost = numDuration * chairMinuteRate;

  // Direct Material Cost from Recipe
  const totalDirectMaterialCost = recipeItems.reduce((acc, item) => {
    const wasteFactor = 1 + (item.wastePercent || 0) / 100;
    return acc + (item.quantity * item.unitCost * wasteFactor);
  }, 0);

  // 1. Zero Profit Cost-Recovery Price (التكلفة الصفرية)
  // Covers direct materials, sterilization, absorbed chair-time, and lab with 0 profit
  const minCostRecovery = totalDirectMaterialCost + absorbedChairCost + numSterilization + numLab;

  // 2. Target Contribution Price (سعر هامش المساهمة)
  // Variable costs + commission coverage
  const targetContribution = (totalDirectMaterialCost + numSterilization + numLab) / Math.max(0.2, 1 - numCommission);

  // 3. Full Operating Margin Price (السعر الكامل الموصى به للمريض)
  // Total cost / (1 - doctor commission - clinic net margin)
  const remainingShare = 1 - numCommission - numMargin;
  const fullRecommendedPrice = remainingShare > 0.1
    ? minCostRecovery / remainingShare
    : minCostRecovery * 1.8;

  const addRecipeItem = () => {
    if (materials.length === 0) return;
    const defaultMat = materials[0];
    setRecipeItems([
      ...recipeItems,
      {
        materialId: defaultMat.id,
        materialName: defaultMat.nameAr || defaultMat.name,
        unitCost: defaultMat.costPerBaseUnit || 10,
        unit: defaultMat.baseUnit || 'APPLICATION',
        quantity: 1,
        wastePercent: 10,
      },
    ]);
  };

  const removeRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateRecipeMaterial = (index: number, matId: string) => {
    const mat = materials.find((m) => m.id === matId);
    if (!mat) return;
    setRecipeItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              materialId: mat.id,
              materialName: mat.nameAr || mat.name,
              unitCost: mat.costPerBaseUnit,
              unit: mat.baseUnit,
            }
          : item
      )
    );
  };

  const updateRecipeQty = (index: number, qty: number) => {
    setRecipeItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item))
    );
  };

  const openAddModal = () => {
    setFormNameAr('');
    setFormName('');
    setFormSpecialty('Biomimetic Restorative');
    setFormCategory('DIRECT_RESTORATION');
    setFormDuration(45);
    setFormSterilization(75);
    setFormLabCost(0);
    setFormCommissionRate(35);
    setFormClinicMargin(40);
    setFormDescription('');
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
          minCostRecoveryPrice: Math.round(minCostRecovery),
          targetContributionPrice: Math.round(targetContribution),
          targetFullMarginPrice: Math.round(fullRecommendedPrice),
          description: formDescription,
          recipeItems,
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
        subtitle={`حساب تسعيرة كل خدمة بناءً على استهلاك الخامات + وقت الكرسي (${chairMinuteRate.toFixed(2)} ج.م/دقيقة) + التعقيم + هامش الربح`}
      />

      <div className="p-6 space-y-6">
        {/* Branch Context Strip */}
        <div className="bg-gradient-to-r from-navy-900 to-slate-900 text-white rounded-xl p-4 border border-navy-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">
                معايير تسعير {clinic.nameAr || clinic.name}:
              </p>
              <p className="text-xs text-slate-300">
                تكلفة دقيقة الكرسي الممتصة: <strong className="font-mono text-teal-300">{chairMinuteRate.toFixed(2)} ج.م/دقيقة</strong> | تعقيم المريض: <strong className="font-mono text-teal-300">75 ج.م</strong> | هامش العيادة: <strong className="font-mono text-teal-300">40%</strong>
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            حاسبة تسعير خدمة جديدة
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
              placeholder="بحث بالاسم أو الكود (Class II, Overlay, Molar Endo)..."
              className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
            />
          </div>

          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            عدد الخدمات: {filteredServices.length}
          </span>
        </div>

        {/* Services List Cards */}
        <div className="space-y-4">
          {filteredServices.map((srv) => {
            const defaultRecipe = srv.recipes?.[0];
            const recipeItemsList = defaultRecipe?.items || [];
            const estimatedMaterialCost = recipeItemsList.reduce(
              (acc: number, item: any) =>
                acc + (item.standardQuantity || 0) * (item.material?.costPerBaseUnit || 0),
              0
            );
            const chairCostForService = (srv.durationMinutes || 45) * chairMinuteRate;

            return (
              <div
                key={srv.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs p-5 transition-all space-y-4"
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
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {srv.description}
                  </p>
                )}

                {/* 3 Pricing Calculations Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>1. استرداد التكلفة الصفرية</span>
                      <span title="تغطي الخامات والكرسي والمعمل دون أي أرباح" className="cursor-help">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <p className="text-base font-bold font-mono text-slate-700 mt-1">
                      {srv.minCostRecoveryPrice.toLocaleString()} ج.م
                    </p>
                    <span className="text-[10px] text-slate-400">خامات + كرسي + تعقيم (دون ربح)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>2. سعر هامش المساهمة</span>
                      <span title="تغطي التكاليف المتغيرة مع عمولة الطبيب" className="cursor-help">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <p className="text-base font-bold font-mono text-sage-700 mt-1">
                      {srv.targetContributionPrice.toLocaleString()} ج.م
                    </p>
                    <span className="text-[10px] text-slate-400">تغطي المصاريف وعمولة الطبيب</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
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

                {/* Recipe & Duration Summary */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-600 gap-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-sage-600" />
                      مدة الجلسة: <strong className="font-mono text-navy-900">{srv.durationMinutes} دقيقة</strong>
                      <span className="text-slate-400 font-normal">
                        (استهلاك وقت الكرسي: {chairCostForService.toFixed(1)} ج.م)
                      </span>
                    </span>

                    <span className="font-mono text-slate-600">
                      تكلفة الخامات المباشرة: <strong className="text-sage-800">{estimatedMaterialCost.toFixed(1)} ج.م</strong>
                    </span>
                  </div>

                  {/* Recipe Items Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {recipeItemsList.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        استهلاك خامات سريري مباشر
                      </span>
                    ) : (
                      recipeItemsList.map((item: any) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                        >
                          <span>{item.material?.nameAr || item.material?.name || 'خامة'}</span>
                          <span className="font-mono font-bold text-sage-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                            {item.standardQuantity} {item.unit}
                          </span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Costing Calculator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-sage-600" />
                  حاسبة تسعير خدمة سريرية جديدة (Procedure Costing Engine)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حساب السعر التلقائي بناءً على وقت الكرسي، الخامات، التعقيم، وعمولة الطبيب وهامش العيادة
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
            <form onSubmit={handleSaveService} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Service Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    اسم الإجراء بالعربي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    placeholder="مثال: أوفرلاي كمبوزيت مباشر (Direct Biomimetic Overlay)"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
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
                    placeholder="Direct Composite Overlay"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Time & Fixed Parameters */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-navy-950 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sage-600" />
                  معايير وقت الكرسي والتعقيم والمعمل:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>تكلفة التعقيم (ج.م)</span>
                      <GuideTooltip topicId="sterilizationPerPatient" />
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formSterilization}
                      onChange={(e) => setFormSterilization(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">المعيار: 75 ج.م/مريض</span>
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
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                      <span>عمولة / أتعاب الطبيب %</span>
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
                      <span>هامش ربح العيادة الصافي %</span>
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

              {/* Recipe Items (Materials Consumed) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-navy-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sage-600" />
                    الخامات السريرية المستهلكة في الإجراء:
                  </h4>
                  <button
                    type="button"
                    onClick={addRecipeItem}
                    className="text-xs text-sage-700 hover:text-sage-900 font-bold flex items-center gap-1 bg-sage-50 px-3 py-1.5 rounded-lg border border-sage-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة خامة للوصفة
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recipeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200"
                    >
                      <select
                        value={item.materialId}
                        onChange={(e) => updateRecipeMaterial(idx, e.target.value)}
                        className="flex-1 p-2 rounded-md border border-slate-300 bg-white text-xs"
                      >
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nameAr || m.name} ({m.costPerBaseUnit.toFixed(2)} ج.م/{m.baseUnit})
                          </option>
                        ))}
                      </select>

                      <div className="w-24">
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          value={item.quantity}
                          onChange={(e) => updateRecipeQty(idx, parseFloat(e.target.value) || 1)}
                          placeholder="الكمية"
                          className="w-full p-2 rounded-md border border-slate-300 font-mono text-center bg-white text-xs"
                        />
                      </div>

                      <span className="text-xs font-mono text-slate-500 w-16 text-center">
                        {item.unit}
                      </span>

                      <span className="font-mono font-bold text-sage-900 w-24 text-end text-xs">
                        {(item.quantity * item.unitCost * (1 + (item.wastePercent || 0) / 100)).toFixed(1)} ج.م
                      </span>

                      <button
                        type="button"
                        onClick={() => removeRecipeItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-end text-xs font-semibold text-slate-700 bg-slate-100 p-2 rounded-lg">
                  إجمالي تكلفة الخامات المباشرة: <strong className="font-mono text-sage-900 text-sm">{totalDirectMaterialCost.toFixed(1)} ج.م</strong>
                </div>
              </div>

              {/* Automatic Live Price Calculation Results */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-300 space-y-3">
                <span className="text-xs font-bold text-emerald-950 block">
                  الحسابات التلقائية المباشرة للتسعير:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">1. استرداد التكلفة الصفرية:</span>
                    <p className="text-lg font-black font-mono text-slate-800 mt-1">
                      {Math.round(minCostRecovery).toLocaleString()} ج.م
                    </p>
                    <span className="text-[9px] text-slate-400">خامات + كرسي + تعقيم</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-500 block">2. سعر تغطية العمولة:</span>
                    <p className="text-lg font-black font-mono text-teal-800 mt-1">
                      {Math.round(targetContribution).toLocaleString()} ج.م
                    </p>
                    <span className="text-[9px] text-slate-400">تكاليف متغيرة + عمولة</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border-2 border-emerald-500 shadow-xs">
                    <span className="text-[10px] text-emerald-900 font-bold block">
                      3. السعر النهائي المقترح للمريض:
                    </span>
                    <p className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                      {Math.round(fullRecommendedPrice).toLocaleString()} ج.م
                    </p>
                    <span className="text-[9px] text-emerald-700 font-medium">شامل هامش الربح والكرسي</span>
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
                  className="px-5 py-2 rounded-lg bg-sage-600 hover:bg-sage-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ الخدمة في دليل الأسعار'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
