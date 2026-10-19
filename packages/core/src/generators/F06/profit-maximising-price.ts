import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num, withTwoDistractors } from '../format';

interface Params {
  alpha: number;
  beta: number;
  unitCost: number;
  fixedCost: number;
  /** The profit-maximising quantity (α − v)/(2β); drawn first so it is whole. */
  best: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const bestPrice = (p: Params) => p.alpha - p.beta * p.best;

/** F06, difficulty 3: the profit-maximising price for P = α − βQ and C(Q) = F + vQ, via the vertex. */
export const profitMaximisingPrice: Generator<Params> = withTwoDistractors({
  id: 'profit-maximising-price',
  title: 'Profit-maximising price',
  topicId: 'F06',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const twoBeta = rng.int(1, 12); // β = 0.5, 1, 1.5, …, 6
      const best = rng.int(5, 80);
      // An odd 2β with an odd quantity would give a price ending in .5.
      if (twoBeta % 2 === 1 && best % 2 === 1) continue;
      const beta = twoBeta / 2;
      const unitCost = rng.int(2, 60);
      // Keep "gave the quantity" distinguishable from the price.
      if (Math.abs(unitCost + beta * best - best) < 1) continue;
      const top = beta * best * best; // profit at the best output before the fixed cost
      const tens = Math.floor((0.8 * top) / 10); // fixed cost below 80 % of it: profit stays positive
      if (tens < 1) continue;
      return {
        alpha: unitCost + twoBeta * best,
        beta,
        unitCost,
        fixedCost: 10 * rng.int(1, tens),
        best,
      };
    }
  },

  stem: (p) =>
    `A firm faces the inverse demand curve $P = ${linearDemand(p.alpha, p.beta, 'Q')}$ and has costs $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q$. What price should it charge to make the largest profit?`,

  answer: (p) => ({ kind: 'numeric', value: bestPrice(p), decimals: 0, ...MONEY }),

  steps: (p) => [
    {
      text: 'Write profit as revenue minus cost.',
      latex: `\\pi(Q) = (${linearDemand(p.alpha, p.beta, 'Q')})Q - ${num(p.fixedCost)} - ${num(p.unitCost)}Q = -${p.beta === 1 ? '' : num(p.beta)}Q^2 + ${num(p.alpha - p.unitCost)}Q - ${num(p.fixedCost)}`,
      why: 'Revenue is price times quantity, and the price depends on how much is sold. Profit is a quadratic with a negative Q² coefficient, so it has a highest point.',
    },
    {
      text: 'Find the output at the vertex.',
      latex: `Q^* = -\\dfrac{${num(p.alpha - p.unitCost)}}{2 \\cdot (-${num(p.beta)})} = ${num(p.best)}`,
      why: 'The top of y = ax² + bx + c is at x = −b/(2a). The fixed cost only shifts the curve down; it does not move the top sideways.',
      result: p.best,
    },
    {
      text: 'Read the price off the demand curve.',
      latex: `P^* = ${num(p.alpha)} - ${num(p.beta)} \\cdot ${num(p.best)} = ${num(bestPrice(p))}`,
      why: 'The firm cannot choose price and quantity separately: to sell Q* units it must charge the price on the demand curve at Q*.',
      result: bestPrice(p),
    },
    {
      text: 'Compare with the price that maximises revenue.',
      latex: `P^* = ${num(bestPrice(p))} > \\dfrac{${num(p.alpha)}}{2} = ${num(p.alpha / 2)}`,
      why: 'Ignoring costs, revenue peaks at the price α/2. Each unit costs something to make, so the profit-seeking firm sells fewer units at a higher price.',
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      bestPrice(p),
      [
        { value: p.best, mistakeCode: 'QUANTITY_NOT_PRICE' },
        { value: p.alpha / 2, mistakeCode: 'REVENUE_NOT_PROFIT' },
        // Q = (α − v)/β, twice the right output, puts the price down to the unit cost.
        { value: p.unitCost, mistakeCode: 'VERTEX_NO_HALF' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
});
