import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  loans: {
    setup: (n: number, prob: string) =>
      `A bank has made $${n}$ small business loans. Each borrower defaults with probability $${prob}$, independently of the others.`,
    event: 'borrowers default',
    one: 'borrower defaults',
    pcts: [5, 8, 10, 12, 15, 20],
  },
  items: {
    setup: (n: number, prob: string) =>
      `A machine fills boxes of $${n}$ light bulbs. Each bulb is defective with probability $${prob}$, independently of the others.`,
    event: 'bulbs in a box are defective',
    one: 'bulb in a box is defective',
    pcts: [5, 10, 15, 20, 25],
  },
  sales: {
    setup: (n: number, prob: string) =>
      `A sales agent makes $${n}$ calls a morning. Each call ends in a sale with probability $${prob}$, independently of the others.`,
    event: 'calls end in a sale',
    one: 'call ends in a sale',
    pcts: [10, 20, 25, 30, 35, 40, 45, 60, 70],
  },
  claims: {
    setup: (n: number, prob: string) =>
      `An insurer covers $${n}$ small shops. Each shop makes a claim this year with probability $${prob}$, independently of the others.`,
    event: 'shops make a claim',
    one: 'shop makes a claim',
    pcts: [5, 10, 15, 20, 25, 30],
  },
} as const;

type Context = keyof typeof CONTEXTS;
type Mode = 'exact' | 'atMost' | 'atLeast';

