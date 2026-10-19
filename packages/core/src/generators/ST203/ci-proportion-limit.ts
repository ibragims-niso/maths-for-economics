import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals } from '../ST105/contexts';
import { LEVELS, type Level, oneTailZ, zFor } from './critical-values';

/** Surveys that estimate a population proportion; `lo`–`hi` is the range of sample shares. */
const CONTEXTS = {
  unemployment: {
    setup: (x: number, n: number) =>
      `A labour force survey interviews $n = ${num(n)}$ randomly chosen members of a region's labour force, and $${num(x)}$ of them are unemployed.`,
    what: 'the unemployment rate $p$ in the region',
    lo: 0.04,
    hi: 0.16,
  },
  poll: {
    setup: (x: number, n: number) =>
      `In an opinion poll of $n = ${num(n)}$ randomly chosen voters, $${num(x)}$ say they support a proposed pension reform.`,
    what: 'the share $p$ of all voters who support the reform',
    lo: 0.3,
    hi: 0.7,
  },
  expectations: {
    setup: (x: number, n: number) =>
      `In an inflation expectations survey of $n = ${num(n)}$ randomly chosen households, $${num(x)}$ expect prices to rise faster next year than this year.`,
    what: 'the share $p$ of all households who expect faster price rises',
    lo: 0.35,
    hi: 0.8,
  },
  hiring: {
    setup: (x: number, n: number) =>
      `A business survey asks $n = ${num(n)}$ randomly chosen firms about their plans, and $${num(x)}$ of them plan to hire more staff next quarter.`,
    what: 'the share $p$ of all firms that plan to hire',
    lo: 0.12,
    hi: 0.5,
  },
} as const;

type Context = keyof typeof CONTEXTS;

const SIZES = [400, 500, 625, 800, 1000, 1250, 1500, 2000, 2500, 3000, 4000];

interface Params {
  context: Context;
  /** Number of "yes" answers. */
  x: number;
  n: number;
  level: Level;
  /** true: ask for the upper limit; false: the lower limit. */
  upper: boolean;
}

/** Limits as proportions to 4 decimal places; rounding SE to 3–4 decimals stays inside. */
const SHARE = { tolerance: 0.0002, relTolerance: 0 } as const;

const share = (q: Params) => q.x / q.n;
const standardError = (q: Params) => Math.sqrt((share(q) * (1 - share(q))) / q.n);
const marginOf = (q: Params) => zFor(q.level) * standardError(q);
const limitWith = (q: Params, halfWidth: number) =>
  round(q.upper ? share(q) + halfWidth : share(q) - halfWidth, 4);

function wrongAnswers(q: Params): Distractor[] {
  const z = zFor(q.level);
  const p = share(q);
  return cleanDistractors(
    limitWith(q, marginOf(q)),
    [
      { value: limitWith(q, z * Math.sqrt(p / q.n)), mistakeCode: 'FORGOT_ONE_MINUS_P' },
      { value: limitWith(q, (z * p * (1 - p)) / q.n), mistakeCode: 'NO_SQUARE_ROOT' },
      { value: limitWith(q, (z * Math.sqrt(p * (1 - p))) / q.n), mistakeCode: 'N_SQUARED' },
      { value: limitWith(q, oneTailZ(q.level) * standardError(q)), mistakeCode: 'ONE_TAIL_Z' },
    ],
    SHARE.tolerance,
    SHARE.relTolerance,
  );
}

/** ST203, difficulty 2: the lower or upper limit of a confidence interval for a proportion. */
export const ciProportionLimit: Generator<Params> = {
  id: 'ci-proportion-limit',
  title: 'Confidence interval for a proportion',
  topicId: 'ST203',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const c = CONTEXTS[context];
      const n = rng.pick(SIZES);
      const x = rng.int(Math.ceil(c.lo * n), Math.floor(c.hi * n));
      const q: Params = { context, x, n, level: rng.pick(LEVELS), upper: rng.int(0, 1) === 1 };
      const p = share(q);
      // A share with at most 4 decimals, and enough "yes" and "no" answers for the normal curve.
      if (!hasDecimals(p, 4)) continue;
      if (x < 15 || n - x < 15) continue;
      if (wrongAnswers(q).length < 3) continue;
      return q;
    }
  },

  stem(q) {
    const c = CONTEXTS[q.context];
    const side = q.upper ? 'upper' : 'lower';
    return `${c.setup(q.x, q.n)} Find the ${side} limit of a $${q.level}\\%$ confidence interval for ${c.what}. Give it as a proportion to 4 decimal places.`;
  },

  answer: (q) => ({ kind: 'numeric', value: limitWith(q, marginOf(q)), decimals: 4, ...SHARE }),

  steps(q) {
    const p = share(q);
    const se = standardError(q);
    const z = zFor(q.level);
    const margin = marginOf(q);
    const answer = limitWith(q, margin);
    const sign = q.upper ? '+' : '-';
    return [
      {
        text: 'Find the sample proportion.',
        latex: `\\hat p = \\dfrac{${num(q.x)}}{${num(q.n)}} = ${num(p, 4)}`,
        why: `p̂ is the point estimate of p. There are ${num(q.x)} "yes" and ${num(q.n - q.x)} "no" answers, both at least 10, so p̂ is close to normal.`,
        result: p,
      },
      {
        text: 'Estimate the standard error.',
        latex: `\\operatorname{SE} = \\sqrt{\\dfrac{\\hat p(1-\\hat p)}{n}} = \\sqrt{\\dfrac{${num(p, 4)} \\times ${num(1 - p, 4)}}{${num(q.n)}}} = ${num(se, 5)}`,
        why: 'The standard error of a proportion is √(p(1 − p)/n); p is unknown, so the sample value p̂ stands in for it.',
        result: round(se, 5),
      },
      {
        text: 'Multiply by z to get the margin of error.',
        latex: `E = ${num(z, 3)} \\times ${num(se, 5)} = ${num(margin, 4)}`,
        why: `For ${q.level} % confidence z = ${num(z, 3)}: ${q.level} % of the area under the normal curve lies within z standard errors of the centre.`,
        result: round(margin, 4),
      },
      {
        text: `${q.upper ? 'Add the margin to' : 'Subtract the margin from'} the sample proportion.`,
        latex: `\\hat p ${sign} E = ${num(p, 4)} ${sign} ${num(margin, 4)} = ${num(answer, 4)}`,
        why: `The interval is p̂ ± E; here that is ${num(100 * (p - margin), 2)} % to ${num(100 * (p + margin), 2)} %.`,
        result: answer,
      },
    ];
  },

  distractors: wrongAnswers,
};
