import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Size of the Q² coefficient: profit is −aQ² + bQ − fixedCost. */
  a: number;
  b: number;
  fixedCost: number;
  /** The profit-maximising quantity b/(2a); drawn first so it is whole. */
  best: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const maxProfit = (p: Params) => p.a * p.best * p.best - p.fixedCost;

/** F06, difficulty 2: maximum value of a quadratic profit π(Q) = −aQ² + bQ − c, via the vertex. */
export const maxProfitQuadratic: Generator<Params> = {
  id: 'max-profit-quadratic',
  title: 'Maximum profit from a quadratic',
  topicId: 'F06',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const twoA = rng.int(1, 12); // a = 0.5, 1, 1.5, …, 6
      const best = rng.int(5, 60);
      // An odd 2a with an odd quantity would give a profit ending in .5.
      if (twoA % 2 === 1 && best % 2 === 1) continue;
      const top = (twoA * best * best) / 2; // profit at the top before the fixed cost
      const tens = Math.floor((0.9 * top) / 10); // fixed cost below 90 % of it: profit stays positive
      if (tens < 1) continue;
      const fixedCost = 10 * rng.int(1, tens);
      if (top - fixedCost === best) continue; // the quantity must not equal the answer
      return { a: twoA / 2, b: twoA * best, fixedCost, best };
    }
  },

  stem: (p) =>
    `A firm's weekly profit is $\\pi(Q) = -${p.a === 1 ? '' : num(p.a)}Q^2 + ${num(p.b)}Q - ${num(p.fixedCost)}$, where $Q$ is output. What is the largest profit the firm can make?`,

  answer: (p) => ({ kind: 'numeric', value: maxProfit(p), decimals: 0, ...MONEY }),

  steps: (p) => [
    {
      text: 'Look at the sign of the Q² coefficient.',
      latex: `a = -${num(p.a)} < 0`,
      why: 'A negative coefficient of Q² makes the parabola open downwards, so profit has a highest point: the vertex.',
    },
    {
      text: 'Find the output at the vertex.',
      latex: `Q^* = -\\dfrac{b}{2a} = -\\dfrac{${num(p.b)}}{2 \\cdot (-${num(p.a)})} = ${num(p.best)}`,
      why: 'The vertex lies on the axis of symmetry x = −b/(2a); the curve rises up to it and falls after it.',
      result: p.best,
    },
    {
      text: 'Put that output back into the profit function.',
      latex: `\\pi(${num(p.best)}) = -${num(p.a)} \\cdot ${num(p.best)}^2 + ${num(p.b)} \\cdot ${num(p.best)} - ${num(p.fixedCost)} = ${num(maxProfit(p))}`,
      why: 'The vertex formula gives the output at the top; the maximum profit is the height of the curve there.',
      result: maxProfit(p),
    },
    {
      text: 'Check by completing the square.',
      latex: `\\pi(Q) = -${num(p.a)}(Q - ${num(p.best)})^2 + ${num(maxProfit(p))}`,
      why: 'A square is never negative and here it is multiplied by a negative number, so profit can never exceed the constant at the end, and reaches it only at Q*.',
      result: maxProfit(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      maxProfit(p),
      [
        { value: p.best, mistakeCode: 'QUANTITY_NOT_MAXIMUM' },
        { value: p.a * p.best * p.best, mistakeCode: 'FORGOT_FIXED_COST' },
        // Q = −b/a = 2Q* lands on the mirror image of Q = 0, where profit is −c.
        { value: -p.fixedCost, mistakeCode: 'VERTEX_NO_HALF' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
