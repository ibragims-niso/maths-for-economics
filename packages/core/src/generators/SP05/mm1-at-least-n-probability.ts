import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { MM1_CONTEXTS, type Mm1Context, mm1Setting } from './queue';

interface Params {
  context: Mm1Context;
  /** Arrival rate λ per hour. */
  lambda: number;
  /** Service rate μ per hour. */
  mu: number;
  /** "At least n customers in the system". */
  n: number;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const rhoOf = (p: Params) => p.lambda / p.mu;
/** P(N ≥ n) = ρⁿ in the long run of an M/M/1 queue. */
const tail = (p: Params) => rhoOf(p) ** p.n;

function wrongAnswers(p: Params) {
  const rho = rhoOf(p);
  return cleanDistractors(
    round(tail(p), 4),
    [
      { value: round((1 - rho) * rho ** p.n, 4), mistakeCode: 'EXACTLY_N' },
      { value: round(rho ** (p.n + 1), 4), mistakeCode: 'OFF_BY_ONE' },
      { value: round(1 - rho ** p.n, 4), mistakeCode: 'TAIL_COMPLEMENT' },
    ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** SP05, difficulty 2: probability that an arrival finds at least n customers in an M/M/1 system, ρⁿ. */
export const mm1AtLeastNProbability: Generator<Params> = {
  id: 'mm1-at-least-n-probability',
  title: 'Chance of finding a queue',
  topicId: 'SP05',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(MM1_CONTEXTS) as Mm1Context[]);
      const mu = rng.int(4, 60);
      const lambda = rng.int(Math.ceil(mu / 2), mu - 1);
      const p: Params = { context, lambda, mu, n: rng.int(2, 6) };
      // ρ with at most 2 decimals (whole-number check), between 0.5 and 0.95.
      if ((100 * lambda) % mu !== 0) continue;
      if (2 * lambda < mu || 20 * lambda > 19 * mu) continue;
      if (tail(p) < 0.01 || wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const c = MM1_CONTEXTS[p.context];
    return `${mm1Setting(p.context, p.lambda, p.mu)} What is the probability that a ${c.thing} arriving at random finds at least $${p.n}$ ${c.things} ${c.inside}, counting the one being served? Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(tail(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const rho = rhoOf(p);
    const value = round(tail(p), 4);
    const exactValue = Math.abs(tail(p) - value) < 1e-12;
    return [
      {
        text: 'Find the utilisation.',
        latex: `\\rho = \\dfrac{\\lambda}{\\mu} = \\dfrac{${p.lambda}}{${p.mu}} = ${num(rho, 2)}`,
        why: 'ρ < 1, so the queue settles down, and in the long run P(N = k) = (1 − ρ)ρᵏ.',
        result: round(rho, 2),
      },
      {
        text: `Add the probabilities of ${p.n} or more customers.`,
        latex: `P(N \\ge ${p.n}) = \\sum_{k=${p.n}}^{\\infty}(1 - \\rho)\\rho^{k} = (1 - \\rho)\\rho^{${p.n}}\\left(1 + \\rho + \\rho^2 + \\dots\\right) = \\rho^{${p.n}}`,
        why: 'The geometric series 1 + ρ + ρ² + … adds up to 1/(1 − ρ), which cancels the factor 1 − ρ. Customers arriving at random see these long-run probabilities.',
      },
      {
        text: 'Raise ρ to the power n.',
        latex: `\\rho^{${p.n}} = ${num(rho, 2)}^{${p.n}} ${exactValue ? '=' : '\\approx'} ${num(value, 4)}`,
        why: `At least ${p.n} in the system means the customer will wait behind at least ${p.n} others, one of them already being served.`,
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
