import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  fixedCost: number;
  unitCost: number;
  /** Coefficient of Q², a multiple of 0.5. */
  b: number;
  q0: number;
}

/** The answer is exact (at most 2 decimals), so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const cost = (p: Params, q: number) => round(p.fixedCost + p.unitCost * q + p.b * q * q, 2);
/** Slope of the tangent at q₀: the limit of the difference quotient, unitCost + 2b·q₀. */
const slope = (p: Params) => round(p.unitCost + 2 * p.b * p.q0, 2);
const intercept = (p: Params) => round(cost(p, p.q0) - slope(p) * p.q0, 2);
const squareTerm = (b: number) => (b === 1 ? 'Q^2' : `${num(b)}Q^2`);
const plusBh = (b: number) => `+ ${b === 1 ? '' : num(b)}h`;

/** C102, difficulty 3: the intercept of the tangent line to a quadratic cost curve at a given output. */
export const tangentLineIntercept: Generator<Params> = {
  id: 'tangent-line-intercept',
  title: 'Tangent line to a cost curve',
  topicId: 'C102',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    return {
      fixedCost: rng.int(2, 80) * 50,
      unitCost: rng.int(2, 40),
      b: rng.int(1, 6) / 2,
      q0: rng.int(4, 40),
    };
  },

  stem: (p) =>
    `A firm's total cost is $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q + ${squareTerm(p.b)}$. The tangent line to the cost curve at $Q = ${num(p.q0)}$ is $y = mQ + k$. Find $k$, the value of the tangent line at $Q = 0$.`,

  answer: (p) => ({ kind: 'numeric', value: intercept(p), decimals: 2, ...EXACT }),

  steps: (p) => {
    const q0 = num(p.q0);
    return [
      {
        text: 'Find the point of tangency.',
        latex: `C(${q0}) = ${num(p.fixedCost)} + ${num(p.unitCost)} \\cdot ${q0} + ${num(p.b)} \\cdot ${q0}^2 = ${num(cost(p, p.q0))}`,
        why: 'The tangent line touches the curve here, so it passes through this point.',
        result: cost(p, p.q0),
      },
      {
        text: 'Find the slope as the limit of the difference quotient.',
        latex: `\\dfrac{C(${q0} + h) - C(${q0})}{h} = ${num(slope(p))} ${plusBh(p.b)} \\;\\to\\; m = ${num(slope(p))}`,
        why: 'The slope of the tangent is the instantaneous rate of change: the secant slopes approach it as h shrinks to zero.',
        result: slope(p),
      },
      {
        text: 'Write the tangent line through the point with that slope.',
        latex: `y = ${num(cost(p, p.q0))} + ${num(slope(p))}(Q - ${q0})`,
        why: 'A line through (Q₀, C(Q₀)) with slope m is y = C(Q₀) + m(Q − Q₀).',
      },
      {
        text: 'Put Q = 0 to read off the intercept.',
        latex: `k = ${num(cost(p, p.q0))} - ${num(slope(p))} \\cdot ${q0} = ${num(intercept(p))}`,
        why: 'Expanding y = C(Q₀) + m(Q − Q₀) gives y = mQ + (C(Q₀) − m·Q₀). The tangent is a different line from the curve, so k is not the fixed cost.',
        result: intercept(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      intercept(p),
      [
        { value: p.fixedCost, mistakeCode: 'CURVE_INTERCEPT' },
        { value: cost(p, p.q0), mistakeCode: 'POINT_VALUE' },
        { value: round(cost(p, p.q0) + slope(p) * p.q0, 2), mistakeCode: 'INTERCEPT_SIGN' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
