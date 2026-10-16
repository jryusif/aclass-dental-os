import React from 'react';
import { prisma } from '@/lib/prisma';
import Header from '@/components/Header';
import { Truck, Package, Clock, ShieldCheck } from 'lucide-react';

import DbNotice from '@/components/DbNotice';

import { getActiveClinic } from '@/lib/get-active-clinic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams?: { clinicId?: string };
}) {
  if (!process.env.DATABASE_URL) return <DbNotice />;

  try {
    const clinic = await getActiveClinic(searchParams);
    if (!clinic) return <DbNotice />;

    const suppliers = await prisma.supplier.findMany({
      where: { clinicId: clinic.id },
      include: {
        purchaseOrders: {
          include: { items: { include: { material: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="المشتريات والموردين (Purchasing & Suppliers)"
        subtitle="سجل أوامر الشراء، فواتير الموردين، متابعة الدفعات، وأرصدة الدائنين Accounts Payable"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-950">{sup.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{sup.phone}</p>
                  {sup.address && <p className="text-[11px] text-slate-400 mt-0.5">{sup.address}</p>}
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    sup.currentBalance > 0
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {sup.currentBalance > 0 ? `مستحق: ${sup.currentBalance.toLocaleString()} ج.م` : 'مسدد'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-2">أوامر الشراء المستلمة:</p>
                {sup.purchaseOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">لا توجد أوامر شراء مسجلة</p>
                ) : (
                  <div className="space-y-1.5">
                    {sup.purchaseOrders.map((po: any) => (
                      <div
                        key={po.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-mono font-bold text-navy-900 block">
                            {po.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(po.orderDate).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <div className="text-end">
                          <span className="font-mono font-bold text-navy-900 block">
                            {po.totalAmount.toLocaleString()} ج.م
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {po.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} catch (error) {
  console.error('Purchases page error:', error);
  return <DbNotice />;
}
}

