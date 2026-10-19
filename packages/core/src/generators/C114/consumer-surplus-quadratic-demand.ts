import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Inverse demand P = a − bQ². */
  a: number;
  b: number;
  /** The market price and the quantity bought at it; bQ₀² is whole, so the price is whole. */
  price: number;
  quantity: number;
}

/** A coefficient in front of a power of Q, with 1 left out. */
const coef = (b: number) => (b === 1 ? '' : num(b));

const COEFFICIENTS = [0.1, 0.2, 0.25, 0.5, 1, 2, 3] as const;

/** ∫₀^Q₀ (a − bQ²) dQ − P₀Q₀ = bQ₀³ − bQ₀³/3 = (2/3)·bQ₀³. */
const surplus = (p: Params) => round((2 * p.b * p.quantity ** 3) / 3, 2);

/** C114, difficulty 3: consumer surplus for a curved inverse demand P = a − bQ², by integration. */
export const consumerSurplusQuadraticDemand: Generator<Params> = {
  id: 'consumer-surplus-quadratic-demand',
  title: 'Consumer surplus, curved demand',
  topicId: 'C114',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const b = rng.pick(COEFFICIENTS);
      const quantity = rng.int(2, 30);
      const drop = round(b * quantity * quantity, 6); // a − P₀
      if (!Number.isInteger(drop) || drop < 4 || drop > 600) continue;
      const price = rng.int(5, 200);
      return { a: price + drop, b, price, quantity };
    }
  },

  stem: (p) =>
    `Inverse demand for concert tickets is $P = ${num(p.a)} - ${coef(p.b)}Q^2$ and the ticket price is $${num(p.price)}$. Find the consumer surplus. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: surplus(p), decimals: 2 }),

  steps(p) {
    const q = p.quantity;
    const value = round(p.a * q - (p.b * q ** 3) / 3, 2);
    return [
      {
        text: 'Find how many tickets are bought at this price.',
        latex: `${num(p.a)} - ${coef(p.b)}Q^2 = ${num(p.price)} \\;\\Rightarrow\\; Q_0 = \\sqrt{\\dfrac{${num(p.a - p.price)}}{${num(p.b)}}} = ${num(q)}`,
        why: 'Buyers keep buying while their willingness to pay is at least the price; take the positive root because quantity cannot be negative.',
        result: q,
      },
      {
        text: 'Integrate the demand curve from 0 to Q₀.',
        latex: `\\int_0^{${num(q)}} (${num(p.a)} - ${coef(p.b)}Q^2)\\,dQ = \\Big[${num(p.a)}Q - \\dfrac{${num(p.b)}}{3}Q^3\\Big]_0^{${num(q)}} = ${num(value)}`,
        why: 'The area under the demand curve is the total value buyers place on the tickets they buy; the antiderivative of Q² is Q³/3.',
        result: value,
      },
      {
        text: 'Subtract what buyers spend.',
        latex: `CS = ${num(value)} - ${num(p.price)} \\cdot ${num(q)} = ${num(surplus(p))}`,
        why: 'Consumer surplus is total value minus spending. The curve is not a straight line, so the triangle formula would give the wrong area.',
        result: surplus(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(surplus(p), [
      { value: round(((p.a - p.price) * p.quantity) / 2, 2), mistakeCode: 'TRIANGLE_FORMULA' },
      {
        value: round(p.a * p.quantity - (p.b * p.quantity ** 3) / 3, 2),
        mistakeCode: 'FORGOT_SPENDING',
      },
      { value: p.price * p.quantity, mistakeCode: 'SPENDING_NOT_SURPLUS' },
    ]),
};
