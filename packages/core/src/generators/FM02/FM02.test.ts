import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { continuousCompoundingAmount } from './continuous-compounding-amount';
import { effectiveAnnualRate } from './effective-annual-rate';
import { nominalRateFromEffective } from './nominal-rate-from-effective';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** e^x from its power series, a different route from Math.exp. */
const expSeries = (x: number) => {
  let sum = 1;
  let term = 1;
  for (let k = 1; k < 60; k++) {
    term *= x / k;
    sum += term;
  }
  return sum;
};

/** Effective rate in per cent of a nominal rate, simulated period by period. */
const simulatedEar = (ratePct: number, m: number | 'continuous') => {
  if (m === 'continuous') return (expSeries(ratePct / 100) - 1) * 100;
  let balance = 1;
  for (let k = 0; k < m; k++) balance += balance * (ratePct / 100 / m);
  return (balance - 1) * 100;
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('effective-annual-rate', () => {
  it('matches a year of interest added period by period, and beats the nominal rate', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(effectiveAnnualRate, seed);
        expect(Math.abs(value - simulatedEar(p.rate, p.compounding))).toBeLessThanOrEqual(
          0.005 + 1e-9,
        );
        expect(value).toBeGreaterThan(p.rate);
        expect(p.rate).toBeGreaterThanOrEqual(2);
        expect(p.rate).toBeLessThanOrEqual(30);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        if (p.context === 'savings') expect(p.rate).toBeLessThanOrEqual(12);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (1.5 % a month, APR 18 %)', () => {
    const p = { rate: 18, compounding: 12, context: 'card' } as const;
    expect(effectiveAnnualRate.answer(p)).toMatchObject({ value: 19.56 });
  });

  it('gives e^r − 1 for continuous compounding (10 % → 10.52 %)', () => {
    const p = { rate: 10, compounding: 'continuous', context: 'savings' } as const;
    expect(effectiveAnnualRate.answer(p)).toMatchObject({ value: 10.52 });
  });
});

describe('continuous-compounding-amount', () => {
  it('equals P·e^(rt) from the power series, between annual compounding and a huge m', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(continuousCompoundingAmount, seed);
        const r = p.rate / 100;
        const exact = p.principal * expSeries(r * p.years);
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-6);
        // Continuous compounding pays more than any finite number of periods a year.
        const annual = p.principal * (1 + r) ** p.years;
        const daily = p.principal * (1 + r / 365) ** (365 * p.years);
        expect(value).toBeGreaterThan(annual);
        expect(value).toBeGreaterThan(daily - 0.005);
        expect(p.principal).toBeGreaterThan(0);
        expect(r * p.years).toBeLessThanOrEqual(2);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (8000 at 5 % for 6 years)', () => {
    const p = { principal: 8000, rate: 5, years: 6 };
    expect(continuousCompoundingAmount.answer(p)).toMatchObject({ value: 10798.87 });
  });
});

describe('nominal-rate-from-effective', () => {
  /** Solves EAR(r) = target for the nominal rate by bisection, without any inverse formula. */
  const bisect = (earPct: number, m: number | 'continuous') => {
    let lo = 0;
    let hi = earPct;
    for (let k = 0; k < 100; k++) {
      const mid = (lo + hi) / 2;
      if (simulatedEar(mid, m) < earPct) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };

  it('is the rate whose effective rate is the one stated (bisection)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(nominalRateFromEffective, seed);
        expect(Math.abs(value - bisect(p.ear, p.compounding))).toBeLessThanOrEqual(0.005 + 1e-9);
        // Substituting the rounded answer back gives (almost) the stated effective rate.
        expect(Math.abs(simulatedEar(value, p.compounding) - p.ear)).toBeLessThan(0.01);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.ear);
        expect(p.ear).toBeGreaterThanOrEqual(2);
        expect(p.ear).toBeLessThanOrEqual(25);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (EAR 12.6 %: monthly 11.93 %, continuous 11.87 %)', () => {
    expect(nominalRateFromEffective.answer({ ear: 12.6, compounding: 12 })).toMatchObject({
      value: 11.93,
    });
    expect(nominalRateFromEffective.answer({ ear: 12.6, compounding: 'continuous' })).toMatchObject(
      { value: 11.87 },
    );
  });
});
