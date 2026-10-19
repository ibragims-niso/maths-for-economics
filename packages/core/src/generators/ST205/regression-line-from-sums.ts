import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { CONTEXTS, type Context, slopeMeaning, UNIT, VARIABLES } from './contexts';

/** What the question asks for. */
type Kind = 'intercept' | 'prediction' | 'r-squared';

interface Params {
  context: Context;
  kind: Kind;
  n: number;
  xbar: number;
  ybar: number;
  /** The least-squares slope; Sxy = slope × Sxx exactly. */
  slope: number;
  /** Σ(x − x̄)². */
  sxx: number;
  /** Σ(x − x̄)(y − ȳ). */
  sxy: number;
  /** Σ(y − ȳ)², the total sum of squares (used for R²). */
  syy: number;
  /** The new x for a prediction. */
  x0: number;
}

/** Intercepts and predictions are exact to 4 decimals and asked to 2. */
const LINE = { tolerance: 0.01, relTolerance: 0 } as const;
/** R² is asked to 3 decimals. */
const SHARE = { tolerance: 0.001, relTolerance: 0 } as const;

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, k) => round(from + k * step, 6));

interface Draw {
  n: number;
  xbar: number;
  ybar: number;
  slope: number;
  sxx: number;
  x0: number;
  /** Decimal places of Σ(y − ȳ)². */
  syyDecimals: number;
}

const DRAWS: Readonly<Record<Context, (rng: Rng) => Draw>> = {
  demand(rng) {
    const n = rng.int(20, 60);
    const xbar = rng.pick(range(3, 12, 0.5));
    return {
      n,
      xbar,
      ybar: rng.int(60, 300),
      slope: rng.int(-15, -2),
      sxx: rng.int(n, 4 * n),
      x0: round(xbar + rng.pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2]), 6),
      syyDecimals: 0,
    };
  },
  consumption(rng) {
    const n = rng.int(20, 80);
    const xbar = rng.int(20, 60);
    const slope = rng.pick(range(0.55, 0.95, 0.05));
    return {
      n,
      xbar,
      ybar: round(rng.int(3, 15) + slope * xbar, 6),
      slope,
      sxx: n * rng.int(25, 400),
      x0: xbar + rng.pick([-20, -15, -10, -5, 5, 10, 15, 20]),
      syyDecimals: 0,
    };
  },
  wages(rng) {
    const n = rng.int(30, 200);
    const xbar = rng.pick(range(11, 14, 0.5));
    return {
      n,
      xbar,
      ybar: rng.pick(range(8, 25, 0.5)),
      slope: rng.pick([0.5, 0.75, 1, 1.25, 1.5, 2]),
      sxx: n * rng.int(4, 9),
      x0: Math.round(xbar) + rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]),
      syyDecimals: 0,
    };
  },
  okun(rng) {
    const n = rng.int(20, 40);
    const xbar = rng.pick(range(1.5, 3.5, 0.1));
    const slope = rng.pick([-0.3, -0.35, -0.4, -0.45, -0.5]);
    return {
      n,
      xbar,
      ybar: round(rng.pick(range(0.8, 1.6, 0.1)) + slope * xbar, 6),
      slope,
      sxx: round((n * rng.int(10, 60)) / 10, 1),
      x0: rng.pick(range(-1, 5, 0.5)),
      syyDecimals: 1,
    };
  },
};

export const interceptOf = (p: Params) => round(p.ybar - p.slope * p.xbar, 6);
export const predictionOf = (p: Params) => round(interceptOf(p) + p.slope * p.x0, 6);
/** The explained sum of squares b₁·Sxy. */
const explainedOf = (p: Params) => round(p.slope * p.sxy, 6);
const residualSsOf = (p: Params) => round(p.syy - explainedOf(p), 6);

function target(p: Params): number {
  if (p.kind === 'intercept') return round(interceptOf(p), 2);
  if (p.kind === 'prediction') return round(predictionOf(p), 2);
  return round(explainedOf(p) / p.syy, 3);
}

const tolerances = (p: Params) => (p.kind === 'r-squared' ? SHARE : LINE);

function wrongAnswers(p: Params): Distractor[] {
  const t = tolerances(p);
  const flipped = p.ybar + p.slope * p.xbar;
  const candidates: Distractor[] =
    p.kind === 'intercept'
      ? [
          { value: round(flipped, 2), mistakeCode: 'INTERCEPT_SIGN' },
          {
            value: round(p.ybar - (p.sxx / p.sxy) * p.xbar, 2),
            mistakeCode: 'SLOPE_UPSIDE_DOWN',
          },
        ]
      : p.kind === 'prediction'
        ? [
            { value: round(p.ybar, 2), mistakeCode: 'USED_MEAN_Y' },
            { value: round(p.slope * p.x0, 2), mistakeCode: 'NO_INTERCEPT' },
            { value: round(flipped + p.slope * p.x0, 2), mistakeCode: 'INTERCEPT_SIGN' },
          ]
        : [
            { value: round(residualSsOf(p) / p.syy, 3), mistakeCode: 'RESIDUAL_SHARE' },
            {
              value: round(p.sxy / Math.sqrt(p.sxx * p.syy), 3),
              mistakeCode: 'R_NOT_R_SQUARED',
            },
          ];
  return cleanDistractors(target(p), candidates, t.tolerance, t.relTolerance);
}

const sumsLatex = (p: Params) =>
  `$\\sum (x - \\bar x)(y - \\bar y) = ${num(p.sxy, 4)}$ and $\\sum (x - \\bar x)^2 = ${num(p.sxx, 4)}$`;