interface Params {
  /** Number of independent trials. */
  n: number;
  /** Success probability in per cent (never 50, so p and 1 − p differ). */
  pct: number;
  /** The count asked about. */
  k: number;
  /** P(X = k), P(X ≤ k) or P(X ≥ k). */
  mode: Mode;
  context: Context;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

/** C(n, k), the number of ways to choose which k of the n trials are successes. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

/** P(X = j) for X ~ B(n, p); with `withCount` false the C(n, j) factor is left out. */
const term = (n: number, p: number, j: number, withCount = true) =>
  (withCount ? choose(n, j) : 1) * p ** j * (1 - p) ** (n - j);

/** P(X ≤ k): the sum of the terms j = 0, …, k (0 when k < 0). */
const upTo = (n: number, p: number, k: number, withCount = true) => {
  let s = 0;
  for (let j = 0; j <= k; j++) s += term(n, p, j, withCount);
  return s;
};

/** The probability asked for, worked out with success probability p. */
function probability(n: number, p: number, k: number, mode: Mode, withCount = true): number {
  if (mode === 'exact') return term(n, p, k, withCount);
  if (mode === 'atMost') return upTo(n, p, k, withCount);
  return 1 - upTo(n, p, k - 1, withCount);
}

const exact = (p: Params) => probability(p.n, p.pct / 100, p.k, p.mode);

/** Values a student gets from the common mistakes (values that round to 0 or 1 are dropped). */
function wrongAnswers(p: Params) {
  const prob = p.pct / 100;
  const candidates = [
    {
      // The probability of one particular sequence, without counting the orders.
      value: round(probability(p.n, prob, p.k, p.mode, false), 4),
      mistakeCode: 'NO_COMBINATION',
    },
    { value: round(probability(p.n, 1 - prob, p.k, p.mode), 4), mistakeCode: 'SWAPPED_P' },
  ];
  if (p.mode === 'atMost') {
    candidates.push(
      { value: round(upTo(p.n, prob, p.k - 1), 4), mistakeCode: 'BOUNDARY' },
      { value: round(term(p.n, prob, p.k), 4), mistakeCode: 'EXACT_ONLY' },
    );
  }
  if (p.mode === 'atLeast') {
    candidates.push(
      { value: round(1 - upTo(p.n, prob, p.k), 4), mistakeCode: 'BOUNDARY' },
      { value: round(upTo(p.n, prob, p.k - 1), 4), mistakeCode: 'NOT_COMPLEMENT' },
    );
  }
  return cleanDistractors(
    round(exact(p), 4),
    candidates.filter((d) => d.value > 0 && d.value < 1),
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** Decimal places that show x (0 < x < 1) to 5 significant figures, at least 4. */
const sigDecimals = (x: number) => Math.max(4, 4 - Math.floor(Math.log10(x)));

/** The terms P(X = j) for j = from, …, to as LaTeX, each with its value. */
function termsLatex(n: number, prob: number, from: number, to: number): string {
  const parts: string[] = [];
  for (let j = from; j <= to; j++) {
    parts.push(
      `\\tbinom{${n}}{${j}}(${num(prob)})^{${j}}(${num(1 - prob)})^{${n - j}} = ${num(term(n, prob, j), 4)}`,
    );
  }
  return parts.join(',\\quad ');
}

/** ST104, difficulty 1: binomial probability P(X = k), P(X ≤ k) or P(X ≥ k) for a small number of trials. */
export const binomialCountProbability: Generator<Params> = {
  id: 'binomial-count-probability',
  title: 'Binomial probability',
  topicId: 'ST104',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const n = rng.int(4, 10);
      const pct = rng.pick(CONTEXTS[context].pcts);
      const mode = rng.pick(['exact', 'atMost', 'atLeast'] as const);
      const k = mode === 'exact' ? rng.int(1, n - 1) : rng.int(1, Math.min(3, n - 2));
      const p = { n, pct, k, mode, context };
      const value = exact(p);
      // A readable probability and at least two distinct wrong answers to recognise.
      if (value < 0.01 || value > 0.99 || wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    const ask =
      p.mode === 'exact'
        ? `exactly $${p.k}$ ${p.k === 1 ? c.one : c.event}`
        : p.mode === 'atMost'
          ? `at most $${p.k}$ ${c.event}`
          : `at least $${p.k}$ ${p.k === 1 ? c.one : c.event}`;
    return `${c.setup(p.n, num(p.pct / 100))} What is the probability that ${ask}? Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(exact(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const prob = p.pct / 100;
    const answer = round(exact(p), 4);
    const model = {
      text: `Let X be the number of successes: X follows the binomial distribution B(${p.n}, ${num(prob)}).`,
      latex: `P(X = j) = \\binom{${p.n}}{j}(${num(prob)})^{j}(${num(1 - prob)})^{${p.n} - j}`,
      why: 'The trials are independent and each has the same success probability, so the number of successes is binomial; C(n, j) counts the orders in which j successes can occur.',
    };
    if (p.mode === 'exact') {
      const count = choose(p.n, p.k);
      const one = prob ** p.k * (1 - prob) ** (p.n - p.k);
      const d = sigDecimals(one);
      return [
        model,
        {
          text: `Count the orders in which ${p.k} successes can occur among ${p.n} trials.`,
          latex: `\\binom{${p.n}}{${p.k}} = ${count}`,
          why: `Any ${p.k} of the ${p.n} trials can be the successes, and each choice is a different sequence of outcomes.`,
          result: count,
        },
        {
          text: 'Find the probability of one such sequence.',
          latex: `(${num(prob)})^{${p.k}}(${num(1 - prob)})^{${p.n - p.k}} = ${num(one, d)}`,
          why: `By independence, multiply p once for each success and 1 − p once for each of the ${p.n - p.k} failures.`,
          result: round(one, d),
        },
        {
          text: 'Multiply the number of sequences by the probability of each.',
          latex: `P(X = ${p.k}) = ${count} \\times ${num(one, d)} = ${num(answer, 4)}`,
          why: 'The sequences are mutually exclusive and equally likely, so their probabilities add up.',
          result: answer,
        },
      ];
    }
    if (p.mode === 'atMost') {
      return [
        model,
        {
          text: `Work out P(X = j) for j = 0 to ${p.k}.`,
          latex: termsLatex(p.n, prob, 0, p.k),
          why: `"At most ${p.k}" includes ${p.k} itself, so the counts 0, 1, …, ${p.k} all count.`,
        },
        {
          text: 'Add them up.',
          latex: `P(X \\le ${p.k}) = ${num(answer, 4)}`,
          why: 'The events X = 0, X = 1, … cannot happen together, so their probabilities add. Add the unrounded values.',
          result: answer,
        },
      ];
    }
    const below = upTo(p.n, prob, p.k - 1);
    return [
      model,
      {
        text: `Use the complement: "at least ${p.k}" is the opposite of "at most ${p.k - 1}".`,
        latex: `P(X \\ge ${p.k}) = 1 - P(X \\le ${p.k - 1})`,
        why: `The complement has only ${p.k} term${p.k === 1 ? '' : 's'}, far fewer than the ${p.n - p.k + 1} terms from ${p.k} up to ${p.n}.`,
      },
      {
        text: `Work out P(X = j) for j = 0 to ${p.k - 1} and add them.`,
        latex: `${termsLatex(p.n, prob, 0, p.k - 1)}${p.k > 1 ? `,\\quad P(X \\le ${p.k - 1}) = ${num(below, 4)}` : ''}`,
        why: 'These are the outcomes that do NOT count; add their unrounded probabilities.',
        result: round(below, 4),
      },
      {
        text: 'Subtract from 1.',
        latex: `P(X \\ge ${p.k}) = 1 - ${num(below, 4)} = ${num(answer, 4)}`,
        why: 'All probabilities of B(n, p) add up to 1, so the outcomes we want have what is left.',
        result: answer,
      },
    ];
  },

  distractors: wrongAnswers,
};
