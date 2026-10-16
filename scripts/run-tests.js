/**
 * Automated Verification & Business Logic Test Suite
 * A-Class Dental OS — Every Material. Every Case. Every Pound.
 */

const { solveServicePrice, calculateChairCost } = require('../src/lib/pricing-engine');
const { calculateMaterialEstimation, estimateBondingProtocolCost } = require('../src/lib/consumption-estimator');
const { calculateBreakEven } = require('../src/lib/break-even');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName} -> ${details}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log(' RUNNING A-CLASS DENTAL OS CORE FINANCIAL TESTS');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST SUITE 1: Chair-Hour Costing
// ----------------------------------------------------
console.log('--- Test Suite 1: Chair-Hour Costing & Overhead ---');
const chairCost = calculateChairCost({
  activeChairs: 2,
  workingDaysPerMonth: 26,
  dailyWorkingHours: 8,
  occupancyRate: 0.70,
  monthlyFixedExpenses: 30000,
});

assert(chairCost.totalMonthlyAvailableHours === 416, 'Total Available Hours is 416 (2 chairs * 26 days * 8h)');
assert(chairCost.productiveOccupiedHours === 291.2, 'Productive Occupied Hours at 70% is 291.2h');
assert(chairCost.chairHourCost >= 103.0 && chairCost.chairHourCost <= 103.05, 'Chair Hour Cost is approx 103.02 EGP/h');
assert(chairCost.chairMinuteCost >= 1.71 && chairCost.chairMinuteCost <= 1.72, 'Chair Minute Cost is approx 1.717 EGP/min');

// ----------------------------------------------------
// TEST SUITE 2: Algebraic Pricing Engine (All Doctor Bases)
// ----------------------------------------------------
console.log('\n--- Test Suite 2: Unified Algebraic Pricing Engine ---');

// Case 1: Standard Restorative (COLLECTED_PRICE)
const resCollected = solveServicePrice({
  directMaterialCost: 150,
  reusableInstrumentCost: 20,
  singleUseConsumablesCost: 30,
  procedureDurationMinutes: 45,
  chairMinuteCost: 1.717,
  laboratoryCost: 0,
  doctorCommissionBase: 'COLLECTED_PRICE',
  doctorCommissionPercent: 35,
  clinicTargetMarginPercent: 30,
  bufferContingencyPercent: 5,
  taxPercent: 0,
});

assert(resCollected.isValid === true, 'Price calculation is valid with reasonable percentages');
assert(resCollected.directCostsTotal === 200, 'Direct costs sum: 150 + 20 + 30 = 200 EGP');
assert(resCollected.allocatedOverhead === 77.26, 'Allocated overhead: 45 min * 1.717 = 77.26 EGP');
assert(resCollected.totalFullCost === 277.26, 'Total full cost is 277.26 EGP');
// Denominator = 1 - 0.35 - 0.30 - 0.05 = 0.30
// Selling price = 277.26 / 0.30 = 924.2 -> Ceil 925
assert(resCollected.recommendedSellingPrice === 925, `Selling price solved algebraically: ${resCollected.recommendedSellingPrice} EGP`);
assert(resCollected.doctorCompensationAmount >= 323 && resCollected.doctorCompensationAmount <= 324, 'Doctor compensation at 35% is approx 323.75 EGP');

// Case 2: Indirect Prostho (PRICE_LESS_LAB)
const resLessLab = solveServicePrice({
  directMaterialCost: 100,
  reusableInstrumentCost: 25,
  singleUseConsumablesCost: 25,
  procedureDurationMinutes: 60,
  chairMinuteCost: 1.717,
  laboratoryCost: 1200, // E.max overlay
  doctorCommissionBase: 'PRICE_LESS_LAB',
  doctorCommissionPercent: 35,
  clinicTargetMarginPercent: 30,
  bufferContingencyPercent: 5,
});

assert(resLessLab.isValid === true, 'Indirect restoration with PRICE_LESS_LAB solved successfully');
// Doctor does NOT get commission on laboratory cost!
assert(resLessLab.doctorCompensationAmount < (resLessLab.recommendedSellingPrice * 0.35), 'Doctor commission excludes laboratory expense');

