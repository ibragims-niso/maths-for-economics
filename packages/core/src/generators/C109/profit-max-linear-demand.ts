import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  alpha: number;
  beta: number;
  unitCost: number;
  fixedCost: number;
  /** Drawn first so the optimal quantity is whole. */
  best: number;
}

/** C109, difficulty 1: profit-maximising quantity with linear inverse demand and linear cost. */
export const profitMaxLinearDemand: Generator<Params> = {
  id: 'profit-max-linear-demand',
  title: 'Profit-maximising quantity',
  topicId: 'C109',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    const beta = rng.int(1, 5);
    const best = rng.int(5, 60);
    const unitCost = rng.int(2, 40);
    return {
      alpha: unitCost + 2 * beta * best,
      beta,
      unitCost,
      fixedCost: rng.int(1, 40) * 50,
      best,
    };
  },

  stem: (p) =>
    `A firm faces inverse demand $P = ${num(p.alpha)} - ${p.beta === 1 ? '' : num(p.beta)}Q$ and has costs $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q$. Which quantity maximises its profit?`,

  answer: (p) => ({ kind: 'numeric', value: p.best, decimals: 2 }),

  steps: (p) => [
    {
      text: 'Write profit as revenue minus cost.',
      latex: `\\pi(Q) = (${num(p.alpha)} - ${num(p.beta)}Q)Q - ${num(p.fixedCost)} - ${num(p.unitCost)}Q`,
      why: 'Revenue is price times quantity, and the price depends on how much the firm sells.',
    },
    {
      text: 'Differentiate and set the derivative to zero.',
      latex: `\\pi'(Q) = ${num(p.alpha)} - ${num(2 * p.beta)}Q - ${num(p.unitCost)} = 0`,
      why: 'At a maximum the profit curve is flat. This is the same as marginal revenue equals marginal cost.',
    },
    {
      text: 'Solve for Q.',
      latex: `Q^* = \\dfrac{${num(p.alpha)} - ${num(p.unitCost)}}{${num(2 * p.beta)}} = ${num(p.best)}`,
      why: 'Move the Q term to one side and divide.',
      result: p.best,
    },
    {
      text: 'Check it is a maximum.',
      latex: `\\pi''(Q) = -${num(2 * p.beta)} < 0`,
      why: 'A negative second derivative means the curve bends down, so the flat point is a peak, not a trough.',
    },
  ],

  distractors: (p) =>
    cleanDistractors(p.best, [
      { value: round(p.alpha / (2 * p.beta), 2), mistakeCode: 'FORGOT_COST' },
      { value: 2 * p.best, mistakeCode: 'PRICE_EQUALS_COST' },
      { value: p.alpha - p.beta * p.best, mistakeCode: 'PRICE_NOT_QUANTITY' },
    ]),
};
