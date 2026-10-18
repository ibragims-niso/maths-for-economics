import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { at, cofactor, det, factor, type Matrix, matLatex, minorMatrix, sub } from './matrix';

interface Params {
  /** A 3×3 matrix with small whole entries. */
  A: Matrix;
  /** The entry of A⁻¹ asked for, counting from 0; always off the diagonal. */
  i: number;
  j: number;
}

/** Determinants that make every entry of the inverse exact to 2 decimal places. */
const NICE_DETERMINANTS = [-10, -5, -4, -2, -1, 1, 2, 4, 5, 10];

/** The answer is exact to 2 decimals, so only a correctly rounded value is accepted. */
const TWO_DP = { tolerance: 0.005, relTolerance: 0 } as const;

/** (A⁻¹)_ij = C_ji / det A: the cofactor of the transposed position. */
const entry = (p: Params) => round(cofactor(p.A, p.j, p.i) / det(p.A), 2);

const candidates = (p: Params): Distractor[] => {
  const D = det(p.A);
  return [
    { value: round(cofactor(p.A, p.i, p.j) / D, 2), mistakeCode: 'TRANSPOSED' },
    { value: cofactor(p.A, p.j, p.i), mistakeCode: 'NO_DIVIDE_DET' },
    { value: round(det(minorMatrix(p.A, p.j, p.i)) / D, 2), mistakeCode: 'COFACTOR_SIGN' },
  ];
};

const kept = (p: Params) => cleanDistractors(entry(p), candidates(p), TWO_DP.tolerance, 0);

/** "2 \cdot 3 - (-1) \cdot 4" for the 2×2 determinant of a minor. */
const det2Latex = (m: Matrix) =>
  `${factor(at(m, 0, 0))} \\cdot ${factor(at(m, 1, 1))} - ${factor(at(m, 0, 1))} \\cdot ${factor(at(m, 1, 0))}`;

/** LA105, difficulty 3: one off-diagonal entry of a 3×3 inverse, (A⁻¹)_ij = C_ji / det A. */
export const inverse3x3CofactorEntry: Generator<Params> = {
  id: 'inverse-3x3-cofactor-entry',
  title: 'Entry of a 3×3 inverse by cofactors',
  topicId: 'LA105',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const A: Matrix = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => rng.int(-3, 5)),
      );
      if (!NICE_DETERMINANTS.includes(det(A))) continue;
      const i = rng.int(0, 2);
      const j = (i + rng.int(1, 2)) % 3;
      const p: Params = { A, i, j };
      if (cofactor(A, j, i) === 0) continue;
      // Forgetting to transpose must give a different number, as must the other mistakes.
      if (kept(p).length < 2 || !kept(p).some((d) => d.mistakeCode === 'TRANSPOSED')) continue;
      return p;
    }
  },

  stem: (p) =>
    `Let $A = ${matLatex(p.A)}$. Using cofactors, find the entry in row ${p.i + 1}, column ${p.j + 1} of the inverse matrix, $(A^{-1})_{${p.i + 1}${p.j + 1}}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: entry(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const D = det(p.A);
    const row0 = p.A[0] ?? [];
    const minor = minorMatrix(p.A, p.j, p.i);
    const sign = (p.i + p.j) % 2 === 0 ? '+' : '-';
    const C = cofactor(p.A, p.j, p.i);
    const [r, c] = [p.i + 1, p.j + 1];
    return [
      {
        text: 'Find det A by expanding along the first row.',
        latex: `\\det A = ${row0
          .map(
            (a, k) =>
              `${k === 0 ? '' : k === 1 ? '- ' : '+ '}${factor(a)} \\cdot (${det2Latex(minorMatrix(p.A, 0, k))})`,
          )
          .join(' ')} = ${num(D)}`,
        why: 'Each first-row entry multiplies the determinant of the 2×2 matrix left when its row and column are deleted, with signs + − +. A non-zero result means A⁻¹ exists.',
        result: D,
      },
      {
        text: `Find the cofactor C${sub(c)}${sub(r)}: delete row ${c} and column ${r} of A.`,
        latex: `C_{${c}${r}} = ${sign}\\det ${matLatex(minor)} = ${sign}(${det2Latex(minor)}) = ${num(C)}`,
        why: `The entry in row ${r}, column ${c} of A⁻¹ uses the cofactor of the swapped position (${c}, ${r}), because the adjugate is the transpose of the cofactor matrix. The sign is (−1)^(${c}+${r}).`,
        result: C,
      },
      {
        text: 'Divide the cofactor by the determinant.',
        latex: `(A^{-1})_{${r}${c}} = \\dfrac{C_{${c}${r}}}{\\det A} = \\dfrac{${num(C)}}{${num(D)}} = ${num(entry(p))}`,
        why: 'A⁻¹ = (1/det A) adj A, so every entry of the adjugate is divided by det A.',
        result: entry(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
