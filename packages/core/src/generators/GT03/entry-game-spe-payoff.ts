import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { describeEntryGame, drawEntryGame, type EntryGame } from './entry';

interface Params {
  game: EntryGame;
  /** Whose subgame-perfect payoff the question asks for. */
  asked: 'entrant' | 'incumbent';
}

/** True when the incumbent would really fight after entry. */
const fights = (g: EntryGame) => g.fight > g.accommodate;

/** Subgame-perfect payoffs (entrant, incumbent), found by backward induction. */
function spe(g: EntryGame): [number, number] {
  if (fights(g)) return [0, g.monopoly];
  return [g.share, g.accommodate];
}

const target = (p: Params) => spe(p.game)[p.asked === 'entrant' ? 0 : 1];

function candidates(p: Params): Distractor[] {
  const g = p.game;
  const [e, i] = spe(g);
  const other = { value: p.asked === 'entrant' ? i : e, mistakeCode: 'WRONG_PLAYER' };
  if (fights(g)) {
    return p.asked === 'entrant'
      ? [
          { value: g.share, mistakeCode: 'ALWAYS_ACCOMMODATE' },
          { value: -g.loss, mistakeCode: 'NOT_FOLDED_BACK' },
          other,
        ]
      : [
          { value: g.accommodate, mistakeCode: 'ALWAYS_ACCOMMODATE' },
          { value: g.fight, mistakeCode: 'NOT_FOLDED_BACK' },
          other,
        ];
  }
  return p.asked === 'entrant'
    ? [
        { value: 0, mistakeCode: 'NON_CREDIBLE_THREAT' },
        { value: -g.loss, mistakeCode: 'THREAT_CARRIED_OUT' },
        other,
      ]
    : [
        { value: g.monopoly, mistakeCode: 'NON_CREDIBLE_THREAT' },
        { value: g.fight, mistakeCode: 'THREAT_CARRIED_OUT' },
        other,
      ];
}

/** GT03, difficulty 1: a player's payoff in the subgame-perfect equilibrium of an entry game. */
export const entryGameSpePayoff: Generator<Params> = {
  id: 'entry-game-spe-payoff',
  title: 'Entry game by backward induction',
  topicId: 'GT03',
  difficulty: 1,
  timeSec: 90,

  params: (rng) => ({
    // About one game in three has a credible threat, so students cannot assume either answer.
    game: drawEntryGame(rng, rng.int(0, 2) === 0),
    asked: rng.pick(['entrant', 'incumbent'] as const),
  }),

  stem: (p) =>
    `${describeEntryGame(p.game)} Using backward induction, how much does the ${p.asked} earn in the subgame-perfect equilibrium? Give a whole number (in millions).`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0 }),

  steps: (p) => {
    const g = p.game;
    const fight = fights(g);
    const enterPays = fight ? -g.loss : g.share;
    const enters = enterPays > 0;
    const [e, i] = spe(g);
    return [
      {
        text: 'Start at the last decision: after entry, the incumbent compares fighting with accommodating.',
        latex: `\\text{Fight: } ${num(g.fight)} \\quad \\text{Accommodate: } ${num(g.accommodate)} \\;\\Rightarrow\\; \\text{${fight ? 'Fight' : 'Accommodate'}}`,
        why: fight
          ? 'Once the entrant is in, a price war pays the incumbent more than sharing the market, so the threat to fight would really be carried out.'
          : 'Once the entrant is in, fighting only lowers the incumbent’s own profit, so a threat to fight would not be carried out: it is not credible.',
        result: Math.max(g.fight, g.accommodate),
      },
      {
        text: 'Move back to the entrant, who foresees that choice and compares entering with staying out.',
        latex: `\\text{In: } ${num(enterPays)} \\quad \\text{Out: } 0 \\;\\Rightarrow\\; \\text{${enters ? 'In' : 'Out'}}`,
        why: fight
          ? 'Entering would be met by a price war and a loss, so the entrant is better off staying out.'
          : 'The entrant knows the incumbent will accommodate, so entering earns a positive profit, more than the 0 of staying out.',
        result: enterPays,
      },
      {
        text: `Read the ${p.asked}’s payoff at the end of the equilibrium path.`,
        latex: `(\\text{entrant}, \\text{incumbent}) = (${num(e)},\\ ${num(i)})`,
        why: 'The subgame-perfect equilibrium is the path that backward induction picks out; its end point gives both payoffs, the entrant’s first.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p)),
};
