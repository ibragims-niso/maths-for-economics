import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  alpha: number;
  beta: number;
  /** The revenue-maximising quantity α/(2β); drawn first so it is whole. */
  best: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** F06, difficulty 1: maximum revenue for linear inverse demand P = α − βQ, found with the vertex. */
export const maxRevenueLinearDemand: Generator<Params> = {
  id: 'max-revenue-linear-demand',
  title: 'Maximum revenue',
  topicId: 'F06',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const twoBeta = rng.int(1, 16); // β = 0.5, 1, 1.5, …, 8
      const best = rng.int(5, 200);
      // An odd 2β with an odd quantity would give a price and revenue ending in .5.
      if (twoBeta % 2 === 1 && best % 2 === 1) continue;
      return { alpha: twoBeta * best, beta: twoBeta / 2, best };
    }
  },

  stem: (p) =>
    `A firm faces the inverse demand curve $P = ${linearDemand(p.alpha, p.beta, 'Q')}$, where $Q$ is the quantity it sells. What is the largest revenue it can earn?`,

  answer: (p) => ({ kind: 'numeric', value: p.beta * p.best * p.best, decimals: 0, ...MONEY }),

  steps(p) {
    const price = p.alpha - p.beta * p.best;
    const revenue = price * p.best;
    return [
      {
        text: 'Write revenue as price times quantity.',
        latex: `R(Q) = (${linearDemand(p.alpha, p.beta, 'Q')})Q = ${num(p.alpha)}Q - ${p.beta === 1 ? '' : num(p.beta)}Q^2`,
        why: 'Buyers pay the price on the demand curve, and that price falls as the firm sells more. The Q² term has a negative coefficient, so the graph is a hill with a highest point.',
      },
      {
        text: 'Find the top of the parabola with the vertex formula.',
        latex: `Q^* = -\\dfrac{${num(p.alpha)}}{2 \\cdot (-${num(p.beta)})} = ${num(p.best)}`,
        why: 'For y = ax² + bx + c the top or bottom is at x = −b/(2a). It is also halfway between the roots Q = 0 and Q = α/β, where revenue is zero.',
        result: p.best,
      },
      {
        text: 'Find the price at that quantity.',
        latex: `P = ${num(p.alpha)} - ${num(p.beta)} \\cdot ${num(p.best)} = ${num(price)}`,
        why: 'The demand curve gives the price buyers will pay when the firm sells Q* units.',
        result: price,
      },
      {
        text: 'Multiply the price by the quantity.',
        latex: `R_{\\max} = ${num(price)} \\cdot ${num(p.best)} = ${num(revenue)}`,
        why: 'The vertex formula only says where the top is; the height of the curve there is the maximum revenue.',
        result: revenue,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      p.beta * p.best * p.best,
      [
        { value: p.best, mistakeCode: 'QUANTITY_NOT_MAXIMUM' },
        { value: p.alpha - p.beta * p.best, mistakeCode: 'PRICE_NOT_REVENUE' },
        { value: p.alpha * p.best, mistakeCode: 'INTERCEPT_PRICE' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
