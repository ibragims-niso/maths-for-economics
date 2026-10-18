import type { Generator } from '../engine/types';
import { elasticityLinearPoint } from './C107/elasticity-linear-point';
import { elasticityUnitElasticPrice } from './C107/elasticity-unit-elastic-price';

/** Every problem generator in the app. Topic files list their generators by these IDs. */
export const GENERATORS: readonly Generator[] = [
  elasticityLinearPoint as Generator,
  elasticityUnitElasticPrice as Generator,
];

const byId = new Map(GENERATORS.map((g) => [g.id, g]));

export function generatorById(id: string): Generator | undefined {
  return byId.get(id);
}
