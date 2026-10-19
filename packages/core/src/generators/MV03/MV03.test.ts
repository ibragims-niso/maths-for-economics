import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { chainRuleTwoOutputCost } from './chain-rule-two-output-cost';
import { cobbDouglasOutputGrowthRate } from './cobb-douglas-output-growth-rate';
import { totalDifferentialOutputChange } from './total-differential-output-change';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('total-differential-output-change', () => {
  it('equals the rate of change of output along the straight move (dK, dL), and the exact change is close', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(totalDifferentialOutputChange, seed);
        const alpha = p.alphaQ / 4;
        const beta = p.betaQ / 4;
        const K = p.kRoot ** p.kPower;
        const L = p.lRoot ** p.lPower;
        const Q = (k: number, l: number) => p.A * k ** alpha * l ** beta;
        // A different route: d/ds Q(K + s·dK, L + s·dL) at s = 0, by a central difference.
        const h = 1e-6;
        const slope = (Q(K + h * p.dK, L + h * p.dL) - Q(K - h * p.dK, L - h * p.dL)) / (2 * h);
        expect(Math.abs(value - slope)).toBeLessThan(1e-4);
        // The estimate is close to the true change: the error is small next to output.
        const exact = Q(K + p.dK, L + p.dL) - Q(K, L);
        expect(Math.abs(exact - value)).toBeLessThan(0.05 * Q(K, L));
        // Readable numbers: whole inputs and output, small whole changes, at most 2 decimals.
        expect(Math.abs(Q(K, L) - Math.round(Q(K, L)))).toBeLessThan(1e-9);
        expect(Number.isInteger(p.dK) && p.dK !== 0).toBe(true);
        expect(Number.isInteger(p.dL) && p.dL !== 0).toBe(true);
        expect(Math.abs(p.dK)).toBeLessThanOrEqual(0.15 * K);
        expect(Math.abs(p.dL)).toBeLessThanOrEqual(0.15 * L);
        expect(K + p.dK).toBeGreaterThan(0);
        expect(L + p.dL).toBeGreaterThan(0);
        expect(alpha + beta).toBeLessThanOrEqual(1);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(1);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 (Q = 10K^0.5 L^0.5 at K = 16, L = 25, dK = 2, dL = −1: 8.5)', () => {
    const p = { A: 10, alphaQ: 2, betaQ: 2, kRoot: 4, kPower: 2, lRoot: 5, lPower: 2 };
    expect(totalDifferentialOutputChange.answer({ ...p, dK: 2, dL: -1 })).toMatchObject({
      value: 8.5,
    });
    const codes = totalDifferentialOutputChange.distractors({ ...p, dK: 2, dL: -1 });
    expect(codes.find((d) => d.mistakeCode === 'EXACT_CHANGE')?.value).toBe(7.85);
  });
});

describe('cobb-douglas-output-growth-rate', () => {
  it('equals the log growth rate of Y (or Y/L) when A, K and L grow exponentially', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(cobbDouglasOutputGrowthRate, seed);
        const alpha = p.alphaT / 10;
        const beta = p.betaT / 10;
        // A different route: simulate A, K, L growing at their rates and differentiate ln Y.
        const at = (t: number) => {
          const A = 2 * Math.exp((p.gA / 1000) * t);
          const K = 50 * Math.exp((p.gK / 1000) * t);
          const L = 30 * Math.exp((p.gL / 1000) * t);
          const Y = A * K ** alpha * L ** beta;
          return p.ask === 'output' ? Y : Y / L;
        };
        const h = 1e-4;
        const growth = ((Math.log(at(h)) - Math.log(at(-h))) / (2 * h)) * 100;
        expect(Math.abs(value - growth)).toBeLessThan(1e-6);
        expect(alpha + beta).toBeLessThanOrEqual(1);
        expect(p.alphaT).not.toBe(p.betaT);
        expect(p.gA).toBeGreaterThan(0);
        expect(p.gK).toBeGreaterThan(0);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.2);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 (α = 0.3: 3.4 % for output, 2.4 % per worker)', () => {
    const p = { alphaT: 3, betaT: 7, gA: 15, gK: 40, gL: 10 };
    expect(cobbDouglasOutputGrowthRate.answer({ ...p, ask: 'output' })).toMatchObject({
      value: 3.4,
    });
    expect(cobbDouglasOutputGrowthRate.answer({ ...p, ask: 'perWorker' })).toMatchObject({
      value: 2.4,
    });
  });
});

describe('chain-rule-two-output-cost', () => {
  it('equals the derivative of the cost after substituting the time paths', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(chainRuleTwoOutputCost, seed);
        const C = (x: number, y: number) => p.F + p.a * x * x + p.b * x * y + p.c * y * y;
        // A different route: one-variable cost c(t) = C(x(t), y(t)), differentiated numerically.
        const c = (t: number) => C(p.x0 + p.m * t, p.y0 + p.n * t * t);
        const h = 1e-4;
        expect(Math.abs(value - (c(p.t + h) - c(p.t - h)) / (2 * h))).toBeLessThan(1e-3);
        // Cost really rises: one month later it is higher.
        expect(c(p.t + 1)).toBeGreaterThan(c(p.t));
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.x0).toBeGreaterThan(0);
        expect(p.y0).toBeGreaterThan(0);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 (C = 200 + 2x² + xy + y², x = 20 + 2t, y = 10 + t², t = 3: 630)', () => {
    const p = { F: 200, a: 2, b: 1, c: 1, x0: 20, m: 2, y0: 10, n: 1, t: 3 };
    expect(chainRuleTwoOutputCost.answer(p)).toMatchObject({ value: 630 });
  });
});
