import type { ComponentType } from 'react';
import { AdjustmentCostPaths } from './AdjustmentCostPaths';
import { AnnuityExplorer } from './AnnuityExplorer';
import { AntiderivativeFamily } from './AntiderivativeFamily';
import { Ar1ErrorRuns } from './Ar1ErrorRuns';
import { Ar1ShockPath } from './Ar1ShockPath';
import { AuditBestResponses } from './AuditBestResponses';
import { AverageCostAsymptotes } from './AverageCostAsymptotes';
import { BayesNaturalFrequencies } from './BayesNaturalFrequencies';
import { BernoulliLogLikelihood } from './BernoulliLogLikelihood';
import { BinomialOptionTree } from './BinomialOptionTree';
import { BinomialPoissonBars } from './BinomialPoissonBars';
import { BondPriceYield } from './BondPriceYield';
import { BreakEvenLines } from './BreakEvenLines';
import { BudgetSetBall } from './BudgetSetBall';
import { BudgetVectors } from './BudgetVectors';
import { CementShippingPlan } from './CementShippingPlan';
import { ChainBaseGrowth } from './ChainBaseGrowth';
import { ChainRuleCostTime } from './ChainRuleCostTime';
import { ChebyshevPooling } from './ChebyshevPooling';
import { CityCountryMigration } from './CityCountryMigration';
import { CobbDouglasCostMin } from './CobbDouglasCostMin';
import { CobbDouglasCurvature } from './CobbDouglasCurvature';
import { CobwebDiagram } from './CobwebDiagram';
import { CompoundingFrequency } from './CompoundingFrequency';
import { ConferenceCriticalPath } from './ConferenceCriticalPath';
import { ConfidenceIntervalCoverage } from './ConfidenceIntervalCoverage';
import { ContinuousDiscountArea } from './ContinuousDiscountArea';
import { CournotBestResponses } from './CournotBestResponses';
import { DemandPreferenceTypes } from './DemandPreferenceTypes';
import { DeterminantArea } from './DeterminantArea';
import { DiscountingExplorer } from './DiscountingExplorer';
import { DoubleIntegralGrid } from './DoubleIntegralGrid';
import { DoublingTime } from './DoublingTime';
import { EigenDirections } from './EigenDirections';
import { ElasticitySlider } from './ElasticitySlider';
import { EntryDeterrenceTree } from './EntryDeterrenceTree';
import { EpsilonBand } from './EpsilonBand';
import { EpsilonDeltaSquare } from './EpsilonDeltaSquare';
import { EquilibriumTax } from './EquilibriumTax';
import { EulerReturnsToScale } from './EulerReturnsToScale';
import { ExpectedUtilityChord } from './ExpectedUtilityChord';
import { FixedCostBreakEven } from './FixedCostBreakEven';
import { FixedPointStaircase } from './FixedPointStaircase';
import { FleetIntegerPlan } from './FleetIntegerPlan';
import { GeometricPartialSums } from './GeometricPartialSums';
import { GradientDescentPath } from './GradientDescentPath';
import { GradientLevelCurves } from './GradientLevelCurves';
import { GrimTriggerStreams } from './GrimTriggerStreams';
import { GrowingStreamPV } from './GrowingStreamPV';
import { GrowthRateExplorer } from './GrowthRateExplorer';
import { HaulierRouteBellman } from './HaulierRouteBellman';
import { HypothesisTestExplorer } from './HypothesisTestExplorer';
import { ImplicationTruthTable } from './ImplicationTruthTable';
import { IncomeShiftEquilibrium } from './IncomeShiftEquilibrium';
import { IndexNumberBasket } from './IndexNumberBasket';
import { IndifferenceCurveMrs } from './IndifferenceCurveMrs';
import { IndifferenceMap } from './IndifferenceMap';
import { InverseDemandMirror } from './InverseDemandMirror';
import { InverseTwoMarkets } from './InverseTwoMarkets';
import { InvestmentRiskBars } from './InvestmentRiskBars';
import { IsoProfitCorners } from './IsoProfitCorners';
import { KeynesianCross } from './KeynesianCross';
import { LagrangeBudgetTangency } from './LagrangeBudgetTangency';
import { LeastSquaresFit } from './LeastSquaresFit';
import { LeontiefTwoSector } from './LeontiefTwoSector';
import { LinearPhasePortrait } from './LinearPhasePortrait';
import { LoanScheduleBars } from './LoanScheduleBars';
import { MarginalCostTangent } from './MarginalCostTangent';
import { MarginalRevenueLines } from './MarginalRevenueLines';
import { MarkovLabourMarket } from './MarkovLabourMarket';
import { MeanValueTangent } from './MeanValueTangent';
import { MonteCarloRunningMean } from './MonteCarloRunningMean';
import { MultiplierAccelerator } from './MultiplierAccelerator';
import { NewtonBreakEven } from './NewtonBreakEven';
import { NormalAreaExplorer } from './NormalAreaExplorer';
import { NpvProfileTwoProjects } from './NpvProfileTwoProjects';
import { OlsSlopeSampling } from './OlsSlopeSampling';
import { PartialEffectWages } from './PartialEffectWages';
import { PovertyTrapMap } from './PovertyTrapMap';
import { PowerExplorer } from './PowerExplorer';
import { PriceAdjustmentPath } from './PriceAdjustmentPath';
import { ProductionConcavity } from './ProductionConcavity';
import { ProfitEnvelope } from './ProfitEnvelope';
import { ProfitHillTangent } from './ProfitHillTangent';
import { QuadraticFormContours } from './QuadraticFormContours';
import { QuasilinearCorner } from './QuasilinearCorner';
import { QueueWaitingCurve } from './QueueWaitingCurve';
import { RamseyPhaseDiagram } from './RamseyPhaseDiagram';
import { RandomWalkFan } from './RandomWalkFan';
import { RegressionFTest } from './RegressionFTest';
import { ResourceExtractionPath } from './ResourceExtractionPath';
import { RevenueProfit } from './RevenueProfit';
import { RiemannSumMarginalCost } from './RiemannSumMarginalCost';
import { SampleMeanClt } from './SampleMeanClt';
import { SecantToTangent } from './SecantToTangent';
import { SecondOrderDamping } from './SecondOrderDamping';
import { ShadowPriceHours } from './ShadowPriceHours';
import { ShadowPriceValueFunction } from './ShadowPriceValueFunction';
import { ShopRevenueMatrix } from './ShopRevenueMatrix';
import { SimpleVsCompound } from './SimpleVsCompound';
import { SmallRateApproximations } from './SmallRateApproximations';
import { SpanAndBasis } from './SpanAndBasis';
import { SpendingRounds } from './SpendingRounds';
import { SupplyComparativeStatics } from './SupplyComparativeStatics';
import { SurplusTaxWelfare } from './SurplusTaxWelfare';
import { SurveyVenn } from './SurveyVenn';
import { TankVolumeDiscs } from './TankVolumeDiscs';
import { TariffContinuity } from './TariffContinuity';
import { TaxBandExplorer } from './TaxBandExplorer';
import { TaylorLogApproximation } from './TaylorLogApproximation';
import { TotalDifferentialIsoquants } from './TotalDifferentialIsoquants';
import { TradeBalanceLine } from './TradeBalanceLine';
import { TwoAssetPortfolio } from './TwoAssetPortfolio';
import { TwoLineSystem } from './TwoLineSystem';
import { TwoProductProfitMap } from './TwoProductProfitMap';
import { WageOutlierDots } from './WageOutlierDots';
import { ZeroSumLowerEnvelope } from './ZeroSumLowerEnvelope';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'adjustment-cost-paths': AdjustmentCostPaths,
  'annuity-explorer': AnnuityExplorer,
  'ar1-error-runs': Ar1ErrorRuns,
  'ar1-shock-path': Ar1ShockPath,
  'audit-best-responses': AuditBestResponses,
  'average-cost-asymptotes': AverageCostAsymptotes,
  'bayes-natural-frequencies': BayesNaturalFrequencies,
  'binomial-option-tree': BinomialOptionTree,
  'binomial-poisson-bars': BinomialPoissonBars,
  'bond-price-yield': BondPriceYield,
  'break-even-lines': BreakEvenLines,
  'budget-set-open-ball': BudgetSetBall,
  'budget-vectors': BudgetVectors,
  'cement-shipping-plan': CementShippingPlan,
  'chain-base-growth': ChainBaseGrowth,
  'chain-rule-cost-time': ChainRuleCostTime,
  'chebyshev-pooling': ChebyshevPooling,
  'city-countryside-migration': CityCountryMigration,
  'cobb-douglas-cost-min': CobbDouglasCostMin,
  'cobb-douglas-curvature': CobbDouglasCurvature,
  'cobweb-diagram': CobwebDiagram,
  'compounding-frequency': CompoundingFrequency,
  'conference-critical-path': ConferenceCriticalPath,
  'confidence-interval-coverage': ConfidenceIntervalCoverage,
  'continuous-discount-area': ContinuousDiscountArea,
  'cost-antiderivative-family': AntiderivativeFamily,
  'cournot-best-responses': CournotBestResponses,
  'demand-preference-types': DemandPreferenceTypes,
  'determinant-area': DeterminantArea,
  'discounting-explorer': DiscountingExplorer,
  'double-integral-grid': DoubleIntegralGrid,
  'doubling-time': DoublingTime,
  'eigen-directions': EigenDirections,
  'elasticity-slider': ElasticitySlider,
  'entry-deterrence-tree': EntryDeterrenceTree,
  'epsilon-delta-square': EpsilonDeltaSquare,
  'epsilon-n-band': EpsilonBand,
  'equilibrium-tax': EquilibriumTax,
  'euler-returns-to-scale': EulerReturnsToScale,
  'expected-utility-chord': ExpectedUtilityChord,
  'fixed-cost-break-even': FixedCostBreakEven,
  'fixed-point-staircase': FixedPointStaircase,
  'fleet-integer-plan': FleetIntegerPlan,
  'geometric-partial-sums': GeometricPartialSums,
  'gradient-descent-path': GradientDescentPath,
  'gradient-level-curves': GradientLevelCurves,
  'grim-trigger-streams': GrimTriggerStreams,
  'growing-stream-present-value': GrowingStreamPV,
  'growth-rate-explorer': GrowthRateExplorer,
  'haulier-route-bellman': HaulierRouteBellman,
  'hypothesis-test-explorer': HypothesisTestExplorer,
  'implication-truth-table': ImplicationTruthTable,
  'income-shift-equilibrium': IncomeShiftEquilibrium,
  'index-number-basket': IndexNumberBasket,
  'indifference-curve-mrs': IndifferenceCurveMrs,
  'indifference-map': IndifferenceMap,
  'inverse-demand-mirror': InverseDemandMirror,
  'inverse-two-markets': InverseTwoMarkets,
  'investment-risk-bars': InvestmentRiskBars,
  'iso-profit-corners': IsoProfitCorners,
  'keynesian-cross': KeynesianCross,
  'lagrange-budget-tangency': LagrangeBudgetTangency,
  'least-squares-fit': LeastSquaresFit,
  'leontief-two-sector': LeontiefTwoSector,
  'linear-phase-portrait': LinearPhasePortrait,
  'loan-schedule-bars': LoanScheduleBars,
  'lp-shadow-price-hours': ShadowPriceHours,
  'marginal-cost-tangent': MarginalCostTangent,
  'marginal-revenue-lines': MarginalRevenueLines,
  'markov-labour-market': MarkovLabourMarket,
  'mean-value-tangent': MeanValueTangent,
  'mle-bernoulli-log-likelihood': BernoulliLogLikelihood,
  'mm1-waiting-curve': QueueWaitingCurve,
  'monte-carlo-running-mean': MonteCarloRunningMean,
  'multiplier-accelerator': MultiplierAccelerator,
  'newton-break-even': NewtonBreakEven,
  'normal-area-explorer': NormalAreaExplorer,
  'npv-profile-two-projects': NpvProfileTwoProjects,
  'ols-slope-sampling': OlsSlopeSampling,
  'partial-effect-wages': PartialEffectWages,
  'poverty-trap-map': PovertyTrapMap,
  'power-explorer': PowerExplorer,
  'price-adjustment-path': PriceAdjustmentPath,
  'production-concavity': ProductionConcavity,
  'profit-envelope-hotelling': ProfitEnvelope,
  'profit-hill-tangent': ProfitHillTangent,
  'quadratic-form-contours': QuadraticFormContours,
  'quasilinear-corner-budget': QuasilinearCorner,
  'ramsey-phase-diagram': RamseyPhaseDiagram,
  'random-walk-fan': RandomWalkFan,
  'regression-f-test': RegressionFTest,
  'resource-extraction-path': ResourceExtractionPath,
  'revenue-profit': RevenueProfit,
  'riemann-sum-marginal-cost': RiemannSumMarginalCost,
  'sample-mean-clt': SampleMeanClt,
  'secant-to-tangent': SecantToTangent,
  'second-order-damping': SecondOrderDamping,
  'shadow-price-value-function': ShadowPriceValueFunction,
  'shop-revenue-matrix': ShopRevenueMatrix,
  'simple-vs-compound': SimpleVsCompound,
  'small-rate-approximations': SmallRateApproximations,
  'span-and-basis': SpanAndBasis,
  'spending-rounds': SpendingRounds,
  'supply-comparative-statics': SupplyComparativeStatics,
  'surplus-tax-welfare': SurplusTaxWelfare,
  'survey-venn': SurveyVenn,
  'tank-volume-discs': TankVolumeDiscs,
  'tariff-continuity': TariffContinuity,
  'tax-band-explorer': TaxBandExplorer,
  'taylor-log-approximation': TaylorLogApproximation,
  'total-differential-isoquants': TotalDifferentialIsoquants,
  'trade-balance-line': TradeBalanceLine,
  'two-asset-portfolio': TwoAssetPortfolio,
  'two-line-system': TwoLineSystem,
  'two-product-profit-map': TwoProductProfitMap,
  'wage-outlier-dots': WageOutlierDots,
  'zero-sum-lower-envelope': ZeroSumLowerEnvelope,
};
