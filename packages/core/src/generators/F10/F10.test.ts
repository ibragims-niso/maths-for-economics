import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { compositeCostOfLabour } from './composite-cost-of-labour';
import { inverseDemandPrice } from './inverse-demand-price';
import { labourForCostBudget } from './labour-for-cost-budget';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('inverse-demand-price', () => {
  it('finds the price by bisection on Q(P) = Q₀ and sells exactly Q₀ there', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(inverseDemandPrice, seed);
        const demand = (price: number) => p.a - p.b * price;
        // Demand falls as the price rises: bisection between a price of 0 and the choke price.
        let lo = 0;
        let hi = p.a / p.b;
        for (let i = 0; i < 200; i++) {
          const mid = (lo + hi) / 2;
          if (demand(mid) > p.quantity) lo = mid;
          else hi = mid;
        }
        expect(Math.abs(value - (lo + hi) / 2)).toBeLessThan(1e-6);
        expect(demand(value)).toBeCloseTo(p.quantity, 9);
        expect(value).toBeGreaterThan(0);
        expect(p.quantity).toBeGreaterThan(0);
        expect(Number.isInteger(p.a)).toBe(true);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in F10 (Q = 120 − 4P, 80 units sold)', () => {
    const answer = inverseDemandPrice.answer({ a: 120, b: 4, quantity: 80 });
    expect(answer.kind === 'numeric' && answer.value).toBe(10);
  });
});

describe('composite-cost-of-labour', () => {
  it('matches hiring workers one by one and costing the output', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(compositeCostOfLabour, seed);
        let output = 0;
        if (p.form === 'linear') {
          for (let worker = 1; worker <= p.labour; worker++) output += p.k;
        } else {
          let root = 0;
          while (root * root < p.labour) root++;
          expect(root * root).toBe(p.labour); // a perfect square, so output is whole
          output = p.k * root;
        }
        let cost = p.fixedCost;
        for (let unit = 1; unit <= output; unit++) cost += p.unitCost;
        expect(value).toBe(cost);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(p.fixedCost);
        expect(p.labour).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('gives a different number when the functions are applied the other way round', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(compositeCostOfLabour, seed);
        const q = (x: number) => (p.form === 'linear' ? p.k * x : p.k * Math.sqrt(x));
        const c = (x: number) => p.fixedCost + p.unitCost * x;
        expect(Math.abs(q(c(p.labour)) - value)).toBeGreaterThan(0.05);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in F10 (Q = 5√L, C = 1000 + 8Q, 64 workers)', () => {
    const answer = compositeCostOfLabour.answer({
      form: 'sqrt',
      k: 5,
      labour: 64,
      fixedCost: 1000,
      unitCost: 8,
    });
    expect(answer.kind === 'numeric' && answer.value).toBe(1320);
  });
});

describe('labour-for-cost-budget', () => {
  it('is the only whole number of workers whose output costs exactly the budget', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(labourForCostBudget, seed);
        const q = (l: number) => (p.form === 'linear' ? p.k * l : p.k * Math.sqrt(l));
        const totalCost = (l: number) => p.fixedCost + p.unitCost * q(l);
        const hits: number[] = [];
        for (let l = 0; l <= 1000; l++) {
          if (Math.abs(totalCost(l) - p.budget) < 1e-9) hits.push(l);
        }
        expect(hits).toEqual([value]);
        expect(value).toBeGreaterThan(0);
        expect(p.budget).toBeGreaterThan(p.fixedCost);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in F10 (budget 1480 with Q = 5√L, C = 1000 + 8Q)', () => {
    const answer = labourForCostBudget.answer({
      form: 'sqrt',
      k: 5,
      fixedCost: 1000,
      unitCost: 8,
      budget: 1480,
    });
    expect(answer.kind === 'numeric' && answer.value).toBe(144);
  });
});
