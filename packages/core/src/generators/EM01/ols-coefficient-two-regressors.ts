import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** The economic settings: what y, x₁ and x₂ are. */
type Context = 'wages' | 'demand' | 'production';

interface Params {
  context: Context;
  /** The centred moment matrix (a c; c d): Σx̃₁², Σx̃₁x̃₂, Σx̃₂². Whole multiples of 10. */
  a: number;
  c: number;
  d: number;
  /** The coefficients the data were built from; they are exactly the OLS solution. */
  b1: number;
  b2: number;
  /** The coefficient asked for: 1 or 2. */
  j: 1 | 2;
}

/** The answer is exact to 1 decimal, so only a correctly rounded value is accepted. */
const TWO_DP = { tolerance: 0.005, relTolerance: 0 } as const;

interface Recipe {
  lead: string;
  /** Names of x₁ and x₂, for the question and the interpretation. */
  names: [string, string];
  /** Allowed coefficients, in tenths. */
  b1: [number, number];
  b2: [number, number];
  /** What a one-unit rise in x₁ or x₂ means, for the interpretation. */
  unit: [string, string];
  /** What y measures. */
  y: string;
}

const RECIPES: Readonly<Record<Context, Recipe>> = {
  wages: {
    lead: 'A wage equation regresses the hourly wage $y$ on an intercept, years of education $x_1$ and years of work experience $x_2$.',
    names: ['education', 'experience'],
    b1: [5, 30],
    b2: [1, 10],
    unit: ['year of education', 'year of experience'],
    y: 'an hourly wage',
  },
  demand: {
    lead: 'A demand equation regresses weekly sales $y$ on an intercept, the price $x_1$ and average household income $x_2$.',
    names: ['price', 'income'],
    b1: [-50, -5],
    b2: [2, 30],
    unit: ['unit of price', 'unit of income'],
    y: 'weekly sales',
  },
  production: {
    lead: 'A factory regresses daily output $y$ on an intercept, labour hours $x_1$ and machine hours $x_2$.',
    names: ['labour hours', 'machine hours'],
    b1: [5, 40],
    b2: [5, 40],
    unit: ['labour hour', 'machine hour'],
    y: 'daily output',
  },
};

const det = (p: Params) => p.a * p.d - p.c * p.c;
/** X̃ᵀỹ = M b, whole numbers because M is in tens and b in tenths. */
const g = (p: Params): [number, number] => [
  round(p.a * p.b1 + p.c * p.b2, 6),
  round(p.c * p.b1 + p.d * p.b2, 6),
];
const target = (p: Params) => (p.j === 1 ? p.b1 : p.b2);

/**
 * For coefficient j: its own diagonal entry M_jj, the other diagonal entry M_kk, and g_j, g_k.
 * The correct coefficient is b_j = (M_kk·g_j − c·g_k)/det.
 */
function parts(p: Params) {
  const [g1, g2] = g(p);
  return p.j === 1
    ? { own: p.a, other: p.d, gj: g1, gk: g2 }
    : { own: p.d, other: p.a, gj: g2, gk: g1 };
}

function candidates(p: Params): Distractor[] {
  const D = det(p);
  const { own, other, gj, gk } = parts(p);
  return [
    { value: round(gj / own, 2), mistakeCode: 'OMITTED_REGRESSOR' },
    { value: round(own * gj + p.c * gk, 2), mistakeCode: 'NO_INVERSE' },
    { value: round((other * gj + p.c * gk) / D, 2), mistakeCode: 'NO_SIGN_CHANGE' },
    { value: round((own * gj - p.c * gk) / D, 2), mistakeCode: 'NO_DIAGONAL_SWAP' },
  ];
}

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), TWO_DP.tolerance, TWO_DP.relTolerance);

