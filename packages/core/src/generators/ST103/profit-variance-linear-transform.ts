import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const BUSINESSES = {
  bakery: { firm: 'A bakery', item: 'loaf', items: 'loaves' },
  juiceBar: { firm: 'A juice bar', item: 'cup', items: 'cups' },
  printShop: { firm: 'A print shop', item: 'order', items: 'orders' },
} as const;

type Business = keyof typeof BUSINESSES;

interface Params {
  business: Business;
  /** Profit margin per unit sold (price minus unit cost). */
  margin: number;
  /** Fixed cost per day. */
  fixed: number;
  /** Possible daily sales X, lowest first (multiples of 10). */
  sales: number[];
  /** Their probabilities in hundredths (they add up to 100). */
  chances: number[];
}

/** Var(X) is exact to 2 decimals (sales in tens, probabilities in hundredths), so the answer is too. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const prob = (c: number) => c / 100;
const moment = (p: Params, power: number) =>
  p.sales.reduce((s, x, k) => s + x ** power * prob(p.chances[k] ?? 0), 0);
const varX = (p: Params) => round(moment(p, 2) - moment(p, 1) ** 2, 2);
const varProfit = (p: Params) => round(p.margin ** 2 * varX(p), 2);

/** ST103, difficulty 3: variance of profit π = aX − c from the distribution of sales X, using Var(aX + b) = a²Var(X). */
export const profitVarianceLinearTransform: Generator<Params> = {
  id: 'profit-variance-linear-transform',
  title: 'Variance of profit from uncertain sales',
  topicId: 'ST103',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const first = rng.int(10, 60);
      const second = rng.int(10, 60);
      const last = 100 - first - second;
      if (last < 10) continue;
      const chances = [first, second, last];
      const sales = [rng.int(5, 30), rng.int(5, 30), rng.int(5, 30)]
        .map((s) => s * 10)
        .sort((a, b) => a - b);
      if (new Set(sales).size < 3) continue;
      const margin = rng.int(2, 6);
      const fixed = rng.int(5, 40) * 10;
      // Keep the business profitable on average; whole numbers (sales × chances in %) avoid rounding ties.
      const salesTimes100 = sales.reduce((s, x, k) => s + x * (chances[k] ?? 0), 0);
      if (margin * salesTimes100 <= fixed * 100) continue;
      return {
        business: rng.pick(Object.keys(BUSINESSES) as Business[]),
        margin,
        fixed,
        sales,
        chances,
      };
    }
  },

  stem(p) {
    const b = BUSINESSES[p.business];
    const list = p.sales
      .map((x, k) => `$${num(x)}$ with probability $${num(prob(p.chances[k] ?? 0))}$`)
      .join(', ')
      .replace(/, ([^,]*)$/, ' and $1');
    return `${b.firm} makes a margin of $${num(p.margin)}$ on each ${b.item} it sells and pays fixed costs of $${num(p.fixed)}$ a day, so its daily profit is $\\pi = ${num(p.margin)}X - ${num(p.fixed)}$, where $X$ is the number of ${b.items} sold. Daily sales are ${list}. What is the variance of daily profit? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: varProfit(p), decimals: 2, ...EXACT }),

  steps(p) {
    const mu = moment(p, 1);
    const m2 = moment(p, 2);
    const ps = p.chances.map((c) => num(prob(c)));
    return [
      {
        text: 'Find the expected sales.',
        latex: `E[X] = ${p.sales.map((x, k) => `${num(x)}(${ps[k]})`).join(' + ')} = ${num(mu)}`,
        why: 'The variance of sales is measured around their mean.',
        result: round(mu, 2),
      },
      {
        text: 'Find the expected value of X².',
        latex: `E[X^2] = ${p.sales.map((x, k) => `${num(x)}^2(${ps[k]})`).join(' + ')} = ${num(m2)}`,
        why: 'Square each possible level of sales, then weight it by its probability.',
        result: round(m2, 2),
      },
      {
        text: 'Find the variance of sales.',
        latex: `\\operatorname{Var}(X) = ${num(m2)} - ${num(mu)}^2 = ${num(varX(p))}`,
        why: 'Var(X) = E[X²] − (E[X])².',
        result: varX(p),
      },
      {
        text: 'Scale the variance by the square of the margin.',
        latex: `\\operatorname{Var}(\\pi) = ${num(p.margin)}^2 \\cdot ${num(varX(p))} = ${num(varProfit(p))}`,
        why: 'Subtracting the fixed cost moves every outcome by the same amount, so the spread does not change. Multiplying by the margin stretches every distance from the mean by that factor, and squared distances by its square: Var(aX + b) = a²Var(X).',
        result: varProfit(p),
      },
    ];
  },

  distractors(p) {
    const v = varX(p);
    return cleanDistractors(
      varProfit(p),
      [
        { value: round(p.margin * v, 2), mistakeCode: 'NOT_SQUARED' },
        { value: round(p.margin ** 2 * v - p.fixed, 2), mistakeCode: 'CONSTANT_KEPT' },
        { value: v, mistakeCode: 'UNTRANSFORMED' },
        { value: round(p.margin ** 2 * moment(p, 2), 2), mistakeCode: 'NO_MEAN_SQUARED' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
