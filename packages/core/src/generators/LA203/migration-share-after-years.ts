import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { plain, pm } from './eigen2';

interface Params {
  /** Per cent of city dwellers who move to the countryside each year. */
  a: number;
  /** Per cent of countryside dwellers who move to the city each year. */
  b: number;
  /** Per cent of the population living in the city now. */
  s0: number;
  /** Number of years. */
  n: number;
}

/** A percentage to 2 decimal places; allow a little rounding of λ₂ⁿ along the way. */
const PCT = { tolerance: 0.05, relTolerance: 0 } as const;

/** Second eigenvalue 1 − a − b (the first one is 1). */
const lambda2 = (p: Params) => (100 - p.a - p.b) / 100;
/** Long-run city share in per cent, from the eigenvector (b, a) for λ = 1. */
const longRun = (p: Params) => (100 * p.b) / (p.a + p.b);

/** sₙ = s* + λⁿ(s₀ − s*), in per cent. */
const shareAfter = (start: number, star: number, lambda: number, n: number) =>
  star + lambda ** n * (start - star);

const answerOf = (p: Params) => round(shareAfter(p.s0, longRun(p), lambda2(p), p.n), 2);

const candidates = (p: Params): Distractor[] => {
  const star = longRun(p);
  const reversed = (100 * p.a) / (p.a + p.b);
  return [
    { value: round(star, 2), mistakeCode: 'LONG_RUN_ONLY' },
    {
      value: round(shareAfter(p.s0, reversed, lambda2(p), p.n), 2),
      mistakeCode: 'FLOWS_REVERSED',
    },
    // λ₂ⁿ applied to the whole share instead of to the gap s₀ − s*.
    { value: round(lambda2(p) ** p.n * p.s0, 2), mistakeCode: 'SHRANK_WHOLE_SHARE' },
    { value: round(shareAfter(p.s0, star, lambda2(p), 1), 2), mistakeCode: 'ONE_STEP' },
  ];
};

/** LA203, difficulty 3: the city's population share after n years of migration, s* + λ₂ⁿ(s₀ − s*). */
export const migrationShareAfterYears: Generator<Params> = {
  id: 'migration-share-after-years',
  title: 'Migration between city and countryside',
  topicId: 'LA203',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        a: 5 * rng.int(1, 10),
        b: 5 * rng.int(1, 10),
        s0: 10 * rng.int(1, 9),
        n: rng.int(3, 8),
      };
      // λ₂ = 1 − a − b at least 0.1, so the gap shrinks without jumping from side to side.
      if (p.a + p.b > 90) continue;
      // The start must differ from the long run, and the remaining gap must still matter.
      if (p.s0 * (p.a + p.b) === 100 * p.b) continue;
      if (Math.abs(answerOf(p) - longRun(p)) < 1) continue;
      if (cleanDistractors(answerOf(p), candidates(p), PCT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const A = [
      [1 - p.a / 100, p.b / 100],
      [p.a / 100, 1 - p.b / 100],
    ] as [[number, number], [number, number]];
    return `Each year ${num(p.a)}% of city dwellers move to the countryside and ${num(p.b)}% of countryside dwellers move to the city; nobody else arrives or leaves. With $x_t = (\\text{city}, \\text{countryside})$ populations, $x_{t+1} = Ax_t$ where $A = ${pm(A)}$. Now ${num(p.s0)}% of the population lives in the city. Using the eigenvalues and eigenvectors of $A$, find the percentage living in the city after ${p.n} years. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2, unit: '%', ...PCT }),

  steps(p) {
    const a = p.a / 100;
    const b = p.b / 100;
    const l2 = lambda2(p);
    const star = longRun(p);
    const value = answerOf(p);
    return [
      {
        text: 'Find the eigenvalues of A.',
        latex: `\\lambda_1 = 1, \\quad \\lambda_2 = \\operatorname{tr} A - 1 = 1 - ${num(a)} - ${num(b)} = ${num(l2)}`,
        why: 'Each column of A adds up to 1 (everyone ends up somewhere), so λ = 1 is an eigenvalue. The two eigenvalues add up to the trace 2 − a − b, which gives the second one.',
        result: round(l2, 2),
      },
      {
        text: 'The eigenvector for λ₁ = 1 gives the long-run city share.',
        latex: `v_1 = (${num(b)}, ${num(a)}), \\quad s^* = \\frac{${num(b)}}{${num(a)} + ${num(b)}} = ${num(star, 2)}\\%`,
        why: 'Av₁ = v₁ means the population no longer changes: the a·city leaving equals the b·countryside arriving. Dividing the city entry by the total gives the share b/(a + b).',
        result: round(star, 2),
      },
      {
        text: 'The eigenvector for λ₂ is (1, −1), so the gap to the long run shrinks by λ₂ each year.',
        latex: `s_n = s^* + \\lambda_2^{\\,n}\\,(s_0 - s^*)`,
        why: 'Write x₀ = c₁v₁ + c₂v₂. The v₁ part stays put and the v₂ = (1, −1) part, which only moves people between the regions, is multiplied by λ₂ every year.',
      },
      {
        text: `Put in n = ${p.n}.`,
        latex: `s_{${p.n}} = ${num(star, 4)} + ${num(l2)}^{${p.n}} \\cdot (${num(p.s0)} - ${num(star, 4)}) = ${num(value)}\\%`,
        why: `${plain(l2)}^${p.n} = ${plain(l2 ** p.n, 6)}: the gap of ${plain(p.s0 - star)} points has shrunk to ${plain(l2 ** p.n * (p.s0 - star))} points.`,
        result: value,
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerOf(p), candidates(p), PCT.tolerance, 0),
};
