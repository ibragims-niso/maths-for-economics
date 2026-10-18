import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** First round of spending, in millions. */
  injection: number;
  /** Fraction of each round that is spent again in the next round (the common ratio). */
  share: number;
  rounds: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const SHARES = [0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9] as const;

const sumOf = (p: Params, n: number) => (p.injection * (1 - p.share ** n)) / (1 - p.share);
const total = (p: Params) => round(sumOf(p, p.rounds), 2);

/** F08, difficulty 2: total of the first n rounds of spending when each round re-spends a fraction c (finite geometric series). */
export const spendingRoundsTotal: Generator<Params> = {
  id: 'spending-rounds-total',
  title: 'Total of rounds of spending',
  topicId: 'F08',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const share = rng.pick(SHARES);
      const rounds = rng.int(3, 8);
      // Keep the n-round total clearly below the long-run total, so the two are not confused.
      if (share ** rounds < 0.03) continue;
      return { injection: rng.int(2, 50) * 10, share, rounds };
    }
  },

  stem: (p) =>
    `The government spends $${num(p.injection)}$ million on a new railway line. Everyone who receives money spends $${num(p.share * 100)}\\%$ of it and saves the rest, so each round of spending is $${num(p.share * 100)}\\%$ of the round before. Counting the government's $${num(p.injection)}$ million as round 1, what is total spending over the first $${p.rounds}$ rounds, in millions? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: total(p), decimals: 2, ...MONEY }),

  steps(p) {
    const rn = p.share ** p.rounds;
    return [
      {
        text: 'Recognise a geometric sequence.',
        latex: `a = ${num(p.injection)}, \\quad r = ${num(p.share)}, \\quad n = ${p.rounds}`,
        why: 'Each round is the same fraction of the round before, so the rounds are multiplied by a constant ratio r.',
      },
      {
        text: 'Raise the ratio to the power n.',
        latex: `r^{${p.rounds}} = ${num(p.share)}^{${p.rounds}} = ${num(rn, 6)}`,
        why: 'The sum of n terms uses rⁿ; the exponent n − 1 belongs to the last term on its own.',
        result: rn,
      },
      {
        text: 'Use the sum formula for a geometric series.',
        latex: `S_{${p.rounds}} = ${num(p.injection)} \\cdot \\dfrac{1 - ${num(rn, 6)}}{1 - ${num(p.share)}} = ${num(total(p))}`,
        why: 'Sₙ = a(1 − rⁿ)/(1 − r) adds all n rounds at once instead of one by one.',
        result: total(p),
      },
      {
        text: 'Compare with the total if the rounds went on for ever.',
        latex: `S_\\infty = \\dfrac{${num(p.injection)}}{1 - ${num(p.share)}} = ${num(p.injection / (1 - p.share))}`,
        why: 'Because 0 < r < 1, rⁿ shrinks towards 0 and the running total settles at a/(1 − r). After n rounds a share 1 − rⁿ of it has been reached.',
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      total(p),
      [
        { value: round(p.injection / (1 - p.share), 2), mistakeCode: 'INFINITE_SUM' },
        { value: round(sumOf(p, p.rounds - 1), 2), mistakeCode: 'EXPONENT_OFF_BY_ONE' },
        { value: round(p.injection * p.share ** (p.rounds - 1), 2), mistakeCode: 'NTH_TERM_ONLY' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
