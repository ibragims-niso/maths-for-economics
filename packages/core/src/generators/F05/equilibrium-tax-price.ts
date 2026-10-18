import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';
import { linearSupply } from './equilibrium-price';

interface Params {
  a: number;
  b: number;
  c: number;
  d: number;
  tax: number;
  price: number;
  /** tax = k(b + d), so the buyers' share k·d is a whole number. */
  k: number;
}

/** F05, difficulty 2: the price buyers pay after a per-unit tax on sellers (tax incidence). */
export const equilibriumTaxPrice: Generator<Params> = {
  id: 'equilibrium-tax-price',
  topicId: 'F05',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const b = rng.int(1, 5);
      const d = rng.int(1, 5);
      if (b === d) continue; // equal slopes would make the wrong-share mistake look right
      const k = rng.int(1, 3);
      const price = rng.int(10, 60);
      const quantity = rng.int(40, 300);
      if (quantity - b * k * d < 10) continue; // keep the taxed quantity positive
      return { a: quantity + b * price, b, c: quantity - d * price, d, tax: k * (b + d), price, k };
    }
  },

  stem: (p) =>
    `Demand is $Q_d = ${linearDemand(p.a, p.b)}$ and supply is $Q_s = ${linearSupply(p.c, p.d)}$. The government puts a tax of $${num(p.tax)}$ per unit on sellers. What price do buyers pay after the tax?`,

  answer: (p) => ({ kind: 'numeric', value: p.price + p.k * p.d, decimals: 2 }),

  steps(p) {
    const buyers = p.price + p.k * p.d;
    return [
      {
        text: 'Find the equilibrium price before the tax.',
        latex: `P^* = \\dfrac{${num(p.a - p.c)}}{${num(p.b + p.d)}} = ${num(p.price)}`,
        why: 'Set demand equal to supply and solve, as for any market equilibrium.',
        result: p.price,
      },
      {
        text: 'With the tax, sellers keep only P − t, so supply becomes:',
        latex: `Q_s = ${num(p.c)} + ${num(p.d)}(P - ${num(p.tax)})`,
        why: 'Sellers decide how much to supply from the price they receive, which is the buyers’ price minus the tax.',
      },
      {
        text: 'Set demand equal to the new supply and solve for the buyers’ price.',
        latex: `P_b = \\dfrac{${num(p.a)} - (${num(p.c)}) + ${num(p.d)} \\cdot ${num(p.tax)}}{${num(p.b + p.d)}} = ${num(buyers)}`,
        why: 'Rearranging a − bP = c + d(P − t) gives P = (a − c + dt)/(b + d).',
        result: buyers,
      },
      {
        text: 'Interpret: buyers bear d/(b + d) of the tax.',
        latex: `${num(buyers)} - ${num(p.price)} = ${num(p.k * p.d)} = \\dfrac{${num(p.d)}}{${num(p.b + p.d)}} \\cdot ${num(p.tax)}`,
        why: 'The side of the market that responds less to price (smaller slope) bears more of the tax.',
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(p.price + p.k * p.d, [
      { value: p.price + p.tax, mistakeCode: 'FULL_PASS_THROUGH' },
      { value: p.price, mistakeCode: 'NO_PASS_THROUGH' },
      { value: p.price + p.k * p.b, mistakeCode: 'WRONG_SHARE' },
    ]),
};
