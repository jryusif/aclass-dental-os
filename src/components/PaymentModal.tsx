'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, CheckCircle, AlertCircle, Receipt, ArrowDownLeft } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  invoices: any[];
  accounts: any[];
}

export default function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  invoices,
  accounts,
}: PaymentModalProps) {
  const { currentClinicId, t } = useApp();

  const unpaidInvoices = invoices.filter((inv) => (inv.balance || 0) > 0);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(unpaidInvoices[0]?.id || invoices[0]?.id || '');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState<number>(unpaidInvoices[0]?.balance || 500);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'VODAFONE_CASH' | 'INSTAPAY'>('CASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: currentClinicId,
          invoiceId: selectedInvoiceId,
          financialAccountId: selectedAccountId,
          amount,
          paymentMethod,
          reference,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-bronze-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-bronze-800 text-bronze-200 border border-bronze-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                تحصيل دفعة مالية من مريض
              </h2>
              <p className="text-[11px] text-bronze-200">
                تسجيل نقدية حقيقية وتغذية رصيد الحساب المالي وتخفيض مديونية المريض
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-bronze-200 hover:text-white hover:bg-bronze-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اختر الفاتورة المطلوبة
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => {
                setSelectedInvoiceId(e.target.value);
                const inv = invoices.find((i) => i.id === e.target.value);
                if (inv) setAmount(inv.balance || 0);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-bronze-500"
              required
            >
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — المريض: {inv.patient?.name || 'مريض'} (المتبقي: {inv.balance} ج.م)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>إجمالي قيمة الفاتورة:</span>
              <span className="font-bold text-slate-900 font-mono">{currentInvoice?.totalAmount || 0} ج.م</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>المسدد سابقاً:</span>
              <span className="font-bold text-emerald-700 font-mono">{currentInvoice?.paidAmount || 0} ج.م</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>المتبقي المستحق على المريض:</span>
              <span className="font-bold text-rose-700 font-mono">{currentInvoice?.balance || 0} ج.م</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                المبلغ المحصل الآن (ج.م)
              </label>
              <input
                type="number"
                min="1"
                max={currentInvoice?.balance || 99999}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono font-bold text-navy-900 focus:ring-1 focus:ring-bronze-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                طريقة الدفع
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-bronze-500"
              >
                <option value="CASH">نقدي (Cash)</option>
                <option value="INSTAPAY">انستاباي (InstaPay)</option>
                <option value="VODAFONE_CASH">فودافون كاش (Vodafone Cash)</option>
                <option value="CREDIT_CARD">بطاقة بنكية (Credit/Debit Card)</option>
                <option value="BANK_TRANSFER">تحويل بنكي</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              إيداع إلى حساب الخزينة / البنك
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-bronze-500"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.nameAr || acc.name} — الرصيد الحالي: {acc.currentBalance.toLocaleString()} ج.م
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              رقم المرجع / الإيصال
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. REC-2026-881 or InstaPay Ref"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-bronze-600 hover:bg-bronze-700 text-white text-xs font-bold shadow-md shadow-bronze-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري التحصيل...' : 'تأكيد استلام المبلغ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
