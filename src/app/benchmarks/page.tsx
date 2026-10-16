import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Target, TrendingUp, Info, MapPin } from 'lucide-react';

export const revalidate = 0;

export default async function BenchmarksPage() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return null;

  const benchmarks = await prisma.marketBenchmark.findMany({
    where: { clinicId: clinic.id },
    orderBy: { specialty: 'asc' },
  });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="أسعار السوق القياسية (Market Price Benchmarks)"
        subtitle="مقارنة أسعار الخدمات مع السوق الإقليمي بأسوان وصعيد مصر وعيادات القاهرة المتميزة دون خفض أسعار العيادة عشوائياً"
      />

      <div className="p-6 space-y-6">
        <div className="p-4 bg-navy-50 rounded-xl border border-navy-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" />
          <div className="text-xs text-navy-900 space-y-1">
            <p className="font-bold">
              معيار طب الأسنان الحيوي المتميز (Biomimetic Practice Differentiation)
            </p>
            <p className="text-slate-600">
              عيادة إيه كلاس تطبق بروتوكولات طب الأسنان اللاصق والختم العاجي الفوري (IDS) واستخدام ألياف ريبوند وإيفر إكس وسيلر بيوسيراميك تحت العزل المطاطي المطلق. لا ينبغي خفض الأسعار لمضاهاة العيادات التقليدية التي تستخدم مواد حشو كتلية رخيصة دون عزل.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {benchmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block font-mono">
                    {bm.specialty}
                  </span>
                  <h3 className="text-base font-bold text-navy-950 mt-0.5">
                    {bm.serviceName}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>النطاق الجغرافي: {bm.geographicArea}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {bm.clinicTier}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">الحد الأدنى</span>
                  <p className="font-mono font-bold text-slate-700 mt-0.5">{bm.lowPrice} ج.م</p>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[10px] text-slate-500">متوسط السوق</span>
                  <p className="font-mono font-bold text-navy-900 mt-0.5">{bm.averagePrice} ج.م</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">الحد الأعلى</span>
                  <p className="font-mono font-bold text-slate-700 mt-0.5">{bm.highPrice} ج.م</p>
                </div>
              </div>

              {bm.comparabilityNotes && (
                <p className="text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="font-bold text-amber-900 block">ملاحظات المقارنة السريرية:</span>
                  {bm.comparabilityNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
