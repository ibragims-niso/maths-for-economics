import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals } from '../ST105/contexts';
import { tableCdf } from '../ST105/normal';

/** from, from + step, …, to (rounded to remove floating-point noise). */
const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => round(from + i * step, 4));

/**
 * Populations that are usually skewed or of unknown shape, so the sample mean is only
 * approximately normal (central limit theorem, n ≥ 36). `decimals` is how thresholds are written.
 */
export const MEAN_CONTEXTS = {
  food: {
    setup: (m: string, s: string, n: number) =>
      `Weekly spending on food by households in a city has mean $\\mu = ${m}$ and standard deviation $\\sigma = ${s}$; its distribution is skewed to the right. A survey records the spending of $n = ${n}$ randomly chosen households.`,
    above: (c: string) =>
      `What is the probability that the sample's average weekly spending $\\bar X$ is more than $${c}$?`,
    below: (c: string) =>
      `What is the probability that the sample's average weekly spending $\\bar X$ is less than $${c}$?`,
    means: range(80, 200, 5),
    sds: range(30, 100, 1),
    ns: [36, 49, 64, 81, 100, 144],
    decimals: 1,
  },
  sales: {
    setup: (m: string, s: string, n: number) =>
      `A shop's daily sales have mean $\\mu = ${m}$ and standard deviation $\\sigma = ${s}$, with a few very busy days pulling the distribution to the right. The manager looks at the average $\\bar X$ over $n = ${n}$ days, treating the days as independent.`,
    above: (c: string) =>
      `What is the probability that the average daily sales over these days are more than $${c}$?`,
    below: (c: string) =>
      `What is the probability that the average daily sales over these days are less than $${c}$?`,
    means: range(1500, 4000, 100),
    sds: range(300, 1200, 50),
    ns: [36, 49, 64, 100],
    decimals: 0,
  },
  packets: {
    setup: (m: string, s: string, n: number) =>
      `A machine fills coffee packets with mean weight $\\mu = ${m}$ grams and standard deviation $\\sigma = ${s}$ grams. A quality inspector weighs a random sample of $n = ${n}$ packets and works out their mean weight $\\bar X$.`,
    above: (c: string) =>
      `What is the probability that the sample mean weight is more than $${c}$ grams?`,
    below: (c: string) =>
      `What is the probability that the sample mean weight is less than $${c}$ grams, which would make the inspector stop the machine?`,
    means: [250, 500, 1000],
    sds: range(1.2, 6, 0.6),
    ns: [36, 49, 64, 100, 144],
    decimals: 2,
  },
  wages: {
    setup: (m: string, s: string, n: number) =>
      `Hourly wages in a sector have mean $\\mu = ${m}$ and standard deviation $\\sigma = ${s}$; a few high earners make the distribution skewed. A labour survey records the wages of $n = ${n}$ randomly chosen workers.`,
    above: (c: string) =>
      `What is the probability that the average hourly wage $\\bar X$ in the sample is above $${c}$?`,
    below: (c: string) =>
      `What is the probability that the average hourly wage $\\bar X$ in the sample is below $${c}$?`,
    means: range(9, 25, 0.5),
    sds: range(3, 12, 0.5),
    ns: [36, 64, 100, 144, 225, 400],
    decimals: 2,
  },
} as const;

type Context = keyof typeof MEAN_CONTEXTS;

