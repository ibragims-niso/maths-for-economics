import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { factor, matLatex } from './matrix';

interface Params {
  /** The matrix (a b; c d), whole entries, none of them zero. */
  a: number;
  b: number;
  c: number;
  d: number;
  /** The entry asked for: row and column of A⁻¹, 1 or 2. */
  row: number;
  col: number;
}

/** Determinants that make every entry of the inverse exact to 2 decimal places. */
export const NICE_DETERMINANTS = [-5, -4, -2, -1, 1, 2, 4, 5] as const;

/** The answer is exact to 2 decimals, so only a correctly rounded value is accepted. */
const TWO_DP = { tolerance: 0.005, relTolerance: 0 } as const;

const det = (p: Params) => p.a * p.d - p.b * p.c;
/** The entries of A, by row and column (1-based). */
const entryOfA = (p: Params, r: number, c: number) =>
  r === 1 ? (c === 1 ? p.a : p.b) : c === 1 ? p.c : p.d;
/** The adjugate (d −b; −c a): diagonal swapped, off-diagonal signs changed. */
const adjugate = (p: Params, r: number, c: number) =>
  r === c ? entryOfA(p, 3 - r, 3 - c) : -entryOfA(p, r, c);
const entry = (p: Params) => round(adjugate(p, p.row, p.col) / det(p), 2);

const candidates = (p: Params): Distractor[] => {
  const D = det(p);
  const own = entryOfA(p, p.row, p.col);
  const mistake: Distractor =
    p.row === p.col
      ? { value: round(own / D, 2), mistakeCode: 'NO_DIAGONAL_SWAP' }
      : { value: round(own / D, 2), mistakeCode: 'NO_SIGN_CHANGE' };
  return [
    { value: adjugate(p, p.row, p.col), mistakeCode: 'NO_DIVIDE_DET' },
    mistake,
    { value: round(1 / own, 2), mistakeCode: 'RECIPROCAL_ENTRY' },
  ];
};

const kept = (p: Params) => cleanDistractors(entry(p), candidates(p), TWO_DP.tolerance, 0);

/** LA105, difficulty 1: one entry of the inverse of a 2×2 matrix, from A⁻¹ = (1/det A)(d −b; −c a). */
export const inverse2x2Entry: Generator<Params> = {
  id: 'inverse-2x2-entry',
  title: 'Entry of a 2×2 inverse',
  topicId: 'LA105',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    const pick = () => rng.pick([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (;;) {
      const p: Params = {
        a: pick(),
        b: pick(),
        c: pick(),
        d: pick(),
        row: rng.int(1, 2),
        col: rng.int(1, 2),
      };
      if (!(NICE_DETERMINANTS as readonly number[]).includes(det(p))) continue;
      // Each mistake must lead to its own wrong number.
      if (kept(p).length === 3) return p;
    }
  },

  stem: (p) =>
    `Let $A = ${matLatex([
      [p.a, p.b],
      [p.c, p.d],
    ])}$. Find the entry in row ${p.row}, column ${p.col} of the inverse matrix, $(A^{-1})_{${p.row}${p.col}}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: entry(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const D = det(p);
    const adj = [
      [p.d, -p.b],
      [-p.c, p.a],
    ];
    return [
      {
        text: 'Find the determinant.',
        latex: `\\det A = ad - bc = ${factor(p.a)} \\cdot ${factor(p.d)} - ${factor(p.b)} \\cdot ${factor(p.c)} = ${num(D)}`,
        why: 'A 2×2 matrix has an inverse only when ad − bc ≠ 0, and the inverse is divided by this number.',
        result: D,
      },
      {
        text: 'Swap the diagonal entries and change the signs of the other two.',
        latex: `\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} = ${matLatex(adj)}`,
        why: 'This matrix times A gives (ad − bc) times the identity, so dividing it by the determinant gives exactly the identity.',
      },
      {
        text: `Divide the entry in row ${p.row}, column ${p.col} by the determinant.`,
        latex: `(A^{-1})_{${p.row}${p.col}} = \\dfrac{${num(adjugate(p, p.row, p.col))}}{${num(D)}} = ${num(entry(p))}`,
        why: 'Every entry of the swapped-and-signed matrix is divided by det A, as in A⁻¹ = (1/det A)(d −b; −c a).',
        result: entry(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
