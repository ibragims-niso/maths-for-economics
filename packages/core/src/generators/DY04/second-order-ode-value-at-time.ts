import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'price' | 'inventory';

interface Params {
  context: Context;
  /** The characteristic roots are −slow and −fast, with 0 < slow < fast. */
  slow: number;
  fast: number;
  /** The steady state y* = b/a₂, a whole number. */
  steady: number;
  /** The starting value y(0) and the starting slope y′(0). */
  start: number;
  slope: number;
  /** The time asked for. */
  t: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;
const SIZES = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5] as const;
const TIMES = [0.5, 1, 1.5, 2, 2.5, 3] as const;

const a1 = (p: Params) => round(p.slow + p.fast, 6);
const a2 = (p: Params) => round(p.slow * p.fast, 6);
const b = (p: Params) => round(a2(p) * p.steady, 6);

/**
 * The constants A and B with A + B = gap and −slow·A − fast·B = slope, for the path
 * y = y* + A·e^(−slow·t) + B·e^(−fast·t).
 */
function fit(p: Params, gap: number): { A: number; B: number } {
  const B = (p.slope + p.slow * gap) / (p.slow - p.fast);
  return { A: gap - B, B };
}
const constants = (p: Params) => fit(p, p.start - p.steady);

const pathAt = (p: Params, t: number) => {
  const { A, B } = constants(p);
  return p.steady + A * Math.exp(-p.slow * t) + B * Math.exp(-p.fast * t);
};
const value = (p: Params) => round(pathAt(p, p.t), 2);

const candidates = (p: Params) => {
  const { A, B } = constants(p);
  const e1 = Math.exp(-p.slow * p.t);
  const e2 = Math.exp(-p.fast * p.t);
  // Leaving out y*: A + B = y(0) and the path is A·e^(r₁t) + B·e^(r₂t) alone.
  const bare = fit(p, p.start);
  return [
    { value: round(bare.A * e1 + bare.B * e2, 2), mistakeCode: 'NO_PARTICULAR' },
    { value: round(p.steady + B * e1 + A * e2, 2), mistakeCode: 'SWAPPED_CONSTANTS' },
    { value: round(p.steady + (p.start - p.steady) * e1, 2), mistakeCode: 'ONE_ROOT' },
  ];
};

const LETTER: Record<Context, string> = { price: 'P', inventory: 'N' };
const UNIT: Record<Context, string> = { price: 'weeks', inventory: 'months' };

/** A coefficient in front of a term: "3", or nothing for 1. */
const coef = (x: number) => (x === 1 ? '' : num(x));
/** "+ x" or "- x", for a term added after another one. */
const plus = (x: number, d = 4) => (x < 0 ? `- ${num(-x, d)}` : `+ ${num(x, d)}`);

function stem(p: Params): string {
  const y = LETTER[p.context];
  const eq = `\\ddot ${y} + ${coef(a1(p))}\\,\\dot ${y} + ${coef(a2(p))}\\,${y} = ${num(b(p))}`;
  const setting =
    p.context === 'price'
      ? `Traders react to the price of a commodity and to its trend, so the price follows $${eq}$, with time in weeks. Today the price is $P(0) = ${num(p.start)}$ and it is changing at $\\dot P(0) = ${num(p.slope)}$ a week.`
      : `A wholesaler's stock of goods $N$ (thousand units) follows $${eq}$, with time in months. Today the stock is $N(0) = ${num(p.start)}$ and it is changing at $\\dot N(0) = ${num(p.slope)}$ a month.`;
  return `${setting} Find $${y}(${num(p.t)})$, the value after $${num(p.t)}$ ${UNIT[p.context]}. Give your answer to 2 decimal places.`;
}

