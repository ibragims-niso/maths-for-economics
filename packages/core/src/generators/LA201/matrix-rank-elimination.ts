import type { Rng } from '../../engine/rng';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Three rows of 3 or 4 integer entries: the coefficients of three equations. */
  rows: number[][];
}

/** The rank is a whole number, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Largest entry allowed at any stage of the elimination, so every matrix stays readable. */
const MAX_ENTRY = 60;
/** Largest entry of the matrix in the question. */
const MAX_GIVEN = 12;

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** "2R_2 + R_1", "R_3 - 3R_1": the new row as a combination of two rows. */
const combo = (m: number, target: number, e: number, pivot: number) => {
  const first = `${m === 1 ? '' : num(m)}R_${target + 1}`;
  if (e === 0) return first;
  const size = Math.abs(e) === 1 ? '' : num(Math.abs(e));
  return `${first} ${e < 0 ? '+' : '-'} ${size}R_${pivot + 1}`;
};

const pmatrix = (rows: readonly (readonly number[])[]) =>
  `\\begin{pmatrix} ${rows.map((r) => r.map((x) => num(x)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

interface Stage {
  /** Row operations of this stage, as LaTeX. */
  ops: string[];
  /** The matrix after the stage. */
  matrix: number[][];
}

/**
 * Fraction-free Gaussian elimination: for each pivot, every row below becomes
 * m·row − e·(pivot row), with m and e the pivot and the entry divided by their common factor.
 * Returns the stages (one per pivot that changes something) and the number of pivots.
 */
function echelonStages(rows: readonly (readonly number[])[]): {
  stages: Stage[];
  pivots: number;
} {
  const m = rows.map((r) => [...r]);
  const cols = m[0]?.length ?? 0;
  const stages: Stage[] = [];
  let pivotRow = 0;
  for (let col = 0; col < cols && pivotRow < m.length; col++) {
    const found = m.findIndex((r, i) => i >= pivotRow && (r[col] ?? 0) !== 0);
    if (found === -1) continue;
    const ops: string[] = [];
    if (found !== pivotRow) {
      [m[pivotRow], m[found]] = [m[found] ?? [], m[pivotRow] ?? []];
      ops.push(`R_${pivotRow + 1} \\leftrightarrow R_${found + 1}`);
    }
    const pivot = m[pivotRow] ?? [];
    const p = pivot[col] ?? 1;
    for (let i = pivotRow + 1; i < m.length; i++) {
      const row = m[i] ?? [];
      const e = row[col] ?? 0;
      if (e === 0) continue;
      const g = gcd(Math.abs(p), Math.abs(e));
      // Keep the multiplier of the row itself positive, so the row is not needlessly flipped.
      const sign = p < 0 ? -1 : 1;
      const mult = (sign * p) / g;
      const off = (sign * e) / g;
      m[i] = row.map((x, j) => mult * x - off * (pivot[j] ?? 0));
      ops.push(`R_${i + 1} \\to ${combo(mult, i, off, pivotRow)}`);
    }
    if (ops.length > 0) stages.push({ ops, matrix: m.map((r) => [...r]) });
    pivotRow++;
  }
  return { stages, pivots: pivotRow };
}

const rankOf = (p: Params) => echelonStages(p.rows).pivots;

const candidates = (p: Params): Distractor[] => {
  const r = rankOf(p);
  const list: Distractor[] = [
    { value: p.rows.length, mistakeCode: 'COUNTED_ROWS' },
    { value: p.rows[0]?.length ?? 0, mistakeCode: 'COUNTED_COLUMNS' },
  ];
  // Rank 1: only one of the two multiple rows was removed. Rank 3: two rows were judged
  // proportional from their first entries, which are proportional by construction.
  if (r === 1) list.push({ value: 2, mistakeCode: 'MISSED_DEPENDENT_ROW' });
  if (r === 3) list.push({ value: 2, mistakeCode: 'FIRST_ENTRIES_ONLY' });
  return list;
};

/** Puts the rows in a random order. */
function shuffle<T>(rng: Rng, xs: T[]): T[] {
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** LA201, difficulty 2: the rank of a 3×3 or 3×4 matrix by Gaussian elimination. */
export const matrixRankElimination: Generator<Params> = {
  id: 'matrix-rank-elimination',
  title: 'Rank of a matrix',
  topicId: 'LA201',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const target = rng.int(1, 3);
      // A 3×3 matrix of rank 2 or 3 would leave fewer than two distinct wrong answers.
      const cols = target === 1 ? rng.int(3, 4) : 4;
      const row = () => Array.from({ length: cols }, () => rng.int(-5, 6));
      let rows: number[][];
      if (target === 1) {
        const base = row();
        const k2 = rng.pick([-3, -2, 2, 3]);
        const k3 = rng.pick([-3, -2, -1, 2, 3]);
        rows = [base, base.map((x) => k2 * x), base.map((x) => k3 * x)];
      } else if (target === 2) {
        const r1 = row();
        const r2 = row();
        const a = rng.pick([-2, -1, 1, 2]);
        const b = rng.pick([-1, 1, 2]);
        rows = [r1, r2, r1.map((x, j) => a * x + b * (r2[j] ?? 0))];
      } else {
        // Two rows whose first two entries are proportional, but not the rest: a trap for
        // anyone who compares only the start of the rows.
        const r1 = row();
        const k = rng.pick([-2, 2, 3]);
        const r2 = r1.map((x, j) => (j < 2 ? k * x : rng.int(-5, 6)));
        rows = [r1, r2, row()];
        if ((r1[0] ?? 0) === 0 || (r1[1] ?? 0) === 0) continue;
      }
      rows = shuffle(rng, rows);
      const p: Params = { rows };
      if (rows.some((r) => r.every((x) => x === 0))) continue;
      if (rows.some((r) => r.some((x) => Math.abs(x) > MAX_GIVEN))) continue;
      if ((rows[0]?.[0] ?? 0) === 0) continue;
      const { stages, pivots } = echelonStages(rows);
      if (pivots !== target) continue;
      if (stages.some((s) => s.matrix.some((r) => r.some((x) => Math.abs(x) > MAX_ENTRY))))
        continue;
      if (cleanDistractors(pivots, candidates(p), EXACT.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `Each row of $A = ${pmatrix(p.rows)}$ holds the coefficients of one equation in a small market model. How many of the equations are independent? Find $\\operatorname{rank} A$.`,

  answer: (p) => ({ kind: 'numeric', value: rankOf(p), decimals: 0, ...EXACT }),

  steps(p) {
    const { stages, pivots } = echelonStages(p.rows);
    const steps: Step[] = stages.map((s, i) => ({
      text:
        i === 0
          ? 'Use the first row to clear the first column below it.'
          : s.ops.some((op) => op.includes('leftrightarrow'))
            ? 'Swap rows so the next pivot sits on the second row, then clear the entries below it.'
            : 'Use the second row to clear the entries below its pivot.',
      latex: `${s.ops.join(',\\; ')}:\\quad ${pmatrix(s.matrix)}`,
      why:
        i === 0
          ? 'Adding a multiple of one row to another (or rescaling a row) does not change which combinations of the rows are possible, so the rank stays the same.'
          : 'Elimination works column by column; a row that turns into zeros was a combination of the rows above it.',
    }));
    const last = stages[stages.length - 1]?.matrix ?? p.rows;
    const zeroRows = last.filter((r) => r.every((x) => x === 0)).length;
    steps.push({
      text: 'Count the non-zero rows of the echelon form.',
      latex: `\\operatorname{rank} A = ${num(p.rows.length)} - ${num(zeroRows)} = ${num(pivots)}`,
      why:
        zeroRows === 0
          ? 'No row became zero, so every row brings new information: each one has its own pivot.'
          : 'Each zero row was a redundant equation. The rank counts the rows with a pivot, the equations that are really independent.',
      result: pivots,
    });
    return steps;
  },

  distractors: (p) => cleanDistractors(rankOf(p), candidates(p), EXACT.tolerance, 0),
};
