import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  type Bimatrix,
  bestColsLatex,
  bestRowsLatex,
  bimatrixLatex,
  cellName,
  drawGame,
  GAME_CONTEXTS,
  type GameContext,
  jointBestCell,
  maximinCell,
  payA,
  payB,
  pureEquilibria,
  size,
  strictReplies,
} from './game';

interface Params {
  context: GameContext;
  /** A 2×2 or 3×3 game with strict best replies and exactly one pure Nash equilibrium. */
  game: Bimatrix;
  /** Whose profit the question asks for. */
  asked: 'A' | 'B';
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const labels = (p: Params) => GAME_CONTEXTS[p.context].labels[size(p.game) as 2 | 3];
const equilibrium = (p: Params) => pureEquilibria(p.game)[0] ?? [0, 0];
const pay = (p: Params, who: 'A' | 'B', [r, c]: [number, number]) =>
  who === 'A' ? payA(p.game, r, c) : payB(p.game, r, c);
const target = (p: Params) => pay(p, p.asked, equilibrium(p));

function candidates(p: Params): Distractor[] {
  const other = p.asked === 'A' ? 'B' : 'A';
  const own = (p.asked === 'A' ? p.game.a : p.game.b).flat();
  const joint = jointBestCell(p.game);
  const cautious = maximinCell(p.game);
  return [
    { value: pay(p, other, equilibrium(p)), mistakeCode: 'WRONG_PLAYER' },
    ...(joint ? [{ value: pay(p, p.asked, joint), mistakeCode: 'PARETO_NOT_NASH' }] : []),
    ...(cautious ? [{ value: pay(p, p.asked, cautious), mistakeCode: 'MAXIMIN_CELL' }] : []),
    { value: Math.max(...own), mistakeCode: 'ONE_PLAYER_ONLY' },
  ];
}

/** GT01, difficulty 1: one firm's profit at the unique pure Nash equilibrium of a 2×2 or 3×3 game. */
export const bimatrixNashPayoff: Generator<Params> = {
  id: 'bimatrix-nash-payoff',
  title: 'Profit at the Nash equilibrium',
  topicId: 'GT01',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['price', 'advertising', 'capacity', 'standard'] as const);
      const n = rng.pick([2, 3, 3]);
      const game = drawGame(rng, n, n === 2 ? 9 : 12);
      if (!strictReplies(game) || pureEquilibria(game).length !== 1) continue;
      const joint = jointBestCell(game);
      const ne = pureEquilibria(game)[0];
      // The best cell for the two together must not be the equilibrium: the lesson of the topic.
      if (!joint || !ne || (joint[0] === ne[0] && joint[1] === ne[1])) continue;
      if (!maximinCell(game)) continue;
      const p: Params = { context, game, asked: rng.pick(['A', 'B'] as const) };
      const kept = cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length >= 3) return p;
    }
  },

  stem: (p) =>
    `${GAME_CONTEXTS[p.context].intro} Each cell shows (profit of A, profit of B) in thousands: $${bimatrixLatex(p.game, labels(p))}$ The game has exactly one pure-strategy Nash equilibrium. What is firm ${p.asked}'s profit there, in thousands?`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps: (p) => [
    {
      text: 'For each choice of B (each column), find the row that pays A the most.',
      latex: bestRowsLatex(p.game, labels(p)),
      why: 'A takes B’s choice as given and compares the first numbers down that column; mark the largest.',
    },
    {
      text: 'For each choice of A (each row), find the column that pays B the most.',
      latex: bestColsLatex(p.game, labels(p)),
      why: 'B takes A’s choice as given and compares the second numbers along that row; mark the largest.',
    },
    {
      text: `Find the cell where both are marked and read firm ${p.asked}'s profit.`,
      latex: `${cellName(labels(p), equilibrium(p))}:\\ (${num(pay(p, 'A', equilibrium(p)))},\\ ${num(pay(p, 'B', equilibrium(p)))})`,
      why: `In this cell each firm's choice is a best reply to the other's, so neither gains by switching alone. Firm ${p.asked}'s profit is the ${p.asked === 'A' ? 'first' : 'second'} number.`,
      result: target(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