/** DY04, difficulty 2: y(t) for y″ + a₁y′ + a₂y = b with two distinct real roots, from y(0) and y′(0). */
export const secondOrderOdeValueAtTime: Generator<Params> = {
  id: 'second-order-ode-value-at-time',
  title: 'Value on a two-root path',
  topicId: 'DY04',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['price', 'inventory'] as const);
      const slow = rng.pick(SIZES);
      const fast = rng.pick(SIZES);
      if (fast <= slow) continue;
      const steady = context === 'price' ? rng.int(10, 120) : rng.int(4, 60) * 5;
      const gap = rng.int(-Math.floor(0.6 * steady), Math.floor(0.6 * steady));
      const slope = rng.int(-15, 15);
      const t = rng.pick(TIMES);
      const p: Params = { context, slow, fast, steady, start: steady + gap, slope, t };
      if (Math.abs(gap) < 0.1 * steady) continue;
      // Constants with at most 2 decimals, both clearly present, so both roots matter.
      const { A, B } = constants(p);
      if (Math.abs(A * 100 - Math.round(A * 100)) > 1e-6) continue;
      if (Math.abs(B * 100 - Math.round(B * 100)) > 1e-6) continue;
      if (Math.abs(A) < 1 || Math.abs(B) < 1) continue;
      // Prices and stocks stay positive all along the path up to t.
      let positive = true;
      for (let k = 0; k <= 40; k++) if (pathAt(p, (p.t * k) / 40) <= 0) positive = false;
      if (!positive) continue;
      // The path has not yet settled: the answer is at least 0.5 away from y*.
      if (Math.abs(pathAt(p, p.t) - steady) < 0.5) continue;
      // Every mistake lands clearly away from the answer (at least 0.05 off).
      if (candidates(p).some((c) => Math.abs(c.value - value(p)) < 0.05)) continue;
      const kept = cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const y = LETTER[p.context];
    const gap = p.start - p.steady;
    const { A, B } = constants(p);
    const e1 = Math.exp(-p.slow * p.t);
    const e2 = Math.exp(-p.fast * p.t);
    const r1 = num(-p.slow);
    const r2 = num(-p.fast);
    return [
      {
        text: 'Find the steady state and the roots of the characteristic equation.',
        latex: `${y}^* = \\dfrac{${num(b(p))}}{${num(a2(p))}} = ${num(p.steady)}, \\qquad r^2 + ${coef(a1(p))}\\,r + ${num(a2(p))} = (r + ${num(p.slow)})(r + ${num(p.fast)}) = 0`,
        why: `Setting both derivatives to zero gives y* = b/a₂. The roots ${r1.replace('-', '−')} and ${r2.replace('-', '−')} add up to −a₁ and multiply to a₂; both are negative, so the path settles at y*.`,
        result: p.steady,
      },
      {
        text: 'Write the general solution and use the starting value.',
        latex: `${y}(t) = ${num(p.steady)} + A e^{${r1}t} + B e^{${r2}t}, \\qquad A + B = ${num(p.start)} - ${num(p.steady)} = ${num(gap)}`,
        why: 'At t = 0 both exponentials equal 1, so A + B must be the starting gap y(0) − y*, not y(0) itself.',
        result: gap,
      },
      {
        text: 'Use the starting slope to find A and B.',
        latex: `-${coef(p.slow)}A - ${coef(p.fast)}B = ${num(p.slope)} \\;\\Rightarrow\\; B = ${num(B)}, \\; A = ${num(A)}`,
        why: 'Differentiating brings down each root: y′(0) = r₁A + r₂B. Together with A + B = y(0) − y* this gives two equations for the two constants.',
        result: A,
      },
      {
        text: `Evaluate the path at t = ${num(p.t)}.`,
        latex: `${y}(${num(p.t)}) = ${num(p.steady)} ${plus(A * e1)} ${plus(B * e2)} = ${num(value(p))}`,
        why: `Each constant goes with its own root: A·e^(${r1.replace('-', '−')}t) has the slow root and B·e^(${r2.replace('-', '−')}t) the fast one, which dies out sooner.`,
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
