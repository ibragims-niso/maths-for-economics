import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { EXACT, formLatex, paren, plain } from './forms';

interface Params {
  /** Q(x, y) = a·x² + b·xy + c·y²; none of a, b, c is zero. */
  a: number;
  b: number;
  c: number;
}

/** D₂ = ac − (b/2)²; b²/4 is a multiple of 0.25, so 2 decimals are exact. */
const secondMinor = (p: Params) => round(p.a * p.c - (p.b * p.b) / 4, 2);

const candidates = (p: Params): Distractor[] => [
  { value: p.a * p.c - p.b * p.b, mistakeCode: 'FORGOT_HALF' },
  { value: round(p.a * p.c - (p.b * p.b) / 2, 2), mistakeCode: 'SQUARE_HALVED' },
  { value: p.a + p.c, mistakeCode: 'TRACE_NOT_DETERMINANT' },
  { value: round(p.a * p.c + (p.b * p.b) / 4, 2), mistakeCode: 'ADDED_SQUARE' },
];

/** What D₁ = a and D₂ say about the form. */
function verdict(p: Params): { latex: string; why: string } {
  const D2 = secondMinor(p);
  if (D2 < 0)
    return {
      latex: 'D_2 < 0 \\Rightarrow \\text{indefinite}',
      why: 'D₂ is the product of the two eigenvalues. A negative product means one eigenvalue is positive and one negative, so Q takes both signs: its graph is a saddle, whatever the sign of a.',
    };
  if (D2 === 0)
    return {
      latex: `D_2 = 0,\\ D_1 ${p.a > 0 ? '>' : '<'} 0 \\Rightarrow \\text{${p.a > 0 ? 'positive' : 'negative'} semidefinite}`,
      why: `One eigenvalue is 0, so Q is a multiple of a perfect square and is zero along a whole line. With a ${p.a > 0 ? 'positive' : 'negative'} it is never ${p.a > 0 ? 'negative' : 'positive'}: a ${p.a > 0 ? 'valley' : 'ridge'} rather than a bowl or a dome.`,
    };
  return p.a > 0
    ? {
        latex: 'D_1 > 0,\\ D_2 > 0 \\Rightarrow \\text{positive definite}',
        why: 'Both leading principal minors are positive (Sylvester’s criterion), so Q(x, y) > 0 for every (x, y) ≠ (0, 0): a bowl, like a cost that rises whichever way you move.',
      }
    : {
        latex: 'D_1 < 0,\\ D_2 > 0 \\Rightarrow \\text{negative definite}',
        why: 'The minors alternate in sign starting with a negative one, so Q(x, y) < 0 for every (x, y) ≠ (0, 0): a dome, like a profit at its maximum.',
      };
}

/** LA204, difficulty 1: the second leading principal minor D₂ = ac − b²/4 of ax² + bxy + cy². */
export const quadraticFormSecondMinor: Generator<Params> = {
  id: 'quadratic-form-second-minor',
  title: 'Second leading minor of a quadratic form',
  topicId: 'LA204',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      // Mostly a and c of the same sign, where D₂ really decides; sometimes opposite signs.
      const sameSign = rng.int(1, 4) <= 3;
      const sign = rng.pick([1, -1]);
      const a = sign * rng.int(1, 9);
      const c = (sameSign ? sign : -sign) * rng.int(1, 9);
      const b = rng.pick([1, -1]) * rng.int(1, 12);
      const p = { a, b, c };
      if (cleanDistractors(secondMinor(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `Write the quadratic form $Q(x, y) = ${formLatex(p.a, p.b, p.c)}$ as $Q = \\mathbf{x}^{\\mathsf T} A\\, \\mathbf{x}$ with a symmetric matrix $A$, and find its second leading principal minor $D_2 = \\det A$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: secondMinor(p), decimals: 2, ...EXACT }),

  steps(p) {
    const half = p.b / 2;
    const D2 = secondMinor(p);
    const shape = verdict(p);
    return [
      {
        text: 'Put the squared coefficients on the diagonal and split the cross coefficient in half.',
        latex: `A = ${pmatrix([
          [p.a, half],
          [half, p.c],
        ])}`,
        why: `In xᵀAx the off-diagonal entry is used twice, once as the xy term and once as the yx term, so each holds half of ${plain(p.b)}: 2 × ${half < 0 ? `(${plain(half)})` : plain(half)} = ${plain(p.b)}.`,
      },
      {
        text: 'The first leading principal minor is the top-left entry.',
        latex: `D_1 = ${num(p.a)}`,
        why: 'D₁ is the determinant of the top-left 1×1 block: the coefficient of x², which is Q(1, 0).',
        result: p.a,
      },
      {
        text: 'The second leading principal minor is the determinant of the whole matrix.',
        latex: `D_2 = ${paren(p.a)} \\cdot ${paren(p.c)} - ${paren(half)}^2 = ${num(p.a * p.c)} - ${num(half * half)} = ${num(D2)}`,
        why: 'A 2×2 determinant is the product down the diagonal minus the product of the off-diagonal entries; here both are b/2, so subtract (b/2)² = b²/4, not b².',
        result: D2,
      },
      {
        text: 'Read off what D₁ and D₂ say.',
        latex: shape.latex,
        why: shape.why,
      },
    ];
  },

  distractors: (p) => cleanDistractors(secondMinor(p), candidates(p), EXACT.tolerance, 0),
};
