import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { type Bimatrix, bimatrixLatex, payA, payB } from '../GT01/game';
import {
  drawCyclicGame,
  indifferenceLatex,
  MIXED_CONTEXTS,
  type MixedContext,
  mixedEquilibrium,
  mixedPayoffs,
  solveLatex,
} from './mixed';

interface Params {
  context: MixedContext;
  /** A 2×2 game with strict best replies and no pure-strategy equilibrium. */
  game: Bimatrix;
  /** Whose expected profit the question asks for. */
  asked: 'A' | 'B';
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;
const DECIMALS = 2;
const PROB_DECIMALS = 3;

const labels = (p: Params) => MIXED_CONTEXTS[p.context].labels;
const pay = (p: Params, who: 'A' | 'B', r: number, c: number) =>
  who === 'A' ? payA(p.game, r, c) : payB(p.game, r, c);
const exact = (p: Params) => mixedPayoffs(p.game)[p.asked === 'A' ? 'a' : 'b'];
const target = (p: Params) => round(exact(p), DECIMALS);

/** The asked firm's expected profit when the row and column probabilities are swapped. */
function swappedMixes(p: Params): number {
  const { p: pA, q: qB } = mixedEquilibrium(p.game);
  const row = [qB, 1 - qB];
  const col = [pA, 1 - pA];
  let total = 0;
  for (const r of [0, 1])
    for (const c of [0, 1]) total += (row[r] ?? 0) * (col[c] ?? 0) * pay(p, p.asked, r, c);
  return total;
}

function candidates(p: Params): Distractor[] {
  const other = p.asked === 'A' ? 'B' : 'A';
  const own = (p.asked === 'A' ? p.game.a : p.game.b).flat();
  return [
    {
      value: round(mixedPayoffs(p.game)[other === 'A' ? 'a' : 'b'], DECIMALS),
      mistakeCode: 'WRONG_PLAYER',
    },
    { value: round(swappedMixes(p), DECIMALS), mistakeCode: 'OWN_INDIFFERENCE' },
    {
      value: round(own.reduce((s, x) => s + x, 0) / own.length, DECIMALS),
      mistakeCode: 'SIMPLE_AVERAGE',
    },
  ];
}

/** GT02, difficulty 3: one firm's expected profit in the mixed-strategy equilibrium of a 2×2 game. */
export const mixedEquilibriumExpectedPayoff: Generator<Params> = {
  id: 'mixed-equilibrium-expected-payoff',
  title: 'Expected profit in a mixed equilibrium',
  topicId: 'GT02',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['promotion', 'price', 'advertising', 'launch'] as const);
      const game = drawCyclicGame(rng);
      const p: Params = { context, game, asked: rng.pick(['A', 'B'] as const) };
      const kept = cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `${MIXED_CONTEXTS[p.context].intro} Each cell shows (profit of A, profit of B) in thousands: $${bimatrixLatex(p.game, labels(p))}$ The game has no pure-strategy equilibrium. What is firm ${p.asked}'s expected profit in the mixed-strategy equilibrium, in thousands? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: DECIMALS, ...EXACT }),

  steps: (p) => {
    const other = p.asked === 'A' ? 'B' : 'A';
    // The rival's probability of its first choice makes the asked firm indifferent.
    const x = p.asked === 'A' ? 'q' : 'p';
    const { p: pA, q: qB } = mixedEquilibrium(p.game);
    const mix = p.asked === 'A' ? qB : pA;
    const shown = round(mix, PROB_DECIMALS);
    // The asked firm's profit from its first choice, against the rival's mix.
    const first =
      p.asked === 'A'
        ? [payA(p.game, 0, 0), payA(p.game, 0, 1)]
        : [payB(p.game, 0, 0), payB(p.game, 1, 0)];
    return [
      {
        text: `Let ${x} be the probability that ${other} chooses ${labels(p)[0]}. It must make ${p.asked} indifferent between its two choices.`,
        latex: indifferenceLatex(p.game, p.asked, labels(p), x),
        why: `${p.asked}’s expected profit depends on how ${other} mixes. In equilibrium ${other} mixes so that ${p.asked} gains nothing by favouring either choice.`,
      },
      {
        text: `Solve for ${x}.`,
        latex: solveLatex(p.game, p.asked, x, shown, PROB_DECIMALS),
        why: 'Collect the terms in the probability on one side of the equation.',
        result: shown,
      },
      {
        text: `${p.asked}’s expected profit is its profit from ${labels(p)[0]} against this mix.`,
        latex: `${num(first[0] ?? 0)} \\cdot ${x} + ${num(first[1] ?? 0)}(1 - ${x}) ${Math.abs(exact(p) - target(p)) < 1e-9 ? '=' : '\\approx'} ${num(target(p), DECIMALS)}`,
        why: `Because ${p.asked} is indifferent, both of its choices (and any mix of them) give the same expected profit, so either one can be used. Keep ${x} unrounded until the end.`,
        result: target(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
