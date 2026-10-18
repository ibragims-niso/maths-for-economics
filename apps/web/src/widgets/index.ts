import type { ComponentType } from 'react';
import { AnnuityExplorer } from './AnnuityExplorer';
import { BreakEvenLines } from './BreakEvenLines';
import { BudgetVectors } from './BudgetVectors';
import { CompoundingFrequency } from './CompoundingFrequency';
import { DiscountingExplorer } from './DiscountingExplorer';
import { DoublingTime } from './DoublingTime';
import { ElasticitySlider } from './ElasticitySlider';
import { EquilibriumTax } from './EquilibriumTax';
import { FixedCostBreakEven } from './FixedCostBreakEven';
import { InverseDemandMirror } from './InverseDemandMirror';
import { KeynesianCross } from './KeynesianCross';
import { PowerExplorer } from './PowerExplorer';
import { ProfitHillTangent } from './ProfitHillTangent';
import { RevenueProfit } from './RevenueProfit';
import { SimpleVsCompound } from './SimpleVsCompound';
import { SpendingRounds } from './SpendingRounds';
import { SurveyVenn } from './SurveyVenn';
import { TaxBandExplorer } from './TaxBandExplorer';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'annuity-explorer': AnnuityExplorer,
  'break-even-lines': BreakEvenLines,
  'budget-vectors': BudgetVectors,
  'compounding-frequency': CompoundingFrequency,
  'discounting-explorer': DiscountingExplorer,
  'doubling-time': DoublingTime,
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
  'fixed-cost-break-even': FixedCostBreakEven,
  'inverse-demand-mirror': InverseDemandMirror,
  'keynesian-cross': KeynesianCross,
  'power-explorer': PowerExplorer,
  'profit-hill-tangent': ProfitHillTangent,
  'revenue-profit': RevenueProfit,
  'simple-vs-compound': SimpleVsCompound,
  'spending-rounds': SpendingRounds,
  'survey-venn': SurveyVenn,
  'tax-band-explorer': TaxBandExplorer,
};
