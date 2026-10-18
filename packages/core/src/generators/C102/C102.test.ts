import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { costAverageRateOfChange } from './cost-average-rate-of-change';
import { instantaneousRateQuadratic } from './instantaneous-rate-quadratic';
import { tangentLineIntercept } from './tangent-line-intercept';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** Central-difference estimate of f′(x): a numerical route, independent of any formula. */
const numericSlope = (f: (x: number) => number, x: number, h = 1e-4) =>
  (f(x + h) - f(x - h)) / (2 * h);

describe('cost-average-rate-of-change', () => {
  it('equals the extra cost added unit by unit, divided by the number of extra units', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costAverageRateOfChange, seed);
        const C = (q: number) => p.fixedCost + p.unitCost * q + p.b * q * q;
        let extra = 0;
        for (let q = p.q1; q < p.q2; q++) extra += C(q + 1) - C(q);
        expect(Math.abs(value - extra / (p.q2 - p.q1))).toBeLessThan(1e-9);
      }),
      RUNS,
    );
  });

  it('for a quadratic, equals the slope of the tangent at the midpoint of the interval', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(costAverageRateOfChange, seed);
        const C = (q: number) => p.fixedCost + p.unitCost * q + p.b * q * q;
        expect(Math.abs(value - numericSlope(C, (p.q1 + p.q2) / 2))).toBeLessThan(1e-4);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: positive costs and outputs, a rising rate, at most 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(costAverageRateOfChange, seed);
        expect(p.q1).toBeGreaterThan(0);
        expect(p.q2 - p.q1).toBeGreaterThanOrEqual(2);
        expect(p.fixedCost).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(p.unitCost);
        expect(twoDecimals(value)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in C102 (C = 200 + 10Q + Q², from 10 to 20)', () => {
    const p = { fixedCost: 200, unitCost: 10, b: 1, q1: 10, q2: 20 };
    expect(costAverageRateOfChange.answer(p)).toMatchObject({ kind: 'numeric', value: 40 });
  });
});

describe('instantaneous-rate-quadratic', () => {
  it('matches the numerical slope, and secant slopes approach it as h shrinks', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(instantaneousRateQuadratic, seed);
        const f = (x: number) => p.c + p.b * x + p.a * x * x;
        expect(Math.abs(value - numericSlope(f, p.x0))).toBeLessThan(1e-4);
        const gaps = [1, 0.1, 0.01].map((h) => Math.abs((f(p.x0 + h) - f(p.x0)) / h - value));
        expect(gaps[1]).toBeLessThan(gaps[0] as number);
        expect(gaps[2]).toBeLessThan(gaps[1] as number);
        expect(gaps[2]).toBeLessThan(0.05);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers: rising cost, revenue and GDP at the point, at most 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(instantaneousRateQuadratic, seed);
        const f = (x: number) => p.c + p.b * x + p.a * x * x;
        expect(p.x0).toBeGreaterThan(0);
        expect(f(p.x0)).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(0);
        expect(twoDecimals(value)).toBe(true);
        if (p.context === 'revenue') expect(p.a).toBeLessThan(0);
        else expect(p.a).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C102 (C = 200 + 10Q + Q² at Q = 10)', () => {
    const p = { context: 'cost', a: 1, b: 10, c: 200, x0: 10 } as const;
    expect(instantaneousRateQuadratic.answer(p)).toMatchObject({ kind: 'numeric', value: 30 });
  });
});

describe('tangent-line-intercept', () => {
  it('gives a line that touches the cost curve at Q₀ and stays below it elsewhere', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(tangentLineIntercept, seed);
        const C = (q: number) => p.fixedCost + p.unitCost * q + p.b * q * q;
        const m = numericSlope(C, p.q0);
        const line = (q: number) => value + m * q;
        expect(Math.abs(line(p.q0) - C(p.q0))).toBeLessThan(0.01);
        // A convex cost curve lies above each of its tangent lines.
        for (const q of [0, p.q0 / 2, p.q0 + 1, 2 * p.q0]) {
          expect(C(q) - line(q)).toBeGreaterThan(-0.01);
        }
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in C102 (tangent y = 30Q + 100)', () => {
    const p = { fixedCost: 200, unitCost: 10, b: 1, q0: 10 };
    expect(tangentLineIntercept.answer(p)).toMatchObject({ kind: 'numeric', value: 100 });
  });
});
