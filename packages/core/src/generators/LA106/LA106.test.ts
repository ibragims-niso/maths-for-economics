import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import { leontiefTotalOutputChange } from './leontief-total-output-change';
import { leontiefTwoSectorOutput } from './leontief-two-sector-output';
import { technicalCoefficientFromFlows } from './technical-coefficient-from-flows';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

const decimalsAtMost = (x: number, d: number) =>
  Math.abs(Math.round(x * 10 ** d) - x * 10 ** d) < 1e-6;

const times = (A: number[][], v: number[]) =>
  A.map((row) => row.reduce((s, a, j) => s + a * (v[j] ?? 0), 0));

/**
 * Output by rounds of input purchases: d + Ad + A²d + … until the rounds die out. This is a
 * different route from the inverse (I − A)⁻¹ the generators use.
 */
function rounds(A: number[][], d: number[]): number[] {
  let round = [...d];
  const total = [...d];
  for (let k = 0; k < 2000; k++) {
    round = times(A, round);
    round.forEach((r, i) => {
      total[i] = (total[i] ?? 0) + r;
    });
    if (Math.max(...round) < 1e-12) break;
  }
  return total;
}

const colSum = (A: number[][], j: number) => A.reduce((s, row) => s + (row[j] ?? 0), 0);

describe('technical-coefficient-from-flows', () => {
  it('gives the coefficient that makes the table balance as x = Ax + d', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(technicalCoefficientFromFlows, seed);
        const n = p.x.length;
        expect([2, 3]).toContain(n);
        expect(p.i).not.toBe(p.j);
        // Rebuild the table the student sees: flows z_ij = a_ij x_j and final demand.
        const z = p.H.map((row) => row.map((h, j) => (h / 100) * (p.x[j] ?? 0)));
        const d = p.x.map((xi, i) => xi - (z[i] ?? []).reduce((s, v) => s + v, 0));
        for (const row of z)
          for (const v of row) expect(Math.abs(v - Math.round(v))).toBeLessThan(1e-9);
        for (const di of d) expect(di).toBeGreaterThanOrEqual(10);
        // From the table alone: output = row total, coefficient = flow / buyer's output.
        const out = z.map((row, i) => row.reduce((s, v) => s + v, 0) + (d[i] ?? 0));
        const A = z.map((row) => row.map((v, j) => v / (out[j] ?? 1)));
        const value = numericValue(answer);
        expect(Math.abs(value - (A[p.i]?.[p.j] ?? Number.NaN))).toBeLessThan(1e-9);
        expect(decimalsAtMost(value, 2)).toBe(true);
        // The coefficients really balance the table, and every column spends less than 1 on inputs.
        times(A, out).forEach((v, i) => {
          expect(v + (d[i] ?? 0)).toBeCloseTo(out[i] ?? Number.NaN, 9);
        });
        for (let j = 0; j < n; j++) expect(colSum(A, j)).toBeLessThanOrEqual(0.8 + 1e-12);
        expect(distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA106: a₁₂ = 100 / 500 = 0.2', () => {
    const p = {
      H: [
        [10, 20],
        [20, 40],
      ],
      x: [200, 500],
      i: 0,
      j: 1,
    };
    expect(numericValue(technicalCoefficientFromFlows.answer(p))).toBe(0.2);
    expect(technicalCoefficientFromFlows.stem(p)).toContain(
      '\\text{Agriculture} & 20 & 100 & 80 \\\\ \\text{Industry} & 40 & 200 & 260',
    );
    expect(technicalCoefficientFromFlows.steps(p).map((s) => s.result)).toEqual([500, 0.2]);
    // a₂₁ is also 0.2 here, so reading the flow the wrong way gives the right number and is dropped.
    expect(
      technicalCoefficientFromFlows.distractors(p).map((d) => [d.mistakeCode, d.value]),
    ).toEqual([
      ['DIVIDED_BY_SELLER', 0.5],
      ['INTERMEDIATE_ONLY', 0.33],
    ]);
  });
});

