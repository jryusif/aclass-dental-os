'use client';

import React, { useState } from 'react';
import {
  Building2,
  Settings,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import GuideTooltip from './GuideTooltip';

interface Clinic {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  location: string;
  currency: string;
  monthlyFixedExpenses: number;
  activeChairs: number;
  dailyWorkingHours: number;
  workingDaysPerMonth: number;
  occupancyRate: number;
  breakEvenTargetMonthly: number;
}

interface BranchSettingsClientProps {
  initialClinics: Clinic[];
  activeClinicId: string;
}

export default function BranchSettingsClient({
  initialClinics,
  activeClinicId,
}: BranchSettingsClientProps) {
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [selectedId, setSelectedId] = useState<string>(activeClinicId || initialClinics[0]?.id || '');

  // Form states for active branch
  const activeBranch = clinics.find((c) => c.id === selectedId) || clinics[0];

  const [nameAr, setNameAr] = useState(activeBranch?.nameAr || '');
  const [name, setName] = useState(activeBranch?.name || '');
  const [location, setLocation] = useState(activeBranch?.location || '');
  const [monthlyFixedExpenses, setMonthlyFixedExpenses] = useState(activeBranch?.monthlyFixedExpenses || 30000);
  const [activeChairs, setActiveChairs] = useState(activeBranch?.activeChairs || 2);
  const [dailyWorkingHours, setDailyWorkingHours] = useState(activeBranch?.dailyWorkingHours || 8);
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(activeBranch?.workingDaysPerMonth || 26);
  const [occupancyRate, setOccupancyRate] = useState(activeBranch?.occupancyRate || 0.70);
  const [breakEvenTargetMonthly, setBreakEvenTargetMonthly] = useState(activeBranch?.breakEvenTargetMonthly || 35000);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Branch Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newBranchData, setNewBranchData] = useState({
    name: 'Cairo Dental Center - Branch 3',
    nameAr: 'كايرو دينتال سنتر - الفرع الجديد',
    code: 'CDC-BRANCH3',
    location: 'أسوان - مصر',
    monthlyFixedExpenses: 30000,
    activeChairs: 2,
    dailyWorkingHours: 8,
    workingDaysPerMonth: 26,
    occupancyRate: 0.70,
    breakEvenTargetMonthly: 35000,
  });
  const [isCreating, setIsCreating] = useState(false);

  // When selected branch changes, load its specific data
  const handleSelectBranch = (clinicId: string) => {
    setSelectedId(clinicId);
    const target = clinics.find((c) => c.id === clinicId);
    if (target) {
      setNameAr(target.nameAr);
      setName(target.name);
      setLocation(target.location);
      setMonthlyFixedExpenses(target.monthlyFixedExpenses);
      setActiveChairs(target.activeChairs);
      setDailyWorkingHours(target.dailyWorkingHours);
      setWorkingDaysPerMonth(target.workingDaysPerMonth);
      setOccupancyRate(target.occupancyRate);
      setBreakEvenTargetMonthly(target.breakEvenTargetMonthly);
      setSaveSuccess(false);

      // Set cookie and query param
      if (typeof window !== 'undefined') {
        document.cookie = `clinicId=${clinicId}; path=/; max-age=31536000`;
        const url = new URL(window.location.href);
        url.searchParams.set('clinicId', clinicId);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  // Live Calculations
  const totalAvailableHours = activeChairs * workingDaysPerMonth * dailyWorkingHours;
  const productiveBilledHours = totalAvailableHours * occupancyRate;
  const chairCostPerHour = productiveBilledHours > 0 ? monthlyFixedExpenses / productiveBilledHours : 0;

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/clinics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedId,
          name,
          nameAr,
          location,
          monthlyFixedExpenses,
          activeChairs,
          dailyWorkingHours,
          workingDaysPerMonth,
          occupancyRate,
          breakEvenTargetMonthly,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClinics((prev) =>
          prev.map((c) => (c.id === selectedId ? data.clinic : c))
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save branch settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new branch
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranchData),
      });
      const data = await res.json();
      if (data.success && data.clinic) {
        setClinics((prev) => [...prev, data.clinic]);
        handleSelectBranch(data.clinic.id);
        setIsNewModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create new branch:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Branch Selector & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              إدارة فروع مركز القاهرة لطب وجراحة وتجميل الأسنان
            </span>
            <h2 className="text-lg font-bold text-navy-950 mt-1">
              البيانات التشغيلية والمالية المستقلة لكل فرع
            </h2>
            <p className="text-xs text-slate-500">
              لكل فرع عدد كراسيه، ومصروفاته الثابتة، وساعات عمله، ومعدل إشغاله الخاص به بصورة معزولة تماماً.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Branch Switch Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {clinics.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectBranch(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-navy-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    {c.nameAr || c.name}
                  </button>
                );
              })}
            </div>

            {/* Add New Branch Button */}
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Branch Operational Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950">{nameAr || name}</h3>
              <p className="text-xs text-slate-500">{location} • كود الفرع: {activeBranch?.code}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccess ? 'تم حفظ التعديلات بنجاح!' : 'حفظ تعديلات الفرع'}</span>
          </button>
        </div>

        {/* Form Inputs Grid with GuideTooltips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Active Chairs */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">عدد كراسي الأسنان الفعالة</label>
              <GuideTooltip
                topicId="occupancyRate"
                label="دليل الطاقة التشغيلية"
              />
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={activeChairs}
              onChange={(e) => setActiveChairs(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-mono font-bold text-navy-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">عدد الوحدات المجهزة سريرياً لاستقبال المرضى بهذا الفرع.</p>
          </div>

          {/* Daily Working Hours */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">ساعات العمل اليومية للكرسي</label>
              <GuideTooltip
                topicId="dailyWorkingHours"
                label="دليل ساعات التشغيل"
                onApply={(val) => setDailyWorkingHours(Number(val))}
              />
            </div>
            <input
              type="number"
              step="0.5"
              min="1"
              max="24"
              value={dailyWorkingHours}
              onChange={(e) => setDailyWorkingHours(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-mono font-bold text-navy-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">الساعات اليومية المتاحة لاستقبال الحالات (الموصى به: 8 ساعات).</p>
          </div>

          {/* Monthly Working Days */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">أيام العمل الشهرية</label>
              <GuideTooltip
                topicId="workingDaysPerMonth"
                label="دليل أيام العمل"
                onApply={(val) => setWorkingDaysPerMonth(Number(val))}
              />
            </div>
            <input
              type="number"
              min="1"
              max="31"
              value={workingDaysPerMonth}
              onChange={(e) => setWorkingDaysPerMonth(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-mono font-bold text-navy-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">أيام استقبال الحالات بعد استبعاد الجمعة والإجازات (26 يوم).</p>
          </div>

          {/* Planned Occupancy Rate */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">معدل الإشغال المخطط (Occupancy %)</label>
              <GuideTooltip
                topicId="occupancyRate"
                label="دليل الإشغال الذهبي"
                onApply={(val) => setOccupancyRate(Number(val))}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.30"
                max="1.0"
                step="0.05"
                value={occupancyRate}
                onChange={(e) => setOccupancyRate(Number(e.target.value))}
                className="flex-1 accent-teal-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-teal-800 text-sm w-14 text-end">
                {(occupancyRate * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">النسبة العلمية الموصى بها في عيادات الـ Biomimetic: 70%.</p>
          </div>

          {/* Monthly Fixed Expenses */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">المصروفات الثابتة شهرياً للفرع</label>
              <GuideTooltip
                topicId="breakEvenTarget"
                label="دليل التكاليف الثابتة"
              />
            </div>
            <div className="relative">
              <input
                type="number"
                step="1000"
                value={monthlyFixedExpenses}
                onChange={(e) => setMonthlyFixedExpenses(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-mono font-bold text-navy-900 focus:ring-2 focus:ring-teal-500 focus:outline-none pl-12"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">ج.م</span>
            </div>
            <p className="text-[11px] text-slate-500">إيجار المقر، رواتب المساعدين والسكرتارية، الكهرباء، والإنترنت.</p>
          </div>

          {/* Monthly Break-Even Target */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">نقطة التعادل المستهدفة شهرياً</label>
              <GuideTooltip
                topicId="breakEvenTarget"
                label="دليل نقطة التعادل"
              />
            </div>
            <div className="relative">
              <input
                type="number"
                step="1000"
                value={breakEvenTargetMonthly}
                onChange={(e) => setBreakEvenTargetMonthly(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-mono font-bold text-navy-900 focus:ring-2 focus:ring-teal-500 focus:outline-none pl-12"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">ج.م</span>
            </div>
            <p className="text-[11px] text-slate-500">الإيراد المحصل المطلوب شهرياً لبدء تحقيق أرباح صافية بالفرع.</p>
          </div>
        </div>

        {/* Live Calculated Indicators Card */}
        <div className="p-5 bg-gradient-to-br from-navy-900 via-navy-850 to-teal-950 rounded-2xl text-white space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-xs font-bold text-teal-300 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              المؤشرات الاقتصادية التلقائية المحسوبة لـ ({nameAr || name})
            </h4>
            <span className="text-[10px] text-slate-300 font-mono">
              Absorption Costing Method
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[11px] text-slate-300 block">إجمالي الساعات المتاحة شهرياً</span>
              <p className="text-xl font-mono font-extrabold text-white mt-1">
                {totalAvailableHours.toLocaleString()} <span className="text-xs font-sans text-slate-400">ساعة</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {activeChairs} كراسي × {workingDaysPerMonth} يوم × {dailyWorkingHours} ساعة
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[11px] text-teal-300 block">ساعات العمل الفعلية المستهدفة</span>
              <p className="text-xl font-mono font-extrabold text-teal-200 mt-1">
                {productiveBilledHours.toFixed(0)} <span className="text-xs font-sans text-slate-400">ساعة إنتاجية</span>
              </p>
              <p className="text-[10px] text-teal-400 mt-1">
                بمعدل إشغال {(occupancyRate * 100).toFixed(0)}%
              </p>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <span className="text-[11px] text-amber-300 block">تكلفة تشغيل ساعة الكرسي المباشرة</span>
              <p className="text-xl font-mono font-extrabold text-amber-200 mt-1">
                {chairCostPerHour.toFixed(1)} <span className="text-xs font-sans text-slate-400">ج.م / ساعة</span>
              </p>
              <p className="text-[10px] text-amber-300/80 mt-1">
                نصيب كل دقيقة علاجية: {(chairCostPerHour / 60).toFixed(2)} ج.م
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add New Branch */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-navy-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-400" />
                  إضافة فرع جديد لمركز القاهرة لطب الأسنان
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  سيتم إنشاء قاعدة بيانات تشغيلية ومالية منفصلة للفرع فوراً.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBranch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy-900 block mb-1">اسم الفرع بالعربية</label>
                <input
                  type="text"
                  required
                  value={newBranchData.nameAr}
                  onChange={(e) => setNewBranchData({ ...newBranchData, nameAr: e.target.value })}
                  placeholder="مثال: كايرو دينتال سنتر - فرع دراو"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">اسم الفرع بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={newBranchData.name}
                    onChange={(e) => setNewBranchData({ ...newBranchData, name: e.target.value })}
                    placeholder="Cairo Dental Center - Daraw"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-navy-900 block mb-1">كود الفرع (Branch Code)</label>
                  <input
                    type="text"
                    required
                    value={newBranchData.code}
                    onChange={(e) => setNewBranchData({ ...newBranchData, code: e.target.value.toUpperCase() })}
                    placeholder="CDC-DARAW"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono uppercase focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">الموقع الجغرافي للفرع</label>
                <input
                  type="text"
                  required
                  value={newBranchData.location}
                  onChange={(e) => setNewBranchData({ ...newBranchData, location: e.target.value })}
                  placeholder="مثال: شارع السوق، دراو، أسوان"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">عدد كراسي الأسنان</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newBranchData.activeChairs}
                    onChange={(e) => setNewBranchData({ ...newBranchData, activeChairs: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-navy-900 block mb-1">المصروفات الثابتة الشهرية (ج.م)</label>
                  <input
                    type="number"
                    step="1000"
                    value={newBranchData.monthlyFixedExpenses}
                    onChange={(e) => setNewBranchData({ ...newBranchData, monthlyFixedExpenses: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'جاري الإنشاء...' : 'إنشاء الفرع وحفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
