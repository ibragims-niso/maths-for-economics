import type { Generator } from '../engine/types';
import { continuousTariffParameter } from './C101/continuous-tariff-parameter';
import { limitByCancelling } from './C101/limit-by-cancelling';
import { longRunCostRatio } from './C101/long-run-cost-ratio';
import { costAverageRateOfChange } from './C102/cost-average-rate-of-change';
import { instantaneousRateQuadratic } from './C102/instantaneous-rate-quadratic';
import { tangentLineIntercept } from './C102/tangent-line-intercept';
import { averageCostSlopeQuotientRule } from './C103/average-cost-slope-quotient-rule';
import { marginalCostCubic } from './C103/marginal-cost-cubic';
import { marginalRevenueProductRule } from './C103/marginal-revenue-product-rule';
import { chainRulePowerAtPoint } from './C104/chain-rule-power-at-point';
import { costRateOverTime } from './C104/cost-rate-over-time';
import { marginalRevenueProductLabour } from './C104/marginal-revenue-product-labour';
import { expLogDerivativeAtPoint } from './C105/exp-log-derivative-at-point';
import { growthAccountingTfp } from './C105/growth-accounting-tfp';
import { growthRateRatioProduct } from './C105/growth-rate-ratio-product';
import { costOfOneMoreUnit } from './C106/cost-of-one-more-unit';
import { marginalProfitAtOutput } from './C106/marginal-profit-at-output';
import { marginalRevenueLinearDemand } from './C106/marginal-revenue-linear-demand';
import { elasticityLinearPoint } from './C107/elasticity-linear-point';
import { elasticityUnitElasticPrice } from './C107/elasticity-unit-elastic-price';
import { cubicCostInflectionOutput } from './C108/cubic-cost-inflection-output';
import { peakMarginalProduct } from './C108/peak-marginal-product';
import { secondDerivativeAtPoint } from './C108/second-derivative-at-point';
import { minAverageCost } from './C109/min-average-cost';
import { profitMaxLinearDemand } from './C109/profit-max-linear-demand';
import { frontierSlopeImplicit } from './C110/frontier-slope-implicit';
import { indifferenceCurveSlope } from './C110/indifference-curve-slope';
import { isoquantMrts } from './C110/isoquant-mrts';
import { compoundGrowthQuadraticApproximation } from './C111/compound-growth-quadratic-approximation';
import { linearApproximationEstimate } from './C111/linear-approximation-estimate';
import { quadraticApproximationEstimate } from './C111/quadratic-approximation-estimate';
import { capitalStockFromInvestment } from './C112/capital-stock-from-investment';
import { priceFromMarginalRevenue } from './C112/price-from-marginal-revenue';
import { totalCostFromMarginalCost } from './C112/total-cost-from-marginal-cost';
import { accumulatedExponentialFlow } from './C113/accumulated-exponential-flow';
import { averagePriceOverPeriod } from './C113/average-price-over-period';
import { costIncreaseFromMarginalCost } from './C113/cost-increase-from-marginal-cost';
import { consumerSurplusLinearEquilibrium } from './C114/consumer-surplus-linear-equilibrium';
import { consumerSurplusQuadraticDemand } from './C114/consumer-surplus-quadratic-demand';
import { deadweightLossPerUnitTax } from './C114/deadweight-loss-per-unit-tax';
import { presentValueGrowingStream } from './C115/present-value-growing-stream';
import { substitutionTotalFromMarginal } from './C115/substitution-total-from-marginal';
import { totalOutputLogRate } from './C115/total-output-log-rate';
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
import { matrixChainPlantCost } from './LA102/matrix-chain-plant-cost';
import { matrixProductRevenueEntry } from './LA102/matrix-product-revenue-entry';
import { transitionMatrixTwoStep } from './LA102/transition-matrix-two-step';
import { machineHoursBackSubstitution } from './LA103/machine-hours-back-substitution';
import { singularSystemParameter } from './LA103/singular-system-parameter';
import { threeMarketEquilibriumPrice } from './LA103/three-market-equilibrium-price';
import { cramerIncomeModel } from './LA104/cramer-income-model';
import { cramerTwoMarketPrice } from './LA104/cramer-two-market-price';
import { determinant3x3Cofactor } from './LA104/determinant-3x3-cofactor';
import { equilibriumPricesInverse } from './LA105/equilibrium-prices-inverse';
import { inverse2x2Entry } from './LA105/inverse-2x2-entry';
import { inverse3x3CofactorEntry } from './LA105/inverse-3x3-cofactor-entry';
import { dependenceParameterK } from './LA201/dependence-parameter-k';
import { matrixRankElimination } from './LA201/matrix-rank-elimination';
import { replicatePayoffCoordinates } from './LA201/replicate-payoff-coordinates';
import { levelCurveThroughPoint } from './MV01/level-curve-through-point';
import { sameIndifferenceCurveQuantity } from './MV01/same-indifference-curve-quantity';
import { cobbDouglasMarginalProduct } from './MV02/cobb-douglas-marginal-product';
import { directionalDerivativeUtility } from './MV02/directional-derivative-utility';
import { jointCostPartialMarginalCost } from './MV02/joint-cost-partial-marginal-cost';
import { hessianDeterminantTwoGoods } from './MV07/hessian-determinant-two-goods';
import { priceDiscriminationTwoMarkets } from './MV07/price-discrimination-two-markets';
import { twoProductOptimalOutput } from './MV07/two-product-optimal-output';

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
  costAverageRateOfChange,
  instantaneousRateQuadratic,
  tangentLineIntercept,
  marginalCostCubic,
  marginalRevenueProductRule,
  averageCostSlopeQuotientRule,
  chainRulePowerAtPoint,
  costRateOverTime,
  marginalRevenueProductLabour,
  growthRateRatioProduct,
  expLogDerivativeAtPoint,
  growthAccountingTfp,
  marginalRevenueLinearDemand,
  costOfOneMoreUnit,
  marginalProfitAtOutput,
  elasticityLinearPoint,
  elasticityUnitElasticPrice,
  secondDerivativeAtPoint,
  cubicCostInflectionOutput,
  peakMarginalProduct,
  profitMaxLinearDemand,
  minAverageCost,
  indifferenceCurveSlope,
  isoquantMrts,
  frontierSlopeImplicit,
  linearApproximationEstimate,
  compoundGrowthQuadraticApproximation,
  quadraticApproximationEstimate,
  totalCostFromMarginalCost,
  priceFromMarginalRevenue,
  capitalStockFromInvestment,
  costIncreaseFromMarginalCost,
  accumulatedExponentialFlow,
  averagePriceOverPeriod,
  consumerSurplusLinearEquilibrium,
  deadweightLossPerUnitTax,
  consumerSurplusQuadraticDemand,
  substitutionTotalFromMarginal,
  presentValueGrowingStream,
  totalOutputLogRate,
  bundleCostDotProduct,
  bundleDistanceNorm,
  bundleAngleCosine,
  matrixProductRevenueEntry,
  transitionMatrixTwoStep,
  matrixChainPlantCost,
  machineHoursBackSubstitution,
  threeMarketEquilibriumPrice,
  singularSystemParameter,
  cramerIncomeModel,
  determinant3x3Cofactor,
  cramerTwoMarketPrice,
  inverse2x2Entry,
  equilibriumPricesInverse,
  inverse3x3CofactorEntry,
  levelCurveThroughPoint,
  sameIndifferenceCurveQuantity,
  cobbDouglasMarginalProduct,
  jointCostPartialMarginalCost,
  directionalDerivativeUtility,
  hessianDeterminantTwoGoods,
  twoProductOptimalOutput,
  priceDiscriminationTwoMarkets,
  replicatePayoffCoordinates,
  matrixRankElimination,
  dependenceParameterK,
] as unknown as readonly Generator[];

const byId = new Map(GENERATORS.map((g) => [g.id, g]));

export function generatorById(id: string): Generator | undefined {
  return byId.get(id);
}
