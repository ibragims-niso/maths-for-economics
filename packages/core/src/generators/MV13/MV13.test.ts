import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { jointDensityRectangleProbability } from './joint-density-rectangle-probability';
import { rectangleLinearDensityTotal } from './rectangle-linear-density-total';
import { triangleRegionTotal } from './triangle-region-total';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most `d` decimal places. */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Composite Simpson's rule with `n` (even) intervals. */
function simpson(f: (x: number) => number, lo: number, hi: number, n = 100): number {
  const h = (hi - lo) / n;
  let s = f(lo) + f(hi);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(lo + i * h);
  return (s * h) / 3;
}

/** Iterated integral ∫ from x0 to x1 of ∫ from y0(x) to y1(x) of f(x, y) dy dx, by Simpson's rule. */
const iterated = (
  f: (x: number, y: number) => number,
  x0: number,
  x1: number,
  y0: (x: number) => number,
  y1: (x: number) => number,
) => simpson((x) => simpson((y) => f(x, y), y0(x), y1(x)), x0, x1);

/** A Riemann sum over an n × n grid of cells, f taken at each cell centre. */
function midpointSum(f: (x: number, y: number) => number, a: number, b: number, n: number) {
  let s = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++)
      s += f(((i + 0.5) * a) / n, ((j + 0.5) * b) / n) * (a / n) * (b / n);
  }
  return s;
}

describe('rectangle-linear-density-total', () => {
  it('equals a Riemann sum over small rectangles, in either order of integration', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(rectangleLinearDensityTotal, seed);
        const f = (x: number, y: number) => p.c + p.d * x + p.e * y;
        // The midpoint sum is exact for a linear density, on any grid.
        expect(Math.abs(midpointSum(f, p.a, p.b, 7) - value)).toBeLessThan(1e-6);
        // dx dy order (Fubini): integrate in x first.
        const dxdy = simpson((y) => simpson((x) => f(x, y), 0, p.a), 0, p.b);
        expect(Math.abs(dxdy - value)).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('has whole, positive totals and readable parameters', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(rectangleLinearDensityTotal, seed);
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(p.a).not.toBe(p.b);
        expect(p.d).not.toBe(p.e);
        for (const d of distractors) expect(Number.isInteger(d.value * 2)).toBe(true);
        expect(distractors.length).toBe(3);
        // POWER_NOT_DIVIDED is the far-corner density times the area.
        const corner = distractors.find((d) => d.mistakeCode === 'POWER_NOT_DIVIDED');
        expect(corner?.value).toBe((p.c + p.d * p.a + p.e * p.b) * p.a * p.b);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in MV13 (3 + x + 2y over [0, 4] × [0, 2] is 56)', () => {
    const p = { context: 'population' as const, a: 4, b: 2, c: 3, d: 1, e: 2 };
    const answer = rectangleLinearDensityTotal.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(56);
    expect(rectangleLinearDensityTotal.distractors(p)).toEqual([
      { value: 88, mistakeCode: 'POWER_NOT_DIVIDED' },
      { value: 64, mistakeCode: 'LIMITS_SWAPPED' },
      { value: 48, mistakeCode: 'CONSTANT_NOT_INTEGRATED' },
    ]);
  });
});

describe('joint-density-rectangle-probability', () => {
  it('normalises the density numerically and integrates it over the rectangle', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(jointDensityRectangleProbability, seed);
        const shape = (x: number, y: number) => x ** p.m * y ** p.n;
        const k =
          1 /
          iterated(
            shape,
            0,
            1,
            () => 0,
            () => 1,
          );
        const prob =
          k *
          iterated(
            shape,
            0,
            p.p,
            () => 0,
            () => p.q,
          );
        expect(Math.abs(prob - value)).toBeLessThanOrEqual(0.00005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('is a probability with 4 decimals, at least 0.01, below the area p·q', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(jointDensityRectangleProbability, seed);
        expect(hasDecimals(value, 4)).toBe(true);
        expect(value >= 0.01 && value < 1).toBe(true);
        expect(value).toBeLessThan(p.p * p.q);
        for (const d of distractors) expect(d.value > 0 && d.value < 1).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in MV13 (6x²y: P(X ≤ 0.5, Y ≤ 0.5) = 1/32)', () => {
    const p = { m: 2, n: 1, p: 0.5, q: 0.5 };
    const answer = jointDensityRectangleProbability.answer(p);
    expect(answer.kind === 'numeric' && Math.abs(answer.value - 1 / 32)).toBeLessThan(0.0001);
    const k = jointDensityRectangleProbability.steps(p)[0]?.result;
    expect(k).toBe(6);
  });
});

describe('triangle-region-total', () => {
  it('matches numerical integration over the triangle in both orders', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(triangleRegionTotal, seed);
        const f = (x: number, y: number) => p.c * x ** p.m * y ** p.n;
        const dydx = iterated(
          f,
          0,
          p.a,
          () => 0,
          (x) => x,
        );
        // Order changed: y from 0 to a, and for each y, x from y to a.
        const dxdy = simpson((y) => simpson((x) => f(x, y), y, p.a), 0, p.a);
        expect(Math.abs(dydx - value)).toBeLessThan(1e-6 * Math.max(1, value));
        expect(Math.abs(dxdy - value)).toBeLessThan(1e-6 * Math.max(1, value));
      }),
      RUNS,
    );
  });

  it('is below the square total, positive, readable, with the triangle mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(triangleRegionTotal, seed);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(value >= 0.5 && value <= 2000).toBe(true);
        const square = (p.c * p.a ** (p.m + p.n + 2)) / ((p.m + 1) * (p.n + 1));
        expect(value).toBeLessThan(square);
        // The two triangles together make the square.
        const other = distractors.find((d) => d.mistakeCode === 'OTHER_TRIANGLE');
        if (other) expect(Math.abs(other.value + value - square)).toBeLessThan(0.011);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in MV13 (6x²y over 0 ≤ y ≤ x ≤ 1 is 0.6)', () => {
    const p = { a: 1, c: 6, m: 2, n: 1 };
    const answer = triangleRegionTotal.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBeCloseTo(0.6, 10);
    const codes = Object.fromEntries(
      triangleRegionTotal.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes.RECTANGLE_LIMITS).toBe(1);
    expect(codes.OTHER_TRIANGLE).toBe(0.4);
  });
});
