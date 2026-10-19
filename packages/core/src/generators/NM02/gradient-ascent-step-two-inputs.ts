import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { signed, term } from '../MV07/two-goods';

export interface GradientStepParams {
  /** Profit π = aL + bK − cL² − dK² − eLK − F (e may be negative: then +|e|LK). */
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  fixedCost: number;
  /** The starting point (L₀, K₀). */
  l0: number;
  k0: number;
  /** The step size α. */
  alpha: number;
  /** Which coordinate of the new point is asked for: 1 = L₁, 2 = K₁. */
  ask: 1 | 2;
}

/** Whole-number gradients times a step size with at most 2 decimals: the answer is exact. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;
const ALPHAS = [0.02, 0.04, 0.05, 0.1, 0.2, 0.25] as const;

/** The gradient (π_L, π_K) = (a − 2cL − eK, b − 2dK − eL). */
export const profitGradient = (p: GradientStepParams, l: number, k: number): [number, number] => [
  p.a - 2 * p.c * l - p.e * k,
  p.b - 2 * p.d * k - p.e * l,
];

/** The largest eigenvalue of −H = [[2c, e], [e, 2d]]: c + d + √((c − d)² + e²). */
export const largestCurvature = (c: number, d: number, e: number) =>
  c + d + Math.sqrt((c - d) ** 2 + e * e);

const newPoint = (p: GradientStepParams) => {
  const [gl, gk] = profitGradient(p, p.l0, p.k0);
  return [round(p.l0 + p.alpha * gl, 2), round(p.k0 + p.alpha * gk, 2)] as const;
};

const profitLatex = (p: GradientStepParams) =>
  `\\pi = ${term(p.a, 'L')}${signed(p.b, 'K')}${signed(-p.c, 'L^2')}${signed(-p.d, 'K^2')}${signed(-p.e, 'LK')} - ${num(p.fixedCost)}`;

/** NM02, difficulty 1: one step of gradient ascent for a firm's profit in two inputs. */
export const gradientAscentStepTwoInputs: Generator<GradientStepParams> = {
  id: 'gradient-ascent-step-two-inputs',
  title: 'One gradient-ascent step',
  topicId: 'NM02',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const c = rng.int(1, 4);
      const d = rng.int(1, 4);
      const e = rng.pick([-2, -1, 1, 2, 3, 4]);
      // Profit must be concave (a hill), so the search has a top to climb to.
      if (4 * c * d - e * e <= 0) continue;
      // Draw the best inputs first, then the linear coefficients that put the top there.
      const lStar = rng.int(4, 30);
      const kStar = rng.int(4, 30);
      const a = 2 * c * lStar + e * kStar;
      const b = 2 * d * kStar + e * lStar;
      if (a <= 0 || b <= 0) continue;
      const l0 = rng.int(1, 30);
      const k0 = rng.int(1, 30);
      const alpha = rng.pick(ALPHAS);
      // A step size small enough that the climb never overshoots in any direction.
      if (alpha * largestCurvature(c, d, e) >= 1) continue;
      const p: GradientStepParams = {
        a,
        b,
        c,
        d,
        e,
        fixedCost: rng.int(2, 40) * 25,
        l0,
        k0,
        alpha,
        ask: rng.pick([1, 2] as const),
      };
      const [gl, gk] = profitGradient(p, l0, k0);
      // Both slopes non-zero and a visible move in the coordinate asked for.
      if (gl === 0 || gk === 0) continue;
      if (Math.abs(alpha * (p.ask === 1 ? gl : gk)) < 0.1) continue;
      const [l1, k1] = newPoint(p);
      if (l1 <= 0 || k1 <= 0) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm's profit from $L$ hundred hours of labour and $K$ hundred machine-hours is $${profitLatex(p)}$. It searches for the best inputs by gradient ascent with step size $\\alpha = ${num(p.alpha)}$, starting from $(L_0, K_0) = (${num(p.l0)}, ${num(p.k0)})$. After one step, what is $${p.ask === 1 ? 'L_1' : 'K_1'}$? Give your answer to 2 decimal places.`,

  answer: (p) => {
    const [l1, k1] = newPoint(p);
    return { kind: 'numeric', value: p.ask === 1 ? l1 : k1, decimals: 2, ...EXACT };
  },

  steps(p) {
    const [gl, gk] = profitGradient(p, p.l0, p.k0);
    const [l1, k1] = newPoint(p);
    const crossSign = p.e > 0 ? '-' : '+';
    const crossCoef = Math.abs(p.e) === 1 ? '' : `${num(Math.abs(p.e))} \\cdot `;
    const g = p.ask === 1 ? gl : gk;
    const x0 = p.ask === 1 ? p.l0 : p.k0;
    const name = p.ask === 1 ? 'L' : 'K';
    return [
      {
        text: 'Find the two partial derivatives of profit.',
        latex: `\\pi_L = ${num(p.a)}${signed(-2 * p.c, 'L')}${signed(-p.e, 'K')}, \\qquad \\pi_K = ${num(p.b)}${signed(-2 * p.d, 'K')}${signed(-p.e, 'L')}`,
        why: 'The gradient (π_L, π_K) points in the direction in which profit rises fastest. The cross term eLK gives e times the other input in each partial derivative.',
      },
      {
        text: 'Evaluate the gradient at the starting point.',
        latex: `\\pi_L = ${num(p.a)} - ${num(2 * p.c)} \\cdot ${num(p.l0)} ${crossSign} ${crossCoef}${num(p.k0)} = ${num(gl)}, \\qquad \\pi_K = ${num(p.b)} - ${num(2 * p.d)} \\cdot ${num(p.k0)} ${crossSign} ${crossCoef}${num(p.l0)} = ${num(gk)}`,
        why: 'Gradient ascent only needs the slopes where it stands now; a positive slope says more of that input raises profit.',
        result: g,
      },
      {
        text: `Move from the start along the gradient, scaled by the step size.`,
        latex: `${name}_1 = ${name}_0 + \\alpha\\,\\pi_${name} = ${num(x0)} + ${num(p.alpha)} \\cdot ${g < 0 ? `(${num(g)})` : num(g)} = ${num(p.ask === 1 ? l1 : k1)}`,
        why: `To maximise, step uphill: add α times the gradient. The new point is (${num(l1)}, ${num(k1)}); a second step would start again from the gradient there.`,
        result: p.ask === 1 ? l1 : k1,
      },
    ];
  },

  distractors(p) {
    const [gl, gk] = profitGradient(p, p.l0, p.k0);
    const g = p.ask === 1 ? gl : gk;
    const x0 = p.ask === 1 ? p.l0 : p.k0;
    const other = p.ask === 1 ? p.k0 : p.l0;
    // Without the cross term the slope would be g + e·(other input).
    const noCross = g + p.e * other;
    const [l1, k1] = newPoint(p);
    return cleanDistractors(
      p.ask === 1 ? l1 : k1,
      [
        { value: round(x0 - p.alpha * g, 2), mistakeCode: 'DESCENT_FOR_MAX' },
        { value: round(x0 + g, 2), mistakeCode: 'NO_STEP_SIZE' },
        { value: round(p.alpha * g, 2), mistakeCode: 'STEP_NOT_POINT' },
        { value: round(x0 + p.alpha * noCross, 2), mistakeCode: 'IGNORED_CROSS_TERM' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
