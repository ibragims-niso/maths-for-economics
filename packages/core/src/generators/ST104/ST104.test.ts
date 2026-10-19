import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { binomialCountProbability } from './binomial-count-probability';
import { poissonApproximationDefaults } from './poisson-approximation-defaults';
import { poissonArrivalsProbability } from './poisson-arrivals-probability';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** The Poisson probabilities P(0), …, P(top), built up by P(k) = P(k − 1)·λ/k (no factorials). */
function poissonByRecursion(lambda: number, top: number): number[] {
  const out = [Math.exp(-lambda)];
  for (let k = 1; k <= top; k++) out.push(((out[k - 1] ?? 0) * lambda) / k);
  return out;
}

const byCode = (ds: { value: number; mistakeCode: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

describe('binomial-count-probability', () => {
  it('matches adding up every success/failure sequence of the n trials one by one', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(binomialCountProbability, seed);
        const prob = p.pct / 100;
        // Brute force: each of the 2ⁿ sequences, its probability, and its number of successes.
        let total = 0;
        let wanted = 0;
        for (let mask = 0; mask < 2 ** p.n; mask++) {
          let successes = 0;
          let pr = 1;
          for (let t = 0; t < p.n; t++) {
            const success = (mask >> t) & 1;
            successes += success;
            pr *= success ? prob : 1 - prob;
          }
          total += pr;
          const counts =
            p.mode === 'exact'
              ? successes === p.k
              : p.mode === 'atMost'
                ? successes <= p.k
                : successes >= p.k;
          if (counts) wanted += pr;
        }
        expect(total).toBeCloseTo(1, 12);
        expect(Math.abs(value - wanted)).toBeLessThanOrEqual(0.00005 + 1e-12);
      }),
      RUNS,
    );
  });

  it('keeps the numbers small and realistic and the answer a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(binomialCountProbability, seed);
        expect(p.n).toBeGreaterThanOrEqual(4);
        expect(p.n).toBeLessThanOrEqual(10);
        expect(p.pct).toBeGreaterThan(0);
        expect(p.pct).toBeLessThan(100);
        expect(p.pct).not.toBe(50);
        expect(p.k).toBeGreaterThanOrEqual(1);
        expect(p.k).toBeLessThan(p.n);
        expect(value).toBeGreaterThanOrEqual(0.01);
        expect(value).toBeLessThanOrEqual(0.99);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST104 (8 loans, p = 0.1)', () => {
    const exact = { n: 8, pct: 10, k: 2, mode: 'exact', context: 'loans' } as const;
    expect(binomialCountProbability.answer(exact)).toMatchObject({ value: 0.1488 });
    expect(byCode(binomialCountProbability.distractors(exact))).toEqual({
      // SWAPPED_P, 28 × 0.9² × 0.1⁶, rounds to 0 and is dropped.
      NO_COMBINATION: 0.0053,
    });
  });

  it('reproduces the cumulative parts of worked example 1 (at most 1, at least 1)', () => {
    const atMost = { n: 8, pct: 10, k: 1, mode: 'atMost', context: 'loans' } as const;
    const atLeast = { n: 8, pct: 10, k: 1, mode: 'atLeast', context: 'loans' } as const;
    expect(binomialCountProbability.answer(atMost)).toMatchObject({ value: 0.8131 });
    expect(binomialCountProbability.answer(atLeast)).toMatchObject({ value: 0.5695 });
    expect(byCode(binomialCountProbability.distractors(atMost))).toMatchObject({
      BOUNDARY: 0.4305,
      EXACT_ONLY: 0.3826,
    });
    expect(byCode(binomialCountProbability.distractors(atLeast))).toMatchObject({
      NOT_COMPLEMENT: 0.4305,
      BOUNDARY: 0.1869,
    });
  });
});

