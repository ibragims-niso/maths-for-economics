import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Which list of goods names the stem uses (see BASKETS). */
  basket: number;
  /** Price of each good, per unit. */
  prices: number[];
  /** Units bought of each good; the same length as prices (3 or 4 goods). */
  quantities: number[];
}

/** The cost is a whole number, so a total one unit off must never be graded as correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Goods named in the stem, in the order of the vector entries. */
export const BASKETS = [
  ['bread', 'cheese', 'apples', 'milk'],
  ['coffee', 'tea', 'sugar', 'biscuits'],
  ['notebooks', 'pens', 'folders', 'printer paper'],
  ['rice', 'beans', 'onions', 'cooking oil'],
  ['bus tickets', 'cinema tickets', 'meals out', 'magazines'],
] as const;

const vec = (xs: readonly number[]) => `(${xs.map((x) => num(x)).join(', ')})`;
const dot = (a: readonly number[], b: readonly number[]) =>
  a.reduce((s, ai, i) => s + ai * (b[i] ?? 0), 0);
const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
const cost = (p: Params) => dot(p.prices, p.quantities);

const candidates = (p: Params): Distractor[] => {
  const last = p.prices.length - 1;
  return [
    { value: sum(p.prices) * sum(p.quantities), mistakeCode: 'SUMS_MULTIPLIED' },
    {
      value: cost(p) - (p.prices[last] ?? 0) * (p.quantities[last] ?? 0),
      mistakeCode: 'MISSED_GOOD',
    },
    { value: sum(p.prices) + sum(p.quantities), mistakeCode: 'ADDED_NOT_MULTIPLIED' },
  ];
};

/** LA101, difficulty 1: the cost of a bundle of 3 or 4 goods as the dot product p·x. */
export const bundleCostDotProduct: Generator<Params> = {
  id: 'bundle-cost-dot-product',
  title: 'Cost of a bundle',
  topicId: 'LA101',
  difficulty: 1,
  timeSec: 60,

  params(rng) {
    for (;;) {
      const n = rng.int(3, 4);
      const p: Params = {
        basket: rng.int(0, BASKETS.length - 1),
        prices: Array.from({ length: n }, () => rng.int(1, 25)),
        quantities: Array.from({ length: n }, () => rng.int(1, 12)),
      };
      // Every mistake must give its own wrong total.
      if (cleanDistractors(cost(p), candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem(p) {
    const names = (BASKETS[p.basket] ?? BASKETS[0]).slice(0, p.prices.length);
    const list = `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
    return `A household buys the bundle $x = ${vec(p.quantities)}$: the numbers of units of ${list} it buys. The price vector is $p = ${vec(p.prices)}$, the price of one unit of each good in the same order. What does the bundle cost, $p \\cdot x$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: cost(p), decimals: 0, ...EXACT }),

  steps(p) {
    const terms = p.prices.map((pi, i) => pi * (p.quantities[i] ?? 0));
    return [
      {
        text: 'Multiply the price of each good by the number of units bought.',
        latex: p.prices
          .map((pi, i) => `${num(pi)} \\cdot ${num(p.quantities[i] ?? 0)} = ${num(terms[i] ?? 0)}`)
          .join(',\\; '),
        why: 'Spending on one good is its price times its quantity; the entries are matched by position, first with first, second with second.',
      },
      {
        text: 'Add the spending on all the goods.',
        latex: `p \\cdot x = ${terms.map((t) => num(t)).join(' + ')} = ${num(cost(p))}`,
        why: 'The dot product adds up these products, so it gives the total cost of the whole bundle.',
        result: cost(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(cost(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
