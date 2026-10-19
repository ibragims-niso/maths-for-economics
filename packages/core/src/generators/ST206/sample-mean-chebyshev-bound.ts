import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  insurance: {
    setup: (n: number, mu: number, sigma: number) =>
      `An insurer sells $${num(n)}$ independent policies. The claim on one policy in a year has mean $${num(mu)}$ and standard deviation $${num(sigma)}$.`,
    average: 'the average claim per policy',
  },
  loans: {
    setup: (n: number, mu: number, sigma: number) =>
      `A bank holds $${num(n)}$ loans whose losses are independent. The loss on one loan in a year, in thousands, has mean $${num(mu)}$ and standard deviation $${num(sigma)}$.`,
    average: 'the average loss per loan',
  },
  survey: {
    setup: (n: number, mu: number, sigma: number) =>
      `A statistics office picks $${num(n)}$ households at random and independently. Monthly spending on food of one household has mean $${num(mu)}$ and standard deviation $${num(sigma)}$.`,
    average: 'the average spending in the sample',
  },
} as const;

type Context = keyof typeof CONTEXTS;
type Mode = 'outside' | 'inside';

interface Params {
  context: Context;
  /** Number of independent draws. */
  n: number;
  mu: number;
  sigma: number;
  /** The accuracy ε: how far the average may be from μ. */
  eps: number;
  /** Upper bound for P(|X̄ − μ| ≥ ε), or lower bound for P(|X̄ − μ| < ε). */
  mode: Mode;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

/** Var(X̄) = σ²/n. */
const varMean = (p: Params) => p.sigma ** 2 / p.n;
/** Chebyshev for the sample mean: P(|X̄ − μ| ≥ ε) ≤ σ²/(nε²). */
const lln = (p: Params) => varMean(p) / p.eps ** 2;
/** The bound itself for the outside, 1 minus it for the inside. */
const asked = (p: Params, b: number) => (p.mode === 'outside' ? b : 1 - b);
/** The answer; for the inside it is 1 minus the bound as rounded in the steps. */
const target = (p: Params) => round(asked(p, round(lln(p), 4)), 4);

/** σ, n and ε for each context, in sensible units. */
function draw(context: Context, rng: Rng) {
  if (context === 'insurance') {
    return {
      mu: 50 * rng.int(4, 16),
      sigma: 100 * rng.int(8, 30),
      n: rng.pick([500, 1000, 1500, 2000, 2500, 4000, 5000, 8000, 10000]),
      eps: 5 * rng.int(4, 30),
    };
  }
  if (context === 'loans') {
    return {
      mu: rng.int(4, 9),
      sigma: rng.int(5, 20),
      n: rng.pick([200, 250, 400, 500, 800, 1000, 2000, 2500]),
      eps: rng.pick([0.5, 1, 1.5, 2, 2.5, 3]),
    };
  }
  return {
    mu: 10 * rng.int(25, 60),
    sigma: 10 * rng.int(10, 40),
    n: rng.pick([100, 150, 200, 250, 300, 400, 500, 800, 1000]),
    eps: 5 * rng.int(2, 16),
  };
}

/** Values a student gets from the common mistakes (values that round to 0 or 1 are dropped). */
function wrongAnswers(p: Params): Distractor[] {
  const e2 = p.eps ** 2;
  const s2 = p.sigma ** 2;
  const candidates = [
    // The variance of one draw instead of the variance of the average.
    { value: round(asked(p, s2 / e2), 4), mistakeCode: 'NO_N' },
    { value: round(asked(p, p.sigma / (p.n * e2)), 4), mistakeCode: 'SD_NOT_VARIANCE' },
    { value: round(asked(p, s2 / (p.n * p.eps)), 4), mistakeCode: 'EPS_NOT_SQUARED' },
    // The bound when the inside is asked for, or 1 minus it when the outside is.
    { value: round(1 - asked(p, lln(p)), 4), mistakeCode: 'WRONG_FORM' },
    { value: round(asked(p, s2 / (p.n ** 2 * e2)), 4), mistakeCode: 'VAR_OVER_N_SQUARED' },
  ];
  return cleanDistractors(
    target(p),
    candidates.filter((d) => d.value > 0 && d.value < 1),
    PROB.tolerance,
    PROB.relTolerance,
  ).slice(0, 4);
}

/** ST206, difficulty 2: the weak law of large numbers bound σ²/(nε²) for a sample mean. */
export const sampleMeanChebyshevBound: Generator<Params> = {
  id: 'sample-mean-chebyshev-bound',
  title: 'Chebyshev bound for an average',
  topicId: 'ST206',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const p = { context, ...draw(context, rng), mode: rng.pick(['outside', 'inside'] as const) };
      const b = lln(p);
      // A bound that says something, and at least two wrong answers to recognise.
      if (b < 0.01 || b > 0.6 || wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const ctx = CONTEXTS[p.context];
    const ask =
      p.mode === 'outside'
        ? `find an upper bound for the probability that ${ctx.average} differs from $${num(p.mu)}$ by $${num(p.eps)}$ or more`
        : `find a lower bound for the probability that ${ctx.average} is less than $${num(p.eps)}$ away from $${num(p.mu)}$`;
    return `${ctx.setup(p.n, p.mu, p.sigma)} Using Chebyshev's inequality, ${ask}. Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 4, ...PROB }),

  steps(p) {
    const v = varMean(p);
    const b = lln(p);
    return [
      {
        text: 'Find the variance of the average.',
        latex: `\\operatorname{Var}(\\bar X) = \\frac{\\sigma^2}{n} = \\frac{${num(p.sigma)}^2}{${num(p.n)}} = ${num(v, 4)}`,
        why: 'For independent draws the variances add up to nσ², and dividing the sum by n divides its variance by n².',
        result: round(v, 4),
      },
      {
        text: "Apply Chebyshev's inequality to the average.",
        latex: `P(|\\bar X - ${num(p.mu)}| \\ge ${num(p.eps)}) \\le \\frac{\\operatorname{Var}(\\bar X)}{\\varepsilon^2} = \\frac{${num(v, 4)}}{${num(p.eps)}^2} = ${num(b, 4)}`,
        why: 'The average has mean μ, so Chebyshev with c = ε bounds the chance that it misses μ by ε or more.',
        result: round(b, 4),
      },
      ...(p.mode === 'inside'
        ? [
            {
              text: 'Take the complement.',
              latex: `P(|\\bar X - ${num(p.mu)}| < ${num(p.eps)}) \\ge 1 - ${num(b, 4)} = ${num(target(p), 4)}`,
              why: 'Being less than ε away from μ is the opposite of missing by ε or more, so its probability is at least 1 minus the bound.',
              result: target(p),
            },
          ]
        : []),
    ];
  },

  distractors: wrongAnswers,
};
