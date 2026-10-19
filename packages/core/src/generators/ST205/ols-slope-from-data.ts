import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { CONTEXTS, type Context, dataLead, slopeMeaning } from './contexts';

interface Params {
  context: Context;
  xs: number[];
  ys: number[];
  /** The slope the data were built from; it is exactly the least-squares slope. */
  slope: number;
}

/** The slope is exact on the 0.01 grid, so only a small absolute tolerance is needed. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

interface Recipe {
  /** The x values to choose from. */
  xGrid: number[];
  slopes: number[];
  /** The intercept, given the slope and the largest x. */
  intercept(rng: Rng, slope: number, xMax: number): number;
  /** y values are whole multiples of this. */
  unit: number;
  /** Residuals are whole multiples of `unit`, at most this many in size. */
  maxResidual(rng: Rng): number;
}

const range = (from: number, to: number, step = 1) =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, k) => round(from + k * step, 6));

const RECIPES: Readonly<Record<Context, Recipe>> = {
  demand: {
    xGrid: range(2, 12),
    slopes: range(-12, -3),
    intercept: (rng, slope, xMax) => -slope * xMax + rng.int(10, 60),
    unit: 1,
    maxResidual: (rng) => rng.int(2, 5),
  },
  consumption: {
    xGrid: range(10, 100, 10),
    slopes: [0.6, 0.7, 0.8, 0.9],
    intercept: (rng) => rng.int(2, 20),
    unit: 1,
    maxResidual: (rng) => rng.int(2, 6),
  },
  wages: {
    xGrid: range(8, 20),
    slopes: [0.5, 1, 1.5, 2, 2.5],
    intercept: (rng) => rng.int(-3, 6),
    unit: 0.5,
    maxResidual: (rng) => rng.int(1, 4),
  },
  okun: {
    xGrid: range(-2, 6),
    slopes: [-0.3, -0.4, -0.5],
    intercept: (rng) => rng.pick([0.8, 1, 1.2, 1.5]),
    unit: 0.1,
    maxResidual: (rng) => rng.int(1, 4),
  },
};

const sum = (vs: number[]) => vs.reduce((s, v) => s + v, 0);
const mean = (vs: number[]) => sum(vs) / vs.length;

/** Σ(x − x̄)(y − ȳ), Σ(x − x̄)² and Σ(y − ȳ)². */
export function centredSums(xs: number[], ys: number[]) {
  const mx = mean(xs);
  const my = mean(ys);
  return {
    sxy: sum(xs.map((x, i) => (x - mx) * ((ys[i] ?? 0) - my))),
    sxx: sum(xs.map((x) => (x - mx) ** 2)),
    syy: sum(ys.map((y) => (y - my) ** 2)),
  };
}

/**
 * Residuals in whole units that add up to 0 and are uncorrelated with x (Σxe = 0), so the
 * least-squares line of y = a + bx + e is exactly y = a + bx. Two residuals, at random places,
 * are solved for; null when they are not whole numbers or too large.
 */
function residuals(rng: Rng, xs: number[], max: number): number[] | null {
  const n = xs.length;
  const i = rng.int(0, n - 1);
  const j = (i + rng.int(1, n - 1)) % n;
  const es = xs.map(() => rng.int(-max, max));
  es[i] = 0;
  es[j] = 0;
  const a = sum(es);
  const b = sum(xs.map((x, k) => x * (es[k] ?? 0)));
  const xi = xs[i] ?? 0;
  const xj = xs[j] ?? 0;
  // e_i + e_j = −a and x_i e_i + x_j e_j = −b.
  const ej = (-b + xi * a) / (xj - xi);
  const ei = -a - ej;
  if (!Number.isInteger(round(ej, 9)) || Math.abs(ej) > max || Math.abs(ei) > max) return null;
  es[i] = round(ei, 9);
  es[j] = round(ej, 9);
  return es;
}

const target = (p: Params) => p.slope;

/** A table of the data, one column per observation. */
const tableLatex = (p: Params) =>
  `\\begin{array}{c|${'c'.repeat(p.xs.length)}} x & ${p.xs.map((x) => num(x)).join(' & ')} \\\\ \\hline y & ${p.ys.map((y) => num(y)).join(' & ')} \\end{array}`;

/** A deviation in brackets when negative. */
const paren = (v: number) => (v < 0 ? `(${num(v, 4)})` : num(v, 4));

