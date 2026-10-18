import { round, withinTolerance } from '../../engine/grading';
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

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const cost = (p: Params, q: number) => round(p.fixedCost + p.unitCost * q + p.b * q * q, 2);
const change = (p: Params) => round(cost(p, p.q2) - cost(p, p.q1), 2);
const squareTerm = (b: number) => (b === 1 ? 'Q^2' : `${num(b)}Q^2`);

/** F03, difficulty 1: evaluate C(Q) = F + aQ + bQ² at two outputs and give the change in cost. */
export const costFunctionChange: Generator<Params> = {
  id: 'cost-function-change',
  title: 'Change in total cost',
  topicId: 'F03',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const b = rng.int(1, 10) / 2;
      // With a half-integer b, even outputs keep b·Q² a whole number.
      const step = Number.isInteger(b) ? 1 : 2;
      const q1 = rng.int(3, 25) * step;
      const p: Params = {
        fixedCost: rng.int(2, 100) * 50,
        unitCost: rng.int(2, 40),
        b,
        q1,
        q2: q1 + rng.int(2, 15) * step,
      };
      // Reject the rare draws where C(Q₂ − Q₁) happens to equal the right answer.
      if (!withinTolerance(cost(p, p.q2 - p.q1), change(p), MONEY.tolerance, MONEY.relTolerance)) {
        return p;
      }
    }
  },

  stem: (p) =>
    `A firm's total cost of producing $Q$ units is $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q + ${squareTerm(p.b)}$. By how much does total cost rise when output increases from $${num(p.q1)}$ to $${num(p.q2)}$ units?`,

  answer: (p) => ({ kind: 'numeric', value: change(p), decimals: 2, ...MONEY }),

  steps: (p) => [
    {
      text: 'Evaluate the cost function at the first output.',
      latex: `C(${num(p.q1)}) = ${num(p.fixedCost)} + ${num(p.unitCost)} \\cdot ${num(p.q1)} + ${num(p.b)} \\cdot ${num(p.q1)}^2 = ${num(cost(p, p.q1))}`,
      why: 'C(Q) is a rule: replace every Q in the formula by the output you are asked about.',
      result: cost(p, p.q1),
    },
    {
      text: 'Evaluate it at the second output.',
      latex: `C(${num(p.q2)}) = ${num(p.fixedCost)} + ${num(p.unitCost)} \\cdot ${num(p.q2)} + ${num(p.b)} \\cdot ${num(p.q2)}^2 = ${num(cost(p, p.q2))}`,
      why: 'The same rule with the new input gives the total cost at the higher output.',
      result: cost(p, p.q2),
    },
    {
      text: 'Subtract to find the change.',
      latex: `\\Delta C = ${num(cost(p, p.q2))} - ${num(cost(p, p.q1))} = ${num(change(p))}`,
      why: 'A change is new value minus old value. The fixed cost appears in both totals, so it cancels.',
      result: change(p),
    },
  ],

  distractors(p) {
    const dq = p.q2 - p.q1;
    return cleanDistractors(
      change(p),
      [
        { value: cost(p, p.q2), mistakeCode: 'LEVEL_NOT_CHANGE' },
        { value: cost(p, dq), mistakeCode: 'EVALUATED_AT_CHANGE' },
        { value: round((p.unitCost + 2 * p.b) * dq, 2), mistakeCode: 'POWER_AS_MULTIPLE' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
