import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { describeEntryGame, drawEntryGame, type EntryGame, minus } from './entry';

interface Params {
  /** An entry game whose threat to fight is NOT credible on its own (fight < accommodate). */
  game: EntryGame;
  /**
   * penalty: the smallest penalty for accommodating that makes the threat credible;
   * cost: the largest upfront cost worth paying for a commitment to fight.
   */
  ask: 'penalty' | 'cost';
}

const target = (p: Params) =>
  p.ask === 'penalty' ? p.game.accommodate - p.game.fight : p.game.monopoly - p.game.accommodate;

function candidates(p: Params): Distractor[] {
  const g = p.game;
  if (p.ask === 'penalty')
    return [
      { value: g.monopoly - g.fight, mistakeCode: 'COMPARED_WITH_MONOPOLY' },
      { value: g.accommodate, mistakeCode: 'WHOLE_PROFIT' },
      { value: g.monopoly - g.accommodate, mistakeCode: 'COMMITMENT_MIXUP' },
    ];
  return [
    { value: g.monopoly - g.fight, mistakeCode: 'COMPARED_WITH_FIGHT' },
    { value: g.monopoly, mistakeCode: 'WHOLE_PROFIT' },
    { value: g.accommodate - g.fight, mistakeCode: 'COMMITMENT_MIXUP' },
  ];
}

const QUESTION = {
  penalty:
    'Before the entrant decides, the incumbent can sign a binding contract with a third party under which it must pay a penalty $P$ if it ever accommodates entry. What is the smallest penalty $P$ that makes the threat to fight credible? Assume that an incumbent which is indifferent fights. Give a whole number (in millions).',
  cost: 'Before the entrant decides, the incumbent can sign a binding contract that obliges it to fight if entry happens. Arranging the contract costs $K$ up front, paid whatever happens next. What is the largest $K$ for which signing is worthwhile? Give a whole number (in millions).',
} as const;

/** GT03, difficulty 2: the commitment that makes an entry threat credible, or what it is worth. */
export const entryCommitmentThreshold: Generator<Params> = {
  id: 'entry-commitment-threshold',
  title: 'Making a threat credible',
  topicId: 'GT03',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        game: drawEntryGame(rng, false),
        ask: rng.pick(['penalty', 'cost'] as const),
      };
      // Keep only games where every mistake gives its own wrong answer.
      if (cleanDistractors(target(p), candidates(p)).length === 3) return p;
    }
  },

  stem: (p) => `${describeEntryGame(p.game)} ${QUESTION[p.ask]}`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0 }),

  steps: (p) => {
    const g = p.game;
    if (p.ask === 'penalty')
      return [
        {
          text: 'With the contract, compare the incumbent’s two choices after entry.',
          latex: `\\text{Fight: } ${num(g.fight)} \\quad \\text{Accommodate: } ${num(g.accommodate)} - P`,
          why: 'The penalty is paid only if the incumbent accommodates, so it lowers that branch alone and leaves the payoff from fighting unchanged.',
        },
        {
          text: 'The threat is credible when fighting pays at least as much; solve for P.',
          latex: `${num(g.fight)} \\ge ${num(g.accommodate)} - P \\;\\Rightarrow\\; P \\ge ${minus(g.accommodate, g.fight)} = ${num(target(p))}`,
          why: 'Backward induction only believes a threat that the incumbent would want to carry out once entry has happened.',
          result: target(p),
        },
        {
          text: 'Check that the entrant now stays out.',
          latex: `\\text{In: } ${num(-g.loss)} < \\text{Out: } 0`,
          why: `Facing a credible price war the entrant would lose, so it stays out; the incumbent keeps ${num(g.monopoly)} and never pays the penalty.`,
        },
      ];
    const steps: Step[] = [
      {
        text: 'Without the contract, solve the game by backward induction.',
        latex: `\\text{Fight: } ${num(g.fight)} < \\text{Accommodate: } ${num(g.accommodate)} \\;\\Rightarrow\\; \\text{the entrant enters}`,
        why: 'After entry, fighting would lower the incumbent’s profit, so the entrant expects accommodation and enters; the incumbent earns the accommodation profit.',
        result: g.accommodate,
      },
      {
        text: 'With the contract, the entrant expects a price war and stays out.',
        latex: `\\text{In: } ${num(-g.loss)} < \\text{Out: } 0 \\;\\Rightarrow\\; \\text{incumbent earns } ${num(g.monopoly)} - K`,
        why: 'The upfront cost is paid whatever happens, but in return the incumbent keeps the market to itself.',
      },
      {
        text: 'Signing is worthwhile if it leaves the incumbent at least as well off.',
        latex: `${num(g.monopoly)} - K \\ge ${num(g.accommodate)} \\;\\Rightarrow\\; K \\le ${num(target(p))}`,
        why: 'The right comparison is with what the incumbent gets without commitment (accommodation), not with the price war, which never happens in either case.',
        result: target(p),
      },
    ];
    return steps;
  },

  distractors: (p) => cleanDistractors(target(p), candidates(p)),
};
