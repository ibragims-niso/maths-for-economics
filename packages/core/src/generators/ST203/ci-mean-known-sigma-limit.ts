import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals } from '../ST105/contexts';
import { LEVELS, type Level, oneTailZ, zFor } from './critical-values';

/** from, from + step, …, to (rounded to remove floating-point noise). */
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 4));

/**
 * Surveys of a population mean where σ is known from earlier, much larger surveys.
 * `means` are sample means in hundredths (drawn as integers, then divided by 100).
 */
const CONTEXTS = {
  income: {
    setup: (n: number, xbar: string) =>
      `A survey of $n = ${n}$ randomly chosen households in a region finds an average monthly household income of $\\bar x = ${xbar}$.`,
    what: 'the mean monthly household income $\\mu$ in the region',
    sds: range(150, 900, 10),
    means: [60000, 300000, 100],
  },
  wages: {
    setup: (n: number, xbar: string) =>
      `A labour survey records the hourly wages of $n = ${n}$ randomly chosen retail workers; their average is $\\bar x = ${xbar}$.`,
    what: 'the mean hourly wage $\\mu$ of retail workers',
    sds: range(2, 10, 0.5),
    means: [800, 3000, 1],
  },
  food: {
    setup: (n: number, xbar: string) =>
      `A household budget survey of $n = ${n}$ randomly chosen households finds average weekly spending on food of $\\bar x = ${xbar}$.`,
    what: 'the mean weekly food spending $\\mu$ of all households',
    sds: range(20, 80, 1),
    means: [6000, 20000, 10],
  },
  expectations: {
    setup: (n: number, xbar: string) =>
      `In an inflation expectations survey, $n = ${n}$ randomly chosen households say what inflation (in %) they expect over the next year; the average answer is $\\bar x = ${xbar}$.`,
    what: 'the mean expected inflation $\\mu$ of all households',
    sds: range(1.5, 6, 0.1),
    means: [300, 1500, 10],
  },
} as const;

type Context = keyof typeof CONTEXTS;

/** Sample sizes with a whole-number square root, large enough for the central limit theorem. */
const SIZES = [36, 49, 64, 81, 100, 144, 196, 225, 256, 400, 625, 900];

interface Params {
  context: Context;
  /** Sample mean x̄. */
  mean: number;
  /** Known population standard deviation σ. */
  sd: number;
  n: number;
  level: Level;
  /** true: ask for the upper limit; false: the lower limit. */
  upper: boolean;
  /** true: the stem gives the variance σ² instead of σ. */
  givenVariance: boolean;
}

/** Limits to 2 decimal places; every input is exact, so only the final rounding matters. */
const LIMIT = { tolerance: 0.01, relTolerance: 0 } as const;

const standardError = (p: Params) => p.sd / Math.sqrt(p.n);
const marginOf = (p: Params) => zFor(p.level) * standardError(p);
/** x̄ ± (the half-width a student computes). */
const limitWith = (p: Params, halfWidth: number) =>
  round(p.upper ? p.mean + halfWidth : p.mean - halfWidth, 2);

function wrongAnswers(p: Params): Distractor[] {
  const z = zFor(p.level);
  const candidates: Distractor[] = [
    { value: limitWith(p, z * p.sd), mistakeCode: 'FORGOT_ROOT_N' },
    { value: limitWith(p, oneTailZ(p.level) * standardError(p)), mistakeCode: 'ONE_TAIL_Z' },
    { value: limitWith(p, (z * p.sd) / p.n), mistakeCode: 'DIVIDED_BY_N' },
  ];
  if (p.givenVariance) {
    candidates.push({
      value: limitWith(p, (z * p.sd ** 2) / Math.sqrt(p.n)),
      mistakeCode: 'VARIANCE_NOT_SD',
    });
  }
  return cleanDistractors(
    limitWith(p, marginOf(p)),
    candidates,
    LIMIT.tolerance,
    LIMIT.relTolerance,
  );
}

/** ST203, difficulty 1: the lower or upper limit of a z confidence interval for a mean, σ known. */
export const ciMeanKnownSigmaLimit: Generator<Params> = {
  id: 'ci-mean-known-sigma-limit',
  title: 'Confidence interval for a mean',
  topicId: 'ST203',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const c = CONTEXTS[context];
      const [lo, hi, step] = c.means;
      const mean = round((step * rng.int(lo / step, hi / step)) / 100, 2);
      const sd = rng.pick(c.sds);
      const n = rng.pick(SIZES);
      if (!hasDecimals(sd / Math.sqrt(n), 2)) continue;
      const p: Params = {
        context,
        mean,
        sd,
        n,
        level: rng.pick(LEVELS),
        upper: rng.int(0, 1) === 1,
        givenVariance: hasDecimals(sd ** 2, 2) && rng.int(0, 3) === 0,
      };
      // A sensible interval: clearly positive and not wider than the mean itself.
      if (2 * marginOf(p) > p.mean) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    const spread = p.givenVariance
      ? `the population variance is known from earlier surveys to be $\\sigma^2 = ${num(p.sd ** 2)}$`
      : `the population standard deviation is known from earlier surveys to be $\\sigma = ${num(p.sd)}$`;
    const side = p.upper ? 'upper' : 'lower';
    return `${c.setup(p.n, num(p.mean))} Suppose ${spread}. Find the ${side} limit of a $${p.level}\\%$ confidence interval for ${c.what}. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: limitWith(p, marginOf(p)), decimals: 2, ...LIMIT }),

  steps(p) {
    const se = standardError(p);
    const z = zFor(p.level);
    const margin = marginOf(p);
    const answer = limitWith(p, margin);
    const sign = p.upper ? '+' : '-';
    const steps = [
      {
        text: 'Find the standard error of the sample mean.',
        latex: `\\operatorname{SE} = \\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{${num(p.sd)}}{\\sqrt{${p.n}}} = \\dfrac{${num(p.sd)}}{${Math.sqrt(p.n)}} = ${num(se)}`,
        why: 'The interval is built from the spread of X̄, which is σ/√n, not from the spread σ of single observations.',
        result: se,
      },
      {
        text: `Find the z value for ${p.level} % confidence.`,
        latex: `P(|Z| < ${num(z, 3)}) = ${num(p.level / 100)} \\;\\Rightarrow\\; z = ${num(z, 3)}`,
        why: `A ${p.level} % interval leaves ${num((100 - p.level) / 2, 1)} % in each tail of the normal curve, so the area to the left of z is ${num((100 + p.level) / 200, 3)}.`,
        result: z,
      },
      {
        text: 'Multiply to get the margin of error.',
        latex: `E = z \\cdot \\operatorname{SE} = ${num(z, 3)} \\times ${num(se)} = ${num(margin, 4)}`,
        why: `In ${p.level} % of samples X̄ lands within z standard errors of μ, so in those same samples μ is within this distance of X̄.`,
        result: round(margin, 4),
      },
      {
        text: `${p.upper ? 'Add the margin to' : 'Subtract the margin from'} the sample mean.`,
        latex: `\\bar x ${sign} E = ${num(p.mean)} ${sign} ${num(margin, 4)} = ${num(answer)}`,
        why: 'The interval is x̄ − E to x̄ + E, centred on the sample mean.',
        result: answer,
      },
    ];
    if (p.givenVariance) {
      steps.unshift({
        text: 'Take the square root of the variance.',
        latex: `\\sigma = \\sqrt{${num(p.sd ** 2)}} = ${num(p.sd)}`,
        why: 'The interval uses the standard deviation σ; the variance σ² is in squared units.',
        result: p.sd,
      });
    }
    return steps;
  },

  distractors: wrongAnswers,
};
