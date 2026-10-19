import type { Rng } from '../../engine/rng';
import { num } from '../format';

/**
 * An entry game. The entrant moves first, In or Out; after entry the incumbent fights (a price
 * war) or accommodates (shares the market). Payoffs are profits in millions, all multiples of 5.
 */
export interface EntryGame {
  /** Incumbent's profit if the entrant stays out (the entrant then earns 0). */
  monopoly: number;
  /** Incumbent's profit if it accommodates entry. */
  accommodate: number;
  /** Incumbent's profit if it fights entry; never equal to `accommodate`. */
  fight: number;
  /** Entrant's profit if the incumbent accommodates (> 0). */
  share: number;
  /** Entrant's loss if the incumbent fights, as a positive number. */
  loss: number;
}

/**
 * Draws an entry game. With `credible`, fighting pays the incumbent more than accommodating
 * (but less than keeping the market to itself); otherwise fighting pays less.
 */
export function drawEntryGame(rng: Rng, credible: boolean): EntryGame {
  const monopoly = rng.int(16, 40) * 5;
  const accommodate = rng.int(4, monopoly / 5 - 4) * 5;
  const fight = credible
    ? rng.int(accommodate / 5 + 1, monopoly / 5 - 1) * 5
    : rng.int(-8, accommodate / 5 - 1) * 5;
  return { monopoly, accommodate, fight, share: rng.int(2, 12) * 5, loss: rng.int(1, 8) * 5 };
}

/** The game in words, for a stem. */
export const describeEntryGame = (g: EntryGame) =>
  `A firm (the entrant) is deciding whether to enter a market held by an incumbent. If it stays out, it earns $0$ and the incumbent earns $${num(g.monopoly)}$. If it enters, the incumbent either fights with a price war (the entrant earns $${num(-g.loss)}$ and the incumbent $${num(g.fight)}$) or accommodates and shares the market (the entrant earns $${num(g.share)}$ and the incumbent $${num(g.accommodate)}$). Payoffs are profits in millions.`;

/** "a − b" in LaTeX, written as "a + |b|" when b is negative. */
export const minus = (a: number, b: number) =>
  b < 0 ? `${num(a)} + ${num(-b)}` : `${num(a)} - ${num(b)}`;
