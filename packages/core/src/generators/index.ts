import type { Generator } from '../engine/types';
import { continuousTariffParameter } from './C101/continuous-tariff-parameter';
import { limitByCancelling } from './C101/limit-by-cancelling';
import { longRunCostRatio } from './C101/long-run-cost-ratio';
import { elasticityLinearPoint } from './C107/elasticity-linear-point';
import { elasticityUnitElasticPrice } from './C107/elasticity-unit-elastic-price';
import { minAverageCost } from './C109/min-average-cost';
import { profitMaxLinearDemand } from './C109/profit-max-linear-demand';
import { cobbDouglasLabourNeeded } from './F01/cobb-douglas-labour-needed';
import { cobbDouglasOutput } from './F01/cobb-douglas-output';
import { exponentLawsSimplify } from './F01/exponent-laws-simplify';
import { breakEvenMaxFixedCost } from './F02/break-even-max-fixed-cost';
import { budgetMaxWholeUnits } from './F02/budget-max-whole-units';
import { quadraticBreakEven } from './F02/quadratic-break-even';
import { costFunctionChange } from './F03/cost-function-change';
import { demandDomainMaxPrice } from './F03/demand-domain-max-price';
import { incomeTaxBands } from './F03/income-tax-bands';
import { linearBreakEven } from './F04/linear-break-even';
import { linearDemandTwoPoints } from './F04/linear-demand-two-points';
import { equilibriumPrice } from './F05/equilibrium-price';
import { equilibriumTaxPrice } from './F05/equilibrium-tax-price';
import { maxProfitQuadratic } from './F06/max-profit-quadratic';
import { maxRevenueLinearDemand } from './F06/max-revenue-linear-demand';
import { profitMaximisingPrice } from './F06/profit-maximising-price';
import { averageAnnualGrowthRate } from './F07/average-annual-growth-rate';
import { depreciationTimeToValue } from './F07/depreciation-time-to-value';
import { growthTimeToMultiply } from './F07/growth-time-to-multiply';
import { arithmeticSalaryTotal } from './F08/arithmetic-salary-total';
import { salaryOffersDifference } from './F08/salary-offers-difference';
import { spendingRoundsTotal } from './F08/spending-rounds-total';
import { sigmaLinearSum } from './F09/sigma-linear-sum';
import { surveyInclusionExclusion } from './F09/survey-inclusion-exclusion';
import { threeSetInclusionExclusion } from './F09/three-set-inclusion-exclusion';
import { compositeCostOfLabour } from './F10/composite-cost-of-labour';
import { inverseDemandPrice } from './F10/inverse-demand-price';
import { labourForCostBudget } from './F10/labour-for-cost-budget';
import { fiscalMultiplierTaxImports } from './F11/fiscal-multiplier-tax-imports';
import { keynesianEquilibriumIncome } from './F11/keynesian-equilibrium-income';
import { moneyMultiplierCurrency } from './F11/money-multiplier-currency';
import { compoundInterestAmount } from './FM01/compound-interest-amount';
import { simpleInterestAmount } from './FM01/simple-interest-amount';
import { continuousCompoundingAmount } from './FM02/continuous-compounding-amount';
import { effectiveAnnualRate } from './FM02/effective-annual-rate';
import { nominalRateFromEffective } from './FM02/nominal-rate-from-effective';
import { impliedAnnualRate } from './FM03/implied-annual-rate';
import { presentValueSingle } from './FM03/present-value-single';
import { presentValueUnevenFlows } from './FM03/present-value-uneven-flows';
import { annuityPresentValue } from './FM04/annuity-present-value';
import { growingPerpetuityValue } from './FM04/growing-perpetuity-value';
import { savingPlanPayment } from './FM04/saving-plan-payment';
import { bundleAngleCosine } from './LA101/bundle-angle-cosine';
import { bundleCostDotProduct } from './LA101/bundle-cost-dot-product';
import { bundleDistanceNorm } from './LA101/bundle-distance-norm';

/** Every problem generator in the app. Topic files list their generators by these IDs. */
// Each generator has its own parameter type; the list holds them under the common interface.
export const GENERATORS = [
  exponentLawsSimplify,
  cobbDouglasOutput,
  cobbDouglasLabourNeeded,
  budgetMaxWholeUnits,
  quadraticBreakEven,
  breakEvenMaxFixedCost,
  costFunctionChange,
  demandDomainMaxPrice,
  incomeTaxBands,
  linearBreakEven,
  linearDemandTwoPoints,
  equilibriumPrice,
  equilibriumTaxPrice,
  maxRevenueLinearDemand,
  maxProfitQuadratic,
  profitMaximisingPrice,
  growthTimeToMultiply,
  averageAnnualGrowthRate,
  depreciationTimeToValue,
  arithmeticSalaryTotal,
  spendingRoundsTotal,
  salaryOffersDifference,
  surveyInclusionExclusion,
  sigmaLinearSum,
  threeSetInclusionExclusion,
  inverseDemandPrice,
  compositeCostOfLabour,
  labourForCostBudget,
  keynesianEquilibriumIncome,
  fiscalMultiplierTaxImports,
  moneyMultiplierCurrency,
  simpleInterestAmount,
  compoundInterestAmount,
  effectiveAnnualRate,
  continuousCompoundingAmount,
  nominalRateFromEffective,
  presentValueSingle,
  presentValueUnevenFlows,
  impliedAnnualRate,
  annuityPresentValue,
  growingPerpetuityValue,
  savingPlanPayment,
  limitByCancelling,
  longRunCostRatio,
  continuousTariffParameter,
  elasticityLinearPoint,
  elasticityUnitElasticPrice,
  profitMaxLinearDemand,
  minAverageCost,
  bundleCostDotProduct,
  bundleDistanceNorm,
  bundleAngleCosine,
] as unknown as readonly Generator[];

const byId = new Map(GENERATORS.map((g) => [g.id, g]));

export function generatorById(id: string): Generator | undefined {
  return byId.get(id);
}
