import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  price: number;
  unitCost: number;
  fixedCost: number;
  /** Drawn first so the answer is a whole number of units. */
  breakEven: number;
}

/** F04, difficulty 1: break-even quantity with linear revenue and cost. */
export const linearBreakEven: Generator<Params> = {
  id: 'linear-break-even',
  title: 'Break-even quantity',
  topicId: 'F04',
  difficulty: 1,
  timeSec: 60,

  params(rng) {
    const price = rng.int(8, 60);
    const unitCost = rng.int(2, price - 2);
    const breakEven = rng.int(20, 500);
    return { price, unitCost, fixedCost: breakEven * (price - unitCost), breakEven };
  },

  stem: (p) =>
    `A firm sells its product for $${num(p.price)}$ per unit. Each unit costs $${num(p.unitCost)}$ to make, and fixed costs are $${num(p.fixedCost)}$. How many units must it sell to break even?`,

  answer: (p) => ({ kind: 'numeric', value: p.breakEven, decimals: 0 }),

  steps: (p) => [
    {
      text: 'Write revenue and cost as linear functions of quantity.',
      latex: `R(Q) = ${num(p.price)}Q, \\quad C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q`,
      why: 'Revenue grows by the price for each unit sold; cost is the fixed part plus the unit cost for each unit.',
    },
    {
      text: 'Find how much each unit contributes towards the fixed costs.',
      latex: `${num(p.price)} - ${num(p.unitCost)} = ${num(p.price - p.unitCost)}`,
      why: 'Each unit sold brings in the price but costs the unit cost; the difference pays off the fixed costs.',
      result: p.price - p.unitCost,
    },
    {
      text: 'Divide the fixed costs by that contribution.',
      latex: `Q = \\dfrac{${num(p.fixedCost)}}{${num(p.price - p.unitCost)}} = ${num(p.breakEven)}`,
      why: 'Break-even is where R(Q) = C(Q), which rearranges to Q = fixed cost / (price − unit cost).',
      result: p.breakEven,
    },
  ],

  distractors: (p) =>
    cleanDistractors(p.breakEven, [
      { value: round(p.fixedCost / p.price, 2), mistakeCode: 'IGNORED_UNIT_COST' },
      { value: round(p.fixedCost / (p.price + p.unitCost), 2), mistakeCode: 'ADDED_UNIT_COST' },
      { value: round(p.fixedCost / p.unitCost, 2), mistakeCode: 'DIVIDED_BY_COST' },
    ]),
};
