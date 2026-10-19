import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: what y, x₁ and x₂ are. */
type Context = 'wages' | 'demand' | 'production';

/** Which entry is asked for. */
type Kind = 'sum-x1' | 'sq-x1' | 'sq-x2' | 'cross' | 'xy1' | 'xy2';

interface Params {
  context: Context;
  x1s: number[];
  x2s: number[];
  ys: number[];
  kind: Kind;
  /** For the cross term only: ask for entry (2, 3) or the equal entry (3, 2). */
  swapped: boolean;
}

/** The answer is a whole number, so only the exact value is accepted. */
const EXACT = { tolerance: 0, relTolerance: 0 } as const;

const KINDS: readonly Kind[] = ['sum-x1', 'sq-x1', 'sq-x2', 'cross', 'xy1', 'xy2'];

interface Recipe {
  /** The opening of the stem, given the number of observations. */
  lead(n: number): string;
  x1: [number, number];
  x2: [number, number];
  /** A plausible y for the two regressors, before a little noise is added. */
  y(x1: number, x2: number): number;
}

const RECIPES: Readonly<Record<Context, Recipe>> = {
  wages: {
    lead: (n) =>
      `${n} workers report their hourly wage $y$, their years of university education $x_1$ and their years of work experience $x_2$:`,
    x1: [0, 5],
    x2: [1, 9],
    y: (x1, x2) => 8 + 2 * x1 + Math.round(x2 / 2),
  },
  demand: {
    lead: (n) =>
      `In ${n} towns a firm records the quantity $y$ of its product sold per week (in hundreds), its price $x_1$ and average household income $x_2$ (in thousands):`,
    x1: [2, 9],
    x2: [1, 9],
    y: (x1, x2) => 40 - 3 * x1 + 2 * x2,
  },
  production: {
    lead: (n) =>
      `${n} workshops record their daily output $y$, the number of workers $x_1$ and the number of machines $x_2$:`,
    x1: [1, 8],
    x2: [1, 6],
    y: (x1, x2) => 5 + 4 * x1 + 6 * x2,
  },
};

const sum = (vs: number[]) => vs.reduce((s, v) => s + v, 0);
const dot = (a: number[], b: number[]) => sum(a.map((v, i) => v * (b[i] ?? 0)));

/** The two columns (of X, or y) whose products are added up for the entry asked for. */
function columnsOf(p: Params): [number[], number[]] {
  const ones = p.x1s.map(() => 1);
  switch (p.kind) {
    case 'sum-x1':
      return [ones, p.x1s];
    case 'sq-x1':
      return [p.x1s, p.x1s];
    case 'sq-x2':
      return [p.x2s, p.x2s];
    case 'cross':
      return [p.x1s, p.x2s];
    case 'xy1':
      return [p.x1s, p.ys];
    case 'xy2':
      return [p.x2s, p.ys];
  }
}

const target = (p: Params) => {
  const [a, b] = columnsOf(p);
  return dot(a, b);
};

/** The entry's name, e.g. (X^\top X)_{23} or (X^\top y)_{2}. */
function entryLatex(p: Params): string {
  switch (p.kind) {
    case 'sum-x1':
      return '(X^\\top X)_{12}';
    case 'sq-x1':
      return '(X^\\top X)_{22}';
    case 'sq-x2':
      return '(X^\\top X)_{33}';
    case 'cross':
      return p.swapped ? '(X^\\top X)_{32}' : '(X^\\top X)_{23}';
    case 'xy1':
      return '(X^\\top y)_{2}';
    case 'xy2':
      return '(X^\\top y)_{3}';
  }
}

/** The entry as a sum, e.g. \sum x_{i1} x_{i2}. */
function sumLatex(p: Params): string {
  switch (p.kind) {
    case 'sum-x1':
      return '\\sum 1 \\cdot x_{i1} = \\sum x_{i1}';
    case 'sq-x1':
      return '\\sum x_{i1}^2';
    case 'sq-x2':
      return '\\sum x_{i2}^2';
    case 'cross':
      return '\\sum x_{i1} x_{i2}';
    case 'xy1':
      return '\\sum x_{i1} y_i';
    case 'xy2':
      return '\\sum x_{i2} y_i';
  }
}

/** Which columns of X the entry combines, in words. */
function whichColumns(p: Params): string {
  switch (p.kind) {
    case 'sum-x1':
      return 'Entry (1, 2) of XᵀX is column 1 of X (the ones) times column 2 (x₁), so it is simply the total of x₁.';
    case 'sq-x1':
      return 'Entry (2, 2) of XᵀX is column 2 of X (x₁) times itself.';
    case 'sq-x2':
      return 'Entry (3, 3) of XᵀX is column 3 of X (x₂) times itself.';
    case 'cross':
      return `Entry (${p.swapped ? '3, 2' : '2, 3'}) of XᵀX is column 2 of X (x₁) times column 3 (x₂); XᵀX is symmetric, so (2, 3) and (3, 2) are the same number.`;
    case 'xy1':
      return 'Entry 2 of Xᵀy is column 2 of X (x₁) times the vector y.';
    case 'xy2':
      return 'Entry 3 of Xᵀy is column 3 of X (x₂) times the vector y.';
  }
}

