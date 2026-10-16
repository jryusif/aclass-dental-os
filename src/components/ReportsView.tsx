'use client';

import React, { useState } from 'react';
import Header from './Header';
import { useApp } from '@/context/AppContext';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface ReportsViewProps {
  clinic: any;
  procedures: any[];
  expenses: any[];
  doctors: any[];
  chairMetrics: any;
}

export default function ReportsView({
  clinic,
  procedures,
  expenses,
  doctors,
  chairMetrics,
}: ReportsViewProps) {
  const { t } = useApp();
  const [reportTab, setReportTab] = useState<'pnl' | 'doctors' | 'procedures'>('pnl');

  // Aggregations
  const totalBilled = procedures.reduce((acc, p) => acc + (p.standardPrice || 0), 0);
  const totalDiscounts = procedures.reduce((acc, p) => acc + (p.discountAmount || 0), 0);
  const totalNetRevenue = procedures.reduce((acc, p) => acc + (p.netEarnedRevenue || 0), 0);
  const totalMaterials = procedures.reduce((acc, p) => acc + (p.directMaterialCost || 0), 0);
  const totalLab = procedures.reduce((acc, p) => acc + (p.labCost || 0), 0);
  const totalDoctorComp = procedures.reduce((acc, p) => acc + (p.doctorCompensation || 0), 0);
  const totalFixedExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const totalOperatingProfit =
    totalNetRevenue - totalMaterials - totalLab - totalDoctorComp - totalFixedExpenses;
  const operatingMarginPercent =
    totalNetRevenue > 0 ? (totalOperatingProfit / totalNetRevenue) * 100 : 0;

  // Export to CSV function with UTF-8 BOM for Arabic support
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM

    if (reportTab === 'pnl') {
      csvContent += 'بند قائمة الدخل والربحية,المبلغ (ج.م)\n';
      csvContent += `إجمالي الفواتير السريرية,${totalBilled}\n`;
      csvContent += `الخصومات الممنوحة,${totalDiscounts}\n`;
      csvContent += `صافي الإيراد المكتسب,${totalNetRevenue}\n`;
      csvContent += `تكلفة الخامات المستهلكة,${totalMaterials}\n`;
      csvContent += `مصاريف المعامل والتركيبات,${totalLab}\n`;
      csvContent += `أتعاب وعمولات الأطباء,${totalDoctorComp}\n`;
      csvContent += `المصروفات التشغيلية الثابتة,${totalFixedExpenses}\n`;
      csvContent += `صافي الربح التشغيلي,${totalOperatingProfit}\n`;
      csvContent += `هامش الربح التشغيلي,${operatingMarginPercent.toFixed(1)}%\n`;
    } else if (reportTab === 'doctors') {
      csvContent += 'اسم الطبيب,التخصص,عدد الحالات,إجمالي الإيراد,تكلفة الخامات,أتعاب الطبيب,صافي مساهمة العيادة\n';
      doctors.forEach((d) => {
        const docProcs = d.procedures || [];
        const docRevenue = docProcs.reduce((acc: number, p: any) => acc + (p.netEarnedRevenue || 0), 0);
        const docMat = docProcs.reduce((acc: number, p: any) => acc + (p.directMaterialCost || 0), 0);
        const docComp = docProcs.reduce((acc: number, p: any) => acc + (p.doctorCompensation || 0), 0);
        const docContrib = docRevenue - docMat - docComp;
        csvContent += `"${d.nameAr || d.name}","${d.specialty}",${docProcs.length},${docRevenue},${docMat},${docComp},${docContrib}\n`;
      });
    } else {
      csvContent += 'المريض,الإجراء,السن,السعر المفوتر,تكلفة الخامات,أتعاب الطبيب,هامش المساهمة,صافي الربح,التاريخ\n';
      procedures.forEach((p) => {
        csvContent += `"${p.patient?.name || ''}","${p.service?.nameAr || p.service?.name || ''}",${p.toothNumber || ''},${p.actualBilledPrice},${p.directMaterialCost},${p.doctorCompensation},${p.contributionMargin},${p.fullOperatingProfit},"${new Date(p.createdAt).toLocaleDateString('ar-EG')}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `A-Class-Report-${reportTab}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={t.nav.reports}
        subtitle="التقارير المالية والتحليلية المعتمدة لعيادة إيه كلاس (قائمة الدخل، أرباح الأطباء، ربحية الإجراءات لكل ساعة كرسي)"
      />

      <div className="p-6 space-y-6">
        {/* Top Control Bar with Print and Export buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReportTab('pnl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportTab === 'pnl'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              قائمة الأرباح والخسائر (P&L)
            </button>
            <button
              onClick={() => setReportTab('doctors')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportTab === 'doctors'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ربحية ومستحقات الأطباء
            </button>
            <button
              onClick={() => setReportTab('procedures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportTab === 'procedures'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              ربحية الإجراءات السريرية
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>تصدير إكسيل (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة التقرير الرسمي</span>
            </button>
          </div>
        </div>

        {/* Printable Official Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-navy-900">
                  {clinic.nameAr} ({clinic.name})
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-sage-50 text-sage-800 border border-sage-200 font-bold">
                  سجل رسمي موثق
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                الموقع: {clinic.location} | العملة: {clinic.currency}
              </p>
            </div>
            <div className="text-start sm:text-end text-xs text-slate-500 font-mono">
              <p>تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
              <p>تكلفة ساعة الكرسي: {chairMetrics.chairHourCost} ج.م/ساعة</p>
            </div>
          </div>

          {/* TAB 1: P&L Statement */}
          {reportTab === 'pnl' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-navy-900">
                قائمة الدخل والتشغيل المالي (Statement of Profit and Loss)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50/80 font-bold text-slate-800">
                      <td className="py-2.5 px-4">إجمالي الإيرادات السريرية المفوترة (Gross Billings)</td>
                      <td className="py-2.5 px-4 text-end font-mono text-navy-900">
                        {totalBilled.toLocaleString()} ج.م
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-600 ps-8">(-) الخصومات السريرية الممنوحة</td>
                      <td className="py-2 px-4 text-end font-mono text-rose-600">
                        ({totalDiscounts.toLocaleString()}) ج.م
                      </td>
                    </tr>
                    <tr className="bg-navy-50 font-bold text-navy-900">
                      <td className="py-2.5 px-4">(=) صافي الإيراد المكتسب (Net Earned Revenue)</td>
                      <td className="py-2.5 px-4 text-end font-mono text-navy-950">
                        {totalNetRevenue.toLocaleString()} ج.م
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-600 ps-8">(-) تكلفة الخامات الحيوية المستهلكة (Materials Consumed)</td>
                      <td className="py-2 px-4 text-end font-mono text-rose-700">
                        ({totalMaterials.toLocaleString()}) ج.م
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-600 ps-8">(-) مصاريف المعامل والتركيبات (Laboratory Fees)</td>
                      <td className="py-2 px-4 text-end font-mono text-rose-700">
                        ({totalLab.toLocaleString()}) ج.م
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-600 ps-8">(-) أتعاب وعمولات الأطباء المستحقة (Doctor Compensation)</td>
                      <td className="py-2 px-4 text-end font-mono text-rose-700">
                        ({totalDoctorComp.toLocaleString()}) ج.م
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 font-bold text-emerald-900">
                      <td className="py-2.5 px-4">(=) إجمالي هامش المساهمة السريرية (Clinical Contribution Margin)</td>
                      <td className="py-2.5 px-4 text-end font-mono text-emerald-800 font-extrabold">
                        {(totalNetRevenue - totalMaterials - totalLab - totalDoctorComp).toLocaleString()} ج.م
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-slate-600 ps-8">(-) المصروفات التشغيلية الثابتة (إيجار، رواتب، كهرباء، صيانة)</td>
                      <td className="py-2 px-4 text-end font-mono text-rose-700">
                        ({totalFixedExpenses.toLocaleString()}) ج.م
                      </td>
                    </tr>
                    <tr className="bg-navy-900 text-white font-extrabold text-sm">
                      <td className="py-3 px-4">(=) صافي الربح التشغيلي الحقيقي (Net Operating Profit)</td>
                      <td className="py-3 px-4 text-end font-mono text-sage-400">
                        {totalOperatingProfit.toLocaleString()} ج.م
                      </td>
                    </tr>
                    <tr className="bg-slate-50 text-slate-700 font-semibold text-xs">
                      <td className="py-2 px-4">نسبة هامش الربح التشغيلي (Operating Profit Margin %)</td>
                      <td className="py-2 px-4 text-end font-mono font-bold text-navy-900">
                        {operatingMarginPercent.toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Doctors Profitability */}
          {reportTab === 'doctors' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-navy-900">
                تقرير إنتاجية وأتعاب الأطباء وهامش المساهمة الصافي لكل طبيب
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-start">الطبيب المعالج</th>
                      <th className="py-2.5 px-3 text-start">التخصص</th>
                      <th className="py-2.5 px-3 text-center">عدد الحالات</th>
                      <th className="py-2.5 px-3 text-end">إجمالي الإيراد</th>
                      <th className="py-2.5 px-3 text-end">الخامات المستهلكة</th>
                      <th className="py-2.5 px-3 text-end">أتعاب الطبيب</th>
                      <th className="py-2.5 px-3 text-end">صافي مساهمة العيادة</th>
                      <th className="py-2.5 px-3 text-center">نسبة مساهمة العيادة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {doctors.map((doc) => {
                      const procs = doc.procedures || [];
                      const rev = procs.reduce((acc: number, p: any) => acc + (p.netEarnedRevenue || 0), 0);
                      const mat = procs.reduce((acc: number, p: any) => acc + (p.directMaterialCost || 0), 0);
                      const comp = procs.reduce((acc: number, p: any) => acc + (p.doctorCompensation || 0), 0);
                      const contrib = rev - mat - comp;
                      const contribPct = rev > 0 ? (contrib / rev) * 100 : 0;

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {doc.nameAr || doc.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{doc.specialty}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{procs.length}</td>
                          <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-900">
                            {rev.toLocaleString()} ج.م
                          </td>
                          <td className="py-2.5 px-3 text-end font-mono text-rose-700">
                            {mat.toFixed(1)} ج.م
                          </td>
                          <td className="py-2.5 px-3 text-end font-mono text-amber-700 font-bold">
                            {comp.toFixed(1)} ج.م
                          </td>
                          <td className="py-2.5 px-3 text-end font-mono text-emerald-700 font-bold">
                            {contrib.toFixed(1)} ج.م
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                            {contribPct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Procedures Profitability */}
          {reportTab === 'procedures' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-navy-900">
                ترتيب الإجراءات السريرية حسب هامش المساهمة الفعلي والربحية لكل دقيقة كرسي
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 text-start">المريض</th>
                      <th className="py-2.5 px-3 text-start">الإجراء السريري</th>
                      <th className="py-2.5 px-3 text-center">السن / السطح</th>
                      <th className="py-2.5 px-3 text-end">السعر المحصل</th>
                      <th className="py-2.5 px-3 text-end">تكلفة الخامات</th>
                      <th className="py-2.5 px-3 text-end">أتعاب الطبيب</th>
                      <th className="py-2.5 px-3 text-end">هامش المساهمة</th>
                      <th className="py-2.5 px-3 text-end">ربح التشغيل بعد الكرسي</th>
                      <th className="py-2.5 px-3 text-center">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {procedures.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {p.patient?.name || 'مريض'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          {p.service?.nameAr || p.service?.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {p.toothNumber ? `#${p.toothNumber}` : '—'} {p.surfaces && `(${p.surfaces})`}
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono font-bold text-navy-900">
                          {p.actualBilledPrice.toLocaleString()} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-rose-700">
                          {p.directMaterialCost.toFixed(1)} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-amber-700">
                          {p.doctorCompensation.toFixed(1)} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-emerald-700 font-bold">
                          {p.contributionMargin.toFixed(1)} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-end font-mono text-navy-800 font-bold">
                          {p.fullOperatingProfit.toFixed(1)} ج.م
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
