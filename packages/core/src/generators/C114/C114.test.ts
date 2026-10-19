import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { consumerSurplusLinearEquilibrium } from './consumer-surplus-linear-equilibrium';
import { consumerSurplusQuadraticDemand } from './consumer-surplus-quadratic-demand';
import { deadweightLossPerUnitTax } from './deadweight-loss-per-unit-tax';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** Midpoint-rule integral: adds up thin rectangles, using only values of f. */
const integrate = (f: (x: number) => number, from: number, to: number, n = 2000) => {
  const h = (to - from) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += f(from + (i + 0.5) * h);
  return sum * h;
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

describe('consumer-surplus-linear-equilibrium', () => {
  it('equals the area between demand and the price, added up numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(consumerSurplusLinearEquilibrium, seed);
        // Find the equilibrium by walking along Q until the demand price meets the supply price.
        let q = 0;
        while (p.a - p.b * q > p.c + p.d * q) q += 1;
        expect(p.a - p.b * q).toBe(p.c + p.d * q);
        const price = p.a - p.b * q;
        const cs = integrate((x) => p.a - p.b * x - price, 0, q);
        expect(Math.abs(cs - value)).toBeLessThan(1e-6 * Math.max(1, value));
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: whole answer, positive prices, a real supply mistake', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(consumerSurplusLinearEquilibrium, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.c).toBeGreaterThan(0);
        expect(p.price).toBeGreaterThan(p.c);
        expect(p.b).not.toBe(p.d);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (P = 100 − 2Q, P = 10 + Q: CS = 900)', () => {
    const p = { a: 100, b: 2, c: 10, d: 1, quantity: 30, price: 40 };
    expect(consumerSurplusLinearEquilibrium.answer(p)).toMatchObject({ value: 900 });
    expect(consumerSurplusLinearEquilibrium.distractors(p)).toEqual([
      { value: 1200, mistakeCode: 'SPENDING_NOT_SURPLUS' },
      { value: 2100, mistakeCode: 'FORGOT_SPENDING' },
      { value: 450, mistakeCode: 'USED_SUPPLY' },
      { value: 1800, mistakeCode: 'FORGOT_HALF' },
    ]);
  });
});

describe('deadweight-loss-per-unit-tax', () => {
  it('equals the fall in total surplus (CS + PS + tax revenue), integrated numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(deadweightLossPerUnitTax, seed);
        const demand = (x: number) => p.a - p.b * x;
        const supply = (x: number) => p.c + p.d * x;
        // Quantities found by scanning: the last whole unit whose demand price covers supply (+ tax).
        let q0 = 0;
        while (demand(q0 + 1) >= supply(q0 + 1)) q0 += 1;
        let qt = 0;
        while (demand(qt + 1) >= supply(qt + 1) + p.tax) qt += 1;
        const before = integrate((x) => demand(x) - supply(x), 0, q0);
        const after = integrate((x) => demand(x) - supply(x), 0, qt);
        const revenue = p.tax * qt;
        const cs = integrate(demand, 0, qt) - demand(qt) * qt;
        const ps = (demand(qt) - p.tax) * qt - integrate(supply, 0, qt);
        expect(Math.abs(cs + ps + revenue - after)).toBeLessThan(1e-6 * before);
        expect(Math.abs(before - after - value)).toBeLessThan(1e-6 * Math.max(1, before));
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: whole answer, the market stays open, prices stay positive', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(deadweightLossPerUnitTax, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.quantity - p.k).toBeGreaterThanOrEqual(5);
        expect(p.c).toBeGreaterThan(0);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (P = 100 − 2Q, P = 10 + Q, tax 18: DWL = 54)', () => {
    const p = { a: 100, b: 2, c: 10, d: 1, quantity: 30, price: 40, k: 6, tax: 18 };
    expect(deadweightLossPerUnitTax.answer(p)).toMatchObject({ value: 54 });
    // Consumer surplus falls from 900 to 576, a loss of 324.
    expect(deadweightLossPerUnitTax.distractors(p)).toEqual([
      { value: 432, mistakeCode: 'TAX_REVENUE_NOT_DWL' },
      { value: 108, mistakeCode: 'FORGOT_HALF' },
      { value: 324, mistakeCode: 'CONSUMER_LOSS_ONLY' },
    ]);
  });
});

describe('consumer-surplus-quadratic-demand', () => {
  it('equals the area between the curved demand and the price, added up numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(consumerSurplusQuadraticDemand, seed);
        const demand = (x: number) => p.a - p.b * x * x;
        expect(Math.abs(demand(p.quantity) - p.price)).toBeLessThan(1e-9);
        const cs = integrate((x) => demand(x) - p.price, 0, p.quantity);
        expect(Math.abs(cs - value)).toBeLessThanOrEqual(0.005 + 1e-6 * value);
      }),
      RUNS,
    );
  });

  it('is 4/3 of the (wrong) triangle, with readable numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(consumerSurplusQuadraticDemand, seed);
        expect(twoDecimals(value)).toBe(true);
        expect(Number.isInteger(p.a)).toBe(true);
        expect(Number.isInteger(p.price)).toBe(true);
        expect(p.price).toBeGreaterThan(0);
        const triangle = ((p.a - p.price) * p.quantity) / 2;
        expect(Math.abs(value - (4 / 3) * triangle)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (P = 80 − 0.2Q² at P = 60: CS = 133.33)', () => {
    const p = { a: 80, b: 0.2, price: 60, quantity: 10 };
    expect(consumerSurplusQuadraticDemand.answer(p)).toMatchObject({ value: 133.33 });
    const d = consumerSurplusQuadraticDemand.distractors(p);
    expect(d).toContainEqual({ value: 100, mistakeCode: 'TRIANGLE_FORMULA' });
    expect(d).toContainEqual({ value: 733.33, mistakeCode: 'FORGOT_SPENDING' });
    expect(d).toContainEqual({ value: 600, mistakeCode: 'SPENDING_NOT_SURPLUS' });
  });
});
