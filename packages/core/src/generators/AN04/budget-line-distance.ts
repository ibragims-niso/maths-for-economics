import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Prices of the two goods. */
  p1: number;
  p2: number;
  /** Income. */
  M: number;
  /** The bundle (a, b). */
  a: number;
  b: number;
}

/** "3x + 4y", writing 1·x as x. */
export const budgetLhs = (p1: number, p2: number) =>
  `${p1 === 1 ? '' : num(p1)}x + ${p2 === 1 ? '' : num(p2)}y`;

/** "=" when the shown value is exact, "≈" when it is rounded. */
const eq = (exact: number, shown: number) => (Math.abs(exact - shown) < 1e-9 ? '=' : '\\approx');

/** Two decimals, graded to the nearest hundredth. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** p·x − M: negative inside the budget set, positive outside, zero on the budget line. */
export const costGap = (p: Params) => p.p1 * p.a + p.p2 * p.b - p.M;

/** ‖p‖ = √(p₁² + p₂²). */
export const priceNorm = (p: Pick<Params, 'p1' | 'p2'>) => Math.sqrt(p.p1 ** 2 + p.p2 ** 2);

/** The distance from the bundle to the line p₁x + p₂y = M: |p·x − M| / ‖p‖. */
const distance = (p: Params) => round(Math.abs(costGap(p)) / priceNorm(p), 2);

function candidates(p: Params) {
  const gap = Math.abs(costGap(p));
  return [
    { value: gap, mistakeCode: 'FORGOT_NORM' },
    { value: round(gap / (p.p1 ** 2 + p.p2 ** 2), 2), mistakeCode: 'SQUARED_NORM' },
    { value: round(gap / Math.max(p.p1, p.p2), 2), mistakeCode: 'AXIS_ONLY' },
  ];
}

/** AN04, difficulty 1: the distance from a bundle to the budget line p₁x + p₂y = M. */
export const budgetLineDistance: Generator<Params> = {
  id: 'budget-line-distance',
  title: 'Distance to the budget line',
  topicId: 'AN04',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const p: Params = {
        p1: rng.int(1, 9),
        p2: rng.int(1, 9),
        M: rng.int(4, 40) * 5,
        a: rng.int(0, 25),
        b: rng.int(0, 25),
      };
      const gap = costGap(p);
      if (gap === 0) continue;
      // Keep the bundle near the budget set: at most 40 % of the income away in cost.
      if (Math.abs(gap) * 5 > 2 * p.M) continue;
      if (distance(p) < 0.2) continue;
      if (
        cleanDistractors(distance(p), candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 2
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer faces prices $p_1 = ${num(p.p1)}$, $p_2 = ${num(p.p2)}$ and has income $M = ${num(p.M)}$. How far is the bundle $(${num(p.a)}, ${num(p.b)})$ from the budget line $${budgetLhs(p.p1, p.p2)} = ${num(p.M)}$, measured by the Euclidean distance (the shortest distance to any point of the line)?${Number.isInteger(distance(p)) ? '' : ' Give your answer to 2 decimal places.'}`,

  answer: (p) => ({ kind: 'numeric', value: distance(p), decimals: 2, ...EXACT }),

  steps(p) {
    const cost = p.p1 * p.a + p.p2 * p.b;
    const gap = Math.abs(costGap(p));
    const sq = p.p1 ** 2 + p.p2 ** 2;
    const inside = costGap(p) < 0;
    return [
      {
        text: 'Find the cost of the bundle and compare it with income.',
        latex: `p \\cdot x = ${num(p.p1)} \\cdot ${num(p.a)} + ${num(p.p2)} \\cdot ${num(p.b)} = ${num(cost)}, \\quad |p \\cdot x - M| = ${num(gap)}`,
        why: inside
          ? `The bundle costs less than ${p.M}, so it lies inside the budget set; ${gap} of income is left over.`
          : `The bundle costs more than ${p.M}, so it lies outside the budget set; it is ${gap} too expensive.`,
        result: gap,
      },
      {
        text: 'Find the length of the price vector.',
        latex: `\\|p\\| = \\sqrt{${num(p.p1)}^2 + ${num(p.p2)}^2} = \\sqrt{${num(sq)}} ${eq(priceNorm(p), round(priceNorm(p), 4))} ${num(priceNorm(p), 4)}`,
        why: 'The price vector p is at a right angle to the budget line, so the shortest route from the bundle to the line runs along p.',
        result: priceNorm(p),
      },
      {
        text: 'Divide the money gap by the length of p.',
        latex: `d = \\frac{|p \\cdot x - M|}{\\|p\\|} = \\frac{${num(gap)}}{${num(priceNorm(p), 4)}} ${eq(gap / priceNorm(p), distance(p))} ${num(distance(p))}`,
        why: 'One step of length 1 along p changes the cost by ‖p‖, so closing a money gap of |p·x − M| takes a step of length |p·x − M|/‖p‖. The money gap alone is in units of money, not of distance.',
        result: distance(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(distance(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