describe('poisson-arrivals-probability', () => {
  /** λ read back from the wording of the question: rate × length of the period in the rate's unit. */
  function lambdaFromStem(stem: string): number {
    const rate = Number(/average (?:rate of )?\$([\d.]+)\$/.exec(stem)?.[1]);
    const minutes = /a (\d+)-minute period/.exec(stem);
    if (minutes) return (rate * Number(minutes[1])) / 60;
    const metres = /a \$(\d+)\$-metre length/.exec(stem);
    if (metres) return (rate * Number(metres[1])) / 100;
    if (stem.includes('in half a month')) return rate * 0.5;
    if (stem.includes('in two months')) return rate * 2;
    if (stem.includes('in a quarter (three months)')) return rate * 3;
    throw new Error(`no period in: ${stem}`);
  }

  it('matches the Poisson terms built by recursion, with λ read from the question', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, stem } = solve(poissonArrivalsProbability, seed);
        const lambda = lambdaFromStem(stem);
        const terms = poissonByRecursion(lambda, 80);
        expect(terms.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 10);
        const target =
          p.mode === 'exact' ? (terms[p.k] ?? Number.NaN) : terms.slice(1).reduce((s, x) => s + x);
        expect(Math.abs(value - target)).toBeLessThanOrEqual(0.00005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('rescales to a readable λ and gives a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(poissonArrivalsProbability, seed);
        const lambda = lambdaFromStem(stem);
        expect(lambda).not.toBeCloseTo(p.rate, 9);
        expect(lambda).toBeGreaterThanOrEqual(0.5);
        expect(lambda).toBeLessThanOrEqual(8);
        expect(hasAtMostDecimals(lambda, 1)).toBe(true);
        if (p.mode === 'exact') expect(p.k).toBeGreaterThanOrEqual(2);
        expect(value).toBeGreaterThanOrEqual(0.01);
        expect(value).toBeLessThan(1);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in ST104 (12 customers an hour)', () => {
    const four = { context: 'bank', rate: 12, period: 4, mode: 'exact', k: 4 } as const;
    expect(poissonArrivalsProbability.stem(four)).toContain('a 20-minute period');
    expect(poissonArrivalsProbability.answer(four)).toMatchObject({ value: 0.1954 });
    expect(byCode(poissonArrivalsProbability.distractors(four))).toEqual({
      RATE_NOT_SCALED: 0.0053,
      NO_EXP: 10.6667,
      NO_FACTORIAL: 4.6888,
    });
    const any = { context: 'bank', rate: 12, period: 0, mode: 'atLeastOne', k: 2 } as const;
    expect(poissonArrivalsProbability.stem(any)).toContain('a 5-minute period');
    expect(poissonArrivalsProbability.answer(any)).toMatchObject({ value: 0.6321 });
    expect(byCode(poissonArrivalsProbability.distractors(any))).toEqual({
      RATE_NOT_SCALED: 1,
      // With λ = 1, P(X = 1) = P(X = 0), so EXACT_ONLY duplicates NOT_COMPLEMENT and is dropped.
      NOT_COMPLEMENT: 0.3679,
    });
  });
});

describe('poisson-approximation-defaults', () => {
  /** The exact binomial P(X > k), each term built from the previous one by the ratio (n − j)p/((j + 1)q). */
  function binomialTailByRatio(n: number, prob: number, k: number): number {
    let t = (1 - prob) ** n;
    let below = 0;
    for (let j = 0; j <= k; j++) {
      below += t;
      t *= ((n - j) / (j + 1)) * (prob / (1 - prob));
    }
    return 1 - below;
  }

  it('equals 1 minus the recursive Poisson terms up to k, and is close to the exact binomial', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(poissonApproximationDefaults, seed);
        const terms = poissonByRecursion(p.n * (p.lambda / p.n), p.k);
        const tail = 1 - terms.reduce((s, x) => s + x, 0);
        expect(Math.abs(value - tail)).toBeLessThanOrEqual(0.00005 + 1e-12);
        // The approximation is good: the steps promise agreement up to the third decimal place.
        expect(Math.abs(value - binomialTailByRatio(p.n, p.lambda / p.n, p.k))).toBeLessThan(0.005);
      }),
      RUNS,
    );
  });

  it('uses many trials, a small probability and a readable answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(poissonApproximationDefaults, seed);
        const prob = p.lambda / p.n;
        expect(p.n).toBeGreaterThanOrEqual(200);
        expect(prob).toBeLessThanOrEqual(0.02);
        expect(hasAtMostDecimals(prob, 4)).toBe(true);
        expect(p.k).toBeGreaterThanOrEqual(1);
        expect(p.k).toBeLessThanOrEqual(4);
        expect(value).toBeGreaterThanOrEqual(0.02);
        expect(value).toBeLessThanOrEqual(0.98);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST104 (500 loans, p = 0.006, more than 4 defaults)', () => {
    const p = { n: 500, lambda: 3, k: 4, context: 'loans' } as const;
    expect(poissonApproximationDefaults.answer(p)).toMatchObject({ value: 0.1847 });
    expect(byCode(poissonApproximationDefaults.distractors(p))).toEqual({
      NOT_COMPLEMENT: 0.8153,
      BOUNDARY: 0.3528,
      EXACT_ONLY: 0.1008,
    });
    expect(binomialTailByRatio(500, 0.006, 4)).toBeCloseTo(0.1842, 4);
  });
});
