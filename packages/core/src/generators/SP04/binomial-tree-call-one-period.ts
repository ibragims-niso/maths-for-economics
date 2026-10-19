import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  callPayoff,
  down,
  gross,
  grossLatex,
  plain,
  priceAt,
  rateLatex,
  riskNeutralQ,
  type TreeParams,
  up,
} from './tree';

const FIRMS = {
  airline: 'an airline',
  mining: 'a mining company',
  software: 'a software firm',
  retailer: 'a food retailer',
  bank: 'a bank',
} as const;

type Firm = keyof typeof FIRMS;

interface Params extends TreeParams {
  firm: Firm;
  /** The analysts' (real-world) probability of the rise, in tenths (3–8). */
  realUpTenths: number;
}

/** Option prices are small amounts of money: allow 2 cents, or 0.1 % for larger prices. */
const OPTION = { tolerance: 0.02, relTolerance: 0.001 } as const;

const payoffUp = (p: Params) => callPayoff(priceAt(p, 1, 0), p.strike);
const payoffDown = (p: Params) => callPayoff(priceAt(p, 0, 1), p.strike);
const discounted = (p: Params, q: number) => (q * payoffUp(p) + (1 - q) * payoffDown(p)) / gross(p);
const price = (p: Params) => discounted(p, riskNeutralQ(p));

function wrongAnswers(p: Params) {
  const q = riskNeutralQ(p);
  return cleanDistractors(
    round(price(p), 2),
    [
      { value: round(discounted(p, p.realUpTenths / 10), 2), mistakeCode: 'REAL_WORLD_PROB' },
      { value: round(price(p) * gross(p), 2), mistakeCode: 'NO_DISCOUNT' },
      { value: round(discounted(p, 1 - q), 2), mistakeCode: 'SWAPPED_Q' },
    ],
    OPTION.tolerance,
    OPTION.relTolerance,
  );
}

/** SP04, difficulty 1: the price of a one-period European call, [q·C_u + (1 − q)·C_d]/R. */
export const binomialTreeCallOnePeriod: Generator<Params> = {
  id: 'binomial-tree-call-one-period',
  title: 'One-period call price',
  topicId: 'SP04',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const firm = rng.pick(Object.keys(FIRMS) as Firm[]);
      // S₀ a multiple of 20 and moves in steps of 5 % keep both next prices whole numbers.
      const s0 = 20 * rng.int(1, 10);
      const upPct = 5 * rng.int(2, 8);
      const downPct = 5 * rng.int(1, 6);
      const ratePct = rng.int(1, Math.min(10, upPct - 1));
      const su = s0 + (s0 * upPct) / 100;
      const sd = s0 - (s0 * downPct) / 100;
      // A strike strictly between the two prices: the call pays only after a rise.
      const strike = rng.int(sd + 1, su - 1);
      const realUpTenths = rng.int(3, 8);
      const p: Params = { firm, s0, upPct, downPct, ratePct, strike, realUpTenths };
      if (strike <= sd || strike >= su) continue;
      if (price(p) < 0.5) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    return `A share in ${FIRMS[p.firm]} costs $S_0 = ${num(p.s0)}$ today. At the end of one period its price will be either $${num(priceAt(p, 1, 0))}$ or $${num(priceAt(p, 0, 1))}$, and analysts put the probability of the rise at $${num(p.realUpTenths / 10)}$. The risk-free interest rate is $${rateLatex(p.ratePct)}$ per period, compounded once per period, so 1 invested today grows to $R = ${grossLatex(p.ratePct)}$ (not continuous compounding). What is the no-arbitrage price today of a European call option on the share with strike $K = ${num(p.strike)}$ that expires at the end of the period? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(price(p), 2), decimals: 2, ...OPTION }),

  steps(p) {
    const su = priceAt(p, 1, 0);
    const sd = priceAt(p, 0, 1);
    const cu = payoffUp(p);
    const q = riskNeutralQ(p);
    const value = round(price(p), 2);
    return [
      {
        text: 'Find what the call pays in each state.',
        latex: `C_u = \\max(${num(su)} - ${num(p.strike)},\\ 0) = ${num(cu)}, \\qquad C_d = \\max(${num(sd)} - ${num(p.strike)},\\ 0) = 0`,
        why: 'A call is the right to buy at the strike, so it pays S − K when the price ends above the strike and nothing otherwise.',
        result: cu,
      },
      {
        text: 'Find the risk-neutral probability of the rise.',
        latex: `q = \\dfrac{R - d}{u - d} = \\dfrac{${grossLatex(p.ratePct)} - ${num(down(p))}}{${num(up(p))} - ${num(down(p))}} = ${num(q, 4)}`,
        why: `q is the probability that makes the share grow at the risk-free rate on average, q·u + (1 − q)·d = R. The analysts' ${plain(p.realUpTenths / 10, 1)} plays no part in the price.`,
        result: round(q, 4),
      },
      {
        text: 'Discount the risk-neutral average payoff by one period.',
        latex: `C_0 = \\dfrac{q\\,C_u + (1 - q)\\,C_d}{R} = \\dfrac{${num(q, 4)} \\times ${num(cu)} + ${num(1 - q, 4)} \\times 0}{${grossLatex(p.ratePct)}} = ${num(value, 2)}`,
        why: 'This is the cost of the portfolio of shares and borrowing that pays exactly the same as the call; any other price would allow a riskless profit.',
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