describe('leontief-two-sector-output', () => {
  it('matches the output built up round by round, d + Ad + A²d + …', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, stem, distractors } = makeProblem(leontiefTwoSectorOutput, seed);
        const A = p.T.map((row) => row.map((t) => t / 10));
        for (const row of p.T) for (const t of row) expect(t >= 1 && t <= 5).toBe(true);
        for (const j of [0, 1]) expect(colSum(A, j)).toBeLessThanOrEqual(0.8 + 1e-12);
        const d = p.x.map((xi, i) => xi - (times(A, p.x)[i] ?? 0));
        for (const di of d) {
          expect(Math.abs(di - Math.round(di))).toBeLessThan(1e-9);
          expect(di).toBeGreaterThanOrEqual(20);
        }
        expect(stem).toContain(`\\begin{pmatrix} ${Math.round(d[0] ?? 0)} \\\\`);
        const x = rounds(A, d);
        const value = numericValue(answer);
        expect(Math.abs(value - (x[p.k] ?? Number.NaN))).toBeLessThan(1e-6);
        expect(Number.isInteger(value) && value >= 100 && value <= 900).toBe(true);
        expect(distractors).toHaveLength(4);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA106: d = (80, 260) needs x = (200, 500)', () => {
    const T = [
      [1, 2],
      [2, 4],
    ];
    const p = { T, x: [200, 500], k: 1 };
    expect(numericValue(leontiefTwoSectorOutput.answer(p))).toBe(500);
    expect(leontiefTwoSectorOutput.stem(p)).toContain(
      '\\begin{pmatrix} 80 \\\\ 260 \\end{pmatrix}',
    );
    expect(leontiefTwoSectorOutput.steps(p).map((s) => s.result)).toEqual([
      undefined,
      0.5,
      500,
      undefined,
    ]);
    expect(leontiefTwoSectorOutput.distractors(p).map((d) => [d.mistakeCode, d.value])).toEqual([
      ['IGNORED_INTERMEDIATE', 260],
      ['ONE_ROUND', 380],
      ['NO_DIVIDE_DET', 250],
      ['OWN_SECTOR_ONLY', 433.33],
    ]);
  });
});

describe('leontief-total-output-change', () => {
  it('matches the total extra output summed over the rounds of input purchases', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer, distractors } = makeProblem(leontiefTotalOutputChange, seed);
        const A = p.T.map((row) => row.map((t) => t / 10));
        const dd = [0, 0];
        dd[p.j] = p.delta;
        const dx = rounds(A, dd);
        const value = numericValue(answer);
        expect(Math.abs(value - ((dx[0] ?? 0) + (dx[1] ?? 0)))).toBeLessThan(1e-6);
        expect(decimalsAtMost(value, 2)).toBe(true);
        // Every round adds output, so the total is more than the demand rise itself.
        expect(value).toBeGreaterThan(p.delta);
        expect(p.delta % 5).toBe(0);
        expect(p.delta >= 10 && p.delta <= 400).toBe(true);
        for (const j of [0, 1]) expect(colSum(A, j)).toBeLessThanOrEqual(0.8 + 1e-12);
        expect(distractors.length).toBeGreaterThanOrEqual(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA106: 50 more of industry raises total output by 50 × 2.2 = 110', () => {
    const p = {
      T: [
        [1, 2],
        [2, 4],
      ],
      j: 1,
      delta: 50,
    };
    expect(numericValue(leontiefTotalOutputChange.answer(p))).toBe(110);
    expect(leontiefTotalOutputChange.steps(p).map((s) => s.result)).toEqual([
      0.5,
      undefined,
      2.2,
      110,
    ]);
    expect(leontiefTotalOutputChange.distractors(p).map((d) => [d.mistakeCode, d.value])).toEqual([
      ['COLUMN_SUM_A', 30],
      ['ONE_ROUND', 80],
      ['OWN_SECTOR_ONLY', 83.33],
    ]);
    // (I − A)⁻¹ is symmetric here, so a row sum gives the right number and is dropped.
  });
});
