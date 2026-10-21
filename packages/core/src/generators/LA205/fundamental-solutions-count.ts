import type { Generator } from '../../engine/types';
import { cleanDistractors } from '../format';

interface Params {
  /** Coefficient rows of the homogeneous system A x = 0 (integers). */
  rows: number[][];
  /** Rank of A, known from the construction. */
  rank: number;
}

const WHOLE = { tolerance: 0.001, relTolerance: 0 } as const;

const unknowns = (p: Params) => p.rows[0]?.length ?? 0;
export const freeCount = (p: Params) => unknowns(p) - p.rank;

const candidates = (p: Params) => [
  { value: p.rank, mistakeCode: 'GAVE_RANK' },
  { value: unknowns(p), mistakeCode: 'COUNTED_UNKNOWNS' },
  { value: p.rows.length - p.rank, mistakeCode: 'USED_EQUATIONS' },
];

/** "2x₁ − x₂ + 3x₄ = 0" from a row of coefficients. */
function equation(row: number[]) {
  const terms = row
    .map((c, j) => ({ c, j }))
    .filter(({ c }) => c !== 0)
    .map(({ c, j }, k) => {
      const abs = Math.abs(c);
      const body = `${abs === 1 ? '' : abs}x_{${j + 1}}`;
      if (k === 0) return c < 0 ? `-${body}` : body;
      return c < 0 ? `- ${body}` : `+ ${body}`;
    });
  return `${terms.join(' ')} = 0`;
}

/** Exact rank by fraction-free elimination on integers (small sizes only). */
export function rankOf(rows: number[][]) {
  const m = rows.map((r) => [...r]);
  const n = m[0]?.length ?? 0;
  let rank = 0;
  for (let col = 0; col < n && rank < m.length; col++) {
    const pivot = m.findIndex((r, i) => i >= rank && (r[col] ?? 0) !== 0);
    if (pivot < 0) continue;
    [m[rank], m[pivot]] = [m[pivot] as number[], m[rank] as number[]];
    const top = m[rank] as number[];
    for (let i = 0; i < m.length; i++) {
      if (i === rank) continue;
      const r = m[i] as number[];
      const f = r[col] ?? 0;
      const t = top[col] ?? 1;
      for (let j = 0; j < n; j++) r[j] = (r[j] ?? 0) * t - (top[j] ?? 0) * f;
    }
    rank++;
  }
  return rank;
}

/** LA205, difficulty 1: how many vectors a fundamental system of solutions of A x = 0 has. */
export const fundamentalSolutionsCount: Generator<Params> = {
  id: 'fundamental-solutions-count',
  title: 'Size of a fundamental system of solutions',
  topicId: 'LA205',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const n = rng.int(3, 5);
      const m = rng.int(3, 4);
      const rank = rng.int(1, Math.min(m, n) - 1);
      // Independent rows with leading entries in increasing columns, then integer combinations.
      const base: number[][] = [];
      let lead = 0;
      for (let k = 0; k < rank; k++) {
        lead = k === 0 ? rng.int(0, n - rank) : rng.int(lead + 1, n - rank + k);
        const row = Array.from({ length: n }, (_, j) => (j < lead ? 0 : rng.int(-4, 5)));
        row[lead] = rng.pick([1, 2, 3, -1, -2] as const);
        base.push(row);
      }
      const extra = Array.from({ length: m - rank }, () => {
        const w = base.map(() => rng.int(-2, 2));
        return Array.from({ length: n }, (_, j) =>
          base.reduce((s, r, i) => s + (w[i] ?? 0) * (r[j] ?? 0), 0),
        );
      });
      const rows = [...base, ...extra];
      // Shuffle the rows so the echelon shape is not handed over.
      for (let i = rows.length - 1; i > 0; i--) {
        const j = rng.int(0, i);
        [rows[i], rows[j]] = [rows[j] as number[], rows[i] as number[]];
      }
      const p: Params = { rows, rank };
      if (rows.some((r) => r.every((c) => c === 0))) continue;
      if (rows.some((r) => r.some((c) => Math.abs(c) > 20))) continue;
      if (rankOf(rows) !== rank) continue;
      if (cleanDistractors(freeCount(p), candidates(p), WHOLE.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `A homogeneous system has ${p.rows.length} equations in ${unknowns(p)} unknowns: $${p.rows.map(equation).join(',\\quad ')}$. How many vectors does a fundamental system of solutions contain (the number of free unknowns)?`,

  answer: (p) => ({ kind: 'numeric', value: freeCount(p), decimals: 0, ...WHOLE }),

  steps: (p) => [
    {
      text: 'Row-reduce the coefficient matrix and count the non-zero rows.',
      latex: `\\operatorname{rank} A = ${p.rank}`,
      why: 'Some equations are combinations of the others; elimination turns them into rows of zeros. The rank is the number of independent equations left (LA201).',
      result: p.rank,
    },
    {
      text: 'Subtract the rank from the number of unknowns.',
      latex: `n - r = ${unknowns(p)} - ${p.rank} = ${freeCount(p)}`,
      why: 'Each independent equation fixes one unknown in terms of the others; the remaining unknowns are free. Setting one free unknown to 1 and the others to 0, in turn, gives one basic solution per free unknown.',
      result: freeCount(p),
    },
  ],

  distractors: (p) => cleanDistractors(freeCount(p), candidates(p), WHOLE.tolerance, 0),
};
