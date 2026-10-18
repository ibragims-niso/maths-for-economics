import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { column, dot, dotLatex, entry, type Matrix, pmatrix, row } from './matrix';

type Context = 'jobs' | 'brands';

interface Params {
  context: Context;
  /** Chance (in per cent) of moving from state 1 to state 2 in one period. */
  out: number;
  /** Chance (in per cent) of moving from state 2 to state 1 in one period. */
  back: number;
  /** State now (row) and state two periods later (column). */
  i: 1 | 2;
  j: 1 | 2;
}

/** Products of two 2-decimal probabilities have at most 4 decimals, so the answer is exact. */
const PROB = { tolerance: 0.00005, relTolerance: 0 } as const;

const SETTING: Record<
  Context,
  { states: [string, string]; period: string; who: string; intro: string }
> = {
  jobs: {
    states: ['employed', 'unemployed'],
    period: 'year',
    who: 'a worker who is',
    intro:
      'In a simple model of a labour market, each worker is either employed (state 1) or unemployed (state 2).',
  },
  brands: {
    states: ['buying brand A', 'buying brand B'],
    period: 'month',
    who: 'a customer who is',
    intro: 'Customers of a product buy either brand A (state 1) or brand B (state 2) each month.',
  },
};

const matrixOf = (p: Params): Matrix => [
  [round(1 - p.out / 100, 2), round(p.out / 100, 2)],
  [round(p.back / 100, 2), round(1 - p.back / 100, 2)],
];

/** Entry (i, j) of T²: row i of T times column j of T. */
const twoStep = (p: Params) => {
  const t = matrixOf(p);
  return round(dot(row(t, p.i), column(t, p.j)), 4);
};

const candidates = (p: Params) => {
  const t = matrixOf(p);
  const { i, j } = p;
  return [
    { value: round(dot(row(t, i), row(t, j)), 4), mistakeCode: 'ROW_BY_ROW' },
    { value: round(entry(t, i, i) * entry(t, i, j), 4), mistakeCode: 'ONE_PATH' },
    { value: round(entry(t, i, j) ** 2, 4), mistakeCode: 'ENTRY_SQUARED' },
    { value: entry(t, i, j), mistakeCode: 'ONE_STEP' },
  ];
};

/** LA102, difficulty 2: an entry of T² for a 2 × 2 transition matrix (where you are two periods later). */
export const transitionMatrixTwoStep: Generator<Params> = {
  id: 'transition-matrix-two-step',
  title: 'Two steps of a transition matrix',
  topicId: 'LA102',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['jobs', 'brands'] as const);
      const p: Params =
        context === 'jobs'
          ? { context, out: rng.int(2, 20), back: rng.int(10, 70), i: 1, j: 1 }
          : { context, out: rng.int(5, 40), back: rng.int(5, 40), i: 1, j: 1 };
      p.i = rng.pick([1, 2] as const);
      p.j = rng.pick([1, 2] as const);
      // With equal switching rates T is symmetric and multiplying rows by rows gives the answer.
      if (p.out === p.back) continue;
      // For i = j, staying put twice and squaring the entry are the same number.
      const expected = p.i === p.j ? 3 : 4;
      const kept = cleanDistractors(twoStep(p), candidates(p), PROB.tolerance, PROB.relTolerance);
      if (kept.length === expected) return p;
    }
  },

  stem(p) {
    const s = SETTING[p.context];
    const from = s.states[p.i - 1] ?? '';
    const to = s.states[p.j - 1] ?? '';
    return `${s.intro} The transition matrix $T = ${pmatrix(matrixOf(p))}$ gives the probabilities of moving between the states in one ${s.period}: row = state this ${s.period}, column = state next ${s.period}. What is the probability that ${s.who} ${from} now is ${to} two ${s.period}s from now? Give your answer to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: twoStep(p), decimals: 4, ...PROB }),

  steps(p) {
    const t = matrixOf(p);
    const s = SETTING[p.context];
    const { i, j } = p;
    const value = twoStep(p);
    return [
      {
        text: `The answer is entry (${i}, ${j}) of T².`,
        latex: `T^2 = TT, \\qquad (T^2)_{${i}${j}} = t_{${i}1}t_{1${j}} + t_{${i}2}t_{2${j}}`,
        why: `Applying T once gives the chances one ${s.period} ahead; applying it again gives two ${s.period}s ahead. Entry (${i}, ${j}) is row ${i} of T times column ${j} of T.`,
      },
      {
        text: 'Add the two routes through the middle period.',
        latex: `(T^2)_{${i}${j}} = ${dotLatex(row(t, i), column(t, j))}`,
        why: `After one ${s.period} the person is in state 1 or in state 2. Multiply the chances along each route, then add the routes because they cannot both happen.`,
      },
      {
        text: 'Compute.',
        latex: `(T^2)_{${i}${j}} = ${num(entry(t, i, 1) * entry(t, 1, j), 4)} + ${num(entry(t, i, 2) * entry(t, 2, j), 4)} = ${num(value, 4)}`,
        why: 'Each product is the probability of one route; their sum is the probability of ending in that state by either route.',
        result: value,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(twoStep(p), candidates(p), PROB.tolerance, PROB.relTolerance),
};
