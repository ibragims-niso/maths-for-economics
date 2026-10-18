import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  a: number;
  b: number;
  c: number;
  d: number;
  price: number;
  quantity: number;
}

/** "c + dP" with a sign that reads naturally when c is negative. */
export const linearSupply = (c: number, d: number) =>
  `${c < 0 ? `-${num(-c)}` : num(c)} + ${d === 1 ? '' : num(d)}P`;

/** F05, difficulty 1: equilibrium price where linear demand meets linear supply. */
export const equilibriumPrice: Generator<Params> = {
  id: 'equilibrium-price',
  topicId: 'F05',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    // Draw the equilibrium first so it is whole; then build the lines through it.
    const price = rng.int(5, 60);
    const quantity = rng.int(20, 300);
    const b = rng.int(1, 5);
    const d = rng.int(1, 5);
    return { a: quantity + b * price, b, c: quantity - d * price, d, price, quantity };
  },

  stem: (p) =>
    `Demand is $Q_d = ${linearDemand(p.a, p.b)}$ and supply is $Q_s = ${linearSupply(p.c, p.d)}$. Find the equilibrium price.`,

  answer: (p) => ({ kind: 'numeric', value: p.price, decimals: 2 }),

  steps: (p) => [
    {
      text: 'At equilibrium, quantity demanded equals quantity supplied.',
      latex: `${linearDemand(p.a, p.b)} = ${linearSupply(p.c, p.d)}`,
      why: 'The market clears where buyers want exactly what sellers offer, so there is no pressure on the price to move.',
    },
    {
      text: 'Collect the P terms on one side.',
      latex: `${num(p.a)} - (${num(p.c)}) = (${num(p.b)} + ${num(p.d)})P \\;\\Rightarrow\\; ${num(p.a - p.c)} = ${num(p.b + p.d)}P`,
      why: 'Add bP to both sides and subtract the supply intercept, so P appears only once.',
    },
    {
      text: 'Solve for P.',
      latex: `P^* = \\dfrac{${num(p.a - p.c)}}{${num(p.b + p.d)}} = ${num(p.price)}`,
      why: 'Divide both sides by (b + d).',
      result: p.price,
    },
    {
      text: 'Check with the quantity.',
      latex: `Q^* = ${num(p.a)} - ${num(p.b)} \\cdot ${num(p.price)} = ${num(p.quantity)}`,
      why: 'Putting P* into either equation gives the same quantity, which confirms the answer.',
    },
  ],

  distractors: (p) =>
    cleanDistractors(p.price, [
      {
        value: p.b === p.d ? Number.NaN : round((p.a - p.c) / (p.b - p.d), 2),
        mistakeCode: 'SIGN_SLIP',
      },
      { value: round((p.a + p.c) / (p.b + p.d), 2), mistakeCode: 'ADDED_INTERCEPTS' },
      { value: p.quantity, mistakeCode: 'QUANTITY_NOT_PRICE' },
    ]),
};
