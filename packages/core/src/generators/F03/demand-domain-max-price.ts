import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Q = a − bP² ("square") or Q = a − b√P ("root"). */
  form: 'square' | 'root';
  a: number;
  b: number;
  /** Drawn first so the answer is a whole number: the price where Q = 0. */
  maxPrice: number;
}

const formula = (p: Params) => {
  const coef = p.b === 1 ? '' : num(p.b);
  return p.form === 'square' ? `${num(p.a)} - ${coef}P^2` : `${num(p.a)} - ${coef}\\sqrt{P}`;
};

/** F03, difficulty 2: the highest price in the economically meaningful domain of a demand function. */
export const demandDomainMaxPrice: Generator<Params> = {
  id: 'demand-domain-max-price',
  title: 'Highest price in the domain of demand',
  topicId: 'F03',
  difficulty: 2,
  timeSec: 90,

  params(rng) {
    for (;;) {
      if (rng.int(0, 1) === 0) {
        const b = rng.int(1, 10) / 2;
        const maxPrice = rng.int(3, 60);
        const a = b * maxPrice * maxPrice;
        // A half-integer b with an odd price would give a fractional intercept.
        if (Number.isInteger(a)) return { form: 'square', a, b, maxPrice };
      } else {
        const b = rng.int(1, 40);
        const root = rng.int(3, 25);
        return { form: 'root', a: b * root, b, maxPrice: root * root };
      }
    }
  },

  stem: (p) =>
    `Demand for a good is $Q = ${formula(p)}$, where $P$ is the price. Prices and quantities cannot be negative. What is the highest price at which this demand function still makes economic sense, that is, gives $Q \\ge 0$?`,

  answer: (p) => ({ kind: 'numeric', value: p.maxPrice, decimals: 2 }),

  steps(p) {
    const ratio = round(p.a / p.b, 2);
    // With b = 1 there is nothing to divide by, so the fraction a/1 is left out.
    const divided = p.b === 1 ? num(ratio) : `\\dfrac{${num(p.a)}}{${num(p.b)}} = ${num(ratio)}`;
    const edge = {
      text: 'Set the quantity to zero.',
      latex: `${formula(p)} = 0`,
      why: 'Quantity falls as the price rises, so the domain ends where demand reaches zero; any higher price would give a negative quantity.',
    };
    if (p.form === 'square') {
      return [
        edge,
        {
          text: 'Solve for P².',
          latex: `P^2 = ${divided}`,
          why: 'Move the P² term to the other side and divide by its coefficient.',
          result: ratio,
        },
        {
          text: 'Take the positive square root.',
          latex: `P = \\sqrt{${num(ratio)}} = ${num(p.maxPrice)}`,
          why: 'P² = c has two roots, ±√c, but a price cannot be negative, so only the positive root lies in the domain.',
          result: p.maxPrice,
        },
      ];
    }
    return [
      edge,
      {
        text: 'Solve for √P.',
        latex: `\\sqrt{P} = ${divided}`,
        why: 'Move the square-root term to the other side and divide by its coefficient.',
        result: ratio,
      },
      {
        text: 'Square both sides.',
        latex: `P = ${num(ratio)}^2 = ${num(p.maxPrice)}`,
        why: 'Squaring undoes the square root. √P is defined only for P ≥ 0, so the domain is 0 ≤ P ≤ this price.',
        result: p.maxPrice,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(p.maxPrice, [
      { value: round(p.a / p.b, 2), mistakeCode: 'NOT_SOLVED_FOR_P' },
      { value: p.a, mistakeCode: 'GAVE_INTERCEPT' },
      {
        value: round(p.form === 'square' ? p.a / (2 * p.b) : (2 * p.a) / p.b, 2),
        mistakeCode: 'POWER_AS_MULTIPLE',
      },
    ]),
};
