import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'output' | 'inventory' | 'herd';

interface Params {
  context: Context;
  /** a₁ in y(t+2) + a₁·y(t+1) + a₂·y(t) = b, in tenths (−11 means −1.1). */
  a1Tenths: number;
  /** a₂, in tenths. */
  a2Tenths: number;
  /** The steady state y* = b/(1 + a₁ + a₂), a multiple of 10 so that b is a whole number. */
  steady: number;
  /** The two starting values y(0) and y(1). */
  y0: number;
  y1: number;
  /** The period asked for (3 or 4). */
  n: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.0005 } as const;

const a1 = (p: Params) => p.a1Tenths / 10;
const a2 = (p: Params) => p.a2Tenths / 10;
/** b = y*(1 + a₁ + a₂), a whole number. */
const constant = (p: Params) => (p.steady * (10 + p.a1Tenths + p.a2Tenths)) / 10;

/** y(0), …, y(n) from y(t+2) = b + c₁·y(t+1) + c₂·y(t); the correct rule has c₁ = −a₁, c₂ = −a₂. */
function path(p: Params, c1: number, c2: number): number[] {
  const y = [p.y0, p.y1];
  for (let t = 2; t <= p.n; t++) y.push(constant(p) + c1 * (y[t - 1] ?? 0) + c2 * (y[t - 2] ?? 0));
  return y;
}
const correct = (p: Params) => path(p, -a1(p), -a2(p));
const value = (p: Params) => round(correct(p)[p.n] ?? 0, 2);

const candidates = (p: Params) => [
  { value: round(path(p, a1(p), a2(p))[p.n] ?? 0, 2), mistakeCode: 'SIGN_SLIP' },
  { value: round(path(p, -a1(p), 0)[p.n] ?? 0, 2), mistakeCode: 'DROPPED_SECOND_LAG' },
  { value: round(correct(p)[p.n - 1] ?? 0, 2), mistakeCode: 'ONE_PERIOD_SHORT' },
];

/** " - 1.1y_{t+1}", " + 0.3y_t", " - y_{t+1}": a signed term of the equation. */
function term(coefficient: number, symbol: string): string {
  const size = Math.abs(coefficient);
  return ` ${coefficient < 0 ? '-' : '+'} ${size === 1 ? '' : num(size)}${symbol}`;
}

/** " + 1.1 \cdot 94", " - 0.3 \cdot 90", " + 94": a coefficient times an earlier value. */
function product(coefficient: number, earlier: number): string {
  const size = Math.abs(coefficient);
  return ` ${coefficient < 0 ? '-' : '+'} ${size === 1 ? '' : `${num(size)} \\cdot `}${num(earlier, 4)}`;
}

const SUB = ['₀', '₁', '₂', '₃', '₄'];

/** The equation y(t+2) + a₁y(t+1) + a₂y(t) = b in LaTeX, with the context's letter. */
const equation = (p: Params, y: string) =>
  `${y}_{t+2}${term(a1(p), `${y}_{t+1}`)}${term(a2(p), `${y}_t`)} = ${num(constant(p))}`;

const SETTING: Record<Context, { letter: string; text: (p: Params, eq: string) => string }> = {
  output: {
    letter: 'Y',
    text: (p, eq) =>
      `In a model of a region's output (in millions), this year's output depends on output in the two previous years: $${eq}$. Output was $Y_0 = ${num(p.y0)}$ and $Y_1 = ${num(p.y1)}$. What is output in year ${p.n}?`,
  },
  inventory: {
    letter: 'S',
    text: (p, eq) =>
      `A wholesaler reorders goods according to its stock in the last two months, so its stock (in thousand units) follows $${eq}$. The stock was $S_0 = ${num(p.y0)}$ and $S_1 = ${num(p.y1)}$. What is the stock in month ${p.n}?`,
  },
  herd: {
    letter: 'H',
    text: (p, eq) =>
      `Pig farmers breed according to the herd sizes of the last two years, so the national herd (in thousand animals) follows $${eq}$. The herd was $H_0 = ${num(p.y0)}$ and $H_1 = ${num(p.y1)}$. How large is the herd in year ${p.n}?`,
  },
};

/** DY02, difficulty 1: the value y(n), n = 3 or 4, of y(t+2) + a₁y(t+1) + a₂y(t) = b from y(0), y(1). */
export const secondOrderIteratedValue: Generator<Params> = {
  id: 'second-order-iterated-value',
  title: 'Second-order equation, step by step',
  topicId: 'DY02',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['output', 'inventory', 'herd'] as const);
      const a1Tenths = rng.int(-16, 8);
      const a2Tenths = rng.int(-5, 9);
      if (a1Tenths === 0 || a2Tenths === 0) continue;
      // Stable (both roots inside the unit circle), and 1 + a₁ + a₂ not tiny.
      const sum = 10 + a1Tenths + a2Tenths;
      if (sum < 2 || 10 - a1Tenths + a2Tenths <= 0 || a2Tenths >= 10) continue;
      const steady = rng.int(5, 50) * 10;
      const spread = Math.floor(0.2 * steady);
      const y0 = steady + rng.int(-spread, spread);
      const y1 = steady + rng.int(-spread, spread);
      const n = rng.int(3, 4);
      const p: Params = { context, a1Tenths, a2Tenths, steady, y0, y1, n };
      // Positive values on the way, and a real change from y(n − 1) to y(n).
      if (correct(p).some((y) => y <= 0)) continue;
      if (Math.abs((correct(p)[n] ?? 0) - (correct(p)[n - 1] ?? 0)) < 0.002 * steady) continue;
      if (cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) => {
    const setting = SETTING[p.context];
    return `${setting.text(p, equation(p, setting.letter))} Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const y = SETTING[p.context].letter;
    const values = correct(p);
    const rule = `${y}_{t+2} = ${num(constant(p))}${term(-a1(p), `${y}_{t+1}`)}${term(-a2(p), `${y}_t`)}`;
    const rounds = values.slice(2).map((x, i) => {
      const t = i + 2;
      return {
        text: `Compute ${y}${SUB[t]}.`,
        latex: `${y}_${t} = ${num(constant(p))}${product(-a1(p), values[t - 1] ?? 0)}${product(-a2(p), values[t - 2] ?? 0)} = ${num(x, 4)}`,
        why:
          t === 2
            ? 'Each new value needs the two values just before it; for the first step those are the two starting values.'
            : `Move the window on by one period: the value two periods back is now ${y}${SUB[t - 2]}.`,
        result: t === p.n ? value(p) : x,
      };
    });
    return [
      {
        text: 'Solve the equation for the newest value.',
        latex: rule,
        why: 'Move the two older terms to the right-hand side; each changes sign when it crosses the equals sign.',
      },
      ...rounds,
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
