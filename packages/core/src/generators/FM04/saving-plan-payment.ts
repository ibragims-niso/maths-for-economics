import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The amount wanted at the end of the plan. */
  target: number;
  /** Annual rate in per cent (compounded monthly when deposits are monthly). */
  rate: number;
  /** Deposits per year: 1 (annual) or 12 (monthly). */
  m: 1 | 12;
  years: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const PERIOD = { 1: 'year', 12: 'month' } as const;

const perPeriod = (p: Params) => p.rate / 100 / p.m;
const count = (p: Params) => p.m * p.years;
/** Future-value annuity factor ((1 + r)^n − 1)/r: what saving 1 per period grows to. */
const factor = (p: Params) => ((1 + perPeriod(p)) ** count(p) - 1) / perPeriod(p);
const payment = (p: Params) => round(p.target / factor(p), 2);

/** FM04, difficulty 3: regular deposit that reaches a savings target, C = FV·r/((1 + r)^n − 1). */
export const savingPlanPayment: Generator<Params> = {
  id: 'saving-plan-payment',
  title: 'Regular saving for a target',
  topicId: 'FM04',
  difficulty: 3,
  timeSec: 180,

  params: (rng) =>
    rng.int(0, 1) === 1
      ? {
          target: rng.int(10, 120) * 500, // 5000 to 60000
          // Multiples of 0.6 % a year give a monthly rate with at most 4 decimals.
          rate: round(rng.int(4, 15) * 0.6, 1),
          m: 12,
          years: rng.int(2, 10),
        }
      : {
          target: rng.int(10, 200) * 1000, // 10000 to 200000
          rate: rng.int(4, 16) / 2,
          m: 1,
          years: rng.int(3, 25),
        },

  stem: (p) =>
    `You want to have $${num(p.target)}$ in $${p.years}$ years. You will pay the same amount into a savings account at the end of each ${PERIOD[p.m]}, and the account pays $${num(p.rate)}\\%$ a year${p.m === 12 ? ', compounded monthly' : ''}. How much must you pay in each ${PERIOD[p.m]}? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: payment(p), decimals: 2, ...MONEY }),

  steps(p) {
    const r = perPeriod(p);
    const n = count(p);
    const rateLatex =
      p.m === 12 ? `r = \\dfrac{${num(p.rate / 100, 4)}}{12} = ${num(r, 6)}` : `r = ${num(r, 6)}`;
    const countLatex = p.m === 12 ? `n = 12 \\cdot ${p.years} = ${n}` : `n = ${n}`;
    return [
      {
        text: 'Find the interest rate per period and the number of deposits.',
        latex: `${rateLatex}, \\quad ${countLatex}`,
        why:
          p.m === 12
            ? 'Deposits are monthly, so interest is counted per month: the annual rate is split into 12 and the deposits are counted in months.'
            : 'Deposits and interest are both yearly, so each period is one year.',
        result: n,
      },
      {
        text: 'Find what saving 1 per period grows to: the future-value annuity factor.',
        latex: `\\dfrac{(1 + r)^n - 1}{r} = \\dfrac{(${num(1 + r, 6)})^{${n}} - 1}{${num(r, 6)}} = ${num(factor(p), 6)}`,
        why: 'Deposits of 1 grow to 1 + (1 + r) + … + (1 + r)ⁿ⁻¹ by the end: the last earns nothing, the first earns n − 1 periods of interest. This geometric series sums to the factor.',
        result: round(factor(p), 6),
      },
      {
        text: 'Divide the target by the factor.',
        latex: `C = \\dfrac{${num(p.target)}}{${num(factor(p), 6)}} = ${num(payment(p))}`,
        why: 'The future value of the plan is C times the factor; setting it equal to the target and solving gives C.',
        result: payment(p),
      },
    ];
  },

  distractors(p) {
    const r = perPeriod(p);
    const n = count(p);
    return cleanDistractors(
      payment(p),
      [
        { value: round(p.target / n, 2), mistakeCode: 'NO_INTEREST' },
        { value: round((p.target * r) / (1 - (1 + r) ** -n), 2), mistakeCode: 'PV_INSTEAD' },
        { value: round(p.target / (factor(p) * (1 + r)), 2), mistakeCode: 'DUE_TIMING' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
