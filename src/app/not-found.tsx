import Link from 'react';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-3xl font-bold text-navy-900 mb-2">404 - الصفحة غير موجودة</h2>
      <p className="text-slate-500 text-sm mb-6">
        عذراً، الصفحة التي تبحث عنها غير متوفرة في نظام إيه كلاس لطب الأسنان.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-navy-850 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition-colors"
      >
        العودة إلى لوحة المؤشرات
      </a>
    </div>
  );
}
