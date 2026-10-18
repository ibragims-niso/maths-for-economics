import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  /** What the firm sells, for the story. */
  good: string;
  /** Inverse demand P = a − bQ. */
  a: number;
  /** A multiple of 0.5. */
  b: number;
  q0: number;
}

/** The answer is exact (at most 1 decimal), so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const GOODS = [
  'sandwiches a day',
  'concert tickets a night',
  'phone cases a week',
  'bicycles a month',
  'cups of coffee a day',
] as const;

const price = (p: Params) => round(p.a - p.b * p.q0, 4);
const marginalRevenue = (p: Params) => round(p.a - 2 * p.b * p.q0, 4);
const coef = (k: number) => (k === 1 ? '' : num(k));

/** C106, difficulty 1: marginal revenue MR = a − 2bQ₀ for linear inverse demand P = a − bQ. */
export const marginalRevenueLinearDemand: Generator<Params> = {
  id: 'marginal-revenue-linear-demand',
  title: 'Marginal revenue on a demand line',
  topicId: 'C106',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    // Draw the (positive) marginal revenue first, then build the demand intercept from it.
    const b = rng.int(1, 10) / 2;
    const q0 = rng.int(4, 40);
    const mr = rng.int(2, 90);
    return { good: rng.pick(GOODS), a: round(mr + 2 * b * q0, 4), b, q0 };
  },

  stem: (p) =>
    `A firm selling $Q$ ${p.good} faces inverse demand $P = ${linearDemand(p.a, p.b, 'Q')}$. Find its marginal revenue at $Q = ${num(p.q0)}$.`,

  answer: (p) => ({ kind: 'numeric', value: marginalRevenue(p), decimals: 2, ...EXACT }),

  steps: (p) => [
    {
      text: 'Write revenue as price times quantity.',
      latex: `R(Q) = (${linearDemand(p.a, p.b, 'Q')})Q = ${num(p.a)}Q - ${coef(p.b)}Q^2`,
      why: 'The price is not fixed: it is whatever the demand curve says buyers will pay for Q units.',
    },
    {
      text: 'Differentiate revenue.',
      latex: `MR(Q) = R'(Q) = ${num(p.a)} - ${coef(2 * p.b)}Q`,
      why: 'Marginal revenue is the rate at which revenue changes with quantity. The Q² term doubles its coefficient, so the MR line is twice as steep as demand.',
    },
    {
      text: 'Evaluate at the given quantity.',
      latex: `MR(${num(p.q0)}) = ${num(p.a)} - ${num(2 * p.b)} \\times ${num(p.q0)} = ${num(marginalRevenue(p))}`,
      why: `One more unit would sell for about ${num(price(p))}, but the price of all ${num(p.q0)} earlier units falls too, so revenue rises by less than the price.`,
      result: marginalRevenue(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      marginalRevenue(p),
      [
        { value: price(p), mistakeCode: 'MR_EQUALS_PRICE' },
        { value: round(p.a - (p.b * p.q0) / 2, 2), mistakeCode: 'HALF_SLOPE' },
        { value: round(price(p) * p.q0, 2), mistakeCode: 'TOTAL_NOT_MARGINAL' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
