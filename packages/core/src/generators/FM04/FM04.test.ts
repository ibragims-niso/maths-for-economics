import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { annuityPresentValue } from './annuity-present-value';
import { growingPerpetuityValue } from './growing-perpetuity-value';
import { savingPlanPayment } from './saving-plan-payment';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

describe('annuity-present-value', () => {
  it('equals the sum of each payment discounted separately', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(annuityPresentValue, seed);
        const r = p.rate / 100 / p.m;
        let pv = 0;
        for (let k = 1; k <= p.m * p.years; k++) pv += p.payment / (1 + r) ** k;
        expect(Math.abs(value - pv)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('a loan of the answer is exactly repaid by the payments', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(annuityPresentValue, seed);
        const r = p.rate / 100 / p.m;
        const n = p.m * p.years;
        let balance = value;
        for (let k = 0; k < n; k++) balance = balance * (1 + r) - p.payment;
        // Rounding the answer to the cent leaves at most half a cent, grown for n periods.
        expect(Math.abs(balance)).toBeLessThanOrEqual(0.005 * (1 + r) ** n + 1e-6);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive payment, value below nC and below C/r', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(annuityPresentValue, seed);
        const r = p.rate / 100 / p.m;
        expect(p.payment).toBeGreaterThan(0);
        expect(p.rate).toBeGreaterThanOrEqual(2);
        expect(p.rate).toBeLessThanOrEqual(12);
        expect(Number.isInteger(p.years) && p.years >= 2).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.m * p.years * p.payment);
        expect(value).toBeLessThan(p.payment / r);
        // The monthly rate never needs more than 4 decimals.
        expect(Math.abs(r * 1e4 - Math.round(r * 1e4))).toBeLessThan(1e-6);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['DUE_TIMING', 'FV_INSTEAD', 'PERPETUITY_INSTEAD', 'UNDISCOUNTED'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in FM04 (9000 a year for 20 years at 4 %)', () => {
    const p = { context: 'pension', payment: 9000, rate: 4, m: 1, years: 20 } as const;
    expect(annuityPresentValue.answer(p)).toMatchObject({ kind: 'numeric', value: 122312.94 });
  });
});

describe('growing-perpetuity-value', () => {
  it('equals the long sum of growing payments, discounted', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(growingPerpetuityValue, seed);
        const r = p.rate / 100;
        const g = p.growth / 100;
        let pv = 0;
        let term = (p.current * (1 + g)) / (1 + r);
        while (term > 1e-9) {
          pv += term;
          term *= (1 + g) / (1 + r);
        }
        expect(Math.abs(value - pv)).toBeLessThanOrEqual(0.005 + 1e-6);
      }),
      RUNS,
    );
  });

  it('price today = (next payment + next year’s price) / (1 + r), with the price growing at g', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(growingPerpetuityValue, seed);
        const r = p.rate / 100;
        const g = p.growth / 100;
        const nextPayment = p.current * (1 + g);
        const nextPrice = value * (1 + g);
        expect(Math.abs((nextPayment + nextPrice) / (1 + r) - value)).toBeLessThanOrEqual(0.01);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: growth below the discount rate, positive value', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(growingPerpetuityValue, seed);
        expect(p.current).toBeGreaterThan(0);
        expect(p.growth).toBeGreaterThan(0);
        expect(p.rate - p.growth).toBeGreaterThanOrEqual(2);
        expect(p.rate).toBeLessThanOrEqual(15);
        expect(value).toBeGreaterThan(p.current / (p.rate / 100));
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in FM04 (dividend 2, growth 4 %, return 9 %)', () => {
    const p = { context: 'share', current: 2, growth: 4, rate: 9 } as const;
    expect(growingPerpetuityValue.answer(p)).toMatchObject({ kind: 'numeric', value: 41.6 });
  });
});

describe('saving-plan-payment', () => {
  it('saving the answer each period reaches the target (simulated deposit by deposit)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(savingPlanPayment, seed);
        const r = p.rate / 100 / p.m;
        const n = p.m * p.years;
        let balance = 0;
        let perUnit = 0; // what saving 1 per period grows to
        for (let k = 0; k < n; k++) {
          balance = balance * (1 + r) + value;
          perUnit = perUnit * (1 + r) + 1;
        }
        // The payment is rounded to the cent, so the total may miss by half a cent per unit saved.
        expect(Math.abs(balance - p.target)).toBeLessThanOrEqual(0.005 * perUnit + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive deposit, less than target/n because interest helps', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(savingPlanPayment, seed);
        const n = p.m * p.years;
        expect(p.target).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(1);
        expect(value).toBeLessThan(p.target / n);
        expect(p.rate).toBeGreaterThanOrEqual(2);
        expect(p.rate).toBeLessThanOrEqual(9);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in FM04 (20000 in 5 years at 4.8 % compounded monthly)', () => {
    const p = { target: 20000, rate: 4.8, m: 12, years: 5 } as const;
    expect(savingPlanPayment.answer(p)).toMatchObject({ kind: 'numeric', value: 295.59 });
  });
});
