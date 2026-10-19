import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  phones: {
    batch: (n: number, d: number) =>
      `A batch of $${num(n)}$ phones from a supplier contains $${num(d)}$ faulty ones.`,
    pick: (k: number) =>
      `A quality inspector picks $${num(k)}$ phones at random, without replacement.`,
    ask: (j: number) =>
      `What is the probability that exactly $${num(j)}$ of the phones she picks ${j === 1 ? 'is' : 'are'} faulty?`,
    bad: 'faulty phones',
    good: 'working phones',
  },
  loans: {
    batch: (n: number, d: number) =>
      `A bank branch has $${num(n)}$ loan files, and $${num(d)}$ of them contain an error.`,
    pick: (k: number) =>
      `An auditor checks $${num(k)}$ files chosen at random, without replacement.`,
    ask: (j: number) =>
      `What is the probability that exactly $${num(j)}$ of the files he checks ${j === 1 ? 'contains' : 'contain'} an error?`,
    bad: 'files with an error',
    good: 'correct files',
  },
  bulbs: {
    batch: (n: number, d: number) =>
      `A box of $${num(n)}$ LED bulbs delivered to a shop holds $${num(d)}$ defective bulbs.`,
    pick: (k: number) =>
      `The shop owner tests $${num(k)}$ bulbs taken at random, without replacement.`,
    ask: (j: number) =>
      `What is the probability that exactly $${num(j)}$ of the tested bulbs ${j === 1 ? 'is' : 'are'} defective?`,
    bad: 'defective bulbs',
    good: 'good bulbs',
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  /** Items in the batch. */
  total: number;
  /** Defective items in the batch. */
  defective: number;
  /** Items picked, without replacement. */
  sample: number;
  /** Defective items wanted in the sample (1 ≤ j ≤ k − 1). */
  wanted: number;
  context: Context;
}

/** Probabilities to 4 decimal places. */
const PROB = { tolerance: 0.0005, relTolerance: 0 } as const;

/** C(n, k), the number of ways to choose k of n items when order does not matter. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

const allSamples = (p: Params) => choose(p.total, p.sample);
const favourable = (p: Params) =>
  choose(p.defective, p.wanted) * choose(p.total - p.defective, p.sample - p.wanted);
const exact = (p: Params) => favourable(p) / allSamples(p);

/** Values a student gets from the common mistakes (zeros after rounding are dropped). */
function wrongAnswers(p: Params) {
  const share = p.defective / p.total;
  const rest = p.sample - p.wanted;
  return cleanDistractors(
    round(exact(p), 4),
    [
      {
        // Ordered samples on the bottom, but the defectives' places in the order are not counted.
        value: round(exact(p) / choose(p.sample, p.wanted), 4),
        mistakeCode: 'ORDERED_COUNT',
      },
      {
        value: round(choose(p.sample, p.wanted) * share ** p.wanted * (1 - share) ** rest, 4),
        mistakeCode: 'WITH_REPLACEMENT',
      },
      {
        value: round(choose(p.defective, p.wanted) / allSamples(p), 4),
        mistakeCode: 'MISSING_GOOD_ITEMS',
      },
    ].filter((d) => d.value > 0),
    PROB.tolerance,
    PROB.relTolerance,
  );
}

/** ST102, difficulty 1: probability that a random sample from a batch holds exactly j defectives. */
export const sampleDefectivesProbability: Generator<Params> = {
  id: 'sample-defectives-probability',
  title: 'Defective items in a sample',
  topicId: 'ST102',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const total = rng.int(10, 40);
      const defective = rng.int(2, Math.min(8, Math.floor(total / 3)));
      const sample = rng.int(3, 6);
      const wanted = rng.int(1, Math.min(defective, sample - 1));
      const p = {
        total,
        defective,
        sample,
        wanted,
        context: rng.pick(Object.keys(CONTEXTS) as Context[]),
      };
      // A readable probability and at least two distinct wrong answers to recognise.
      if (exact(p) < 0.005 || wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    return `${c.batch(p.total, p.defective)} ${c.pick(p.sample)} ${c.ask(p.wanted)} Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(exact(p), 4), decimals: 4, ...PROB }),

  steps(p) {
    const c = CONTEXTS[p.context];
    const good = p.total - p.defective;
    const rest = p.sample - p.wanted;
    const all = allSamples(p);
    const fav = favourable(p);
    return [
      {
        text: `Count all possible samples of ${p.sample} from ${p.total}.`,
        latex: `\\binom{${p.total}}{${p.sample}} = ${num(all, 0)}`,
        why: 'The order in which items are picked does not matter, and every set of items is equally likely, so we count combinations.',
        result: all,
      },
      {
        text: `Count the samples with exactly ${p.wanted} of the ${c.bad} and ${rest} of the ${c.good}.`,
        latex: `\\binom{${p.defective}}{${p.wanted}}\\binom{${good}}{${rest}} = ${num(choose(p.defective, p.wanted), 0)} \\cdot ${num(choose(good, rest), 0)} = ${num(fav, 0)}`,
        why: 'By the multiplication principle, each choice of defective items can be paired with each choice of good items to fill the rest of the sample.',
        result: fav,
      },
      {
        text: 'Divide favourable samples by all samples.',
        latex: `P = \\dfrac{${num(fav, 0)}}{${num(all, 0)}} = ${num(round(exact(p), 4), 4)}`,
        why: 'Classical probability: with equally likely outcomes, P(A) = number of outcomes in A ÷ number of all outcomes.',
        result: round(exact(p), 4),
      },
    ];
  },

  distractors: wrongAnswers,
};