function wrongAnswers(p: Params): Distractor[] {
  const { sxy, syy } = centredSums(p.xs, p.ys);
  const rawXY = sum(p.xs.map((x, i) => x * (p.ys[i] ?? 0)));
  const rawXX = sum(p.xs.map((x) => x * x));
  const n = p.xs.length;
  const rise = (p.ys[n - 1] ?? 0) - (p.ys[0] ?? 0);
  const width = (p.xs[n - 1] ?? 0) - (p.xs[0] ?? 0);
  return cleanDistractors(
    target(p),
    [
      { value: round(rawXY / rawXX, 2), mistakeCode: 'NO_CENTRING' },
      { value: round(sxy / syy, 2), mistakeCode: 'REVERSED_REGRESSION' },
      { value: round(rise / width, 2), mistakeCode: 'END_POINTS' },
    ],
    EXACT.tolerance,
    EXACT.relTolerance,
  );
}

/** ST205, difficulty 2: the least-squares slope b₁ = Σ(x − x̄)(y − ȳ)/Σ(x − x̄)² from 5 or 6 data points. */
export const olsSlopeFromData: Generator<Params> = {
  id: 'ols-slope-from-data',
  title: 'Least-squares slope from data',
  topicId: 'ST205',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(CONTEXTS);
      const r = RECIPES[context];
      const n = rng.int(5, 6);
      const xs = new Set<number>();
      while (xs.size < n) xs.add(rng.pick(r.xGrid));
      const sorted = [...xs].sort((a, b) => a - b);
      // A whole-number mean of x keeps the deviations easy to work with by hand.
      if (!Number.isInteger(round(sum(sorted) / n, 9))) continue;
      const slope = rng.pick(r.slopes);
      const intercept = r.intercept(rng, slope, sorted[n - 1] ?? 0);
      const es = residuals(rng, sorted, r.maxResidual(rng));
      if (!es || es.filter((e) => e !== 0).length < 3) continue;
      const ys = sorted.map((x, k) => round(intercept + slope * x + (es[k] ?? 0) * r.unit, 6));
      if (ys.some((y) => !Number.isInteger(round(y / r.unit, 6)))) continue;
      if (context !== 'okun' && ys.some((y) => y < 4)) continue;
      const p: Params = { context, xs: sorted, ys, slope };
      if (wrongAnswers(p).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    return `${dataLead(p.context, p.xs.length)} $${tableLatex(p)}$ Find the slope $b_1$ of the least-squares line $\\hat y = b_0 + b_1 x$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...EXACT }),

  steps(p) {
    const n = p.xs.length;
    const mx = mean(p.xs);
    const my = round(mean(p.ys), 6);
    const { sxy, sxx } = centredSums(p.xs, p.ys);
    const dx = p.xs.map((x) => round(x - mx, 6));
    const dy = p.ys.map((y) => round(y - my, 6));
    return [
      {
        text: 'Find the mean of x and the mean of y.',
        latex: `\\bar x = \\dfrac{${num(sum(p.xs))}}{${n}} = ${num(mx, 4)}, \\qquad \\bar y = \\dfrac{${num(round(sum(p.ys), 6), 4)}}{${n}} = ${num(my, 4)}`,
        why: 'The least-squares line always passes through the point of means (x̄, ȳ), and the slope is built from deviations from these means.',
        result: my,
      },
      {
        text: 'Add up the products of the deviations from the means.',
        latex: `\\sum (x - \\bar x)(y - \\bar y) = ${dx.map((d, k) => `(${num(d, 4)})(${num(dy[k] ?? 0, 4)})`).join(' + ')} = ${num(round(sxy, 6), 4)}`,
        why: 'A point to the right of x̄ and above ȳ (or left and below) adds a positive product; these products measure how x and y move together, like a covariance.',
        result: round(sxy, 6),
      },
      {
        text: 'Add up the squared deviations of x.',
        latex: `\\sum (x - \\bar x)^2 = ${dx.map((d) => `${paren(d)}^2`).join(' + ')} = ${num(round(sxx, 6), 4)}`,
        why: 'This measures how spread out the x values are; the slope compares the joint movement with the spread of x alone.',
        result: round(sxx, 6),
      },
      {
        text: 'Divide to get the slope.',
        latex: `b_1 = \\dfrac{\\sum (x - \\bar x)(y - \\bar y)}{\\sum (x - \\bar x)^2} = \\dfrac{${num(round(sxy, 6), 4)}}{${num(round(sxx, 6), 4)}} = ${num(target(p))}`,
        why: `This is the slope that makes the sum of squared residuals as small as possible. Here ${slopeMeaning(p.context, target(p))}.`,
        result: target(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
