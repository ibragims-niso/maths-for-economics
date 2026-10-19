import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { equilibriumPriceIncomeResponse } from './equilibrium-price-income-response';
import { islmComparativeStaticsCramer } from './islm-comparative-statics-cramer';
import { levelCurveSlopeIft } from './level-curve-slope-ift';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** The slope of f at x from a symmetric difference quotient. */
const numericSlope = (f: (x: number) => number, x: number, h = 1e-5) =>
  (f(x + h) - f(x - h)) / (2 * h);

type LevelParams = Parameters<typeof levelCurveSlopeIft.answer>[0];
type MarketParams = Parameters<typeof equilibriumPriceIncomeResponse.answer>[0];

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

/** The root of a decreasing function g on [lo, hi], by bisection. */
function bisect(g: (x: number) => number, lo: number, hi: number) {
  let a = lo;
  let b = hi;
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    if (g(m) > 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

describe('level-curve-slope-ift', () => {
  /** The curve through the point solved for y as a function of x (no partial derivatives used). */
  const curveY = (q: LevelParams) => {
    if (q.kind === 'utility') {
      const level = q.x * q.y + q.a * q.x + q.c * q.y;
      return (x: number) => (level - q.a * x) / (x + q.c);
    }
    const level = q.a * q.x ** 2 + q.b * q.x * q.y + q.c * q.y ** 2 + q.f * q.x + q.g * q.y;
    // c·y² + (b·x + g)·y + (a·x² + f·x − level) = 0; the positive root is the curve.
    return (x: number) => {
      const B = q.b * x + q.g;
      const C = q.a * x * x + q.f * x - level;
      return (-B + Math.sqrt(B * B - 4 * q.c * C)) / (2 * q.c);
    };
  };

  it('equals the slope of the curve solved explicitly for y', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(levelCurveSlopeIft, seed);
        const y = curveY(p);
        expect(y(p.x)).toBeCloseTo(p.y, 8);
        expect(Math.abs(value - numericSlope(y, p.x))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('slopes down, keeps the function constant along the tangent, and has sensible numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(levelCurveSlopeIft, seed);
        expect(value).toBeLessThan(0);
        expect(Math.abs(value)).toBeGreaterThanOrEqual(0.1);
        expect(Math.abs(value)).toBeLessThanOrEqual(10);
        expect(p.x).toBeGreaterThan(0);
        expect(p.y).toBeGreaterThan(0);
        const F = (x: number, y: number) =>
          p.kind === 'utility'
            ? x * y + p.a * x + p.c * y
            : p.a * x * x + p.b * x * y + p.c * y * y + p.f * x + p.g * y;
        expect(F(p.x, p.y)).toBeLessThanOrEqual(10000);
        // Partial derivatives by difference quotients: −F_x/F_y rounds to the answer.
        const Fx = numericSlope((x) => F(x, p.y), p.x);
        const Fy = numericSlope((y) => F(p.x, y), p.y);
        expect(Math.abs(value + Fx / Fy)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(codes(distractors)).toEqual(['DROPPED_CROSS_TERM', 'INVERTED_RATIO', 'SIGN']);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in MV05 (U = xy + 2x + 3y at (6, 10))', () => {
    const p = { kind: 'utility' as const, a: 2, b: 1, c: 3, f: 0, g: 0, x: 6, y: 10 };
    expect(levelCurveSlopeIft.answer(p)).toMatchObject({ kind: 'numeric', value: -1.33 });
    expect(levelCurveSlopeIft.distractors(p).map((d) => d.value)).toEqual([1.33, -0.75, -0.67]);
    expect(levelCurveSlopeIft.stem(p)).toContain('U(x, y) = xy + 2x + 3y');
    expect(levelCurveSlopeIft.stem(p)).toContain('U(x, y) = 102');
  });
});

describe('equilibrium-price-income-response', () => {
  const excess = (m: MarketParams, I: number) => (p: number) =>
    m.a - m.b * (m.kind === 'linear' ? p : p * p) + m.c * I - (m.d + m.e * p);
  const clearing = (m: MarketParams, I: number) => bisect(excess(m, I), 0, 1000);

  it('equals the slope of the equilibrium price found by bisection', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(equilibriumPriceIncomeResponse, seed);
        expect(clearing(p, p.income)).toBeCloseTo(p.price, 8);
        const slope = numericSlope((I) => clearing(p, I), p.income, 1e-3);
        expect(Math.abs(value - slope)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('has positive prices, quantities and intercepts, and a rising price', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(equilibriumPriceIncomeResponse, seed);
        expect(value).toBeGreaterThanOrEqual(0.1);
        expect(value).toBeLessThanOrEqual(10);
        expect(p.price).toBeGreaterThan(0);
        expect(p.a).toBeGreaterThan(0);
        expect(Number.isInteger(p.a)).toBe(true);
        expect(p.d + p.e * p.price).toBeGreaterThan(0);
        // A bigger income gives a higher equilibrium price.
        expect(clearing(p, p.income + 1)).toBeGreaterThan(p.price);
        const expected = ['IGNORED_SUPPLY', 'SIGN', 'SUPPLY_SLOPE_ONLY'];
        if (p.kind === 'quadratic') expected.unshift('POWER_RULE');
        expect(codes(distractors)).toEqual(expected.sort());
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 and the linear market of the definition section', () => {
    const ex2 = {
      kind: 'quadratic' as const,
      a: 92,
      b: 0.5,
      c: 4,
      d: 12,
      e: 4,
      income: 10,
      price: 12,
      good: 'restaurant meals',
    };
    expect(equilibriumPriceIncomeResponse.answer(ex2)).toMatchObject({ value: 0.25 });
    expect(equilibriumPriceIncomeResponse.stem(ex2)).toContain('Q_D = 92 - 0.5p^2 + 4I');
    const linear = { ...ex2, kind: 'linear' as const, a: 60, b: 3, c: 2, d: 20, e: 2, income: 30 };
    expect(equilibriumPriceIncomeResponse.answer({ ...linear, price: 20 })).toMatchObject({
      value: 0.4,
    });
  });
});

describe('islm-comparative-statics-cramer', () => {
  /**
   * A linear IS–LM model with the given slopes, solved by elimination:
   * (1 − b)Y + h·r = A + G and k·Y − l·r = M.
   */
  const solveModel = (q: { b: number; h: number; k: number; l: number }, G: number, M: number) => {
    const A = 500;
    // From the money market r = (kY − M)/l; put it into the goods market.
    const Y = (A + G + (q.h * M) / q.l) / (1 - q.b + (q.h * q.k) / q.l);
    const r = (q.k * Y - M) / q.l;
    return { Y, r };
  };

  it('equals the change in Y when the linearised model is solved again', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(islmComparativeStaticsCramer, seed);
        const base = solveModel(p, 100, 200);
        const moved = p.ask === 'G' ? solveModel(p, 101, 200) : solveModel(p, 100, 201);
        expect(Math.abs(value - (moved.Y - base.Y))).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('shows crowding out and keeps readable numbers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(islmComparativeStaticsCramer, seed);
        expect(value).toBeGreaterThanOrEqual(0.2);
        expect(value).toBeLessThanOrEqual(10);
        expect(p.b).toBeGreaterThan(0);
        expect(p.b).toBeLessThan(1);
        const base = solveModel(p, 100, 200);
        if (p.ask === 'G') {
          // Spending raises the interest rate, so income rises by less than 1/(1 − b).
          expect(solveModel(p, 101, 200).r).toBeGreaterThan(base.r);
          expect(value).toBeLessThan(1 / (1 - p.b));
          expect(codes(distractors)).toEqual([
            'NOT_DIVIDED',
            'SIGN',
            'SIMPLE_MULTIPLIER',
            'WRONG_EQUATION',
          ]);
        } else {
          // More money lowers the interest rate.
          expect(solveModel(p, 100, 201).r).toBeLessThan(base.r);
          expect(codes(distractors)).toEqual(['NOT_DIVIDED', 'SIGN', 'WRONG_EQUATION']);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in MV05 (∂Y/∂G = 2, and ∂Y/∂M = 1)', () => {
    const p = { b: 0.75, h: 40, k: 0.5, l: 80, ask: 'G' as const };
    expect(islmComparativeStaticsCramer.answer(p)).toMatchObject({ value: 2 });
    expect(islmComparativeStaticsCramer.distractors(p).map((d) => d.value)).toEqual([
      -2, 1, -80, 4,
    ]);
    expect(islmComparativeStaticsCramer.answer({ ...p, ask: 'M' })).toMatchObject({ value: 1 });
  });
});
