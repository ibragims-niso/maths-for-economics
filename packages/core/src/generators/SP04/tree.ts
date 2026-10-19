import { num } from '../format';

/**
 * Shared pieces of the SP04 binomial-tree questions. A share worth S₀ moves up by the factor
 * u = 1 + a/100 or down by d = 1 − b/100 each period; R = 1 + r/100 is the gross risk-free return
 * per period (per-period compounding, not continuous).
 */
export interface TreeParams {
  /** Share price today. */
  s0: number;
  /** Up move in per cent: u = 1 + a/100. */
  upPct: number;
  /** Down move in per cent: d = 1 − b/100. */
  downPct: number;
  /** Risk-free rate in per cent per period: R = 1 + r/100. */
  ratePct: number;
  /** Strike price. */
  strike: number;
}

export const up = (p: TreeParams) => 1 + p.upPct / 100;
export const down = (p: TreeParams) => 1 - p.downPct / 100;
export const gross = (p: TreeParams) => 1 + p.ratePct / 100;

/** Risk-neutral probability of an up move, q = (R − d)/(u − d) = (r + b)/(a + b). */
export const riskNeutralQ = (p: TreeParams) => (p.ratePct + p.downPct) / (p.upPct + p.downPct);

/** Share price after `ups` up moves and `downs` down moves, rounded away from float noise. */
export const priceAt = (p: TreeParams, ups: number, downs: number) =>
  Math.round(p.s0 * up(p) ** ups * down(p) ** downs * 1e6) / 1e6;

/** Option payoffs, rounded to 6 decimals so 80 − 57.8 gives 22.2, not 22.200000000000003. */
const clean = (x: number) => Math.round(x * 1e6) / 1e6;
export const callPayoff = (s: number, k: number) => clean(Math.max(s - k, 0));
export const putPayoff = (s: number, k: number) => clean(Math.max(k - s, 0));

/** One backward-induction step: the discounted risk-neutral average of the two next values. */
export const discountedAverage = (q: number, vUp: number, vDown: number, r: number) =>
  (q * vUp + (1 - q) * vDown) / r;

/** Value today of a two-period European option with payoff `pay`, by backward induction. */
export function twoPeriodValue(
  p: TreeParams,
  pay: (s: number, k: number) => number,
  q = riskNeutralQ(p),
) {
  const r = gross(p);
  const vuu = pay(priceAt(p, 2, 0), p.strike);
  const vud = pay(priceAt(p, 1, 1), p.strike);
  const vdd = pay(priceAt(p, 0, 2), p.strike);
  const vu = discountedAverage(q, vuu, vud, r);
  const vd = discountedAverage(q, vud, vdd, r);
  return { vuu, vud, vdd, vu, vd, v0: discountedAverage(q, vu, vd, r) };
}

/** The rate per period in LaTeX (4 → "4\%") and the gross return R = 1 + r it implies. */
export const rateLatex = (ratePct: number) => `${ratePct}\\%`;
export const grossLatex = (ratePct: number) => num(1 + ratePct / 100, 2);

/** A number for plain text (a step's "why"): commas as thousands separators, no LaTeX braces. */
export const plain = (value: number, decimals = 2) => num(value, decimals).replace(/\{,\}/g, ',');
