import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'pension' | 'prize' | 'field' | 'lease' | 'income';

interface Params {
  context: Context;
  /** The payment made at the end of every period. */
  payment: number;
  /** Annual rate in per cent (compounded monthly when payments are monthly). */
  rate: number;
  /** Payments per year: 1 (annual) or 12 (monthly). */
  m: 1 | 12;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const MONTHLY: readonly Context[] = ['lease', 'income'];

const perPeriod = (p: Params) => p.rate / 100 / p.m;
const count = (p: Params) => p.m * p.years;
/** Annuity factor (1 − (1 + r)^(−n))/r: the sum of the n discount factors. */
const factor = (p: Params) => (1 - (1 + perPeriod(p)) ** -count(p)) / perPeriod(p);
const presentValue = (p: Params) => round(p.payment * factor(p), 2);

const OPENING: Record<Context, (p: Params) => string> = {
  pension: (p) =>
    `A pension pays $${num(p.payment)}$ at the end of each year for $${p.years}$ years.`,
  prize: (p) =>
    `A lottery prize is paid out as $${num(p.payment)}$ at the end of each year for $${p.years}$ years.`,
  field: (p) =>
    `A farmer rents out a field for $${num(p.payment)}$ a year, paid at the end of each year, on a $${p.years}$-year contract.`,
  lease: (p) =>
    `A firm leases out a machine for $${num(p.payment)}$ a month, paid at the end of each month, for $${p.years}$ years.`,
  income: (p) =>
    `A retirement plan pays $${num(p.payment)}$ at the end of each month for $${p.years}$ years.`,
};

/** FM04, difficulty 1: present value of an ordinary annuity, PV = C(1 − (1 + r)^(−n))/r. */
export const annuityPresentValue: Generator<Params> = {
  id: 'annuity-present-value',
  title: 'Present value of an annuity',
  topicId: 'FM04',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['pension', 'prize', 'field', 'lease', 'income'] as const);
      const p: Params = MONTHLY.includes(context)
        ? {
            context,
            payment: rng.int(4, 100) * 25,
            // Multiples of 0.6 % a year give a monthly rate with at most 4 decimals.
            rate: round(rng.int(4, 20) * 0.6, 1),
            m: 12,
            years: rng.int(2, 25),
          }
        : {
            context,
            payment: rng.int(2, 60) * 500,
            rate: rng.int(4, 20) / 2,
            m: 1,
            years: rng.int(3, 30),
          };
      // When n = 1/r the undiscounted sum nC equals the perpetuity C/r; keep the two mistakes apart.
      if (Math.abs(count(p) * perPeriod(p) - 1) > 1e-9) return p;
    }
  },

  stem: (p) =>
    `${OPENING[p.context](p)} The interest rate is $${num(p.rate)}\\%$ a year${p.m === 12 ? ', compounded monthly' : ''}. What is this stream of payments worth today? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: presentValue(p), decimals: 2, ...MONEY }),

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
            ? 'Payments are monthly, so the annual rate is split into 12 monthly rates and the payments are counted in months.'
            : 'Payments are yearly and the rate is a yearly rate, so each period is one year.',
        result: n,
      },
      {
        text: 'Compute the annuity factor.',
        latex: `\\dfrac{1 - (1 + r)^{-n}}{r} = \\dfrac{1 - (${num(1 + r, 6)})^{-${n}}}{${num(r, 6)}} = ${num(factor(p), 6)}`,
        why: 'The factor is the sum of the discount factors 1/(1 + r) + 1/(1 + r)² + … + 1/(1 + r)ⁿ, a geometric series.',
        result: round(factor(p), 6),
      },
      {
        text: 'Multiply the payment by the annuity factor.',
        latex: `PV = ${num(p.payment)} \\times ${num(factor(p), 6)} = ${num(presentValue(p))}`,
        why: 'Each payment is discounted back to today; multiplying by the factor does all n discounts at once.',
        result: presentValue(p),
      },
    ];
  },

  distractors(p) {
    const r = perPeriod(p);
    const n = count(p);
    return cleanDistractors(
      presentValue(p),
      [
        { value: round(n * p.payment, 2), mistakeCode: 'UNDISCOUNTED' },
        { value: round((p.payment * ((1 + r) ** n - 1)) / r, 2), mistakeCode: 'FV_INSTEAD' },
        { value: round(p.payment * factor(p) * (1 + r), 2), mistakeCode: 'DUE_TIMING' },
        { value: round(p.payment / r, 2), mistakeCode: 'PERPETUITY_INSTEAD' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
