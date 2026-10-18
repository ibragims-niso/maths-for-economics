import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import { bundleAngleCosine } from './bundle-angle-cosine';
import { bundleCostDotProduct } from './bundle-cost-dot-product';
import { bundleDistanceNorm } from './bundle-distance-norm';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

const decimalsAtMost = (x: number, d: number) =>
  Math.abs(Math.round(x * 10 ** d) - x * 10 ** d) < 1e-6;

describe('bundle-cost-dot-product', () => {
  it('equals the till total when every unit is rung up one at a time', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(bundleCostDotProduct, seed);
        const total = numericValue(answer);
        let till = 0;
        p.prices.forEach((price, i) => {
          for (let unit = 0; unit < (p.quantities[i] ?? 0); unit++) till += price;
        });
        expect(total).toBe(till);
        expect([3, 4]).toContain(p.prices.length);
        expect(p.quantities.length).toBe(p.prices.length);
        for (const x of [...p.prices, ...p.quantities]) {
          expect(Number.isInteger(x) && x >= 1).toBe(true);
        }
        expect(Math.max(...p.prices)).toBeLessThanOrEqual(25);
        expect(Math.max(...p.quantities)).toBeLessThanOrEqual(12);
        expect(distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA101: p = (2, 5, 3), x = (4, 1, 6) costs 31', () => {
    const p = { basket: 0, prices: [2, 5, 3], quantities: [4, 1, 6] };
    expect(numericValue(bundleCostDotProduct.answer(p))).toBe(31);
    expect(bundleCostDotProduct.distractors(p).map((d) => d.value)).toEqual([110, 13, 21]);
    expect(bundleCostDotProduct.stem(p)).toContain('bread, cheese and apples');
  });
});

describe('bundle-distance-norm', () => {
  it('agrees with Math.hypot of the difference and lies between the largest gap and the sum of gaps', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer } = makeProblem(bundleDistanceNorm, seed);
        const d = numericValue(answer);
        const gaps = p.a.map((ai, i) => Math.abs(ai - (p.b[i] ?? 0)));
        expect(Math.abs(d - Math.hypot(...gaps))).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(d).toBeGreaterThanOrEqual(Math.max(...gaps) - 0.005);
        expect(d).toBeLessThanOrEqual(gaps.reduce((s, g) => s + g, 0) + 0.005);
        expect(decimalsAtMost(d, 2)).toBe(true);
        expect([2, 3]).toContain(p.a.length);
        expect(p.b.length).toBe(p.a.length);
        for (const x of [...p.a, ...p.b])
          expect(Number.isInteger(x) && x >= 0 && x <= 12).toBe(true);
        expect(gaps.filter((g) => g > 0).length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA101: a = (4, 1, 6), b = (2, 3, 5) are 3 apart', () => {
    const p = { a: [4, 1, 6], b: [2, 3, 5] };
    expect(numericValue(bundleDistanceNorm.answer(p))).toBe(3);
    expect(bundleDistanceNorm.steps(p)[1]?.result).toBe(9);
  });
});

describe('bundle-angle-cosine', () => {
  it('agrees with the law of cosines on the triangle formed by a, b and a − b', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer } = makeProblem(bundleAngleCosine, seed);
        const c = numericValue(answer);
        const sq = (xs: number[]) => xs.reduce((s, x) => s + x * x, 0);
        const la = Math.sqrt(sq(p.a));
        const lb = Math.sqrt(sq(p.b));
        const lab = Math.sqrt(sq(p.a.map((ai, i) => ai - (p.b[i] ?? 0))));
        const lawOfCosines = (la ** 2 + lb ** 2 - lab ** 2) / (2 * la * lb);
        expect(Math.abs(c - lawOfCosines)).toBeLessThanOrEqual(0.0005 + 1e-9);
        // Bundles with positive entries meet at an acute angle, but are never parallel here.
        expect(c).toBeGreaterThan(0);
        expect(c).toBeLessThan(1);
        expect(decimalsAtMost(c, 3)).toBe(true);
        expect(p.a).toHaveLength(3);
        expect(p.b).toHaveLength(3);
        for (const x of [...p.a, ...p.b])
          expect(Number.isInteger(x) && x >= 1 && x <= 9).toBe(true);
      }),
      RUNS,
    );
  });

  it('gives cos θ = 22/27 for a = (2, 1, 2) and b = (1, 4, 8)', () => {
    const p = { a: [2, 1, 2], b: [1, 4, 8] };
    expect(numericValue(bundleAngleCosine.answer(p))).toBe(0.815);
    const steps = bundleAngleCosine.steps(p);
    expect(steps.map((s) => s.result)).toEqual([22, 3, 9, 0.815]);
  });
});
