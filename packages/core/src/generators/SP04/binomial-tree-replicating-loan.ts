import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { callPayoff, gross, grossLatex, plain, priceAt, rateLatex, type TreeParams } from './tree';

const ASSETS = {
  energy: 'A share in an energy company',
  telecom: 'A share in a telecoms firm',
  carmaker: 'A share in a car maker',
  index: 'One unit of a stock-market index fund',
} as const;

type Asset = keyof typeof ASSETS;

interface Params extends TreeParams {
  asset: Asset;
}

/** Amounts of money: allow 2 cents, or 0.1 % for larger amounts. */
const MONEY = { tolerance: 0.02, relTolerance: 0.001 } as const;

const su = (p: Params) => priceAt(p, 1, 0);
const sd = (p: Params) => priceAt(p, 0, 1);
/** Shares in the replicating portfolio, Δ = (C_u − C_d)/(S_u − S_d). */
const delta = (p: Params) =>
  (callPayoff(su(p), p.strike) - callPayoff(sd(p), p.strike)) / (su(p) - sd(p));
/** What must be repaid at the end of the period: the shares' value after a fall minus the call's payoff there. */
const repayment = (p: Params) => delta(p) * sd(p) - callPayoff(sd(p), p.strike);
const loan = (p: Params) => repayment(p) / gross(p);

function wrongAnswers(p: Params) {
  const shares = delta(p) * p.s0;
  return cleanDistractors(
    round(loan(p), 2),
    [
      { value: round(repayment(p), 2), mistakeCode: 'NO_DISCOUNT' },
      { value: round(shares, 2), mistakeCode: 'SHARE_VALUE' },
      { value: round(shares - loan(p), 2), mistakeCode: 'GAVE_CALL_PRICE' },
    ],
    MONEY.tolerance,
    MONEY.relTolerance,
  );
}

/** SP04, difficulty 2: the amount borrowed in the portfolio that replicates a one-period call. */
export const binomialTreeReplicatingLoan: Generator<Params> = {
  id: 'binomial-tree-replicating-loan',
  title: 'Borrowing in a replicating portfolio',
  topicId: 'SP04',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const asset = rng.pick(Object.keys(ASSETS) as Asset[]);
      // S₀ a multiple of 20 and moves in steps of 5 % keep both next prices whole numbers.
      const s0 = 20 * rng.int(1, 10);
      const upPct = 5 * rng.int(2, 8);
      const downPct = 5 * rng.int(1, 6);
      const ratePct = rng.int(1, Math.min(10, upPct - 1));
      const strike = rng.int(s0 - (s0 * downPct) / 100 + 1, s0 + (s0 * upPct) / 100 - 1);
      const p: Params = { asset, s0, upPct, downPct, ratePct, strike };
      if (strike <= sd(p) || strike >= su(p)) continue;
      // The call is worth at least 0.50, so it is clearly smaller than the loan and the shares.
      if (delta(p) * p.s0 - loan(p) < 0.5) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    return `${ASSETS[p.asset]} costs $${num(p.s0)}$ today and will be worth either $${num(su(p))}$ or $${num(sd(p))}$ at the end of one period. The risk-free interest rate is $${rateLatex(p.ratePct)}$ per period, compounded once per period, so a loan of 1 today is repaid with $R = ${grossLatex(p.ratePct)}$ at the end of the period (not continuous compounding). You build a portfolio of $\\Delta$ shares plus risk-free borrowing that pays exactly what a European call option with strike $K = ${num(p.strike)}$ pays at the end of the period. How much must you borrow today? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(loan(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const cu = callPayoff(su(p), p.strike);
    const d = delta(p);
    const owed = round(repayment(p), 4);
    const value = round(loan(p), 2);
    return [
      {
        text: 'Choose the number of shares so that the portfolio gains exactly what the call gains.',
        latex: `\\Delta = \\dfrac{C_u - C_d}{S_u - S_d} = \\dfrac{${num(cu)} - 0}{${num(su(p))} - ${num(sd(p))}} = ${num(d, 4)}`,
        why: `The call pays ${plain(cu)} after a rise and 0 after a fall. The loan repayment is the same in both states, so only the shares can create this difference.`,
        result: round(d, 4),
      },
      {
        text: 'After a fall the shares are worth Δ·S_d and the call pays nothing, so that is what you owe the lender.',
        latex: `B\\,R = \\Delta\\,S_d - C_d = ${num(d, 4)} \\times ${num(sd(p))} - 0 = ${num(owed, 4)}`,
        why: 'After a fall the portfolio must be worth what the call pays there, 0: the shares just pay off the loan.',
        result: owed,
      },
      {
        text: 'Borrow today the present value of that repayment.',
        latex: `B = \\dfrac{${num(owed, 4)}}{${grossLatex(p.ratePct)}} = ${num(value, 2)}`,
        why: `A loan of B today grows to B·R by the end of the period. The call is then worth Δ·S₀ − B = ${plain(d * p.s0 - loan(p))}: the cost of the shares minus the borrowing.`,
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
