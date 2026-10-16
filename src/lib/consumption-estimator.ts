/**
 * Advanced Dental Material Consumption Estimator & Calibration
 * Specially designed for Biomimetic and Adhesive Dentistry
 */

export type EvidenceTier =
  | 'MANUFACTURER' // 1. Manufacturer verified package specification
  | 'PUBLISHED_EVIDENCE' // 2. Peer-reviewed literature / clinical protocol
  | 'MEASURED_CLINIC' // 3. Measured consumption from A-Class clinic completed cases
  | 'DENTIST_ESTIMATE' // 4. Dentist-entered clinical estimate
  | 'TEMPORARY_DEFAULT'; // 5. Temporary unverified default

export interface MaterialEstimationInput {
  packagePrice: number; // EGP
  packageQuantity: number; // e.g. 1 bottle, 1 syringe, 1 roll
  packageUnit: string; // SYRINGE, BOTTLE, ROLL, BOX, etc.
  baseUnit: string; // ML, G, MM, PIECE, etc.
  conversionFactor: number; // e.g. 5 ml per bottle, 4.9 g per syringe, 220 mm per roll
  unusableWastePercent: number; // e.g. 5%
  averageQuantityPerCase: number; // e.g. 0.15 ml, 0.35 g, 15 mm
  observedCasesCount?: number; // Real cases recorded
  totalMeasuredQuantityUsed?: number; // Total actually consumed in clinic
  evidenceLevel: EvidenceTier;
}

export interface MaterialEstimationOutput {
  effectiveBaseUnitCost: number; // EGP per base unit (e.g. per ml or g)
  theoreticalApplicationsPerPackage: number;
  usableQuantityPerPackage: number;
  usableApplicationsPerPackage: number;
  expectedCostPerApplication: number; // EGP
  currentStockApplicationsEstimate: (currentStockBaseUnits: number) => number;
  calibration: {
    isCalibrated: boolean;
    measuredAverageUsagePerCase: number;
    variancePercentage: number;
    sampleSizeStatus: 'INSUFFICIENT' | 'PRELIMINARY' | 'ROBUST';
    recommendation: string;
  };
}

export function calculateMaterialEstimation(input: MaterialEstimationInput): MaterialEstimationOutput {
  const {
    packagePrice,
    conversionFactor,
    unusableWastePercent,
    averageQuantityPerCase,
    observedCasesCount = 0,
    totalMeasuredQuantityUsed = 0,
  } = input;

  const totalBaseUnits = conversionFactor > 0 ? conversionFactor : 1;
  const effectiveBaseUnitCost = packagePrice / totalBaseUnits;

  const theoreticalApplications =
    averageQuantityPerCase > 0 ? totalBaseUnits / averageQuantityPerCase : 0;

  const usableQuantity = totalBaseUnits * (1 - (unusableWastePercent || 0) / 100);
  const usableApplications =
    averageQuantityPerCase > 0 ? usableQuantity / averageQuantityPerCase : 0;

  const expectedCostPerApplication =
    usableApplications > 0 ? packagePrice / usableApplications : 0;

  // Real-world Calibration Logic
  let isCalibrated = false;
  let measuredAverage = 0;
  let variancePct = 0;
  let sampleStatus: 'INSUFFICIENT' | 'PRELIMINARY' | 'ROBUST' = 'INSUFFICIENT';
  let recommendation = 'Awaiting real case observations for statistical calibration.';

  if (observedCasesCount >= 1 && totalMeasuredQuantityUsed > 0) {
    measuredAverage = totalMeasuredQuantityUsed / observedCasesCount;
    variancePct =
      averageQuantityPerCase > 0
        ? ((measuredAverage - averageQuantityPerCase) / averageQuantityPerCase) * 100
        : 0;

    if (observedCasesCount < 10) {
      sampleStatus = 'INSUFFICIENT';
      recommendation = `Only ${observedCasesCount} case(s) recorded. Minimum 10 cases required before adjusting baseline.`;
    } else if (observedCasesCount < 30) {
      sampleStatus = 'PRELIMINARY';
      isCalibrated = true;
      if (Math.abs(variancePct) > 15) {
        recommendation = `Observed consumption differs by ${variancePct.toFixed(1)}% across ${observedCasesCount} cases. Review clinical technique or update standard baseline.`;
      } else {
        recommendation = `Usage is closely aligned with baseline (${variancePct > 0 ? '+' : ''}${variancePct.toFixed(1)}%). Preliminary calibration sound.`;
      }
    } else {
      sampleStatus = 'ROBUST';
      isCalibrated = true;
      recommendation = `High statistical confidence (${observedCasesCount} cases). Measured average: ${measuredAverage.toFixed(3)} ${input.baseUnit}/case.`;
    }
  }

  return {
    effectiveBaseUnitCost: Number(effectiveBaseUnitCost.toFixed(3)),
    theoreticalApplicationsPerPackage: Number(theoreticalApplications.toFixed(1)),
    usableQuantityPerPackage: Number(usableQuantity.toFixed(2)),
    usableApplicationsPerPackage: Number(usableApplications.toFixed(1)),
    expectedCostPerApplication: Number(expectedCostPerApplication.toFixed(2)),
    currentStockApplicationsEstimate: (currentStock) => {
      if (averageQuantityPerCase <= 0) return 0;
      return Math.floor(currentStock / averageQuantityPerCase);
    },
    calibration: {
      isCalibrated,
      measuredAverageUsagePerCase: Number(measuredAverage.toFixed(3)),
      variancePercentage: Number(variancePct.toFixed(1)),
      sampleSizeStatus: sampleStatus,
      recommendation,
    },
  };
}

/**
 * Specialized Bonding Bottle Protocol Estimator
 * Separates Primer drops from Bond drops for 2-step gold standard systems
 */
export function estimateBondingProtocolCost(params: {
  primerBottlePrice: number; // e.g. 1100 EGP
  primerBottleMl: number; // e.g. 6 ml
  bondBottlePrice: number; // e.g. 1300 EGP
  bondBottleMl: number; // e.g. 5 ml
  dropsPerMl?: number; // standard dropper: ~45-50 drops/ml
  primerDropsUsed: number; // typically 1-2 drops
  bondDropsUsed: number; // typically 1-2 drops
  microbrushesCount: number; // 2 microbrushes
  microbrushUnitPrice: number; // 1.80 EGP
}) {
  const dropsPerMl = params.dropsPerMl || 48;
  const costPerPrimerDrop = params.primerBottlePrice / (params.primerBottleMl * dropsPerMl);
  const costPerBondDrop = params.bondBottlePrice / (params.bondBottleMl * dropsPerMl);

  const primerCost = costPerPrimerDrop * params.primerDropsUsed;
  const bondCost = costPerBondDrop * params.bondDropsUsed;
  const microbrushCost = params.microbrushesCount * params.microbrushUnitPrice;

  const totalProtocolCost = primerCost + bondCost + microbrushCost;

  return {
    costPerPrimerDrop: Number(costPerPrimerDrop.toFixed(2)),
    costPerBondDrop: Number(costPerBondDrop.toFixed(2)),
    totalProtocolCost: Number(totalProtocolCost.toFixed(2)),
    primerCost: Number(primerCost.toFixed(2)),
    bondCost: Number(bondCost.toFixed(2)),
    microbrushCost: Number(microbrushCost.toFixed(2)),
  };
}
