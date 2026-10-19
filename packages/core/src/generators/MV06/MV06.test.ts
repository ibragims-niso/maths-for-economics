import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cobbDouglasHessianDeterminant } from './cobb-douglas-hessian-determinant';
import { mixedBundleUtility } from './mixed-bundle-utility';
import { quadraticConcavityDeterminant } from './quadratic-concavity-determinant';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const numericAnswer = <P>(gen: Generator<P>, p: P) => {
  const a = gen.answer(p);
  if (a.kind !== 'numeric') throw new Error('numeric expected');
  return a.value;
};

/** Numeric Hessian determinant of f at (x, y) by central differences (no use of the formulas). */
function numericDet(f: (x: number, y: number) => number, x: number, y: number, h: number) {
  const fxx = (f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h * h);
  const fyy = (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h);
  const fxy = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h);
  return { fxx, fyy, det: fxx * fyy - fxy * fxy };
}

/** f at the midpoint of a chord minus the average of f at its ends (≥ 0 on every chord ⇔ concave). */
const midpointGap = (
  f: (x: number, y: number) => number,
  [x1, y1]: readonly [number, number],
  [x2, y2]: readonly [number, number],
) => f((x1 + x2) / 2, (y1 + y2) / 2) - (f(x1, y1) + f(x2, y2)) / 2;

describe('quadratic-concavity-determinant', () => {
  it('equals the determinant of the numeric Hessian, and the chords agree with the verdict', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(quadraticConcavityDeterminant, seed);
        const f = (x: number, y: number) =>
          p.p * x + p.q * y + p.a * x * x + p.b * x * y + p.c * y * y;
        const h = numericDet(f, 3, -2, 0.5);
        expect(h.det).toBeCloseTo(value, 6);
        expect(Number.isInteger(value)).toBe(true);
        // Midpoint gaps along chords in many directions: their signs reveal the shape.
        const gaps = Array.from({ length: 36 }, (_, i) => {
          const t = (i * Math.PI) / 36;
          return midpointGap(f, [1, 1], [1 + 4 * Math.cos(t), 1 + 4 * Math.sin(t)]);
        });
        if (value >= 0 && h.fxx < 0) for (const g of gaps) expect(g).toBeGreaterThanOrEqual(-1e-9);
        if (value >= 0 && h.fxx > 0) for (const g of gaps) expect(g).toBeLessThanOrEqual(1e-9);
        if (value < 0) {
          expect(Math.max(...gaps)).toBeGreaterThan(0);
          expect(Math.min(...gaps)).toBeLessThan(0);
        }
      }),
      RUNS,
    );
  });

  it('reproduces MV06 Example 1 (D = 7, concave)', () => {
    const p = { p: 20, q: 30, a: -1, b: -1, c: -2 };
    expect(numericAnswer(quadraticConcavityDeterminant, p)).toBe(7);
    const f = (x: number, y: number) => 20 * x + 30 * y - x * x - x * y - 2 * y * y;
    expect([f(2, 2), f(6, 4), f(4, 3)]).toEqual([84, 148, 124]);
    expect(midpointGap(f, [2, 2], [6, 4])).toBe(8);
  });
});

describe('mixed-bundle-utility', () => {
  it('the mix lies on the segment from A to B and beats both ends', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(mixedBundleUtility, seed);
        expect(p.x1 * p.y1).toBe(p.x2 * p.y2);
        expect(p.x1).toBeLessThan(p.x2);
        expect(Math.min(p.x1, p.y1, p.x2, p.y2)).toBeGreaterThan(0);
        // Walk from B towards A in steps of 1/4 and pick the point with the stated weight.
        const t = p.tq / 4;
        const path = [0, 0.25, 0.5, 0.75, 1].map(
          (s) => [p.x2 + s * (p.x1 - p.x2), p.y2 + s * (p.y1 - p.y2)] as const,
        );
        const [x, y] = path[p.tq] ?? [0, 0];
        expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
        expect(value).toBe(x * y);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(p.x1 * p.y1);
        // Quasiconcavity: every point of the segment is at least as good as the ends.
        for (let s = 0; s <= 1; s += 0.05) {
          const u = (p.x2 + s * (p.x1 - p.x2)) * (p.y2 + s * (p.y1 - p.y2));
          expect(u).toBeGreaterThanOrEqual(p.x1 * p.y1 - 1e-9);
        }
        expect(t).toBeGreaterThan(0);
        expect(t).toBeLessThan(1);
      }),
      RUNS,
    );
  });

  it('reproduces MV06 Example 3 (A = (2, 8), B = (8, 2), C = (5, 5), U = 25)', () => {
    const p = { x1: 2, y1: 8, x2: 8, y2: 2, tq: 2 as const };
    expect(numericAnswer(mixedBundleUtility, p)).toBe(25);
    expect(mixedBundleUtility.distractors(p)).toContainEqual({
      value: 16,
      mistakeCode: 'AVERAGED_UTILITIES',
    });
  });
});

describe('cobb-douglas-hessian-determinant', () => {
  it('matches the numeric Hessian at (1, 1), and its sign matches concavity along chords', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(cobbDouglasHessianDeterminant, seed);
        const a = p.ia / 10;
        const b = p.ib / 10;
        const A = p.A;
        const f = (K: number, L: number) => A * K ** a * L ** b;
        const h = numericDet(f, 1, 1, 1e-3);
        expect(Math.abs(h.det - value)).toBeLessThan(0.006);
        expect(h.fxx).toBeLessThan(0);
        expect(Math.round(value * 100)).toBeCloseTo(value * 100, 9);
        // Along the ray K = L the function is A·t^(a+b): concave chords iff a + b ≤ 1.
        const gap = midpointGap(f, [1, 1], [9, 9]);
        if (p.ia + p.ib < 10) {
          expect(value).toBeGreaterThan(0);
          for (const [P, Q] of [
            [
              [1, 1],
              [9, 9],
            ],
            [
              [1, 8],
              [6, 2],
            ],
            [
              [0.5, 3],
              [7, 7],
            ],
          ] as const)
            expect(midpointGap(f, P, Q)).toBeGreaterThan(0);
        } else if (p.ia + p.ib > 10) {
          expect(value).toBeLessThan(0);
          expect(gap).toBeLessThan(0);
        } else {
          expect(value).toBe(0);
          expect(Math.abs(gap)).toBeLessThan(1e-9);
        }
      }),
      RUNS,
    );
  });

  it('reproduces MV06 Example 2 (Q = 10K^0.3 L^0.5: D = 3; with b = 0.8: D = −2.4)', () => {
    expect(numericAnswer(cobbDouglasHessianDeterminant, { A: 10, ia: 3, ib: 5 })).toBeCloseTo(
      3,
      12,
    );
    expect(numericAnswer(cobbDouglasHessianDeterminant, { A: 10, ia: 3, ib: 8 })).toBeCloseTo(
      -2.4,
      12,
    );
    const codes = cobbDouglasHessianDeterminant.distractors({ A: 10, ia: 3, ib: 5 });
    expect(codes).toContainEqual({ value: 7.5, mistakeCode: 'HESSIAN_ADDED' });
    expect(codes).toContainEqual({ value: 5.25, mistakeCode: 'IGNORED_CROSS_TERM' });
  });
});
