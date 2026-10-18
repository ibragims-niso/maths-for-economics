import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  type ApproxPoint,
  curvatureLatex,
  derivativesAt,
  drawPoint,
  fnLatex,
  slopeLatex,
  targetLatex,
} from './approx-functions';

type Params = ApproxPoint;

/** Four decimals; the second-order term is often in the third or fourth decimal. */
const FOUR_DP = { tolerance: 0.0002, relTolerance: 0 } as const;

const estimate = (p: Params) => {
  const { f0, f1, f2 } = derivativesAt(p);
  return round(f0 + f1 * p.h + 0.5 * f2 * p.h ** 2, 4);
};

function candidates(p: Params) {
  const { f0, f1, f2 } = derivativesAt(p);
  return [
    { value: round(f0 + f1 * p.h, 4), mistakeCode: 'LINEAR_ONLY' },
    { value: round(f0 + f1 * p.h + f2 * p.h ** 2, 4), mistakeCode: 'FORGOT_HALF' },
    { value: round(f0 + f1 * p.h - 0.5 * f2 * p.h ** 2, 4), mistakeCode: 'SECOND_ORDER_SIGN' },
    { value: round(f0 + f1 * p.h + 0.5 * f2 * p.h, 4), mistakeCode: 'FORGOT_SQUARE' },
  ];
}

/** C111, difficulty 3: estimate f(a + h) with the quadratic approximation f(a) + f′(a)h + ½f″(a)h². */
export const quadraticApproximationEstimate: Generator<Params> = {
  id: 'quadratic-approximation-estimate',
  title: 'Estimate with the quadratic approximation',
  topicId: 'C111',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p = drawPoint(rng);
      const { f2 } = derivativesAt(p);
      // The curvature term must show in the 4th decimal, or the question is the linear one again.
      if (Math.abs(0.5 * f2 * p.h ** 2) < 0.0005) continue;
      if (cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0).length >= 3) return p;
    }
  },

  stem: (p) =>
    `Use the quadratic (second-order) approximation of $f(x) = ${fnLatex(p.fn)}$ at $a = ${num(p.a)}$ to estimate $${targetLatex(p)}$. Give your answer to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 4, ...FOUR_DP }),

  steps(p) {
    const { f0, f1, f2 } = derivativesAt(p);
    const term = 0.5 * f2 * p.h ** 2;
    const ans = estimate(p);
    return [
      {
        text: `Take a = ${num(p.a)} and h = ${num(p.h, 3)}, and evaluate the function at a.`,
        latex: `${targetLatex(p)} = f(${num(p.a)} ${p.h < 0 ? '-' : '+'} ${num(Math.abs(p.h), 3)}), \\quad f(${num(p.a)}) = ${num(f0)}`,
        why: 'The approximation is built from what we know exactly at the nearby point a.',
        result: f0,
      },
      {
        text: 'Find the first derivative at a.',
        latex: slopeLatex(p),
        why: 'f′(a) gives the tangent line, the first-order part of the estimate.',
        result: f1,
      },
      {
        text: 'Find the second derivative at a.',
        latex: curvatureLatex(p),
        why: 'f″(a) measures how the curve bends away from its tangent; it gives the correction term.',
        result: f2,
      },
      {
        text: 'Add the curvature term ½f″(a)h² to the tangent-line estimate.',
        latex: `f(a + h) \\approx ${num(f0)} + ${num(f1, 6)} \\cdot (${num(p.h, 3)}) + \\tfrac{1}{2} \\cdot (${num(f2, 6)}) \\cdot (${num(p.h, 3)})^2 = ${num(round(f0 + f1 * p.h, 6), 6)} ${term < 0 ? '-' : '+'} ${num(Math.abs(term), 6)} = ${num(ans, 4)}`,
        why: `The ½ is there because the second derivative of h² is 2, so ½f″(a)h² bends exactly as much as the curve does at a. Here f″(a) ${f2 < 0 ? '< 0, the curve bends below its tangent and the correction is negative' : '> 0, the curve bends above its tangent and the correction is positive'}.`,
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0),
};
