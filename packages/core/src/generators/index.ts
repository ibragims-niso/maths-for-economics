import type { Generator } from '../engine/types';
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
import { compoundInterestAmount } from './FM01/compound-interest-amount';
import { simpleInterestAmount } from './FM01/simple-interest-amount';

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
  simpleInterestAmount,
  compoundInterestAmount,
  elasticityLinearPoint,
  elasticityUnitElasticPrice,
  profitMaxLinearDemand,
  minAverageCost,
] as unknown as readonly Generator[];

const byId = new Map(GENERATORS.map((g) => [g.id, g]));

export function generatorById(id: string): Generator | undefined {
  return byId.get(id);
}
