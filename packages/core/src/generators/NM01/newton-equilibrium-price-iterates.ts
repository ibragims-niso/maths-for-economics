import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Demand D(p) = A/p², a constant-elasticity demand curve. */
  spend: number;
  /** Supply S(p) = s·p + t. */
  s: number;
  t: number;
  /** The whole-number starting price p₀, above the equilibrium. */
  start: number;
}

/** Four decimals are asked for; only rounding slips are forgiven. */
const FOUR_DP = { tolerance: 0.0002, relTolerance: 0 } as const;

/** f(p) = s·p³ + t·p² − A: D(p) = S(p) multiplied by p². */
export const f = (p: Params, x: number) => p.s * x ** 3 + p.t * x ** 2 - p.spend;
export const fSlope = (p: Params, x: number) => 3 * p.s * x ** 2 + 2 * p.t * x;

const newtonStep = (p: Params, x: number) => x - f(p, x) / fSlope(p, x);

/** The equilibrium price: f is increasing for p > 0, so bisection on [0, start] finds its one root. */
export function equilibrium(p: Params) {
  let lo = 0;
  let hi = p.start;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2;
    if (f(p, m) < 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

export const iterates = (p: Params) => {
  const p1 = newtonStep(p, p.start);
  return { p1, p2: newtonStep(p, p1) };
};

const estimate = (p: Params) => round(iterates(p).p2, 4);

function candidates(p: Params) {
  const { p1 } = iterates(p);
  const plus1 = p.start + f(p, p.start) / fSlope(p, p.start);
  return [
    { value: round(p1, 4), mistakeCode: 'ONE_ITERATE' },
    { value: round(plus1 + f(p, plus1) / fSlope(p, plus1), 4), mistakeCode: 'NEWTON_PLUS_SIGN' },
    { value: round(p1 - f(p, p1) / fSlope(p, p.start), 4), mistakeCode: 'FROZEN_SLOPE' },
    { value: round(equilibrium(p), 4), mistakeCode: 'EXACT_ROOT' },
  ];
}

const supplyLatex = (p: Params) => `${p.s === 1 ? '' : num(p.s)}p + ${num(p.t)}`;
const fLatex = (p: Params) =>
  `${p.s === 1 ? '' : num(p.s)}p^3 + ${p.t === 1 ? '' : num(p.t)}p^2 - ${num(p.spend)}`;

/** NM01, difficulty 2: two Newton iterates for an equilibrium price that has no simple formula. */
export const newtonEquilibriumPriceIterates: Generator<Params> = {
  id: 'newton-equilibrium-price-iterates',
  title: "Newton's method for an equilibrium price",
  topicId: 'NM01',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const s = rng.int(1, 4);
      const t = rng.int(1, 12);
      const target = rng.int(25, 100) / 10;
      const spend = Math.round(s * target ** 3 + t * target ** 2);
      const p: Params = { spend, s, t, start: Math.ceil(target) + rng.int(0, 2) };
      if (spend < 50 || spend > 9000) continue;
      const root = equilibrium(p);
      const gap = p.start - root;
      if (gap < 0.4 || gap > 2.5) continue;
      // Two steps must not yet reach the root at 4 decimals, so the question is about the method.
      if (Math.abs(iterates(p).p2 - root) < 0.0006) continue;
      // Every listed mistake leads to a different number.
      if (cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0).length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `Demand for a good is $D(p) = \\dfrac{${num(p.spend)}}{p^2}$ and supply is $S(p) = ${supplyLatex(p)}$. Setting $D(p) = S(p)$ and multiplying by $p^2$ gives $f(p) = ${fLatex(p)} = 0$. Apply Newton's method to $f$, starting from $p_0 = ${num(p.start)}$. Keep full calculator accuracy between steps and give $p_2$ to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 4, ...FOUR_DP }),

  steps(p) {
    const { p1, p2 } = iterates(p);
    const x0 = p.start;
    return [
      {
        text: 'Differentiate f.',
        latex: `f'(p) = ${num(3 * p.s)}p^2 + ${num(2 * p.t)}p`,
        why: "Newton's method needs the slope of f at each estimate; use the power rule term by term.",
      },
      {
        text: 'First Newton step from p₀.',
        latex: `p_1 = ${num(x0)} - \\dfrac{f(${num(x0)})}{f'(${num(x0)})} = ${num(x0)} - \\dfrac{${num(f(p, x0))}}{${num(fSlope(p, x0))}} = ${num(p1, 4)}`,
        why: 'Follow the tangent line at p₀ down to where it meets the axis; f(p₀) > 0 means supply exceeds demand, so the price falls.',
        result: round(p1, 4),
      },
      {
        text: 'Second Newton step from p₁.',
        latex: `p_2 = p_1 - \\dfrac{f(p_1)}{f'(p_1)} = ${num(p1, 4)} - \\dfrac{${num(f(p, p1), 4)}}{${num(fSlope(p, p1), 4)}} = ${num(p2, 4)}`,
        why: 'Repeat with the new tangent at p₁, using the slope at p₁, not at p₀. The step is much smaller: near the root the error is roughly squared each time.',
        result: estimate(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(estimate(p), candidates(p), FOUR_DP.tolerance, 0),
};
