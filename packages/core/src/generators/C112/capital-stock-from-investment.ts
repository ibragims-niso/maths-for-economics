import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Net investment I(t) = A·e^(kt), in billions a year. */
  A: number;
  /** Growth rate of investment, a multiple of 0.01. */
  k: number;
  /** Capital stock now, K(0), in billions. */
  k0: number;
  years: number;
}

/** Money-like answer to 2 decimals: allow a slip in the last digit only. */
const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** K(t) = (A/k)e^(kt) + c₀ with c₀ = K(0) − A/k. */
const ratio = (p: Params) => p.A / p.k;
const growthFactor = (p: Params) => Math.exp(p.k * p.years);
const constant = (p: Params) => p.k0 - ratio(p);
const capital = (p: Params) => round(p.k0 + ratio(p) * (growthFactor(p) - 1), 2);

/** C112, difficulty 3: capital stock after T years from net investment A·e^(kt) and K(0). */
export const capitalStockFromInvestment: Generator<Params> = {
  id: 'capital-stock-from-investment',
  title: 'Capital stock from net investment',
  topicId: 'C112',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p = {
        A: rng.int(5, 60) * 10,
        k: rng.int(2, 10) / 100,
        k0: rng.int(4, 40) * 500,
        years: rng.int(2, 20),
      };
      if (p.k * p.years <= 1.5) return p;
    }
  },

  stem: (p) =>
    `A country's net investment, the yearly increase in its capital stock, is $I(t) = ${num(p.A)}e^{${num(p.k)}t}$ billion a year, $t$ years from now. Its capital stock now is $K(0) = ${num(p.k0)}$ billion. Find the capital stock after $${num(p.years)}$ years, in billions, to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: capital(p), decimals: 2, ...MONEY }),

  steps: (p) => [
    {
      text: 'Integrate net investment.',
      latex: `K(t) = \\int ${num(p.A)}e^{${num(p.k)}t}\\,dt = \\frac{${num(p.A)}}{${num(p.k)}}e^{${num(p.k)}t} + c_0 = ${num(ratio(p))}e^{${num(p.k)}t} + c_0`,
      why: 'Net investment is the rate of change of the capital stock, K′(t) = I(t). The antiderivative of e^(kt) is e^(kt)/k: differentiating it brings the k back.',
    },
    {
      text: 'Fix the constant with the capital stock now.',
      latex: `K(0) = ${num(ratio(p))} + c_0 = ${num(p.k0)} \\Rightarrow c_0 = ${num(constant(p))}`,
      why: `At t = 0 the exponential term is ${num(ratio(p))}, not 0, so the constant is K(0) minus that term, not K(0) itself.`,
      result: round(constant(p), 2),
    },
    {
      text: 'Evaluate after the given number of years.',
      latex: `K(${num(p.years)}) = ${num(ratio(p))}e^{${num(round(p.k * p.years, 2))}} ${constant(p) < 0 ? '-' : '+'} ${num(Math.abs(constant(p)))} = ${num(capital(p))}`,
      why: `e^(${num(round(p.k * p.years, 2))}) ≈ ${num(growthFactor(p), 4)}. As a check, the capital added over the period is ${num(round(capital(p) - p.k0, 2))}, more than ${num(p.years)} years of the starting investment ${num(p.A)}, because investment grows.`,
      result: capital(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(
      capital(p),
      [
        { value: round(ratio(p) * growthFactor(p) + p.k0, 2), mistakeCode: 'WRONG_CONSTANT' },
        { value: round(ratio(p) * (growthFactor(p) - 1), 2), mistakeCode: 'FORGOT_CONSTANT' },
        { value: round(p.k0 + p.A * (growthFactor(p) - 1), 2), mistakeCode: 'EXP_NO_DIVIDE_K' },
        {
          value: round(p.k0 + p.A * p.k * (growthFactor(p) - 1), 2),
          mistakeCode: 'DIFFERENTIATED',
        },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
