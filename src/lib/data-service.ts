import { prisma } from './prisma';
import { solveServicePrice, calculateChairCost } from './pricing-engine';

export async function getClinics() {
  return await prisma.clinic.findMany({
    orderBy: { createdAt: 'asc' },
  });
}

export async function getDashboardData(clinicId?: string) {
  const clinic = clinicId
    ? await prisma.clinic.findUnique({ where: { id: clinicId } })
    : await prisma.clinic.findFirst();

  if (!clinic) return null;

  // 1. Financial Aggregations
  // Net Billed Revenue from Finalized Procedures
  const procedures = await prisma.procedure.findMany({
    where: { clinicId: clinic.id, status: 'COMPLETED' },
    include: { service: true, doctor: true, patient: true, consumptions: { include: { material: true } } },
  });

  const grossBillings = procedures.reduce((acc, p) => acc + (p.standardPrice || 0), 0);
  const discounts = procedures.reduce((acc, p) => acc + (p.discountAmount || 0), 0);
  const netEarnedRevenue = procedures.reduce((acc, p) => acc + (p.netEarnedRevenue || 0), 0);
  const directMaterialCost = procedures.reduce((acc, p) => acc + (p.directMaterialCost || 0), 0);
  const doctorCompensation = procedures.reduce((acc, p) => acc + (p.doctorCompensation || 0), 0);
  const labExpenses = procedures.reduce((acc, p) => acc + (p.labCost || 0), 0);

  // Payments collected
  const payments = await prisma.patientPayment.findMany({
    where: { clinicId: clinic.id },
  });
  const cashCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Invoices & Receivables
  const invoices = await prisma.patientInvoice.findMany({
    where: { clinicId: clinic.id },
  });
  const outstandingPatientBalances = invoices.reduce((acc, inv) => acc + (inv.balance || 0), 0);

  // Operating Expenses
  const expenses = await prisma.expense.findMany({
    where: { clinicId: clinic.id },
  });
  const fixedOperatingExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Net Operating Profit = Net Earned Revenue - Material Cost - Lab - Doctor Comp - Fixed Overhead
  const operatingProfit = netEarnedRevenue - directMaterialCost - labExpenses - doctorCompensation - fixedOperatingExpenses;
  const operatingProfitMargin = netEarnedRevenue > 0 ? (operatingProfit / netEarnedRevenue) * 100 : 0;

  // Financial Accounts
  const financialAccounts = await prisma.financialAccount.findMany({
    where: { clinicId: clinic.id },
  });

  // Supplier Payables
  const suppliers = await prisma.supplier.findMany({
    where: { clinicId: clinic.id },
  });
  const supplierPayables = suppliers.reduce((acc, s) => acc + (s.currentBalance || 0), 0);

  // Inventory Lots & Valuation
  const lots = await prisma.materialLot.findMany({
    where: { clinicId: clinic.id, status: 'ACTIVE' },
    include: { material: true },
  });
  const inventoryValuation = lots.reduce((acc, l) => acc + (l.currentStockBaseUnits * l.unitCostBaseUnit), 0);

  // Items approaching expiry (< 90 days)
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const expiringLots = lots.filter(l => new Date(l.expiryDate) <= ninetyDaysFromNow);

  // Items below reorder threshold
  const materials = await prisma.material.findMany({
    where: { clinicId: clinic.id },
    include: { lots: true },
  });
  const shortages = materials.filter(m => {
    const totalStock = m.lots.reduce((acc, l) => acc + (l.currentStockBaseUnits || 0), 0);
    return totalStock <= (m.reorderThreshold * m.conversionFactor);
  });

  // Chair Cost calculation
  const chairMetrics = calculateChairCost({
    activeChairs: clinic.activeChairs,
    workingDaysPerMonth: clinic.workingDaysPerMonth,
    dailyWorkingHours: clinic.dailyWorkingHours,
    occupancyRate: clinic.occupancyRate,
    monthlyFixedExpenses: clinic.monthlyFixedExpenses,
  });

  return {
    clinic,
    kpis: {
      grossBillings,
      discounts,
      netEarnedRevenue,
      cashCollected,
      outstandingPatientBalances,
      directMaterialCost,
      labExpenses,
      doctorCompensation,
      fixedOperatingExpenses,
      operatingProfit,
      operatingProfitMargin,
      supplierPayables,
      inventoryValuation,
      breakEvenTarget: clinic.breakEvenTargetMonthly,
    },
    chairMetrics,
    procedures,
    financialAccounts,
    expiringLots,
    shortages,
    materialsCount: materials.length,
    patientsCount: await prisma.patient.count({ where: { clinicId: clinic.id } }),
  };
}

export async function getMaterialsWithLots(clinicId: string) {
  return await prisma.material.findMany({
    where: { clinicId },
    include: {
      lots: {
        orderBy: { expiryDate: 'asc' }, // FEFO order
      },
      wasteRecords: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function getServicesWithRecipes(clinicId: string) {
  return await prisma.serviceCatalog.findMany({
    where: { clinicId },
    include: {
      recipes: {
        include: {
          items: {
            include: { material: true },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getPatientsWithCases(clinicId: string) {
  return await prisma.patient.findMany({
    where: { clinicId },
    include: {
      visits: {
        include: {
          procedures: {
            include: { service: true, doctor: true },
          },
        },
      },
      patientInvoices: true,
      patientPayments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDoctors(clinicId: string) {
  return await prisma.doctor.findMany({
    where: { clinicId },
    include: {
      procedures: true,
    },
  });
}

export async function getSuppliers(clinicId: string) {
  return await prisma.supplier.findMany({
    where: { clinicId },
    include: {
      purchaseOrders: {
        include: { items: true },
      },
      supplierPayments: true,
    },
  });
}

export async function getLabOrders(clinicId: string) {
  return await prisma.labOrder.findMany({
    where: { clinicId },
    include: {
      lab: true,
      patient: true,
    },
    orderBy: { sentDate: 'desc' },
  });
}

export async function getFixedAssetsAndInstruments(clinicId: string) {
  const assets = await prisma.fixedAsset.findMany({
    where: { clinicId },
    orderBy: { purchaseDate: 'asc' },
  });
  const instruments = await prisma.reusableInstrument.findMany({
    where: { clinicId },
    orderBy: { name: 'asc' },
  });
  return { assets, instruments };
}

export async function getPriceListVersions(clinicId: string) {
  return await prisma.priceListVersion.findMany({
    where: { clinicId },
    orderBy: { effectiveDate: 'desc' },
  });
}

export async function getMarketBenchmarks(clinicId: string) {
  return await prisma.marketBenchmark.findMany({
    where: { clinicId },
    orderBy: { specialty: 'asc' },
  });
}

export async function getStockMovements(clinicId: string) {
  return await prisma.stockMovement.findMany({
    where: { clinicId },
    include: {
      material: true,
      lot: true,
      procedure: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}
