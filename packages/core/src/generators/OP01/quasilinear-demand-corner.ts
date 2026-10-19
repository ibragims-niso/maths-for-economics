import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Utility U = a·ln x + y; a = p·k, so the interior demand a/p = k is whole. */
  a: number;
  /** Price of good x; y is money left for other goods, with price 1. */
  p: number;
  /** Income, either below a (corner: y = 0) or above it (interior). */
  income: number;
}

/** Whole-number answers are exact, so the tolerance is tight. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** True when income is too low for the interior solution: the consumer buys no y. */
export const isCorner = (p: Params) => p.income < p.a;

/** Demand for x: a/p while income covers it, otherwise all income M/p. */
export const demandX = (p: Params) => Math.min(p.a, p.income) / p.p;

/** Money left for other goods at the optimum. */
export const demandY = (p: Params) => p.income - p.p * demandX(p);

/** Wrong answers from common mistakes, with duplicates removed. */
const wrongAnswers = (p: Params) =>
  cleanDistractors(
    demandX(p),
    [
      { value: p.a / p.p, mistakeCode: 'INTERIOR_ASSUMED' },
      { value: p.income / p.p, mistakeCode: 'ALL_INCOME_ON_X' },
      { value: Math.min(p.a, p.income), mistakeCode: 'FORGOT_PRICE' },
      { value: demandY(p), mistakeCode: 'GAVE_OTHER_GOOD' },
    ],
    EXACT.tolerance,
    EXACT.relTolerance,
  );

/** OP01, difficulty 1: demand for x with quasilinear utility a·ln x + y, which may be a corner. */
export const quasilinearDemandCorner: Generator<Params> = {
  id: 'quasilinear-demand-corner',
  title: 'Quasilinear demand with a corner',
  topicId: 'OP01',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p = rng.int(2, 12);
      const k = rng.int(3, 30);
      const a = p * k;
      // Half the draws are corners: income below a, a whole multiple of the price.
      const income = rng.next() < 0.5 ? p * rng.int(1, k - 1) : a + rng.int(1, 120);
      const params = { a, p, income };
      // Keep draws where at least two wrong answers stay distinct from the answer and each other.
      if (wrongAnswers(params).length < 2) continue;
      return params;
    }
  },

  stem: (p) =>
    `A consumer has utility $U = ${num(p.a)}\\ln x + y$, where $x$ is the quantity of a good with price $${num(p.p)}$ and $y$ is money spent on everything else. Her income is $${num(p.income)}$, so $${num(p.p)}x + y \\le ${num(p.income)}$ with $x, y \\ge 0$. How many units of $x$ does she buy?`,

  answer: (p) => ({ kind: 'numeric', value: demandX(p), decimals: 2, ...EXACT }),

  steps(p) {
    const interior = p.a / p.p;
    const leftover = p.income - p.a;
    const first = [
      {
        text: 'Try the interior case: the budget binds and y > 0, so both partial derivatives of the Lagrangian are zero.',
        latex: `\\mathcal{L} = ${num(p.a)}\\ln x + y - \\lambda(${num(p.p)}x + y - ${num(p.income)}), \\quad \\frac{\\partial \\mathcal{L}}{\\partial y} = 1 - \\lambda = 0, \\quad \\frac{\\partial \\mathcal{L}}{\\partial x} = \\frac{${num(p.a)}}{x} - ${num(p.p)}\\lambda = 0 \\;\\Rightarrow\\; x = \\frac{${num(p.a)}}{${num(p.p)}} = ${num(interior)}`,
        why: 'With y > 0 its Kuhn–Tucker condition holds with equality, so λ = 1: one unit of money is worth one unit of utility. Then the marginal utility of x, a/x, must equal its price.',
        result: interior,
      },
      {
        text: 'Check that the money left for y is not negative.',
        latex: `y = ${num(p.income)} - ${num(p.p)} \\cdot ${num(interior)} = ${num(leftover)}`,
        why: 'The interior case is only valid if it satisfies y ≥ 0. Quasilinear demand for x does not depend on income, so with a small income the formula can ask for more than she has.',
      },
    ];
    if (!isCorner(p)) {
      return [
        ...first,
        {
          text: 'The leftover is positive, so the interior solution is the optimum.',
          latex: `x^* = ${num(interior)}, \\quad y^* = ${num(leftover)}`,
          why: 'All Kuhn–Tucker conditions hold: the budget binds with λ = 1 > 0, and y > 0 with ∂L/∂y = 0. Utility is concave and the budget is linear, so the conditions are sufficient.',
          result: interior,
        },
      ];
    }
    const lambda = p.a / p.income;
    return [
      ...first,
      {
        text: 'The leftover is negative, so try the corner y = 0 and spend all income on x.',
        latex: `y^* = 0, \\quad x^* = \\frac{${num(p.income)}}{${num(p.p)}} = ${num(demandX(p))}`,
        why: 'A negative y is not allowed. The constraint y ≥ 0 binds, and the budget still binds because more x always raises utility.',
        result: demandX(p),
      },
      {
        text: 'Check the Kuhn–Tucker conditions at the corner.',
        latex: `\\lambda = \\frac{${num(p.a)}}{${num(p.p)} \\cdot ${num(demandX(p))}} = ${num(lambda)} > 0, \\quad \\frac{\\partial \\mathcal{L}}{\\partial y} = 1 - ${num(lambda)} = ${num(1 - lambda)} \\le 0`,
        why: 'λ comes from ∂L/∂x = 0, since x > 0. At y = 0 the derivative for y may be negative: a unit of money spent on x is worth more than one spent on other goods, so she would buy negative y if she could.',
      },
    ];
  },

  distractors: (p) => wrongAnswers(p),
};
