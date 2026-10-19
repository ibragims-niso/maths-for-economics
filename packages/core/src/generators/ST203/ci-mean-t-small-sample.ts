import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { LEVELS, type Level, tFor, zFor } from './critical-values';

/**
 * Small samples from a roughly normal population with unknown σ. Each value is
 * centre + k·step with k drawn from −spread … spread; `decimals` is how values are written.
 */
export const T_CONTEXTS = {
  inflation: {
    setup: (n: number, list: string) =>
      `${n} professional forecasters give their expected inflation rate for next year, in %: $${list}$.`,
    what: 'the mean expectation $\\mu$ of all professional forecasters',
    centres: [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9],
    step: 0.1,
    spread: 15,
    decimals: 1,
  },
  rent: {
    setup: (n: number, list: string) =>
      `The monthly rents of ${n} randomly chosen two-room flats in a city are $${list}$.`,
    what: 'the mean monthly rent $\\mu$ of two-room flats in the city',
    centres: [350, 400, 450, 500, 550, 600, 650, 700, 750, 800],
    step: 5,
    spread: 20,
    decimals: 0,
  },
  hours: {
    setup: (n: number, list: string) =>
      `A firm records last week's working hours of ${n} randomly chosen employees: $${list}$.`,
    what: 'the mean weekly working time $\\mu$ of all its employees',
    centres: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
    step: 1,
    spread: 8,
    decimals: 0,
  },
  coffee: {
    setup: (n: number, list: string) =>
      `A price survey records the price of a cup of coffee in ${n} randomly chosen cafés: $${list}$.`,
    what: 'the mean price $\\mu$ of a cup of coffee in the city',
    centres: [2, 2.5, 3, 3.5, 4, 4.5, 5],
    step: 0.1,
    spread: 8,
    decimals: 2,
  },
} as const;

type Context = keyof typeof T_CONTEXTS;

interface Params {
  context: Context;
  values: number[];
  level: Level;
  /** true: ask for the upper limit; false: the lower limit. */
  upper: boolean;
}

/** Limits to 2 decimal places. */
const LIMIT = { tolerance: 0.01, relTolerance: 0 } as const;

export const meanOf = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
/** Σ(x − x̄)², the sum of squared deviations from the sample mean. */
export const sumOfSquares = (xs: readonly number[]) => {
  const m = meanOf(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0);
};
/** The sample standard deviation s, with divisor n − 1. */
export const sampleSd = (xs: readonly number[]) => Math.sqrt(sumOfSquares(xs) / (xs.length - 1));

/** x̄ ± critical value × spread/√n, rounded to 2 decimals. */
function limitWith(p: Params, critical: number, spread: number): number {
  const half = (critical * spread) / Math.sqrt(p.values.length);
  const m = meanOf(p.values);
  return round(p.upper ? m + half : m - half, 2);
}

const answerOf = (p: Params) =>
  limitWith(p, tFor(p.values.length - 1, p.level), sampleSd(p.values));

function wrongAnswers(p: Params): Distractor[] {
  const n = p.values.length;
  const s = sampleSd(p.values);
  const t = tFor(n - 1, p.level);
  return cleanDistractors(
    answerOf(p),
    [
      { value: limitWith(p, zFor(p.level), s), mistakeCode: 'USED_Z_NOT_T' },
      {
        value: limitWith(p, t, Math.sqrt(sumOfSquares(p.values) / n)),
        mistakeCode: 'SD_DIVISOR_N',
      },
      { value: limitWith(p, tFor(n, p.level), s), mistakeCode: 'WRONG_DF' },
    ],
    LIMIT.tolerance,
    LIMIT.relTolerance,
  );
}

/** ST203, difficulty 3: a t confidence interval limit for a mean from a small sample, σ unknown. */
export const ciMeanTSmallSample: Generator<Params> = {
  id: 'ci-mean-t-small-sample',
  title: 't interval from a small sample',
  topicId: 'ST203',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(T_CONTEXTS) as Context[]);
      const c = T_CONTEXTS[context];
      const n = rng.pick([5, 6, 7, 8]);
      const centre = rng.pick(c.centres);
      const values = Array.from({ length: n }, () =>
        round(centre + c.step * rng.int(-c.spread, c.spread), 2),
      );
      if (values.some((v) => v <= 0)) continue;
      if (new Set(values).size < 3) continue;
      const p: Params = { context, values, level: rng.pick(LEVELS), upper: rng.int(0, 1) === 1 };
      if (!p.upper && answerOf(p) <= 0) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = T_CONTEXTS[p.context];
    const n = p.values.length;
    const list = p.values.map((v) => num(v, c.decimals)).join(',\\ ');
    const side = p.upper ? 'upper' : 'lower';
    return `${c.setup(n, list)} Treat them as a random sample from a roughly normal population whose standard deviation is unknown, and find the ${side} limit of a $${p.level}\\%$ confidence interval for ${c.what}. Two-sided $${p.level}\\%$ critical values of $t$: $${num(tFor(n - 1, p.level), 3)}$ with ${n - 1} degrees of freedom and $${num(tFor(n, p.level), 3)}$ with ${n} degrees of freedom. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2, ...LIMIT }),

  steps(p) {
    const n = p.values.length;
    const m = meanOf(p.values);
    const ss = sumOfSquares(p.values);
    const s = sampleSd(p.values);
    const t = tFor(n - 1, p.level);
    const margin = (t * s) / Math.sqrt(n);
    const answer = answerOf(p);
    const sum = p.values.reduce((a, x) => a + x, 0);
    const sign = p.upper ? '+' : '-';
    return [
      {
        text: 'Find the sample mean.',
        latex: `\\bar x = \\dfrac{${num(sum)}}{${n}} = ${num(m, 4)}`,
        why: 'The sample mean is the point estimate of μ and the centre of the interval.',
        result: round(m, 4),
      },
      {
        text: 'Find the sample standard deviation, dividing by n − 1.',
        latex: `s = \\sqrt{\\dfrac{\\sum (x_i - \\bar x)^2}{n-1}} = \\sqrt{\\dfrac{${num(ss, 4)}}{${n - 1}}} = ${num(s, 4)}`,
        why: 'σ is unknown, so s estimates it. Deviations from x̄ are a little smaller than deviations from the true μ, and dividing by n − 1 instead of n corrects for that.',
        result: round(s, 4),
      },
      {
        text: `Choose t with n − 1 = ${n - 1} degrees of freedom.`,
        latex: `t_{${n - 1}} = ${num(t, 3)}`,
        why: `Replacing σ by s adds uncertainty, so the interval uses the wider t distribution with n − 1 = ${n - 1} degrees of freedom instead of z = ${num(zFor(p.level), 3)}.`,
        result: t,
      },
      {
        text: 'Find the margin of error.',
        latex: `E = t \\cdot \\dfrac{s}{\\sqrt{n}} = ${num(t, 3)} \\times \\dfrac{${num(s, 4)}}{\\sqrt{${n}}} = ${num(margin, 4)}`,
        why: 's/√n is the estimated standard error of x̄; t of them on each side give the stated confidence.',
        result: round(margin, 4),
      },
      {
        text: `${p.upper ? 'Add the margin to' : 'Subtract the margin from'} the sample mean.`,
        latex: `\\bar x ${sign} E = ${num(m, 4)} ${sign} ${num(margin, 4)} = ${num(answer)}`,
        why: 'The interval is x̄ − E to x̄ + E.',
        result: answer,
      },
    ];
  },

  distractors: wrongAnswers,
};
