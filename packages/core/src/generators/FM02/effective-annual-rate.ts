import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Nominal annual rate in per cent. */
  rate: number;
  /** Times interest is added per year, or continuous compounding. */
  compounding: 2 | 4 | 12 | 365 | 'continuous';
  context: 'savings' | 'loan' | 'card';
}

/** Rates in per cent to 2 decimals: a rounding slip of 0.01 points is a different answer. */
const RATE = { tolerance: 0.005, relTolerance: 0 } as const;
const HOW_OFTEN = {
  2: 'twice a year',
  4: 'quarterly',
  12: 'monthly',
  365: 'daily (365 times a year)',
  continuous: 'continuously',
} as const;

/** Growth of 1 over one year at this nominal rate and compounding. */
const growth = (p: Params) =>
  p.compounding === 'continuous'
    ? Math.exp(p.rate / 100)
    : (1 + p.rate / 100 / p.compounding) ** p.compounding;

const ear = (p: Params) => round((growth(p) - 1) * 100, 2);

/** FM02, difficulty 1: effective annual rate, (1 + r/m)^m − 1 or e^r − 1, in per cent. */
export const effectiveAnnualRate: Generator<Params> = {
  id: 'effective-annual-rate',
  title: 'Effective annual rate',
  topicId: 'FM02',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    const rate = rng.int(40, 600) / 20;
    const compounding = rng.pick([2, 4, 12, 365, 'continuous'] as const);
    const daily = compounding === 12 || compounding === 365;
    const context =
      rate <= 12 ? rng.pick(['savings', 'loan'] as const) : daily ? ('card' as const) : 'loan';
    return { rate, compounding, context };
  },

  stem(p) {
    const what = {
      savings: 'A savings account pays a nominal annual rate of',
      loan: 'A bank loan charges a nominal annual rate of',
      card: 'A credit card charges a nominal annual rate (APR) of',
    }[p.context];
    return `${what} $${num(p.rate)}\\%$, compounded ${HOW_OFTEN[p.compounding]}. What is the effective annual rate? Give your answer in per cent to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: ear(p), decimals: 2, unit: '%', ...RATE }),

  steps(p) {
    const r = p.rate / 100;
    const first: Step = {
      text: 'Write the nominal rate as a decimal.',
      latex: `r = ${num(p.rate)}\\% = ${num(r, 4)}`,
      why: 'Percentages are divided by 100 before they go into a formula.',
      result: r,
    };
    const last: Step = {
      text: 'Subtract the 1 you started with and write the result as a percentage.',
      latex: `\\text{EAR} = ${num(growth(p), 6)} - 1 = ${num(ear(p))}\\%`,
      why: 'The effective rate is how much one unit of money gains in a full year, after all the compounding.',
      result: ear(p),
    };
    if (p.compounding === 'continuous') {
      return [
        first,
        {
          text: 'Find how much 1 grows to in a year with continuous compounding.',
          latex: `e^{${num(r, 4)}} = ${num(growth(p), 6)}`,
          why: 'Compounding more and more often makes (1 + r/m)^m approach e^r, its upper limit.',
          result: round(growth(p), 6),
        },
        last,
      ];
    }
    const m = p.compounding;
    return [
      first,
      {
        text: `Grow 1 for one year: ${m} periods, each at the rate r/${m}.`,
        latex: `\\left(1 + \\dfrac{${num(r, 4)}}{${m}}\\right)^{${m}} = ${num(growth(p), 6)}`,
        why: 'The nominal rate is shared between the periods, and each period’s interest earns interest in the later ones.',
        result: round(growth(p), 6),
      },
      last,
    ];
  },

  distractors(p) {
    const r = p.rate / 100;
    const m = p.compounding;
    const candidates =
      m === 'continuous'
        ? [
            { value: p.rate, mistakeCode: 'NOMINAL_EQUALS_EFFECTIVE' },
            { value: round(Math.log(1 + r) * 100, 2), mistakeCode: 'WRONG_DIRECTION' },
          ]
        : [
            { value: p.rate, mistakeCode: 'NOMINAL_EQUALS_EFFECTIVE' },
            { value: round(p.rate / m, 2), mistakeCode: 'PERIODIC_RATE' },
            // Without dividing, daily compounding gives absurd numbers; only offer it up to monthly.
            ...(m <= 12
              ? [{ value: round(((1 + r) ** m - 1) * 100, 2), mistakeCode: 'RATE_NOT_DIVIDED' }]
              : []),
          ];
    return cleanDistractors(ear(p), candidates, RATE.tolerance, RATE.relTolerance);
  },
};
