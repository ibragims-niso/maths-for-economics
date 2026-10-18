import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  a: number;
  b: number;
  p1: number;
  p2: number;
  p3: number;
}

const q = (p: Params, price: number) => p.a - p.b * price;

/** F04, difficulty 2: build a linear demand curve from two observations, then predict. */
export const linearDemandTwoPoints: Generator<Params> = {
  id: 'linear-demand-two-points',
  topicId: 'F04',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const b = rng.int(1, 6);
      const choke = rng.int(20, 80); // price where demand reaches zero
      const p1 = rng.int(1, choke - 3);
      const p2 = rng.int(p1 + 1, choke - 2);
      const p3 = rng.int(1, choke - 1);
      if (p3 !== p1 && p3 !== p2) return { a: b * choke, b, p1, p2, p3 };
    }
  },

  stem: (p) =>
    `At a price of $${num(p.p1)}$ consumers buy $${num(q(p, p.p1))}$ units; at $${num(p.p2)}$ they buy $${num(q(p, p.p2))}$ units. Assuming demand is linear, how many units do they buy at a price of $${num(p.p3)}$?`,

  answer: (p) => ({ kind: 'numeric', value: q(p, p.p3), decimals: 0 }),

  steps(p) {
    const q1 = q(p, p.p1);
    const q2 = q(p, p.p2);
    return [
      {
        text: 'Find the slope: the change in quantity per unit change in price.',
        latex: `\\dfrac{\\Delta Q}{\\Delta P} = \\dfrac{${num(q2)} - ${num(q1)}}{${num(p.p2)} - ${num(p.p1)}} = -${num(p.b)}`,
        why: 'For a straight line the slope is the same between any two points; it is negative because demand falls as price rises.',
        result: -p.b,
      },
      {
        text: 'Find the intercept by putting one point into Q = a − bP.',
        latex: `a = ${num(q1)} + ${num(p.b)} \\cdot ${num(p.p1)} = ${num(p.a)}`,
        why: 'The intercept a is the quantity demanded at a price of zero; rearranging Q = a − bP gives a = Q + bP.',
        result: p.a,
      },
      {
        text: 'Use the demand equation at the new price.',
        latex: `Q = ${num(p.a)} - ${num(p.b)} \\cdot ${num(p.p3)} = ${num(q(p, p.p3))}`,
        why: 'With the slope and intercept known, the equation predicts demand at any price on the line.',
        result: q(p, p.p3),
      },
    ];
  },

  distractors(p) {
    const q1 = q(p, p.p1);
    return cleanDistractors(q(p, p.p3), [
      { value: q1 + p.b * (p.p3 - p.p1), mistakeCode: 'SLOPE_SIGN' },
      { value: round(q1 - (p.p3 - p.p1) / p.b, 2), mistakeCode: 'INVERTED_SLOPE' },
      { value: p.a, mistakeCode: 'INTERCEPT_ONLY' },
    ]);
  },
};
