import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { signed, term } from '../MV07/two-goods';

export interface StableStepParams {
  /** Loss L = cβ₁² + eβ₁β₂ + dβ₂² − gβ₁ − hβ₂ + k, with Hessian [[2c, e], [e, 2d]]. */
  c: number;
  d: number;
  e: number;
  g: number;
  h: number;
  k: number;
}

/** Four decimal places; the rounding error is far below the gaps to the distractors. */
const FOUR_DP = { tolerance: 0.0002, relTolerance: 0 } as const;

/** (|c − d|, |e|, t) with (c − d)² + e² = t², so the eigenvalues c + d ± t are whole numbers. */
const TRIPLES = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [0, 2, 2],
  [0, 3, 3],
  [0, 4, 4],
] as const;

/** The eigenvalues of the Hessian [[2c, e], [e, 2d]]: c + d ± √((c − d)² + e²). */
export function hessianEigenvalues(p: StableStepParams): [max: number, min: number] {
  const t = Math.sqrt((p.c - p.d) ** 2 + p.e * p.e);
  return [p.c + p.d + t, p.c + p.d - t];
}

const bound = (p: StableStepParams) => round(2 / hessianEigenvalues(p)[0], 4);

const lossLatex = (p: StableStepParams) =>
  `L(\\beta_1, \\beta_2) = ${term(p.c, '\\beta_1^2')}${signed(p.e, '\\beta_1\\beta_2')}${signed(p.d, '\\beta_2^2')} - ${term(p.g, '\\beta_1')} - ${term(p.h, '\\beta_2')} + ${num(p.k)}`;

/** NM02, difficulty 3: the largest stable step size of gradient descent on a two-parameter quadratic loss. */
export const gradientDescentLargestStableStep: Generator<StableStepParams> = {
  id: 'gradient-descent-largest-stable-step',
  title: 'Largest stable step size',
  topicId: 'NM02',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const [gap, cross, t] = rng.pick(TRIPLES);
      const d = rng.int(1, 12);
      const c = d + rng.pick([1, -1] as const) * gap;
      // Positive curvature in every direction (both eigenvalues above 0): a bowl with one bottom.
      if (c < 1 || c + d - t < 1) continue;
      return {
        c,
        d,
        e: rng.pick([1, -1] as const) * cross,
        g: rng.int(1, 60),
        h: rng.int(1, 60),
        k: rng.int(2, 40) * 5,
      };
    }
  },

  stem: (p) =>
    `An analyst estimates two parameters by minimising the loss $${lossLatex(p)}$ with gradient descent, $\\beta_{\\text{new}} = \\beta - \\alpha \\nabla L(\\beta)$. The method converges from every starting point exactly when $0 < \\alpha < \\bar\\alpha$. Find $\\bar\\alpha$. Give your answer to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: bound(p), decimals: 4, ...FOUR_DP }),

  steps(p) {
    const [max, min] = hessianEigenvalues(p);
    const t = (max - min) / 2;
    const e = p.e < 0 ? `(${num(p.e)})` : num(p.e);
    return [
      {
        text: 'Write down the Hessian of the loss.',
        latex: `H = \\begin{bmatrix} ${num(2 * p.c)} & ${num(p.e)} \\\\ ${num(p.e)} & ${num(2 * p.d)} \\end{bmatrix}`,
        why: 'The squared terms give 2c and 2d on the diagonal and the cross term gives e off it. The linear terms and the constant only move the bottom of the bowl, not its curvature, so they play no part.',
      },
      {
        text: 'Find its eigenvalues.',
        latex: `\\lambda = \\frac{${num(2 * p.c)} + ${num(2 * p.d)}}{2} \\pm \\sqrt{\\left(\\frac{${num(2 * p.c)} - ${num(2 * p.d)}}{2}\\right)^2 + ${e}^2} = ${num(p.c + p.d)} \\pm ${num(t)}, \\quad \\lambda_{\\max} = ${num(max)},\\ \\lambda_{\\min} = ${num(min)}`,
        why: 'The eigenvalues are the curvatures of the loss along its two main directions. Check: they add up to the trace and multiply to the determinant of H.',
        result: max,
      },
      {
        text: 'Apply the stability bound with the largest curvature.',
        latex: `\\bar\\alpha = \\frac{2}{\\lambda_{\\max}} = \\frac{2}{${num(max)}} ${bound(p) === 2 / max ? '=' : '\\approx'} ${num(bound(p), 4)}`,
        why: 'Along a direction with curvature λ each step multiplies the distance to the bottom by 1 − αλ. That shrinks only if |1 − αλ| < 1, that is α < 2/λ, and the steepest direction gives the tightest limit.',
        result: bound(p),
      },
    ];
  },

  distractors(p) {
    const [max, min] = hessianEigenvalues(p);
    return cleanDistractors(
      bound(p),
      [
        { value: round(2 / min, 4), mistakeCode: 'USED_SMALLEST_CURVATURE' },
        { value: round(1 / max, 4), mistakeCode: 'BOUND_ONE_OVER' },
        { value: round(1 / Math.max(p.c, p.d), 4), mistakeCode: 'IGNORED_CROSS_TERM' },
      ],
      FOUR_DP.tolerance,
      FOUR_DP.relTolerance,
    );
  },
};
