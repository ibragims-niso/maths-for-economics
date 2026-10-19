import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { type Point, point, value } from '../OP02/lp';
import { drawRegion, type Region, regionCorners, strictArgMax } from './region';

interface Params {
  region: Region;
  /** Profit per unit of A and of B. */
  p: number;
  q: number;
  /** Variable cost per unit of A and of B, and the fixed cost. */
  u: number;
  w: number;
  fixed: number;
}

/** Ratios to 2 decimal places: allow only rounding in the last place. */
const RATIO = { tolerance: 0.01, relTolerance: 0 } as const;

const profit = (p: Params, pt: Point) => value(p.p, p.q, pt);
const cost = (p: Params, pt: Point) => value(p.u, p.w, pt) + p.fixed;
const ratioAt = (p: Params, pt: Point) => profit(p, pt) / cost(p, pt);

/** The three corners other than the origin, where the ratio is 0. */
const corners = (p: Params) => regionCorners(p.region);
const ratios = (p: Params) => corners(p).map((pt) => ratioAt(p, pt));

const best = (p: Params) => Math.max(...ratios(p));

/** The ratio at the corner with the largest profit, the plan a profit-maximiser would choose. */
function atMaxProfit(p: Params) {
  const profits = corners(p).map((pt) => profit(p, pt));
  return ratios(p)[profits.indexOf(Math.max(...profits))] ?? 0;
}

/** Largest profit over smallest cost, each taken at its own corner (the origin has the least cost). */
const separateExtremes = (p: Params) =>
  Math.max(...corners(p).map((pt) => profit(p, pt))) / p.fixed;

const candidates = (p: Params) => [
  { value: round(atMaxProfit(p), 2), mistakeCode: 'MAX_PROFIT_CORNER' },
  { value: round(separateExtremes(p), 2), mistakeCode: 'SEPARATE_EXTREMES' },
];

/** OP06, difficulty 1: the largest profit-to-cost ratio over a region with four given corners. */
export const profitCostRatioBestCorner: Generator<Params> = {
  id: 'profit-cost-ratio-best-corner',
  title: 'Best profit-to-cost ratio',
  topicId: 'OP06',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const region = drawRegion(rng, 240);
      if (!region) continue;
      const [onX, , onY] = regionCorners(region);
      if (onX[0] > 80 || onY[1] > 80) continue;
      const p: Params = {
        region,
        p: rng.int(2, 12),
        q: rng.int(2, 12),
        u: rng.int(1, 10),
        w: rng.int(1, 10),
        fixed: 10 * rng.int(1, 30),
      };
      const rs = ratios(p);
      const top = strictArgMax(rs);
      const profits = corners(p).map((pt) => profit(p, pt));
      const richest = strictArgMax(profits);
      // One clear best ratio, at a different corner from the one with the most profit.
      if (top === -1 || richest === -1 || top === richest) continue;
      const others = rs.filter((_, i) => i !== top);
      if (others.some((r) => best(p) - r < 0.02)) continue;
      if (best(p) < 0.2 || best(p) > 5) continue;
      if (
        cleanDistractors(round(best(p), 2), candidates(p), RATIO.tolerance, RATIO.relTolerance)
          .length < 2
      )
        continue;
      return p;
    }
  },

  stem(p) {
    const [onX, both, onY] = corners(p);
    return `A firm makes $x$ units of product A and $y$ units of product B. Its feasible plans form the region with corners $(0, 0)$, $${point(onX)}$, $${point(both)}$ and $${point(onY)}$. Profit is $${num(p.p)}x + ${num(p.q)}y$ and total cost is $${num(p.u)}x + ${num(p.w)}y + ${num(p.fixed)}$. What is the largest profitability $R = \\dfrac{\\text{profit}}{\\text{cost}}$ the firm can reach? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(best(p), 2), decimals: 2, ...RATIO }),

  steps(p) {
    const ratioLatex = (pt: Point) =>
      `R${point(pt)} = \\tfrac{${num(profit(p, pt))}}{${num(cost(p, pt))}} \\approx ${num(ratioAt(p, pt))}`;
    const profits = corners(p).map((pt) => profit(p, pt));
    const richest = corners(p)[profits.indexOf(Math.max(...profits))] as Point;
    return [
      {
        text: 'The ratio of two linear functions is largest at a corner of the region, so work out R at every corner.',
        latex: `R(0, 0) = \\tfrac{0}{${num(p.fixed)}} = 0,\\; ${corners(p).map(ratioLatex).join(',\\; ')}`,
        why: 'Every plan with R = k lies on the straight line profit − k·cost = 0, and these lines all turn about one point as k changes. The last line that still touches the region does so at a corner.',
      },
      {
        text: 'Compare with the plan that earns the most profit.',
        latex: `\\pi${point(richest)} = ${num(Math.max(...profits))} \\text{ is the largest profit, but } R${point(richest)} \\approx ${num(atMaxProfit(p))}`,
        why: 'Profitability rewards a low cost as well as a high profit, so the most profitable plan per unit of cost need not be the plan with the most profit.',
      },
      {
        text: 'The largest ratio is the answer.',
        latex: `R_{\\max} \\approx ${num(best(p))}`,
        why: 'Every other feasible plan has a ratio no larger than the best corner.',
        result: round(best(p), 2),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(round(best(p), 2), candidates(p), RATIO.tolerance, RATIO.relTolerance),
};
