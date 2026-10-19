import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { bisectionStepsForTolerance } from './bisection-steps-for-tolerance';
import { newtonEquilibriumPriceIterates } from './newton-equilibrium-price-iterates';
import { irrPercent, newtonIrrStep, newtonRate, npv } from './newton-irr-step';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/** At most `d` decimals, allowing for floating-point noise. */
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

/** Slope from a central difference quotient, not from the derivative formula. */
const slope = (g: (x: number) => number, x: number, h = 1e-6) => (g(x + h) - g(x - h)) / (2 * h);

/** A root of g between lo and hi by scanning a fine grid, then halving (g changes sign once). */
function scanRoot(g: (x: number) => number, lo: number, hi: number) {
  const n = 20000;
  let a = lo;
  for (let i = 1; i <= n; i++) {
    const b = lo + ((hi - lo) * i) / n;
    if (Math.sign(g(a)) !== Math.sign(g(b))) {
      let l = a;
      let r = b;
      for (let k = 0; k < 60; k++) {
        const m = (l + r) / 2;
        if (Math.sign(g(m)) === Math.sign(g(l))) l = m;
        else r = m;
      }
      return (l + r) / 2;
    }
    a = b;
  }
  return Number.NaN;
}

describe('bisection-steps-for-tolerance', () => {
  it('halving the interval that many times is enough, and one step fewer is not', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bisectionStepsForTolerance, seed);
        // Simulate the widths in thousandths: dividing a whole number by 2 is exact in floating point.
        let width = (p.hi - p.lo) * 1000;
        let steps = 0;
        while (width > p.epsMilli) {
          width /= 2;
          steps++;
        }
        expect(value).toBe(steps);
        expect(((p.hi - p.lo) * 1000) / 2 ** (value - 1)).toBeGreaterThan(p.epsMilli);
        expect(Number.isInteger(value)).toBe(true);
        expect(p.hi).toBeGreaterThan(p.lo);
        expect(p.lo).toBeGreaterThanOrEqual(0);
      }),
      RUNS,
    );
  });

  it('agrees with rounding log₂((b − a)/ε) up, which is never a whole number here', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(bisectionStepsForTolerance, seed);
        const l = Math.log2(((p.hi - p.lo) * 1000) / p.epsMilli);
        expect(value).toBe(Math.ceil(l));
        expect(Math.abs(l - Math.round(l))).toBeGreaterThan(1e-9);
        expect(byCode(distractors).STEPS_ROUNDED_DOWN).toBe(Math.floor(l));
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in NM01: [0 %, 20 %] to 0.01 points needs 11 steps', () => {
    const p = { context: 'irr', lo: 0, hi: 20, epsMilli: 10 } as const;
    expect(bisectionStepsForTolerance.answer(p)).toMatchObject({ value: 11 });
    expect(byCode(bisectionStepsForTolerance.distractors(p))).toEqual({
      STEPS_ROUNDED_DOWN: 10,
      LOG_BASE_10: 4,
      IGNORED_INTERVAL_WIDTH: 7,
    });
  });
});

describe('newton-equilibrium-price-iterates', () => {
  it('equals two tangent steps with slopes from a difference quotient', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(newtonEquilibriumPriceIterates, seed);
        const g = (x: number) => p.s * x ** 3 + p.t * x ** 2 - p.spend;
        const x1 = p.start - g(p.start) / slope(g, p.start);
        const x2 = x1 - g(x1) / slope(g, x1);
        expect(Math.abs(value - x2)).toBeLessThan(0.00006);
        expect(hasDecimals(value, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('moves down towards the price where demand equals supply, closing in fast', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(newtonEquilibriumPriceIterates, seed);
        // The equilibrium from the original curves D(p) = A/p² and S(p) = sp + t.
        const root = scanRoot((x) => p.spend / x ** 2 - (p.s * x + p.t), 0.5, 30);
        expect(Math.abs(p.spend / root ** 2 - (p.s * root + p.t))).toBeLessThan(1e-6);
        // Starting above a convex increasing f, Newton stays above the root and falls monotonically.
        expect(p.start).toBeGreaterThan(root);
        expect(value).toBeGreaterThan(root - 0.0001);
        expect(value).toBeLessThan(p.start);
        // The error is far smaller after two steps, but not zero at 4 decimals.
        expect(value - root).toBeLessThan((p.start - root) / 5);
        expect(Math.abs(value - root)).toBeGreaterThan(0.0003);
        expect(p.spend).toBeGreaterThan(0);
        expect(p.s).toBeGreaterThan(0);
        expect(p.t).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in NM01 (D = 400/p², S = 2p + 4, p₀ = 6)', () => {
    const p = { spend: 400, s: 2, t: 4, start: 6 };
    expect(newtonEquilibriumPriceIterates.answer(p)).toMatchObject({ value: 5.2528 });
    expect(byCode(newtonEquilibriumPriceIterates.distractors(p))).toMatchObject({
      ONE_ITERATE: 5.3333,
      EXACT_ROOT: 5.2517,
    });
  });
});

describe('newton-irr-step', () => {
  it('equals one tangent step on the NPV curve with the slope from a difference quotient', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(newtonIrrStep, seed);
        const f = (r: number) =>
          -p.cost + p.flows[0] / (1 + r) + p.flows[1] / (1 + r) ** 2 + p.flows[2] / (1 + r) ** 3;
        const r0 = p.guess / 100;
        const r1 = r0 - f(r0) / slope(f, r0);
        expect(Math.abs(value - r1 * 100)).toBeLessThan(0.006);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('lands closer to the IRR, and just below it because the NPV curve is convex', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(newtonIrrStep, seed);
        const irr =
          100 *
          scanRoot(
            (r) =>
              -p.cost +
              p.flows[0] / (1 + r) +
              p.flows[1] / (1 + r) ** 2 +
              p.flows[2] / (1 + r) ** 3,
            0,
            1,
          );
        expect(Math.abs(irr - irrPercent(p))).toBeLessThan(1e-6);
        expect(Math.abs(value - irr)).toBeLessThan(Math.abs(p.guess - irr) / 3);
        expect(value).toBeLessThanOrEqual(irr + 0.005);
        expect(irr).toBeGreaterThan(3);
        expect(irr).toBeLessThan(30);
        expect(p.cost).toBeGreaterThan(0);
        for (const cf of p.flows) {
          expect(cf).toBeGreaterThan(0);
          expect(cf % 100).toBe(0);
        }
      }),
      RUNS,
    );
  });

  it('reproduces the Newton step of Example 1 in NM01 (1000 now, 400 for 3 years, from 10 %)', () => {
    const p = { cost: 1000, flows: [400, 400, 400] as [number, number, number], guess: 10 };
    expect(newtonIrrStep.answer(p)).toMatchObject({ value: 9.7 });
    expect(newtonRate(p)).toBeCloseTo(0.096997, 6);
    expect(npv(p, 0.1)).toBeCloseTo(-5.26, 2);
    expect(irrPercent(p)).toBeCloseTo(9.701, 3);
  });
});
