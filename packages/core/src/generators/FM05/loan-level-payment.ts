import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'mortgage' | 'car' | 'student' | 'business';

interface Params {
  context: Context;
  /** The amount borrowed. */
  loan: number;
  /** Annual rate in per cent (compounded monthly when payments are monthly). */
  rate: number;
  /** Payments per year: 1 (annual) or 12 (monthly). */
  m: 1 | 12;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const PERIOD = { 1: 'year', 12: 'month' } as const;

const perPeriod = (p: Params) => p.rate / 100 / p.m;
const count = (p: Params) => p.m * p.years;
/** Annuity factor (1 − (1 + r)^(−n))/r: the value today of 1 paid at the end of every period. */
const factor = (p: Params) => (1 - (1 + perPeriod(p)) ** -count(p)) / perPeriod(p);
const payment = (p: Params) => round(p.loan / factor(p), 2);

const OPENING: Record<Context, (p: Params) => string> = {
  mortgage: (p) =>
    `A household takes out a mortgage of $${num(p.loan)}$, repaid in equal monthly instalments over $${p.years}$ years.`,
  car: (p) =>
    `A car loan of $${num(p.loan)}$ is repaid in equal monthly instalments over $${p.years}$ years.`,
  student: (p) =>
    `A graduate repays a student loan of $${num(p.loan)}$ in equal monthly instalments over $${p.years}$ years.`,
  business: (p) =>
    `A firm borrows $${num(p.loan)}$ to buy machinery and repays it in equal yearly instalments over $${p.years}$ years.`,
};

/** FM05, difficulty 1: level payment of an amortising loan, PMT = L·r/(1 − (1 + r)^(−n)). */
export const loanLevelPayment: Generator<Params> = {
  id: 'loan-level-payment',
  title: 'Level payment on a loan',
  topicId: 'FM05',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    const context = rng.pick(['mortgage', 'car', 'student', 'business'] as const);
    // Monthly rates are multiples of 0.6 % a year, so r = rate/12 has at most 4 decimals.
    switch (context) {
      case 'mortgage':
        return {
          context,
          loan: rng.int(12, 80) * 5000,
          rate: round(rng.int(5, 13) * 0.6, 1),
          m: 12,
          years: rng.int(10, 30),
        };
      case 'car':
        return {
          context,
          loan: rng.int(12, 90) * 500,
          rate: round(rng.int(5, 20) * 0.6, 1),
          m: 12,
          years: rng.int(2, 7),
        };
      case 'student':
        return {
          context,
          loan: rng.int(8, 60) * 1000,
          rate: round(rng.int(4, 12) * 0.6, 1),
          m: 12,
          years: rng.int(5, 20),
        };
      default:
        return {
          context,
          loan: rng.int(4, 160) * 5000,
          rate: rng.int(6, 24) / 2,
          m: 1,
          years: rng.int(3, 15),
        };
    }
  },

  stem: (p) =>
    `${OPENING[p.context](p)} The interest rate is $${num(p.rate)}\\%$ a year${p.m === 12 ? ', compounded monthly' : ''}, and each payment is made at the end of the ${PERIOD[p.m]}. What is the ${p.m === 12 ? 'monthly' : 'yearly'} payment? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: payment(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = perPeriod(p);
    const n = count(p);
    const rateLatex =
      p.m === 12 ? `r = \\dfrac{${num(p.rate / 100, 4)}}{12} = ${num(r, 6)}` : `r = ${num(r, 6)}`;
    const countLatex = p.m === 12 ? `n = 12 \\cdot ${p.years} = ${n}` : `n = ${n}`;
    return [
      {
        text: 'Find the interest rate per period and the number of payments.',
        latex: `${rateLatex}, \\quad ${countLatex}`,
        why:
          p.m === 12
            ? 'Payments are monthly, so interest is charged per month: the annual rate is split into 12 and the payments are counted in months.'
            : 'Payments and interest are both yearly, so each period is one year.',
        result: n,
      },
      {
        text: 'Compute the annuity factor.',
        latex: `\\dfrac{1 - (1 + r)^{-n}}{r} = \\dfrac{1 - (${num(1 + r, 6)})^{-${n}}}{${num(r, 6)}} = ${num(factor(p), 6)}`,
        why: 'The factor is the value today of 1 paid at the end of every period for n periods (FM04).',
        result: round(factor(p), 6),
      },
      {
        text: 'Divide the loan by the annuity factor.',
        latex: `PMT = \\dfrac{${num(p.loan)}}{${num(factor(p), 6)}} = ${num(payment(p))}`,
        why: 'The lender gives L today in exchange for the payments, so L must equal their present value, PMT × factor. Solving for PMT gives L ÷ factor = L·r/(1 − (1 + r)^(−n)).',
        result: payment(p),
      },
    ];
  },

  distractors(p) {
    const r = perPeriod(p);
    const n = count(p);
    const R = p.rate / 100;
    const candidates = [
      { value: round(p.loan / n, 2), mistakeCode: 'IGNORED_INTEREST' },
      { value: round((p.loan * (1 + R * p.years)) / n, 2), mistakeCode: 'FLAT_RATE' },
      { value: round((p.loan * r) / ((1 + r) ** n - 1), 2), mistakeCode: 'FV_FACTOR' },
    ];
    if (p.m === 12) {
      candidates.push({
        value: round((p.loan * R) / (1 - (1 + R) ** -n), 2),
        mistakeCode: 'ANNUAL_RATE_MONTHLY',
      });
    }
    return cleanDistractors(payment(p), candidates, MONEY.tolerance, MONEY.relTolerance);
  },
};
