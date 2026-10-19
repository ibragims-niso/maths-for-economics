import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'price' | 'inventory';

interface Params {
  /** What is asked: the steady state y* = b/a₂, or the characteristic root closer to 0. */
  ask: 'steady' | 'root';
  context: Context;
  /** The roots are −slow and −fast, with 0 < slow < fast, so a₁ = slow + fast and a₂ = slow·fast. */
  slow: number;
  fast: number;
  /** The steady state y*, a whole number; b = a₂·y*. */
  steady: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;

/** Root sizes: tenths up to 1, then halves up to 6. */
const SIZES = [
  0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6,
] as const;

const a1 = (p: Params) => round(p.slow + p.fast, 6);
const a2 = (p: Params) => round(p.slow * p.fast, 6);
const b = (p: Params) => round(a2(p) * p.steady, 6);

const value = (p: Params) => (p.ask === 'steady' ? p.steady : -p.slow);

const candidates = (p: Params) =>
  p.ask === 'steady'
    ? [
        { value: round(b(p) / a1(p), 2), mistakeCode: 'WRONG_COEFFICIENT' },
        { value: round(b(p) / (1 + a1(p) + a2(p)), 2), mistakeCode: 'DISCRETE_FORMULA' },
      ]
    : [
        { value: -p.fast, mistakeCode: 'FASTER_ROOT' },
        { value: p.slow, mistakeCode: 'ROOT_SIGN' },
        { value: -a1(p), mistakeCode: 'DROPPED_CONSTANT' },
      ];

const LETTER: Record<Context, string> = { price: 'P', inventory: 'N' };

/** A coefficient in front of a term: "3", or nothing for 1. */
const coef = (x: number) => (x === 1 ? '' : num(x));
/** A number for plain text, with a true minus sign. */
const txt = (x: number) => `${x < 0 ? '−' : ''}${Math.abs(x)}`;

/** The equation as LaTeX, e.g. \ddot P + 3\dot P + 2P = 50. */
const equation = (p: Params) => {
  const y = LETTER[p.context];
  return `\\ddot ${y} + ${coef(a1(p))}\\,\\dot ${y} + ${coef(a2(p))}\\,${y} = ${num(b(p))}`;
};

function stem(p: Params): string {
  const setting =
    p.context === 'price'
      ? `Traders react to the price of a commodity, to how fast it is changing and to whether that change is speeding up, so the price follows $${equation(p)}$, with time in weeks.`
      : `A wholesaler adjusts production to its stock of goods $N$ (thousand units) with some delay, so the stock follows $${equation(p)}$, with time in months.`;
  if (p.ask === 'steady')
    return `${setting} At what level does it come to rest? Find the steady state $${LETTER[p.context]}^*$.`;
  return `${setting} The gap to the steady state is a mix of terms $e^{rt}$, where $r$ solves the characteristic equation. Find the root $r$ that is closer to zero: it decides how fast the gap dies out in the long run. Give the root with its sign.`;
}

/** DY04, difficulty 1: the steady state b/a₂ of y″ + a₁y′ + a₂y = b, or its slower characteristic root. */
export const secondOrderSteadyOrRoot: Generator<Params> = {
  id: 'second-order-steady-or-root',
  title: 'Steady state and slowest root',
  topicId: 'DY04',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const ask = rng.pick(['steady', 'root'] as const);
      const context = rng.pick(['price', 'inventory'] as const);
      const slow = rng.pick(SIZES);
      const fast = rng.pick(SIZES);
      if (fast <= slow) continue;
      const steady = context === 'price' ? rng.int(5, 150) : rng.int(4, 80) * 5;
      const p: Params = { ask, context, slow, fast, steady };
      const kept = cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < candidates(p).length) continue;
      return p;
    }
  },

  stem,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const y = LETTER[p.context];
    if (p.ask === 'steady')
      return [
        {
          text: 'At rest the variable is constant, so both of its derivatives are zero.',
          latex: `\\dot ${y} = \\ddot ${y} = 0 \\;\\Rightarrow\\; ${coef(a2(p))}\\,${y}^* = ${num(b(p))}`,
          why: 'A constant has no rate of change and no acceleration, so only the a₂·y term is left on the left-hand side.',
        },
        {
          text: 'Divide by the coefficient of the variable itself.',
          latex: `${y}^* = \\dfrac{${num(b(p))}}{${num(a2(p))}} = ${num(p.steady)}`,
          why: 'y* = b/a₂: the coefficients of the derivatives, such as a₁, play no part in where the path comes to rest, only in how it gets there.',
          result: p.steady,
        },
      ];
    const disc = round(a1(p) ** 2 - 4 * a2(p), 6);
    return [
      {
        text: 'Try y = e^(rt) in the equation without the constant.',
        latex: `r^2 + ${coef(a1(p))}\\,r + ${num(a2(p))} = 0`,
        why: 'Each derivative of e^(rt) brings down a factor r, and e^(rt) is never 0, so it can be divided out; the constant b only moves the steady state.',
      },
      {
        text: 'Compute the discriminant.',
        latex: `${num(a1(p))}^2 - 4 \\cdot ${num(a2(p))} = ${num(disc, 4)} > 0`,
        why: 'A positive discriminant means two distinct real roots, so the gap is a mix of two exponentials and does not oscillate.',
        result: disc,
      },
      {
        text: 'Use the quadratic formula.',
        latex: `r = \\dfrac{-${num(a1(p))} \\pm \\sqrt{${num(disc, 4)}}}{2} = \\dfrac{-${num(a1(p))} \\pm ${num(Math.sqrt(disc), 4)}}{2} \\;\\Rightarrow\\; r_1 = ${num(-p.slow)},\\; r_2 = ${num(-p.fast)}`,
        why: `Check: the roots add up to −a₁ = ${txt(-a1(p))} and multiply to a₂ = ${txt(a2(p))}.`,
        result: -p.fast,
      },
      {
        text: 'Pick the root closer to zero.',
        latex: `r_1 = ${num(-p.slow)}`,
        why: `Both roots are negative, so both terms die out, but e^(${txt(-p.fast)}t) vanishes faster; after a while the gap shrinks like e^(${txt(-p.slow)}t), the slow root.`,
        result: -p.slow,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
