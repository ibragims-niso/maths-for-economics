import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  fixedCost: number;
  unitCost: number;
  /** Coefficient of Q², a multiple of 0.5. */
  b: number;
  q1: number;
  q2: number;
}

/** The answer is exact to the cent, so only a typing slip of a cent is allowed. */
const RATE = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const cost = (p: Params, q: number) => round(p.fixedCost + p.unitCost * q + p.b * q * q, 2);
const change = (p: Params) => round(cost(p, p.q2) - cost(p, p.q1), 2);
const rate = (p: Params) => round(change(p) / (p.q2 - p.q1), 2);
const squareTerm = (b: number) => (b === 1 ? 'Q^2' : `${num(b)}Q^2`);

/** C102, difficulty 1: average rate of change of C(Q) = F + aQ + bQ² between two outputs. */
export const costAverageRateOfChange: Generator<Params> = {
  id: 'cost-average-rate-of-change',
  title: 'Average rate of change of cost',
  topicId: 'C102',
  difficulty: 1,
  timeSec: 100,

  params(rng) {
    const b = rng.int(1, 8) / 2;
    // With a half-integer b, even outputs keep b·Q² a whole number.
    const step = Number.isInteger(b) ? 1 : 2;
    const q1 = rng.int(3, 30) * step;
    return {
      fixedCost: rng.int(2, 80) * 50,
      unitCost: rng.int(2, 40),
      b,
      q1,
      q2: q1 + rng.int(2, 15) * step,
    };
  },

  stem: (p) =>
    `A firm's total cost of producing $Q$ units is $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q + ${squareTerm(p.b)}$. What is the average rate of change of cost, per extra unit, when output rises from $${num(p.q1)}$ to $${num(p.q2)}$ units?`,

  answer: (p) => ({ kind: 'numeric', value: rate(p), decimals: 2, ...RATE }),

  steps: (p) => [
    {
      text: 'Evaluate the cost at both outputs.',
      latex: `C(${num(p.q1)}) = ${num(cost(p, p.q1))}, \\quad C(${num(p.q2)}) = ${num(cost(p, p.q2))}`,
      why: 'The average rate of change compares the function at the start and at the end of the interval.',
    },
    {
      text: 'Find the change in cost.',
      latex: `\\Delta C = ${num(cost(p, p.q2))} - ${num(cost(p, p.q1))} = ${num(change(p))}`,
      why: 'This is how much more the larger output costs in total.',
      result: change(p),
    },
    {
      text: 'Divide by the change in output.',
      latex: `\\dfrac{\\Delta C}{\\Delta Q} = \\dfrac{${num(change(p))}}{${num(p.q2)} - ${num(p.q1)}} = ${num(rate(p))}`,
      why: 'A rate is change per unit: share the extra cost over the extra units. This is the slope of the secant line joining the two points of the cost curve.',
      result: rate(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      rate(p),
      [
        { value: change(p), mistakeCode: 'NOT_DIVIDED' },
        { value: round(change(p) / p.q2, 2), mistakeCode: 'DIVIDED_BY_END' },
        {
          value: round(cost(p, p.q2) / p.q2 - cost(p, p.q1) / p.q1, 2),
          mistakeCode: 'AVERAGE_COST_CHANGE',
        },
      ],
      RATE.tolerance,
      RATE.relTolerance,
    ),
};
