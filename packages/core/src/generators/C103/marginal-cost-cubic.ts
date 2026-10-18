import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  fixedCost: number;
  a: number;
  b: number;
  c: number;
  /** The output at which marginal cost is asked. */
  q: number;
}

/** A coefficient in front of a power: 1 is not written. */
const coef = (x: number) => (x === 1 ? '' : num(x));

const cost = (p: Params, q: number) => p.fixedCost + p.a * q - p.b * q ** 2 + p.c * q ** 3;
const marginalCost = (p: Params) => round(p.a - 2 * p.b * p.q + 3 * p.c * p.q ** 2, 2);

function candidates(p: Params) {
  return [
    {
      value: round(p.a - p.b * p.q + p.c * p.q ** 2, 2),
      mistakeCode: 'FORGOT_POWER',
    },
    { value: round(p.fixedCost + marginalCost(p), 2), mistakeCode: 'KEPT_CONSTANT' },
    { value: round(cost(p, p.q) / p.q, 2), mistakeCode: 'AVERAGE_NOT_MARGINAL' },
  ];
}

/** C103, difficulty 1: marginal cost C′(q₀) for a cubic cost C(q) = F + aq − bq² + cq³. */
export const marginalCostCubic: Generator<Params> = {
  id: 'marginal-cost-cubic',
  title: 'Marginal cost from a cubic cost function',
  topicId: 'C103',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const c = rng.pick([0.1, 0.2, 0.5, 1, 2] as const);
      const p: Params = {
        fixedCost: rng.int(2, 60) * 50,
        a: rng.int(10, 200),
        b: rng.int(1, 20),
        c,
        q: rng.int(2, c >= 1 ? 15 : 30),
      };
      // b² < 3ac keeps marginal cost positive at every output: a sensible cost function.
      if (p.b ** 2 >= 3 * p.a * p.c) continue;
      if (cleanDistractors(marginalCost(p), candidates(p)).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm's total cost of producing $q$ units is $C(q) = ${num(p.fixedCost)} + ${num(p.a)}q - ${coef(p.b)}q^2 + ${coef(p.c)}q^3$. What is the marginal cost $C'(q)$ at $q = ${p.q}$?`,

  answer: (p) => ({ kind: 'numeric', value: marginalCost(p), decimals: 2 }),

  steps(p) {
    const mc = marginalCost(p);
    return [
      {
        text: 'Differentiate each term with the power rule.',
        latex: `\\dfrac{d}{dq}\\,${num(p.fixedCost)} = 0, \\quad \\dfrac{d}{dq}\\,${num(p.a)}q = ${num(p.a)}, \\quad \\dfrac{d}{dq}\\,${coef(p.b)}q^2 = ${num(2 * p.b)}q, \\quad \\dfrac{d}{dq}\\,${coef(p.c)}q^3 = ${num(3 * p.c)}q^2`,
        why: 'The fixed cost does not change with output, so its derivative is 0. For a power, bring the exponent down as a factor and lower it by one; a constant in front stays.',
      },
      {
        text: 'Add the derivatives of the terms.',
        latex: `C'(q) = ${num(p.a)} - ${num(2 * p.b)}q + ${num(3 * p.c)}q^2`,
        why: 'The derivative of a sum is the sum of the derivatives (sum rule), and minus signs carry through.',
      },
      {
        text: `Put q = ${p.q} into the marginal cost.`,
        latex: `C'(${p.q}) = ${num(p.a)} - ${num(2 * p.b * p.q)} + ${num(3 * p.c * p.q ** 2)} = ${num(mc)}`,
        why: 'Marginal cost is the rate at which total cost rises at this output, close to the cost of one more unit.',
        result: mc,
      },
    ];
  },

  distractors: (p) => cleanDistractors(marginalCost(p), candidates(p)),
};
