import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { levelCurveThroughPoint } from './level-curve-through-point';
import { sameIndifferenceCurveQuantity } from './same-indifference-curve-quantity';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

describe('level-curve-through-point', () => {
  it('equals A·u^α·v^β computed with real powers, and the point lies on that level curve', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(levelCurveThroughPoint, seed);
        const alpha = p.aNum / p.aDen;
        const beta = p.bNum / p.bDen;
        const u = p.firstRoot ** p.aDen;
        const v = p.secondRoot ** p.bDen;
        const f = (s: number, t: number) => p.A * s ** alpha * t ** beta;
        expect(Math.abs(value - f(u, v))).toBeLessThan(1e-6);
        // Walking along the curve f = c: at the first input u, the second input must be v.
        const vOnCurve = (value / (p.A * u ** alpha)) ** (1 / beta);
        expect(Math.abs(vOnCurve - v)).toBeLessThan(1e-6);
        // A point with more of the second input lies on a higher curve.
        expect(f(u, v + 1)).toBeGreaterThan(value);
      }),
      RUNS,
    );
  });

  it('has whole, readable numbers and the distractors described in the topic', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(levelCurveThroughPoint, seed);
        const u = p.firstRoot ** p.aDen;
        const v = p.secondRoot ** p.bDen;
        expect(Number.isInteger(value) && value > 0).toBe(true);
        expect(u >= 4 && u <= 256 && v >= 4 && v <= 256 && u !== v).toBe(true);
        expect(p.A >= 2 && p.A <= 12).toBe(true);
        // Each distractor that survives de-duplication is the value its mistake gives.
        const expected: Record<string, number> = {
          FORGOT_COEFFICIENT: value / p.A,
          ADDED_NOT_MULTIPLIED: p.A * (u ** (p.aNum / p.aDen) + v ** (p.bNum / p.bDen)),
          EXPONENTS_SWAPPED: p.A * u ** (p.bNum / p.bDen) * v ** (p.aNum / p.aDen),
        };
        for (const d of distractors) {
          expect(Math.abs(d.value - (expected[d.mistakeCode] ?? Number.NaN))).toBeLessThan(0.006);
        }
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in MV01 (Q = 10K^(1/2)L^(1/2) at K = 16, L = 25 is 200)', () => {
    const p = {
      context: 'production' as const,
      A: 10,
      aNum: 1,
      aDen: 2,
      bNum: 1,
      bDen: 2,
      firstRoot: 4,
      secondRoot: 5,
    };
    const answer = levelCurveThroughPoint.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(200);
  });
});

describe('same-indifference-curve-quantity', () => {
  it('is the only whole y that gives bundle B the utility of bundle A (brute-force search)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sameIndifferenceCurveQuantity, seed);
        const U = (x: number, y: number) => x ** p.a * y ** p.b;
        const target = U(p.x1, p.y1);
        const hits: number[] = [];
        for (let y = 1; y <= 2000; y++) if (U(p.x0, y) === target) hits.push(y);
        expect(hits).toEqual([value]);
      }),
      RUNS,
    );
  });

  it('trades the goods off: less food needs more clothing; numbers stay readable', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(sameIndifferenceCurveQuantity, seed);
        for (const n of [p.x1, p.y1, p.x0, value]) {
          expect(Number.isInteger(n) && n >= 2 && n <= 120).toBe(true);
        }
        expect(p.x0).not.toBe(p.x1);
        expect(p.x0 < p.x1).toBe(value > p.y1);
        expect(p.x1 ** p.a * p.y1 ** p.b).toBeLessThanOrEqual(20000);
        const byCode = Object.fromEntries(distractors.map((d) => [d.mistakeCode, d.value]));
        if (p.b === 2 && 'POWER_NOT_UNDONE' in byCode) {
          expect(byCode.POWER_NOT_UNDONE).toBe(value * value);
        }
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in MV01 (U = xy, A = (4, 10), B has x = 8, so y = 5)', () => {
    const p = { a: 1, b: 1, x1: 4, y1: 10, x0: 8, y0: 5 };
    const answer = sameIndifferenceCurveQuantity.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(5);
    const codes = sameIndifferenceCurveQuantity.distractors(p);
    expect(codes).toEqual([
      { value: 32, mistakeCode: 'SUBTRACTED_NOT_DIVIDED' },
      { value: 20, mistakeCode: 'WRONG_DIRECTION' },
    ]);
  });
});
