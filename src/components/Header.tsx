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
      <div className="flex flex-wrap items-center gap-3">
        {/* Accounting Rule Tooltip Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 border border-navy-100 text-[11px] text-navy-800 font-medium cursor-help" title={t.finance.ruleNotice}>
          <Info className="w-3.5 h-3.5 text-navy-600 shrink-0" />
          <span className="hidden lg:inline">{t.finance.ruleNotice}</span>
          <span className="lg:hidden">قاعدة: الإيراد ≠ التحصيل ≠ الأرباح</span>
        </div>

        {/* Live Neon DB Badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sage-50 border border-sage-200 text-[11px] text-sage-800 font-medium">
          <Database className="w-3 h-3 text-sage-600 animate-pulse" />
          <span className="font-mono text-[10px]">PostgreSQL (Neon)</span>
        </div>

        {/* Action Buttons */}
        {onOpenProcedureModal && (
          <button
            onClick={onOpenProcedureModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>تسجيل إجراء سريري</span>
          </button>
        )}

        {onOpenPurchaseModal && (
          <button
            onClick={onOpenPurchaseModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>استلام لوت خامات</span>
          </button>
        )}

        {onOpenPaymentModal && (
          <button
            onClick={onOpenPaymentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bronze-600 hover:bg-bronze-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>تحصيل دفعة مريض</span>
          </button>
        )}
      </div>
    </header>
  );
}
