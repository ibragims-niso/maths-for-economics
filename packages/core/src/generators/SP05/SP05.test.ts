import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { littlesLawQueue } from './littles-law-queue';
import { mm1AtLeastNProbability } from './mm1-at-least-n-probability';
import { mm1QueueMeasures } from './mm1-queue-measures';
import { mm2StaffingCost } from './mm2-staffing-cost';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const byCode = (ds: { value: number; mistakeCode: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/**
 * Long-run probabilities of a queue with c servers, built from the flow balance
 * λ·P(n) = min(n + 1, c)·μ·P(n + 1) and normalised numerically (no closed formulas).
 */
function balanceProbabilities(lambda: number, mu: number, c: number, top = 3000): number[] {
  const weights = [1];
  for (let n = 0; n < top; n++) {
    weights.push(((weights[n] ?? 0) * lambda) / (Math.min(n + 1, c) * mu));
  }
  const total = weights.reduce((s, x) => s + x, 0);
  return weights.map((x) => x / total);
}

/** L and Lq from the balance probabilities: Σ n·P(n) and Σ max(n − c, 0)·P(n). */
function balanceMeasures(lambda: number, mu: number, c: number) {
  const probs = balanceProbabilities(lambda, mu, c);
  let L = 0;
  let Lq = 0;
  probs.forEach((pn, n) => {
    L += n * pn;
    Lq += Math.max(n - c, 0) * pn;
  });
  return { probs, L, Lq };
}

describe('littles-law-queue', () => {
  it('satisfies L = λW when the answer is put back, with W in hours', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(littlesLawQueue, seed);
        if (p.mode === 'time') expect(p.lambda * (value / 60)).toBeCloseTo(p.count, 9);
        else expect(value).toBeCloseTo(p.lambda * (p.minutes / 60), 9);
      }),
      RUNS,
    );
  });

  it('gives a readable, exact answer in a sensible range', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(littlesLawQueue, seed);
        expect(p.lambda).toBeGreaterThan(0);
        if (p.mode === 'time') {
          // Minutes with at most one decimal, and exact (not rounded).
          expect((600 * p.count) % p.lambda).toBe(0);
          expect(hasAtMostDecimals(value, 1)).toBe(true);
          expect(value).toBeGreaterThan(1);
          expect(value).toBeLessThanOrEqual(360);
        } else {
          expect((100 * p.lambda * p.minutes) % 60).toBe(0);
          expect(hasAtMostDecimals(value, 2)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(1);
        }
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces the emergency department in the definitions (6 per hour, 3 hours, 18 inside)', () => {
    const p = { context: 'emergency', lambda: 6, mode: 'number', count: 6, minutes: 180 } as const;
    expect(littlesLawQueue.answer(p)).toMatchObject({ value: 18 });
    expect(byCode(littlesLawQueue.distractors(p))).toEqual({
      MIXED_UNITS: 1080,
      LITTLE_REARRANGED: 2,
    });
    const q = { context: 'emergency', lambda: 6, mode: 'time', count: 18, minutes: 60 } as const;
    expect(littlesLawQueue.answer(q)).toMatchObject({ value: 180 });
  });
});

describe('mm1-queue-measures', () => {
  it('matches L, Lq, W and Wq summed from the flow-balance probabilities, with Little’s law for the times', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(mm1QueueMeasures, seed);
        const { probs, L, Lq } = balanceMeasures(p.lambda, p.mu, 1);
        expect(probs.at(-1) ?? 1).toBeLessThan(1e-12);
        // Little's law gives the times in hours; W − Wq must be the service time 1/μ.
        const W = (L / p.lambda) * 60;
        const Wq = (Lq / p.lambda) * 60;
        expect(W - Wq).toBeCloseTo(60 / p.mu, 6);
        const target = { L, Lq, W, Wq }[p.measure];
        expect(Math.abs(value - target)).toBeLessThan(1e-6);
      }),
      RUNS,
    );
  });

  it('keeps the queue stable and busy, and the answer exact to 2 decimals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(mm1QueueMeasures, seed);
        expect(Number.isInteger(p.lambda) && Number.isInteger(p.mu)).toBe(true);
        expect(p.lambda / p.mu).toBeGreaterThanOrEqual(0.5);
        expect(p.lambda / p.mu).toBeLessThanOrEqual(0.95);
        expect(value).toBeGreaterThan(0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in SP05 (λ = 12, μ = 15)', () => {
    const base = { context: 'bank', lambda: 12, mu: 15 } as const;
    expect(mm1QueueMeasures.answer({ ...base, measure: 'L' })).toMatchObject({ value: 4 });
    expect(mm1QueueMeasures.answer({ ...base, measure: 'Lq' })).toMatchObject({ value: 3.2 });
    expect(mm1QueueMeasures.answer({ ...base, measure: 'W' })).toMatchObject({ value: 20 });
    expect(mm1QueueMeasures.answer({ ...base, measure: 'Wq' })).toMatchObject({ value: 16 });
    expect(byCode(mm1QueueMeasures.distractors({ ...base, measure: 'W' }))).toEqual({
      SERVICE_ONLY: 4,
      QUEUE_VS_SYSTEM: 16,
      MIXED_UNITS: 0.33,
    });
    expect(byCode(mm1QueueMeasures.distractors({ ...base, measure: 'L' }))).toEqual({
      NO_ONE_MINUS: 0.8,
      QUEUE_VS_SYSTEM: 3.2,
    });
  });
});

