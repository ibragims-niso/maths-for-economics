import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { equalsRounded, PROB } from './chain';

type Context = 'jobs' | 'brands' | 'economy';

interface Params {
  context: Context;
  /** Chance (in per cent) of moving from state 1 to state 2 in one period. */
  out: number;
  /** Chance (in per cent) of moving from state 2 to state 1 in one period. */
  back: number;
  /** The state whose long-run share is asked for. */
  j: 1 | 2;
}

const SETTING: Record<
  Context,
  {
    states: [string, string];
    period: string;
    intro: (out: string, back: string) => string;
    ask: string[];
  }
> = {
  jobs: {
    states: ['employed', 'unemployed'],
    period: 'quarter',
    intro: (out, back) =>
      `In a labour market ${out} of employed workers lose their job each quarter and ${back} of unemployed workers find one. With state 1 = employed and state 2 = unemployed,`,
    ask: [
      'What share of workers is employed in the long run?',
      'What is the long-run unemployment rate (the share of workers who are unemployed)?',
    ],
  },
  brands: {
    states: ['buying brand A', 'buying brand B'],
    period: 'month',
    intro: (out, back) =>
      `Each month ${out} of brand A's customers switch to brand B and ${back} of brand B's customers switch to brand A. With state 1 = brand A and state 2 = brand B,`,
    ask: ["What is brand A's long-run market share?", "What is brand B's long-run market share?"],
  },
  economy: {
    states: ['in a boom', 'in a recession'],
    period: 'year',
    intro: (out, back) =>
      `In a simple model a boom turns into a recession the next year with probability ${out}, and a recession turns into a boom with probability ${back}. With state 1 = boom and state 2 = recession,`,
    ask: [
      'In the long run, what fraction of years is the economy in a boom?',
      'In the long run, what fraction of years is the economy in a recession?',
    ],
  },
};

const pOf = (p: Params) => p.out / 100;
const qOf = (p: Params) => p.back / 100;
const matrixOf = (p: Params) => [
  [1 - pOf(p), pOf(p)],
  [qOf(p), 1 - qOf(p)],
];

/** π₁ = q/(p + q) and π₂ = p/(p + q): the flows between the states balance. */
const share = (p: Params, j: 1 | 2) => (j === 1 ? p.back : p.out) / (p.out + p.back);
const target = (p: Params) => round(share(p, p.j), 4);

const candidates = (p: Params) => {
  const other = p.j === 1 ? 2 : 1;
  return [
    { value: round(share(p, other), 4), mistakeCode: 'FLOWS_REVERSED' },
    {
      value: round(matrixOf(p)[p.j - 1]?.[p.j - 1] ?? Number.NaN, 4),
      mistakeCode: 'STAY_PROBABILITY',
    },
    { value: 0.5, mistakeCode: 'EQUAL_SHARES' },
    { value: round(share(p, p.j) / share(p, other), 4), mistakeCode: 'RATIO_NOT_SHARE' },
  ];
};

const percent = (x: number) => `$${num(x)}\\%$`;

/** SP01, difficulty 1: the long-run share of one state of a two-state chain, π₁ = q/(p + q). */
export const markovLongRunShareTwoState: Generator<Params> = {
  id: 'markov-long-run-share-two-state',
  title: 'Long-run share, two states',
  topicId: 'SP01',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['jobs', 'brands', 'economy'] as const);
      const p: Params =
        context === 'jobs'
          ? { context, out: rng.int(1, 10), back: rng.int(15, 60), j: 1 }
          : context === 'brands'
            ? { context, out: rng.int(5, 40), back: rng.int(5, 40), j: 1 }
            : { context, out: rng.int(5, 30), back: rng.int(15, 60), j: 1 };
      p.j = rng.pick([1, 2] as const);
      // With equal rates the long-run shares are 1/2 each, and the reversed balance gives the same.
      if (p.out === p.back) continue;
      const kept = cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance);
      if (kept.length >= 3) return p;
    }
  },

  stem(p) {
    const s = SETTING[p.context];
    return `${s.intro(percent(p.out), percent(p.back))} the transition matrix is $P = ${pmatrix(matrixOf(p))}$. ${s.ask[p.j - 1]} Give your answer as a decimal to 4 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 4, ...PROB }),

  steps(p) {
    const s = SETTING[p.context];
    const P = num(pOf(p));
    const Q = num(qOf(p));
    const exact = share(p, p.j);
    return [
      {
        text: 'In the long run the flow out of state 1 equals the flow into it.',
        latex: `\\pi_1 \\cdot ${P} = \\pi_2 \\cdot ${Q}`,
        why: `The first column of πP = π reads π₁(1 − ${P}) + π₂·${Q} = π₁. Cancelling π₁ on both sides leaves: those who leave state 1 (${P} of π₁) are replaced by those who arrive (${Q} of π₂), so the shares stop changing.`,
      },
      {
        text: 'Add the condition that the shares add up to 1.',
        latex: `\\pi_1 + \\pi_2 = 1 \\;\\Rightarrow\\; \\pi_1 = \\frac{q}{p + q}, \\quad \\pi_2 = \\frac{p}{p + q}`,
        why: `Substitute π₂ = 1 − π₁ into the balance: π₁·p = (1 − π₁)·q, so π₁(p + q) = q. Here p = ${P} is the chance of leaving state 1 and q = ${Q} the chance of leaving state 2.`,
      },
      {
        text: `Long-run share of state ${p.j} (${s.states[p.j - 1]}).`,
        latex: `\\pi_${p.j} = \\frac{${p.j === 1 ? Q : P}}{${P} + ${Q}} ${equalsRounded(exact)}`,
        why: `Each state's long-run share is the chance of entering it relative to the total of the two switching chances: the harder a state is to leave, the bigger its share.`,
        result: target(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance),
};
