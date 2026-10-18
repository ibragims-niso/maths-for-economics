import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkProblem, makeProblem } from '../engine/problem';
import { elasticityLinearPoint } from './C107/elasticity-linear-point';
import { elasticityUnitElasticPrice } from './C107/elasticity-unit-elastic-price';
import { GENERATORS } from './index';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

// The shared properties (docs/04), for every generator, over 1,000 random seeds each.
describe.each(GENERATORS.map((g) => [g.id, g] as const))('%s', (_id, generator) => {
  it('produces sound problems for 1,000 seeds', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        expect(checkProblem(generator, seed)).toEqual([]);
      }),
      RUNS,
    );
  });
});

// Maths checked independently of the generator's own steps.
describe('elasticity-linear-point', () => {
  it('gives ε = −bP/(a − bP) with a positive quantity', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params, answer } = makeProblem(elasticityLinearPoint, seed);
        const q = params.a - params.b * params.price;
        expect(q).toBeGreaterThan(0);
        expect(params.price).toBeGreaterThan(0);
        if (answer.kind !== 'numeric') throw new Error('numeric expected');
        expect(Math.abs(answer.value - (-params.b * params.price) / q)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(answer.value).toBeLessThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces the worked example in C107 (Q = 100 − 2P at P = 20)', () => {
    const p = { a: 100, b: 2, price: 20 };
    expect(elasticityLinearPoint.answer(p)).toEqual({ kind: 'numeric', value: -0.67, decimals: 2 });
  });
});

describe('elasticity-unit-elastic-price', () => {
  it('returns the price where ε = −1 and revenue P·Q peaks', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params, answer } = makeProblem(elasticityUnitElasticPrice, seed);
        if (answer.kind !== 'numeric') throw new Error('numeric expected');
        const P = answer.value;
        const q = params.a - params.b * P;
        expect((-params.b * P) / q).toBeCloseTo(-1, 12);
        const revenue = (x: number) => x * (params.a - params.b * x);
        expect(revenue(P)).toBeGreaterThan(revenue(P - 0.5));
        expect(revenue(P)).toBeGreaterThan(revenue(P + 0.5));
      }),
      RUNS,
    );
  });
});
