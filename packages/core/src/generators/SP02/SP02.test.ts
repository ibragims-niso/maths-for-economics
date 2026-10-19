import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { arrowPrattRiskPremium } from './arrow-pratt-risk-premium';
import { insuranceMaximumPremium } from './insurance-maximum-premium';
import { lotteryCertaintyEquivalent } from './lottery-certainty-equivalent';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const byCode = (ds: { value: number; mistakeCode: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** Utility written out directly, without the generators' helpers. */
const u = (kind: 'sqrt' | 'log', w: number) => (kind === 'sqrt' ? w ** 0.5 : Math.log(w));

/** Solves u(x) = target for x in [lo, hi] by bisection (u increasing): no inverse formula used. */
function solveUtility(kind: 'sqrt' | 'log', target: number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    if (u(kind, m) < target) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

describe('lottery-certainty-equivalent', () => {
  it('gives the sure amount whose utility equals the expected utility, found by bisection', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lotteryCertaintyEquivalent, seed);
        const q = p.pTenths / 10;
        const eu = q * u(p.kind, p.low) + (1 - q) * u(p.kind, p.high);
        const ce = solveUtility(p.kind, eu, p.low, p.high);
        expect(Math.abs(value - ce)).toBeLessThanOrEqual(0.005 + 1e-6);
        // Risk aversion: the CE lies strictly between the worst outcome and the expected value.
        expect(value).toBeGreaterThan(p.low);
        expect(value).toBeLessThan(q * p.low + (1 - q) * p.high);
      }),
      RUNS,
    );
  });

  it('uses sensible outcomes and an exact answer for √W', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(lotteryCertaintyEquivalent, seed);
        expect(p.low).toBeGreaterThan(0);
        expect(p.high).toBeGreaterThan(p.low);
        expect(p.pTenths).toBeGreaterThanOrEqual(1);
        expect(p.pTenths).toBeLessThanOrEqual(9);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        if (p.kind === 'sqrt') {
          expect(Number.isInteger(Math.sqrt(p.low)) && Number.isInteger(Math.sqrt(p.high))).toBe(
            true,
          );
          const e = (p.pTenths * Math.sqrt(p.low) + (10 - p.pTenths) * Math.sqrt(p.high)) / 10;
          expect(Math.abs(value - e * e)).toBeLessThan(1e-6);
        }
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        if (p.pTenths === 5) expect(byCode(distractors)).not.toHaveProperty('UNWEIGHTED');
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in SP02 (40,000 or 90,000, equally likely)', () => {
    const base = { context: 'harvest', low: 40000, high: 90000, pTenths: 5 } as const;
    expect(lotteryCertaintyEquivalent.answer({ ...base, kind: 'sqrt' })).toMatchObject({
      value: 62500,
    });
    expect(byCode(lotteryCertaintyEquivalent.distractors({ ...base, kind: 'sqrt' }))).toEqual({
      EXPECTED_VALUE: 65000,
      NOT_INVERTED: 250,
    });
    expect(lotteryCertaintyEquivalent.answer({ ...base, kind: 'log' })).toMatchObject({
      value: 60000,
    });
  });
});

