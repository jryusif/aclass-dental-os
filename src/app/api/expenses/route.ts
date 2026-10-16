import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseCategory, PaymentStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ error: 'معرف العيادة مطلوب' }, { status: 400 });
    }

    const expenses = await prisma.expense.findMany({
      where: { clinicId },
      include: { financialAccount: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clinicId,
      title,
      category = 'SALARIES',
      amount,
      description,
      isRecurring = true,
      recurringFrequency = 'MONTHLY',
    } = body;

    if (!clinicId || !title || amount === undefined) {
      return NextResponse.json({ error: 'البيانات الأساسية ناقصة' }, { status: 400 });
    }

    const numAmount = parseFloat(amount) || 0;

    const expense = await prisma.expense.create({
      data: {
        clinicId,
        title,
        category: (category as ExpenseCategory) || ExpenseCategory.SALARIES,
        amount: numAmount,
        description: description || null,
        isRecurring: Boolean(isRecurring),
        recurringFrequency: recurringFrequency || 'MONTHLY',
        paymentStatus: PaymentStatus.PAID,
        expenseDate: new Date(),
      },
    });

    // Update clinic's total monthlyFixedExpenses if recurring
    if (isRecurring) {
      const allRecurring = await prisma.expense.findMany({
        where: { clinicId, isRecurring: true },
      });
      const newMonthlyTotal = allRecurring.reduce((acc, e) => acc + (e.amount || 0), 0);

      await prisma.clinic.update({
        where: { id: clinicId },
        data: { monthlyFixedExpenses: newMonthlyTotal },
      });
    }

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error('Error adding expense:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, category, amount, description, isRecurring } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف البند مطلوب' }, { status: 400 });
    }

    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: 'البند غير موجود' }, { status: 404 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(category && { category: category as ExpenseCategory }),
        ...(amount !== undefined && { amount: parseFloat(amount) || 0 }),
        ...(description !== undefined && { description }),
        ...(isRecurring !== undefined && { isRecurring }),
      },
    });

    // Recalculate clinic monthly fixed expenses
    const allRecurring = await prisma.expense.findMany({
      where: { clinicId: current.clinicId, isRecurring: true },
    });
    const newMonthlyTotal = allRecurring.reduce((acc, e) => acc + (e.amount || 0), 0);

    await prisma.clinic.update({
      where: { id: current.clinicId },
      data: { monthlyFixedExpenses: newMonthlyTotal },
    });

    return NextResponse.json({ success: true, expense: updated });
  } catch (error: any) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف البند مطلوب' }, { status: 400 });
    }

    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: 'البند غير موجود' }, { status: 404 });
    }

    await prisma.expense.delete({ where: { id } });

    // Recalculate clinic monthly fixed expenses
    const allRecurring = await prisma.expense.findMany({
      where: { clinicId: current.clinicId, isRecurring: true },
    });
    const newMonthlyTotal = allRecurring.reduce((acc, e) => acc + (e.amount || 0), 0);

    await prisma.clinic.update({
      where: { id: current.clinicId },
      data: { monthlyFixedExpenses: newMonthlyTotal },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
