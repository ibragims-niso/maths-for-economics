import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { groupedFrequencyMean } from './grouped-frequency-mean';
import { meanOrMedianSmallData } from './mean-or-median-small-data';
import { sampleStandardDeviation } from './sample-standard-deviation';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, stem: pr.stem };
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;

/** The median by peeling: remove the smallest and the largest value until one or two are left. */
function peelMedian(xs: number[]): number {
  const left = [...xs];
  while (left.length > 2) {
    left.splice(left.indexOf(Math.min(...left)), 1);
    left.splice(left.indexOf(Math.max(...left)), 1);
  }
  return left.length === 1 ? (left[0] ?? 0) : ((left[0] ?? 0) + (left[1] ?? 0)) / 2;
}

describe('mean-or-median-small-data', () => {
  it('gives the median found by peeling off extremes, or the point where deviations cancel', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(meanOrMedianSmallData, seed);
        if (p.ask === 'median') {
          expect(value).toBe(peelMedian(p.values));
        } else {
          // The mean is the one number the deviations add up to zero around.
          expect(p.values.reduce((s, x) => s + (x - value), 0)).toBe(0);
        }
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
      }),
      RUNS,
    );
  });

  it('draws 7–11 values in tens, unsorted, with one repeated value and one big outlier', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, stem } = solve(meanOrMedianSmallData, seed);
        const n = p.values.length;
        expect(n).toBeGreaterThanOrEqual(7);
        expect(n).toBeLessThanOrEqual(11);
        expect(p.values.every((x) => x > 0 && x % 10 === 0)).toBe(true);
        expect(new Set(p.values).size).toBe(n - 1);
        const s = [...p.values].sort((a, b) => a - b);
        expect(s.at(-1)).toBeGreaterThanOrEqual(2 * (s.at(-2) ?? 0));
        expect(p.values.some((x, i) => x !== s[i])).toBe(true);
        expect(stem).toContain(p.values.join(',\\ '));
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST101 (nine wages: mean 1250, median 980)', () => {
    const values = [940, 1100, 820, 3600, 1050, 860, 980, 900, 1000];
    const median = meanOrMedianSmallData.answer({ context: 'wages', ask: 'median', values });
    const mean = meanOrMedianSmallData.answer({ context: 'wages', ask: 'mean', values });
    expect(median).toMatchObject({ value: 980 });
    expect(mean).toMatchObject({ value: 1250 });
    const codes = meanOrMedianSmallData
      .distractors({ context: 'wages', ask: 'median', values })
      .map((d) => [d.mistakeCode, d.value]);
    // No value repeats, so there is no mode distractor here.
    expect(codes).toEqual([
      ['MEAN_NOT_MEDIAN', 1250],
      ['UNSORTED', 1050],
    ]);
  });
});

describe('grouped-frequency-mean', () => {
  it('equals the average of the list with every observation placed at its class midpoint', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(groupedFrequencyMean, seed);
        const list = p.freqs.flatMap((f, k) =>
          Array<number>(f).fill(p.start + k * p.width + p.width / 2),
        );
        const avg = list.reduce((s, x) => s + x, 0) / list.length;
        expect(Math.abs(value - avg)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        // A mean lies between the lowest and the highest midpoint.
        expect(value).toBeGreaterThan(p.start);
        expect(value).toBeLessThan(p.start + p.freqs.length * p.width);
      }),
      RUNS,
    );
  });

  it('has 4–6 classes of equal width with positive whole-number frequencies', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(groupedFrequencyMean, seed);
        expect(p.freqs.length).toBeGreaterThanOrEqual(4);
        expect(p.freqs.length).toBeLessThanOrEqual(6);
        expect(p.freqs.every((f) => Number.isInteger(f) && f >= 5)).toBe(true);
        expect(p.width).toBeGreaterThan(0);
        expect(p.start).toBeGreaterThanOrEqual(0);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in ST101 (200 households, mean 830)', () => {
    const p = { context: 'income' as const, start: 0, width: 400, freqs: [30, 80, 50, 25, 15] };
    expect(groupedFrequencyMean.answer(p)).toMatchObject({ value: 830 });
    const byCode = Object.fromEntries(
      groupedFrequencyMean.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      LOWER_LIMITS: 630,
      UNWEIGHTED_MIDPOINTS: 1000,
      DIVIDED_BY_CLASSES: 33200,
    });
  });
});

describe('sample-standard-deviation', () => {
  it('agrees with the pairwise formula s² = Σ over pairs (xᵢ − xⱼ)² / (n(n − 1))', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sampleStandardDeviation, seed);
        const scale = p.context === 'inflation' ? 0.1 : 1;
        const xs = p.units.map((u) => u * scale);
        const n = xs.length;
        let pairs = 0;
        for (let i = 0; i < n; i++)
          for (let j = i + 1; j < n; j++) pairs += ((xs[i] ?? 0) - (xs[j] ?? 0)) ** 2;
        const s = Math.sqrt(pairs / (n * (n - 1)));
        expect(Math.abs(value - s)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('draws 5–8 sensible values with an exact mean and a visible spread', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sampleStandardDeviation, seed);
        const n = p.units.length;
        expect(n).toBeGreaterThanOrEqual(5);
        expect(n).toBeLessThanOrEqual(8);
        expect(p.units.every((u) => Number.isInteger(u) && u > 0)).toBe(true);
        expect(p.units.reduce((s, u) => s + u, 0) % n).toBe(0);
        expect(value).toBeGreaterThanOrEqual(p.context === 'inflation' ? 0.5 : 2);
        if (p.context === 'inflation') expect(Math.max(...p.units)).toBeLessThanOrEqual(90);
        if (p.context === 'hours') expect(Math.max(...p.units)).toBeLessThanOrEqual(48);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST101 (inflation in six towns: s = 1.12)', () => {
    const p = { context: 'inflation' as const, units: [28, 34, 40, 46, 59, 33] };
    expect(sampleStandardDeviation.answer(p)).toMatchObject({ value: 1.12 });
    const byCode = Object.fromEntries(
      sampleStandardDeviation.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      POPULATION_DIVISOR: 1.02,
      NO_SQUARE_ROOT: 1.25,
      MEAN_ABS_DEVIATION: 0.83,
    });
  });
});
