import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors } from '../format';
import { dotLatex, pmatrix } from '../LA102/matrix';
import { equalsRounded, fromPercent, nextShares, PROB, sharesLatex } from './chain';

type Context = 'jobs' | 'economy' | 'brands' | 'labour';

interface Params {
  context: Context;
  /** Transition matrix in whole per cent; each row adds up to 100. */
  matrix: number[][];
  /** Shares now, in whole per cent; they add up to 100. */
  start: number[];
  /** Number of periods ahead. */
  n: 2 | 3;
  /** The state asked about (1-based). */
  j: number;
}

const SETTING: Record<
  Context,
  { states: string[]; period: string; intro: string; ask: (state: string, when: string) => string }
> = {
  jobs: {
    states: ['employed', 'unemployed'],
    period: 'quarter',
    intro:
      'Each quarter every worker in a labour market is either employed (state 1) or unemployed (state 2).',
    ask: (state, when) => `What share of workers will be ${state} ${when}?`,
  },
  economy: {
    states: ['in a boom', 'in a recession'],
    period: 'year',
    intro:
      'In a simple model an economy is either in a boom (state 1) or in a recession (state 2) each year.',
    ask: (state, when) => `What is the probability that the economy is ${state} ${when}?`,
  },
  brands: {
    states: ['brand A', 'brand B', 'brand C'],
    period: 'month',
    intro:
      'Each month every customer buys one of three brands: A (state 1), B (state 2) or C (state 3).',
    ask: (state, when) => `What will the market share of ${state} be ${when}?`,
  },
  labour: {
    states: ['employed', 'unemployed', 'inactive'],
    period: 'quarter',
    intro:
      'Each quarter every adult is employed (state 1), unemployed (state 2) or inactive, that is, not looking for work (state 3).',
    ask: (state, when) => `What share of adults will be ${state} ${when}?`,
  },
};

const matrixOf = (p: Params) => fromPercent(p.matrix);
const startOf = (p: Params) => p.start.map((x) => x / 100);

/** The shares after 0, 1, …, n periods: x₀, x₀P, x₀P², … */
function path(p: Params): number[][] {
  const m = matrixOf(p);
  const out = [startOf(p)];
  for (let k = 0; k < p.n; k++) out.push(nextShares(out[k] ?? [], m));
  return out;
}

const exactAnswer = (p: Params) => path(p)[p.n]?.[p.j - 1] ?? Number.NaN;
const target = (p: Params) => round(exactAnswer(p), 4);

/** Pⁿ by repeated multiplication. */
function power(m: number[][], n: number): number[][] {
  let out = m;
  for (let k = 1; k < n; k++) out = out.map((r) => nextShares(r, m));
  return out;
}

function candidates(p: Params) {
  const m = matrixOf(p);
  const s = startOf(p);
  const j = p.j - 1;
  const pn = power(m, p.n);
  return [
    { value: round(path(p)[1]?.[j] ?? Number.NaN, 4), mistakeCode: 'ONE_STEP' },
    {
      value: round(
        s.reduce((sum, si, i) => sum + (pn[j]?.[i] ?? 0) * si, 0),
        4,
      ),
      mistakeCode: 'WRONG_SIDE',
    },
    {
      value: round(
        s.reduce((sum, si, i) => sum + si * (m[i]?.[j] ?? 0) ** p.n, 0),
        4,
      ),
      mistakeCode: 'ENTRY_POWER',
    },
  ];
}

/** Splits 100 − stay into two positive whole numbers. */
function row3(rng: { int(a: number, b: number): number }, stay: number, at: number): number[] {
  const rest = 100 - stay;
  const first = rng.int(1, rest - 1);
  const others = [first, rest - first];
  return at === 0
    ? [stay, ...others]
    : at === 1
      ? [others[0] ?? 0, stay, others[1] ?? 0]
      : [...others, stay];
}

