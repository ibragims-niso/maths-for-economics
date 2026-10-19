import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { arcLengthThreeHalvesPower } from './arc-length-three-halves-power';
import { linearXY, lineIntegralWorkSegment } from './line-integral-work-segment';
import { volumeOfRevolutionDisc } from './volume-of-revolution-disc';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

/** Has at most `d` decimal places. */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('volume-of-revolution-disc', () => {
  it('equals the sum of many thin discs π·r²·Δx (midpoint radii)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(volumeOfRevolutionDisc, seed);
        const f = (x: number) => (p.shape === 'root' ? p.k * Math.sqrt(x) : p.k * x);
        const n = 4000;
        const h = p.b / n;
        let sum = 0;
        for (let i = 0; i < n; i++) sum += Math.PI * f((i + 0.5) * h) ** 2 * h;
        expect(Math.abs(value - sum)).toBeLessThan(0.006 + sum * 1e-6);
      }),
      RUNS,
    );
  });

  it('is positive with 2 decimals, and the distractors follow their mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(volumeOfRevolutionDisc, seed);
        expect(value).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(p.b >= 1 && p.k > 0).toBe(true);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        expect(byCode.NO_PI).toBeCloseTo(value / Math.PI, 1);
        expect(byCode.TWO_PI).toBeCloseTo(2 * value, 1);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C118 (y = 2√x, 0 ≤ x ≤ 4: V = 32π = 100.53)', () => {
    const p = { shape: 'root' as const, k: 2, b: 4 };
    expect(volumeOfRevolutionDisc.answer(p)).toMatchObject({ value: 100.53 });
    const codes = Object.fromEntries(
      volumeOfRevolutionDisc.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(codes).toEqual({ NO_PI: 32, NOT_SQUARED: 33.51, TWO_PI: 201.06 });
  });
});

describe('arc-length-three-halves-power', () => {
  it('equals the length of a fine polyline along the curve', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(arcLengthThreeHalvesPower, seed);
        const f = (x: number) => ((2 * p.m) / 3) * x ** 1.5;
        const n = 4000;
        const h = (p.b - p.a) / n;
        let length = 0;
        for (let i = 0; i < n; i++) {
          const x0 = p.a + i * h;
          length += Math.hypot(h, f(x0 + h) - f(x0));
        }
        expect(Math.abs(value - length)).toBeLessThan(0.006);
      }),
      RUNS,
    );
  });

  it('is longer than the straight chord, has 2 decimals and readable end points', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(arcLengthThreeHalvesPower, seed);
        const f = (x: number) => ((2 * p.m) / 3) * x ** 1.5;
        expect(value).toBeGreaterThanOrEqual(Math.hypot(p.b - p.a, f(p.b) - f(p.a)) - 0.005);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(Number.isInteger(p.a) && Number.isInteger(p.b) && p.a >= 0 && p.b > p.a).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
        // Leaving out the 1/m² factor only matters when m > 1.
        if (p.m === 1) {
          expect(distractors.map((d) => d.mistakeCode)).not.toContain('SUBSTITUTION_FACTOR');
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C118 (y = (2/3)x^(3/2), 0 ≤ x ≤ 3: L = 14/3 = 4.67)', () => {
    const p = { m: 1 as const, a: 0, b: 3 };
    expect(arcLengthThreeHalvesPower.answer(p)).toMatchObject({ value: 4.67 });
    const chord = arcLengthThreeHalvesPower
      .distractors(p)
      .find((d) => d.mistakeCode === 'CHORD_ONLY');
    expect(chord?.value).toBe(4.58);
  });
});

describe('line-integral-work-segment', () => {
  it('matches a numerical integral of F·r′(t) along the segment', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lineIntegralWorkSegment, seed);
        const n = 2000;
        let sum = 0;
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n;
          const x = p.ax + t * (p.bx - p.ax);
          const y = p.ay + t * (p.by - p.ay);
          const P = p.p1 * x + p.p2 * y;
          const Q = p.q1 * x + p.q2 * y;
          sum += (P * (p.bx - p.ax) + Q * (p.by - p.ay)) / n;
        }
        expect(Math.abs(value - sum)).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('equals φ(B) − φ(A) when the field has a potential φ (p2 = q1)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(lineIntegralWorkSegment, seed);
        if (p.p2 !== p.q1) return;
        const phi = (x: number, y: number) =>
          (p.p1 * x * x) / 2 + p.p2 * x * y + (p.q2 * y * y) / 2;
        expect(value).toBeCloseTo(phi(p.bx, p.by) - phi(p.ax, p.ay), 9);
      }),
      RUNS,
    );
  });

  it('has a non-zero answer in halves; reversing the path flips the sign', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(lineIntegralWorkSegment, seed);
        expect(value).not.toBe(0);
        expect(hasDecimals(value, 1)).toBe(true);
        expect(Math.abs(value)).toBeLessThanOrEqual(400);
        const reversed = { ...p, ax: p.bx, ay: p.by, bx: p.ax, by: p.ay };
        const back = lineIntegralWorkSegment.answer(reversed);
        expect(back.kind === 'numeric' && back.value).toBe(-value);
        expect(distractors.find((d) => d.mistakeCode === 'REVERSED_PATH')?.value).toBe(-value);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in C118 (F = (y, x) from (0, 0) to (6, 8): W = 48)', () => {
    const p = { p1: 0, p2: 1, q1: 1, q2: 0, ax: 0, ay: 0, bx: 6, by: 8 };
    expect(lineIntegralWorkSegment.answer(p)).toMatchObject({ value: 48 });
    expect(linearXY(0, 1)).toBe('y');
    expect(linearXY(-1, 2)).toBe('-x + 2y');
    expect(linearXY(3, -1)).toBe('3x - y');
  });
});
