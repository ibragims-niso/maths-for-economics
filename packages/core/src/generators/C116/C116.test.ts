import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { continuousStreamPresentValue } from './continuous-stream-present-value';
import { growingContinuousStreamValue } from './growing-continuous-stream-value';
import { improperPowerIntegral } from './improper-power-integral';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** Simpson's rule for ∫ₐᵇ f, a route independent of the antiderivatives the generators use. */
const simpson = (f: (x: number) => number, a: number, b: number, n = 4000) => {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += f(a + i * h) * (i % 2 === 1 ? 4 : 2);
  return (sum * h) / 3;
};

describe('continuous-stream-present-value', () => {
  it('equals the discounted income added up numerically over [0, T]', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(continuousStreamPresentValue, seed);
        const r = p.rate / 100;
        const pv = simpson((t) => p.flow * Math.exp(-r * t), 0, p.years);
        expect(Math.abs(value - pv)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('is a perpetuity now minus a perpetuity that starts at T, close to fine monthly sums', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(continuousStreamPresentValue, seed);
        const r = p.rate / 100;
        const perpetuity = p.flow / r;
        expect(Math.abs(perpetuity - perpetuity * Math.exp(-r * p.years) - value)).toBeLessThan(
          0.006,
        );
        // Daily instalments of A/365, each discounted continuously, approach the stream from below.
        let daily = 0;
        for (let k = 1; k <= 365 * p.years; k++) daily += (p.flow / 365) * Math.exp((-r * k) / 365);
        expect(daily).toBeLessThan(value + 0.005);
        expect(value - daily).toBeLessThan(value * r * 0.002);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: below A·T and A/r, all four mistakes usually distinct', () => {
    const codes = new Set<string>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(continuousStreamPresentValue, seed);
        expect(p.flow).toBeGreaterThan(0);
        expect(p.rate).toBeGreaterThanOrEqual(2);
        expect(p.rate).toBeLessThanOrEqual(12);
        expect(Number.isInteger(p.years) && p.years >= 3 && p.years <= 40).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.flow * p.years);
        expect(value).toBeLessThan(p.flow / (p.rate / 100));
        expect(distractors.length).toBeGreaterThanOrEqual(3);
        for (const d of distractors) codes.add(d.mistakeCode);
      }),
      RUNS,
    );
    expect([...codes].sort()).toEqual(
      ['DISCRETE_ANNUITY', 'LUMP_AT_END', 'PERPETUITY_INSTEAD', 'UNDISCOUNTED'].sort(),
    );
  });

  it('reproduces worked example 1 in C116 (12000 a year for 15 years at 6 %)', () => {
    const p = { context: 'mine', flow: 12000, rate: 6, years: 15 } as const;
    expect(continuousStreamPresentValue.answer(p)).toMatchObject({
      kind: 'numeric',
      value: 118686.07,
    });
  });
});

describe('growing-continuous-stream-value', () => {
  it('equals the growing, discounted flow integrated numerically far into the future', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(growingContinuousStreamValue, seed);
        const r = p.rate / 100;
        const g = p.growth / 100;
        // By this horizon the discounted flow is below e^(−40) of its start: the tail is negligible.
        const horizon = 40 / (r - g);
        const pv = simpson((t) => p.flow * Math.exp(g * t) * Math.exp(-r * t), 0, horizon, 20000);
        expect(Math.abs(value - pv)).toBeLessThanOrEqual(0.005 + 1e-9 * value);
      }),
      RUNS,
    );
  });

  it('value today = flow over the next instant + value later, discounted (V grows at g)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(growingContinuousStreamValue, seed);
        const r = p.rate / 100;
        const g = p.growth / 100;
        // dV/dt = rV − A·e^(gt) for an asset valued at V(t) = A·e^(gt)/(r − g); check at t = 0.
        const dV = value * g;
        expect(Math.abs(dV - (r * value - p.flow))).toBeLessThanOrEqual(0.01);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: g < r, value above A/r, two decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(growingContinuousStreamValue, seed);
        expect(p.flow).toBeGreaterThan(0);
        expect(p.growth).toBeGreaterThan(0);
        expect(p.rate - p.growth).toBeGreaterThanOrEqual(1);
        expect(p.rate).toBeLessThanOrEqual(11);
        expect(value).toBeGreaterThan(p.flow / (p.rate / 100));
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['GREW_FIRST_PAYMENT', 'GROWTH_ADDED', 'IGNORED_GROWTH', 'RATES_SWAPPED'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C116 (400000 a year growing at 3 %, discounted at 8 %)', () => {
    const p = { context: 'firm', flow: 400000, growth: 3, rate: 8 } as const;
    expect(growingContinuousStreamValue.answer(p)).toMatchObject({
      kind: 'numeric',
      value: 8000000,
    });
  });
});

describe('improper-power-integral', () => {
  it('equals the integral computed numerically after the substitution x = a·eˢ', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(improperPowerIntegral, seed);
        // ∫ₐ^∞ c·x^(−p) dx = ∫₀^∞ c·(a·eˢ)^(−p)·a·eˢ ds, a smooth integrand that decays like e^(−(p−1)s).
        const end = 60 / (p.p - 1);
        const numeric = simpson(
          (s) => p.c * (p.a * Math.exp(s)) ** -p.p * p.a * Math.exp(s),
          0,
          end,
        );
        expect(Math.abs(value - numeric)).toBeLessThanOrEqual(0.005 + 1e-6);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: p > 1, a ≥ 1, value at least 1 with 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(improperPowerIntegral, seed);
        expect(p.p).toBeGreaterThan(1);
        expect(p.a).toBeGreaterThanOrEqual(1);
        expect(p.c).toBeGreaterThan(0);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('gives ∫₁^∞ x^(−2) dx = 1, as in the Definition section', () => {
    const p = { context: 'pure', c: 1, p: 2, a: 1 } as const;
    expect(improperPowerIntegral.answer(p)).toMatchObject({ kind: 'numeric', value: 1 });
  });
});
