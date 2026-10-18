import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  type ApproxPoint,
  derivativesAt,
  drawPoint,
  fnLatex,
  slope,
  slopeLatex,
  targetLatex,
  value,
} from './approx-functions';

type Params = ApproxPoint;

/**
 * Four decimals are asked for, and the tangent-line estimate often differs from the true value
 * only in the third or fourth decimal, so the tolerance is tight (rounding slips only).
 */
const FOUR_DP = { tolerance: 0.0002, relTolerance: 0 } as const;

const estimate = (p: Params) => {
  const { f0, f1 } = derivativesAt(p);
  return round(f0 + f1 * p.h, 4);
};

function candidates(p: Params) {
  const { f0, f1 } = derivativesAt(p);
  return [
    { value: round(f0, 4), mistakeCode: 'VALUE_ONLY' },
    { value: round(f1 * p.h, 4), mistakeCode: 'CHANGE_ONLY' },
    { value: round(f0 + slope(p.fn, p.a + p.h) * p.h, 4), mistakeCode: 'SLOPE_AT_NEW_POINT' },
    { value: round(value(p.fn, p.a + p.h), 4), mistakeCode: 'EXACT_VALUE' },
  ];
}

/** C111, difficulty 1: estimate f(a + h) with the tangent line f(a) + f′(a)h. */
export const linearApproximationEstimate: Generator<Params> = {
  id: 'linear-approximation-estimate',
  title: 'Estimate with the tangent line',
  topicId: 'C111',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const p = drawPoint(rng);
      // At least three distinct wrong answers, so a slip is recognised.
      if (cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0).length >= 3) return p;
    }
  },

  stem: (p) =>
    `Use the linear approximation (the tangent line) of $f(x) = ${fnLatex(p.fn)}$ at $a = ${num(p.a)}$ to estimate $${targetLatex(p)}$. Give your answer to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 4, ...FOUR_DP }),

  steps(p) {
    const { f0, f1 } = derivativesAt(p);
    const ans = estimate(p);
    return [
      {
        text: 'Write the number as f(a + h).',
        latex: `${targetLatex(p)} = f(${num(p.a)} ${p.h < 0 ? '-' : '+'} ${num(Math.abs(p.h), 3)}), \\quad a = ${num(p.a)}, \\; h = ${num(p.h, 3)}`,
        why: 'The point a is close by and f(a) is easy to work out exactly; h is how far we move away from it.',
      },
      {
        text: 'Evaluate the function at a.',
        latex: `f(${num(p.a)}) = ${num(f0)}`,
        why: 'The tangent line passes through the point (a, f(a)) on the curve.',
        result: f0,
      },
      {
        text: 'Find the slope at a.',
        latex: slopeLatex(p),
        why: 'The derivative at a is the slope of the tangent line: how fast f changes per unit of x near a.',
        result: f1,
      },
      {
        text: 'Move along the tangent line by h.',
        latex: `f(a + h) \\approx f(a) + f'(a)\\,h = ${num(f0)} + ${num(f1, 6)} \\cdot (${num(p.h, 3)}) = ${num(ans, 4)}`,
        why: 'Near a the curve and its tangent are almost the same, so the change in f is about slope × step.',
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0),
};
