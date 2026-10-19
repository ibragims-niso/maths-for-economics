import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: y regressed on x. */
type Context = 'wages' | 'demand' | 'consumption';

interface Params {
  context: Context;
  n: number;
  /** The mean of x, a whole number or a half. */
  xbar: number;
  /** √Σ(x − x̄)², a whole number, so the standard error has a short decimal. */
  rootSxx: number;
  /** The standard error of the regression s = √(SSR/(n − 2)). */
  s: number;
}

/** Asked to 4 decimal places; the inputs make the standard error exact. */
const FOUR_DP = { tolerance: 0.0001, relTolerance: 0 } as const;

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 6));

interface Recipe {
  ns: [number, number];
  xbars: number[];
  roots: number[];
  sds: number[];
  /** Allowed standard deviation of x (divisor n), so the spread is realistic. */
  spread: [number, number];
  text: (n: number) => string;
}

const RECIPES: Readonly<Record<Context, Recipe>> = {
  wages: {
    ns: [20, 60],
    xbars: range(10, 15, 0.5),
    roots: range(5, 25),
    sds: range(2, 10, 0.5),
    spread: [1, 4],
    text: (n) => `the hourly wage $y$ of ${n} workers on their years of education $x$`,
  },
  demand: {
    ns: [15, 52],
    xbars: range(2, 8, 0.5),
    roots: range(2, 10),
    sds: range(4, 40, 2),
    spread: [0.3, 2],
    text: (n) => `a shop's weekly sales $y$ in ${n} weeks on its price $x$`,
  },
  consumption: {
    ns: [20, 80],
    xbars: range(20, 60, 5),
    roots: range(20, 100, 5),
    sds: range(0.5, 6, 0.5),
    spread: [3, 15],
    text: (n) =>
      `the monthly spending $y$ of ${n} households on their monthly income $x$ (both in thousands)`,
  },
};

export const sxxOf = (p: Params) => p.rootSxx ** 2;
export const sumSquaresOf = (p: Params) => round(sxxOf(p) + p.n * p.xbar ** 2, 6);
export const ssrOf = (p: Params) => round(p.s ** 2 * (p.n - 2), 6);
const target = (p: Params) => round(p.s / p.rootSxx, 4);

function candidates(p: Params): Distractor[] {
  return [
    { value: round(p.s ** 2 / sxxOf(p), 4), mistakeCode: 'VAR_NOT_SE' },
    { value: round(Math.sqrt(ssrOf(p) / p.n) / p.rootSxx, 4), mistakeCode: 'DF_N' },
    { value: round(p.s / Math.sqrt(sumSquaresOf(p)), 4), mistakeCode: 'UNCENTRED_SXX' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), FOUR_DP.tolerance, FOUR_DP.relTolerance);

/** EM02, difficulty 2: SE(b₁) = s/√Σ(x − x̄)² in simple regression, from SSR, n, x̄ and Σx². */
export const olsSlopeStandardError: Generator<Params> = {
  id: 'ols-slope-standard-error',
  title: 'Standard error of a regression slope',
  topicId: 'EM02',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['wages', 'demand', 'consumption'] as const);
      const r = RECIPES[context];
      const p: Params = {
        context,
        n: rng.int(r.ns[0], r.ns[1]),
        xbar: rng.pick(r.xbars),
        rootSxx: rng.pick(r.roots),
        s: rng.pick(r.sds),
      };
      // A realistic spread of x for this setting.
      const sdX = p.rootSxx / Math.sqrt(p.n);
      if (sdX < r.spread[0] || sdX > r.spread[1]) continue;
      // The standard error has at most 4 decimals and is not tiny, so every step is exact.
      const se = p.s / p.rootSxx;
      if (Math.abs(se * 1e4 - Math.round(se * 1e4)) > 1e-6) continue;
      if (se < 0.01) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem(p) {
    return `An OLS regression of ${RECIPES[p.context].text(p.n)} has residual sum of squares $\\text{SSR} = ${num(ssrOf(p), 4)}$. The $x$ values have mean $\\bar x = ${num(p.xbar)}$ and $\\sum x^2 = ${num(sumSquaresOf(p), 4)}$. Under the classical assumptions, find the standard error of the slope, $\\operatorname{SE}(b_1)$. Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 4, ...FOUR_DP }),

  steps(p) {
    const s2 = round(p.s ** 2, 6);
    return [
      {
        text: 'Measure the spread of x around its mean.',
        latex: `\\sum (x - \\bar x)^2 = \\sum x^2 - n\\bar x^2 = ${num(sumSquaresOf(p), 4)} - ${p.n} \\times ${num(p.xbar)}^2 = ${num(sxxOf(p))}`,
        why: 'The precision of the slope depends on how far the x values spread around their own mean, not around zero, so the raw Σx² must be centred first.',
        result: sxxOf(p),
      },
      {
        text: 'Estimate the error variance from the residuals.',
        latex: `s^2 = \\dfrac{\\text{SSR}}{n - 2} = \\dfrac{${num(ssrOf(p), 4)}}{${p.n - 2}} = ${num(s2, 4)}, \\qquad s = ${num(p.s, 4)}`,
        why: 'σ² is unknown. The intercept and the slope were both estimated, so k = 2 and s² = SSR/(n − 2) is the unbiased estimate of σ².',
        result: s2,
      },
      {
        text: 'Take the square root of the estimated variance of b₁.',
        latex: `\\operatorname{SE}(b_1) = \\sqrt{\\dfrac{s^2}{\\sum (x - \\bar x)^2}} = \\dfrac{${num(p.s, 4)}}{\\sqrt{${num(sxxOf(p))}}} = \\dfrac{${num(p.s, 4)}}{${p.rootSxx}} = ${num(target(p), 4)}`,
        why: 'Var(b₁ | X) = σ²/Σ(x − x̄)² under homoskedasticity; replacing σ² by s² and taking the square root gives the standard error, in the same units as b₁.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
