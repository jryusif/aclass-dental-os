import React from 'react';

export default function DbNotice() {
  return (
    <div className="p-8 text-center text-slate-600 max-w-xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
        ⚡
      </div>
      <h2 className="text-xl font-bold text-navy-900 mb-2">يرجى ربط قاعدة البيانات DATABASE_URL في Vercel</h2>
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">
        تم نشر واجهة نظام <strong>A-Class Dental OS</strong> بنجاح. لتفعيل الاتصال بقاعدة بيانات PostgreSQL السحابية، يرجى إضافة متغير البيئة <code className="bg-slate-100 text-teal-700 px-2 py-0.5 rounded font-mono text-xs">DATABASE_URL</code> في لوحة تحكم Vercel ثم إعادة النشر.
      </p>
    </div>
  );
}
