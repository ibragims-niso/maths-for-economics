import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors } from '../format';
import {
  type Bimatrix,
  bestColsLatex,
  bestRows,
  bestRowsLatex,
  bimatrixLatex,
  cellName,
  dominantCol,
  dominantRow,
  drawGame,
  GAME_CONTEXTS,
  type GameContext,
  pureEquilibria,
  strictReplies,
  underlinedCells,
} from './game';

interface Params {
  context: GameContext;
  /** A 2×2 game with strict best replies; it has 0, 1 or 2 pure Nash equilibria. */
  game: Bimatrix;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const labels = (p: Params) => GAME_CONTEXTS[p.context].labels[2];
const target = (p: Params) => pureEquilibria(p.game).length;

function candidates(p: Params): Distractor[] {
  const bothDominant = dominantRow(p.game) !== undefined && dominantCol(p.game) !== undefined;
  // Cells where A is best-responding: one per column.
  const aMarked = [0, 1].map((c) => bestRows(p.game, c).length).reduce((s, k) => s + k, 0);
  return [
    { value: underlinedCells(p.game).length, mistakeCode: 'ANY_UNDERLINE' },
    { value: aMarked, mistakeCode: 'ONE_PLAYER_ONLY' },
    { value: 1, mistakeCode: 'ALWAYS_ONE' },
    { value: bothDominant ? 1 : 0, mistakeCode: 'DOMINANT_ONLY' },
  ];
}

/** GT01, difficulty 2: the number of pure-strategy Nash equilibria (0, 1 or 2) of a 2×2 game. */
export const pureNashCount: Generator<Params> = {
  id: 'pure-nash-count',
  title: 'How many pure Nash equilibria?',
  topicId: 'GT01',
  difficulty: 2,
  timeSec: 90,

  params(rng) {
    // Choose the answer first, so 0, 1 and 2 are equally likely.
    const want = rng.int(0, 2);
    for (;;) {
      const context = rng.pick(['price', 'advertising', 'capacity', 'standard'] as const);
      const game = drawGame(rng, 2, 9);
      if (strictReplies(game) && pureEquilibria(game).length === want) return { context, game };
    }
  },

  stem: (p) =>
    `${GAME_CONTEXTS[p.context].intro} Each cell shows (profit of A, profit of B): $${bimatrixLatex(p.game, labels(p))}$ How many pure-strategy Nash equilibria does this game have?`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps: (p) => {
    const cells = pureEquilibria(p.game);
    return [
      {
        text: 'For each choice of B, find A’s best reply.',
        latex: bestRowsLatex(p.game, labels(p)),
        why: 'Compare A’s payoffs (first numbers) down each column and mark the larger one.',
      },
      {
        text: 'For each choice of A, find B’s best reply.',
        latex: bestColsLatex(p.game, labels(p)),
        why: 'Compare B’s payoffs (second numbers) along each row and mark the larger one.',
      },
      {
        text: 'Count the cells where both payoffs are marked.',
        latex:
          cells.length === 0
            ? `\\text{no cell has both marks} \\Rightarrow 0`
            : `${cells.map((c) => cellName(labels(p), c)).join(',\\ ')} \\Rightarrow ${cells.length}`,
        why:
          cells.length === 0
            ? 'In every cell one firm would rather switch, so there is no pure-strategy equilibrium. An equilibrium still exists in mixed strategies (GT02).'
            : 'Only where both are marked is each firm’s choice a best reply to the other’s, so neither gains by switching alone.',
        result: cells.length,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
