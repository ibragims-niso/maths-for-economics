import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { bayesDefaultGivenSignal } from './bayes-default-given-signal';
import { meetingWindowProbability } from './meeting-window-probability';
import { sampleDefectivesProbability } from './sample-defectives-probability';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/**
 * Draws items one at a time without replacement and tracks the chance of each number of
 * defectives so far: a probability tree, not a combinations formula.
 */
function defectiveCountsByDrawing(total: number, defective: number, draws: number): number[] {
  let dist = [1];
  for (let n = 0; n < draws; n++) {
    const next = new Array(dist.length + 1).fill(0);
    dist.forEach((prob, j) => {
      const left = total - n;
      const badLeft = defective - j;
      next[j + 1] += (prob * badLeft) / left;
      next[j] += (prob * (left - badLeft)) / left;
    });
    dist = next;
  }
  return dist;
}

describe('sample-defectives-probability', () => {
  it('matches drawing the items one by one without replacement', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(sampleDefectivesProbability, seed);
        const dist = defectiveCountsByDrawing(p.total, p.defective, p.sample);
        expect(dist.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12);
        expect(Math.abs(value - (dist[p.wanted] ?? Number.NaN))).toBeLessThanOrEqual(
          0.00005 + 1e-12,
        );
      }),
      RUNS,
    );
  });

  it('keeps the batch realistic and the answer a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(sampleDefectivesProbability, seed);
        expect(p.defective).toBeGreaterThanOrEqual(2);
        expect(p.defective * 3).toBeLessThanOrEqual(p.total);
        expect(p.wanted).toBeGreaterThanOrEqual(1);
        expect(p.wanted).toBeLessThan(p.sample);
        expect(p.wanted).toBeLessThanOrEqual(p.defective);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in ST102 (20 items, 4 faulty, pick 3, exactly 1)', () => {
    const p = { total: 20, defective: 4, sample: 3, wanted: 1, context: 'phones' } as const;
    expect(sampleDefectivesProbability.answer(p)).toMatchObject({ kind: 'numeric', value: 0.4211 });
    const byCode = Object.fromEntries(
      sampleDefectivesProbability.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      ORDERED_COUNT: 0.1404,
      WITH_REPLACEMENT: 0.384,
      MISSING_GOOD_ITEMS: 0.0035,
    });
  });
});

describe('bayes-default-given-signal', () => {
  it('equals the share of true cases among a million people with a signal', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bayesDefaultGivenSignal, seed);
        // Natural frequencies: whole numbers of people out of 1,000,000.
        const cases = p.base * 10_000;
        const truePositives = (cases * p.hit) / 100;
        const falsePositives = ((1_000_000 - cases) * p.falseAlarm) / 100;
        expect(Number.isInteger(truePositives) && Number.isInteger(falsePositives)).toBe(true);
        const share = truePositives / (truePositives + falsePositives);
        expect(Math.abs(value - share)).toBeLessThanOrEqual(0.00005 + 1e-12);
      }),
      RUNS,
    );
  });

  it('satisfies P(A | S)·P(S) = P(S | A)·P(A) and raises the base rate', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bayesDefaultGivenSignal, seed);
        const pA = p.base / 100;
        const pS = pA * (p.hit / 100) + (1 - pA) * (p.falseAlarm / 100);
        expect(Math.abs(value * pS - (p.hit / 100) * pA)).toBeLessThanOrEqual(0.00005 * pS + 1e-12);
        expect(p.falseAlarm).toBeLessThan(p.hit);
        expect(value).toBeGreaterThan(pA);
        expect(value).toBeGreaterThanOrEqual(0.05);
        expect(value).toBeLessThanOrEqual(0.95);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in ST102 (5 % default, 80 % hit, 10 % false alarm)', () => {
    const p = { base: 5, hit: 80, falseAlarm: 10, context: 'credit' } as const;
    expect(bayesDefaultGivenSignal.answer(p)).toMatchObject({ kind: 'numeric', value: 0.2963 });
    const byCode = Object.fromEntries(
      bayesDefaultGivenSignal.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({
      INVERTED_CONDITIONAL: 0.8,
      BASE_RATE_NEGLECT: 0.8889,
      JOINT_NOT_CONDITIONAL: 0.04,
      TOTAL_NOT_CONDITIONAL: 0.135,
    });
  });
});

describe('meeting-window-probability', () => {
  it('matches integrating, over the first arrival time, the chance the other is close enough', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(meetingWindowProbability, seed);
        const T = p.window;
        const w = p.wait;
        // Midpoint rule with step 0.5: exact here because the integrand is linear between whole minutes.
        let total = 0;
        for (let x = 0.25; x < T; x += 0.5) {
          total += (Math.min(T, x + w) - Math.max(0, x - w)) / T;
        }
        const prob = (total * 0.5) / T;
        expect(Math.abs(value - prob)).toBeLessThanOrEqual(0.00005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('keeps the wait under half the window and the answer a 4-decimal probability', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(meetingWindowProbability, seed);
        expect(p.wait).toBeGreaterThanOrEqual(3);
        expect(2 * p.wait).toBeLessThan(p.window);
        expect(p.startHour + p.window / 60).toBeLessThanOrEqual(18);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(hasAtMostDecimals(value, 4)).toBe(true);
        expect(distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in ST102 (12:00 to 13:00, each waits 15 minutes)', () => {
    const p = { startHour: 12, window: 60, wait: 15, context: 'traders' } as const;
    expect(meetingWindowProbability.answer(p)).toMatchObject({ kind: 'numeric', value: 0.4375 });
    const byCode = Object.fromEntries(
      meetingWindowProbability.distractors(p).map((d) => [d.mistakeCode, d.value]),
    );
    expect(byCode).toEqual({ EDGE_IGNORED: 0.5, NOT_COMPLEMENT: 0.5625, ONE_TRIANGLE: 0.7188 });
  });
});
