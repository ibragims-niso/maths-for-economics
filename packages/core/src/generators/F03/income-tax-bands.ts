import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Income up to this is tax-free. */
  allowance: number;
  /** Top of the basic band; income above it pays the higher rate. */
  upper: number;
  /** Basic and higher rates, in per cent. */
  rate1: number;
  rate2: number;
  income: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** Tax on `amount` at `rate` per cent. Amounts are multiples of 500, so the result is whole. */
const at = (rate: number, amount: number) => (rate * amount) / 100;

const inTopBand = (p: Params) => p.income > p.upper;

const tax = (p: Params) =>
  inTopBand(p)
    ? at(p.rate1, p.upper - p.allowance) + at(p.rate2, p.income - p.upper)
    : at(p.rate1, p.income - p.allowance);

/** F03, difficulty 3: income tax from a piecewise function with a tax-free allowance and two rates. */
export const incomeTaxBands: Generator<Params> = {
  id: 'income-tax-bands',
  title: 'Income tax with bands',
  topicId: 'F03',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    const allowance = rng.int(5, 15) * 1000;
    const width = rng.int(10, 40) * 1000;
    const upper = allowance + width;
    const rate1 = rng.pick([10, 15, 20, 25]);
    const rate2 = rate1 + rng.pick([10, 15, 20]);
    // Two incomes in three reach the top band; the rest stay inside the basic band.
    const income =
      rng.int(1, 3) > 1
        ? upper + rng.int(1, 80) * 500
        : allowance + rng.int(1, width / 500 - 1) * 500;
    return { allowance, upper, rate1, rate2, income };
  },

  stem: (p) =>
    `In a country, the first $${num(p.allowance)}$ of yearly income is tax-free, income between $${num(p.allowance)}$ and $${num(p.upper)}$ is taxed at $${num(p.rate1)}\\%$, and income above $${num(p.upper)}$ is taxed at $${num(p.rate2)}\\%$. How much income tax does a person earning $${num(p.income)}$ a year pay?`,

  answer: (p) => ({ kind: 'numeric', value: tax(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r1 = num(p.rate1 / 100);
    const r2 = num(p.rate2 / 100);
    if (!inTopBand(p)) {
      return [
        {
          text: 'Find the band the income falls in.',
          latex: `${num(p.allowance)} < ${num(p.income)} \\le ${num(p.upper)}`,
          why: 'A piecewise function has a different rule on each interval, so first decide which interval the input is in.',
        },
        {
          text: 'Tax only the income above the allowance, at the basic rate.',
          latex: `T = ${r1} \\cdot (${num(p.income)} - ${num(p.allowance)}) = ${num(tax(p))}`,
          why: 'The allowance is taxed at 0 %, and the income never reaches the higher band, so only the basic rate applies.',
          result: tax(p),
        },
      ];
    }
    const basic = at(p.rate1, p.upper - p.allowance);
    const higher = at(p.rate2, p.income - p.upper);
    return [
      {
        text: 'Find the band the income falls in.',
        latex: `${num(p.income)} > ${num(p.upper)}`,
        why: 'A piecewise function has a different rule on each interval, so first decide which interval the input is in.',
      },
      {
        text: 'Tax the whole basic band at the basic rate.',
        latex: `${r1} \\cdot (${num(p.upper)} - ${num(p.allowance)}) = ${num(basic)}`,
        why: 'Income passes through every lower band on the way up, so the basic band is taxed in full.',
        result: basic,
      },
      {
        text: 'Tax only the part above the upper limit at the higher rate.',
        latex: `${r2} \\cdot (${num(p.income)} - ${num(p.upper)}) = ${num(higher)}`,
        why: 'The higher rate is a marginal rate: it applies only to income inside its own band.',
        result: higher,
      },
      {
        text: 'Add the tax from each band.',
        latex: `T = ${num(basic)} + ${num(higher)} = ${num(tax(p))}`,
        why: 'Total tax is the sum of the tax collected in every band the income reaches.',
        result: tax(p),
      },
    ];
  },

  distractors(p) {
    const candidates = inTopBand(p)
      ? [
          { value: at(p.rate1, p.income - p.allowance), mistakeCode: 'WRONG_BAND' },
          { value: at(p.rate2, p.income), mistakeCode: 'TOP_RATE_ON_ALL' },
          {
            value: at(p.rate1, p.upper) + at(p.rate2, p.income - p.upper),
            mistakeCode: 'IGNORED_ALLOWANCE',
          },
          { value: at(p.rate2, p.income - p.upper), mistakeCode: 'TOP_BAND_ONLY' },
        ]
      : [
          { value: at(p.rate2, p.income - p.allowance), mistakeCode: 'WRONG_BAND' },
          { value: at(p.rate2, p.income), mistakeCode: 'TOP_RATE_ON_ALL' },
          { value: at(p.rate1, p.income), mistakeCode: 'IGNORED_ALLOWANCE' },
        ];
    return cleanDistractors(tax(p), candidates, MONEY.tolerance, MONEY.relTolerance);
  },
};
