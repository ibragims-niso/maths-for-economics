import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  withdrawals: {
    setup: (mu: number, sigma: number) =>
      `Daily cash withdrawals at a bank branch, in thousands, have mean $${num(mu)}$ and standard deviation $${num(sigma)}$.`,
    thing: "tomorrow's withdrawals",
    mus: [30, 40, 50, 60, 80, 100, 120],
  },
  sales: {
    setup: (mu: number, sigma: number) =>
      `A shop's weekly sales have mean $${num(mu)}$ units and standard deviation $${num(sigma)}$ units.`,
    thing: "next week's sales",
    mus: [200, 250, 300, 400, 500, 600, 800],
  },
  claims: {
    setup: (mu: number, sigma: number) =>
      `An insurer's total claims in a month, in thousands, have mean $${num(mu)}$ and standard deviation $${num(sigma)}$.`,
    thing: "next month's claims",
    mus: [500, 600, 750, 800, 1000, 1200, 1500],
  },
  wages: {
    setup: (mu: number, sigma: number) =>
      `Monthly wages in a sector have mean $${num(mu)}$ and standard deviation $${num(sigma)}$.`,
    thing: 'the wage of a worker picked at random',
    mus: [900, 1000, 1200, 1500, 1800, 2000, 2500],
  },
} as const;

type Context = keyof typeof CONTEXTS;
type Mode = 'outside' | 'inside';

/** Multiples k = c/σ that give readable bounds. */
const KS = [1.2, 1.25, 1.5, 1.6, 1.75, 2, 2.4, 2.5, 3, 3.2, 3.5, 4, 5] as const;

interface Params {
  context: Context;
  mu: number;
  sigma: number;
  /** Half-width of the interval: the interval is μ − c to μ + c. */
  c: number;
  /** Upper bound for P(|X − μ| ≥ c), or lower bound for P(|X − μ| < c). */
  mode: Mode;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const kOf = (p: Params) => p.c / p.sigma;
/** Chebyshev's bound σ²/c² = 1/k² for the outside, 1 − 1/k² for the inside. */
const bound = (p: Params, k = kOf(p)) => (p.mode === 'outside' ? 1 / k ** 2 : 1 - 1 / k ** 2);
const target = (p: Params) => round(bound(p), 4);

/** ST206, difficulty 1: Chebyshev's bound for X falling outside (or inside) an interval μ ± c. */
export const chebyshevIntervalBound: Generator<Params> = {
  id: 'chebyshev-interval-bound',
  title: 'Chebyshev bound for an interval',
  topicId: 'ST206',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const mu = rng.pick(CONTEXTS[context].mus);
      const k = rng.pick(KS);
      // σ a whole number between 4 % and 30 % of the mean, and c = kσ a whole number too.
      const sigma = rng.int(Math.max(2, Math.ceil(mu * 0.04)), Math.floor(mu * 0.3));
      const c = k * sigma;
      if (Math.abs(c - Math.round(c)) > 1e-9) continue;
      // The interval stays at positive values (withdrawals, sales, claims and wages are positive).
      if (mu - c <= 0) continue;
      return {
        context,
        mu,
        sigma,
        c: Math.round(c),
        mode: rng.pick(['outside', 'inside'] as const),
      };
    }
  },

  stem(p) {
    const ctx = CONTEXTS[p.context];
    const lo = num(p.mu - p.c);
    const hi = num(p.mu + p.c);
    const ask =
      p.mode === 'outside'
        ? `find an upper bound for the probability that ${ctx.thing} will be $${lo}$ or less, or $${hi}$ or more`
        : `find a lower bound for the probability that ${ctx.thing} will be strictly between $${lo}$ and $${hi}$`;
    return `${ctx.setup(p.mu, p.sigma)} Nothing else is known about the distribution. Using Chebyshev's inequality, ${ask}. Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 4, ...PROB }),

  steps(p) {
    const k = kOf(p);
    const steps = [
      {
        text: 'Find how far the ends of the interval are from the mean.',
        latex: `c = ${num(p.mu + p.c)} - ${num(p.mu)} = ${num(p.c)}`,
        why: `The interval runs from ${num(p.mu - p.c)} to ${num(p.mu + p.c)}, symmetric around the mean ${num(p.mu)}; c is half its width.`,
        result: p.c,
      },
      {
        text: 'Express this distance in standard deviations.',
        latex: `k = \\frac{c}{\\sigma} = \\frac{${num(p.c)}}{${num(p.sigma)}} = ${num(k)}`,
        why: "Chebyshev's inequality is stated in terms of how many standard deviations away from the mean you go.",
        result: round(k, 2),
      },
    ];
    if (p.mode === 'outside') {
      steps.push({
        text: "Apply Chebyshev's inequality.",
        latex: `P(|X - ${num(p.mu)}| \\ge ${num(p.c)}) \\le \\frac{1}{k^2} = \\frac{1}{${num(k ** 2, 4)}} = ${num(target(p), 4)}`,
        why: 'The event "at most the lower end or at least the upper end" is exactly |X − μ| ≥ c, and its probability is at most σ²/c² = 1/k², whatever the shape of the distribution.',
        result: target(p),
      });
    } else {
      steps.push({
        text: "Apply Chebyshev's inequality in its 'at least' form.",
        latex: `P(|X - ${num(p.mu)}| < ${num(p.c)}) \\ge 1 - \\frac{1}{k^2} = 1 - \\frac{1}{${num(k ** 2, 4)}} = ${num(target(p), 4)}`,
        why: 'Being strictly inside the interval is the complement of |X − μ| ≥ c, which has probability at most 1/k², so the inside has probability at least 1 − 1/k².',
        result: target(p),
      });
    }
    return steps;
  },

  distractors(p) {
    const k = kOf(p);
    const candidates = [
      {
        // 1/k instead of 1/k².
        value: round(p.mode === 'outside' ? 1 / k : 1 - 1 / k, 4),
        mistakeCode: 'ONE_OVER_K',
      },
      {
        // The other form: 1 − 1/k² for the outside, 1/k² for the inside.
        value: round(p.mode === 'outside' ? 1 - 1 / k ** 2 : 1 / k ** 2, 4),
        mistakeCode: 'WRONG_FORM',
      },
      // The whole width of the interval used as c, so k is doubled.
      { value: round(bound(p, 2 * k), 4), mistakeCode: 'WIDTH_NOT_HALF' },
    ];
    return cleanDistractors(
      target(p),
      candidates.filter((d) => d.value > 0 && d.value < 1),
      PROB.tolerance,
      PROB.relTolerance,
    );
  },
};
