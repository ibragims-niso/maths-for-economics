import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { inequality, lhs, type Point, point, value } from '../OP02/lp';
import { drawRegion, EXACT, type Region, regionCorners, strictArgMax } from './region';

interface Params {
  region: Region;
  /** Profit per tonne of A is base + t; profit per tonne of B is q. */
  base: number;
  q: number;
  /** The value of the parameter t the question asks about (not 0). */
  t: number;
}

const corners = (p: Params) => regionCorners(p.region);
const profits = (p: Params, t: number) => corners(p).map((pt) => value(p.base + t, p.q, pt));
const optimum = (p: Params, t: number) => Math.max(...profits(p, t));
const bestCorner = (p: Params, t: number) => {
  const zs = profits(p, t);
  return corners(p)[zs.indexOf(Math.max(...zs))] as Point;
};

const candidates = (p: Params) => [
  { value: value(p.base + p.t, p.q, bestCorner(p, 0)), mistakeCode: 'KEPT_OLD_PLAN' },
  { value: optimum(p, 0), mistakeCode: 'IGNORED_PARAMETER' },
];

/** "3x + 2y" with the coefficient of x written as a function of t, e.g. "(3 + t)x + 2y". */
const objective = (p: Params) => `(${num(p.base)} + t)x + ${num(p.q)}y`;

/** z at a corner as a linear function of t, e.g. "80 + 20t". */
function zOfT(p: Params, [x, y]: Point) {
  const constant = value(p.base, p.q, [x, y]);
  if (x === 0) return num(constant);
  return `${num(constant)} + ${x === 1 ? '' : num(x)}t`;
}

/** OP06, difficulty 3: the optimal profit of a two-product LP when one profit coefficient is base + t. */
export const parametricLpOptimalValue: Generator<Params> = {
  id: 'parametric-lp-optimal-value',
  title: 'Optimal profit after a price change',
  topicId: 'OP06',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const region = drawRegion(rng, 200);
      if (!region) continue;
      const p: Params = { region, base: rng.int(2, 12), q: rng.int(2, 12), t: 0 };
      // The plan at t = 0 must be a single corner.
      const old = strictArgMax(profits(p, 0));
      if (old === -1) continue;
      p.t = rng.next() < 0.5 ? -rng.int(1, p.base - 1) : rng.int(1, 10);
      if (p.base + p.t < 1) continue;
      const now = strictArgMax(profits(p, p.t));
      // The price change moves the best plan to a different corner.
      if (now === -1 || now === old) continue;
      const answer = optimum(p, p.t);
      if (cleanDistractors(answer, candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 2)
        continue;
      return p;
    }
  },

  stem(p) {
    const r = p.region;
    return `A plant makes $x$ tonnes of product A and $y$ tonnes of product B a week, with $${inequality(r.first)}$, $${inequality(r.second)}$ and $x, y \\ge 0$. The profit is $z = ${objective(p)}$, where $t$ is the change in the profit per tonne of A. What is the largest weekly profit when $t = ${num(p.t)}$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: optimum(p, p.t), decimals: 0, ...EXACT }),

  steps(p) {
    const [onX, both, onY] = corners(p);
    const r = p.region;
    const old = bestCorner(p, 0);
    const now = bestCorner(p, p.t);
    const atT = (pt: Point) => `z${point(pt)} = ${num(value(p.base + p.t, p.q, pt))}`;
    return [
      {
        text: 'Find the corners of the feasible region.',
        latex: `\\begin{cases} ${lhs(r.first.a, r.first.b)} = ${num(r.first.c)} \\\\ ${lhs(r.second.a, r.second.b)} = ${num(r.second.c)} \\end{cases} \\Rightarrow ${point(both)};\\quad \\text{axes: } ${point(onX)},\\ ${point(onY)}`,
        why: 'Changing a profit coefficient moves the objective, not the constraints, so the region and its corners stay the same for every t.',
      },
      {
        text: 'Write the profit at each corner as a function of t.',
        latex: corners(p)
          .map((pt) => `z${point(pt)} = ${zOfT(p, pt)}`)
          .join(',\\quad '),
        why: 'At a fixed plan, profit is linear in t with slope equal to the tonnes of A in that plan. The optimal value z*(t) is the highest of these lines, so it is piecewise linear in t.',
      },
      {
        text: `At t = 0 the best plan is (${old[0]}, ${old[1]}), with profit ${optimum(p, 0)}; now put t = ${num(p.t)} into each line.`,
        latex: `${corners(p).map(atT).join(',\\; ')}`,
        why: 'A price change can make a different corner the best, so every corner has to be checked again, not only the old plan.',
      },
      {
        text: 'The largest of these is the optimal profit at the new price.',
        latex: `z^*(${num(p.t)}) = ${num(optimum(p, p.t))} \\text{ at } ${point(now)}`,
        why: 'The plan switches where two corner lines cross; past that value of t the other corner earns more.',
        result: optimum(p, p.t),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(optimum(p, p.t), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
