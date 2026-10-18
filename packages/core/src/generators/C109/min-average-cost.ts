import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  fixedCost: number;
  unitCost: number;
  k: number;
  /** Drawn first so the minimising quantity is whole: fixedCost = k · best². */
  best: number;
}

/** C109, difficulty 2: output that minimises average cost for C(Q) = F + cQ + kQ². */
export const minAverageCost: Generator<Params> = {
  id: 'min-average-cost',
  title: 'Output with the lowest average cost',
  topicId: 'C109',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    const k = rng.int(1, 5);
    const best = rng.int(5, 40);
    return { fixedCost: k * best * best, unitCost: rng.int(2, 30), k, best };
  },

  stem: (p) =>
    `A firm's total cost is $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q + ${p.k === 1 ? '' : num(p.k)}Q^2$. At what output is average cost lowest?`,

  answer: (p) => ({ kind: 'numeric', value: p.best, decimals: 2 }),

  steps: (p) => [
    {
      text: 'Divide total cost by Q to get average cost.',
      latex: `AC(Q) = \\dfrac{${num(p.fixedCost)}}{Q} + ${num(p.unitCost)} + ${num(p.k)}Q`,
      why: 'Average cost is cost per unit: total cost shared over all units produced.',
    },
    {
      text: 'Differentiate and set the derivative to zero.',
      latex: `AC'(Q) = -\\dfrac{${num(p.fixedCost)}}{Q^2} + ${num(p.k)} = 0`,
      why: 'Average cost first falls (fixed cost is spread wider) and then rises (the Q² term); the lowest point is where the slope is zero.',
    },
    {
      text: 'Solve for Q.',
      latex: `Q^2 = \\dfrac{${num(p.fixedCost)}}{${num(p.k)}} = ${num(p.best * p.best)} \\;\\Rightarrow\\; Q^* = ${num(p.best)}`,
      why: 'Take the positive square root, because output cannot be negative.',
      result: p.best,
    },
    {
      text: 'Check it is a minimum.',
      latex: `AC''(Q) = \\dfrac{${num(2 * p.fixedCost)}}{Q^3} > 0`,
      why: 'A positive second derivative means the curve bends up, so the flat point is the lowest point.',
    },
  ],

  distractors: (p) =>
    cleanDistractors(p.best, [
      { value: p.best * p.best, mistakeCode: 'FORGOT_ROOT' },
      { value: round(Math.sqrt(p.fixedCost / (2 * p.k)), 2), mistakeCode: 'DERIVATIVE_SLIP' },
      { value: round(Math.sqrt(p.fixedCost) / p.k, 2), mistakeCode: 'ROOT_OF_FIXED_ONLY' },
    ]),
};
