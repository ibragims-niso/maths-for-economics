import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { budgetLhs } from './budget-line-distance';

interface Params {
  /** 'cd': U = xy; 'linear': U = αx + βy (perfect substitutes). */
  kind: 'cd' | 'linear';
  /** Weights of a linear utility (unused for U = xy). */
  alpha: number;
  beta: number;
  /** Prices of the two goods. */
  p1: number;
  p2: number;
  /** Income; chosen so that every corner and the best bundle are whole numbers. */
  M: number;
}

/** The answer is a whole number: graded to the nearest hundredth. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Utility of the bundle (x, y). */
export const utility = (p: Params, x: number, y: number) =>
  p.kind === 'cd' ? x * y : p.alpha * x + p.beta * y;

/** Utility at the corners (M/p₁, 0) and (0, M/p₂) of the budget set. */
const cornerValues = (p: Params) => [utility(p, p.M / p.p1, 0), utility(p, 0, p.M / p.p2)];

/** The best bundle: the tangency (M/2p₁, M/2p₂) for xy, the better corner for a linear utility. */
export function bestBundle(p: Params): [number, number] {
  if (p.kind === 'cd') return [p.M / (2 * p.p1), p.M / (2 * p.p2)];
  return p.alpha * p.p2 > p.beta * p.p1 ? [p.M / p.p1, 0] : [0, p.M / p.p2];
}

const maxValue = (p: Params) => {
  const [x, y] = bestBundle(p);
  return utility(p, x, y);
};

function candidates(p: Params) {
  const centre = round(utility(p, p.M / (3 * p.p1), p.M / (3 * p.p2)), 2);
  const box = utility(p, p.M / p.p1, p.M / p.p2);
  const [u1, u2] = cornerValues(p);
  return [
    { value: centre, mistakeCode: 'CENTRE_VALUE' },
    { value: box, mistakeCode: 'BOX_CORNER' },
    p.kind === 'cd'
      ? { value: 0, mistakeCode: 'CORNER_ONLY' }
      : { value: Math.min(u1 ?? 0, u2 ?? 0), mistakeCode: 'WRONG_VERTEX' },
  ];
}

const lcm = (a: number, b: number) => {
  let x = a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  return (a * b) / x;
};

const utilityLatex = (p: Params) =>
  p.kind === 'cd'
    ? 'U(x, y) = xy'
    : `U(x, y) = ${p.alpha === 1 ? '' : num(p.alpha)}x + ${p.beta === 1 ? '' : num(p.beta)}y`;

/** AN04, difficulty 2: the maximum of a continuous utility over a compact budget set. */
export const compactBudgetMaxUtility: Generator<Params> = {
  id: 'compact-budget-max-utility',
  title: 'Best bundle in a compact budget set',
  topicId: 'AN04',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const kind = rng.pick(['cd', 'linear'] as const);
      const p1 = rng.int(1, 9);
      const p2 = rng.int(1, 9);
      const L = lcm(p1, p2);
      // For xy the best bundle (M/2p₁, M/2p₂) must be whole: M is a multiple of 2·lcm(p₁, p₂).
      const M = (kind === 'cd' ? 2 : 1) * L * rng.int(1, 20);
      const alpha = rng.int(1, 9);
      const beta = rng.int(1, 9);
      const p: Params =
        kind === 'cd' ? { kind, alpha: 1, beta: 1, p1, p2, M } : { kind, alpha, beta, p1, p2, M };
      if (M < 10 || M > 240) continue;
      if (M / p1 > 60 || M / p2 > 60) continue;
      // A linear utility needs one strictly better corner: α/p₁ ≠ β/p₂, compared in whole numbers.
      if (kind === 'linear' && p.alpha * p2 === p.beta * p1) continue;
      if (maxValue(p) > 5000) continue;
      if (
        cleanDistractors(maxValue(p), candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 3
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer with utility $${utilityLatex(p)}$ faces prices $p_1 = ${num(p.p1)}$, $p_2 = ${num(p.p2)}$ and income $M = ${num(p.M)}$. Her budget set $S = \\{(x, y) : x \\ge 0,\\ y \\ge 0,\\ ${budgetLhs(p.p1, p.p2)} \\le ${num(p.M)}\\}$ is compact and $U$ is continuous, so $U$ attains a maximum on $S$. Find the maximum value of $U$ on $S$.`,

  answer: (p) => ({ kind: 'numeric', value: maxValue(p), decimals: 0, ...EXACT }),

  steps(p) {
    const x1 = p.M / p.p1;
    const x2 = p.M / p.p2;
    const compact = {
      text: 'Check that a maximum exists.',
      latex: `0 \\le x \\le ${num(x1)}, \\quad 0 \\le y \\le ${num(x2)}`,
      why: 'S is closed (it is defined by weak inequalities ≤ and ≥) and bounded (both prices are positive, so neither good can exceed income over its price). Closed and bounded means compact, and a continuous function on a non-empty compact set attains a maximum (Weierstrass).',
    };
    if (p.kind === 'cd') {
      const [bx, by] = bestBundle(p);
      return [
        compact,
        {
          text: 'The best bundle spends all income, so substitute the budget line.',
          latex: `y = \\frac{${num(p.M)} - ${num(p.p1)}x}{${num(p.p2)}}, \\quad U = \\frac{x(${num(p.M)} - ${num(p.p1)}x)}{${num(p.p2)}}`,
          why: 'If money were left over, buying a little more of either good would raise xy, so the maximum lies on the budget line. The corners give U = 0, so they are not the answer.',
        },
        {
          text: 'Set the derivative to zero.',
          latex: `\\frac{dU}{dx} = \\frac{${num(p.M)} - ${num(2 * p.p1)}x}{${num(p.p2)}} = 0 \\Rightarrow x = ${num(bx)}`,
          why: 'Along the budget line U is a downward parabola in x, so its only stationary point is the maximum.',
          result: bx,
        },
        {
          text: 'Find y and the maximum value.',
          latex: `y = \\frac{${num(p.M)} - ${num(p.p1)} \\cdot ${num(bx)}}{${num(p.p2)}} = ${num(by)}, \\quad U = ${num(bx)} \\cdot ${num(by)} = ${num(bx * by)}`,
          why: 'Half of income goes on each good. Weierstrass told us a maximum exists; calculus told us where it is.',
          result: bx * by,
        },
      ];
    }
    const [u1, u2] = cornerValues(p);
    const best = maxValue(p);
    return [
      compact,
      {
        text: 'The maximum is on the budget line, and along it U is linear, so it is at a corner.',
        latex: `U\\left(${num(x1)}, 0\\right) = ${num(p.alpha)} \\cdot ${num(x1)} = ${num(u1 ?? 0)}`,
        why: 'Spending leftover money always raises a utility with positive weights. A linear function along a segment is largest at one of its two ends, so compare the two corners on the axes.',
        result: u1,
      },
      {
        text: 'Value at the other corner.',
        latex: `U\\left(0, ${num(x2)}\\right) = ${num(p.beta)} \\cdot ${num(x2)} = ${num(u2 ?? 0)}`,
        why: 'All income goes on good 2 at this corner.',
        result: u2,
      },
      {
        text: 'Take the larger value.',
        latex: `\\max U = ${num(best)}`,
        why: `Utility per unit of money is α/p₁ = ${num(p.alpha / p.p1, 3)} for good 1 and β/p₂ = ${num(p.beta / p.p2, 3)} for good 2, so all income goes on the good with the higher ratio.`,
        result: best,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(maxValue(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
