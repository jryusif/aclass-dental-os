'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  formulaTooltip?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'neutral' | 'accent';
  };
  highlight?: boolean;
}

export default function MetricCard({
  title,
  value,
  unit = 'ج.م',
  subtitle,
  formulaTooltip,
  badge,
  highlight,
}: MetricCardProps) {
  const badgeClasses = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    accent: 'bg-bronze-50 text-bronze-800 border-bronze-200',
  };

  return (
    <div
      className={`rounded-xl p-4 border transition-all ${
        highlight
          ? 'bg-gradient-to-br from-navy-900 to-navy-800 text-white border-navy-700 shadow-md'
          : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`text-xs font-semibold tracking-wide ${
            highlight ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {title}
        </span>
        {formulaTooltip && (
          <div
            className="group relative cursor-help"
            title={formulaTooltip}
          >
            <HelpCircle
              className={`w-3.5 h-3.5 ${
                highlight ? 'text-slate-400' : 'text-slate-400 hover:text-slate-600'
              }`}
            />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span
          className={`text-2xl font-bold tracking-tight font-mono ${
            highlight ? 'text-white' : 'text-navy-900'
          }`}
        >
          {typeof value === 'number'
            ? value.toLocaleString('en-US', { maximumFractionDigits: 1 })
            : value}
        </span>
        {unit && (
          <span
            className={`text-xs font-medium ${
              highlight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {unit}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px]">
        {subtitle && (
          <span
            className={`truncate max-w-[180px] ${
              highlight ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {subtitle}
          </span>
        )}
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
              badgeClasses[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