// Case 3: Impossible Allocation (> 100%) Blocking Error
const resOver100 = solveServicePrice({
  directMaterialCost: 100,
  reusableInstrumentCost: 0,
  singleUseConsumablesCost: 0,
  procedureDurationMinutes: 30,
  chairMinuteCost: 1.717,
  laboratoryCost: 0,
  doctorCommissionBase: 'BILLED_PRICE',
  doctorCommissionPercent: 50,
  clinicTargetMarginPercent: 45,
  bufferContingencyPercent: 10, // Total = 105%
});

assert(resOver100.isValid === false, 'Engine blocks invalid allocations exceeding 100%');
assert(resOver100.errorMessage && resOver100.errorMessage.includes('Combined percentage allocation'), 'Engine gives explicit audit explanation');

// ----------------------------------------------------
// TEST SUITE 3: Biomimetic Material Consumption & Calibration
// ----------------------------------------------------
console.log('\n--- Test Suite 3: Material Consumption Estimator ---');

const compositeEst = calculateMaterialEstimation({
  packagePrice: 1200, // EGP
  packageQuantity: 1,
  packageUnit: 'SYRINGE',
  baseUnit: 'G',
  conversionFactor: 4.9, // 4.9g
  unusableWastePercent: 6.0,
  averageQuantityPerCase: 0.35, // 0.35g per restoration
  observedCasesCount: 25,
  totalMeasuredQuantityUsed: 9.2, // 9.2g / 25 = 0.368g
  evidenceLevel: 'MEASURED_CLINIC',
});

assert(compositeEst.effectiveBaseUnitCost === 244.898, 'Base cost per gram is 244.898 EGP/g');
assert(compositeEst.theoreticalApplicationsPerPackage === 14.0, 'Theoretical applications: 4.9 / 0.35 = 14.0');
assert(compositeEst.usableApplicationsPerPackage === 13.2, 'Usable applications after 6% waste is 13.2');
assert(compositeEst.expectedCostPerApplication === 90.91, 'Cost per application is 90.91 EGP');
assert(compositeEst.calibration.isCalibrated === true, 'Calibration active with 25 cases');
assert(compositeEst.calibration.sampleSizeStatus === 'PRELIMINARY', 'Sample size labeled preliminary (10-30 cases)');

// ----------------------------------------------------
// TEST SUITE 4: Bonding System Protocol Estimator
// ----------------------------------------------------
console.log('\n--- Test Suite 4: Clearfil SE Bond 2 Protocol ---');

const bondProtocol = estimateBondingProtocolCost({
  primerBottlePrice: 1100,
  primerBottleMl: 6,
  bondBottlePrice: 1300,
  bondBottleMl: 5,
  dropsPerMl: 48,
  primerDropsUsed: 1,
  bondDropsUsed: 1,
  microbrushesCount: 2,
  microbrushUnitPrice: 1.80,
});

assert(bondProtocol.costPerPrimerDrop === 3.82, 'Primer drop cost is 3.82 EGP');
assert(bondProtocol.costPerBondDrop === 5.42, 'Bond drop cost is 5.42 EGP');
assert(bondProtocol.microbrushCost === 3.60, 'Microbrushes cost: 2 * 1.80 = 3.60 EGP');
assert(bondProtocol.totalProtocolCost === 12.84, 'Total SE Bond 2 Protocol cost is 12.84 EGP');

// ----------------------------------------------------
// TEST SUITE 5: Break-Even Financial Engine
// ----------------------------------------------------
console.log('\n--- Test Suite 5: Break-Even & Financial Target ---');

const be = calculateBreakEven({
  monthlyFixedExpenses: 30000,
  averageRevenuePerProcedure: 1850,
  averageVariableCostPerProcedure: 925, // 50% contribution
  workingDaysPerMonth: 26,
  activeChairs: 2,
  targetMonthlyOperatingProfit: 25000,
});

assert(be.isValid === true, 'Break-even calculation is valid');
assert(be.contributionPerProcedure === 925, 'Contribution per procedure is 925 EGP');
assert(be.contributionMarginRatio === 50.0, 'Contribution margin ratio is 50.0%');
assert(be.breakEvenProceduresMonthly === 33, 'Break-even volume: 30000 / 925 = 33 procedures/month');
assert(be.breakEvenProceduresPerDay === 1.3, 'Break-even rate is 1.3 procedures/day');
assert(be.targetProfitProceduresMonthly === 60, 'Volume for 25k profit: (30000+25000)/925 = 60 procedures/month');
assert(be.scenarios.expected.profit === 25500, 'Expected scenario delivers target operating profit');

console.log('\n====================================================');
console.log(` RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
}
