'use client';

import React, { useState } from 'react';
import { HelpCircle, Sparkles, BookOpen, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { ADVISORY_GUIDELINES, AdvisoryTopic } from '@/lib/advisory-guidelines';

interface GuideTooltipProps {
  topicId: string;
  label?: string;
  onApply?: (value: number | string) => void;
  className?: string;
}

export default function GuideTooltip({
  topicId,
  label,
  onApply,
  className = '',
}: GuideTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const topic: AdvisoryTopic | undefined = ADVISORY_GUIDELINES[topicId];

  if (!topic) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/90 border border-teal-200/80 px-2 py-0.5 rounded-full transition-all duration-150 shadow-2xs ${className}`}
        title={`اضغط لمعرفة أفضل نسبة موصى بها لـ ${topic.title}`}
      >
        <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
        <span>{label || 'دليل النسبة الموصى بها'}</span>
      </button>

      {/* Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-right"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-l from-navy-900 via-navy-850 to-teal-950 p-5 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                    دليل الخبير السريري والمالي
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {topic.titleEn}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  {topic.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
              {/* Recommended Value Card */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 p-4 rounded-xl border border-teal-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                    النسبة أو الخيار الأفضل الموصى به:
                  </span>
                  <p className="text-base font-extrabold text-teal-950 mt-0.5">
                    {topic.recommendedValue}
                  </p>
                  <p className="text-[11px] text-teal-700/90 mt-1">
                    {topic.summary}
                  </p>
                </div>
              </div>

              {/* Strategic Rationale: Why? */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-bold text-navy-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  لماذا هذا الخيار تحديداً؟ (Strategic Rationale)
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {topic.why}
                </p>
              </div>

              {/* Clinical / Financial Evidence */}
              <div className="p-4 bg-navy-50/60 rounded-xl border border-navy-100 space-y-1.5">
                <h4 className="text-xs font-bold text-navy-950 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-navy-700" />
                  الدراسات السريرية والخبرات المرجعية:
                </h4>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {topic.evidence}
                </p>
              </div>

              {/* Risks of Higher / Lower Values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    لو وضعت قيمة أعلى:
                  </span>
                  <p className="text-[10px] text-rose-900/90 leading-normal">
                    {topic.risks.ifHigher}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    لو وضعت قيمة أقل:
                  </span>
                  <p className="text-[10px] text-amber-900/90 leading-normal">
                    {topic.risks.ifLower}
                  </p>
                </div>
              </div>

              {/* Key Takeaway */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 text-[11px] font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>خلاصة التوصية:</strong> {topic.keyTakeaway}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between gap-3">
              {onApply && topic.recommendedNumeric !== undefined ? (
                <button
                  type="button"
                  onClick={() => {
                    onApply(topic.recommendedNumeric!);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تطبيق هذه النسبة ({topic.recommendedNumeric}) تلقائياً</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-500">
                  مرجع معتمد لمركز القاهرة لطب وجراحة وتجميل الأسنان
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
