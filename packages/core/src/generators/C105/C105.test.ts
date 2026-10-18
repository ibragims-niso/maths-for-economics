import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { expLogDerivativeAtPoint } from './exp-log-derivative-at-point';
import { growthAccountingTfp } from './growth-accounting-tfp';
import { growthRateRatioProduct } from './growth-rate-ratio-product';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Central-difference derivative, a different route from the rules of the topic. */
const derivative = (f: (t: number) => number, t: number, h = 1e-5) =>
  (f(t + h) - f(t - h)) / (2 * h);

/** Growth rate in per cent of a path, measured as slope ÷ level of the simulated path. */
const measuredGrowth = (f: (t: number) => number, t: number) => (100 * derivative(f, t)) / f(t);

describe('growth-rate-ratio-product', () => {
  it('matches slope ÷ level of the simulated ratio or product of two exponential paths', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(growthRateRatioProduct, seed);
        const x = (t: number) => 50 * Math.exp((p.first / 100) * t);
        const y = (t: number) => 20 * Math.exp((p.second / 100) * t);
        const ratio = p.context === 'gdpPerPerson' || p.context === 'realWage';
        const z = ratio ? (t: number) => x(t) / y(t) : (t: number) => x(t) * y(t);
        expect(Math.abs(value - measuredGrowth(z, 3))).toBeLessThan(1e-4);
        expect(p.first).toBeGreaterThan(0);
        expect(p.second).toBeGreaterThan(0);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.2);
        if (!ratio) expect(value).toBeGreaterThan(0);
        expect(hasAtMostDecimals(value, 1)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('gives GDP per person 3.5 − 1.2 = 2.3 % (C105 definitions)', () => {
    const p = { context: 'gdpPerPerson', first: 3.5, second: 1.2 } as const;
    expect(growthRateRatioProduct.answer(p)).toMatchObject({ value: 2.3 });
  });
});

describe('exp-log-derivative-at-point', () => {
  it('equals the numerical derivative (slope) or numerical d ln S/dt (growth rate)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(expLogDerivativeAtPoint, seed);
        if (p.form === 'exp') {
          const path = (t: number) => p.A * Math.exp(p.k * t);
          const exact = derivative(path, p.t);
          expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-4);
          expect(p.A).toBeGreaterThan(0);
          expect(p.k).toBeGreaterThan(0);
          expect(value).toBeGreaterThan(0);
          // The slope divided by the level is k at every time.
          expect(exact / path(p.t)).toBeCloseTo(p.k, 6);
        } else {
          const path = (t: number) => p.a * t * t + p.b;
          const exact = 100 * derivative((t) => Math.log(path(t)), p.t);
          expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-6);
          expect(value).toBeGreaterThanOrEqual(2);
          expect(value).toBeLessThanOrEqual(60);
        }
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (400e^(0.03t) at t = 10: 16.20)', () => {
    const p = { form: 'exp', context: 'gdp', A: 400, k: 0.03, t: 10 } as const;
    expect(expLogDerivativeAtPoint.answer(p)).toMatchObject({ value: 16.2 });
  });

  it('reproduces worked example 2 (S = 3t² + 52 at t = 4: 24 %)', () => {
    const p = { form: 'log', a: 3, b: 52, t: 4 } as const;
    expect(expLogDerivativeAtPoint.answer(p)).toMatchObject({ value: 24 });
  });
});

describe('growth-accounting-tfp', () => {
  /** Finds the TFP growth that makes the simulated output grow at g_Y, by bisection. */
  const solveTfp = (alpha: number, gY: number, gK: number, gL: number) => {
    const outputGrowth = (gA: number) =>
      measuredGrowth(
        (t) =>
          Math.exp((gA / 100) * t) *
          Math.exp((gK / 100) * t) ** alpha *
          Math.exp((gL / 100) * t) ** (1 - alpha),
        2,
      );
    let lo = -20;
    let hi = 20;
    for (let i = 0; i < 80; i++) {
      const mid = (lo + hi) / 2;
      if (outputGrowth(mid) < gY) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };

  it('is the TFP growth that makes simulated output grow at the stated rate', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(growthAccountingTfp, seed);
        expect(Math.abs(value - solveTfp(p.alpha, p.gY, p.gK, p.gL))).toBeLessThanOrEqual(
          0.005 + 1e-4,
        );
        expect(p.alpha).toBeGreaterThan(0);
        expect(p.alpha).toBeLessThan(0.5);
        expect(p.gY).toBeGreaterThan(0);
        expect(value).toBeGreaterThanOrEqual(0.2);
        expect(value).toBeLessThanOrEqual(4);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (α = 0.3, 4 %, 5 %, 1 % → 1.8 %)', () => {
    const p = { alpha: 0.3, gY: 4, gK: 5, gL: 1 } as const;
    expect(growthAccountingTfp.answer(p)).toMatchObject({ value: 1.8 });
  });
});
