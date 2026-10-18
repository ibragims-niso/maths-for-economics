import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Drawn first (per cent, in steps of 0.5) so the answer is a clean rate. */
  rate: number;
  years: number;
  /** What the certificate pays at the end. */
  faceValue: number;
  /** Today's price: the face value discounted at the rate, to 2 decimal places. */
  price: number;
}

const ROOT_NAME: Record<number, string> = { 2: 'square', 3: 'cube' };

const ratio = (p: Params) => p.faceValue / p.price;
const growthPerYear = (p: Params) => ratio(p) ** (1 / p.years);
const ratePercent = (p: Params) => round((growthPerYear(p) - 1) * 100, 2);

/** FM03, difficulty 3: the annual rate that turns a present value into a future value. */
export const impliedAnnualRate: Generator<Params> = {
  id: 'implied-annual-rate',
  title: 'Annual rate from present and future value',
  topicId: 'FM03',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    const rate = rng.int(4, 24) / 2;
    const years = rng.int(2, 10);
    const faceValue = rng.int(8, 80) * 500;
    const price = round(faceValue / (1 + rate / 100) ** years, 2);
    return { rate, years, faceValue, price };
  },

  stem: (p) =>
    `A savings certificate costs $${num(p.price)}$ today and pays $${num(p.faceValue)}$ in $${p.years}$ years, with nothing paid in between. What annual rate of return, compounded annually, does it give? Give your answer as a percentage to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: ratePercent(p), decimals: 2 }),

  steps: (p) => [
    {
      text: 'Write the condition and divide by today’s price.',
      latex: `${num(p.price)}(1 + r)^{${p.years}} = ${num(p.faceValue)} \\;\\Rightarrow\\; (1 + r)^{${p.years}} = ${num(ratio(p), 6)}`,
      why: 'The price is the present value of the payment, so growing it at the rate r for n years must give the payment.',
      result: round(ratio(p), 6),
    },
    {
      text: `Take the ${ROOT_NAME[p.years] ?? `${p.years}th`} root of both sides.`,
      latex: `1 + r = ${num(ratio(p), 6)}^{1/${p.years}} = ${num(growthPerYear(p), 6)}`,
      why: 'The root undoes the power: it turns growth over n years into growth per year.',
      result: round(growthPerYear(p), 6),
    },
    {
      text: 'Subtract 1 and write the rate in per cent.',
      latex: `r = ${num(growthPerYear(p) - 1, 6)} = ${num(ratePercent(p))}\\%`,
      why: '1 + r is the growth factor; the rate is the part above 1.',
      result: ratePercent(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(ratePercent(p), [
      { value: round(((ratio(p) - 1) / p.years) * 100, 2), mistakeCode: 'SIMPLE_RATE' },
      { value: round((ratio(p) - 1) * 100, 2), mistakeCode: 'TOTAL_GROWTH' },
      { value: round(growthPerYear(p), 4), mistakeCode: 'FACTOR_NOT_RATE' },
    ]),
};
