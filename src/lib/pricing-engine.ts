/**
 * Unified Algebraic Pricing Engine & Chair-Hour Costing
 * A-Class Dental OS — Every Material. Every Case. Every Pound.
 */

export interface ChairHourParams {
  activeChairs: number;
  workingDaysPerMonth: number;
  dailyWorkingHours: number;
  occupancyRate: number; // e.g. 0.70 for 70%
  monthlyFixedExpenses: number; // e.g. 30,000 EGP
}

export interface ChairCostResult {
  totalMonthlyAvailableHours: number;
  productiveOccupiedHours: number;
  chairHourCost: number; // EGP / chair hour
  chairMinuteCost: number; // EGP / chair minute
  monthlyCapacityVisitsAtAvgDuration: number;
}

export function calculateChairCost(params: ChairHourParams): ChairCostResult {
  const {
    activeChairs,
    workingDaysPerMonth,
    dailyWorkingHours,
    occupancyRate,
    monthlyFixedExpenses,
  } = params;

  if (activeChairs <= 0 || workingDaysPerMonth <= 0 || dailyWorkingHours <= 0 || occupancyRate <= 0) {
    return {
      totalMonthlyAvailableHours: 0,
      productiveOccupiedHours: 0,
      chairHourCost: 0,
      chairMinuteCost: 0,
      monthlyCapacityVisitsAtAvgDuration: 0,
    };
  }

  const totalMonthlyAvailableHours = activeChairs * workingDaysPerMonth * dailyWorkingHours;
  const productiveOccupiedHours = totalMonthlyAvailableHours * occupancyRate;
  const chairHourCost = productiveOccupiedHours > 0 ? monthlyFixedExpenses / productiveOccupiedHours : 0;
  const chairMinuteCost = chairHourCost / 60;
  // Assuming 45 min avg duration
  const monthlyCapacityVisitsAtAvgDuration = (productiveOccupiedHours * 60) / 45;

  return {
    totalMonthlyAvailableHours: Number(totalMonthlyAvailableHours.toFixed(1)),
    productiveOccupiedHours: Number(productiveOccupiedHours.toFixed(1)),
    chairHourCost: Number(chairHourCost.toFixed(2)),
    chairMinuteCost: Number(chairMinuteCost.toFixed(3)),
    monthlyCapacityVisitsAtAvgDuration: Math.floor(monthlyCapacityVisitsAtAvgDuration),
  };
}

export type DoctorCommissionBase =
  | 'BILLED_PRICE'
  | 'COLLECTED_PRICE'
  | 'PRICE_LESS_LAB'
  | 'PRICE_LESS_LAB_AND_MATERIALS';

export interface ServiceCostingInputs {
  directMaterialCost: number; // EGP
  reusableInstrumentCost: number; // EGP
  singleUseConsumablesCost: number; // EGP
  procedureDurationMinutes: number; // Chair occupancy time
  chairMinuteCost: number; // EGP / min from clinic overhead
  laboratoryCost: number; // EGP
  laboratoryMarkupPercent?: number; // e.g. 0% or 10%
  doctorCommissionBase: DoctorCommissionBase;
  doctorCommissionPercent: number; // e.g. 35%
  clinicTargetMarginPercent: number; // e.g. 30%
  bufferContingencyPercent: number; // e.g. 5%
  taxPercent?: number; // e.g. 0%
}

export interface PricingEngineResult {
  isValid: boolean;
  errorMessage?: string;
  directCostsTotal: number; // Materials + Instruments + Consumables
  allocatedOverhead: number; // Chair minutes * chairMinuteCost
  effectiveLabCost: number;
  totalDirectAndLabCost: number;
  totalFullCost: number; // Direct + Lab + Allocated Overhead

  // Recommended Prices
  costRecoveryMinimumPrice: number;
  targetContributionPrice: number;
  recommendedSellingPrice: number;

  // Breakdown at Recommended Selling Price:
  doctorCompensationAmount: number;
  clinicGrossProfit: number;
  clinicNetOperatingProfit: number;
  effectiveContributionMarginPercent: number;
  effectiveNetMarginPercent: number;
  bufferContingencyAmount: number;
  taxAmount: number;
}

/**
 * Solves the algebraic equation for the selling price P:
 * P = Revenue
 *
 * Depending on the doctor's commission base:
 * 1. BILLED_PRICE or COLLECTED_PRICE:
 *    DoctorAmount = P * d
 *    P = (DirectCosts + Lab + Overhead) / (1 - d - m - buffer - tax)
 *
 * 2. PRICE_LESS_LAB:
 *    DoctorAmount = (P - Lab) * d = P*d - Lab*d
 *    Total Outflow = DirectCosts + Lab + (P*d - Lab*d) + Overhead + P*m + P*buffer + P*tax
 *    P * (1 - d - m - buffer - tax) = DirectCosts + Lab*(1 - d) + Overhead
 *    P = (DirectCosts + Lab*(1 - d) + Overhead) / (1 - d - m - buffer - tax)
 *
 * 3. PRICE_LESS_LAB_AND_MATERIALS:
 *    DoctorAmount = (P - Lab - DirectCosts) * d = P*d - (Lab + DirectCosts)*d
 *    P * (1 - d - m - buffer - tax) = (DirectCosts + Lab)*(1 - d) + Overhead
 *    P = ((DirectCosts + Lab)*(1 - d) + Overhead) / (1 - d - m - buffer - tax)
 */
