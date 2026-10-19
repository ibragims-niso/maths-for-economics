import { num } from '../format';

/** The two utility functions of money used in SP02 questions: u(W) = √W and u(W) = ln W. */
export type UtilityKind = 'sqrt' | 'log';

/** u(W). */
export const utility = (kind: UtilityKind, w: number) =>
  kind === 'sqrt' ? Math.sqrt(w) : Math.log(w);

/** The inverse u⁻¹(v): the sure amount of money with utility v. */
export const inverseUtility = (kind: UtilityKind, v: number) =>
  kind === 'sqrt' ? v * v : Math.exp(v);

/** The formula of u as LaTeX. */
export const utilityLatex = (kind: UtilityKind) => (kind === 'sqrt' ? '\\sqrt{W}' : '\\ln W');

/** The utility of an amount written as LaTeX, e.g. "\sqrt{3600}" or "\ln 40{,}000". */
export const utilityOf = (kind: UtilityKind, amount: string) =>
  kind === 'sqrt' ? `\\sqrt{${amount}}` : `\\ln ${amount}`;

/** Expected utility of a two-outcome lottery: low with probability p, high with probability 1 − p. */
export const expectedUtility = (kind: UtilityKind, low: number, high: number, p: number) =>
  p * utility(kind, low) + (1 - p) * utility(kind, high);

/** Certainty equivalent CE = u⁻¹(E[u(W)]) of the same two-outcome lottery. */
export const certaintyEquivalent = (kind: UtilityKind, low: number, high: number, p: number) =>
  inverseUtility(kind, expectedUtility(kind, low, high, p));

/** A number for plain text (a step's "why"): commas as thousands separators, no LaTeX braces. */
export const plain = (value: number, decimals = 2) => num(value, decimals).replace(/\{,\}/g, ',');
