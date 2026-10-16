import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, clinics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      nameAr,
      code,
      location,
      monthlyFixedExpenses = 30000,
      activeChairs = 2,
      dailyWorkingHours = 8.0,
      workingDaysPerMonth = 26,
      occupancyRate = 0.70,
      breakEvenTargetMonthly = 30000,
    } = body;

    if (!name || !code) {
      return NextResponse.json({ success: false, error: 'Name and code are required' }, { status: 400 });
    }

    const clinic = await prisma.clinic.create({
      data: {
        name,
        nameAr: nameAr || name,
        code: code.toUpperCase(),
        location: location || 'Aswan, Egypt',
        currency: 'EGP',
        monthlyFixedExpenses: Number(monthlyFixedExpenses),
        activeChairs: Number(activeChairs),
        dailyWorkingHours: Number(dailyWorkingHours),
        workingDaysPerMonth: Number(workingDaysPerMonth),
        occupancyRate: Number(occupancyRate),
        breakEvenTargetMonthly: Number(breakEvenTargetMonthly),
      },
    });

    return NextResponse.json({ success: true, clinic });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      nameAr,
      location,
      monthlyFixedExpenses,
      activeChairs,
      dailyWorkingHours,
      workingDaysPerMonth,
      occupancyRate,
      breakEvenTargetMonthly,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Clinic ID is required' }, { status: 400 });
    }

    const updatedClinic = await prisma.clinic.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameAr && { nameAr }),
        ...(location && { location }),
        ...(monthlyFixedExpenses !== undefined && { monthlyFixedExpenses: Number(monthlyFixedExpenses) }),
        ...(activeChairs !== undefined && { activeChairs: Number(activeChairs) }),
        ...(dailyWorkingHours !== undefined && { dailyWorkingHours: Number(dailyWorkingHours) }),
        ...(workingDaysPerMonth !== undefined && { workingDaysPerMonth: Number(workingDaysPerMonth) }),
        ...(occupancyRate !== undefined && { occupancyRate: Number(occupancyRate) }),
        ...(breakEvenTargetMonthly !== undefined && { breakEvenTargetMonthly: Number(breakEvenTargetMonthly) }),
      },
    });

    return NextResponse.json({ success: true, clinic: updatedClinic });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