function candidates(p: Params): Distractor[] {
  const [a, b] = columnsOf(p);
  const n = p.x1s.length;
  const out: Distractor[] = [{ value: sum(a) * sum(b), mistakeCode: 'PRODUCT_OF_SUMS' }];
  // Without the column of ones, x₁ would be column 1 and x₂ column 2 of X.
  if (p.kind === 'sum-x1')
    out.push({ value: dot(p.x1s, p.x2s), mistakeCode: 'NO_INTERCEPT_COLUMN' });
  if (p.kind === 'sq-x1')
    out.push({ value: dot(p.x2s, p.x2s), mistakeCode: 'NO_INTERCEPT_COLUMN' });
  if (p.kind === 'xy1') out.push({ value: dot(p.x2s, p.ys), mistakeCode: 'NO_INTERCEPT_COLUMN' });
  if (p.kind !== 'sum-x1') {
    // Σ(a − ā)(b − b̄) = Σab − ΣaΣb/n, the centred sum, rounded to 2 decimals.
    out.push({
      value: Math.round((dot(a, b) - (sum(a) * sum(b)) / n) * 100) / 100,
      mistakeCode: 'USED_DEVIATIONS',
    });
  }
  return out;
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);

/** A table of the data, one column per observation. */
const tableLatex = (p: Params) =>
  `\\begin{array}{c|${'c'.repeat(p.ys.length)}} y & ${p.ys.map((v) => num(v)).join(' & ')} \\\\ \\hline x_1 & ${p.x1s.map((v) => num(v)).join(' & ')} \\\\ x_2 & ${p.x2s.map((v) => num(v)).join(' & ')} \\end{array}`;

/** The design matrix X with its column of ones. */
const designLatex = (p: Params) =>
  `X = \\begin{pmatrix} ${p.x1s.map((x, i) => `1 & ${num(x)} & ${num(p.x2s[i] ?? 0)}`).join(' \\\\ ')} \\end{pmatrix}`;

/** A number in a product, in brackets when negative. */
const factor = (v: number) => (v < 0 ? `(${num(v)})` : num(v));

/** EM01, difficulty 1: one entry of XᵀX or Xᵀy (a sum of products of columns) from a small data table. */
export const xtxEntryFromData: Generator<Params> = {
  id: 'xtx-entry-from-data',
  title: 'Entry of XᵀX or Xᵀy',
  topicId: 'EM01',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['wages', 'demand', 'production'] as const);
      const r = RECIPES[context];
      const n = rng.int(4, 5);
      const x1s = Array.from({ length: n }, () => rng.int(r.x1[0], r.x1[1]));
      const x2s = Array.from({ length: n }, () => rng.int(r.x2[0], r.x2[1]));
      const ys = x1s.map((x1, i) => r.y(x1, x2s[i] ?? 0) + rng.int(-2, 2));
      if (ys.some((y) => y < 1)) continue;
      // X must have full column rank: neither regressor constant, and x₂ not a straight line
      // in x₁. These are n² times the centred sums, in whole numbers.
      const c11 = n * dot(x1s, x1s) - sum(x1s) ** 2;
      const c22 = n * dot(x2s, x2s) - sum(x2s) ** 2;
      const c12 = n * dot(x1s, x2s) - sum(x1s) * sum(x2s);
      if (c11 * c22 - c12 * c12 === 0) continue;
      const p: Params = {
        context,
        x1s,
        x2s,
        ys,
        kind: rng.pick(KINDS),
        swapped: rng.int(0, 1) === 1,
      };
      if (p.kind !== 'cross') p.swapped = false;
      // Every mistake must lead to its own wrong number.
      if (kept(p).length === candidates(p).length) return p;
    }
  },

  stem: (p) =>
    `${RECIPES[p.context].lead(p.ys.length)} $${tableLatex(p)}$ The model $y = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + u$ is written as $y = X\\beta + u$, where the first column of $X$ is a column of ones. Find the entry $${entryLatex(p)}$.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [a, b] = columnsOf(p);
    const products = a.map((v, i) => `${factor(v)} \\cdot ${factor(b[i] ?? 0)}`).join(' + ');
    return [
      {
        text: 'Write down the design matrix X, one row per observation.',
        latex: designLatex(p),
        why: 'The first column of ones carries the intercept β₀, so x₁ is column 2 of X and x₂ is column 3.',
      },
      {
        text: 'Find which two columns the entry combines.',
        latex: `${entryLatex(p)} = ${sumLatex(p)}`,
        why: `Row j of Xᵀ is column j of X, so every entry of XᵀX or Xᵀy is a sum of products of two columns. ${whichColumns(p)}`,
      },
      {
        text: 'Multiply observation by observation and add.',
        latex: `${sumLatex(p)} = ${products} = ${num(target(p))}`,
        why: 'Each observation contributes the product of its own two values; the products are added, not the column totals multiplied.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
