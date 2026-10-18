import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  /** What the firm sells, for the story. */
  good: string;
  /** Marginal revenue MR(Q) = alpha − beta·Q. */
  alpha: number;
  /** A whole number, so beta/2 has at most one decimal. */
  beta: number;
  q0: number;
}

/** The answer is exact (at most 1 decimal), so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const GOODS = [
  'bicycles a month',
  'concert tickets a night',
  'tablets a week',
  'meals a day',
  'tonnes of cement a day',
] as const;

const coef = (k: number) => (k === 1 ? '' : num(k));

/** The price buyers pay at Q₀: R(Q₀)/Q₀ = alpha − (beta/2)Q₀. */
const price = (p: Params) => round(p.alpha - (p.beta / 2) * p.q0, 2);
const revenue = (p: Params) => round(p.alpha * p.q0 - (p.beta / 2) * p.q0 * p.q0, 2);
const marginalRevenue = (p: Params) => round(p.alpha - p.beta * p.q0, 2);

/** C112, difficulty 2: total revenue from MR = α − βQ with R(0) = 0, then the price R(Q₀)/Q₀. */
export const priceFromMarginalRevenue: Generator<Params> = {
  id: 'price-from-marginal-revenue',
  title: 'Price from marginal revenue',
  topicId: 'C112',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    // Draw a positive marginal revenue at Q₀ first, then build the intercept from it.
    const beta = rng.int(1, 8);
    const q0 = rng.int(4, 40);
    const mr = rng.int(2, 90);
    return { good: rng.pick(GOODS), alpha: mr + beta * q0, beta, q0 };
  },

  stem: (p) =>
    `A firm selling $Q$ ${p.good} has marginal revenue $MR(Q) = ${linearDemand(p.alpha, p.beta, 'Q')}$. Selling nothing earns nothing. Find the price at which it can sell $Q = ${num(p.q0)}$ units.`,

  answer: (p) => ({ kind: 'numeric', value: price(p), decimals: 2, ...EXACT }),

  steps: (p) => [
    {
      text: 'Integrate marginal revenue.',
      latex: `R(Q) = \\int (${linearDemand(p.alpha, p.beta, 'Q')})\\,dQ = ${num(p.alpha)}Q - ${coef(p.beta / 2)}Q^2 + c_0`,
      why: 'Total revenue is the function whose derivative is marginal revenue. The Q-term becomes a Q² term divided by 2.',
    },
    {
      text: 'Fix the constant.',
      latex: 'R(0) = c_0 = 0',
      why: 'Selling nothing earns nothing, so revenue is zero at Q = 0.',
      result: 0,
    },
    {
      text: 'Revenue at the given quantity.',
      latex: `R(${num(p.q0)}) = ${num(p.alpha)} \\times ${num(p.q0)} - ${num(p.beta / 2)} \\times ${num(p.q0)}^2 = ${num(revenue(p))}`,
      why: 'Put Q₀ into the revenue function.',
      result: revenue(p),
    },
    {
      text: 'Divide by the quantity to get the price.',
      latex: `P = \\frac{R(${num(p.q0)})}{${num(p.q0)}} = ${num(price(p))}`,
      why: `Revenue is price times quantity, so the price is revenue per unit. It is above MR(${num(p.q0)}) = ${num(marginalRevenue(p))} because selling more means cutting the price on every unit.`,
      result: price(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      price(p),
      [
        { value: marginalRevenue(p), mistakeCode: 'MR_AS_PRICE' },
        { value: revenue(p), mistakeCode: 'GAVE_REVENUE' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
