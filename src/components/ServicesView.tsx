'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import {
  Stethoscope,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  Search,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface ServicesViewProps {
  services: any[];
  clinicId: string;
}

export default function ServicesView({ services, clinicId }: ServicesViewProps) {
  const { t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.nameAr && srv.nameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
      srv.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || srv.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={t.nav.services}
        subtitle="دليل الخدمات السريرية ووصفات الخامات الحيوية مع حسابات الأسعار الثلاثة (التكلفة الصفرية، هامش المساهمة، والسعر الكامل)"
      />

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الإجراء أو الكود (e.g. Class II, Cusp, Overlay, Molar Endo)..."
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
            const recipeItems = defaultRecipe?.items || [];
            const estimatedMaterialCost = recipeItems.reduce(
              (acc: number, item: any) =>
                acc + (item.standardQuantity || 0) * (item.material?.costPerBaseUnit || 0),
              0
            );

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
                    <span className="text-[10px] text-slate-400">Cost-Recovery Minimum</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>2. سعر هامش المساهمة</span>
                      <span title="تغطي التكاليف المتغيرة مع هامش ربح المساهمة المستهدف" className="cursor-help">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <p className="text-base font-bold font-mono text-sage-700 mt-1">
                      {srv.targetContributionPrice.toLocaleString()} ج.م
                    </p>
                    <span className="text-[10px] text-slate-400">Target Contribution Price</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>3. السعر النهائي الموصى به</span>
                      <span title="تغطي التكاليف الكاملة مع تحميل الكرسي وهامش الربح الكامل الصافي" className="cursor-help">
                        <HelpCircle className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <p className="text-base font-bold font-mono text-navy-900 mt-1">
                      {srv.targetFullMarginPrice.toLocaleString()} ج.م
                    </p>
                    <span className="text-[10px] text-slate-400">Full Operating Margin Price</span>
                  </div>
                </div>

                {/* Standard Recipe Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sage-600" />
                      مكونات الوصفة السريرية المعيارية ({recipeItems.length} مواد):
                    </span>
                    <span className="font-mono text-slate-600">
                      مدة الإجراء: {srv.durationMinutes} دقيقة | تكلفة المواد التقديرية: {estimatedMaterialCost.toFixed(1)} ج.م
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recipeItems.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        لا توجد وصفة محددة مسبقاً (استهلاك سريري مباشر)
                      </span>
                    ) : (
                      recipeItems.map((item: any) => (
                        <span
                          key={item.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                        >
                          <span>{item.material?.name || 'خامة'}</span>
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
    </div>
  );
}
