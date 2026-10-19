import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'fish' | 'forest' | 'herd';

interface Params {
  context: Context;
  /** Natural growth rate g in tenths (5 means g = 0.5). */
  gTenths: number;
  /** Carrying capacity K: the size the stock would reach with no harvest. */
  capacity: number;
  /** The steady state asked about is x* = K·m/20 (m ≠ 10). */
  m: number;
}

/** f′(x*) is asked to 2 decimal places and is exact in hundredths. */
const DP2 = { tolerance: 0.005, relTolerance: 0 } as const;

const g = (p: Params) => p.gTenths / 10;
const xStar = (p: Params) => (p.capacity * p.m) / 20;
/** H = g·x*·(1 − x* / K) = g·K·m·(20 − m) / 400, so x* is a steady state of the map. */
const harvest = (p: Params) => (p.gTenths * p.capacity * p.m * (20 - p.m)) / 4000;
/** f′(x*) = 1 + g(1 − 2x* / K) = 1 + g(1 − m/10), in hundredths: 100 + gTenths·(10 − m). */
const slope100 = (p: Params) => 100 + p.gTenths * (10 - p.m);
const slope = (p: Params) => slope100(p) / 100;

const candidates = (p: Params): Distractor[] => [
  { value: xStar(p), mistakeCode: 'VALUE_NOT_SLOPE' },
  { value: round(1 + g(p), 2), mistakeCode: 'SLOPE_AT_ZERO' },
  { value: round(1 - slope(p), 2), mistakeCode: 'ONE_MINUS_SLOPE' },
  // Differentiating x²/K as x/K: 1 + g(1 − x* / K).
  { value: round(1 + g(p) * (1 - p.m / 20), 2), mistakeCode: 'DERIVATIVE_SLIP' },
];

const SETTING: Record<Context, { stock: string; unit: string; take: string }> = {
  fish: { stock: 'A fish stock', unit: 'thousand tonnes', take: 'is caught' },
  forest: { stock: 'The timber in a forest', unit: 'thousand cubic metres', take: 'is felled' },
  herd: { stock: 'A herd of cattle on common land', unit: 'hundred animals', take: 'is sold' },
};

/** DY06, difficulty 1: the slope f′(x*) of a harvest map at a steady state, which decides its stability. */
export const harvestMapSlopeAtSteadyState: Generator<Params> = {
  id: 'harvest-map-slope-at-steady-state',
  title: 'Slope of a map at its steady state',
  topicId: 'DY06',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        context: rng.pick(['fish', 'forest', 'herd'] as const),
        gTenths: rng.int(2, 12),
        capacity: rng.pick([200, 400, 800]),
        m: rng.int(1, 19),
      };
      if (p.m === 10) continue;
      // A clear verdict: f′(x*) not within 0.03 of 1 or −1.
      if (Math.abs(slope100(p) - 100) < 3 || Math.abs(slope100(p) + 100) < 3) continue;
      if (cleanDistractors(slope(p), candidates(p), DP2.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) => {
    const { stock, unit, take } = SETTING[p.context];
    return `${stock} $x_t$ (in ${unit}) grows by $${num(g(p))}\\,x_t(1 - x_t/${num(p.capacity)})$ a year, and ${num(harvest(p))} ${take} each year, so $x_{t+1} = f(x_t) = x_t + ${num(g(p))}\\,x_t\\left(1 - \\dfrac{x_t}{${num(p.capacity)}}\\right) - ${num(harvest(p))}$. One steady state is $x^* = ${num(xStar(p))}$. Find $f'(x^*)$, the slope of the map there, which decides whether this steady state is stable. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: slope(p), decimals: 2, ...DP2 }),

  steps(p) {
    const x = xStar(p);
    const s = slope(p);
    const growth = round(g(p) * x * (1 - x / p.capacity), 4);
    const other = p.capacity - x;
    let verdict: string;
    if (s > 1)
      verdict = `|f′(x*)| > 1: a small gap grows by the factor ${num(s)} every year, so x* = ${num(x)} is unstable. It is a threshold: a stock a little below it shrinks away, one a little above it grows towards the other steady state, ${num(other)}.`;
    else if (s >= 0)
      verdict = `0 ≤ f′(x*) < 1: a small gap shrinks to ${num(s)} of its size every year without changing sign, so x* = ${num(x)} is locally stable and the stock approaches it steadily.`;
    else
      verdict = `−1 < f′(x*) < 0: a small gap shrinks to ${num(Math.abs(s))} of its size every year but changes sign, so x* = ${num(x)} is locally stable and the stock approaches it in alternating steps.`;
    return [
      {
        text: 'Check that x* is a steady state.',
        latex: `f(${num(x)}) = ${num(x)} + ${num(growth)} - ${num(harvest(p))} = ${num(x)}`,
        why: 'At a steady state the natural growth of the stock exactly replaces what is taken, so the stock stays where it is.',
        result: x,
      },
      {
        text: 'Differentiate the map.',
        latex: `f'(x) = 1 + ${num(g(p))}\\left(1 - \\dfrac{2x}{${num(p.capacity)}}\\right)`,
        why: 'The derivative of x is 1 and the derivative of g·x(1 − x/K) = g·x − g·x²/K is g − 2g·x/K; the constant harvest drops out.',
      },
      {
        text: 'Evaluate the slope at the steady state.',
        latex: `f'(${num(x)}) = 1 + ${num(g(p))}\\left(1 - \\dfrac{${num(2 * x)}}{${num(p.capacity)}}\\right) = ${num(s)}`,
        why: 'Near x* the gap x − x* is multiplied by roughly f′(x*) each year (linearisation), so this one number decides what small disturbances do.',
        result: s,
      },
      {
        text: 'Compare its size with 1.',
        latex: `|f'(x^*)| = ${num(Math.abs(s))} ${Math.abs(s) < 1 ? '<' : '>'} 1`,
        why: verdict,
      },
    ];
  },

  distractors: (p) => cleanDistractors(slope(p), candidates(p), DP2.tolerance, 0),
};
