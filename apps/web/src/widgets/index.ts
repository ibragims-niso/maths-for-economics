import type { ComponentType } from 'react';
import { AnnuityExplorer } from './AnnuityExplorer';
import { BreakEvenLines } from './BreakEvenLines';
import { CompoundingFrequency } from './CompoundingFrequency';
import { DiscountingExplorer } from './DiscountingExplorer';
import { DoublingTime } from './DoublingTime';
import { ElasticitySlider } from './ElasticitySlider';
import { EquilibriumTax } from './EquilibriumTax';
import { FixedCostBreakEven } from './FixedCostBreakEven';
import { KeynesianCross } from './KeynesianCross';
import { PowerExplorer } from './PowerExplorer';
import { RevenueProfit } from './RevenueProfit';
import { SurveyVenn } from './SurveyVenn';
import { TaxBandExplorer } from './TaxBandExplorer';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'annuity-explorer': AnnuityExplorer,
  'break-even-lines': BreakEvenLines,
  'compounding-frequency': CompoundingFrequency,
  'discounting-explorer': DiscountingExplorer,
  'doubling-time': DoublingTime,
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
  'fixed-cost-break-even': FixedCostBreakEven,
  'keynesian-cross': KeynesianCross,
  'power-explorer': PowerExplorer,
  'revenue-profit': RevenueProfit,
  'survey-venn': SurveyVenn,
  'tax-band-explorer': TaxBandExplorer,
};
