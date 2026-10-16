'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import {
  GitCompare,
  CheckCircle,
  FileText,
  Calendar,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

interface PriceVersionsViewProps {
  versions: any[];
  clinicId: string;
}

export default function PriceVersionsView({ versions, clinicId }: PriceVersionsViewProps) {
  const { t } = useApp();

  const [selectedVersionId, setSelectedVersionId] = useState(versions[0]?.id || '');
  const activeVersion = versions.find((v) => v.id === selectedVersionId) || versions[0];

  const servicesSnapshot = (activeVersion?.snapshotData as any)?.services || [];

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={t.nav.priceVersions}
        subtitle="سجل إصدارات قوائم الأسعار المعتمدة والمؤرشفة مع مقارنة الفروق وحماية الفواتير التاريخية من إعادة الكتابة"
      />

      <div className="p-6 space-y-6">
        {/* Accounting Safe Rule Alert */}
        <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" />
          <div className="text-xs text-navy-900 space-y-1">
            <p className="font-bold">
              مبدأ الثبات المالي وحصانة السجلات التاريخية (Immutability of Historical Invoices)
            </p>
            <p className="text-slate-600">
              تظل الفواتير القديمة مرتبطة بقائمة الأسعار وتكاليف الخامات التي كانت سارية وقت صدورها. لا يؤدي اعتماد قائمة أسعار جديدة إلى تغيير أي فاتورة سابقة إطلاقاً.
            </p>
          </div>
        </div>

        {/* Versions Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {versions.map((ver) => {
            const isSelected = ver.id === selectedVersionId;
            return (
              <div
                key={ver.id}
                onClick={() => setSelectedVersionId(ver.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-sage-500 shadow-md ring-1 ring-sage-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {ver.versionNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ver.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ver.status === 'APPROVED' ? 'معتمدة ورسمية' : ver.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-navy-900 mt-2 line-clamp-1">
                  {ver.title}
                </h3>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {ver.notes || 'لا توجد ملاحظات'}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>تاريخ السريان: {new Date(ver.effectiveDate).toLocaleDateString('ar-EG')}</span>
                  <span className="font-medium text-slate-600">{ver.approvedBy?.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Version Snapshot Details */}
        {activeVersion && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  لقطة الأسعار المجمدة للإصدار: {activeVersion.title} ({activeVersion.versionNumber})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  معتمد بواسطة: {activeVersion.approvedBy || 'الإدارة'} | تاريخ التجميد:{' '}
                  {new Date(activeVersion.createdAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-start">كود الخدمة</th>
                    <th className="py-2.5 px-3 text-start">اسم الإجراء السريري</th>
                    <th className="py-2.5 px-3 text-end">السعر المعتمد للمريض</th>
                    <th className="py-2.5 px-3 text-end">التكلفة المباشرة المجمدة</th>
                    <th className="py-2.5 px-3 text-end">تكلفة المعمل</th>
                    <th className="py-2.5 px-3 text-end">هامش الربح المستهدف</th>
                    <th className="py-2.5 px-3 text-center">حالة الربحية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {servicesSnapshot.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        لا توجد بيانات لقطة مجمدة لهذا الإصدار
                      </td>
                    </tr>
                  ) : (
                    servicesSnapshot.map((s: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-bold text-navy-800">
                          {s.code}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {s.name}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-950">
                          {s.price.toLocaleString()} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-slate-700">
                          {s.directCost?.toLocaleString() || 0} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-slate-700">
                          {s.labCost ? `${s.labCost.toLocaleString()} ج.م` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono font-bold text-sage-800">
                          {s.targetMargin}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            مربح ومعتمد
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
