import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cpmCrashNewDuration } from './cpm-crash-new-duration';
import { cpmProjectDuration } from './cpm-project-duration';
import { cpmTotalFloat } from './cpm-total-float';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
/** Searches over 1,000 seeds can pass 5 s on a busy machine. */
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

type Net = { duration: number[]; preds: number[][] };

/**
 * Every chain, found backwards: from the final activity, step to each predecessor until an
 * activity with none is reached. Returns the chains as lists of indices (start first).
 */
function chainsBackwards(net: Net): number[][] {
  const out: number[][] = [];
  const walk = (path: number[]) => {
    const first = path[0] ?? 0;
    const ps = net.preds[first] ?? [];
    if (ps.length === 0) out.push(path);
    for (const j of ps) walk([j, ...path]);
  };
  walk([net.duration.length - 1]);
  return out;
}

const lengths = (net: Net) =>
  chainsBackwards(net).map((c) => c.reduce((s, i) => s + (net.duration[i] ?? 0), 0));
const longest = (net: Net) => Math.max(...lengths(net));

/** The structure every drawn network must have. */
function checkNetwork(net: Net) {
  // Plain checks with one expect each: thousands of expect calls per run make the test slow.
  const n = net.duration.length;
  expect(n >= 5 && n <= 7, `${n} activities`).toBe(true);
  const badDuration = net.duration.find((d) => !Number.isInteger(d) || d < 1 || d > 9);
  expect(badDuration).toBeUndefined();
  // Predecessors always come earlier, and only the last activity ends the project.
  expect(net.preds.every((ps, i) => ps.every((j) => j < i))).toBe(true);
  const succeeded = new Set(net.preds.flat());
  const leadNowhere = net.duration.slice(0, -1).flatMap((_, i) => (succeeded.has(i) ? [] : [i]));
  expect(leadNowhere).toEqual([]);
}

describe('cpm-project-duration', { timeout: SLOW }, () => {
  it('equals the longest chain found backwards from the final activity', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(cpmProjectDuration, seed);
        checkNetwork(p);
        const ls = lengths(p).sort((a, b) => b - a);
        expect(value).toBe(ls[0]);
        // One critical path, at least three chains, and every wrong answer on offer.
        expect(ls.length).toBeGreaterThanOrEqual(3);
        expect(ls[1]).toBeLessThan(value);
        expect(problem.distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'LONGEST_ACTIVITY',
          'SHORTEST_PATH',
          'SUM_ALL_DURATIONS',
        ]);
        const sum = p.duration.reduce((s, d) => s + d, 0);
        expect(sum).toBeGreaterThan(value);
        expect(Math.max(...p.duration)).toBeLessThan(value);
        for (const name of ['A', 'B', 'C', 'D', 'E'].slice(0, p.duration.length))
          expect(problem.stem).toContain(`${name} (`);
      }),
      RUNS,
    );
  });

  it('reproduces OP07 Example 1 (product launch, 14 weeks)', () => {
    const p = { duration: [3, 5, 5, 4, 2], preds: [[], [0], [0], [1], [2, 3]] };
    expect(cpmProjectDuration.answer(p)).toMatchObject({ value: 14 });
    expect(cpmProjectDuration.distractors(p).map((d) => d.value)).toEqual([19, 5, 10]);
  });
});

describe('cpm-total-float', { timeout: SLOW }, () => {
  it('equals the largest delay of the activity that leaves the project duration unchanged', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(cpmTotalFloat, seed);
        checkNetwork(p);
        const base = longest(p);
        // Lengthen the activity one day at a time until the project gets longer.
        let delay = 0;
        const slower = (k: number) => ({
          ...p,
          duration: p.duration.map((d, i) => (i === p.target ? d + k : d)),
        });
        while (longest(slower(delay + 1)) === base) delay++;
        expect(value).toBe(delay);
        expect(value).toBeGreaterThan(0);
        expect(Number.isInteger(value)).toBe(true);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
        // Free float never exceeds total float; LF − ES is total float plus the duration.
        for (const d of problem.distractors) {
          if (d.mistakeCode === 'FREE_FLOAT') {
            expect(d.value).toBeGreaterThanOrEqual(0);
            expect(d.value).toBeLessThan(value);
          }
          if (d.mistakeCode === 'START_FINISH_MIX')
            expect(d.value).toBe(value + (p.duration[p.target] ?? 0));
          if (d.mistakeCode === 'BACKWARD_MAX') expect(d.value).toBeGreaterThan(value);
        }
      }),
      RUNS,
    );
  });

  it('reproduces OP07 Examples 2 and 3 (float of C is 1 week; float 8, free float 6)', () => {
    const conference = { duration: [4, 3, 6, 2, 5, 3], preds: [[], [], [0], [0], [1, 3], [2, 4]] };
    expect(cpmTotalFloat.answer({ ...conference, target: 2 })).toMatchObject({ value: 1 });
    expect(cpmTotalFloat.answer({ ...conference, target: 1 })).toMatchObject({ value: 3 });
    const building = {
      duration: [2, 4, 3, 5, 4, 6, 1],
      preds: [[], [0], [0], [1], [2, 3], [3], [4, 5]],
      target: 2,
    };
    expect(cpmTotalFloat.answer(building)).toMatchObject({ value: 8 });
    const wrong = cpmTotalFloat.distractors(building);
    expect(wrong.find((d) => d.mistakeCode === 'FREE_FLOAT')?.value).toBe(6);
    expect(wrong.find((d) => d.mistakeCode === 'START_FINISH_MIX')?.value).toBe(11);
  });
});

describe('cpm-crash-new-duration', { timeout: SLOW }, () => {
  it('equals the longest chain after the cut, and the saving is smaller than the cut', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(cpmCrashNewDuration, seed);
        checkNetwork(p);
        const before = longest(p);
        // The crashed activity lies on the (unique) critical path.
        const chains = chainsBackwards(p);
        const critical = chains.filter(
          (c) => c.reduce((s, i) => s + (p.duration[i] ?? 0), 0) === before,
        );
        expect(critical).toHaveLength(1);
        expect(critical[0]).toContain(p.target);
        expect(p.cut).toBeGreaterThanOrEqual(2);
        expect(p.cut).toBeLessThan(p.duration[p.target] ?? 0);
        const after = longest({
          ...p,
          duration: p.duration.map((d, i) => (i === p.target ? d - p.cut : d)),
        });
        expect(value).toBe(after);
        expect(value).toBeGreaterThan(before - p.cut);
        expect(value).toBeLessThan(before);
        expect(problem.distractors.map((d) => d.mistakeCode).sort()).toEqual([
          'FULL_SAVING',
          'OLD_SECOND_PATH',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces OP07 Example 3 (cutting services F by 3 weeks saves only 2)', () => {
    const p = {
      duration: [2, 4, 3, 5, 4, 6, 1],
      preds: [[], [0], [0], [1], [2, 3], [3], [4, 5]],
      target: 5,
      cut: 3,
    };
    expect(cpmCrashNewDuration.answer(p)).toMatchObject({ value: 16 });
    expect(cpmCrashNewDuration.distractors(p).map((d) => d.value)).toEqual([15]);
  });
});