/** SP01, difficulty 2: the share in one state 2 or 3 periods ahead, from a starting distribution. */
export const markovShareAfterSteps: Generator<Params> = {
  id: 'markov-share-after-steps',
  title: 'Shares a few periods ahead',
  topicId: 'SP01',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['jobs', 'economy', 'brands', 'labour'] as const);
      let p: Params;
      if (context === 'jobs') {
        const s = rng.int(2, 10);
        const f = rng.int(20, 60);
        const u = rng.int(4, 30);
        p = {
          context,
          matrix: [
            [100 - s, s],
            [f, 100 - f],
          ],
          start: [100 - u, u],
          n: rng.pick([2, 3] as const),
          j: rng.int(1, 2),
        };
      } else if (context === 'economy') {
        const out = rng.int(5, 30);
        const back = rng.int(20, 60);
        const boom = 10 * rng.int(2, 9);
        p = {
          context,
          matrix: [
            [100 - out, out],
            [back, 100 - back],
          ],
          start: [boom, 100 - boom],
          n: rng.pick([2, 3] as const),
          j: rng.int(1, 2),
        };
      } else if (context === 'brands') {
        const a = 5 * rng.int(3, 10);
        const b = 5 * rng.int(3, 10);
        p = {
          context,
          matrix: [
            row3(rng, rng.int(60, 90), 0),
            row3(rng, rng.int(60, 90), 1),
            row3(rng, rng.int(60, 90), 2),
          ],
          start: [a, b, 100 - a - b],
          n: 2,
          j: rng.int(1, 3),
        };
        if (100 - a - b < 15) continue;
      } else {
        const e = rng.int(55, 70);
        const u = rng.int(3, 10);
        const eu = rng.int(1, 5);
        const ei = rng.int(1, 5);
        const ue = rng.int(20, 50);
        const ui = rng.int(5, 20);
        const ie = rng.int(2, 10);
        const iu = rng.int(1, 5);
        p = {
          context,
          matrix: [
            [100 - eu - ei, eu, ei],
            [ue, 100 - ue - ui, ui],
            [ie, iu, 100 - ie - iu],
          ],
          start: [e, u, 100 - e - u],
          n: 2,
          j: rng.int(1, 3),
        };
      }
      const kept = cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem(p) {
    const s = SETTING[p.context];
    const when = `${p.n === 2 ? 'two' : 'three'} ${s.period}s from now`;
    const names = s.states.map((x) => x.replace(/^in an? /, '')).join(', ');
    return `${s.intro} The transition matrix is $P = ${pmatrix(matrixOf(p))}$ (row = state this ${s.period}, column = state next ${s.period}), and the distribution now is $x_0 = ${sharesLatex(startOf(p), 2)}$ (${names}). ${s.ask(s.states[p.j - 1] ?? '', when)} Give your answer as a decimal to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 4, ...PROB }),

  steps(p) {
    const s = SETTING[p.context];
    const m = matrixOf(p);
    const shares = path(p);
    const j = p.j - 1;
    const column = m.map((r) => r[j] ?? 0);
    const steps: Step[] = [
      {
        text: `Move the distribution forward one ${s.period} at a time: multiply the row vector by P.`,
        latex: `x_{k+1} = x_k P, \\qquad x_${p.n} = x_0 P^${p.n}`,
        why: `Entry m of xP collects everyone who ends up in state m: the share in each state now times the chance of moving from there to m, added over all the states.`,
      },
    ];
    for (let k = 1; k < p.n; k++) {
      steps.push({
        text: `Shares after ${k} ${s.period}${k === 1 ? '' : 's'}.`,
        latex: `x_${k} = x_${k - 1} P = ${sharesLatex(shares[k] ?? [])}`,
        why: `Each entry is the row vector x${k === 1 ? '₀' : '₁'} times one column of P. The entries still add up to 1, because everyone is in exactly one state.`,
        result: shares[k]?.[j],
      });
    }
    const before = shares[p.n - 1] ?? [];
    steps.push({
      text: `Share in state ${p.j} (${s.states[j]}) after ${p.n} ${s.period}s: x${p.n === 2 ? '₁' : '₂'} times column ${p.j} of P.`,
      latex: `(x_${p.n})_${p.j} = ${dotLatex(before, column, 6)} ${equalsRounded(exactAnswer(p))}`,
      why: `Column ${p.j} of P holds the chances of moving into state ${p.j} from each state, so this adds up all the routes into it.`,
      result: target(p),
    });
    return steps;
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance),
};
