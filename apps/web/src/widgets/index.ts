import type { ComponentType } from 'react';
import { AnnuityExplorer } from './AnnuityExplorer';
import { ElasticitySlider } from './ElasticitySlider';
import { EquilibriumTax } from './EquilibriumTax';
import { PowerExplorer } from './PowerExplorer';
import { SurveyVenn } from './SurveyVenn';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'annuity-explorer': AnnuityExplorer,
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
  'power-explorer': PowerExplorer,
  'survey-venn': SurveyVenn,
};