export function solveServicePrice(inputs: ServiceCostingInputs): PricingEngineResult {
  const {
    directMaterialCost,
    reusableInstrumentCost,
    singleUseConsumablesCost,
    procedureDurationMinutes,
    chairMinuteCost,
    laboratoryCost,
    laboratoryMarkupPercent = 0,
    doctorCommissionBase,
    doctorCommissionPercent,
    clinicTargetMarginPercent,
    bufferContingencyPercent,
    taxPercent = 0,
  } = inputs;

  const directCostsTotal = directMaterialCost + reusableInstrumentCost + singleUseConsumablesCost;
  const effectiveLabCost = laboratoryCost * (1 + (laboratoryMarkupPercent || 0) / 100);
  const allocatedOverhead = procedureDurationMinutes * chairMinuteCost;
  const totalDirectAndLabCost = directCostsTotal + effectiveLabCost;
  const totalFullCost = totalDirectAndLabCost + allocatedOverhead;

  const d = (doctorCommissionPercent || 0) / 100;
  const m = (clinicTargetMarginPercent || 0) / 100;
  const b = (bufferContingencyPercent || 0) / 100;
  const t = (taxPercent || 0) / 100;

  const denominator = 1 - d - m - b - t;

  if (denominator <= 0) {
    return {
      isValid: false,
      errorMessage: `Combined percentage allocation (${((d + m + b + t) * 100).toFixed(1)}%) equals or exceeds 100%. A finite profitable price cannot be solved. Please lower doctor commission, clinic margin, or contingency buffer.`,
      directCostsTotal: Number(directCostsTotal.toFixed(2)),
      allocatedOverhead: Number(allocatedOverhead.toFixed(2)),
      effectiveLabCost: Number(effectiveLabCost.toFixed(2)),
      totalDirectAndLabCost: Number(totalDirectAndLabCost.toFixed(2)),
      totalFullCost: Number(totalFullCost.toFixed(2)),
      costRecoveryMinimumPrice: Number(totalFullCost.toFixed(2)),
      targetContributionPrice: 0,
      recommendedSellingPrice: 0,
      doctorCompensationAmount: 0,
      clinicGrossProfit: 0,
      clinicNetOperatingProfit: 0,
      effectiveContributionMarginPercent: 0,
      effectiveNetMarginPercent: 0,
      bufferContingencyAmount: 0,
      taxAmount: 0,
    };
  }

  let numerator = totalFullCost;

  if (doctorCommissionBase === 'PRICE_LESS_LAB') {
    numerator = directCostsTotal + effectiveLabCost * (1 - d) + allocatedOverhead;
  } else if (doctorCommissionBase === 'PRICE_LESS_LAB_AND_MATERIALS') {
    numerator = (directCostsTotal + effectiveLabCost) * (1 - d) + allocatedOverhead;
  }

  const recommendedSellingPrice = Math.max(numerator / denominator, totalFullCost);

  // Calculate Doctor Compensation at recommendedSellingPrice
  let doctorCompensationAmount = 0;
  if (doctorCommissionBase === 'PRICE_LESS_LAB') {
    doctorCompensationAmount = Math.max(0, (recommendedSellingPrice - effectiveLabCost) * d);
  } else if (doctorCommissionBase === 'PRICE_LESS_LAB_AND_MATERIALS') {
    doctorCompensationAmount = Math.max(0, (recommendedSellingPrice - effectiveLabCost - directCostsTotal) * d);
  } else {
    // BILLED_PRICE or COLLECTED_PRICE
    doctorCompensationAmount = recommendedSellingPrice * d;
  }

  const bufferContingencyAmount = recommendedSellingPrice * b;
  const taxAmount = recommendedSellingPrice * t;

  // Contribution Margin = Revenue - Variable Costs (Direct + Lab + Doctor)
  const totalVariableCosts = directCostsTotal + effectiveLabCost + doctorCompensationAmount;
  const contributionAmount = recommendedSellingPrice - totalVariableCosts;
  const effectiveContributionMarginPercent = recommendedSellingPrice > 0 ? (contributionAmount / recommendedSellingPrice) * 100 : 0;

  // Net Operating Profit = Contribution - Allocated Overhead
  const clinicNetOperatingProfit = contributionAmount - allocatedOverhead;
  const effectiveNetMarginPercent = recommendedSellingPrice > 0 ? (clinicNetOperatingProfit / recommendedSellingPrice) * 100 : 0;

  // Minimum Cost Recovery Price (Overhead + Direct + Lab with zero profit)
  const costRecoveryMinimumPrice = totalFullCost;

  // Target Contribution Price (Direct + Lab + Doctor + Target Contribution)
  const targetContributionPrice = recommendedSellingPrice - allocatedOverhead;

  return {
    isValid: true,
    directCostsTotal: Number(directCostsTotal.toFixed(2)),
    allocatedOverhead: Number(allocatedOverhead.toFixed(2)),
    effectiveLabCost: Number(effectiveLabCost.toFixed(2)),
    totalDirectAndLabCost: Number(totalDirectAndLabCost.toFixed(2)),
    totalFullCost: Number(totalFullCost.toFixed(2)),
    costRecoveryMinimumPrice: Math.ceil(costRecoveryMinimumPrice),
    targetContributionPrice: Math.ceil(targetContributionPrice),
    recommendedSellingPrice: Math.ceil(recommendedSellingPrice),
    doctorCompensationAmount: Number(doctorCompensationAmount.toFixed(2)),
    clinicGrossProfit: Number(contributionAmount.toFixed(2)),
    clinicNetOperatingProfit: Number(clinicNetOperatingProfit.toFixed(2)),
    effectiveContributionMarginPercent: Number(effectiveContributionMarginPercent.toFixed(1)),
    effectiveNetMarginPercent: Number(effectiveNetMarginPercent.toFixed(1)),
    bufferContingencyAmount: Number(bufferContingencyAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
  };
}
