import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'capital' | 'price' | 'debt';

interface Params {
  context: Context;
  /** The coefficient a in dy/dt + a·y = b (a > 0, so the path converges). */
  a: number;
  /** The steady state y* = b/a, a whole number. */
  steady: number;
  /** The starting value y(0). */
  start: number;
  /** The time asked for. */
  t: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;

const RATES: Record<Context, readonly number[]> = {
  capital: [0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25],
  price: [0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 1],
  debt: [0.01, 0.015, 0.02, 0.025, 0.03],
};
/** Steady states as [min, max, step]. */
const STEADY: Record<Context, [number, number, number]> = {
  capital: [100, 2000, 10],
  price: [10, 80, 1],
  debt: [40, 200, 10],
};
const TIMES: Record<Context, [number, number]> = {
  capital: [2, 12],
  price: [1, 6],
  debt: [5, 30],
};

/** b = a·y*, the constant on the right-hand side. */
const constant = (p: Params) => round(p.a * p.steady, 6);
/** y(t) = y* + (y(0) − y*)·e^(−at), the solution through y(0). */
const valueAt = (p: Params, t: number) => p.steady + (p.start - p.steady) * Math.exp(-p.a * t);
const value = (p: Params) => round(valueAt(p, p.t), 2);

const candidates = (p: Params) => [
  { value: round(p.start * Math.exp(-p.a * p.t), 2), mistakeCode: 'IGNORED_STEADY_STATE' },
  { value: p.steady, mistakeCode: 'STEADY_STATE_ONLY' },
  {
    value: round(p.steady + (p.start - p.steady) * Math.exp(p.a * p.t), 2),
    mistakeCode: 'EXPONENT_SIGN',
  },
];

const SETTING: Record<Context, (p: Params) => string> = {
  capital: (p) =>
    `A firm invests $${num(constant(p))}$ (thousand) a year in machines, and its machines wear out at the rate $${num(p.a, 3)}$ a year, so its capital stock follows $\\dfrac{dK}{dt} = ${num(constant(p))} - ${num(p.a, 3)}K$. Capital is now $K(0) = ${num(p.start)}$. What is the capital stock after $${p.t}$ years?`,
  price: (p) =>
    `After a change in the market, excess demand moves the price according to $\\dfrac{dp}{dt} = ${num(constant(p))} - ${num(p.a, 3)}p$, with time in weeks. The price starts at $p(0) = ${num(p.start)}$. What is the price after $${p.t}$ weeks?`,
  debt: (p) =>
    `A country's debt ratio $D$ (debt in % of GDP) follows $\\dfrac{dD}{dt} = ${num(constant(p))} - ${num(p.a, 3)}D$: a primary deficit of $${num(constant(p))}\\%$ of GDP a year, and GDP growing $${num(100 * p.a, 1)}$ percentage points faster than the interest rate on the debt. Debt is now $D(0) = ${num(p.start)}\\%$ of GDP. What is the debt ratio after $${p.t}$ years, in % of GDP?`,
};

const LETTER: Record<Context, string> = { capital: 'K', price: 'p', debt: 'D' };

/** DY03, difficulty 1: the value of the solution of dy/dt + a·y = b at time t, from y(0). */
export const linearOdeValueAtTime: Generator<Params> = {
  id: 'linear-ode-value-at-time',
  title: 'Value on a converging path',
  topicId: 'DY03',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['capital', 'price', 'debt'] as const);
      const a = rng.pick(RATES[context]);
      const [lo, hi, step] = STEADY[context];
      const steady = lo + step * rng.int(0, (hi - lo) / step);
      // A starting value between 20 % and 180 % of the steady state, on the same grid.
      const start =
        steady +
        step * rng.int(-Math.floor((0.8 * steady) / step), Math.floor((0.8 * steady) / step));
      const [t0, t1] = TIMES[context];
      const t = rng.int(t0, t1);
      const p: Params = { context, a, steady, start, t };
      // b = a·y* with at most 2 decimals, so the equation is easy to read.
      const b = p.a * p.steady;
      if (Math.abs(b * 100 - Math.round(b * 100)) > 1e-6) continue;
      // A real gap to close, and an answer clearly between y(0) and y*.
      if (start <= 0 || Math.abs(start - steady) < 0.2 * steady) continue;
      if (a * t < 0.1 || a * t > 3) continue;
      const kept = cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem: (p) => `${SETTING[p.context](p)} Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const y = LETTER[p.context];
    const a = num(p.a, 3);
    const gap = p.start - p.steady;
    const factor = Math.exp(-p.a * p.t);
    const shrunk = gap * factor;
    return [
      {
        text: 'Write the equation as dy/dt + a·y = b and find the steady state.',
        latex: `\\dfrac{d${y}}{dt} + ${a}\\,${y} = ${num(constant(p))} \\;\\Rightarrow\\; ${y}^* = \\dfrac{${num(constant(p))}}{${a}} = ${num(p.steady)}`,
        why: 'At the steady state nothing changes, so the derivative is 0 and a·y = b, which gives y* = b/a.',
        result: p.steady,
      },
      {
        text: 'Measure the starting gap to the steady state.',
        latex: `${y}(0) - ${y}^* = ${num(p.start)} - ${num(p.steady)} = ${num(gap)}`,
        why: 'The gap x = y − y* obeys dx/dt = −a·x, plain exponential decay, so it is the gap that we follow over time.',
        result: gap,
      },
      {
        text: `Shrink the gap over t = ${p.t}.`,
        latex: `(${y}(0) - ${y}^*)\\,e^{-${a} \\cdot ${p.t}} = ${gap < 0 ? `(${num(gap)})` : num(gap)} \\cdot ${num(factor, 6)} = ${num(shrunk, 4)}`,
        why: `The gap decays like e^(−at) with a = ${num(p.a, 3)} > 0; the minus sign in the exponent is what makes it shrink.`,
        result: shrunk,
      },
      {
        text: 'Add the steady state back.',
        latex: `${y}(${p.t}) = ${y}^* + (${y}(0) - ${y}^*)\\,e^{-${a} \\cdot ${p.t}} = ${num(p.steady)} ${shrunk < 0 ? '-' : '+'} ${num(Math.abs(shrunk), 4)} = ${num(value(p))}`,
        why: 'The solution is y(t) = y* + (y(0) − y*)·e^(−at): the steady state plus whatever is left of the starting gap.',
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
