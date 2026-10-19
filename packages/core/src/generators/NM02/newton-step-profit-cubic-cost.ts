import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { term } from '../MV07/two-goods';

export interface NewtonStepParams {
  /** Profit π(q) = Aq − Bq² − Cq³ − F, with output q in hundreds of units. */
  A: number;
  B: number;
  C: number;
  fixedCost: number;
  /** The starting output q₀. */
  q0: number;
}

const TWO_DP = { tolerance: 0.01, relTolerance: 0 } as const;

/** π'(q) = A − 2Bq − 3Cq². */
export const marginalProfit = (p: NewtonStepParams, q: number) =>
  p.A - 2 * p.B * q - 3 * p.C * q * q;
/** π''(q) = −2B − 6Cq. */
export const profitCurvature = (p: NewtonStepParams, q: number) => -2 * p.B - 6 * p.C * q;

/** q₁ = q₀ − π'(q₀)/π''(q₀), to 2 decimal places. */
const newtonPoint = (p: NewtonStepParams) =>
  round(p.q0 - marginalProfit(p, p.q0) / profitCurvature(p, p.q0), 2);

/** NM02, difficulty 2: one Newton step towards the profit-maximising output. */
export const newtonStepProfitCubicCost: Generator<NewtonStepParams> = {
  id: 'newton-step-profit-cubic-cost',
  title: 'One Newton step for maximum profit',
  topicId: 'NM02',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const q0 = rng.int(2, 8);
      const B = rng.int(1, 12);
      const C = rng.int(1, 3);
      // Draw the marginal profit at the start first: positive, so the start is below the top.
      const g0 = rng.int(4, 150);
      const A = g0 + 2 * B * q0 + 3 * C * q0 * q0;
      const h0 = 2 * B + 6 * C * q0;
      // A visible step that does not more than double the output.
      const step = g0 / h0;
      if (step < 0.2 || step > q0) continue;
      return { A, B, C, fixedCost: rng.int(2, 30) * 50, q0 };
    }
  },

  stem: (p) =>
    `A firm's profit is $\\pi(q) = ${term(p.A, 'q')} - ${term(p.B, 'q^2')} - ${term(p.C, 'q^3')} - ${num(p.fixedCost)}$, where $q$ is output in hundreds of units. Starting from $q_0 = ${num(p.q0)}$, take one step of Newton's method for maximising $\\pi$. What is $q_1$? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: newtonPoint(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const g0 = marginalProfit(p, p.q0);
    const h0 = profitCurvature(p, p.q0);
    return [
      {
        text: 'Differentiate profit twice.',
        latex: `\\pi'(q) = ${num(p.A)} - ${term(2 * p.B, 'q')} - ${term(3 * p.C, 'q^2')}, \\qquad \\pi''(q) = -${num(2 * p.B)} - ${term(6 * p.C, 'q')}`,
        why: 'Newton’s method for an optimum looks for a zero of π′, so it needs π′ and its own slope π″.',
      },
      {
        text: 'Evaluate both at the starting output.',
        latex: `\\pi'(${num(p.q0)}) = ${num(p.A)} - ${num(2 * p.B * p.q0)} - ${num(3 * p.C * p.q0 * p.q0)} = ${num(g0)}, \\qquad \\pi''(${num(p.q0)}) = -${num(2 * p.B)} - ${num(6 * p.C * p.q0)} = ${num(h0)}`,
        why: 'π′ > 0 says profit still rises at q₀, so the top lies to the right; π″ < 0 says profit is bending down, as near a maximum.',
        result: g0,
      },
      {
        text: 'Take the Newton step.',
        latex: `q_1 = q_0 - \\frac{\\pi'(q_0)}{\\pi''(q_0)} = ${num(p.q0)} - \\frac{${num(g0)}}{${num(h0)}} ${newtonPoint(p) === p.q0 - g0 / h0 ? '=' : '\\approx'} ${num(newtonPoint(p))}`,
        why: 'Replace π′ near q₀ by its tangent line and move to where that line is zero. Dividing by a negative π″ makes the step positive, towards the top.',
        result: newtonPoint(p),
      },
    ];
  },

  distractors(p) {
    const g0 = marginalProfit(p, p.q0);
    const h = -profitCurvature(p, p.q0);
    return cleanDistractors(
      newtonPoint(p),
      [
        { value: round(p.q0 - g0 / h, 2), mistakeCode: 'NEWTON_SIGN' },
        { value: round(g0 / h, 2), mistakeCode: 'STEP_NOT_POINT' },
        { value: round(p.q0 + h / g0, 2), mistakeCode: 'RATIO_INVERTED' },
        { value: round(p.q0 + g0 / (2 * p.B + 3 * p.C * p.q0), 2), mistakeCode: 'POWER_RULE_SLIP' },
      ],
      TWO_DP.tolerance,
      TWO_DP.relTolerance,
    );
  },
};