const mat = (rows: number[][]) =>
  `\\begin{pmatrix} ${rows.map((r) => r.map((v) => num(v)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;
const factor = (v: number) => (v < 0 ? `(${num(v)})` : num(v));
/** A number for plain text, with a real minus sign and no LaTeX thousands braces. */
const plain = (v: number) => num(v).replace('-', '−').replace('{,}', ',');

/** EM01, difficulty 3: one OLS slope from the centred normal equations X̃ᵀX̃ b = X̃ᵀỹ with two regressors. */
export const olsCoefficientTwoRegressors: Generator<Params> = {
  id: 'ols-coefficient-two-regressors',
  title: 'OLS coefficient with two regressors',
  topicId: 'EM01',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['wages', 'demand', 'production'] as const);
      const r = RECIPES[context];
      const a = 10 * rng.int(2, 40);
      const d = 10 * rng.int(2, 40);
      const c = 10 * rng.int(-20, 20);
      const corr = Math.abs(c) / Math.sqrt(a * d);
      // The regressors are correlated, but not almost perfectly (that would be near-collinearity).
      if (corr < 0.2 || corr > 0.8) continue;
      const p: Params = {
        context,
        a,
        c,
        d,
        b1: rng.int(r.b1[0], r.b1[1]) / 10,
        b2: rng.int(r.b2[0], r.b2[1]) / 10,
        j: rng.int(1, 2) === 1 ? 1 : 2,
      };
      // Every mistake must lead to its own wrong number.
      if (kept(p).length === 4) return p;
    }
  },

  stem(p) {
    const r = RECIPES[p.context];
    const [g1, g2] = g(p);
    return `${r.lead} After subtracting each variable's mean, the sums of squares and cross-products of the data are $\\tilde X^\\top \\tilde X = ${mat(
      [
        [p.a, p.c],
        [p.c, p.d],
      ],
    )}$ and $\\tilde X^\\top \\tilde y = ${mat([[g1], [g2]])}$, where the two columns of $\\tilde X$ are $x_1$ and $x_2$ in deviations from their means. Find the OLS coefficient $b_${p.j}$ on ${r.names[p.j - 1]}. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const r = RECIPES[p.context];
    const D = det(p);
    const [g1, g2] = g(p);
    const { other: kk, gj, gk } = parts(p);
    const value = target(p);
    const held = r.names[2 - p.j];
    const rise = value >= 0 ? 'higher' : 'lower';
    return [
      {
        text: 'Write the normal equations for the two slopes.',
        latex: `\\tilde X^\\top \\tilde X \\begin{pmatrix} b_1 \\\\ b_2 \\end{pmatrix} = \\tilde X^\\top \\tilde y \\;\\Rightarrow\\; \\begin{pmatrix} b_1 \\\\ b_2 \\end{pmatrix} = (\\tilde X^\\top \\tilde X)^{-1} \\tilde X^\\top \\tilde y`,
        why: 'With an intercept in the model, its own normal equation gives b₀ = ȳ − b₁x̄₁ − b₂x̄₂. Putting that into the other two leaves this 2×2 system in deviations from the means.',
      },
      {
        text: 'Find the determinant of the 2×2 matrix.',
        latex: `\\det = ${num(p.a)} \\cdot ${num(p.d)} - ${factor(p.c)}^2 = ${num(D)}`,
        why: 'The determinant is positive because x₁ and x₂ are not perfectly correlated, so the matrix can be inverted and the coefficients are unique.',
        result: D,
      },
      {
        text: 'Invert: swap the diagonal entries, change the sign of the off-diagonal ones, divide by the determinant.',
        latex: `(\\tilde X^\\top \\tilde X)^{-1} = \\dfrac{1}{${num(D)}} ${mat([
          [p.d, -p.c],
          [-p.c, p.a],
        ])}`,
        why: 'This is the 2×2 inverse formula (LA105): the inverse of (a c; c d) is (d −c; −c a) divided by ad − c².',
      },
      {
        text: `Multiply row ${p.j} of the inverse by the vector X̃ᵀỹ.`,
        latex: `b_${p.j} = \\dfrac{${num(kk)} \\cdot ${factor(gj)} - ${factor(p.c)} \\cdot ${factor(gk)}}{${num(D)}} = \\dfrac{${num(round(kk * gj - p.c * gk, 6))}}{${num(D)}} = ${num(value)}`,
        why: `Both entries of X̃ᵀỹ (${plain(g1)} and ${plain(g2)}) enter, because x₁ and x₂ move together. So b${p.j === 1 ? '₁' : '₂'} = ${plain(value)}: one more ${r.unit[p.j - 1]} goes with ${r.y} ${num(Math.abs(value))} ${rise}, holding ${held} constant.`,
        result: value,
      },
    ];
  },

  distractors: (p) => kept(p),
};
