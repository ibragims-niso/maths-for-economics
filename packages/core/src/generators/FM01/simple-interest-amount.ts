import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  principal: number;
  /** Annual rate in per cent. */
  rate: number;
  years: number;
}

const MONEY = { tolerance: 0.01, relTolerance: 0 } as const;

/** FM01, difficulty 1: amount after simple interest, A = P(1 + rt). */
export const simpleInterestAmount: Generator<Params> = {
  id: 'simple-interest-amount',
  title: 'Amount with simple interest',
  topicId: 'FM01',
  difficulty: 1,
  timeSec: 60,

  params: (rng) => ({
    principal: rng.int(5, 200) * 100,
    rate: rng.int(4, 24) / 2,
    years: rng.int(2, 10),
  }),

  stem: (p) =>
    `You deposit $${num(p.principal)}$ at a simple interest rate of $${num(p.rate)}\\%$ per year. How much is in the account after $${num(p.years)}$ years?`,

  answer: (p) => ({
    kind: 'numeric',
    value: round(p.principal * (1 + (p.rate / 100) * p.years), 2),
    decimals: 2,
    ...MONEY,
  }),

  steps(p) {
    const interest = round(p.principal * (p.rate / 100) * p.years, 2);
    return [
      {
        text: 'Write the rate as a decimal.',
        latex: `r = ${num(p.rate)}\\% = ${num(p.rate / 100, 4)}`,
        why: 'Percentages must be divided by 100 before they are used in a formula.',
      },
      {
        text: 'Simple interest is earned on the original deposit only.',
        latex: `I = P r t = ${num(p.principal)} \\cdot ${num(p.rate / 100, 4)} \\cdot ${num(p.years)} = ${num(interest)}`,
        why: 'With simple interest the interest each year is the same, because it is never added to the base.',
        result: interest,
      },
      {
        text: 'Add the interest to the deposit.',
        latex: `A = ${num(p.principal)} + ${num(interest)} = ${num(p.principal + interest)}`,
        why: 'The final amount is what you put in plus all the interest earned.',
        result: round(p.principal + interest, 2),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      round(p.principal * (1 + (p.rate / 100) * p.years), 2),
      [
        { value: round(p.principal * (1 + p.rate / 100) ** p.years, 2), mistakeCode: 'COMPOUNDED' },
        { value: round(p.principal * (p.rate / 100) * p.years, 2), mistakeCode: 'INTEREST_ONLY' },
        {
          value: round(p.principal * (1 + p.rate * p.years), 2),
          mistakeCode: 'PERCENT_NOT_DIVIDED',
        },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
