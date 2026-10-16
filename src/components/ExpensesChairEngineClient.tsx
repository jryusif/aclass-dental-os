'use client';

import React, { useState } from 'react';
import Header from './Header';
import GuideTooltip from './GuideTooltip';
import {
  Wallet,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Building2,
  Users,
  Zap,
  Wrench,
  Laptop,
  CheckCircle2,
  Sparkles,
  X,
  HelpCircle,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  FileCheck,
  Paintbrush,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface ExpensesChairEngineProps {
  clinic: any;
  initialExpenses: any[];
}

export default function ExpensesChairEngineClient({
  clinic,
  initialExpenses,
}: ExpensesChairEngineProps) {
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [activeChairs, setActiveChairs] = useState<number>(clinic.activeChairs || 2);
  const [dailyHours, setDailyHours] = useState<number>(clinic.dailyWorkingHours || 8);
  const [workingDays, setWorkingDays] = useState<number>(clinic.workingDaysPerMonth || 26);
  const [occupancyRate, setOccupancyRate] = useState<number>(
    clinic.occupancyRate > 1 ? clinic.occupancyRate : (clinic.occupancyRate || 0.7) * 100
  );

  // Fit-out & Interior Renovation Amortization (تجهيزات وتشطيبات وديكور العيادة)
  const [fitoutTotalCost, setFitoutTotalCost] = useState<number | string>(300000);
  const [fitoutYears, setFitoutYears] = useState<number | string>(5);
  const [includeFitoutInChairRate, setIncludeFitoutInChairRate] = useState<boolean>(true);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  // Detailed items of clinic fit-out
  const [fitoutItems, setFitoutItems] = useState<{
    plumbing: number;
    electrical: number;
    hvac: number;
    finishes: number;
    furniture: number;
    facadeSignage: number;
  }>({
    plumbing: 75000,
    electrical: 60000,
    hvac: 50000,
    finishes: 45000,
    furniture: 40000,
    facadeSignage: 30000,
  });

  const [isSavingClinicParams, setIsSavingClinicParams] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isRegisteringAsset, setIsRegisteringAsset] = useState(false);
  const [assetSuccessMsg, setAssetSuccessMsg] = useState<string | null>(null);

  // Sync fit-out from localStorage per clinic branch
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(`dental_os_fitout_${clinic.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.totalCost !== undefined) setFitoutTotalCost(parsed.totalCost);
        if (parsed.years !== undefined) setFitoutYears(parsed.years);
        if (parsed.includeInRate !== undefined) setIncludeFitoutInChairRate(parsed.includeInRate);
        if (parsed.items) setFitoutItems(parsed.items);
      }
    } catch (e) {
      console.warn('Fitout load error:', e);
    }
  }, [clinic.id]);

  const handleUpdateFitout = (
    cost: number | string,
    years: number | string,
    include: boolean,
    customItems?: typeof fitoutItems
  ) => {
    setFitoutTotalCost(cost);
    setFitoutYears(years);
    setIncludeFitoutInChairRate(include);
    const itemsToSave = customItems || fitoutItems;
    if (customItems) setFitoutItems(customItems);
    try {
      localStorage.setItem(`dental_os_fitout_${clinic.id}`, JSON.stringify({
        totalCost: cost,
        years,
        includeInRate: include,
        items: itemsToSave,
      }));
    } catch (e) {
      console.warn('Fitout save error:', e);
    }
  };

  const handleItemChange = (field: keyof typeof fitoutItems, val: number | string) => {
    const num = Math.max(0, parseFloat(val as string) || 0);
    const updated = { ...fitoutItems, [field]: num };
    const sum = Object.values(updated).reduce((acc, curr) => acc + curr, 0);
    handleUpdateFitout(sum, fitoutYears, includeFitoutInChairRate, updated);
  };

  const applyPreset = (presetType: 'eco' | 'standard' | 'luxury') => {
    let newItems: typeof fitoutItems;
    let years = 5;
    if (presetType === 'eco') {
      newItems = {
        plumbing: 45000,
        electrical: 35000,
        hvac: 30000,
        finishes: 30000,
        furniture: 25000,
        facadeSignage: 15000,
      };
      years = 3;
    } else if (presetType === 'luxury') {
      newItems = {
        plumbing: 140000,
        electrical: 105000,
        hvac: 95000,
        finishes: 80000,
        furniture: 60000,
        facadeSignage: 40000,
      };
      years = 7;
    } else {
      // standard
      newItems = {
        plumbing: 75000,
        electrical: 60000,
        hvac: 50000,
        finishes: 45000,
        furniture: 40000,
        facadeSignage: 30000,
      };
      years = 5;
    }
    const sum = Object.values(newItems).reduce((acc, curr) => acc + curr, 0);
    handleUpdateFitout(sum, years, true, newItems);
  };

  // Calculations
  const numFitoutCost = parseFloat(fitoutTotalCost as string) || 0;
  const numFitoutYears = parseFloat(fitoutYears as string) || 5;
  const fitoutMonths = numFitoutYears * 12;
  const monthlyFitoutAmortization = fitoutMonths > 0 ? numFitoutCost / fitoutMonths : 0;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('SALARIES');
  const [formAmount, setFormAmount] = useState<number | string>(3500);
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Category definitions
  const categoryLabels: Record<string, { label: string; icon: any; color: string }> = {
    SALARIES: { label: 'مرتبات تمريض ومساعدين واستقبال', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    RENT: { label: 'إيجار مقر العيادة', icon: Building2, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    UTILITIES: { label: 'مرافق وكهرباء ومياه', icon: Zap, color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    MAINTENANCE: { label: 'صيانة دورية ومكافحة عدوى', icon: Wrench, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    INTERNET_SOFTWARE: { label: 'برمجيات واشتراكات وإنترنت', icon: Laptop, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    OTHER: { label: 'مصروفات تشغيلية أخرى', icon: Wallet, color: 'text-slate-700 bg-slate-50 border-slate-200' },
  };

  // Calculations
  const totalMonthlyOperationalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalMonthlyExpenses = includeFitoutInChairRate
    ? totalMonthlyOperationalExpenses + monthlyFitoutAmortization
    : totalMonthlyOperationalExpenses;

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  // Monthly Available & Effective Hours
  const totalMaxHours = activeChairs * dailyHours * workingDays;
  const effectiveHours = totalMaxHours * (occupancyRate / 100);

  // Direct Chair-Hour & Chair-Minute Rates
  const chairHourCost = effectiveHours > 0 ? totalMonthlyExpenses / effectiveHours : 0;
  const chairMinuteCost = chairHourCost / 60;
  const fitoutMinuteImpact = effectiveHours > 0 && includeFitoutInChairRate ? (monthlyFitoutAmortization / effectiveHours) / 60 : 0;

  const handleSaveClinicParams = async () => {
    setIsSavingClinicParams(true);
    setSaveSuccessMsg(null);
    try {
      const res = await fetch('/api/clinics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: clinic.id,
          monthlyFixedExpenses: Number(totalMonthlyExpenses.toFixed(2)),
          activeChairs,
          dailyWorkingHours: dailyHours,
          workingDaysPerMonth: workingDays,
          occupancyRate: occupancyRate > 1 ? occupancyRate / 100 : occupancyRate,
          breakEvenTargetMonthly: Number(totalMonthlyExpenses.toFixed(2)),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('✓ تم حفظ ومزامنة معايير التشغيل ومصروفات الكرسي بقاعدة بيانات الفرع بنجاح!');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'فشل حفظ التعديلات في قاعدة البيانات');
      }
    } catch (err) {
      console.error('Error saving clinic parameters:', err);
      alert('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsSavingClinicParams(false);
    }
  };

  const handleRegisterAsFixedAsset = async () => {
    if (!numFitoutCost || numFitoutCost <= 0) {
      alert('يرجى تحديد تكلفة التجهيزات والديكور أولاً');
      return;
    }
    setIsRegisteringAsset(true);
    setAssetSuccessMsg(null);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: clinic.id,
          assetType: 'DEVICE',
          name: `تجهيزات وتشطيبات وديكور العيادة - ${clinic.nameAr || clinic.name}`,
          nameAr: `تجهيزات وديكور العيادة - ${clinic.nameAr || clinic.name}`,
          category: 'CLINIC_FITOUT',
          purchasePrice: numFitoutCost,
          usefulLifeYears: numFitoutYears,
          notes: `إهلاك تشطيبات ديكور مسترد على ${numFitoutYears} سنوات بقسط شهري ${monthlyFitoutAmortization.toFixed(0)} ج.م (تأثير دقيقة الكرسي: +${fitoutMinuteImpact.toFixed(2)} ج.م)`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAssetSuccessMsg('✓ تم تسجيل التجهيزات والديكور كأصل ثابت معتمد في قاعدة بيانات العيادة بنجاح!');
        setTimeout(() => setAssetSuccessMsg(null), 5000);
      } else {
        alert(data.error || 'فشل تسجيل الأصل');
      }
    } catch (err) {
      console.error('Error registering asset:', err);
      alert('حدث خطأ أثناء تسجيل الأصل');
    } finally {
      setIsRegisteringAsset(false);
    }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setFormTitle('');
    setFormCategory('SALARIES');
    setFormAmount(4000);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: any) => {
    setEditingExpense(exp);
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormAmount(exp.amount);
    setFormDescription(exp.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد بالتأكيد حذف هذا البند من مصروفات الفرع؟')) return;

    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert(data.error || 'فشل حذف البند');
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingExpense) {
        const res = await fetch('/api/expenses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingExpense.id,
            title: formTitle,
            category: formCategory,
            amount: parseFloat(formAmount as string) || 0,
            description: formDescription,
          }),
        });
        const data = await res.json();
        if (data.success && data.expense) {
          setExpenses((prev) =>
            prev.map((item) => (item.id === data.expense.id ? data.expense : item))
          );
          setIsModalOpen(false);
        } else {
          alert(data.error || 'فشل التحديث');
        }
      } else {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicId: clinic.id,
            title: formTitle,
            category: formCategory,
            amount: parseFloat(formAmount as string) || 0,
            description: formDescription,
            isRecurring: true,
          }),
        });
        const data = await res.json();
        if (data.success && data.expense) {
          setExpenses((prev) => [data.expense, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(data.error || 'فشل الإضافة');
        }
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="المرتبات والمصروفات وحاسبة ساعة التشغيل"
        subtitle={`حساب تكلفة ساعة ودقيقة تشغيل الكرسي بـ ${clinic.nameAr || clinic.name} لتحديد نصيب كل خدمة من التكاليف الثابتة`}
      />

      <div className="p-6 space-y-6">
        {/* Hero Rate Summary Banner */}
        <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-slate-900 text-white rounded-2xl p-6 border border-navy-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 end-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold border border-teal-500/30">
                  {clinic.code} • {clinic.location}
                </span>
                <span className="text-xs text-slate-400">
                  معايير امتصاص التكاليف (Absorption Costing)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black font-serif text-white">
                معدل تكلفة ساعة ودقيقة التشغيل المباشرة
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                كل دقيقة يقضيها المريض على كرسي العيادة تستهلك هذا المبلغ من إجمالي المرتبات والإيجار والكهرباء والإنترنت. يتم تحميل هذا المعدل تلقائياً على كل إجراء سريري حسب مدته بالدقائق.
              </p>
            </div>

            {/* Rates Badges */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-navy-800/90 border border-teal-500/30 p-4 rounded-xl text-center shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>تكلفة ساعة الكرسي:</span>
                  <GuideTooltip topicId="chairMinuteAbsorption" />
                </div>
                <p className="text-2xl font-black font-mono text-teal-300">
                  {chairHourCost.toFixed(1)} <span className="text-xs font-sans text-slate-400">ج.م</span>
                </p>
                <span className="text-[10px] text-slate-400">Chair-Hour Rate</span>
              </div>

              <div className="bg-navy-800/90 border border-amber-500/30 p-4 rounded-xl text-center shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-semibold mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>تكلفة دقيقة الكرسي:</span>
                </div>
                <p className="text-2xl font-black font-mono text-amber-300">
                  {chairMinuteCost.toFixed(2)} <span className="text-xs font-sans text-slate-400">ج.م</span>
                </p>
                <span className="text-[10px] text-slate-400">Chair-Minute Rate</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Strip */}
          <div className="mt-5 pt-4 border-t border-navy-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-navy-850/60 p-2.5 rounded-lg border border-navy-700/60 flex items-center justify-between">
              <span className="text-slate-400">جلسة تشخيص أو فحص (15 دقيقة):</span>
              <span className="font-mono font-bold text-teal-300">{(chairMinuteCost * 15).toFixed(1)} ج.م</span>
            </div>
            <div className="bg-navy-850/60 p-2.5 rounded-lg border border-navy-700/60 flex items-center justify-between">
              <span className="text-slate-400">جلسة حشو كمبوزيت (45 دقيقة):</span>
              <span className="font-mono font-bold text-teal-300">{(chairMinuteCost * 45).toFixed(1)} ج.م</span>
            </div>
            <div className="bg-navy-850/60 p-2.5 rounded-lg border border-navy-700/60 flex items-center justify-between">
              <span className="text-slate-400">جلسة تحضير أوفرلاي (90 دقيقة):</span>
              <span className="font-mono font-bold text-teal-300">{(chairMinuteCost * 90).toFixed(1)} ج.م</span>
            </div>
          </div>
        </div>

        {/* Operating Capacity Parameters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sage-600" />
                معايير الطاقة التشغيلية وساعات الكرسي الفعالة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تعديل هذه الأرقام يعيد حساب تكلفة الساعة والدقيقة فوراً لكافة خدمات الفرع
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {saveSuccessMsg && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {saveSuccessMsg}
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveClinicParams}
                disabled={isSavingClinicParams}
                className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-950 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-teal-400" />
                {isSavingClinicParams ? 'جاري الحفظ...' : 'تثبيت ومزامنة المعايير بالفرع'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>عدد كراسي الأسنان:</span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={activeChairs}
                onChange={(e) => setActiveChairs(parseInt(e.target.value) || 1)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-sm bg-white"
              />
              <span className="text-[10px] text-slate-400 block">كراسي نشطة بالفرع</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>ساعات العمل اليومية:</span>
                <GuideTooltip topicId="dailyWorkingHours" />
              </div>
              <input
                type="number"
                step="0.5"
                min="4"
                max="16"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value) || 8)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-sm bg-white"
              />
              <span className="text-[10px] text-slate-400 block">ساعات استقبال المرضى</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>أيام العمل بالشهر:</span>
                <GuideTooltip topicId="workingDaysPerMonth" />
              </div>
              <input
                type="number"
                min="15"
                max="31"
                value={workingDays}
                onChange={(e) => setWorkingDays(parseInt(e.target.value) || 26)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-sm bg-white"
              />
              <span className="text-[10px] text-slate-400 block">استبعاد الجمعة كراحة أسبوعية</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>نسبة الإشغال المتوقعة %:</span>
                <GuideTooltip topicId="occupancyRate" />
              </div>
              <input
                type="number"
                min="30"
                max="100"
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(parseFloat(e.target.value) || 70)}
                className="w-full p-2 rounded-lg border border-slate-300 font-mono font-bold text-sm bg-white"
              />
              <span className="text-[10px] text-slate-400 block">الموصى به دولياً: 70%</span>
            </div>
          </div>

          <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
            <span className="text-slate-700">
              إجمالي الساعات المتاحة نظرياً: <strong className="font-mono">{totalMaxHours}</strong> ساعة شهرياً
            </span>
            <span className="text-sage-800 font-bold">
              الساعات الفعالة المحسوبة (بعد استبعاد أوقات الانتظار والتعقيم): <strong className="font-mono text-sm">{effectiveHours.toFixed(1)}</strong> ساعة شهرياً
            </span>
          </div>
        </div>

        {/* CLINIC FIT-OUT & DECORATION AMORTIZATION (تجهيزات وتشطيبات وديكور العيادة) */}
        <div className="bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50 rounded-2xl border border-amber-200/90 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-extrabold text-navy-950">
                  تجهيزات وتشطيبات وديكور العيادة (Clinic Fit-out & Renovation Amortization)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  أصل رأسمالي مسترد
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                تجهيز العيادة والديكور هو استثمار تأسيسي ثابت؛ محاسبياً يُهلك على 5 إلى 7 سنوات ليتحمل كل مريض نصيباً ضئيلاً جداً يضمن لك استرداد رأس مالك وتجديد العيادة مستقبلاً.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
              <label className="text-xs font-bold text-navy-950 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFitoutInChairRate}
                  onChange={(e) => handleUpdateFitout(fitoutTotalCost, fitoutYears, e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <span>ضم إهلاك التجهيزات لساعة الكرسي (موصى به)</span>
              </label>
            </div>
          </div>

          {/* Quick Setup Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-amber-100/50 rounded-xl border border-amber-200/80 text-xs">
            <span className="text-amber-950 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              نماذج جاهزة لتقدير التأسيس:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('eco')}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 rounded-lg border border-amber-200 font-medium text-[11px] transition-colors"
              >
                تأسيس اقتصادي (كرسي واحد - 180 ألف)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('standard')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors"
              >
                تأسيس نموذجي (كرسيان - 300 ألف)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('luxury')}
                className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 rounded-lg border border-amber-200 font-medium text-[11px] transition-colors"
              >
                مجمع فاخر (3 كراسي - 520 ألف)
              </button>
            </div>
          </div>

          {/* 4 Main Parameter Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 font-semibold mb-1">
                  إجمالي تكلفة التشطيب والديكور (ج.م):
                </label>
              </div>
              <input
                type="number"
                min="0"
                step="5000"
                value={fitoutTotalCost}
                onChange={(e) => handleUpdateFitout(e.target.value, fitoutYears, includeFitoutInChairRate)}
                placeholder="300000"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-sm bg-slate-50 focus:bg-white text-navy-950"
              />
              <span className="text-[10px] text-slate-400 block">سباكة + كهرباء + دهانات + فرش + لافتات</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
              <label className="block text-slate-700 font-semibold mb-1">
                فترة استرداد وإهلاك الديكور (سنوات):
              </label>
              <select
                value={fitoutYears}
                onChange={(e) => handleUpdateFitout(fitoutTotalCost, e.target.value, includeFitoutInChairRate)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-xs bg-slate-50 focus:bg-white text-navy-950"
              >
                <option value="3">3 سنوات (36 شهراً - استرداد سريع)</option>
                <option value="5">5 سنوات (60 شهراً - المعيار الذهبي الموصى به)</option>
                <option value="7">7 سنوات (84 شهراً - تشطيبات فاخرة ومعمرة)</option>
                <option value="10">10 سنوات (120 شهراً - عقارات ملك)</option>
              </select>
              <span className="text-[10px] text-slate-400 block">العرف الطبي المحاسبي: 5 إلى 7 سنوات</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs space-y-1">
              <span className="text-slate-500 text-[11px] block">القسط الشهري لإهلاك وتجديد الديكور:</span>
              <p className="text-lg font-black font-mono text-amber-900 mt-1">
                {monthlyFitoutAmortization.toFixed(0)} <span className="text-xs font-sans text-slate-600">ج.م / شهر</span>
              </p>
              <span className="text-[10px] text-emerald-700 font-medium block">
                {includeFitoutInChairRate ? '✓ محمل على المصروفات الشهرية' : 'مستبعد من الحسبة حالياً'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-300/80 shadow-2xs bg-amber-50/40 space-y-1">
              <span className="text-amber-950 text-[11px] font-bold block">الأثر على تكلفة دقيقة الكرسي:</span>
              <p className="text-lg font-black font-mono text-amber-900 mt-1">
                +{fitoutMinuteImpact.toFixed(2)} <span className="text-xs font-sans text-slate-600">ج.م / دقيقة</span>
              </p>
              <span className="text-[10px] text-slate-600 block">
                جلسة الكومبوزيت (35 دقيقة) = +{(fitoutMinuteImpact * 35).toFixed(1)} ج.م فقط!
              </span>
            </div>
          </div>

          {/* Itemized Breakdown Collapsible Accordion */}
          <div className="bg-white/80 rounded-xl border border-amber-200/80 p-3.5 space-y-3">
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-between text-xs font-bold text-navy-950 hover:text-amber-900 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-amber-600" />
                <span>تفصيل بنود التشطيب والتجهيز التأسيسي (Dental Fit-out Infrastructure Breakdown)</span>
                <span className="text-[10px] font-normal text-slate-500">
                  (اضغط {showBreakdown ? 'لإخفاء' : 'لفتح'} تفاصيل السباكة والكهرباء والتهوية والفرش)
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showBreakdown && (
              <div className="pt-3 border-t border-amber-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    1. السباكة وشبكة الهواء والشفاط الطبي:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={fitoutItems.plumbing}
                    onChange={(e) => handleItemChange('plumbing', e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 font-mono font-bold text-xs bg-white text-navy-950"
                  />
                  <span className="text-[10px] text-slate-400 block">مواسير ضغط هواء + تصريف معقم للكراسي</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    2. التجهيزات الكهربائية ولوحات الحماية:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={fitoutItems.electrical}
                    onChange={(e) => handleItemChange('electrical', e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 font-mono font-bold text-xs bg-white text-navy-950"
                  />
                  <span className="text-[10px] text-slate-400 block">كابلات معزولة + إنارة LED عيادية + لوحات قواطع</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    3. التكييفات وشبكة التهوية (HVAC):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={fitoutItems.hvac}
                    onChange={(e) => handleItemChange('hvac', e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 font-mono font-bold text-xs bg-white text-navy-950"
                  />
                  <span className="text-[10px] text-slate-400 block">تكييفات غرف العمليات وصالة الانتظار</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    4. الأرضيات والدهانات المقاومة للبكتيريا:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={fitoutItems.finishes}
                    onChange={(e) => handleItemChange('finishes', e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 font-mono font-bold text-xs bg-white text-navy-950"
                  />
                  <span className="text-[10px] text-slate-400 block">فينيل طبي أو بورسلين معالج + دهانات معقمة</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    5. أثاث الاستقبال والانتظار والمكتب:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={fitoutItems.furniture}
                    onChange={(e) => handleItemChange('furniture', e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 font-mono font-bold text-xs bg-white text-navy-950"
                  />
                  <span className="text-[10px] text-slate-400 block">كاونتر استقبال + كراسي انتظار طبية + مكتب استشارة</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <label className="block text-slate-700 font-semibold text-[11px]">
                    6. الواجهة الخارجية واللافتات والباب الزجاجي:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={fitoutItems.facadeSignage}
                    onChange={(e) => handleItemChange('facadeSignage', e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 font-mono font-bold text-xs bg-white text-navy-950"
                  />
                  <span className="text-[10px] text-slate-400 block">لافتة مضيئة + كلادينج + باب سيكوريت عازل</span>
                </div>
              </div>
            )}
          </div>

          {/* Procedure Absorption & Payback Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
            {/* Impact on Real Procedures */}
            <div className="lg:col-span-2 bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                نصيب كل إجراء سريري من إهلاك وتجديد الديكور (حسب مدة الجلسة):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 text-center">
                  <span className="text-[10px] text-slate-500 block">فحص واستشارة (15 د)</span>
                  <span className="font-mono font-bold text-amber-900 text-xs mt-0.5 block">
                    +{(fitoutMinuteImpact * 15).toFixed(1)} ج.م
                  </span>
                </div>
                <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 text-center">
                  <span className="text-[10px] text-slate-500 block">حشو كمبوزيت (35 د)</span>
                  <span className="font-mono font-bold text-amber-900 text-xs mt-0.5 block">
                    +{(fitoutMinuteImpact * 35).toFixed(1)} ج.م
                  </span>
                </div>
                <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 text-center">
                  <span className="text-[10px] text-slate-500 block">تحضير فينير/تاج (60 د)</span>
                  <span className="font-mono font-bold text-amber-900 text-xs mt-0.5 block">
                    +{(fitoutMinuteImpact * 60).toFixed(1)} ج.م
                  </span>
                </div>
                <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 text-center">
                  <span className="text-[10px] text-slate-500 block">علاج عصب متبدل (90 د)</span>
                  <span className="font-mono font-bold text-amber-900 text-xs mt-0.5 block">
                    +{(fitoutMinuteImpact * 90).toFixed(1)} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Fixed Asset Sync & Payback Action */}
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between gap-2.5">
              <div>
                <span className="text-slate-700 font-bold flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  التوثيق بسجل الأصول الثابتة:
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  تسجيل تكلفة الديكور كأصل ثابت معتمد بقاعدة البيانات لحساب الإهلاك المحاسبي في تقارير المركز والميزانية.
                </p>
              </div>

              <div>
                {assetSuccessMsg && (
                  <div className="mb-2 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] font-bold text-emerald-800 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{assetSuccessMsg}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRegisterAsFixedAsset}
                  disabled={isRegisteringAsset}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {isRegisteringAsset ? 'جاري التسجيل...' : 'تسجيل كأصل ثابت بسجل المركز'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Category Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {Object.entries(categoryLabels).map(([catKey, catInfo]) => {
            const Icon = catInfo.icon;
            const catTotal = expensesByCategory[catKey] || 0;
            const pct = totalMonthlyExpenses > 0 ? ((catTotal / totalMonthlyExpenses) * 100).toFixed(0) : '0';

            return (
              <div
                key={catKey}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg border ${catInfo.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{pct}%</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-600 block line-clamp-1">
                    {catInfo.label.split(' ')[0]}
                  </span>
                  <p className="text-sm font-black font-mono text-navy-950 mt-0.5">
                    {catTotal.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">ج.م</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expenses List & Manager */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-navy-950">
                  قائمة بنود المصروفات والمرتبات الشهرية
                </h3>
                <GuideTooltip topicId="nurseSalaries" />
              </div>
              <p className="text-xs text-slate-500">
                إجمالي المصروفات الثابتة المسجلة: <strong className="font-mono text-navy-900">{totalMonthlyExpenses.toLocaleString()} ج.م / شهر</strong>
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              إضافة بند مصروف / مرتب جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-start">بند المصروف / المرتب</th>
                  <th className="py-2.5 px-3 text-start">التصنيف</th>
                  <th className="py-2.5 px-3 text-end">المبلغ الشهري</th>
                  <th className="py-2.5 px-3 text-end">نصيب ساعة الكرسي منه</th>
                  <th className="py-2.5 px-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      لا توجد بنود مصروفات مسجلة حالياً لهذا الفرع
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => {
                    const catMeta = categoryLabels[exp.category] || categoryLabels.OTHER;
                    const hourlyShare = effectiveHours > 0 ? (exp.amount || 0) / effectiveHours : 0;

                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-bold text-navy-950">{exp.title}</p>
                          {exp.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{exp.description}</p>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${catMeta.color}`}>
                            {catMeta.label}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-end font-mono font-bold text-navy-900 text-sm">
                          {exp.amount.toLocaleString()} ج.م
                        </td>

                        <td className="py-3 px-3 text-end font-mono text-slate-600">
                          {hourlyShare.toFixed(1)} ج.م / ساعة
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(exp)}
                              className="p-1.5 text-slate-400 hover:text-sage-700 hover:bg-sage-50 rounded-md transition-colors"
                              title="تعديل"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-sage-600" />
                {editingExpense ? 'تعديل بند المصروف / المرتب' : 'إضافة بند مصروف أو مرتب شهري جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  اسم البند *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثلاً: مرتب ممرضة مساعدة أولى، إيجار مقر كوم امبو، صيانة الأوتوكلاف"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    تصنيف البند *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                  >
                    <option value="SALARIES">مرتبات تمريض ومساعدين واستقبال</option>
                    <option value="RENT">إيجار العيادة</option>
                    <option value="UTILITIES">مرافق وكهرباء ومياه</option>
                    <option value="MAINTENANCE">صيانة دورية وتعقيم</option>
                    <option value="INTERNET_SOFTWARE">برمجيات وإنترنت واشتراكات</option>
                    <option value="OTHER">مصروفات تشغيلية أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    المبلغ الشهري (ج.م) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="3500"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold focus:ring-1 focus:ring-sage-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  ملاحظات أو تفاصيل إضافية
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="مثال: يخص وردية المساء، أو تجديد العقد السنوي"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
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
                  className="px-5 py-2 rounded-lg bg-sage-600 hover:bg-sage-700 text-white font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : editingExpense ? 'تحديث البند' : 'إضافة وحفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