describe('mm1-at-least-n-probability', () => {
  it('equals 1 minus the balance probabilities of 0 to n − 1 customers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(mm1AtLeastNProbability, seed);
        const probs = balanceProbabilities(p.lambda, p.mu, 1);
        const below = probs.slice(0, p.n).reduce((s, x) => s + x, 0);
        expect(Math.abs(value - (1 - below))).toBeLessThanOrEqual(0.00005 + 1e-9);
        // EXACTLY_N is the single term P(n).
        const exactly = distractors.find((d) => d.mistakeCode === 'EXACTLY_N');
        expect(Math.abs((exactly?.value ?? -1) - (probs[p.n] ?? 0))).toBeLessThanOrEqual(
          0.00005 + 1e-9,
        );
      }),
      RUNS,
    );
  });

  it('uses a 2-decimal utilisation between 0.5 and 0.95 and a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(mm1AtLeastNProbability, seed);
        expect((100 * p.lambda) % p.mu).toBe(0);
        expect(2 * p.lambda).toBeGreaterThanOrEqual(p.mu);
        expect(20 * p.lambda).toBeLessThanOrEqual(19 * p.mu);
        expect(p.n).toBeGreaterThanOrEqual(2);
        expect(p.n).toBeLessThanOrEqual(6);
        expect(value).toBeGreaterThanOrEqual(0.01);
        expect(value).toBeLessThan(1);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBe(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in SP05 (ρ = 0.8, at least 3)', () => {
    const p = { context: 'bank', lambda: 12, mu: 15, n: 3 } as const;
    expect(mm1AtLeastNProbability.answer(p)).toMatchObject({ value: 0.512 });
    expect(byCode(mm1AtLeastNProbability.distractors(p))).toEqual({
      EXACTLY_N: 0.1024,
      OFF_BY_ONE: 0.4096,
      TAIL_COMPLEMENT: 0.488,
    });
  });
});

describe('mm2-staffing-cost', () => {
  it('picks the cheaper of the costs built from the balance probabilities with 1 and 2 servers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(mm2StaffingCost, seed);
        const one = p.serverCost + p.waitCost * balanceMeasures(p.lambda, p.mu, 1).L;
        const two = 2 * p.serverCost + p.waitCost * balanceMeasures(p.lambda, p.mu, 2).L;
        expect(Math.abs(value - Math.min(one, two))).toBeLessThanOrEqual(0.005 + 1e-6);
        // The other option is clearly dearer.
        expect(Math.abs(one - two)).toBeGreaterThanOrEqual(1);
      }),
      RUNS,
    );
  });

  it('has a stable single server, positive costs and a money answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(mm2StaffingCost, seed);
        expect(p.lambda / p.mu).toBeGreaterThanOrEqual(0.5);
        expect(p.lambda / p.mu).toBeLessThanOrEqual(0.9);
        expect(p.serverCost).toBeGreaterThan(0);
        expect(p.waitCost).toBeGreaterThan(0);
        expect(value).toBeGreaterThan(p.serverCost);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('sometimes prefers one server and sometimes two', () => {
    let two = 0;
    const n = 400;
    for (let seed = 0; seed < n; seed++) {
      const { p, value } = solve(mm2StaffingCost, seed);
      const one = p.serverCost + p.waitCost * balanceMeasures(p.lambda, p.mu, 1).L;
      if (Math.abs(value - one) > 0.01) two++;
    }
    expect(two).toBeGreaterThan(n * 0.2);
    expect(two).toBeLessThan(n * 0.8);
  });

  it('reproduces worked example 3 in SP05 (λ = 12, μ = 15, teller 20, waiting 15)', () => {
    const p = { context: 'bank', lambda: 12, mu: 15, serverCost: 20, waitCost: 15 } as const;
    expect(mm2StaffingCost.answer(p)).toMatchObject({ value: 54.29 });
    expect(byCode(mm2StaffingCost.distractors(p))).toEqual({
      DEARER_OPTION: 80,
      LQ_NOT_L: 42.29,
      SPLIT_QUEUE: 60,
    });
    expect(balanceMeasures(12, 15, 2).L).toBeCloseTo(0.9524, 4);
  });
});
