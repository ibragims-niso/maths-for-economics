import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Probability (in hundredths) that the market lasts another year. */
  survive: number;
  /** Interest rate per year, in per cent. */
  rate: number;
}

const delta = (p: Params) => p.survive / 100 / (1 + p.rate / 100);
/** 1/(1 − δ) = (1 + r)/(1 + r − p), computed from whole numbers. */
const bound = (p: Params) => (100 + p.rate) / (100 + p.rate - p.survive);
const target = (p: Params) => Math.floor(bound(p));

function candidates(p: Params): Distractor[] {
  return [
    { value: Math.floor((100 + p.rate) / p.rate), mistakeCode: 'IGNORED_CONTINUATION' },
    { value: Math.floor(100 / (100 - p.survive)), mistakeCode: 'IGNORED_INTEREST' },
    { value: target(p) + 1, mistakeCode: 'ROUNDED_UP' },
  ];
}

/** GT04, difficulty 3: the largest number of Bertrand firms whose cartel is stable, with δ = p/(1 + r). */
export const bertrandCartelMaxFirms: Generator<Params> = {
  id: 'bertrand-cartel-max-firms',
  title: 'Largest stable Bertrand cartel',
  topicId: 'GT04',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = { survive: rng.int(75, 99), rate: rng.int(1, 25) };
      const top = 100 + p.rate;
      const den = top - p.survive;
      const n = Math.floor(top / den);
      // Keep 1/(1 − δ) at least 0.1 away from a whole number, so rounding δ cannot change n.
      const frac = (top - n * den) / den;
      if (n < 2 || n > 30 || frac < 0.1 || frac > 0.9) continue;
      if (cleanDistractors(n, candidates(p)).length === 3) return p;
    }
  },

  stem: (p) =>
    `Some firms sell an identical product with the same constant marginal cost and compete in prices (Bertrand). They form a cartel: all charge the monopoly price and share the monopoly profit equally. A firm that undercuts takes the whole market for one year; after that, all firms price at marginal cost for ever (grim trigger). Each year the market survives to the next with probability $${num(p.survive / 100)}$, and the interest rate is $${num(p.rate)}\\%$ a year. What is the largest number of firms for which this cartel is stable? Give a whole number.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0 }),

  steps: (p) => {
    const d = round(delta(p), 4);
    return [
      {
        text: 'Find the discount factor from the survival probability and the interest rate.',
        latex: `\\delta = \\dfrac{${num(p.survive / 100)}}{1 + ${num(p.rate / 100)}} = ${num(d, 4)}`,
        why: 'A profit next year counts only if the market still exists (probability p) and is worth 1/(1 + r) of a profit today, so δ = p/(1 + r).',
        result: d,
      },
      {
        text: 'Write the critical discount factor for n Bertrand firms.',
        latex: `\\delta^* = \\dfrac{\\Pi_m - \\Pi_m/n}{\\Pi_m - 0} = 1 - \\dfrac{1}{n}`,
        why: 'Colluding gives Πₘ/n a year; undercutting gives almost the whole monopoly profit Πₘ once; the punishment, pricing at marginal cost, gives 0. Put these into δ* = (T − R)/(T − P).',
      },
      {
        text: 'The cartel is stable when δ ≥ 1 − 1/n; solve for n.',
        latex: `n \\le \\dfrac{1}{1 - \\delta} = \\dfrac{1 + ${num(p.rate / 100)}}{1 + ${num(p.rate / 100)} - ${num(p.survive / 100)}} = ${num(bound(p))}`,
        why: 'Rearranging δ ≥ 1 − 1/n gives 1/n ≥ 1 − δ. Writing 1 − δ = (1 + r − p)/(1 + r) avoids rounding δ first.',
        result: round(bound(p), 2),
      },
      {
        text: 'Take the largest whole number that satisfies the inequality.',
        latex: `n_{\\max} = ${num(target(p))}`,
        why: `With ${num(target(p) + 1)} firms each share would be smaller, 1 − 1/n would exceed δ, and every firm would rather undercut.`,
        result: target(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p)),
};