describe('insurance-maximum-premium', () => {
  it('leaves her indifferent: u(W₀ − premium) equals the expected utility of facing the loss', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(insuranceMaximumPremium, seed);
        const q = p.pHundredths / 100;
        const eu = q * u(p.kind, p.wealth - p.loss) + (1 - q) * u(p.kind, p.wealth);
        // Bisection on the premium itself: the most she pays is where insured utility falls to eu.
        let a = 0;
        let b = p.loss;
        for (let i = 0; i < 200; i++) {
          const m = (a + b) / 2;
          if (u(p.kind, p.wealth - m) > eu) a = m;
          else b = m;
        }
        expect(Math.abs(value - a)).toBeLessThanOrEqual(0.005 + 1e-6);
        // A risk-averse buyer pays more than the expected loss, but less than the loss itself.
        expect(value).toBeGreaterThan(q * p.loss);
        expect(value).toBeLessThan(p.loss);
      }),
      RUNS,
    );
  });

  it('uses a sensible loss, a small probability and a 2-decimal answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(insuranceMaximumPremium, seed);
        expect(p.loss).toBeGreaterThan(0);
        expect(p.loss).toBeLessThan(p.wealth);
        expect(p.pHundredths).toBeGreaterThanOrEqual(1);
        expect(p.pHundredths).toBeLessThanOrEqual(25);
        expect(value - (p.pHundredths * p.loss) / 100).toBeGreaterThanOrEqual(1 - 0.005);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        if (p.kind === 'sqrt') {
          expect(Number.isInteger(Math.sqrt(p.wealth))).toBe(true);
          expect(Number.isInteger(Math.sqrt(p.wealth - p.loss))).toBe(true);
        }
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in SP02 (wealth 90,000, loss 50,000, probability 0.04)', () => {
    const base = { context: 'flood', wealth: 90000, loss: 50000, pHundredths: 4 } as const;
    expect(insuranceMaximumPremium.answer({ ...base, kind: 'sqrt' })).toMatchObject({
      value: 2384,
    });
    expect(byCode(insuranceMaximumPremium.distractors({ ...base, kind: 'sqrt' }))).toEqual({
      FAIR_PREMIUM: 2000,
      RISK_PREMIUM_ONLY: 384,
      GAVE_CE: 87616,
    });
    expect(insuranceMaximumPremium.answer({ ...base, kind: 'log' })).toMatchObject({
      value: 2872.51,
    });
  });
});

describe('arrow-pratt-risk-premium', () => {
  it('uses A(W) = −u″/u′ found by numerical differentiation', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(arrowPrattRiskPremium, seed);
        const g = p.gamma;
        const crra = (w: number) => (g === 1 ? Math.log(w) : w ** (1 - g) / (1 - g));
        // Work in thousands so the finite differences stay accurate; A scales by 1/1000.
        const W = p.wealth / 1000;
        const f = crra;
        const h = 1e-3;
        const d1 = (f(W + h) - f(W - h)) / (2 * h);
        const d2 = (f(W + h) - 2 * f(W) + f(W - h)) / (h * h);
        const A = -d2 / d1 / 1000;
        expect(Math.abs(A * p.wealth - g)).toBeLessThan(1e-3);
        expect(Math.abs(value - 0.5 * A * p.sd ** 2)).toBeLessThanOrEqual(
          0.5 * A * p.sd ** 2 * 1e-3 + 0.005,
        );
      }),
      RUNS,
    );
  });

  it('is close to the exact risk premium of a 50/50 gamble of ±σ', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(arrowPrattRiskPremium, seed);
        const g = p.gamma;
        const crra = (w: number) => (g === 1 ? Math.log(w) : w ** (1 - g) / (1 - g));
        const eu = 0.5 * crra(p.wealth - p.sd) + 0.5 * crra(p.wealth + p.sd);
        let a = p.wealth - p.sd;
        let b = p.wealth + p.sd;
        for (let i = 0; i < 200; i++) {
          const m = (a + b) / 2;
          if (crra(m) < eu) a = m;
          else b = m;
        }
        const exact = p.wealth - a;
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.07 * exact + 0.01);
      }),
      RUNS,
    );
  });

  it('keeps the gamble small and the answer readable', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(arrowPrattRiskPremium, seed);
        expect(50 * p.sd).toBeGreaterThanOrEqual(p.wealth);
        expect(20 * p.sd).toBeLessThanOrEqual(3 * p.wealth);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThan(p.sd);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in SP02 (γ = 2, W = 50,000, σ = 10,000)', () => {
    const p = { gamma: 2, wealth: 50000, sd: 10000 } as const;
    expect(arrowPrattRiskPremium.answer(p)).toMatchObject({ value: 2000 });
    expect(byCode(arrowPrattRiskPremium.distractors(p))).toEqual({
      NO_HALF: 4000,
      SD_NOT_VARIANCE: 0.2,
      RELATIVE_FOR_ABSOLUTE: 100000000,
    });
  });
});
