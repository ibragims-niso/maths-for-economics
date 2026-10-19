import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: what is explained, by how many variables, from which units. */
type Context = 'wages' | 'demand' | 'growth' | 'housing';

interface Params {
  context: Context;
  /** Number of observations. */
  n: number;
  /** Number of explanatory variables, not counting the intercept. */
  m: number;
  /** Total sum of squares, a whole multiple of 100. */
  sst: number;
  /** R² in hundredths, so SSR = SST·(1 − R²) is a whole number. */
  r2: number;
}

/** A share to 3 decimal places: only a correctly rounded value is accepted. */
const THREE_DP = { tolerance: 0.0005, relTolerance: 0 } as const;

const LEAD: Readonly<Record<Context, (n: number, m: number) => string>> = {
  wages: (n, m) =>
    `A wage equation explains the hourly wage of ${n} workers by an intercept and ${m} explanatory variables (education, experience and others).`,
  demand: (n, m) =>
    `A demand equation explains a shop's weekly sales in ${n} weeks by an intercept and ${m} explanatory variables (its price, rivals' prices and others).`,
  growth: (n, m) =>
    `A growth regression explains the average GDP growth of ${n} countries by an intercept and ${m} explanatory variables (investment rate, schooling and others).`,
  housing: (n, m) =>
    `A house-price equation explains the prices of ${n} flats by an intercept and ${m} explanatory variables (floor area, distance to the centre and others).`,
};

const ssr = (p: Params) => round(p.sst * (1 - p.r2), 6);
/** R̄² = 1 − (1 − R²)(n − 1)/(n − k) with k = m + 1 coefficients. */
const adjusted = (p: Params, k = p.m + 1) => 1 - ((1 - p.r2) * (p.n - 1)) / (p.n - k);
const target = (p: Params) => round(adjusted(p), 3);

function candidates(p: Params): Distractor[] {
  const k = p.m + 1;
  return [
    { value: round(p.r2, 3), mistakeCode: 'NO_ADJUSTMENT' },
    { value: round(adjusted(p, p.m), 3), mistakeCode: 'DF_NO_INTERCEPT' },
    { value: round(1 - ((1 - p.r2) * (p.n - k)) / (p.n - 1), 3), mistakeCode: 'DF_RATIO_INVERTED' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), THREE_DP.tolerance, THREE_DP.relTolerance);

/** EM01, difficulty 2: adjusted R² from SSR, SST, the number of observations and of regressors. */
export const adjustedRSquared: Generator<Params> = {
  id: 'adjusted-r-squared',
  title: 'Adjusted R²',
  topicId: 'EM01',
  difficulty: 2,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const p: Params = {
        context: rng.pick(['wages', 'demand', 'growth', 'housing'] as const),
        n: rng.int(10, 60),
        m: rng.int(2, 5),
        sst: 100 * rng.int(2, 60),
        r2: rng.int(30, 90) / 100,
      };
      // At least 5 residual degrees of freedom, and an adjusted R² that stays clearly positive.
      if (p.n - p.m - 1 < 5) continue;
      if (adjusted(p) < 0.05) continue;
      // Every mistake must lead to its own wrong number.
      if (kept(p).length === 3) return p;
    }
  },

  stem: (p) =>
    `${LEAD[p.context](p.n, p.m)} Its residual sum of squares is $\\text{SSR} = ${num(ssr(p))}$ and its total sum of squares is $\\text{SST} = ${num(p.sst)}$. Find the adjusted $R^2$. Give your answer to 3 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 3, ...THREE_DP }),

  steps(p) {
    const k = p.m + 1;
    return [
      {
        text: 'Count the estimated coefficients.',
        latex: `k = ${p.m} + 1 = ${k}, \\qquad n - k = ${p.n} - ${k} = ${p.n - k}`,
        why: 'The intercept is a coefficient too, so k is the number of columns of X, the column of ones included. Each estimated coefficient uses up one degree of freedom.',
        result: k,
      },
      {
        text: 'Find R² from the sums of squares.',
        latex: `R^2 = 1 - \\dfrac{\\text{SSR}}{\\text{SST}} = 1 - \\dfrac{${num(ssr(p))}}{${num(p.sst)}} = ${num(p.r2, 3)}`,
        why: 'R² is the share of the variation of y around its mean that the regression explains.',
        result: p.r2,
      },
      {
        text: 'Adjust for the degrees of freedom.',
        latex: `\\bar R^2 = 1 - (1 - R^2)\\,\\dfrac{n - 1}{n - k} = 1 - ${num(round(1 - p.r2, 6), 3)} \\cdot \\dfrac{${p.n - 1}}{${p.n - k}} = ${num(target(p), 3)}`,
        why: 'Adjusted R² compares the residual variance SSR/(n − k) with the total variance SST/(n − 1). It is always below R², and it rises with a new regressor only if that regressor cuts SSR by enough to pay for the degree of freedom it uses.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
