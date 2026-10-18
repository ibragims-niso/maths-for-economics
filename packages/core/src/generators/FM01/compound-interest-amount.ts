import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  principal: number;
  /** Annual rate in per cent. */
  rate: number;
  /** Compounding periods per year. */
  m: 1 | 2 | 4 | 12;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const PERIOD_NAME = { 1: 'annually', 2: 'twice a year', 4: 'quarterly', 12: 'monthly' } as const;

const amount = (p: Params) => p.principal * (1 + p.rate / 100 / p.m) ** (p.m * p.years);

/** FM01, difficulty 2: amount with compound interest, A = P(1 + r/m)^(mt). */
export const compoundInterestAmount: Generator<Params> = {
  id: 'compound-interest-amount',
  title: 'Amount with compound interest',
  topicId: 'FM01',
  difficulty: 2,
  timeSec: 120,

  params: (rng) => ({
    principal: rng.int(2, 40) * 500,
    rate: rng.int(4, 24) / 2,
    m: rng.pick([1, 2, 4, 12] as const),
    years: rng.int(2, 10),
  }),

  stem: (p) =>
    `You invest $${num(p.principal)}$ at $${num(p.rate)}\\%$ per year, compounded ${PERIOD_NAME[p.m]}. How much is the investment worth after $${num(p.years)}$ years? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: round(amount(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const i = p.rate / 100 / p.m;
    const n = p.m * p.years;
    return [
      {
        text: 'Find the interest rate per period.',
        latex: `i = \\dfrac{${num(p.rate / 100, 4)}}{${p.m}} = ${num(i, 6)}`,
        why: 'The annual rate is shared equally between the compounding periods of the year.',
      },
      {
        text: 'Count the compounding periods.',
        latex: `n = ${p.m} \\cdot ${num(p.years)} = ${n}`,
        why: 'Interest is added m times a year for t years.',
        result: n,
      },
      {
        text: 'Grow the deposit by (1 + i) for each period.',
        latex: `A = ${num(p.principal)}(1 + ${num(i, 6)})^{${n}} = ${num(round(amount(p), 2))}`,
        why: 'Each period’s interest is added to the balance and then earns interest itself: that is compounding.',
        result: round(amount(p), 2),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      round(amount(p), 2),
      [
        {
          value: round(p.principal * (1 + (p.rate / 100) * p.years), 2),
          mistakeCode: 'SIMPLE_INSTEAD',
        },
        {
          value: round(p.principal * (1 + p.rate / 100) ** p.years, 2),
          mistakeCode: 'ANNUAL_ONLY',
        },
        {
          value: round(p.principal * (1 + p.rate / 100) ** (p.m * p.years), 2),
          mistakeCode: 'RATE_NOT_DIVIDED',
        },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
