import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import type { PayoffMatrix } from './zero-sum';
import { shiftFor, zeroSumLpOptimalValue } from './zero-sum-lp-optimal-value';
import { zeroSumMixed2x2Value } from './zero-sum-mixed-2x2-value';
import { zeroSumSaddlePointValue } from './zero-sum-saddle-point-value';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const at = (a: PayoffMatrix, i: number, j: number) => a[i]?.[j] ?? 0;
const decimalsOk = (x: number, d: number) => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Every cell that is the smallest in its row and the largest in its column, found cell by cell. */
function saddleCells(a: PayoffMatrix): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < (a[0]?.length ?? 0); j++) {
      const x = at(a, i, j);
      const rowOk = (a[i] ?? []).every((y) => x <= y);
      const colOk = a.every((row) => x >= (row[j] ?? 0));
      if (rowOk && colOk) cells.push([i, j]);
    }
  return cells;
}

/** Root of a function that changes sign on [0, 1], by bisection (no formula). */
function bisect(f: (x: number) => number): number {
  let lo = 0;
  let hi = 1;
  const sLo = Math.sign(f(lo));
  expect(sLo).not.toBe(0);
  expect(Math.sign(f(hi))).toBe(-sLo);
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(f(mid)) === sLo) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** A's expected gain against column j when A plays row 1 with probability p. */
const colGain = (a: PayoffMatrix, j: number, p: number) => p * at(a, 0, j) + (1 - p) * at(a, 1, j);
/** A's expected gain from row i when B plays column 1 with probability q. */
const rowGain = (a: PayoffMatrix, i: number, q: number) => q * at(a, i, 0) + (1 - q) * at(a, i, 1);

/** The value of a 2×2 game from both sides: A's guarantee (max-min) and B's ceiling (min-max), by bisection. */
function valueBothSides(a: PayoffMatrix) {
  const p = bisect((x) => colGain(a, 0, x) - colGain(a, 1, x));
  const q = bisect((x) => rowGain(a, 0, x) - rowGain(a, 1, x));
  return { p, q, fromA: colGain(a, 0, p), fromB: rowGain(a, 0, q) };
}

/** min u1 + u2 subject to s[0][j]·u1 + s[1][j]·u2 ≥ 1 (j = 1, 2), u ≥ 0, by checking every corner. */
function lpMinimum(s: PayoffMatrix): number {
  const lines = [0, 1].map((j) => [at(s, 0, j), at(s, 1, j)] as const);
  const corners: [number, number][] = [];
  for (const [c1, c2] of lines) {
    corners.push([1 / c1, 0], [0, 1 / c2]);
  }
  const [[a1, b1], [a2, b2]] = lines as unknown as [[number, number], [number, number]];
  const det = a1 * b2 - a2 * b1;
  if (det !== 0) corners.push([(b2 - b1) / det, (a1 - a2) / det]);
  const feasible = corners.filter(
    ([u1, u2]) =>
      u1 >= -1e-12 && u2 >= -1e-12 && lines.every(([c1, c2]) => c1 * u1 + c2 * u2 >= 1 - 1e-9),
  );
  return Math.min(...feasible.map(([u1, u2]) => u1 + u2));
}

describe('zero-sum-saddle-point-value', { timeout: SLOW }, () => {
  it('equals the entry of the one cell that is lowest in its row and highest in its column', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zeroSumSaddlePointValue, seed);
        const cells = saddleCells(p.matrix);
        expect(cells).toHaveLength(1);
        const [i, j] = cells[0] ?? [0, 0];
        expect(value).toBe(at(p.matrix, i, j));
        // A's saddle row earns at least v against every column; B's column gives at most v to every row.
        expect((p.matrix[i] ?? []).every((x) => x >= value)).toBe(true);
        expect(p.matrix.every((row) => (row[j] ?? 0) <= value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('uses 2–3 rows and columns of whole payoffs −4 to 9, all contexts, with three wrong answers', () => {
    const contexts = new Set<string>();
    const shapes = new Set<string>();
    const answers = new Set<number>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(zeroSumSaddlePointValue, seed);
        expect(p.matrix.length).toBeGreaterThanOrEqual(2);
        expect(p.matrix.length).toBeLessThanOrEqual(3);
        for (const row of p.matrix) expect(row).toHaveLength(p.matrix[0]?.length ?? 0);
        for (const x of p.matrix.flat())
          expect(Number.isInteger(x) && x >= -4 && x <= 9).toBe(true);
        expect(Number.isInteger(value)).toBe(true);
        expect(problem.distractors).toHaveLength(3);
        contexts.add(p.context);
        shapes.add(`${p.matrix.length}x${p.matrix[0]?.length}`);
        answers.add(value);
      }),
      RUNS,
    );
    expect(contexts.size).toBe(3);
    expect(shapes.size).toBe(4);
    expect(answers.size).toBeGreaterThan(8);
  });

  it('reproduces Example 1 in GT05: the saddle point is (Advertising, Advertising) with value 2', () => {
    const ex = {
      context: 'campaign' as const,
      matrix: [
        [3, -1, 0],
        [4, 2, 5],
        [-2, 1, 7],
      ],
    };
    expect(zeroSumSaddlePointValue.answer(ex)).toMatchObject({ value: 2 });
    expect(saddleCells(ex.matrix)).toEqual([[1, 1]]);
    expect(zeroSumSaddlePointValue.distractors(ex).map((d) => d.value)).toEqual([0, 7, 2.11]);
  });
});

