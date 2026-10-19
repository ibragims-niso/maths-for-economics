import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { budgetLhs } from './budget-line-distance';

interface Params {
  /** Prices of the two goods. */
  p1: number;
  p2: number;
  /** Income; a multiple of both prices, so the corners of the budget set are whole numbers. */
  M: number;
  /** The bundle (a, b), strictly inside the budget set. */
  a: number;
  b: number;
}

/** Two decimals, graded to the nearest hundredth. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Money left over at the bundle, M − p·x (positive: the bundle is strictly inside). */
export const leftover = (p: Params) => p.M - p.p1 * p.a - p.p2 * p.b;

const norm = (p: Params) => Math.sqrt(p.p1 ** 2 + p.p2 ** 2);

/** The distance to the budget line, (M − p·x)/‖p‖, unrounded. */
export const lineDistance = (p: Params) => leftover(p) / norm(p);

/** The largest radius: the distance to the nearest of the three edges x = 0, y = 0, p·x = M. */
const radius = (p: Params) => round(Math.min(p.a, p.b, lineDistance(p)), 2);

/** "=" when the shown value is exact, "≈" when it is rounded. */
const eq = (exact: number, shown: number) => (Math.abs(exact - shown) < 1e-9 ? '=' : '\\approx');

/** The three corners of the budget set. */
export const corners = (p: Params): [number, number][] => [
  [0, 0],
  [p.M / p.p1, 0],
  [0, p.M / p.p2],
];

function candidates(p: Params) {
  const vertex = Math.min(...corners(p).map(([x, y]) => Math.hypot(p.a - x, p.b - y)));
  return [
    { value: round(Math.min(p.a, p.b, leftover(p)), 2), mistakeCode: 'FORGOT_NORM' },
    { value: round(vertex, 2), mistakeCode: 'VERTEX_DISTANCE' },
    {
      value: round(Math.min(p.a, p.b, leftover(p) / Math.max(p.p1, p.p2)), 2),
      mistakeCode: 'AXIS_ONLY',
    },
    { value: round(lineDistance(p), 2), mistakeCode: 'IGNORED_AXES' },
  ];
}

/** AN04, difficulty 3: the largest open ball around an interior bundle that stays in the budget set. */
export const budgetSetLargestBall: Generator<Params> = {
  id: 'budget-set-largest-ball',
  title: 'Largest open ball in a budget set',
  topicId: 'AN04',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p1 = rng.int(1, 8);
      const p2 = rng.int(1, 8);
      const M = rng.int(2, 60) * p1 * p2;
      const x1 = M / p1;
      const x2 = M / p2;
      // Corners between 4 and 30 units: a budget set of readable size.
      if (x1 < 4 || x1 > 30 || x2 < 4 || x2 > 30) continue;
      const p: Params = { p1, p2, M, a: rng.int(1, x1 - 1), b: rng.int(1, x2 - 1) };
      if (leftover(p) <= 0) continue;
      if (radius(p) < 0.3) continue;
      if (
        cleanDistractors(radius(p), candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 2
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer’s budget set is $S = \\{(x, y) : x \\ge 0,\\ y \\ge 0,\\ ${budgetLhs(p.p1, p.p2)} \\le ${num(p.M)}\\}$. The bundle $(${num(p.a)}, ${num(p.b)})$ is an interior point of $S$. Find the largest radius $r$ such that the open ball $B((${num(p.a)}, ${num(p.b)}), r)$ lies inside $S$.${Number.isInteger(radius(p)) ? '' : ' Give your answer to 2 decimal places.'}`,

  answer: (p) => ({ kind: 'numeric', value: radius(p), decimals: 2, ...EXACT }),

  steps(p) {
    const left = leftover(p);
    const sq = p.p1 ** 2 + p.p2 ** 2;
    const d = lineDistance(p);
    const r = radius(p);
    const binding =
      d <= Math.min(p.a, p.b)
        ? 'the budget line'
        : p.a <= p.b
          ? 'the edge x = 0'
          : 'the edge y = 0';
    return [
      {
        text: 'Distances to the two axes.',
        latex: `\\text{to } x = 0: ${num(p.a)}, \\qquad \\text{to } y = 0: ${num(p.b)}`,
        why: 'The edge x = 0 is a vertical line, so the shortest way to it is straight across; the distance is just the x-coordinate. The same holds for y.',
        result: Math.min(p.a, p.b),
      },
      {
        text: 'Distance to the budget line.',
        latex: `\\frac{${num(p.M)} - ${num(p.p1)} \\cdot ${num(p.a)} - ${num(p.p2)} \\cdot ${num(p.b)}}{\\sqrt{${num(p.p1)}^2 + ${num(p.p2)}^2}} = \\frac{${num(left)}}{\\sqrt{${num(sq)}}} ${eq(d, round(d, 4))} ${num(d, 4)}`,
        why: 'The money left over, M − p·x, has to be divided by ‖p‖: a step of length 1 along the price vector raises the cost by ‖p‖, and that is the shortest way to the budget line.',
        result: d,
      },
      {
        text: 'The largest ball reaches the nearest edge.',
        latex: `r = \\min\\{${num(p.a)},\\ ${num(p.b)},\\ ${num(d, 4)}\\} ${eq(Math.min(p.a, p.b, d), r)} ${num(r)}`,
        why: `The ball must stay on the right side of all three edges, so its radius is the smallest of the three distances; here the nearest edge is ${binding}. Any bigger ball pokes across that edge.`,
        result: r,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(radius(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
