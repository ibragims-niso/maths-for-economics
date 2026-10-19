import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { bracket, charPolyLatex, det2, type Matrix2, paren, plain, rows2, trace2 } from './eigen';

interface Params extends Matrix2 {
  /** The two eigenvalues, big > small; the matrix is built from their sum and product. */
  big: number;
  small: number;
}

/** The eigenvalue is a whole number, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const candidates = (p: Params): Distractor[] => [
  { value: trace2(p), mistakeCode: 'TRACE_AS_EIGENVALUE' },
  { value: det2(p), mistakeCode: 'DETERMINANT_AS_EIGENVALUE' },
  { value: Math.max(p.a, p.d), mistakeCode: 'DIAGONAL_ENTRY' },
  { value: p.small, mistakeCode: 'SMALLER_EIGENVALUE' },
];

/** LA202, difficulty 1: the larger eigenvalue of a 2×2 matrix, from λ² − (trace)λ + det = 0. */
export const eigenvalueLarger2x2: Generator<Params> = {
  id: 'eigenvalue-larger-2x2',
  title: 'Larger eigenvalue of a 2×2 matrix',
  topicId: 'LA202',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const big = rng.int(-3, 9);
      const small = rng.int(-6, big - 1);
      const t = big + small;
      const a = rng.int(-4, 9);
      const d = t - a;
      if (Math.abs(d) > 9) continue;
      // b·c = ad − det; it must not be zero, or the eigenvalues would sit on the diagonal.
      const m = a * d - big * small;
      if (m === 0) continue;
      const sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
        (k) => Math.abs(m) % k === 0 && Math.abs(m) / k <= 9,
      );
      if (sizes.length === 0) continue;
      const b = rng.pick(sizes) * rng.pick([1, -1]);
      const p: Params = { a, b, c: m / b, d, big, small };
      if (cleanDistractors(big, candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `The matrix $A = ${pmatrix(rows2(p))}$ has two whole-number eigenvalues. Find the larger one.`,

  answer: (p) => ({ kind: 'numeric', value: p.big, decimals: 0, ...EXACT }),

  steps(p) {
    const t = trace2(p);
    const det = det2(p);
    const root = p.big - p.small;
    return [
      {
        text: 'Add the diagonal entries to get the trace.',
        latex: `\\operatorname{tr} A = ${num(p.a)} + ${paren(p.d)} = ${num(t)}`,
        why: 'For a 2×2 matrix the characteristic equation only needs two numbers: the trace and the determinant.',
        result: t,
      },
      {
        text: 'Find the determinant.',
        latex: `\\det A = ${paren(p.a)} \\cdot ${paren(p.d)} - ${paren(p.b)} \\cdot ${paren(p.c)} = ${num(det)}`,
        why: 'The determinant of a 2×2 matrix is ad − bc: the product of the diagonal minus the product of the other two entries.',
        result: det,
      },
      {
        text: 'Solve the characteristic equation det(A − λI) = 0.',
        latex: `${charPolyLatex(t, det)} = 0 \\;\\Rightarrow\\; \\lambda = \\dfrac{${num(t)} \\pm \\sqrt{${num(t * t - 4 * det)}}}{2} = \\dfrac{${num(t)} \\pm ${num(root)}}{2}`,
        why: 'Expanding det(A − λI) = (a − λ)(d − λ) − bc gives λ² − (trace)λ + det; λ is an eigenvalue exactly when A − λI has no inverse.',
      },
      {
        text: 'Pick the larger root.',
        latex: `\\lambda_1 = ${num(p.big)},\\quad \\lambda_2 = ${num(p.small)}`,
        why: `Check: the eigenvalues add up to the trace, ${plain(p.big)} + ${bracket(p.small)} = ${plain(t)}, and multiply to the determinant, ${plain(p.big * p.small)}.`,
        result: p.big,
      },
    ];
  },

  distractors: (p) => cleanDistractors(p.big, candidates(p), EXACT.tolerance, 0),
};