describe('zero-sum-mixed-2x2-value', { timeout: SLOW }, () => {
  it('equals both A’s guarantee and B’s ceiling found by bisection (the minimax theorem)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zeroSumMixed2x2Value, seed);
        expect(saddleCells(p.matrix)).toHaveLength(0);
        const both = valueBothSides(p.matrix);
        expect(Math.abs(value - both.fromA)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(Math.abs(value - both.fromB)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(both.p).toBeGreaterThan(0);
        expect(both.p).toBeLessThan(1);
        expect(decimalsOk(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('beats every pure guarantee and no mix on a grid guarantees A more', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zeroSumMixed2x2Value, seed);
        const a = p.matrix;
        const rowMin = a.map((row) => Math.min(...row));
        const colMax = [0, 1].map((j) => Math.max(at(a, 0, j), at(a, 1, j)));
        expect(value).toBeGreaterThan(Math.max(...rowMin));
        expect(value).toBeLessThan(Math.min(...colMax));
        for (let k = 0; k <= 200; k++) {
          const x = k / 200;
          expect(Math.min(colGain(a, 0, x), colGain(a, 1, x))).toBeLessThanOrEqual(value + 1e-9);
        }
      }),
      RUNS,
    );
  });

  it('uses whole payoffs −5 to 9, all contexts, with three wrong answers', () => {
    const contexts = new Set<string>();
    const answers = new Set<number>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(zeroSumMixed2x2Value, seed);
        for (const x of p.matrix.flat())
          expect(Number.isInteger(x) && x >= -5 && x <= 9).toBe(true);
        expect(problem.distractors).toHaveLength(3);
        contexts.add(p.context);
        answers.add(value);
      }),
      RUNS,
    );
    expect(contexts.size).toBe(3);
    expect(answers.size).toBeGreaterThan(40);
  });

  it('reproduces Example 2 in GT05: the reduced game [4 −1; −2 1] has value 0.25', () => {
    const ex = {
      context: 'promotion' as const,
      matrix: [
        [4, -1],
        [-2, 1],
      ],
    };
    expect(zeroSumMixed2x2Value.answer(ex)).toMatchObject({ value: 0.25 });
    expect(zeroSumMixed2x2Value.distractors(ex).map((d) => d.value)).toEqual([-1, 0.5, -0.5]);
    const both = valueBothSides(ex.matrix);
    expect(both.p).toBeCloseTo(0.375, 9);
    expect(both.q).toBeCloseTo(0.25, 9);
  });
});

describe('zero-sum-lp-optimal-value', { timeout: SLOW }, () => {
  it('equals the minimum of the stated programme, found by checking its corners', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zeroSumLpOptimalValue, seed);
        const k = shiftFor(p.matrix);
        const shifted = p.matrix.map((row) => row.map((x) => x + k));
        for (const x of shifted.flat()) expect(x).toBeGreaterThanOrEqual(1);
        expect(Math.min(...shifted.flat())).toBe(1);
        expect(Math.abs(value - lpMinimum(shifted))).toBeLessThanOrEqual(0.00005 + 1e-9);
        expect(decimalsOk(value, 4)).toBe(true);
      }),
      RUNS,
    );
  });

  it('turns back into the game: 1/minimum − k is the value both players can secure', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(zeroSumLpOptimalValue, seed);
        const k = shiftFor(p.matrix);
        const shifted = p.matrix.map((row) => row.map((x) => x + k));
        const both = valueBothSides(p.matrix);
        expect(1 / lpMinimum(shifted) - k).toBeCloseTo(both.fromA, 9);
        expect(both.fromA).toBeCloseTo(both.fromB, 9);
        expect(Math.min(...p.matrix.flat())).toBeLessThan(0);
      }),
      RUNS,
    );
  });

  it('uses whole payoffs −5 to 6, all contexts, with three wrong answers', () => {
    const contexts = new Set<string>();
    const answers = new Set<number>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(zeroSumLpOptimalValue, seed);
        for (const x of p.matrix.flat())
          expect(Number.isInteger(x) && x >= -5 && x <= 6).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(problem.distractors).toHaveLength(3);
        contexts.add(p.context);
        answers.add(value);
      }),
      RUNS,
    );
    expect(contexts.size).toBe(3);
    expect(answers.size).toBeGreaterThan(30);
  });

  it('reproduces Example 3 in GT05 on its two active columns: value 1, so with k = 4 the minimum is 0.2', () => {
    const active = [
      [-2, 4],
      [3, -1],
    ];
    // The generator adds the smallest k that makes this 2×2 positive (k = 3): 1/(1 + 3) = 0.25.
    expect(zeroSumLpOptimalValue.answer({ context: 'campaign', matrix: active })).toMatchObject({
      value: 0.25,
    });
    // Example 3 adds k = 4 (the full 2×3 matrix has −3): 1/(1 + 4) = 0.2.
    expect(lpMinimum(active.map((row) => row.map((x) => x + 4)))).toBeCloseTo(0.2, 12);
  });
});
