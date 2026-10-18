import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  a: number;
  b: number;
  /** The quantity the question asks about. */
  quantity: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
/** Slopes, some of them not whole numbers. b = 1 is left out: two mistakes would give the answer. */
const SLOPES = [0.5, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const;

/** Inverse demand P(Q) = (a − Q)/b at the given quantity. */
const price = (p: Params) => round((p.a - p.quantity) / p.b, 2);

/** F10, difficulty 1: the price at which a given quantity is sold, from Q = a − bP. */
export const inverseDemandPrice: Generator<Params> = {
  id: 'inverse-demand-price',
  title: 'Price from inverse demand',
  topicId: 'F10',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    // Draw the price first (in steps of 0.25) so the answer has at most 2 decimals and
    // the intercept a = Q + bP is a whole number.
    for (;;) {
      const b = rng.pick(SLOPES);
      const answer = rng.int(8, 240) / 4;
      if (!Number.isInteger(b * answer)) continue;
      const quantity = rng.int(10, 400);
      return { a: quantity + b * answer, b, quantity };
    }
  },

  stem(p) {
    const whole = Number.isInteger(price(p));
    return `Weekly demand for a product is $Q = ${linearDemand(p.a, p.b)}$, where $P$ is the price. At what price are exactly $${num(p.quantity)}$ units sold?${whole ? '' : ' Give your answer to 2 decimal places.'}`;
  },

  answer: (p) => ({ kind: 'numeric', value: price(p), decimals: 2, ...MONEY }),

  steps: (p) => [
    {
      text: 'Solve the demand equation for P. This gives the inverse demand function.',
      latex: `${num(p.b)}P = ${num(p.a)} - Q \\;\\Rightarrow\\; P(Q) = \\dfrac{${num(p.a)} - Q}{${num(p.b)}}`,
      why: 'Inverse demand gives the price at which a given quantity is sold. Move the P term to one side on its own, then divide by its coefficient.',
    },
    {
      text: 'Put the quantity into the inverse demand function.',
      latex: `P(${num(p.quantity)}) = \\dfrac{${num(p.a)} - ${num(p.quantity)}}{${num(p.b)}} = \\dfrac{${num(p.a - p.quantity)}}{${num(p.b)}} = ${num(price(p))}`,
      why: 'The question gives a quantity and asks for a price, which is exactly what the inverse function takes in and gives back.',
      result: price(p),
    },
    {
      text: 'Check by putting the price back into the demand function.',
      latex: `Q = ${num(p.a)} - ${num(p.b)} \\cdot ${num(price(p))} = ${num(p.a - p.b * price(p))}`,
      why: 'A function and its inverse undo each other, so Q(P(Q₀)) must give back the quantity we started with.',
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      price(p),
      [
        { value: round(p.a - p.b * p.quantity, 2), mistakeCode: 'QUANTITY_AS_PRICE' },
        { value: round((p.a - p.quantity) * p.b, 2), mistakeCode: 'MULTIPLIED_BY_SLOPE' },
        { value: round((p.a + p.quantity) / p.b, 2), mistakeCode: 'SIGN_SLIP' },
        { value: round(p.a - p.quantity / p.b, 2), mistakeCode: 'DIVIDED_ONE_TERM' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
