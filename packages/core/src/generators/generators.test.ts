import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { checkProblem, makeProblem } from '../engine/problem';
import type { Generator } from '../engine/types';
import { elasticityLinearPoint } from './C107/elasticity-linear-point';
import { elasticityUnitElasticPrice } from './C107/elasticity-unit-elastic-price';
import { minAverageCost } from './C109/min-average-cost';
import { profitMaxLinearDemand } from './C109/profit-max-linear-demand';
import { linearBreakEven } from './F04/linear-break-even';
import { linearDemandTwoPoints } from './F04/linear-demand-two-points';
import { equilibriumPrice } from './F05/equilibrium-price';
import { equilibriumTaxPrice } from './F05/equilibrium-tax-price';
import { compoundInterestAmount } from './FM01/compound-interest-amount';
import { simpleInterestAmount } from './FM01/simple-interest-amount';
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
        expect(Math.abs(answer.value - (-params.b * params.price) / q)).toBeLessThanOrEqual(
          0.005 + 1e-9,
        );
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

// Independent checks for the Phase 1 topics: each answer is re-derived from first principles.
const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value };
};

describe('Phase 1 generators, re-derived', () => {
  it('break-even: revenue equals cost at the answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(linearBreakEven, seed);
        expect(p.price * value).toBeCloseTo(p.fixedCost + p.unitCost * value, 9);
        expect(Number.isInteger(value) && value > 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('two-point demand: the line passes through both observations', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(linearDemandTwoPoints, seed);
        const slope = -p.b;
        const q1 = p.a - p.b * p.p1;
        expect(value).toBe(q1 + slope * (p.p3 - p.p1));
        expect(value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('equilibrium: demand equals supply at the answer, quantity positive', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(equilibriumPrice, seed);
        expect(p.a - p.b * value).toBe(p.c + p.d * value);
        expect(p.a - p.b * value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('tax: market clears at the buyers’ price, with sellers receiving it minus the tax', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(equilibriumTaxPrice, seed);
        expect(p.a - p.b * value).toBeCloseTo(p.c + p.d * (value - p.tax), 9);
        expect(p.a - p.b * value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('simple interest: A − P equals P·r·t', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(simpleInterestAmount, seed);
        expect(value - p.principal).toBeCloseTo((p.principal * p.rate * p.years) / 100, 6);
      }),
      RUNS,
    );
  });

  it('compound interest: matches repeated multiplication period by period', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(compoundInterestAmount, seed);
        let balance = p.principal;
        for (let i = 0; i < p.m * p.years; i++) balance += balance * (p.rate / 100 / p.m);
        expect(Math.abs(value - balance)).toBeLessThanOrEqual(0.005 + 1e-6);
      }),
      RUNS,
    );
  });

  it('profit maximum: profit at the answer beats the neighbours', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(profitMaxLinearDemand, seed);
        const profit = (q: number) => (p.alpha - p.beta * q) * q - p.fixedCost - p.unitCost * q;
        expect(profit(value)).toBeGreaterThan(profit(value - 1));
        expect(profit(value)).toBeGreaterThan(profit(value + 1));
      }),
      RUNS,
    );
  });

  it('average cost minimum: AC at the answer beats the neighbours', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(minAverageCost, seed);
        const ac = (q: number) => p.fixedCost / q + p.unitCost + p.k * q;
        expect(ac(value)).toBeLessThan(ac(value - 0.5));
        expect(ac(value)).toBeLessThan(ac(value + 0.5));
      }),
      RUNS,
    );
  });
});
