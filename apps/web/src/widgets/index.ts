import type { ComponentType } from 'react';
import { AnnuityExplorer } from './AnnuityExplorer';
import { CompoundingFrequency } from './CompoundingFrequency';
import { DiscountingExplorer } from './DiscountingExplorer';
import { ElasticitySlider } from './ElasticitySlider';
import { EquilibriumTax } from './EquilibriumTax';
import { KeynesianCross } from './KeynesianCross';
import { PowerExplorer } from './PowerExplorer';
import { SurveyVenn } from './SurveyVenn';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'annuity-explorer': AnnuityExplorer,
  'compounding-frequency': CompoundingFrequency,
  'discounting-explorer': DiscountingExplorer,
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
  'keynesian-cross': KeynesianCross,
  'power-explorer': PowerExplorer,
  'survey-venn': SurveyVenn,
};
