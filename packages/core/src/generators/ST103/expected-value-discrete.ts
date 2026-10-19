import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'return' | 'profit' | 'claims';

interface Params {
  context: Context;
  /** The possible values of X, from worst to best (claims: from no claim upwards). */
  outcomes: number[];
  /** Their probabilities in hundredths (they add up to 100). */
  chances: number[];
}

/** The answer is exact to 2 decimals (integer outcomes, probabilities in hundredths). */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const prob = (c: number) => c / 100;
const expectation = (p: Params) =>
  p.outcomes.reduce((s, x, k) => s + x * prob(p.chances[k] ?? 0), 0);

/** Probabilities in hundredths, each at least `min`, adding up to 100. */
function drawChances(rng: { int(a: number, b: number): number }, n: number, min: number) {
  for (;;) {
    const chances = Array.from({ length: n - 1 }, () => rng.int(min, 60));
    const last = 100 - chances.reduce((s, c) => s + c, 0);
    if (last < min || last > 70) continue;
    return [...chances, last];
  }
}

/** Distinct values from `draw`, sorted from lowest to highest. */
function drawOutcomes(n: number, draw: () => number) {
  for (;;) {
    const xs = Array.from({ length: n }, draw).sort((a, b) => a - b);
    if (new Set(xs).size === n) return xs;
  }
}

function unit(p: Params, x: number) {
  return p.context === 'return' ? `${num(x)}\\%` : num(x);
}

/** The value with the highest probability (params make it unique). */
function mostLikely(p: Params) {
  const top = Math.max(...p.chances);
  return p.outcomes[p.chances.indexOf(top)] ?? 0;
}

const QUESTION: Record<Context, string> = {
  return: 'What is the expected return, in per cent?',
  profit: 'What is the expected profit?',
  claims: 'What is the expected payout per policy (the fair premium before costs)?',
};

/** ST103, difficulty 1: expected value E[X] = Σ x·p(x) of a discrete distribution with 3–4 outcomes. */
export const expectedValueDiscrete: Generator<Params> = {
  id: 'expected-value-discrete',
  title: 'Expected value of an uncertain outcome',
  topicId: 'ST103',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['return', 'profit', 'claims'] as const);
      const n = rng.pick([3, 4] as const);
      let outcomes: number[];
      let chances: number[];
      if (context === 'claims') {
        // Most policies pay nothing; a few pay a small or a large claim.
        const none = rng.int(60, 90);
        const rest = Array.from({ length: n - 2 }, () => rng.int(1, 15));
        const last = 100 - none - rest.reduce((s, c) => s + c, 0);
        if (last < 1) continue;
        // Larger claims are rarer: the probabilities fall as the payout rises.
        chances = [none, ...[...rest, last].sort((a, b) => b - a)];
        outcomes = [0, ...drawOutcomes(n - 1, () => rng.int(2, 200) * 100)];
      } else {
        chances = drawChances(rng, n, 5);
        outcomes =
          context === 'return'
            ? drawOutcomes(n, () => rng.int(-25, 35))
            : drawOutcomes(n, () => rng.int(-20, 60) * 50);
        if ((outcomes[0] ?? 0) >= 0) continue; // the worst case is a loss
      }
      const top = Math.max(...chances);
      if (chances.filter((c) => c === top).length > 1) continue; // one most likely outcome
      return { context, outcomes, chances };
    }
  },

  stem(p) {
    const parts = p.outcomes.map(
      (x, k) => `$${unit(p, x)}$ with probability $${num(prob(p.chances[k] ?? 0))}$`,
    );
    const list = `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
    const lead: Record<Context, string> = {
      return: `An investment's return next year is ${list}.`,
      profit: `A market stall's profit next month depends on demand: it is ${list}.`,
      claims: `The payout on a one-year insurance policy is ${list}.`,
    };
    return `${lead[p.context]} ${QUESTION[p.context]} Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(expectation(p), 2), decimals: 2, ...EXACT }),

  steps(p) {
    const total = p.chances.reduce((s, c) => s + c, 0) / 100;
    const products = p.outcomes.map((x, k) => {
      const pk = num(prob(p.chances[k] ?? 0));
      return x < 0 ? `(${num(x)})(${pk})` : `${num(x)}(${pk})`;
    });
    const terms = p.outcomes.map((x, k) => num(round(x * prob(p.chances[k] ?? 0), 2)));
    const mean = round(expectation(p), 2);
    return [
      {
        text: 'Check that the probabilities add up to 1.',
        latex: `${p.chances.map((c) => num(prob(c))).join(' + ')} = ${num(total)}`,
        why: 'The outcomes listed are all that can happen, so their probabilities must add up to 1; otherwise the distribution is incomplete.',
        result: total,
      },
      {
        text: 'Multiply each outcome by its probability.',
        latex: `${products.join(',\\; ')} \\;\\to\\; ${terms.join(',\\; ')}`,
        why: 'Each outcome counts in proportion to how often it happens: a likely outcome pulls the average towards it more than an unlikely one.',
      },
      {
        text: 'Add the products.',
        latex: `E[X] = \\sum x\\,p(x) = ${terms.join(' + ').replace(/\+ -/g, '- ')} = ${num(mean)}`,
        why: 'The expected value is the probability-weighted average: the long-run average per year, month or policy if the situation repeated many times.',
        result: mean,
      },
    ];
  },

  distractors(p) {
    const n = p.outcomes.length;
    const sum = p.outcomes.reduce((s, x) => s + x, 0);
    return cleanDistractors(
      round(expectation(p), 2),
      [
        { value: round(sum / n, 2), mistakeCode: 'SIMPLE_AVERAGE' },
        { value: sum, mistakeCode: 'NO_PROBABILITIES' },
        { value: mostLikely(p), mistakeCode: 'MOST_LIKELY' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
