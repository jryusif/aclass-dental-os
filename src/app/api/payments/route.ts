import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clinicId,
      invoiceId,
      financialAccountId,
      amount,
      paymentMethod = 'CASH',
      reference,
      notes,
    } = body;

    if (!clinicId || !invoiceId || !financialAccountId || !amount) {
      return NextResponse.json({ error: 'Missing required payment parameters' }, { status: 400 });
    }

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return NextResponse.json({ error: 'Payment amount must be greater than zero' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.patientInvoice.findUniqueOrThrow({
        where: { id: invoiceId },
        include: { patient: true },
      });

      const newPaid = invoice.paidAmount + payAmount;
      const newBalance = Math.max(0, invoice.totalAmount - newPaid);
      const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';

      // 1. Update Invoice
      const updatedInvoice = await tx.patientInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaid,
          balance: newBalance,
          status: newStatus,
        },
      });

      // 2. Create Payment Record
      const payment = await tx.patientPayment.create({
        data: {
          clinicId,
          invoiceId,
          patientId: invoice.patientId,
          financialAccountId,
          amount: payAmount,
          paymentMethod: paymentMethod as any,
          reference,
          notes,
        },
      });

      // 3. Update Patient balance (decrease owed amount)
      await tx.patient.update({
        where: { id: invoice.patientId },
        data: {
          currentBalance: { decrement: payAmount },
        },
      });

      // 4. Update Financial Account Balance (Cash increases!)
      await tx.financialAccount.update({
        where: { id: financialAccountId },
        data: {
          currentBalance: { increment: payAmount },
        },
      });

      return { payment, updatedInvoice };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Error recording payment:', err);
    return NextResponse.json({ error: err.message || 'Failed to record payment' }, { status: 500 });
  }
}
