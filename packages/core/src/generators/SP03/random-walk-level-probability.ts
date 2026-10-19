import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  share: {
    setup: (_n: number) =>
      `A share's price moves up by 1 or down by 1 each trading day, each with probability $\\tfrac12$, independently of earlier days.`,
    ask: (n: number, k: number) =>
      k === 0
        ? `What is the probability that after ${n} days the price is back at its starting value?`
        : `What is the probability that after ${n} days the price is exactly ${Math.abs(k)} ${k > 0 ? 'above' : 'below'} its starting value?`,
  },
  bets: {
    setup: (n: number) =>
      `A gambler makes ${n} bets of 1 on the toss of a fair coin, winning 1 or losing 1 each time.`,
    ask: (_n: number, k: number) =>
      k === 0
        ? 'What is the probability that she ends exactly even?'
        : `What is the probability that she ends exactly ${Math.abs(k)} ${k > 0 ? 'up' : 'down'}?`,
  },
  fx: {
    setup: (n: number) =>
      `Each minute an exchange rate moves up or down by one tick, each with probability $\\tfrac12$, independently of earlier minutes. Watch it for ${n} minutes.`,
    ask: (_n: number, k: number) =>
      k === 0
        ? 'What is the probability that the rate ends where it started?'
        : `What is the probability that it ends exactly ${Math.abs(k)} ticks ${k > 0 ? 'higher' : 'lower'}?`,
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  /** Number of steps. */
  n: number;
  /** The level S_n asked about; same parity as n. */
  k: number;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

/** The binomial coefficient C(n, r). */
export function choose(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let c = 1;
  for (let i = 1; i <= r; i++) c = (c * (n - r + i)) / i;
  return Math.round(c);
}

const ups = (p: Params) => (p.n + p.k) / 2;
const exact = (p: Params) => choose(p.n, ups(p)) / 2 ** p.n;

function wrongAnswers(p: Params) {
  return cleanDistractors(
    round(exact(p), 4),
    [
      { value: round(choose(p.n, Math.abs(p.k)) / 2 ** p.n, 4), mistakeCode: 'LEVEL_AS_UPS' },
      { value: round(1 / 2 ** p.n, 4), mistakeCode: 'ONE_PATH' },
      { value: round(1 / (p.n + 1), 4), mistakeCode: 'EQUAL_LEVELS' },
    ],
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** SP03, difficulty 2: P(S_n = k) for a symmetric ±1 random walk, C(n, (n + k)/2)/2ⁿ. */
export const randomWalkLevelProbability: Generator<Params> = {
  id: 'random-walk-level-probability',
  title: 'Where a random walk ends up',
  topicId: 'SP03',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const n = rng.int(4, 12);
      // Only levels with the parity of n can be reached: k = n − 2·(number of down-steps).
      const k = n - 2 * rng.int(0, n);
      const p: Params = { context, n, k };
      if (exact(p) < 0.01) continue;
      if (wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.setup(p.n)} ${c.ask(p.n, p.k)} Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(exact(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const u = ups(p);
    const d = p.n - u;
    const paths = choose(p.n, u);
    const value = round(exact(p), 4);
    return [
      {
        text: 'Find how many of the steps must go up and how many down.',
        latex: `u - d = ${num(p.k)},\\; u + d = ${p.n} \\;\\Rightarrow\\; u = \\dfrac{${p.n} ${p.k < 0 ? '-' : '+'} ${Math.abs(p.k)}}{2} = ${u},\\; d = ${d}`,
        why: 'Each up-step adds 1 and each down-step takes 1 away, so the final level is ups minus downs, and ups plus downs is the number of steps.',
        result: u,
      },
      {
        text: `Count the paths with exactly ${u} up-steps.`,
        latex: `\\binom{${p.n}}{${u}} = ${num(paths)}`,
        why: 'A path is fixed by choosing which of the steps go up; the order matters for the path but not for where it ends.',
        result: paths,
      },
      {
        text: 'Multiply by the probability of each single path.',
        latex: `P(S_{${p.n}} = ${num(p.k)}) = \\dfrac{${num(paths)}}{2^{${p.n}}} = \\dfrac{${num(paths)}}{${num(2 ** p.n)}} ${Math.abs(exact(p) - value) < 1e-12 ? '=' : '\\approx'} ${num(value, 4)}`,
        why: `Every particular sequence of ${p.n} independent ups and downs has probability (½)^${p.n}, so the answer is the number of paths times that. This is the binomial distribution for the number of up-steps.`,
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
