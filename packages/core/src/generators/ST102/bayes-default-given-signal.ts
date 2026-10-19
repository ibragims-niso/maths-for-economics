import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  credit: {
    intro: (b: number) => `At a bank, $${num(b)}\\%$ of borrowers default on their loans.`,
    test: (h: number, f: number) =>
      `A credit-scoring model raises a warning for $${num(h)}\\%$ of borrowers who later default and for $${num(f)}\\%$ of borrowers who repay.`,
    ask: 'A borrower gets a warning. What is the probability that this borrower defaults?',
    event: 'default',
    signal: 'warning',
    both: 'a borrower defaults and gets a warning',
    any: 'a borrower gets a warning',
  },
  fraud: {
    intro: (b: number) =>
      `Of the insurance claims a company receives, $${num(b)}\\%$ are fraudulent.`,
    test: (h: number, f: number) =>
      `Its screening software flags $${num(h)}\\%$ of fraudulent claims and $${num(f)}\\%$ of honest claims.`,
    ask: 'A claim is flagged. What is the probability that it is fraudulent?',
    event: 'fraud',
    signal: 'flag',
    both: 'a claim is fraudulent and flagged',
    any: 'a claim is flagged',
  },
  firms: {
    intro: (b: number) =>
      `Among small firms that apply for a loan, $${num(b)}\\%$ go bankrupt within a year.`,
    test: (h: number, f: number) =>
      `An early-warning indicator is triggered for $${num(h)}\\%$ of the firms that go bankrupt and for $${num(f)}\\%$ of the firms that survive.`,
    ask: 'The indicator is triggered for a firm. What is the probability that the firm goes bankrupt?',
    event: 'bankrupt',
    signal: 'trigger',
    both: 'a firm goes bankrupt and triggers the indicator',
    any: 'a firm triggers the indicator',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  /** P(A) in per cent: the base rate. */
  base: number;
  /** P(S | A) in per cent: the hit rate. */
  hit: number;
  /** P(S | not A) in per cent: the false-alarm rate. */
  falseAlarm: number;
  context: Context;
}

const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

const joint = (p: Params) => (p.base / 100) * (p.hit / 100);
const falseJoint = (p: Params) => (1 - p.base / 100) * (p.falseAlarm / 100);
const signal = (p: Params) => joint(p) + falseJoint(p);
const posterior = (p: Params) => joint(p) / signal(p);

/** ST102, difficulty 2: Bayes' theorem, P(event | signal) from a base rate, hit rate and false-alarm rate. */
export const bayesDefaultGivenSignal: Generator<Params> = {
  id: 'bayes-default-given-signal',
  title: 'Probability of default given a warning',
  topicId: 'ST102',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p = {
        base: rng.int(1, 20),
        hit: rng.int(60, 98),
        falseAlarm: rng.int(2, 30),
        context: rng.pick(Object.keys(CONTEXTS) as Context[]),
      };
      const post = posterior(p);
      if (post < 0.05 || post > 0.95) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.intro(p.base)} ${c.test(p.hit, p.falseAlarm)} ${c.ask} Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(posterior(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const c = CONTEXTS[p.context];
    const A = `\\text{${c.event}}`;
    const S = `\\text{${c.signal}}`;
    const b = p.base / 100;
    const h = p.hit / 100;
    const f = p.falseAlarm / 100;
    return [
      {
        text: `Probability that ${c.both}.`,
        latex: `P(${A} \\cap ${S}) = P(${A})\\,P(${S} \\mid ${A}) = ${num(b, 2)} \\cdot ${num(h, 2)} = ${num(joint(p), 4)}`,
        why: 'Multiplication rule: the chance of both is the chance of the first event times the chance of the second given the first.',
        result: round(joint(p), 4),
      },
      {
        text: `Total probability that ${c.any}.`,
        latex: `P(${S}) = ${num(joint(p), 4)} + ${num(1 - b, 2)} \\cdot ${num(f, 2)} = ${num(signal(p), 4)}`,
        why: 'Law of total probability: a signal comes either from a true case or as a false alarm from the larger group without the event, so both paths are added.',
        result: round(signal(p), 4),
      },
      {
        text: "Apply Bayes' theorem.",
        latex: `P(${A} \\mid ${S}) = \\dfrac{${num(joint(p), 4)}}{${num(signal(p), 4)}} = ${num(round(posterior(p), 4), 4)}`,
        why: 'Conditioning on the signal keeps only the cases with a signal; the answer is the share of them that are true cases.',
        result: round(posterior(p), 4),
      },
    ];
  },

  distractors(p) {
    const h = p.hit / 100;
    const f = p.falseAlarm / 100;
    return cleanDistractors(
      round(posterior(p), 4),
      [
        { value: h, mistakeCode: 'INVERTED_CONDITIONAL' },
        { value: round(h / (h + f), 4), mistakeCode: 'BASE_RATE_NEGLECT' },
        { value: round(joint(p), 4), mistakeCode: 'JOINT_NOT_CONDITIONAL' },
        { value: round(signal(p), 4), mistakeCode: 'TOTAL_NOT_CONDITIONAL' },
      ],
      PROB.tolerance,
      PROB.relTolerance,
    );
  },
};
