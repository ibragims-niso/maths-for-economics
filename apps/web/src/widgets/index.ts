import type { ComponentType } from 'react';
import { AnnuityExplorer } from './AnnuityExplorer';
import { BreakEvenLines } from './BreakEvenLines';
import { BudgetVectors } from './BudgetVectors';
import { ChainRuleCostTime } from './ChainRuleCostTime';
import { CompoundingFrequency } from './CompoundingFrequency';
import { DeterminantArea } from './DeterminantArea';
import { DiscountingExplorer } from './DiscountingExplorer';
import { DoublingTime } from './DoublingTime';
import { ElasticitySlider } from './ElasticitySlider';
import { EquilibriumTax } from './EquilibriumTax';
import { FixedCostBreakEven } from './FixedCostBreakEven';
import { GrowthRateExplorer } from './GrowthRateExplorer';
import { IndifferenceCurveMrs } from './IndifferenceCurveMrs';
import { IndifferenceMap } from './IndifferenceMap';
import { InverseDemandMirror } from './InverseDemandMirror';
import { KeynesianCross } from './KeynesianCross';
import { MarginalCostTangent } from './MarginalCostTangent';
import { MarginalRevenueLines } from './MarginalRevenueLines';
import { PowerExplorer } from './PowerExplorer';
import { ProductionConcavity } from './ProductionConcavity';
import { ProfitHillTangent } from './ProfitHillTangent';
import { RevenueProfit } from './RevenueProfit';
import { SecantToTangent } from './SecantToTangent';
import { ShopRevenueMatrix } from './ShopRevenueMatrix';
import { SimpleVsCompound } from './SimpleVsCompound';
import { SpanAndBasis } from './SpanAndBasis';
import { SpendingRounds } from './SpendingRounds';
import { SurveyVenn } from './SurveyVenn';
import { TariffContinuity } from './TariffContinuity';
import { TaxBandExplorer } from './TaxBandExplorer';
import { TwoLineSystem } from './TwoLineSystem';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'annuity-explorer': AnnuityExplorer,
  'break-even-lines': BreakEvenLines,
  'budget-vectors': BudgetVectors,
  'chain-rule-cost-time': ChainRuleCostTime,
  'compounding-frequency': CompoundingFrequency,
  'determinant-area': DeterminantArea,
  'discounting-explorer': DiscountingExplorer,
  'doubling-time': DoublingTime,
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
  'fixed-cost-break-even': FixedCostBreakEven,
  'growth-rate-explorer': GrowthRateExplorer,
  'indifference-curve-mrs': IndifferenceCurveMrs,
  'indifference-map': IndifferenceMap,
  'inverse-demand-mirror': InverseDemandMirror,
  'keynesian-cross': KeynesianCross,
  'marginal-cost-tangent': MarginalCostTangent,
  'marginal-revenue-lines': MarginalRevenueLines,
  'power-explorer': PowerExplorer,
  'production-concavity': ProductionConcavity,
  'profit-hill-tangent': ProfitHillTangent,
  'revenue-profit': RevenueProfit,
  'secant-to-tangent': SecantToTangent,
  'shop-revenue-matrix': ShopRevenueMatrix,
  'simple-vs-compound': SimpleVsCompound,
  'span-and-basis': SpanAndBasis,
  'spending-rounds': SpendingRounds,
  'survey-venn': SurveyVenn,
  'tariff-continuity': TariffContinuity,
  'tax-band-explorer': TaxBandExplorer,
  'two-line-system': TwoLineSystem,
};
