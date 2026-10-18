import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  context: 'share' | 'land';
  /** The payment just made (C₀): this year's dividend or rent. */
  current: number;
  /** Growth rate of the payments, in per cent per year. */
  growth: number;
  /** Required return (discount rate), in per cent per year; always above the growth rate. */
  rate: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** Next year's payment C₁ = C₀(1 + g): the first one the buyer receives. */
const next = (p: Params) => p.current * (1 + p.growth / 100);
const value = (p: Params) => round(next(p) / ((p.rate - p.growth) / 100), 2);

/** FM04, difficulty 2: value of a growing perpetuity (Gordon model), P = C₀(1 + g)/(r − g). */
export const growingPerpetuityValue: Generator<Params> = {
  id: 'growing-perpetuity-value',
  title: 'Value of a growing perpetuity',
  topicId: 'FM04',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    if (rng.pick(['share', 'land'] as const) === 'share') {
      const growth = rng.int(2, 12) / 2; // 1 % to 6 %
      return {
        context: 'share',
        current: rng.int(10, 160) / 20, // 0.50 to 8.00 per share
        growth,
        rate: growth + rng.int(4, 16) / 2, // 2 to 8 points above growth
      };
    }
    const growth = rng.int(2, 8) / 2; // 1 % to 4 %
    return {
      context: 'land',
      current: rng.int(4, 100) * 500, // a yearly rent of 2000 to 50000
      growth,
      rate: growth + rng.int(4, 12) / 2, // 2 to 6 points above growth
    };
  },

  stem: (p) =>
    p.context === 'share'
      ? `A company has just paid a dividend of $${num(p.current)}$ per share. Dividends are expected to grow by $${num(p.growth)}\\%$ a year for ever, and investors require a return of $${num(p.rate)}\\%$ a year. What is one share worth today? Give your answer to 2 decimal places.`
      : `A landowner has just received this year's rent of $${num(p.current)}$ for a field. Rents are expected to grow by $${num(p.growth)}\\%$ a year for ever, and the discount rate is $${num(p.rate)}\\%$ a year. What is the field worth today, as the present value of all future rents? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = p.rate / 100;
    const g = p.growth / 100;
    const gap = round(r - g, 6);
    return [
      {
        text: 'Find the next payment, one year from now.',
        latex: `C_1 = ${num(p.current)} \\times ${num(1 + g, 4)} = ${num(next(p), 5)}`,
        why: 'The formula values payments that start one period from now, so it needs next year’s payment; the one just made belongs to the previous owner.',
        result: round(next(p), 5),
      },
      {
        text: 'Subtract the growth rate from the discount rate.',
        latex: `r - g = ${num(r, 4)} - ${num(g, 4)} = ${num(gap, 4)}`,
        why: 'Each later payment is bigger, which partly offsets the discounting; the stream is discounted at the gap r − g.',
        result: gap,
      },
      {
        text: 'Divide the next payment by the gap.',
        latex: `PV = \\dfrac{${num(next(p), 5)}}{${num(gap, 4)}} = ${num(value(p))}`,
        why: 'The present values form a geometric series with ratio (1 + g)/(1 + r) < 1; its sum is C₁/(r − g).',
        result: value(p),
      },
    ];
  },

  distractors(p) {
    const r = p.rate / 100;
    const g = p.growth / 100;
    return cleanDistractors(
      value(p),
      [
        { value: round(next(p) / (r + g), 2), mistakeCode: 'GROWTH_ADDED' },
        { value: round(p.current / r, 2), mistakeCode: 'IGNORED_GROWTH' },
        { value: round(p.current / (r - g), 2), mistakeCode: 'CURRENT_PAYMENT' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
