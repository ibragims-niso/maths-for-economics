import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  a: number;
  b: number;
  /** The unit-elastic price, a/(2b); drawn first so it is a whole number. */
  unitPrice: number;
}

/** C107, difficulty 2: the price where linear demand Q = a − bP is unit elastic. */
export const elasticityUnitElasticPrice: Generator<Params> = {
  id: 'elasticity-unit-elastic-price',
  title: 'Price where demand is unit elastic',
  topicId: 'C107',
  difficulty: 2,
  timeSec: 90,

  params(rng) {
    const b = rng.int(1, 6);
    const unitPrice = rng.int(4, 60);
    return { a: 2 * b * unitPrice, b, unitPrice };
  },

  stem: (p) =>
    `Demand is $Q = ${linearDemand(p.a, p.b)}$. At what price is demand unit elastic, that is $|\\varepsilon| = 1$?`,

  answer: (p) => ({ kind: 'numeric', value: p.unitPrice, decimals: 2 }),

  steps(p) {
    const q = p.a - p.b * p.unitPrice;
    return [
      {
        text: 'Write the elasticity of this demand and set it to −1.',
        latex: `\\dfrac{-${num(p.b)}P}{${linearDemand(p.a, p.b)}} = -1`,
        why: 'Unit elastic means ε = −1: a 1 % price rise cuts quantity by exactly 1 %.',
      },
      {
        text: 'Solve for P.',
        latex: `${num(p.b)}P = ${linearDemand(p.a, p.b)} \\;\\Rightarrow\\; ${num(2 * p.b)}P = ${num(p.a)} \\;\\Rightarrow\\; P = ${num(p.unitPrice)}`,
        why: 'Multiply both sides by −(a − bP), then collect the P terms on one side.',
        result: p.unitPrice,
      },
      {
        text: 'Check by substituting back.',
        latex: `Q = ${num(q)}, \\quad \\varepsilon = -${num(p.b)} \\cdot \\dfrac{${num(p.unitPrice)}}{${num(q)}} = -1`,
        why: 'At P = a/(2b) the quantity equals bP, so the ratio is exactly −1. This is also where revenue is largest.',
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(p.unitPrice, [
      { value: p.a / p.b, mistakeCode: 'CHOKE_PRICE' },
      { value: p.unitPrice / 2, mistakeCode: 'ALGEBRA' },
    ]),
};
