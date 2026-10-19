import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Inverse demand P = a − bQ. */
  a: number;
  b: number;
  /** Inverse supply P = c + dQ. */
  c: number;
  d: number;
  /** Drawn first so the equilibrium is whole. */
  quantity: number;
  price: number;
}

/** "a − bQ" or "c + dQ" with the coefficient 1 left out. */
export const inverseLine = (intercept: number, slope: number, sign: '-' | '+') =>
  `${num(intercept)} ${sign} ${slope === 1 ? '' : num(slope)}Q`;

/** C114, difficulty 1: consumer surplus at the equilibrium of linear inverse demand and supply. */
export const consumerSurplusLinearEquilibrium: Generator<Params> = {
  id: 'consumer-surplus-linear-equilibrium',
  title: 'Consumer surplus at equilibrium',
  topicId: 'C114',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const quantity = rng.int(5, 60);
      const price = rng.int(10, 150);
      const b = rng.int(1, 5);
      const d = rng.int(1, 5);
      if (b === d) continue; // equal slopes would make CS equal PS, hiding the supply mistake
      if ((b * quantity * quantity) % 2 !== 0) continue; // keep ½bQ*² whole
      const c = price - d * quantity;
      if (c < 1) continue; // sellers need a positive price before they supply anything
      return { a: price + b * quantity, b, c, d, quantity, price };
    }
  },

  stem: (p) =>
    `Inverse demand is $P = ${inverseLine(p.a, p.b, '-')}$ and inverse supply is $P = ${inverseLine(p.c, p.d, '+')}$. Find the consumer surplus at the market equilibrium.`,

  answer: (p) => ({ kind: 'numeric', value: (p.b * p.quantity * p.quantity) / 2, decimals: 2 }),

  steps(p) {
    const area = p.a * p.quantity - (p.b * p.quantity * p.quantity) / 2;
    const spending = p.price * p.quantity;
    return [
      {
        text: 'Find the equilibrium quantity where the demand price equals the supply price.',
        latex: `${inverseLine(p.a, p.b, '-')} = ${inverseLine(p.c, p.d, '+')} \\;\\Rightarrow\\; Q^* = \\dfrac{${num(p.a - p.c)}}{${num(p.b + p.d)}} = ${num(p.quantity)}`,
        why: 'At equilibrium the last buyer’s willingness to pay equals the price the last seller needs.',
        result: p.quantity,
      },
      {
        text: 'Find the equilibrium price.',
        latex: `P^* = ${num(p.a)} - ${p.b === 1 ? '' : `${num(p.b)} \\cdot `}${num(p.quantity)} = ${num(p.price)}`,
        why: 'Every buyer pays this one market price, whatever they would have been willing to pay.',
        result: p.price,
      },
      {
        text: 'Integrate the demand curve from 0 to Q*: the total value buyers place on these units.',
        latex: `\\int_0^{${num(p.quantity)}} (${inverseLine(p.a, p.b, '-')})\\,dQ = \\Big[${num(p.a)}Q - ${p.b === 2 ? '' : num(p.b / 2)}Q^2\\Big]_0^{${num(p.quantity)}} = ${num(area)}`,
        why: 'The height of the demand curve at each Q is the most the buyer of that unit would pay, so the area under it adds up all those valuations.',
        result: area,
      },
      {
        text: 'Subtract what buyers actually spend.',
        latex: `CS = ${num(area)} - ${num(p.price)} \\cdot ${num(p.quantity)} = ${num(area - spending)}`,
        why: 'Consumer surplus is value minus spending. Check: the area is a triangle, ½ × base × height = ½ × Q* × (a − P*).',
        result: area - spending,
      },
    ];
  },

  distractors(p) {
    const answer = (p.b * p.quantity * p.quantity) / 2;
    return cleanDistractors(answer, [
      { value: p.price * p.quantity, mistakeCode: 'SPENDING_NOT_SURPLUS' },
      { value: p.a * p.quantity - answer, mistakeCode: 'FORGOT_SPENDING' },
      { value: (p.d * p.quantity * p.quantity) / 2, mistakeCode: 'USED_SUPPLY' },
      { value: 2 * answer, mistakeCode: 'FORGOT_HALF' },
    ]);
  },
};