interface Params {
  context: Context;
  mean: number;
  sd: number;
  /** Sample size, a perfect square of at least 36. */
  n: number;
  /** The threshold c for the sample mean. */
  threshold: number;
  /** true: P(X̄ > c); false: P(X̄ < c). */
  above: boolean;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const standardError = (p: Params) => p.sd / Math.sqrt(p.n);
const zOf = (p: Params) => round((p.threshold - p.mean) / standardError(p), 2);

/** The probability a student gets from a table when standardising with the spread `s`. */
function probability(p: Params, s: number): number {
  const below = tableCdf((p.threshold - p.mean) / s);
  return p.above ? round(1 - below, 4) : below;
}

function wrongAnswers(p: Params): Distractor[] {
  const answer = probability(p, standardError(p));
  return cleanDistractors(
    answer,
    [
      { value: probability(p, p.sd), mistakeCode: 'SD_NOT_SE' },
      { value: probability(p, p.sd / p.n), mistakeCode: 'DIVIDED_BY_N' },
      { value: round(1 - answer, 4), mistakeCode: 'WRONG_TAIL' },
    ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** ST202, difficulty 1: P(X̄ > c) or P(X̄ < c) for a sample mean, by the central limit theorem. */
export const sampleMeanTailProbability: Generator<Params> = {
  id: 'sample-mean-tail-probability',
  title: 'Probability for a sample mean',
  topicId: 'ST202',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(MEAN_CONTEXTS) as Context[]);
      const c = MEAN_CONTEXTS[context];
      const mean = rng.pick(c.means);
      const sd = rng.pick(c.sds);
      const n = rng.pick(c.ns);
      if (sd >= mean) continue;
      const se = sd / Math.sqrt(n);
      if (!hasDecimals(se, 2)) continue;
      // z on the 0.01 grid of a normal table, so c = μ + z·SE.
      const k = rng.int(-250, 250);
      if (Math.abs(k) < 20) continue;
      const threshold = round(mean + (k * se) / 100, 6);
      if (!hasDecimals(threshold, c.decimals) || threshold <= 0) continue;
      const p: Params = { context, mean, sd, n, threshold, above: rng.int(0, 1) === 1 };
      const value = probability(p, se);
      if (value < 0.005 || value > 0.995) continue;
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = MEAN_CONTEXTS[p.context];
    const t = num(p.threshold, c.decimals);
    const ask = p.above ? c.above(t) : c.below(t);
    return `${c.setup(num(p.mean), num(p.sd), p.n)} ${ask} Use the central limit theorem and give your answer to 4 decimal places.`;
  },

  answer: (p) => ({
    kind: 'numeric',
    value: probability(p, standardError(p)),
    decimals: 4,
    ...PROB,
  }),

  steps(p) {
    const se = standardError(p);
    const z = zOf(p);
    const answer = probability(p, se);
    const t = num(p.threshold, MEAN_CONTEXTS[p.context].decimals);
    return [
      {
        text: 'Find the mean of the sample mean.',
        latex: `E[\\bar X] = \\mu = ${num(p.mean)}`,
        why: 'Each observation has mean μ, so their average has mean μ too: the sample mean is centred on the population mean.',
        result: p.mean,
      },
      {
        text: 'Find the standard error.',
        latex: `\\operatorname{SE}(\\bar X) = \\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{${num(p.sd)}}{\\sqrt{${p.n}}} = \\dfrac{${num(p.sd)}}{${Math.sqrt(p.n)}} = ${num(se)}`,
        why: 'Var(X̄) = σ²/n because the n independent variances add and the sum is divided by n; its square root σ/√n is the spread of the sample mean.',
        result: se,
      },
      {
        text: `Standardise ${t}.`,
        latex: `z = \\dfrac{${t} - ${num(p.mean)}}{${num(se)}} = ${num(z)}`,
        why: `With n = ${p.n} the central limit theorem makes X̄ approximately N(μ, σ²/n) whatever the shape of the population, so (X̄ − μ)/SE is approximately standard normal.`,
        result: z,
      },
      p.above
        ? {
            text: 'Take the area to the right of z.',
            latex: `P(\\bar X > ${t}) \\approx 1 - \\Phi(${num(z)}) = 1 - ${num(tableCdf(z), 4)} = ${num(answer, 4)}`,
            why: 'The table gives the area to the left of z; the area to the right is 1 minus it.',
            result: answer,
          }
        : {
            text: 'Read the area to the left of z.',
            latex: `P(\\bar X < ${t}) \\approx \\Phi(${num(z)}) = ${num(answer, 4)}`,
            why:
              z < 0
                ? 'Φ(z) is the area to the left of z; for negative z use Φ(−z) = 1 − Φ(z) if your table only has positive values.'
                : 'Φ(z) is the area to the left of z, which is the probability of a sample mean below the threshold.',
            result: answer,
          },
    ];
  },

  distractors: wrongAnswers,
};
