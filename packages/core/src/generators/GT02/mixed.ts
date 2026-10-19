import type { Rng } from '../../engine/rng';
import { num } from '../format';
import { type Bimatrix, drawGame, payA, payB, pureEquilibria, strictReplies } from '../GT01/game';

/** What the two firms choose in a 2×2 game with no pure equilibrium; the labels name both choices. */
export type MixedContext = 'promotion' | 'price' | 'advertising' | 'launch';

export const MIXED_CONTEXTS: Readonly<
  Record<MixedContext, { intro: string; labels: [string, string] }>
> = {
  promotion: {
    intro:
      'Two supermarket chains, A and B, each decide whether to run a price promotion this week without seeing the other’s choice.',
    labels: ['Promote', 'Regular'],
  },
  price: {
    intro: 'Two firms, A and B, each set a price without seeing the other’s choice.',
    labels: ['Low', 'High'],
  },
  advertising: {
    intro: 'Two firms, A and B, each choose an advertising budget at the same time.',
    labels: ['None', 'Heavy'],
  },
  launch: {
    intro: 'Two phone makers, A and B, each choose when to launch their new model.',
    labels: ['Early', 'Late'],
  },
};

/**
 * The mixed-strategy equilibrium of a 2×2 game with no pure equilibrium:
 * `p` = probability that A plays its first row, chosen so that B is indifferent between columns;
 * `q` = probability that B plays its first column, chosen so that A is indifferent between rows.
 */
export function mixedEquilibrium(g: Bimatrix): { p: number; q: number } {
  const [b11, b12, b21, b22] = [payB(g, 0, 0), payB(g, 0, 1), payB(g, 1, 0), payB(g, 1, 1)];
  const [a11, a12, a21, a22] = [payA(g, 0, 0), payA(g, 0, 1), payA(g, 1, 0), payA(g, 1, 1)];
  return {
    p: (b22 - b21) / (b11 - b21 - b12 + b22),
    q: (a22 - a12) / (a11 - a12 - a21 + a22),
  };
}

/** Each firm's expected profit in the mixed equilibrium (equal to its profit from either choice). */
export function mixedPayoffs(g: Bimatrix): { a: number; b: number } {
  const { p, q } = mixedEquilibrium(g);
  return {
    a: q * payA(g, 0, 0) + (1 - q) * payA(g, 0, 1),
    b: p * payB(g, 0, 0) + (1 - p) * payB(g, 1, 0),
  };
}

/** A 2×2 game with whole payoffs 0–`max`, strict best replies and no pure-strategy equilibrium. */
export function drawCyclicGame(rng: Rng, max = 9): Bimatrix {
  for (;;) {
    const game = drawGame(rng, 2, max);
    if (strictReplies(game) && pureEquilibria(game).length === 0) return game;
  }
}

/**
 * The indifference equation of the player who is NOT mixing with `x`: its expected payoff from
 * its first choice equals that from its second, when the mixing player picks its first choice
 * with probability x. `who` is the indifferent player.
 */
export function indifferenceLatex(
  g: Bimatrix,
  who: 'A' | 'B',
  labels: readonly string[],
  x: string,
): string {
  const [u11, u12, u21, u22] =
    who === 'B'
      ? [payB(g, 0, 0), payB(g, 1, 0), payB(g, 0, 1), payB(g, 1, 1)]
      : [payA(g, 0, 0), payA(g, 0, 1), payA(g, 1, 0), payA(g, 1, 1)];
  const side = (first: number, second: number, label: string | undefined) =>
    `\\underbrace{${num(first)} \\cdot ${x} + ${num(second)}(1 - ${x})}_{\\text{${who}: ${label}}}`;
  return `${side(u11, u12, labels[0])} = ${side(u21, u22, labels[1])}`;
}

/**
 * Solving the indifference equation u11·x + u12(1 − x) = u21·x + u22(1 − x):
 * x = (u22 − u12)/((u11 − u12) − (u21 − u22)), written with a positive denominator.
 */
export function solveLatex(
  g: Bimatrix,
  who: 'A' | 'B',
  x: string,
  value: number,
  decimals: number,
): string {
  const [u11, u12, u21, u22] =
    who === 'B'
      ? [payB(g, 0, 0), payB(g, 1, 0), payB(g, 0, 1), payB(g, 1, 1)]
      : [payA(g, 0, 0), payA(g, 0, 1), payA(g, 1, 0), payA(g, 1, 1)];
  let top = u22 - u12;
  let bottom = u11 - u12 - u21 + u22;
  if (bottom < 0) {
    top = -top;
    bottom = -bottom;
  }
  const exact = (top * 10 ** decimals) % bottom === 0;
  return `${x} = \\frac{${num(top)}}{${num(bottom)}} ${exact ? '=' : '\\approx'} ${num(value, decimals)}`;
}
