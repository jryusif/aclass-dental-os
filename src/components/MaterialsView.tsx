'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import {
  FlaskConical,
  Search,
  Plus,
  Clock,
  Layers,
  ShieldCheck,
  Package,
  AlertTriangle,
  ChevronDown,
  Info,
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

  const categories = [
    { key: 'ALL', label: 'جميع الخامات' },
    { key: 'ADHESIVES', label: 'أنظمة الربط واللواصق (Adhesives)' },
    { key: 'COMPOSITES', label: 'كمبوزيت حشوات (Composites)' },
    { key: 'BIOMIMETIC_FIBERS', label: 'ألياف حيوية مقواة (Ribbond & EverX)' },
    { key: 'ENDODONTICS', label: 'علاج الجذور وبيوسيراميك (Endodontics)' },
    { key: 'ISOLATION', label: 'العزل الميداني (Rubber Dam)' },
    { key: 'ANESTHETICS', label: 'المخدر الموضعي (Anesthetics)' },
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

  const getEvidenceBadge = (level: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      MANUFACTURER: { text: 'مواصفة المصنع', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      PUBLISHED_EVIDENCE: { text: 'دليل سريري موثق', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      MEASURED_CLINIC: { text: 'مقاس بعيادة إيه كلاس', color: 'bg-sage-50 text-sage-800 border-sage-300' },
      DENTIST_ESTIMATE: { text: 'تقدير الطبيب', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      TEMPORARY_DEFAULT: { text: 'افتراضي قيد المعايرة', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    };
    const b = badges[level] || badges.TEMPORARY_DEFAULT;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${b.color}`}>
        {b.text}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={t.materials.title}
        subtitle={t.materials.subtitle}
      />

      <div className="p-6 space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم التجاري، الكود SKU، الشركة المصنعة (e.g. SE Bond, EverX, Ribbond)..."
                className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-sage-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              إجمالي الخامات: {filteredMaterials.length}
            </span>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => {
            const totalStockBase = mat.lots.reduce(
              (acc: number, l: any) => acc + (l.currentStockBaseUnits || 0),
              0
            );
            const totalPackagesEquivalent =
              mat.conversionFactor > 0 ? (totalStockBase / mat.conversionFactor).toFixed(1) : 0;
            const isShortage = totalStockBase <= mat.reorderThreshold * mat.conversionFactor;

            return (
              <div
                key={mat.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-50 text-navy-800 font-bold border border-navy-100">
                        {mat.sku}
                      </span>
                      <h3 className="text-sm font-bold text-navy-950 mt-1.5 line-clamp-1">
                        {mat.nameAr || mat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 font-sans">
                        {mat.brand} — {mat.manufacturer}
                      </p>
                    </div>
                    {getEvidenceBadge(mat.evidenceLevel)}
                  </div>

                  {mat.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-2.5 border border-slate-100 line-clamp-2">
                      {mat.notes}
                    </p>
                  )}

                  {/* Stock & Cost Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">سعر وحدة الأساس</p>
                      <p className="font-bold font-mono text-navy-900">
                        {mat.costPerBaseUnit.toFixed(2)} ج.م / {mat.baseUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">معامل التحويل</p>
                      <p className="font-mono text-slate-700">
                        1 {mat.packageUnit} = {mat.conversionFactor} {mat.baseUnit}
                      </p>
                    </div>
                  </div>

                  {/* Active FEFO Lots */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      لوتات المخزون الحية (FEFO):
                    </p>
                    {mat.lots.length === 0 ? (
                      <p className="text-[11px] text-rose-600 font-medium bg-rose-50 p-1.5 rounded">
                        لا يوجد رصيد لوتات متاح حالياً
                      </p>
                    ) : (
                      mat.lots.map((lot: any) => (
                        <div
                          key={lot.id}
                          className="flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-50/80 border border-slate-100"
                        >
                          <span className="font-mono font-medium text-slate-800">
                            {lot.lotNumber}
                          </span>
                          <span className="font-mono text-slate-600">
                            صلاحية: {new Date(lot.expiryDate).toLocaleDateString('ar-EG')}
                          </span>
                          <span className="font-mono font-bold text-sage-800">
                            {lot.currentStockBaseUnits} {mat.baseUnit}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stock Status Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isShortage ? (
                      <span className="flex items-center gap-1 text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3 h-3" /> حد الطلب
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> متوفر
                      </span>
                    )}
                  </div>

                  <div className="text-end">
                    <span className="text-xs font-mono font-extrabold text-navy-900 block">
                      {totalStockBase} {mat.baseUnit} ({totalPackagesEquivalent} {mat.packageUnit})
                    </span>
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
