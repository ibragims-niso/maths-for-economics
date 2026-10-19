import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { choose } from './binomial-count-probability';
import { factorial, poisson } from './poisson-arrivals-probability';

const CONTEXTS = {
  loans: {
    setup: (n: string, prob: string) =>
      `A bank holds $${n}$ consumer loans, and each defaults this year with probability $${prob}$, independently of the others.`,
    event: 'loans default',
  },
  cards: {
    setup: (n: string, prob: string) =>
      `A card issuer processes $${n}$ online payments an hour, and each is fraudulent with probability $${prob}$, independently of the others.`,
    event: 'payments are fraudulent',
  },
  parcels: {
    setup: (n: string, prob: string) =>
      `A courier delivers $${n}$ parcels a day, and each is damaged with probability $${prob}$, independently of the others.`,
    event: 'parcels are damaged',
  },
  policies: {
    setup: (n: string, prob: string) =>
      `An insurer has $${n}$ home policies, and each leads to a fire claim this year with probability $${prob}$, independently of the others.`,
    event: 'policies lead to a fire claim',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  /** Number of independent trials (large). */
  n: number;
  /** Mean number of events λ = np (a multiple of 0.5). */
  lambda: number;
  /** The question asks for P(X > k). */
  k: number;
  context: Context;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

/** P(Y ≤ k) for Y ~ Poisson(λ). */
const poissonUpTo = (lambda: number, k: number) => {
  let s = 0;
  for (let j = 0; j <= k; j++) s += poisson(lambda, j);
  return s;
};

/** The exact binomial P(X > k) for X ~ B(n, λ/n), to compare with the approximation. */
export function binomialTail(n: number, prob: number, k: number): number {
  let s = 0;
  for (let j = 0; j <= k; j++) s += choose(n, j) * prob ** j * (1 - prob) ** (n - j);
  return 1 - s;
}

const approx = (p: Params) => 1 - poissonUpTo(p.lambda, p.k);

/** Values a student gets from the common mistakes. */
function wrongAnswers(p: Params) {
  return cleanDistractors(
    round(approx(p), 4),
    [
      { value: round(poissonUpTo(p.lambda, p.k), 4), mistakeCode: 'NOT_COMPLEMENT' },
      // "More than k" read as "at least k": the term X = k is wrongly included.
      { value: round(1 - poissonUpTo(p.lambda, p.k - 1), 4), mistakeCode: 'BOUNDARY' },
      { value: round(poisson(p.lambda, p.k + 1), 4), mistakeCode: 'EXACT_ONLY' },
    ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** ST104, difficulty 3: Poisson approximation (λ = np) to a binomial tail P(X > k) for large n and small p. */
export const poissonApproximationDefaults: Generator<Params> = {
  id: 'poisson-approximation-defaults',
  title: 'Poisson approximation to a binomial',
  topicId: 'ST104',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const n = rng.pick([
        200, 250, 300, 400, 500, 600, 750, 800, 1000, 1200, 1250, 1500, 2000, 2500, 3000, 4000,
        5000,
      ]);
      const lambda = rng.int(2, 12) / 2;
      const prob = lambda / n;
      // p small enough for the approximation, written with at most 4 decimals.
      if (prob > 0.02 || Math.abs(prob * 10_000 - Math.round(prob * 10_000)) > 1e-9) continue;
      const k = rng.int(1, Math.min(4, Math.ceil(lambda) + 1));
      const p = { n, lambda, k, context: rng.pick(Object.keys(CONTEXTS) as Context[]) };
      const value = approx(p);
      if (value < 0.02 || value > 0.98 || wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.setup(num(p.n, 0), num(p.lambda / p.n, 4))} Use the Poisson approximation to find the probability that more than $${p.k}$ ${c.event}. Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(approx(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const prob = p.lambda / p.n;
    const below = poissonUpTo(p.lambda, p.k);
    const answer = round(approx(p), 4);
    const l = num(p.lambda);
    const terms = Array.from({ length: p.k + 1 }, (_, j) =>
      j === 0 ? '1' : j === 1 ? l : `\\frac{${l}^{${j}}}{${j}!}`,
    ).join(' + ');
    const sum = Array.from({ length: p.k + 1 }, (_, j) => p.lambda ** j / factorial(j)).reduce(
      (a, b) => a + b,
      0,
    );
    return [
      {
        text: 'Find the Poisson mean.',
        latex: `\\lambda = np = ${num(p.n, 0)} \\times ${num(prob, 4)} = ${l}`,
        why: 'With many trials and a small probability, B(n, p) is close to a Poisson distribution with the same mean, λ = np.',
        result: p.lambda,
      },
      {
        text: `Use the complement: "more than ${p.k}" means ${p.k + 1} or more.`,
        latex: `P(X > ${p.k}) = 1 - P(X \\le ${p.k})`,
        why: `The complement needs only the ${p.k + 1} terms X = 0, …, ${p.k}; the event itself has hundreds.`,
      },
      {
        text: `Add the Poisson probabilities for 0 to ${p.k}.`,
        latex: `P(X \\le ${p.k}) \\approx e^{-${l}}\\left(${terms}\\right) = ${num(Math.exp(-p.lambda), 7)} \\times ${num(sum, 4)} = ${num(below, 4)}`,
        why: 'Every Poisson term has the factor e^(−λ), so it can be taken outside the bracket.',
        result: round(below, 4),
      },
      {
        text: 'Subtract from 1.',
        latex: `P(X > ${p.k}) \\approx 1 - ${num(below, 4)} = ${num(answer, 4)}`,
        why: 'The probabilities of all counts add up to 1.',
        result: answer,
      },
      {
        text: 'Compare with the exact binomial answer.',
        latex: `P(X > ${p.k}) = ${num(binomialTail(p.n, prob, p.k), 4)} \\text{ (exact, } B(${num(p.n, 0)}, ${num(prob, 4)})\\text{)}`,
        why: 'The two differ at most in the third decimal place, so the much shorter Poisson calculation is good enough here.',
      },
    ];
  },

  distractors: wrongAnswers,
};