/** ST205, difficulty 1: the intercept b₀, a prediction ŷ, or R² of a least-squares line from summary sums. */
export const regressionLineFromSums: Generator<Params> = {
  id: 'regression-line-from-sums',
  title: 'Regression line from summary sums',
  topicId: 'ST205',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(CONTEXTS);
      const kind = rng.pick(['intercept', 'prediction', 'r-squared'] as const);
      const d = DRAWS[context](rng);
      const sxy = round(d.slope * d.sxx, 6);
      const explained = d.slope * sxy;
      const syy = round(explained / (rng.int(30, 95) / 100), d.syyDecimals);
      const p: Params = { context, kind, ...d, sxy, syy };
      if (p.x0 === p.xbar) continue;
      // A prediction inside the data's usual range, never far outside it (no extrapolation).
      if (Math.abs(p.x0 - p.xbar) > 2 * Math.sqrt(p.sxx / (p.n - 1))) continue;
      // Sales, spending and wages are positive (a wage line may still cross 0 at x = 0).
      if (context !== 'okun' && predictionOf(p) <= 0) continue;
      if (context === 'consumption' && interceptOf(p) <= 0) continue;
      const r2 = explained / syy;
      if (r2 < 0.26 || r2 > 0.96) continue;
      if (wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const lead = `Data on ${VARIABLES[p.context]} for ${p.n} ${UNIT[p.context]} give`;
    if (p.kind === 'r-squared') {
      return `${lead} ${sumsLatex(p)}, and $\\sum (y - \\bar y)^2 = ${num(p.syy, 4)}$. Find the coefficient of determination $R^2$ of the least-squares regression of $y$ on $x$. Give your answer to 3 decimal places.`;
    }
    const means = `$\\bar x = ${num(p.xbar, 4)}$, $\\bar y = ${num(p.ybar, 4)}$, ${sumsLatex(p)}.`;
    if (p.kind === 'intercept') {
      return `${lead} ${means} Find the intercept $b_0$ of the least-squares line $\\hat y = b_0 + b_1 x$. Give your answer to 2 decimal places.`;
    }
    return `${lead} ${means} Use the least-squares line $\\hat y = b_0 + b_1 x$ to predict $y$ when $x = ${num(p.x0, 4)}$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({
    kind: 'numeric',
    value: target(p),
    decimals: p.kind === 'r-squared' ? 3 : 2,
    ...tolerances(p),
  }),

  steps(p) {
    const slope: Step = {
      text: 'Find the slope from the two sums.',
      latex: `b_1 = \\dfrac{\\sum (x - \\bar x)(y - \\bar y)}{\\sum (x - \\bar x)^2} = \\dfrac{${num(p.sxy, 4)}}{${num(p.sxx, 4)}} = ${num(p.slope, 4)}`,
      why: `Least squares gives the slope as the joint movement of x and y divided by the spread of x; here ${slopeMeaning(p.context, p.slope)}.`,
      result: p.slope,
    };
    if (p.kind === 'r-squared') {
      return [
        slope,
        {
          text: 'Find the part of the variation in y that the line explains.',
          latex: `\\text{SSE} = b_1 \\sum (x - \\bar x)(y - \\bar y) = ${num(p.slope, 4)} \\times ${p.sxy < 0 ? `(${num(p.sxy, 4)})` : num(p.sxy, 4)} = ${num(explainedOf(p), 4)}`,
          why: 'The fitted values are ŷ − ȳ = b₁(x − x̄), so their squares add up to b₁²Σ(x − x̄)² = b₁Σ(x − x̄)(y − ȳ).',
          result: explainedOf(p),
        },
        {
          text: 'The rest is the sum of squared residuals.',
          latex: `\\text{SSR} = \\text{SST} - \\text{SSE} = ${num(p.syy, 4)} - ${num(explainedOf(p), 4)} = ${num(residualSsOf(p), 4)}`,
          why: 'The total variation SST = Σ(y − ȳ)² splits exactly into the explained part SSE and the unexplained part SSR.',
          result: residualSsOf(p),
        },
        {
          text: 'Take the share of the variation that is explained.',
          latex: `R^2 = 1 - \\dfrac{\\text{SSR}}{\\text{SST}} = 1 - \\dfrac{${num(residualSsOf(p), 4)}}{${num(p.syy, 4)}} = ${num(target(p), 3)}`,
          why: `About ${num(target(p) * 100, 1)} % of the variation of y around its mean goes with the variation of x; the rest is left in the residuals.`,
          result: target(p),
        },
      ];
    }
    const b0 = interceptOf(p);
    const intercept: Step = {
      text: 'The line passes through the point of means, which gives the intercept.',
      latex: `b_0 = \\bar y - b_1 \\bar x = ${num(p.ybar, 4)} - ${p.slope < 0 ? `(${num(p.slope, 4)})` : num(p.slope, 4)} \\times ${num(p.xbar, 4)} = ${num(b0, 4)}`,
      why: 'Least squares makes the residuals add up to zero, which forces ȳ = b₀ + b₁x̄; solve this for b₀.',
      result: p.kind === 'intercept' ? target(p) : b0,
    };
    if (p.kind === 'intercept') return [slope, intercept];
    return [
      slope,
      intercept,
      {
        text: 'Put the new x into the fitted line.',
        latex: `\\hat y = b_0 + b_1 x = ${num(b0, 4)} + ${p.slope < 0 ? `(${num(p.slope, 4)})` : num(p.slope, 4)} \\times ${p.x0 < 0 ? `(${num(p.x0, 4)})` : num(p.x0, 4)} = ${num(target(p))}`,
        why: `The prediction is the point on the line above x = ${num(p.x0, 4)}; this x is within two standard deviations of x̄, where most of the data lie, so it is not an extrapolation.`,
        result: target(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
