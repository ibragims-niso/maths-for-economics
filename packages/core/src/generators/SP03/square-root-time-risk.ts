import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  var: {
    horizons: [5, 10, 20],
    setup: (s: string, t: string) =>
      `A bank's 1-day 99 % value at risk (VaR) on its trading book is $${s}$ million. Daily changes in the book's value are independent and have the same distribution, so the value follows a random walk. Use the square-root-of-time rule to find the ${t}-day 99 % VaR, in millions.`,
    unit: ' million',
  },
  fx: {
    horizons: [5, 10, 20, 21, 25, 60],
    setup: (s: string, t: string) =>
      `The daily percentage change in an exchange rate has standard deviation $${s}$ %, and changes on different days are independent (the rate follows a random walk). Find the standard deviation of the change in the rate over ${t} trading days, in per cent.`,
    unit: ' %',
  },
  share: {
    horizons: [250, 252],
    setup: (s: string, t: string) =>
      `A share's daily return has standard deviation $${s}$ %, and returns on different days are independent. Find its annual volatility, the standard deviation of its return over a year of ${t} trading days, in per cent.`,
    unit: ' %',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  /** The 1-day risk: a standard deviation (in %) or a 1-day VaR (in millions). */
  daily: number;
  /** The horizon in trading days. */
  days: number;
}

/** Two decimals; the relative part only covers rounding of √T on the way. */
const SPREAD = { tolerance: 0.01, relTolerance: 0.001 } as const;

const scaled = (p: Params) => p.daily * Math.sqrt(p.days);

function wrongAnswers(p: Params) {
  return cleanDistractors(
    round(scaled(p), 2),
    [
      { value: round(p.daily * p.days, 2), mistakeCode: 'LINEAR_TIME' },
      { value: round(p.daily / Math.sqrt(p.days), 2), mistakeCode: 'DIVIDED_BY_ROOT' },
      { value: round(p.daily * p.daily * p.days, 2), mistakeCode: 'VARIANCE_NOT_SD' },
    ],
    SPREAD.tolerance,
    SPREAD.relTolerance,
  );
}

/** SP03, difficulty 1: the T-day spread σ√T of a random walk from its 1-day spread (VaR or volatility). */
export const squareRootTimeRisk: Generator<Params> = {
  id: 'square-root-time-risk',
  title: 'Risk over several days',
  topicId: 'SP03',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const days = rng.pick(CONTEXTS[context].horizons);
      const daily =
        context === 'var'
          ? round(rng.int(5, 200) / 10, 1)
          : context === 'fx'
            ? round(rng.int(4, 30) * 0.05, 2)
            : round(rng.int(5, 30) / 10, 1);
      const p: Params = { context, daily, days };
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `${CONTEXTS[p.context].setup(num(p.daily), String(p.days))}${Number.isInteger(Math.sqrt(p.days)) ? '' : ' Give your answer to 2 decimal places.'}`,

  answer: (p) => ({ kind: 'numeric', value: round(scaled(p), 2), decimals: 2, ...SPREAD }),

  steps(p) {
    const s = num(p.daily);
    const variance = p.daily * p.daily * p.days;
    const value = round(scaled(p), 2);
    const exact = Number.isInteger(Math.sqrt(p.days));
    if (p.context === 'var') {
      const root = round(Math.sqrt(p.days), 4);
      return [
        {
          text: `Find how much the standard deviation grows over ${p.days} days.`,
          latex: `\\sigma_{${p.days}} = \\sqrt{${p.days}\\,\\sigma_1^2} = \\sqrt{${p.days}}\\;\\sigma_1 ${exact ? '=' : '\\approx'} ${num(root, 4)}\\,\\sigma_1`,
          why: 'For independent daily changes the variances add, so the variance over T days is T times the daily one and the standard deviation is √T times the daily one.',
          result: root,
        },
        {
          text: 'Scale the VaR by the same factor.',
          latex: `\\text{VaR}_{${p.days}} = \\sqrt{${p.days}} \\times ${s} ${exact ? '=' : '\\approx'} ${num(value, 2)}`,
          why: 'With normal changes and no drift the 99 % VaR is 2.326 standard deviations, a fixed multiple, so it grows by √T too: the square-root-of-time rule.',
          result: value,
        },
      ];
    }
    return [
      {
        text: `Add up the variances of the ${p.days} independent daily changes.`,
        latex: `\\operatorname{Var}(\\text{${p.days}-day change}) = ${p.days} \\times ${s}^2 = ${num(variance, 4)}`,
        why: 'For independent changes the variances add, so the variance grows in proportion to the number of days. The standard deviations do not add.',
        result: round(variance, 4),
      },
      {
        text: 'Take the square root to get back to a standard deviation.',
        latex: `\\sqrt{${num(variance, 4)}} = ${s}\\sqrt{${p.days}} ${exact ? '=' : '\\approx'} ${num(value, 2)}`,
        why: 'The standard deviation is the square root of the variance: T days of risk give √T times the daily spread, not T times.',
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
