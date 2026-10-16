'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Info, PlusCircle, Database, Receipt, Stethoscope } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenProcedureModal?: () => void;
  onOpenPurchaseModal?: () => void;
  onOpenPaymentModal?: () => void;
}

export default function Header({
  title,
  subtitle,
  onOpenProcedureModal,
  onOpenPurchaseModal,
  onOpenPaymentModal,
}: HeaderProps) {
  const { t } = useApp();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
          {title || t.appName}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Accounting Notice & Quick Actions */}
        {/* Costing Engine Tooltip Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] text-teal-800 font-medium">
          <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>حساب التكلفة: الخامات + ساعة الكرسي + التعقيم</span>
        </div>

        {/* Live Neon DB Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-800 font-medium">
          <Database className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span className="font-mono text-[10px]">Neon PostgreSQL (Live)</span>
        </div>
    </header>
  );
}
