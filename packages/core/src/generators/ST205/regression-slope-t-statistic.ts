import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { tFor } from '../ST203/critical-values';
import { CONTEXTS, type Context, UNIT, VARIABLES } from './contexts';

interface Params {
  context: Context;
  n: number;
  /** The least-squares slope b₁. */
  slope: number;
  /** √Σ(x − x̄)², a whole number, so the standard error has a short decimal. */
  rootSxx: number;
  /** The residual standard deviation s = √(SSR/(n − 2)). */
  s: number;
}

/** The statistic is asked to 2 decimals; the inputs make the standard error exact. */
const STAT = { tolerance: 0.01, relTolerance: 0 } as const;

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, k) => round(from + k * step, 6));

interface Recipe {
  slopes: number[];
  roots: number[];
  sds: number[];
}

const RECIPES: Readonly<Record<Context, Recipe>> = {
  demand: { slopes: range(-15, -2), roots: [4, 5, 8, 10, 20], sds: range(2, 30) },
  consumption: {
    slopes: range(0.55, 0.95, 0.05),
    roots: [50, 80, 100, 125, 200, 250],
    sds: range(2, 20),
  },
  wages: {
    slopes: [0.5, 0.75, 1, 1.25, 1.5, 2],
    roots: [5, 8, 10, 20, 25],
    sds: range(1.5, 8, 0.5),
  },
  okun: {
    slopes: [-0.3, -0.35, -0.4, -0.45, -0.5],
    roots: [4, 5, 8, 10],
    sds: range(0.3, 1.5, 0.1),
  },
};

export const sxxOf = (p: Params) => p.rootSxx ** 2;
export const ssrOf = (p: Params) => round(p.s ** 2 * (p.n - 2), 6);
export const seOf = (p: Params) => round(p.s / p.rootSxx, 8);
const target = (p: Params) => round(p.slope / seOf(p), 2);

function wrongAnswers(p: Params): Distractor[] {
  const ssr = ssrOf(p);
  const withDivisor = (d: number) => round(p.slope / (Math.sqrt(ssr / d) / p.rootSxx), 2);
  return cleanDistractors(
    target(p),
    [
      { value: withDivisor(p.n), mistakeCode: 'DF_N' },
      { value: withDivisor(p.n - 1), mistakeCode: 'DF_N_MINUS_1' },
      { value: round(p.slope / (p.s ** 2 / sxxOf(p)), 2), mistakeCode: 'VAR_NOT_SE' },
    ],
    STAT.tolerance,
    STAT.relTolerance,
  );
}

/** ST205, difficulty 3: the t statistic b₁/SE(b₁) for H₀: β₁ = 0, with SE(b₁) = s/√Σ(x − x̄)² and s² = SSR/(n − 2). */
export const regressionSlopeTStatistic: Generator<Params> = {
  id: 'regression-slope-t-statistic',
  title: 't statistic for a regression slope',
  topicId: 'ST205',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(CONTEXTS);
      const r = RECIPES[context];
      const p: Params = {
        context,
        n: rng.int(12, 32),
        slope: rng.pick(r.slopes),
        rootSxx: rng.pick(r.roots),
        s: rng.pick(r.sds),
      };
      // The standard error has at most 4 decimals, so every step is exact.
      const se = p.s / p.rootSxx;
      if (Math.abs(se * 1e4 - Math.round(se * 1e4)) > 1e-6) continue;
      const t = Math.abs(p.slope / se);
      if (t < 1.25 || t > 7.95) continue;
      // A clear decision at 5 %: |t| is not within rounding of the critical value.
      if (Math.abs(t - tFor(p.n - 2, 95)) < 0.025) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    return `Data on ${VARIABLES[p.context]} for ${p.n} ${UNIT[p.context]} give the least-squares slope $b_1 = ${num(p.slope, 4)}$, with $\\sum (x - \\bar x)^2 = ${num(sxxOf(p), 4)}$ and sum of squared residuals $\\text{SSR} = ${num(ssrOf(p), 4)}$. Calculate the $t$ statistic for testing $H_0: \\beta_1 = 0$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...STAT }),

  steps(p) {
    const df = p.n - 2;
    const s2 = round(p.s ** 2, 6);
    const crit = tFor(df, 95);
    const t = target(p);
    return [
      {
        text: 'Estimate the variance of the errors from the residuals.',
        latex: `s^2 = \\dfrac{\\text{SSR}}{n - 2} = \\dfrac{${num(ssrOf(p), 4)}}{${df}} = ${num(s2, 4)}, \\qquad s = ${num(p.s, 4)}`,
        why: 'Two numbers, b₀ and b₁, were estimated from the data, so only n − 2 residuals are free to vary; dividing by n − 2 makes s² an unbiased estimate of the error variance.',
        result: s2,
      },
      {
        text: 'Find the standard error of the slope.',
        latex: `\\operatorname{SE}(b_1) = \\dfrac{s}{\\sqrt{\\sum (x - \\bar x)^2}} = \\dfrac{${num(p.s, 4)}}{\\sqrt{${num(sxxOf(p), 4)}}} = \\dfrac{${num(p.s, 4)}}{${p.rootSxx}} = ${num(seOf(p), 4)}`,
        why: 'The slope is estimated more precisely when the errors are small (small s) and when the x values are widely spread (large Σ(x − x̄)²).',
        result: seOf(p),
      },
      {
        text: 'Divide the slope by its standard error.',
        latex: `t = \\dfrac{b_1 - 0}{\\operatorname{SE}(b_1)} = \\dfrac{${num(p.slope, 4)}}{${num(seOf(p), 4)}} = ${num(t)}`,
        why: `If β₁ = 0 this statistic follows a t distribution with n − 2 = ${df} degrees of freedom. The 5 % two-sided critical value is ${num(crit, 3)}, so |t| = ${num(Math.abs(t))} ${Math.abs(p.slope / seOf(p)) >= crit ? 'rejects' : 'does not reject'} H₀ at the 5 % level.`,
        result: t,
      },
    ];
  },

  distractors: wrongAnswers,
};
