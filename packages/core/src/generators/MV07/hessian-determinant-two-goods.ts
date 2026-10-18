import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, factor, profitLatex, type QuadraticProfit, signed } from './two-goods';

type Params = QuadraticProfit;

/** D = π₁₁π₂₂ − π₁₂² = (−2c)(−2d) − (−e)². */
const hessianDet = (p: Params) => 4 * p.c * p.d - p.e * p.e;

/** MV07, difficulty 1: the determinant of the Hessian of a two-product profit function. */
export const hessianDeterminantTwoGoods: Generator<Params> = {
  id: 'hessian-determinant-two-goods',
  title: 'Determinant of the Hessian',
  topicId: 'MV07',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const c = rng.int(1, 6);
      const d = rng.int(1, 6);
      const e = rng.pick([-8, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8]);
      // D = 0 would make the test inconclusive; skip it.
      if (4 * c * d === e * e) continue;
      return {
        a: rng.int(4, 40) * 5,
        b: rng.int(4, 40) * 5,
        c,
        d,
        e,
        fixedCost: rng.int(2, 40) * 25,
      };
    }
  },

  stem: (p) =>
    `A firm's profit from two products is $${profitLatex(p)}$. Find the determinant of its Hessian, $D = \\pi_{11}\\pi_{22} - \\pi_{12}^2$.`,

  answer: (p) => ({ kind: 'numeric', value: hessianDet(p), decimals: 0, ...EXACT }),

  steps(p) {
    const D = hessianDet(p);
    const verdict =
      D > 0
        ? `D > 0 and π₁₁ = ${num(-2 * p.c)} < 0, so the critical point is a maximum: profit bends down in every direction.`
        : 'D < 0, so the critical point is a saddle point: profit rises in some directions and falls in others, and the firm has no best output pair there.';
    return [
      {
        text: 'Find the first partial derivatives.',
        latex: `\\pi_1 = ${num(p.a)}${signed(-2 * p.c, 'Q_1')}${signed(-p.e, 'Q_2')}, \\qquad \\pi_2 = ${num(p.b)}${signed(-2 * p.d, 'Q_2')}${signed(-p.e, 'Q_1')}`,
        why: 'Differentiate with respect to one quantity and hold the other fixed. The square terms give a factor 2; the cross term eQ₁Q₂ gives e times the other quantity.',
      },
      {
        text: 'Differentiate again to get the second partials and the Hessian.',
        latex: `H = \\begin{bmatrix} \\pi_{11} & \\pi_{12} \\\\ \\pi_{21} & \\pi_{22} \\end{bmatrix} = \\begin{bmatrix} ${num(-2 * p.c)} & ${num(-p.e)} \\\\ ${num(-p.e)} & ${num(-2 * p.d)} \\end{bmatrix}`,
        why: 'π₁₂ and π₂₁ are equal (Young’s theorem). For a quadratic profit the second partials are constants, so the Hessian is the same at every point.',
      },
      {
        text: 'Take the determinant.',
        latex: `D = ${factor(-2 * p.c)} \\cdot ${factor(-2 * p.d)} - ${factor(-p.e)}^2 = ${num(4 * p.c * p.d)} - ${num(p.e * p.e)} = ${num(D)}`,
        why: 'The 2×2 determinant is the product down the main diagonal minus the product of the off-diagonal entries; the square of π₁₂ is never negative.',
        result: D,
      },
      {
        text: 'Read off what D says.',
        latex:
          D > 0
            ? 'D > 0,\\ \\pi_{11} < 0 \\Rightarrow \\text{maximum}'
            : 'D < 0 \\Rightarrow \\text{saddle point}',
        why: verdict,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      hessianDet(p),
      [
        { value: p.c * p.d - p.e * p.e, mistakeCode: 'FORGOT_FACTOR_TWO' },
        { value: 4 * p.c * p.d + p.e * p.e, mistakeCode: 'HESSIAN_ADDED' },
        { value: 4 * p.c * p.d - 4 * p.e * p.e, mistakeCode: 'CROSS_DOUBLED' },
        { value: 4 * p.c * p.d, mistakeCode: 'IGNORED_CROSS_TERM' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
