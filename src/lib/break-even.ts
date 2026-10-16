/**
 * Interactive Break-Even & Financial Planning Intelligence
 * A-Class Dental OS
 */

export interface BreakEvenInput {
  monthlyFixedExpenses: number; // EGP e.g. 30,000
  averageRevenuePerProcedure: number; // EGP
  averageVariableCostPerProcedure: number; // Direct Materials + Doctor share + Lab
  workingDaysPerMonth?: number; // default 26
  activeChairs?: number; // default 2
  targetMonthlyOperatingProfit?: number; // e.g. 20,000
}

export interface BreakEvenResult {
  isValid: boolean;
  errorMessage?: string;
  contributionPerProcedure: number;
  contributionMarginRatio: number; // Percentage (0-100)
  breakEvenProceduresMonthly: number;
  breakEvenRevenueMonthly: number;
  breakEvenProceduresPerDay: number;
  breakEvenChairUtilizationPercent: number;

  targetProfitProceduresMonthly: number;
  targetProfitRevenueMonthly: number;
  targetProfitProceduresPerDay: number;

  scenarios: {
    conservative: { volume: number; revenue: number; profit: number };
    expected: { volume: number; revenue: number; profit: number };
    optimistic: { volume: number; revenue: number; profit: number };
  };
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const {
    monthlyFixedExpenses,
    averageRevenuePerProcedure,
    averageVariableCostPerProcedure,
    workingDaysPerMonth = 26,
    activeChairs = 2,
    targetMonthlyOperatingProfit = 0,
  } = input;

  const contribution = averageRevenuePerProcedure - averageVariableCostPerProcedure;

  if (averageRevenuePerProcedure <= 0) {
    return {
      isValid: false,
      errorMessage: 'Average revenue per procedure must be greater than zero.',
      contributionPerProcedure: 0,
      contributionMarginRatio: 0,
      breakEvenProceduresMonthly: 0,
      breakEvenRevenueMonthly: 0,
      breakEvenProceduresPerDay: 0,
      breakEvenChairUtilizationPercent: 0,
      targetProfitProceduresMonthly: 0,
      targetProfitRevenueMonthly: 0,
      targetProfitProceduresPerDay: 0,
      scenarios: {
        conservative: { volume: 0, revenue: 0, profit: 0 },
        expected: { volume: 0, revenue: 0, profit: 0 },
        optimistic: { volume: 0, revenue: 0, profit: 0 },
      },
    };
  }

  if (contribution <= 0) {
    return {
      isValid: false,
      errorMessage: `Negative or zero contribution margin per case (${contribution.toFixed(2)} EGP). Variable costs equal or exceed procedure revenue; break-even is mathematically impossible.`,
      contributionPerProcedure: Number(contribution.toFixed(2)),
      contributionMarginRatio: 0,
      breakEvenProceduresMonthly: 0,
      breakEvenRevenueMonthly: 0,
      breakEvenProceduresPerDay: 0,
      breakEvenChairUtilizationPercent: 0,
      targetProfitProceduresMonthly: 0,
      targetProfitRevenueMonthly: 0,
      targetProfitProceduresPerDay: 0,
      scenarios: {
        conservative: { volume: 0, revenue: 0, profit: 0 },
        expected: { volume: 0, revenue: 0, profit: 0 },
        optimistic: { volume: 0, revenue: 0, profit: 0 },
      },
    };
  }

  const contributionMarginRatio = (contribution / averageRevenuePerProcedure) * 100;
  const breakEvenRevenueMonthly = monthlyFixedExpenses / (contributionMarginRatio / 100);
  const breakEvenProceduresMonthly = Math.ceil(monthlyFixedExpenses / contribution);
  const breakEvenProceduresPerDay = Number((breakEvenProceduresMonthly / workingDaysPerMonth).toFixed(1));

  // Max theoretical monthly procedures assuming 8 cases per chair/day (approx 1 hr/case)
  const maxMonthlyCases = activeChairs * workingDaysPerMonth * 7;
  const breakEvenChairUtilizationPercent = Number(((breakEvenProceduresMonthly / maxMonthlyCases) * 100).toFixed(1));

  // Target profit planning
  const targetRequiredProcedures = Math.ceil((monthlyFixedExpenses + targetMonthlyOperatingProfit) / contribution);
  const targetRequiredRevenue = targetRequiredProcedures * averageRevenuePerProcedure;
  const targetProfitProceduresPerDay = Number((targetRequiredProcedures / workingDaysPerMonth).toFixed(1));

  // Three Scenarios (Conservative: -15% volume, Expected: baseline, Optimistic: +25% volume)
  const expectedVol = Math.max(breakEvenProceduresMonthly + 15, Math.ceil(targetRequiredProcedures));
  const consVol = Math.max(1, Math.floor(expectedVol * 0.85));
  const optVol = Math.floor(expectedVol * 1.25);

  return {
    isValid: true,
    contributionPerProcedure: Number(contribution.toFixed(2)),
    contributionMarginRatio: Number(contributionMarginRatio.toFixed(1)),
    breakEvenProceduresMonthly,
    breakEvenRevenueMonthly: Math.ceil(breakEvenRevenueMonthly),
    breakEvenProceduresPerDay,
    breakEvenChairUtilizationPercent,
    targetProfitProceduresMonthly: targetRequiredProcedures,
    targetProfitRevenueMonthly: Math.ceil(targetRequiredRevenue),
    targetProfitProceduresPerDay,
    scenarios: {
      conservative: {
        volume: consVol,
        revenue: consVol * averageRevenuePerProcedure,
        profit: consVol * contribution - monthlyFixedExpenses,
      },
      expected: {
        volume: expectedVol,
        revenue: expectedVol * averageRevenuePerProcedure,
        profit: expectedVol * contribution - monthlyFixedExpenses,
      },
      optimistic: {
        volume: optVol,
        revenue: optVol * averageRevenuePerProcedure,
        profit: optVol * contribution - monthlyFixedExpenses,
      },
    },
  };
}
