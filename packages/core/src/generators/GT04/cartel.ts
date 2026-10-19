import { type Bimatrix, bimatrixLatex } from '../GT01/game';

/**
 * The payoffs of a cartel stage game shaped like a prisoner's dilemma, T > R > P > S:
 * R (reward) if both collude, T (temptation) for cheating on a colluding rival,
 * S (sucker) for colluding while the rival cheats, P (punishment) if both cheat.
 */
export interface StagePayoffs {
  R: number;
  S: number;
  T: number;
  P: number;
}

export const CARTEL_LABELS = ['Collude', 'Cheat'] as const;

/** Who forms the cartel; the stems read "Two <industry> form a cartel …". */
export const CARTEL_INDUSTRIES = [
  'cement producers',
  'airlines on the same route',
  'mobile operators',
  'petrol stations on the same road',
  'bread bakeries in one town',
] as const;
export type CartelIndustry = (typeof CARTEL_INDUSTRIES)[number];

/** The symmetric 2×2 game: A's choices are the rows, B's the columns. */
export function cartelGame({ R, S, T, P }: StagePayoffs): Bimatrix {
  return {
    a: [
      [R, S],
      [T, P],
    ],
    b: [
      [R, T],
      [S, P],
    ],
  };
}

/** The payoff table in LaTeX, cells "(A's profit, B's profit)". */
export const cartelLatex = (s: StagePayoffs) => bimatrixLatex(cartelGame(s), CARTEL_LABELS);

/** The smallest discount factor at which grim trigger sustains collusion: (T − R)/(T − P). */
export const criticalDelta = ({ R, T, P }: StagePayoffs) => (T - R) / (T - P);

/** Present value of colluding for ever, R + Rδ + Rδ² + … = R/(1 − δ). */
export const pvCollude = (R: number, delta: number) => R / (1 - delta);

/** Present value of cheating once and then being punished for ever: T + δP/(1 − δ). */
export const pvCheat = (T: number, P: number, delta: number) => T + (delta * P) / (1 - delta);
