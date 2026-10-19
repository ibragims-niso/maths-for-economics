import type { Generator } from '../engine/types';
import { compoundOvertakesLinearYear } from './AN01/compound-overtakes-linear-year';
import { inductionSumClosedForm } from './AN01/induction-sum-closed-form';
import { truthTableTrueRows } from './AN01/truth-table-true-rows';
import { epsilonNThreshold } from './AN02/epsilon-n-threshold';
import { recursiveRootSequenceLimit } from './AN02/recursive-root-sequence-limit';
import { sequenceSupremum } from './AN02/sequence-supremum';
import { bisectionEquilibriumMidpoint } from './AN03/bisection-equilibrium-midpoint';
import { capacityProfitMaximum } from './AN03/capacity-profit-maximum';
import { epsilonDeltaLinear } from './AN03/epsilon-delta-linear';
import { budgetLineDistance } from './AN04/budget-line-distance';
import { budgetSetLargestBall } from './AN04/budget-set-largest-ball';
import { compactBudgetMaxUtility } from './AN04/compact-budget-max-utility';
import { banachIterationsNeeded } from './AN05/banach-iterations-needed';
import { cournotBestResponseFixedPoint } from './AN05/cournot-best-response-fixed-point';
import { linearContractionFixedPoint } from './AN05/linear-contraction-fixed-point';
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
import { continuousStreamPresentValue } from './C116/continuous-stream-present-value';
import { growingContinuousStreamValue } from './C116/growing-continuous-stream-value';
import { improperPowerIntegral } from './C116/improper-power-integral';
import { infiniteGeometricSeriesSum } from './C117/infinite-geometric-series-sum';
import { maclaurinPartialSumEstimate } from './C117/maclaurin-partial-sum-estimate';
import { powerSeriesRadius } from './C117/power-series-radius';
import { arcLengthThreeHalvesPower } from './C118/arc-length-three-halves-power';
import { lineIntegralWorkSegment } from './C118/line-integral-work-segment';
import { volumeOfRevolutionDisc } from './C118/volume-of-revolution-disc';
import { variationsAdjustmentPathValue } from './DO01/variations-adjustment-path-value';
import { variationsAdjustmentSaving } from './DO01/variations-adjustment-saving';
import { variationsStraightLinePath } from './DO01/variations-straight-line-path';
import { cakeEatingConsumptionAtTime } from './DO02/cake-eating-consumption-at-time';
import { hotellingRentAtTime } from './DO02/hotelling-rent-at-time';
import { keynesRamseyConsumptionGrowth } from './DO02/keynes-ramsey-consumption-growth';
import { dpBudgetAllocationBestReturn } from './DO03/dp-budget-allocation-best-return';
import { dpCakeEatingFirstConsumption } from './DO03/dp-cake-eating-first-consumption';
import { dpStagedRouteLeastCost } from './DO03/dp-staged-route-least-cost';
import { ramseyConsumptionGrowthAtCapital } from './DO04/ramsey-consumption-growth-at-capital';
import { ramseyModifiedGoldenRuleCapital } from './DO04/ramsey-modified-golden-rule-capital';
import { ramseySteadyStateConsumption } from './DO04/ramsey-steady-state-consumption';
import { cobwebPriceAfterPeriods } from './DY01/cobweb-price-after-periods';
import { debtRatioSteadyState } from './DY01/debt-ratio-steady-state';
import { differenceEquationValueAfterT } from './DY01/difference-equation-value-after-t';
import { characteristicEquationLargerRoot } from './DY02/characteristic-equation-larger-root';
import { multiplierAcceleratorIncome } from './DY02/multiplier-accelerator-income';
import { secondOrderIteratedValue } from './DY02/second-order-iterated-value';
import { linearOdeValueAtTime } from './DY03/linear-ode-value-at-time';
import { odeGapClosingTime } from './DY03/ode-gap-closing-time';
import { solowSteadyStateCapital } from './DY03/solow-steady-state-capital';
import { dampedCyclePeriod } from './DY04/damped-cycle-period';
import { secondOrderOdeValueAtTime } from './DY04/second-order-ode-value-at-time';
import { secondOrderSteadyOrRoot } from './DY04/second-order-steady-or-root';
import { saddlePathInitialJump } from './DY05/saddle-path-initial-jump';
import { stabilityThresholdTraceDeterminant } from './DY05/stability-threshold-trace-determinant';
import { twoMarketSteadyStatePrice } from './DY05/two-market-steady-state-price';
import { harvestMapSlopeAtSteadyState } from './DY06/harvest-map-slope-at-steady-state';
import { juryMargin2x2Discrete } from './DY06/jury-margin-2x2-discrete';
import { solowConvergenceHalfLife } from './DY06/solow-convergence-half-life';
import { adjustedRSquared } from './EM01/adjusted-r-squared';
import { olsCoefficientTwoRegressors } from './EM01/ols-coefficient-two-regressors';
import { xtxEntryFromData } from './EM01/xtx-entry-from-data';
import { olsErrorVarianceEstimate } from './EM02/ols-error-variance-estimate';
import { olsSlopeStandardError } from './EM02/ols-slope-standard-error';
import { omittedVariableBiasSlope } from './EM02/omitted-variable-bias-slope';
import { coefficientTStatistic } from './EM03/coefficient-t-statistic';
import { fStatisticRestrictedSsr } from './EM03/f-statistic-restricted-ssr';
import { tStatisticFromXtxInverse } from './EM03/t-statistic-from-xtx-inverse';
import { breuschPaganLmStatistic } from './EM04/breusch-pagan-lm-statistic';
import { durbinWatsonStatistic } from './EM04/durbin-watson-statistic';
import { robustSeSimpleRegression } from './EM04/robust-se-simple-regression';
import { mleExponentialOrNormalVariance } from './EM05/mle-exponential-or-normal-variance';
import { mleLikelihoodRatioProportion } from './EM05/mle-likelihood-ratio-proportion';
import { mlePoissonOrBernoulli } from './EM05/mle-poisson-or-bernoulli';
import { ar1ForecastHSteps } from './EM06/ar1-forecast-h-steps';
import { ar1MeanOrVariance } from './EM06/ar1-mean-or-variance';
import { ma1Lag1Autocorrelation } from './EM06/ma1-lag1-autocorrelation';
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
import { leasePaymentResidual } from './FM05/lease-payment-residual';
import { loanLevelPayment } from './FM05/loan-level-payment';
import { loanScheduleRow } from './FM05/loan-schedule-row';
import { mutuallyExclusiveBestNpv } from './FM06/mutually-exclusive-best-npv';
import { projectNpvYearlyFlows } from './FM06/project-npv-yearly-flows';
import { twoPeriodIrr } from './FM06/two-period-irr';
import { bondPriceAnnualCoupon } from './FM07/bond-price-annual-coupon';
import { bondPriceFallRateRise } from './FM07/bond-price-fall-rate-rise';
import { zeroCouponBondYield } from './FM07/zero-coupon-bond-yield';
import { bimatrixNashPayoff } from './GT01/bimatrix-nash-payoff';
import { cournotDuopolyEquilibrium } from './GT01/cournot-duopoly-equilibrium';
import { pureNashCount } from './GT01/pure-nash-count';
import { auditProbabilityIndifference } from './GT02/audit-probability-indifference';
import { mixedEquilibriumExpectedPayoff } from './GT02/mixed-equilibrium-expected-payoff';
import { mixedEquilibriumProbability } from './GT02/mixed-equilibrium-probability';
import { alternatingOfferFirstOffer } from './GT03/alternating-offer-first-offer';
import { entryCommitmentThreshold } from './GT03/entry-commitment-threshold';
import { entryGameSpePayoff } from './GT03/entry-game-spe-payoff';
import { stackelbergDuopolyOutcome } from './GT03/stackelberg-duopoly-outcome';
import { zeroSumLpOptimalValue } from './GT05/zero-sum-lp-optimal-value';
import { zeroSumMixed2x2Value } from './GT05/zero-sum-mixed-2x2-value';
import { zeroSumSaddlePointValue } from './GT05/zero-sum-saddle-point-value';
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
import { leontiefTotalOutputChange } from './LA106/leontief-total-output-change';
import { leontiefTwoSectorOutput } from './LA106/leontief-two-sector-output';
import { technicalCoefficientFromFlows } from './LA106/technical-coefficient-from-flows';
import { dependenceParameterK } from './LA201/dependence-parameter-k';
import { matrixRankElimination } from './LA201/matrix-rank-elimination';
import { replicatePayoffCoordinates } from './LA201/replicate-payoff-coordinates';
import { eigenvalueLarger2x2 } from './LA202/eigenvalue-larger-2x2';
import { eigenvectorSecondComponent } from './LA202/eigenvector-second-component';
import { spectralRadiusStability } from './LA202/spectral-radius-stability';
import { diagonalisationPowerEntry } from './LA203/diagonalisation-power-entry';
import { eigenDecoupledSystemState } from './LA203/eigen-decoupled-system-state';
import { migrationShareAfterYears } from './LA203/migration-share-after-years';
import { hessianThirdLeadingMinor } from './LA204/hessian-third-leading-minor';
import { portfolioVarianceThreeAssets } from './LA204/portfolio-variance-three-assets';
import { quadraticFormSecondMinor } from './LA204/quadratic-form-second-minor';
import { levelCurveThroughPoint } from './MV01/level-curve-through-point';
import { sameIndifferenceCurveQuantity } from './MV01/same-indifference-curve-quantity';
import { cobbDouglasMarginalProduct } from './MV02/cobb-douglas-marginal-product';
import { directionalDerivativeUtility } from './MV02/directional-derivative-utility';
import { jointCostPartialMarginalCost } from './MV02/joint-cost-partial-marginal-cost';
import { chainRuleTwoOutputCost } from './MV03/chain-rule-two-output-cost';
import { cobbDouglasOutputGrowthRate } from './MV03/cobb-douglas-output-growth-rate';
import { totalDifferentialOutputChange } from './MV03/total-differential-output-change';
import { constantReturnsWageBill } from './MV04/constant-returns-wage-bill';
import { eulerMarginalProductLabour } from './MV04/euler-marginal-product-labour';
import { scaledInputsOutput } from './MV04/scaled-inputs-output';
import { equilibriumPriceIncomeResponse } from './MV05/equilibrium-price-income-response';
import { islmComparativeStaticsCramer } from './MV05/islm-comparative-statics-cramer';
import { levelCurveSlopeIft } from './MV05/level-curve-slope-ift';
import { cobbDouglasHessianDeterminant } from './MV06/cobb-douglas-hessian-determinant';
import { mixedBundleUtility } from './MV06/mixed-bundle-utility';
import { quadraticConcavityDeterminant } from './MV06/quadratic-concavity-determinant';
import { hessianDeterminantTwoGoods } from './MV07/hessian-determinant-two-goods';
import { priceDiscriminationTwoMarkets } from './MV07/price-discrimination-two-markets';
import { twoProductOptimalOutput } from './MV07/two-product-optimal-output';
import { lagrangeBudgetGoodQuantity } from './MV08/lagrange-budget-good-quantity';
import { lagrangeCostMinInput } from './MV08/lagrange-cost-min-input';
import { lagrangeMultiplierUtility } from './MV08/lagrange-multiplier-utility';
import { shadowPriceIncomeEstimate } from './MV09/shadow-price-income-estimate';
import { shadowPriceMarginalCost } from './MV09/shadow-price-marginal-cost';
import { shadowPriceWater } from './MV09/shadow-price-water';
import { complementsPriceElasticity } from './MV10/complements-price-elasticity';
import { perfectComplementsDemand } from './MV10/perfect-complements-demand';
import { slutskySubstitutionIncomeEffect } from './MV10/slutsky-substitution-income-effect';
import { cobbDouglasConditionalLabour } from './MV11/cobb-douglas-conditional-labour';
import { cobbDouglasMinimumCost } from './MV11/cobb-douglas-minimum-cost';
import { costFunctionOutputScaling } from './MV11/cost-function-output-scaling';
import { hotellingProfitPriceSlope } from './MV12/hotelling-profit-price-slope';
import { roysIdentityDemand } from './MV12/roys-identity-demand';
import { shephardLabourDemand } from './MV12/shephard-labour-demand';
import { jointDensityRectangleProbability } from './MV13/joint-density-rectangle-probability';
import { rectangleLinearDensityTotal } from './MV13/rectangle-linear-density-total';
import { triangleRegionTotal } from './MV13/triangle-region-total';
import { bisectionStepsForTolerance } from './NM01/bisection-steps-for-tolerance';
import { newtonEquilibriumPriceIterates } from './NM01/newton-equilibrium-price-iterates';
import { newtonIrrStep } from './NM01/newton-irr-step';
import { gradientAscentStepTwoInputs } from './NM02/gradient-ascent-step-two-inputs';
import { gradientDescentLargestStableStep } from './NM02/gradient-descent-largest-stable-step';
import { newtonStepProfitCubicCost } from './NM02/newton-step-profit-cubic-cost';
import { inverseTransformExponentialDraw } from './NM03/inverse-transform-exponential-draw';
import { monteCarloDrawsForTargetSe } from './NM03/monte-carlo-draws-for-target-se';
import { monteCarloProbabilityLimit } from './NM03/monte-carlo-probability-limit';
import { capacityMultiplierTwoProducts } from './OP01/capacity-multiplier-two-products';
import { quasilinearDemandCorner } from './OP01/quasilinear-demand-corner';
import { rationingQuotaOtherGood } from './OP01/rationing-quota-other-good';
import { lpMaxProfitTwoProducts } from './OP02/lp-max-profit-two-products';
import { lpMinCostFeedBlend } from './OP02/lp-min-cost-feed-blend';
import { lpUnusedHoursAtOptimum } from './OP02/lp-unused-hours-at-optimum';
import { lpDualPriceThreeMachines } from './OP03/lp-dual-price-three-machines';
import { lpDualProfitChange } from './OP03/lp-dual-profit-change';
import { lpDualShadowPrice } from './OP03/lp-dual-shadow-price';
import { comparativeStaticsOneChoice } from './OP04/comparative-statics-one-choice';
import { monopolyTaxPriceChange } from './OP04/monopoly-tax-price-change';
import { slutskyEquationCobbDouglas } from './OP04/slutsky-equation-cobb-douglas';
import { transportNorthWestCost } from './OP05/transport-north-west-cost';
import { transportReducedCostEmptyCell } from './OP05/transport-reduced-cost-empty-cell';
import { transportTwoSourceMinimumCost } from './OP05/transport-two-source-minimum-cost';
import { parametricLpOptimalValue } from './OP06/parametric-lp-optimal-value';
import { profitCostRatioBestCorner } from './OP06/profit-cost-ratio-best-corner';
import { projectSelectionBestNpv } from './OP06/project-selection-best-npv';
import { cpmCrashNewDuration } from './OP07/cpm-crash-new-duration';
import { cpmProjectDuration } from './OP07/cpm-project-duration';
import { cpmTotalFloat } from './OP07/cpm-total-float';
import { markovLongRunShareThreeState } from './SP01/markov-long-run-share-three-state';
import { markovLongRunShareTwoState } from './SP01/markov-long-run-share-two-state';
import { markovShareAfterSteps } from './SP01/markov-share-after-steps';
import { arrowPrattRiskPremium } from './SP02/arrow-pratt-risk-premium';
import { insuranceMaximumPremium } from './SP02/insurance-maximum-premium';
import { lotteryCertaintyEquivalent } from './SP02/lottery-certainty-equivalent';
import { brownianDriftLevelProbability } from './SP03/brownian-drift-level-probability';
import { randomWalkLevelProbability } from './SP03/random-walk-level-probability';
import { squareRootTimeRisk } from './SP03/square-root-time-risk';
import { binomialTreeCallOnePeriod } from './SP04/binomial-tree-call-one-period';
import { binomialTreePutTwoPeriod } from './SP04/binomial-tree-put-two-period';
import { binomialTreeReplicatingLoan } from './SP04/binomial-tree-replicating-loan';
import { littlesLawQueue } from './SP05/littles-law-queue';
import { mm1AtLeastNProbability } from './SP05/mm1-at-least-n-probability';
import { mm1QueueMeasures } from './SP05/mm1-queue-measures';
import { mm2StaffingCost } from './SP05/mm2-staffing-cost';
import { groupedFrequencyMean } from './ST101/grouped-frequency-mean';
import { meanOrMedianSmallData } from './ST101/mean-or-median-small-data';
import { sampleStandardDeviation } from './ST101/sample-standard-deviation';
import { bayesDefaultGivenSignal } from './ST102/bayes-default-given-signal';
import { meetingWindowProbability } from './ST102/meeting-window-probability';
import { sampleDefectivesProbability } from './ST102/sample-defectives-probability';
import { expectedValueDiscrete } from './ST103/expected-value-discrete';
import { profitVarianceLinearTransform } from './ST103/profit-variance-linear-transform';
import { varianceDiscreteRisk } from './ST103/variance-discrete-risk';
import { binomialCountProbability } from './ST104/binomial-count-probability';
import { poissonApproximationDefaults } from './ST104/poisson-approximation-defaults';
import { poissonArrivalsProbability } from './ST104/poisson-arrivals-probability';
import { normalPercentileValue } from './ST105/normal-percentile-value';
import { normalRangeProbability } from './ST105/normal-range-probability';
import { sumOfIndependentNormals } from './ST105/sum-of-independent-normals';
import { laspeyresPriceIndex } from './ST106/laspeyres-price-index';
import { realWageChange } from './ST106/real-wage-change';
import { realWageDeflated } from './ST106/real-wage-deflated';
import { annualisedGrowthFromLevels } from './ST107/annualised-growth-from-levels';
import { averageGrowthFromChainIndices } from './ST107/average-growth-from-chain-indices';
import { baseIndexFromChainRates } from './ST107/base-index-from-chain-rates';
import { jointTableConditionalProbability } from './ST201/joint-table-conditional-probability';
import { jointTableCovariance } from './ST201/joint-table-covariance';
import { twoAssetPortfolioRisk } from './ST201/two-asset-portfolio-risk';
import { sampleMeanTailProbability } from './ST202/sample-mean-tail-probability';
import { sampleProportionProbability } from './ST202/sample-proportion-probability';
import { sampleSizeForPrecision } from './ST202/sample-size-for-precision';
import { ciMeanKnownSigmaLimit } from './ST203/ci-mean-known-sigma-limit';
import { ciMeanTSmallSample } from './ST203/ci-mean-t-small-sample';
import { ciProportionLimit } from './ST203/ci-proportion-limit';
import { hypothesisTestStatistic } from './ST204/hypothesis-test-statistic';
import { zTestPValue } from './ST204/z-test-p-value';
import { zTestPower } from './ST204/z-test-power';
import { olsSlopeFromData } from './ST205/ols-slope-from-data';
import { regressionLineFromSums } from './ST205/regression-line-from-sums';
import { regressionSlopeTStatistic } from './ST205/regression-slope-t-statistic';
import { chebyshevIntervalBound } from './ST206/chebyshev-interval-bound';
import { chebyshevSampleSize } from './ST206/chebyshev-sample-size';
import { sampleMeanChebyshevBound } from './ST206/sample-mean-chebyshev-bound';

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
  loanLevelPayment,
  loanScheduleRow,
  leasePaymentResidual,
  projectNpvYearlyFlows,
  twoPeriodIrr,
  mutuallyExclusiveBestNpv,
  zeroCouponBondYield,
  bondPriceAnnualCoupon,
  bondPriceFallRateRise,
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
  continuousStreamPresentValue,
  growingContinuousStreamValue,
  improperPowerIntegral,
  infiniteGeometricSeriesSum,
  maclaurinPartialSumEstimate,
  powerSeriesRadius,
  volumeOfRevolutionDisc,
  lineIntegralWorkSegment,
  arcLengthThreeHalvesPower,
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
  technicalCoefficientFromFlows,
  leontiefTwoSectorOutput,
  leontiefTotalOutputChange,
  meanOrMedianSmallData,
  groupedFrequencyMean,
  sampleStandardDeviation,
  sampleDefectivesProbability,
  bayesDefaultGivenSignal,
  meetingWindowProbability,
  expectedValueDiscrete,
  varianceDiscreteRisk,
  profitVarianceLinearTransform,
  binomialCountProbability,
  poissonArrivalsProbability,
  poissonApproximationDefaults,
  normalRangeProbability,
  normalPercentileValue,
  sumOfIndependentNormals,
  realWageDeflated,
  laspeyresPriceIndex,
  realWageChange,
  baseIndexFromChainRates,
  annualisedGrowthFromLevels,
  averageGrowthFromChainIndices,
  levelCurveThroughPoint,
  sameIndifferenceCurveQuantity,
  cobbDouglasMarginalProduct,
  jointCostPartialMarginalCost,
  directionalDerivativeUtility,
  totalDifferentialOutputChange,
  cobbDouglasOutputGrowthRate,
  chainRuleTwoOutputCost,
  scaledInputsOutput,
  constantReturnsWageBill,
  eulerMarginalProductLabour,
  levelCurveSlopeIft,
  equilibriumPriceIncomeResponse,
  islmComparativeStaticsCramer,
  quadraticConcavityDeterminant,
  mixedBundleUtility,
  cobbDouglasHessianDeterminant,
  hessianDeterminantTwoGoods,
  twoProductOptimalOutput,
  priceDiscriminationTwoMarkets,
  lagrangeBudgetGoodQuantity,
  lagrangeCostMinInput,
  lagrangeMultiplierUtility,
  shadowPriceIncomeEstimate,
  shadowPriceMarginalCost,
  shadowPriceWater,
  perfectComplementsDemand,
  slutskySubstitutionIncomeEffect,
  complementsPriceElasticity,
  costFunctionOutputScaling,
  cobbDouglasConditionalLabour,
  cobbDouglasMinimumCost,
  hotellingProfitPriceSlope,
  shephardLabourDemand,
  roysIdentityDemand,
  rectangleLinearDensityTotal,
  jointDensityRectangleProbability,
  triangleRegionTotal,
  replicatePayoffCoordinates,
  matrixRankElimination,
  dependenceParameterK,
  eigenvalueLarger2x2,
  eigenvectorSecondComponent,
  spectralRadiusStability,
  diagonalisationPowerEntry,
  eigenDecoupledSystemState,
  migrationShareAfterYears,
  quadraticFormSecondMinor,
  hessianThirdLeadingMinor,
  portfolioVarianceThreeAssets,
  jointTableConditionalProbability,
  jointTableCovariance,
  twoAssetPortfolioRisk,
  sampleMeanTailProbability,
  sampleProportionProbability,
  sampleSizeForPrecision,
  ciMeanKnownSigmaLimit,
  ciProportionLimit,
  ciMeanTSmallSample,
  hypothesisTestStatistic,
  zTestPValue,
  zTestPower,
  regressionLineFromSums,
  olsSlopeFromData,
  regressionSlopeTStatistic,
  chebyshevIntervalBound,
  sampleMeanChebyshevBound,
  chebyshevSampleSize,
  quasilinearDemandCorner,
  rationingQuotaOtherGood,
  capacityMultiplierTwoProducts,
  lpMaxProfitTwoProducts,
  lpUnusedHoursAtOptimum,
  lpMinCostFeedBlend,
  lpDualShadowPrice,
  lpDualProfitChange,
  lpDualPriceThreeMachines,
  comparativeStaticsOneChoice,
  monopolyTaxPriceChange,
  slutskyEquationCobbDouglas,
  transportNorthWestCost,
  transportTwoSourceMinimumCost,
  transportReducedCostEmptyCell,
  profitCostRatioBestCorner,
  projectSelectionBestNpv,
  parametricLpOptimalValue,
  cpmProjectDuration,
  cpmTotalFloat,
  cpmCrashNewDuration,
  differenceEquationValueAfterT,
  debtRatioSteadyState,
  cobwebPriceAfterPeriods,
  secondOrderIteratedValue,
  characteristicEquationLargerRoot,
  multiplierAcceleratorIncome,
  linearOdeValueAtTime,
  odeGapClosingTime,
  solowSteadyStateCapital,
  secondOrderSteadyOrRoot,
  secondOrderOdeValueAtTime,
  dampedCyclePeriod,
  twoMarketSteadyStatePrice,
  stabilityThresholdTraceDeterminant,
  saddlePathInitialJump,
  harvestMapSlopeAtSteadyState,
  juryMargin2x2Discrete,
  solowConvergenceHalfLife,
  xtxEntryFromData,
  olsCoefficientTwoRegressors,
  adjustedRSquared,
  olsErrorVarianceEstimate,
  olsSlopeStandardError,
  omittedVariableBiasSlope,
  coefficientTStatistic,
  fStatisticRestrictedSsr,
  tStatisticFromXtxInverse,
  breuschPaganLmStatistic,
  durbinWatsonStatistic,
  robustSeSimpleRegression,
  mlePoissonOrBernoulli,
  mleExponentialOrNormalVariance,
  mleLikelihoodRatioProportion,
  ar1MeanOrVariance,
  ma1Lag1Autocorrelation,
  ar1ForecastHSteps,
  bimatrixNashPayoff,
  pureNashCount,
  cournotDuopolyEquilibrium,
  auditProbabilityIndifference,
  mixedEquilibriumProbability,
  mixedEquilibriumExpectedPayoff,
  entryGameSpePayoff,
  entryCommitmentThreshold,
  stackelbergDuopolyOutcome,
  alternatingOfferFirstOffer,
  zeroSumSaddlePointValue,
  zeroSumMixed2x2Value,
  zeroSumLpOptimalValue,
  truthTableTrueRows,
  inductionSumClosedForm,
  compoundOvertakesLinearYear,
  epsilonNThreshold,
  sequenceSupremum,
  recursiveRootSequenceLimit,
  epsilonDeltaLinear,
  capacityProfitMaximum,
  bisectionEquilibriumMidpoint,
  budgetLineDistance,
  compactBudgetMaxUtility,
  budgetSetLargestBall,
  linearContractionFixedPoint,
  banachIterationsNeeded,
  cournotBestResponseFixedPoint,
  variationsStraightLinePath,
  variationsAdjustmentPathValue,
  variationsAdjustmentSaving,
  hotellingRentAtTime,
  keynesRamseyConsumptionGrowth,
  cakeEatingConsumptionAtTime,
  dpStagedRouteLeastCost,
  dpBudgetAllocationBestReturn,
  dpCakeEatingFirstConsumption,
  ramseyModifiedGoldenRuleCapital,
  ramseySteadyStateConsumption,
  ramseyConsumptionGrowthAtCapital,
  markovShareAfterSteps,
  markovLongRunShareTwoState,
  markovLongRunShareThreeState,
  lotteryCertaintyEquivalent,
  insuranceMaximumPremium,
  arrowPrattRiskPremium,
  squareRootTimeRisk,
  randomWalkLevelProbability,
  brownianDriftLevelProbability,
  binomialTreeCallOnePeriod,
  binomialTreeReplicatingLoan,
  binomialTreePutTwoPeriod,
  littlesLawQueue,
  mm1QueueMeasures,
  mm1AtLeastNProbability,
  mm2StaffingCost,
  bisectionStepsForTolerance,
  newtonEquilibriumPriceIterates,
  newtonIrrStep,
  gradientAscentStepTwoInputs,
  newtonStepProfitCubicCost,
  gradientDescentLargestStableStep,
  monteCarloDrawsForTargetSe,
  inverseTransformExponentialDraw,
  monteCarloProbabilityLimit,
] as unknown as readonly Generator[];

const byId = new Map(GENERATORS.map((g) => [g.id, g]));

export function generatorById(id: string): Generator | undefined {
  return byId.get(id);
}
