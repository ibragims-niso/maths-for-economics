import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors } from '../format';
import { type Bimatrix, bestColsLatex, bestRowsLatex, bimatrixLatex } from '../GT01/game';
import {
  drawCyclicGame,
  indifferenceLatex,
  MIXED_CONTEXTS,
  type MixedContext,
  mixedEquilibrium,
  solveLatex,
} from './mixed';

interface Params {
  context: MixedContext;
  /** A 2×2 game with strict best replies and no pure-strategy equilibrium. */
  game: Bimatrix;
  /** Whose probability of playing its first choice the question asks for. */
  asked: 'A' | 'B';
}

const PROB = { tolerance: 0.001, relTolerance: 0 } as const;
const DECIMALS = 3;

const labels = (p: Params) => MIXED_CONTEXTS[p.context].labels;
/** The asked firm's probability comes from the OTHER firm's indifference. */
const exact = (p: Params) => {
  const { p: pA, q: qB } = mixedEquilibrium(p.game);
  return p.asked === 'A' ? pA : qB;
};
/** The classic mix-up: the probability that makes the asked firm itself indifferent. */
const ownIndifference = (p: Params) => {
  const { p: pA, q: qB } = mixedEquilibrium(p.game);
  return p.asked === 'A' ? qB : pA;
};
const target = (p: Params) => round(exact(p), DECIMALS);

function candidates(p: Params): Distractor[] {
  return [
    { value: round(ownIndifference(p), DECIMALS), mistakeCode: 'OWN_INDIFFERENCE' },
    { value: round(1 - exact(p), DECIMALS), mistakeCode: 'COMPLEMENT' },
    { value: 0.5, mistakeCode: 'EQUAL_SPLIT' },
  ];
}

/** GT02, difficulty 2: the probability that a firm plays its first choice in the mixed equilibrium of a 2×2 game. */
export const mixedEquilibriumProbability: Generator<Params> = {
  id: 'mixed-equilibrium-probability',
  title: 'Mixing probability in equilibrium',
  topicId: 'GT02',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['promotion', 'price', 'advertising', 'launch'] as const);
      const game = drawCyclicGame(rng);
      const p: Params = { context, game, asked: rng.pick(['A', 'B'] as const) };
      const kept = cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `${MIXED_CONTEXTS[p.context].intro} Each cell shows (profit of A, profit of B) in thousands: $${bimatrixLatex(p.game, labels(p))}$ The game has no pure-strategy equilibrium. In its mixed-strategy equilibrium, with what probability does firm ${p.asked} choose ${labels(p)[0]}? Give your answer to 3 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: DECIMALS, ...PROB }),

  steps: (p) => {
    const other = p.asked === 'A' ? 'B' : 'A';
    const x = p.asked === 'A' ? 'p' : 'q';
    return [
      {
        text: 'Find A’s best reply to each choice of B.',
        latex: bestRowsLatex(p.game, labels(p)),
        why: 'Compare A’s profits (first numbers) down each column, as in GT01.',
      },
      {
        text: 'Find B’s best reply to each choice of A: the replies go round in a circle, so no cell is an equilibrium.',
        latex: bestColsLatex(p.game, labels(p)),
        why: 'In every cell one firm would rather switch, so each firm must keep the other guessing by randomising.',
      },
      {
        text: `Let ${x} be the probability that ${p.asked} chooses ${labels(p)[0]}. Make ${other} indifferent between its two choices.`,
        latex: indifferenceLatex(p.game, other, labels(p), x),
        why: `${other} mixes only if both its choices give the same expected profit. ${p.asked}’s probability is what makes this happen, so it is found from ${other}’s payoffs, not from ${p.asked}’s own.`,
      },
      {
        text: `Solve for ${x}.`,
        latex: solveLatex(p.game, other, x, target(p), DECIMALS),
        why: 'Collect the terms in the probability on one side; the answer lies strictly between 0 and 1, as a probability must.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance),
};
