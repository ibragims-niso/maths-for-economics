import type { ComponentType } from 'react';
import { ElasticitySlider } from './ElasticitySlider';
import { EquilibriumTax } from './EquilibriumTax';
import { PowerExplorer } from './PowerExplorer';

/** Interactive widgets by the IDs topic files use in ::widget{id="..."}. */
export const WIDGETS: Record<string, ComponentType> = {
  'elasticity-slider': ElasticitySlider,
  'equilibrium-tax': EquilibriumTax,
  'power-explorer': PowerExplorer,
};
