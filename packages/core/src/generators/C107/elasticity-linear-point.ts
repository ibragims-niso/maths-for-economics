import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  a: number;
  b: number;
  price: number;
}

const elasticity = ({ a, b, price }: Params) => (-b * price) / (a - b * price);

/** C107, difficulty 1: point elasticity of a linear demand curve Q = a − bP. */
export const elasticityLinearPoint: Generator<Params> = {
  id: 'elasticity-linear-point',
  topicId: 'C107',
  difficulty: 1,
  timeSec: 60,

  params(rng) {
    // Draw Q and P first so the quantity is a whole, positive number; then a = Q + bP.
    // Equal P and Q would make the inverted ratio coincide with the answer, so avoid it.
    for (;;) {
      const b = rng.int(1, 5);
      const price = rng.int(2, 40);
      const quantity = rng.int(10, 150);
      if (quantity !== price) return { a: quantity + b * price, b, price };
    }
  },

  stem: (p) =>
    `Demand is $Q = ${linearDemand(p.a, p.b)}$. Find the price elasticity of demand at $P = ${num(p.price)}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(elasticity(p), 2), decimals: 2 }),

  steps(p) {
    const q = p.a - p.b * p.price;
    const e = round(elasticity(p), 2);
    const kind = Math.abs(e) > 1 ? 'elastic' : Math.abs(e) < 1 ? 'inelastic' : 'unit elastic';
    return [
      {
        text: 'Find the quantity at this price.',
        latex: `Q = ${num(p.a)} - ${num(p.b)} \\cdot ${num(p.price)} = ${num(q)}`,
        why: 'Elasticity needs the quantity at the point where we measure it.',
        result: q,
      },
      {
        text: 'Find the slope of the demand curve.',
        latex: `\\dfrac{dQ}{dP} = -${num(p.b)}`,
        why: 'For a linear demand Q = a − bP, the slope is the coefficient of P.',
        result: -p.b,
      },
      {
        text: 'Multiply the slope by P/Q.',
        latex: `\\varepsilon = -${num(p.b)} \\cdot \\dfrac{${num(p.price)}}{${num(q)}} = ${num(e)}`,
        why: 'Multiplying by P/Q turns the slope into a ratio of percentage changes, so units cancel.',
        result: e,
      },
      {
        text: `Interpret: demand is ${kind} at this price.`,
        latex: `|\\varepsilon| = ${num(Math.abs(e))} ${Math.abs(e) > 1 ? '>' : Math.abs(e) < 1 ? '<' : '='} 1`,
        why: 'Compare |ε| with 1: above 1 quantity reacts more than price, below 1 it reacts less.',
      },
    ];
  },

  distractors(p) {
    const q = p.a - p.b * p.price;
    return cleanDistractors(round(elasticity(p), 2), [
      { value: round((p.b * p.price) / q, 2), mistakeCode: 'SIGN' },
      { value: round((-p.b * q) / p.price, 2), mistakeCode: 'INVERTED_RATIO' },
      { value: -p.b, mistakeCode: 'SLOPE_ONLY' },
      { value: round((-1 / p.b) * (p.price / q), 2), mistakeCode: 'INVERSE_SLOPE' },
    ]);
  },
};
