import type { ComponentType } from 'react';
import { AnnuityExplorer } from './AnnuityExplorer';
import { AntiderivativeFamily } from './AntiderivativeFamily';
import { BreakEvenLines } from './BreakEvenLines';
import { BudgetVectors } from './BudgetVectors';
import { ChainRuleCostTime } from './ChainRuleCostTime';
import { CompoundingFrequency } from './CompoundingFrequency';
import { ContinuousDiscountArea } from './ContinuousDiscountArea';
import { DeterminantArea } from './DeterminantArea';
import { DiscountingExplorer } from './DiscountingExplorer';
import { DoubleIntegralGrid } from './DoubleIntegralGrid';
import { DoublingTime } from './DoublingTime';
import { ElasticitySlider } from './ElasticitySlider';
import { EquilibriumTax } from './EquilibriumTax';
import { FixedCostBreakEven } from './FixedCostBreakEven';
import { GeometricPartialSums } from './GeometricPartialSums';
import { GradientLevelCurves } from './GradientLevelCurves';
import { GrowingStreamPV } from './GrowingStreamPV';
import { GrowthRateExplorer } from './GrowthRateExplorer';
import { IndifferenceCurveMrs } from './IndifferenceCurveMrs';
import { IndifferenceMap } from './IndifferenceMap';
import { InverseDemandMirror } from './InverseDemandMirror';
import { InverseTwoMarkets } from './InverseTwoMarkets';
import { KeynesianCross } from './KeynesianCross';
import { MarginalCostTangent } from './MarginalCostTangent';
import { MarginalRevenueLines } from './MarginalRevenueLines';
import { PowerExplorer } from './PowerExplorer';
import { ProductionConcavity } from './ProductionConcavity';
import { ProfitHillTangent } from './ProfitHillTangent';
import { RevenueProfit } from './RevenueProfit';
import { RiemannSumMarginalCost } from './RiemannSumMarginalCost';
import { SecantToTangent } from './SecantToTangent';
import { ShopRevenueMatrix } from './ShopRevenueMatrix';
import { SimpleVsCompound } from './SimpleVsCompound';
import { SpanAndBasis } from './SpanAndBasis';
import { SpendingRounds } from './SpendingRounds';
import { SurplusTaxWelfare } from './SurplusTaxWelfare';
import { SurveyVenn } from './SurveyVenn';
import { TankVolumeDiscs } from './TankVolumeDiscs';
import { TariffContinuity } from './TariffContinuity';
import { TaxBandExplorer } from './TaxBandExplorer';
import { TaylorLogApproximation } from './TaylorLogApproximation';
import { TwoLineSystem } from './TwoLineSystem';
import { TwoProductProfitMap } from './TwoProductProfitMap';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'annuity-explorer': AnnuityExplorer,
  'break-even-lines': BreakEvenLines,
  'budget-vectors': BudgetVectors,
  'chain-rule-cost-time': ChainRuleCostTime,
  'compounding-frequency': CompoundingFrequency,
  'continuous-discount-area': ContinuousDiscountArea,
  'cost-antiderivative-family': AntiderivativeFamily,
  'determinant-area': DeterminantArea,
  'discounting-explorer': DiscountingExplorer,
  'double-integral-grid': DoubleIntegralGrid,
  'doubling-time': DoublingTime,
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
  'fixed-cost-break-even': FixedCostBreakEven,
  'geometric-partial-sums': GeometricPartialSums,
  'gradient-level-curves': GradientLevelCurves,
  'growing-stream-present-value': GrowingStreamPV,
  'growth-rate-explorer': GrowthRateExplorer,
  'indifference-curve-mrs': IndifferenceCurveMrs,
  'indifference-map': IndifferenceMap,
  'inverse-demand-mirror': InverseDemandMirror,
  'inverse-two-markets': InverseTwoMarkets,
  'keynesian-cross': KeynesianCross,
  'marginal-cost-tangent': MarginalCostTangent,
  'marginal-revenue-lines': MarginalRevenueLines,
  'power-explorer': PowerExplorer,
  'production-concavity': ProductionConcavity,
  'profit-hill-tangent': ProfitHillTangent,
  'revenue-profit': RevenueProfit,
  'riemann-sum-marginal-cost': RiemannSumMarginalCost,
  'secant-to-tangent': SecantToTangent,
  'shop-revenue-matrix': ShopRevenueMatrix,
  'simple-vs-compound': SimpleVsCompound,
  'span-and-basis': SpanAndBasis,
  'spending-rounds': SpendingRounds,
  'surplus-tax-welfare': SurplusTaxWelfare,
  'survey-venn': SurveyVenn,
  'tank-volume-discs': TankVolumeDiscs,
  'tariff-continuity': TariffContinuity,
  'tax-band-explorer': TaxBandExplorer,
  'taylor-log-approximation': TaylorLogApproximation,
  'two-line-system': TwoLineSystem,
  'two-product-profit-map': TwoProductProfitMap,
};
