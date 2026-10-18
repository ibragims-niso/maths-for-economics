import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Effective annual rate in per cent. */
  ear: number;
  /** Times interest is added per year, or continuous compounding. */
  compounding: 2 | 4 | 12 | 365 | 'continuous';
}

/** Rates in per cent to 2 decimals: a rounding slip of 0.01 points is a different answer. */
const RATE = { tolerance: 0.005, relTolerance: 0 } as const;
const HOW_OFTEN = {
  2: 'twice a year',
  4: 'quarterly',
  12: 'monthly',
  365: 'daily (365 times a year)',
} as const;

/** The nominal annual rate in per cent that gives this effective rate. */
const nominal = (p: Params) => {
  const g = 1 + p.ear / 100;
  const r =
    p.compounding === 'continuous' ? Math.log(g) : p.compounding * (g ** (1 / p.compounding) - 1);
  return round(r * 100, 2);
};

/** FM02, difficulty 3: nominal rate, m times a year or continuous, that gives a stated EAR. */
export const nominalRateFromEffective: Generator<Params> = {
  id: 'nominal-rate-from-effective',
  title: 'Nominal rate from an effective rate',
  topicId: 'FM02',
  difficulty: 3,
  timeSec: 150,

  params: (rng) => ({
    ear: rng.int(40, 500) / 20,
    compounding: rng.pick([2, 4, 12, 365, 'continuous'] as const),
  }),

  stem(p) {
    const who =
      p.ear <= 10
        ? `A bank wants its savings account to pay an effective annual rate of $${num(p.ear)}\\%$.`
        : `A lender's loan costs an effective annual rate of $${num(p.ear)}\\%$.`;
    const ask =
      p.compounding === 'continuous'
        ? 'What annual rate, compounded continuously, gives the same effective rate?'
        : `Interest is added ${HOW_OFTEN[p.compounding]}. What nominal annual rate, compounded ${HOW_OFTEN[p.compounding]}, gives this effective rate?`;
    return `${who} ${ask} Give your answer in per cent to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: nominal(p), decimals: 2, unit: '%', ...RATE }),

  steps(p) {
    const g = 1 + p.ear / 100;
    const growthLatex = num(g, 4);
    if (p.compounding === 'continuous') {
      return [
        {
          text: 'Set one year of continuous growth equal to the effective growth.',
          latex: `e^{r} = 1 + ${num(p.ear / 100, 4)} = ${growthLatex}`,
          why: 'Both quotes must turn 1 into the same amount after one year; with continuous compounding that amount is e^r.',
          result: round(g, 4),
        },
        {
          text: 'Take the natural logarithm.',
          latex: `r = \\ln ${growthLatex} = ${num(Math.log(g), 6)} = ${num(nominal(p))}\\%`,
          why: 'ln undoes e^x, so it brings the rate down from the exponent.',
          result: nominal(p),
        },
      ];
    }
    const m = p.compounding;
    const periodic = g ** (1 / m) - 1;
    const steps: Step[] = [
      {
        text: 'Set one year of compounding equal to the effective growth.',
        latex: `\\left(1 + \\dfrac{r}{${m}}\\right)^{${m}} = ${growthLatex}`,
        why: 'Both quotes must turn 1 into the same amount after one year.',
        result: round(g, 4),
      },
      {
        text: `Take the ${m === 2 ? 'square' : `${m}th`} root to find the rate per period.`,
        latex: `\\dfrac{r}{${m}} = ${growthLatex}^{1/${m}} - 1 = ${num(periodic, 6)}`,
        why: `Raising to the power 1/${m} undoes raising to the power ${m}.`,
        result: round(periodic, 6),
      },
      {
        text: `Multiply by ${m} to get the nominal annual rate.`,
        latex: `r = ${m} \\cdot ${num(periodic, 6)} = ${num(nominal(p))}\\%`,
        why: 'A nominal rate is the rate per period times the number of periods, with no compounding inside it.',
        result: nominal(p),
      },
    ];
    return steps;
  },

  distractors(p) {
    const i = p.ear / 100;
    const m = p.compounding;
    const candidates =
      m === 'continuous'
        ? [
            { value: p.ear, mistakeCode: 'NOMINAL_EQUALS_EFFECTIVE' },
            { value: round((Math.exp(i) - 1) * 100, 2), mistakeCode: 'WRONG_DIRECTION' },
            { value: round(Math.log10(1 + i) * 100, 2), mistakeCode: 'LOG10_INSTEAD_OF_LN' },
          ]
        : [
            { value: p.ear, mistakeCode: 'NOMINAL_EQUALS_EFFECTIVE' },
            { value: round(((1 + i) ** (1 / m) - 1) * 100, 2), mistakeCode: 'PERIODIC_RATE' },
            { value: round(((1 + i / m) ** m - 1) * 100, 2), mistakeCode: 'WRONG_DIRECTION' },
          ];
    return cleanDistractors(nominal(p), candidates, RATE.tolerance, RATE.relTolerance);
  },
};
