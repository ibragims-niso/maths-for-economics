import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  principal: number;
  /** Annual rate in per cent, compounded continuously. */
  rate: number;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const amount = (p: Params) => round(p.principal * Math.exp((p.rate / 100) * p.years), 2);

/** FM02, difficulty 2: amount with continuous compounding, A = P·e^(rt). */
export const continuousCompoundingAmount: Generator<Params> = {
  id: 'continuous-compounding-amount',
  title: 'Amount with continuous compounding',
  topicId: 'FM02',
  difficulty: 2,
  timeSec: 90,

  params: (rng) => ({
    principal: rng.int(2, 40) * 500,
    rate: rng.int(4, 40) / 4,
    years: rng.int(2, 20),
  }),

  stem: (p) =>
    `You deposit $${num(p.principal)}$ in an account that pays $${num(p.rate)}\\%$ a year, compounded continuously. How much is in the account after $${num(p.years)}$ years? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: amount(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = p.rate / 100;
    const rt = r * p.years;
    return [
      {
        text: 'Multiply the rate (as a decimal) by the number of years.',
        latex: `rt = ${num(r, 4)} \\cdot ${num(p.years)} = ${num(rt, 4)}`,
        why: 'With continuous compounding only the product of rate and time matters: it is the exponent of e.',
        result: rt,
      },
      {
        text: 'Find the growth factor.',
        latex: `e^{${num(rt, 4)}} = ${num(Math.exp(rt), 6)}`,
        why: 'One unit of money compounded continuously at rate r for t years grows to e^(rt).',
        result: round(Math.exp(rt), 6),
      },
      {
        text: 'Multiply the deposit by the growth factor.',
        latex: `A = ${num(p.principal)} \\cdot e^{${num(rt, 4)}} = ${num(amount(p))}`,
        why: 'Every unit of the deposit grows by the same factor.',
        result: amount(p),
      },
    ];
  },

  distractors(p) {
    const r = p.rate / 100;
    return cleanDistractors(
      amount(p),
      [
        { value: round(p.principal * (1 + r) ** p.years, 2), mistakeCode: 'ANNUAL_INSTEAD' },
        { value: round(p.principal * (1 + r * p.years), 2), mistakeCode: 'SIMPLE_INSTEAD' },
        { value: round(amount(p) - p.principal, 2), mistakeCode: 'INTEREST_ONLY' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
