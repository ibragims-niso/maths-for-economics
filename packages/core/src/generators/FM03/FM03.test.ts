import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { impliedAnnualRate } from './implied-annual-rate';
import { presentValueSingle } from './present-value-single';
import { presentValueUnevenFlows } from './present-value-uneven-flows';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, decimals: pr.answer.decimals };
};

/** True when x has at most `d` decimal places. */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('present-value-single', () => {
  it('equals the payment discounted one year at a time, and grows back into it', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, decimals } = solve(presentValueSingle, seed);
        let amount = p.futureValue;
        for (let year = 0; year < p.years; year++) amount /= 1 + p.rate / 100;
        expect(Math.abs(value - amount)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Compounding the answer forward gives back the promised payment (up to rounding).
        let balance = value;
        for (let year = 0; year < p.years; year++) balance += balance * (p.rate / 100);
        expect(Math.abs(balance - p.futureValue)).toBeLessThanOrEqual(
          0.005 * (1 + p.rate / 100) ** p.years + 1e-9,
        );
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.futureValue);
        expect(decimals).toBe(2);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(p.rate).toBeGreaterThanOrEqual(1);
        expect(p.rate).toBeLessThanOrEqual(12);
        expect(p.years).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in FM03 (1000 in 3 years at 5 %)', () => {
    const p = { futureValue: 1000, rate: 5, years: 3 };
    const answer = presentValueSingle.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(863.84);
  });
});

describe('present-value-uneven-flows', () => {
  it('is the deposit that pays every amount on its date and leaves nothing', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(presentValueUnevenFlows, seed);
        // Put the answer in a bank today, add interest each year, withdraw each payment when due.
        const last = p.flows[p.flows.length - 1]?.year ?? 0;
        let balance = value;
        for (let year = 1; year <= last; year++) {
          balance *= 1 + p.rate / 100;
          for (const f of p.flows) if (f.year === year) balance -= f.amount;
        }
        // Rounding each piece to the cent may leave at most a few cents, grown with interest.
        expect(Math.abs(balance)).toBeLessThanOrEqual(0.02 * (1 + p.rate / 100) ** last);
        expect(value).toBeLessThan(p.flows.reduce((a, f) => a + f.amount, 0));
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('has two or three positive payments at different dates, the first at least a year away', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(presentValueUnevenFlows, seed);
        expect(p.flows.length === 2 || p.flows.length === 3).toBe(true);
        expect(p.flows[0]?.year).toBeGreaterThanOrEqual(1);
        p.flows.forEach((f, i) => {
          expect(f.amount).toBeGreaterThan(0);
          if (i > 0) expect(f.year).toBeGreaterThan(p.flows[i - 1]?.year ?? 0);
        });
        expect(p.rate).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in FM03 (4000, 5000, 6000 in years 1, 3, 4 at 6 %)', () => {
    const p = {
      flows: [
        { amount: 4000, year: 1 },
        { amount: 5000, year: 3 },
        { amount: 6000, year: 4 },
      ],
      rate: 6,
      context: 'client' as const,
    };
    const answer = presentValueUnevenFlows.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(12724.24);
  });
});

describe('implied-annual-rate', () => {
  it('finds the rate a fine search over rates agrees with', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(impliedAnnualRate, seed);
        // Search rates 0.00 %, 0.01 %, ... 20.00 % for the one that grows the price closest to the payment.
        let best = 0;
        let bestGap = Number.POSITIVE_INFINITY;
        for (let k = 0; k <= 2000; k++) {
          const gap = Math.abs(p.price * (1 + k / 10000) ** p.years - p.faceValue);
          if (gap < bestGap) {
            bestGap = gap;
            best = k / 100;
          }
        }
        expect(value).toBeCloseTo(best, 9);
        // The rate is the clean one the problem was built from.
        expect(value).toBe(p.rate);
        expect(p.price).toBeGreaterThan(0);
        expect(p.price).toBeLessThan(p.faceValue);
        expect(hasDecimals(p.price, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in FM03 (7835.26 today, 10000 in 5 years)', () => {
    const p = { rate: 5, years: 5, faceValue: 10000, price: 7835.26 };
    const answer = impliedAnnualRate.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(5);
  });
});
