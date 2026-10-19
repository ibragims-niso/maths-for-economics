import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'income' | 'members' | 'capital';

interface Params {
  context: Context;
  /** The factor a in y(t+1) = a·y(t) + b, in hundredths (80 means 0.8). */
  aPct: number;
  /** The steady state y* = b/(1 − a); a multiple of 100, so b is a whole number. */
  steady: number;
  /** The starting value y(0). */
  start: number;
  /** The number of periods. */
  t: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;

const FACTORS: Record<Context, readonly number[]> = {
  income: [50, 60, 70, 75, 80, 90],
  members: [70, 75, 80, 85, 90, 95],
  capital: [80, 85, 90, 95],
};
const STEADY_HUNDREDS: Record<Context, [number, number]> = {
  income: [5, 50],
  members: [5, 40],
  capital: [2, 30],
};

const factor = (p: Params) => p.aPct / 100;
/** b = y*(1 − a), a whole number because y* is a multiple of 100. */
const constant = (p: Params) => (p.steady * (100 - p.aPct)) / 100;
/** y(n) = y* + (y(0) − y*)·aⁿ, the general solution. */
const valueAt = (p: Params, n: number) => p.steady + (p.start - p.steady) * factor(p) ** n;
const value = (p: Params) => round(valueAt(p, p.t), 2);

const candidates = (p: Params) => [
  { value: round(p.start * factor(p) ** p.t, 2), mistakeCode: 'IGNORED_CONSTANT' },
  { value: p.steady, mistakeCode: 'STEADY_STATE_ONLY' },
  { value: round(valueAt(p, p.t - 1), 2), mistakeCode: 'ONE_PERIOD_SHORT' },
];

const SETTING: Record<Context, (p: Params) => string> = {
  income: (p) =>
    `Households spend a share $${num(factor(p))}$ of last quarter's income, and autonomous spending is $${num(constant(p))}$ billion a quarter, so national income follows $Y_{t+1} = ${num(factor(p))}\\,Y_t + ${num(constant(p))}$. Income this quarter is $Y_0 = ${num(p.start)}$ billion. What will income be after $${p.t}$ quarters, in billions?`,
  members: (p) =>
    `A gym keeps $${num(p.aPct)}\\%$ of its members from one month to the next and signs up $${num(constant(p))}$ new members each month, so membership follows $M_{t+1} = ${num(factor(p))}\\,M_t + ${num(constant(p))}$. It has $M_0 = ${num(p.start)}$ members now. How many members does the model give after $${p.t}$ months?`,
  capital: (p) =>
    `A firm's machines lose $${num(100 - p.aPct)}\\%$ of their value each year through wear, and it invests $${num(constant(p))}$ thousand a year in new ones, so its capital follows $K_{t+1} = ${num(factor(p))}\\,K_t + ${num(constant(p))}$. Capital is now $K_0 = ${num(p.start)}$ thousand. What will capital be after $${p.t}$ years, in thousands?`,
};

/** DY01, difficulty 1: the value of y(t+1) = a·y(t) + b after t periods, from the general solution. */
export const differenceEquationValueAfterT: Generator<Params> = {
  id: 'difference-equation-value-after-t',
  title: 'Value after t periods',
  topicId: 'DY01',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['income', 'members', 'capital'] as const);
      const aPct = rng.pick(FACTORS[context]);
      const [lo, hi] = STEADY_HUNDREDS[context];
      const steady = rng.int(lo, hi) * 100;
      const gapTens = rng.int(-Math.floor((0.8 * steady) / 10), Math.floor((0.8 * steady) / 10));
      const start = steady + 10 * gapTens;
      const t = rng.int(3, 8);
      const p: Params = { context, aPct, steady, start, t };
      // A real gap to close, and an answer clearly apart from the steady state and from y(t − 1).
      if (Math.abs(start - steady) < 0.2 * steady || start <= 0) continue;
      if (Math.abs(valueAt(p, t) - steady) < 0.02 * steady) continue;
      if (Math.abs(valueAt(p, t) - valueAt(p, t - 1)) < 0.01 * steady) continue;
      const kept = cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem: (p) => `${SETTING[p.context](p)} Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const a = num(factor(p));
    const gap = p.start - p.steady;
    const shrunk = gap * factor(p) ** p.t;
    return [
      {
        text: 'Find the steady state.',
        latex: `y^* = \\dfrac{b}{1 - a} = \\dfrac{${num(constant(p))}}{1 - ${a}} = ${num(p.steady)}`,
        why: 'The steady state is the value that repeats itself: setting y = a·y + b and solving gives y* = b/(1 − a).',
        result: p.steady,
      },
      {
        text: 'Measure the starting gap.',
        latex: `y_0 - y^* = ${num(p.start)} - ${num(p.steady)} = ${num(gap)}`,
        why: 'The general solution follows the gap to the steady state, because that gap is simply multiplied by a every period.',
        result: gap,
      },
      {
        text: `Shrink the gap ${p.t} times.`,
        latex: `(y_0 - y^*)\\,a^{${p.t}} = ${gap < 0 ? `(${num(gap)})` : num(gap)} \\cdot ${a}^{${p.t}} = ${num(shrunk, 4)}`,
        why: `After t periods the gap has been multiplied by a exactly t times, so the power is t = ${p.t}.`,
        result: shrunk,
      },
      {
        text: 'Add the steady state back.',
        latex: `y_{${p.t}} = y^* + (y_0 - y^*)\\,a^{${p.t}} = ${num(p.steady)} ${shrunk < 0 ? '-' : '+'} ${num(Math.abs(shrunk), 4)} = ${num(value(p))}`,
        why: 'The general solution is y(t) = y* + (y(0) − y*)·aᵗ: the steady state plus whatever is left of the gap.',
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
