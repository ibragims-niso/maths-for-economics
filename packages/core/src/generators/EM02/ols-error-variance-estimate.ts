import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: what is explained, from which units, and how noisy it is. */
type Context = 'wages' | 'demand' | 'growth' | 'housing';

interface Params {
  context: Context;
  /** Number of observations. */
  n: number;
  /** Number of explanatory variables, not counting the intercept. */
  m: number;
  /** The unbiased estimate s² = SSR/(n − k), in quarters, so SSR has at most 2 decimals. */
  s2: number;
}

const LEAD: Readonly<Record<Context, (n: number, m: number) => string>> = {
  wages: (n, m) =>
    `A wage equation with an intercept and ${m} explanatory variables (education, experience and others) is estimated by OLS on ${n} workers.`,
  demand: (n, m) =>
    `A demand equation for a shop's weekly sales, with an intercept and ${m} explanatory variables (its price, rivals' prices and others), is estimated by OLS on ${n} weeks of data.`,
  growth: (n, m) =>
    `A growth regression with an intercept and ${m} explanatory variables (investment rate, schooling and others) is estimated by OLS on ${n} countries.`,
  housing: (n, m) =>
    `A house-price equation with an intercept and ${m} explanatory variables (floor area, distance to the centre and others) is estimated by OLS on ${n} flats, prices in thousands.`,
};

/** Ranges of s² (in quarters) that fit the units of each setting. */
const S2_QUARTERS: Readonly<Record<Context, [number, number]>> = {
  wages: [8, 160],
  demand: [400, 4000],
  growth: [2, 24],
  housing: [400, 6000],
};

const k = (p: Params) => p.m + 1;
const ssr = (p: Params) => round(p.s2 * (p.n - k(p)), 6);
const target = (p: Params) => round(ssr(p) / (p.n - k(p)), 2);

function candidates(p: Params): Distractor[] {
  return [
    { value: round(ssr(p) / p.n, 2), mistakeCode: 'DF_N' },
    { value: round(ssr(p) / (p.n - p.m), 2), mistakeCode: 'DF_NO_INTERCEPT' },
    { value: round(ssr(p) / (p.n - 1), 2), mistakeCode: 'DF_N_MINUS_1' },
  ];
}

const kept = (p: Params) => cleanDistractors(target(p), candidates(p));

/** EM02, difficulty 1: the unbiased error-variance estimate s² = SSR/(n − k) from SSR, n and the number of regressors. */
export const olsErrorVarianceEstimate: Generator<Params> = {
  id: 'ols-error-variance-estimate',
  title: 'Unbiased estimate of the error variance',
  topicId: 'EM02',
  difficulty: 1,
  timeSec: 60,

  params(rng) {
    for (;;) {
      const context = rng.pick(['wages', 'demand', 'growth', 'housing'] as const);
      const [lo, hi] = S2_QUARTERS[context];
      const p: Params = {
        context,
        n: rng.int(12, 80),
        m: rng.int(2, 5),
        s2: rng.int(lo, hi) / 4,
      };
      // At least 5 residual degrees of freedom, and every mistake gives its own wrong number.
      if (p.n - k(p) < 5) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem: (p) =>
    `${LEAD[p.context](p.n, p.m)} Its residual sum of squares is $\\text{SSR} = ${num(ssr(p))}$. Find the unbiased estimate $s^2$ of the error variance $\\sigma^2$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2 }),

  steps(p) {
    const df = p.n - k(p);
    return [
      {
        text: 'Count the estimated coefficients and the residual degrees of freedom.',
        latex: `k = ${p.m} + 1 = ${k(p)}, \\qquad n - k = ${p.n} - ${k(p)} = ${df}`,
        why: 'The intercept is a coefficient too. Each estimated coefficient imposes one condition Xᵀe = 0 on the residuals, so only n − k of them are free to vary.',
        result: df,
      },
      {
        text: 'Divide the residual sum of squares by the degrees of freedom.',
        latex: `s^2 = \\dfrac{\\text{SSR}}{n - k} = \\dfrac{${num(ssr(p))}}{${df}} = ${num(target(p))}`,
        why: 'The residuals are on average a little smaller than the true errors, because b was chosen to make them small. Dividing by n − k instead of n exactly corrects this, so E[s²] = σ². Its square root s is the standard error of the regression.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
