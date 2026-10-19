import type { ComponentType } from 'react';
import { AnnuityExplorer } from './AnnuityExplorer';
import { AntiderivativeFamily } from './AntiderivativeFamily';
import { BayesNaturalFrequencies } from './BayesNaturalFrequencies';
import { BinomialPoissonBars } from './BinomialPoissonBars';
import { BreakEvenLines } from './BreakEvenLines';
import { BudgetVectors } from './BudgetVectors';
import { CementShippingPlan } from './CementShippingPlan';
import { ChainBaseGrowth } from './ChainBaseGrowth';
import { ChainRuleCostTime } from './ChainRuleCostTime';
import { ChebyshevPooling } from './ChebyshevPooling';
import { CompoundingFrequency } from './CompoundingFrequency';
import { ConfidenceIntervalCoverage } from './ConfidenceIntervalCoverage';
import { ContinuousDiscountArea } from './ContinuousDiscountArea';
import { CournotBestResponses } from './CournotBestResponses';
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
import { HypothesisTestExplorer } from './HypothesisTestExplorer';
import { IndexNumberBasket } from './IndexNumberBasket';
import { IndifferenceCurveMrs } from './IndifferenceCurveMrs';
import { IndifferenceMap } from './IndifferenceMap';
import { InverseDemandMirror } from './InverseDemandMirror';
import { InverseTwoMarkets } from './InverseTwoMarkets';
import { InvestmentRiskBars } from './InvestmentRiskBars';
import { IsoProfitCorners } from './IsoProfitCorners';
import { KeynesianCross } from './KeynesianCross';
import { LeastSquaresFit } from './LeastSquaresFit';
import { MarginalCostTangent } from './MarginalCostTangent';
import { MarginalRevenueLines } from './MarginalRevenueLines';
import { MarkovLabourMarket } from './MarkovLabourMarket';
import { NormalAreaExplorer } from './NormalAreaExplorer';
import { PowerExplorer } from './PowerExplorer';
import { ProductionConcavity } from './ProductionConcavity';
import { ProfitHillTangent } from './ProfitHillTangent';
import { RevenueProfit } from './RevenueProfit';
import { RiemannSumMarginalCost } from './RiemannSumMarginalCost';
import { SampleMeanClt } from './SampleMeanClt';
import { SecantToTangent } from './SecantToTangent';
import { ShadowPriceHours } from './ShadowPriceHours';
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
import { TwoAssetPortfolio } from './TwoAssetPortfolio';
import { TwoLineSystem } from './TwoLineSystem';
import { TwoProductProfitMap } from './TwoProductProfitMap';
import { WageOutlierDots } from './WageOutlierDots';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'annuity-explorer': AnnuityExplorer,
  'bayes-natural-frequencies': BayesNaturalFrequencies,
  'binomial-poisson-bars': BinomialPoissonBars,
  'break-even-lines': BreakEvenLines,
  'budget-vectors': BudgetVectors,
  'cement-shipping-plan': CementShippingPlan,
  'chain-base-growth': ChainBaseGrowth,
  'chain-rule-cost-time': ChainRuleCostTime,
  'chebyshev-pooling': ChebyshevPooling,
  'compounding-frequency': CompoundingFrequency,
  'confidence-interval-coverage': ConfidenceIntervalCoverage,
  'continuous-discount-area': ContinuousDiscountArea,
  'cost-antiderivative-family': AntiderivativeFamily,
  'cournot-best-responses': CournotBestResponses,
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
  'hypothesis-test-explorer': HypothesisTestExplorer,
  'index-number-basket': IndexNumberBasket,
  'indifference-curve-mrs': IndifferenceCurveMrs,
  'indifference-map': IndifferenceMap,
  'inverse-demand-mirror': InverseDemandMirror,
  'inverse-two-markets': InverseTwoMarkets,
  'investment-risk-bars': InvestmentRiskBars,
  'iso-profit-corners': IsoProfitCorners,
  'keynesian-cross': KeynesianCross,
  'least-squares-fit': LeastSquaresFit,
  'lp-shadow-price-hours': ShadowPriceHours,
  'marginal-cost-tangent': MarginalCostTangent,
  'marginal-revenue-lines': MarginalRevenueLines,
  'markov-labour-market': MarkovLabourMarket,
  'normal-area-explorer': NormalAreaExplorer,
  'power-explorer': PowerExplorer,
  'production-concavity': ProductionConcavity,
  'profit-hill-tangent': ProfitHillTangent,
  'revenue-profit': RevenueProfit,
  'riemann-sum-marginal-cost': RiemannSumMarginalCost,
  'sample-mean-clt': SampleMeanClt,
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
  'two-asset-portfolio': TwoAssetPortfolio,
  'two-line-system': TwoLineSystem,
  'two-product-profit-map': TwoProductProfitMap,
  'wage-outlier-dots': WageOutlierDots,
};
