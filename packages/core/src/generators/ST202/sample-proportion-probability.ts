import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { hasDecimals } from '../ST105/contexts';
import { tableCdf } from '../ST105/normal';

/**
 * Survey settings. The true proportions are ones where p(1 − p) is a perfect square
 * (0.1 → 0.3², 0.2 → 0.4², 0.36 → 0.48², 0.5 → 0.5²), so the standard error is a short decimal.
 */
export const PROPORTION_CONTEXTS = {
  unemployment: {
    setup: (p: string, n: number) =>
      `In a region the true unemployment rate is $p = ${p}$. A labour force survey interviews a random sample of $n = ${n}$ people from the region's labour force, and $\\hat p$ is the share of them who are unemployed.`,
    what: "the survey's unemployment rate",
    ps: [0.1, 0.2],
  },
  reform: {
    setup: (p: string, n: number) =>
      `A share $p = ${p}$ of voters support a pension reform. A polling firm asks a random sample of $n = ${n}$ voters, and $\\hat p$ is the share of the sample who support it.`,
    what: 'the share of supporters in the poll',
    ps: [0.36, 0.5, 0.64],
  },
  customers: {
    setup: (p: string, n: number) =>
      `A bank knows that a share $p = ${p}$ of its customers are satisfied with its service. It surveys a random sample of $n = ${n}$ customers, and $\\hat p$ is the share of satisfied customers in the sample.`,
    what: 'the share of satisfied customers in the survey',
    ps: [0.64, 0.8, 0.9],
  },
  housing: {
    setup: (p: string, n: number) =>
      `In a country a share $p = ${p}$ of households own their home. A household survey visits a random sample of $n = ${n}$ households, and $\\hat p$ is the share of home owners in the sample.`,
    what: 'the share of home owners in the survey',
    ps: [0.36, 0.5, 0.64, 0.8],
  },
} as const;

type Context = keyof typeof PROPORTION_CONTEXTS;

/** Sample sizes with a whole-number square root. */
const SIZES = [400, 576, 625, 900, 1600, 2500, 3600, 10000];

interface Params {
  context: Context;
  /** The true population proportion. */
  p: number;
  n: number;
  /** The threshold c for p̂, with at most 3 decimals. */
  threshold: number;
  /** true: P(p̂ > c); false: P(p̂ < c). */
  above: boolean;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const standardError = (q: Params) => Math.sqrt((q.p * (1 - q.p)) / q.n);
const zOf = (q: Params) => round((q.threshold - q.p) / standardError(q), 2);

/** The probability a student gets from a table when standardising with the spread `s`. */
function probability(q: Params, s: number): number {
  const below = tableCdf((q.threshold - q.p) / s);
  return q.above ? round(1 - below, 4) : below;
}

function wrongAnswers(q: Params): Distractor[] {
  const answer = probability(q, standardError(q));
  return cleanDistractors(
    answer,
    [
      { value: probability(q, (q.p * (1 - q.p)) / q.n), mistakeCode: 'NO_SQUARE_ROOT' },
      { value: probability(q, Math.sqrt(q.p / q.n)), mistakeCode: 'FORGOT_ONE_MINUS_P' },
      { value: round(1 - answer, 4), mistakeCode: 'WRONG_TAIL' },
    ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** "0.085 (8.5 %)". */
const share = (x: number) => `${num(x, 3)}\\ (${num(x * 100, 1)}\\%)`;

/** ST202, difficulty 2: P(p̂ < c) or P(p̂ > c) for a survey proportion, by the normal approximation. */
export const sampleProportionProbability: Generator<Params> = {
  id: 'sample-proportion-probability',
  title: 'Probability for a survey proportion',
  topicId: 'ST202',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(PROPORTION_CONTEXTS) as Context[]);
      const p = rng.pick(PROPORTION_CONTEXTS[context].ps);
      const n = rng.pick(SIZES);
      const se = Math.sqrt((p * (1 - p)) / n);
      if (!hasDecimals(se, 4)) continue;
      // z on the 0.01 grid of a normal table, so c = p + z·SE.
      const k = rng.int(-250, 250);
      if (Math.abs(k) < 20) continue;
      const threshold = round(p + (k * se) / 100, 6);
      if (!hasDecimals(threshold, 3) || threshold <= 0 || threshold >= 1) continue;
      const q: Params = { context, p, n, threshold, above: rng.int(0, 1) === 1 };
      const value = probability(q, se);
      if (value < 0.005 || value > 0.995) continue;
      if (wrongAnswers(q).length < 3) continue;
      return q;
    }
  },

  stem(q) {
    const c = PROPORTION_CONTEXTS[q.context];
    const side = q.above ? 'above' : 'below';
    return `${c.setup(num(q.p), q.n)} What is the probability that ${c.what} is ${side} $${share(q.threshold)}$? Use the normal approximation and give your answer to 4 decimal places.`;
  },

  answer: (q) => ({
    kind: 'numeric',
    value: probability(q, standardError(q)),
    decimals: 4,
    ...PROB,
  }),

  steps(q) {
    const se = standardError(q);
    const z = zOf(q);
    const answer = probability(q, se);
    const t = num(q.threshold, 3);
    return [
      {
        text: 'Find the mean of the sample proportion.',
        latex: `E[\\hat p] = p = ${num(q.p)}`,
        why: `p̂ is the number of "yes" answers divided by n, and that count has mean np, so p̂ has mean p. Here np = ${num(q.n * q.p)} and n(1 − p) = ${num(q.n * (1 - q.p))} are both well above 5, so the normal approximation is good.`,
        result: q.p,
      },
      {
        text: 'Find the standard error.',
        latex: `\\operatorname{SE}(\\hat p) = \\sqrt{\\dfrac{p(1-p)}{n}} = \\sqrt{\\dfrac{${num(q.p)} \\times ${num(1 - q.p)}}{${q.n}}} = ${num(se, 4)}`,
        why: 'The count of "yes" answers is binomial with variance np(1 − p); dividing the count by n divides the variance by n², which leaves p(1 − p)/n. Take the square root to get a spread.',
        result: round(se, 4),
      },
      {
        text: `Standardise ${t}.`,
        latex: `z = \\dfrac{${t} - ${num(q.p)}}{${num(se, 4)}} = ${num(z)}`,
        why: 'A proportion is the mean of n zeros and ones, so by the central limit theorem p̂ is approximately N(p, p(1 − p)/n) and (p̂ − p)/SE is approximately standard normal.',
        result: z,
      },
      q.above
        ? {
            text: 'Take the area to the right of z.',
            latex: `P(\\hat p > ${t}) \\approx 1 - \\Phi(${num(z)}) = 1 - ${num(tableCdf(z), 4)} = ${num(answer, 4)}`,
            why: 'The table gives the area to the left of z; the area to the right is 1 minus it.',
            result: answer,
          }
        : {
            text: 'Read the area to the left of z.',
            latex: `P(\\hat p < ${t}) \\approx \\Phi(${num(z)}) = ${num(answer, 4)}`,
            why:
              z < 0
                ? 'Φ(z) is the area to the left of z; for negative z use Φ(−z) = 1 − Φ(z) if your table only has positive values.'
                : 'Φ(z) is the area to the left of z, which is the probability that the survey figure falls below the threshold.',
            result: answer,
          },
    ];
  },

  distractors: wrongAnswers,
};
