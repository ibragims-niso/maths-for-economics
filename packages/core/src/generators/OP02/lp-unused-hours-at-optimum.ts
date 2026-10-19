import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  type Constraint,
  corners,
  gcd,
  inequality,
  lhs,
  type Point,
  point,
  ratio,
  value,
} from './lp';

interface Params {
  /** Welding, painting and assembly hours, from the steepest line to the flattest. */
  machines: [Constraint, Constraint, Constraint];
  /** Profit per city bike and per mountain bike. */
  p: number;
  q: number;
  /** Corner where welding and painting are fully used. */
  first: Point;
  /** Corner where painting and assembly are fully used. */
  second: Point;
}

const NAMES = ['welding', 'painting', 'assembly'] as const;
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** The four corners other than the origin, in order round the region from the x-axis. */
export function bikeCorners(p: Params): Point[] {
  const [w, , a] = p.machines;
  return [[w.c / w.a, 0], p.first, p.second, [0, a.c / a.b]];
}

/** The best corner and the machine that is not fully used there (0 = welding, 2 = assembly). */
export function optimum(p: Params) {
  const pts = bikeCorners(p);
  const profits = pts.map((pt) => value(p.p, p.q, pt));
  const i = profits.indexOf(Math.max(...profits));
  const at = pts[i] as Point;
  const spare: 0 | 2 = i === 1 ? 2 : 0;
  const k = p.machines[spare];
  const used = k.a * at[0] + k.b * at[1];
  return { at, profit: profits[i] as number, spare, used, unused: k.c - used, index: i };
}

/** OP02, difficulty 2: the unused hours of the one machine that is not binding at the optimum. */
export const lpUnusedHoursAtOptimum: Generator<Params> = {
  id: 'lp-unused-hours-at-optimum',
  title: 'Unused machine hours at the best plan',
  topicId: 'OP02',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      // Painting passes through both inner corners; welding is steeper, assembly flatter.
      const pa = rng.int(1, 4);
      const pb = rng.int(1, 4);
      if (gcd(pa, pb) !== 1) continue;
      const first: Point = [rng.int(6, 30), rng.int(2, 20)];
      const steps = rng.int(1, 4);
      const second: Point = [first[0] - steps * pb, first[1] + steps * pa];
      if (second[0] < 2) continue;
      const w = { a: rng.int(1, 6), b: rng.int(1, 6), c: 0 };
      const a = { a: rng.int(1, 6), b: rng.int(1, 6), c: 0 };
      if (gcd(w.a, w.b) !== 1 || gcd(a.a, a.b) !== 1) continue;
      if (w.a * pb - pa * w.b <= 0 || pa * a.b - a.a * pb <= 0) continue;
      w.c = w.a * first[0] + w.b * first[1];
      a.c = a.a * second[0] + a.b * second[1];
      const paint = { a: pa, b: pb, c: pa * first[0] + pb * first[1] };
      if (w.c % w.a !== 0 || a.c % a.b !== 0) continue;
      if (Math.max(w.c, paint.c, a.c) > 400) continue;
      const params: Params = {
        machines: [w, paint, a],
        p: 5 * rng.int(2, 16),
        q: 5 * rng.int(2, 16),
        first,
        second,
      };
      // The region must have exactly these five corners (the origin and the four above).
      if (corners(params.machines, 'le').length !== 5) continue;
      const profits = bikeCorners(params).map((pt) => value(params.p, params.q, pt));
      const top = Math.max(...profits);
      if (profits.filter((v) => v === top).length !== 1) continue;
      // The best plan is an inner corner, so exactly one machine has spare hours.
      if (top !== profits[1] && top !== profits[2]) continue;
      return params;
    }
  },

  stem(p) {
    const [w, paint, a] = p.machines;
    const spare = NAMES[optimum(p).spare];
    return `A workshop assembles $x$ city bikes and $y$ mountain bikes a week. Welding allows $${inequality(w)}$ hours, painting $${inequality(paint)}$ hours and assembly $${inequality(a)}$ hours, with $x, y \\ge 0$. Each city bike earns a profit of $${num(p.p)}$ and each mountain bike $${num(p.q)}$. At the plan that maximises profit, how many ${spare} hours are left unused?`;
  },

  answer: (p) => ({ kind: 'numeric', value: optimum(p).unused, decimals: 0, ...EXACT }),

  steps(p) {
    const [w, paint, a] = p.machines;
    const best = optimum(p);
    const k = p.machines[best.spare];
    const pts = bikeCorners(p);
    const sys = (u: Constraint, v: Constraint, at: Point) =>
      `\\begin{cases} ${lhs(u.a, u.b)} = ${num(u.c)} \\\\ ${lhs(v.a, v.b)} = ${num(v.c)} \\end{cases} \\Rightarrow ${point(at)}`;
    return [
      {
        text: 'Find the two inner corners: welding and painting fully used, then painting and assembly fully used.',
        latex: `${sys(w, paint, p.first)}, \\quad ${sys(paint, a, p.second)}`,
        why: 'Each inner corner is where two neighbouring constraint lines cross. Painting is the middle line, so it meets welding on one side and assembly on the other.',
      },
      {
        text: 'Find the corners on the axes.',
        latex: `x = \\min\\left(${ratio(w.c, w.a)}, ${ratio(paint.c, paint.a)}, ${ratio(a.c, a.a)}\\right) = ${num(w.c / w.a)}, \\quad y = \\min\\left(${ratio(w.c, w.b)}, ${ratio(paint.c, paint.b)}, ${ratio(a.c, a.b)}\\right) = ${num(a.c / a.b)}`,
        why: 'Making only one kind of bike, the machine that runs out of hours first sets the limit, so take the smallest of the three.',
      },
      {
        text: 'Work out the profit at every corner and pick the largest.',
        latex: `${pts.map((pt) => `\\pi${point(pt)} = ${num(value(p.p, p.q, pt))}`).join(',\\; ')}`,
        why: 'By the corner-point theorem the maximum of a linear profit is at a corner; the origin earns 0, so it cannot win.',
        result: best.profit,
      },
      {
        text: `At the best plan ${point(best.at)}, work out the ${NAMES[best.spare]} hours used and subtract them from the hours available.`,
        latex: `${num(k.c)} - (${num(k.a)} \\cdot ${num(best.at[0])} + ${num(k.b)} \\cdot ${num(best.at[1])}) = ${num(k.c)} - ${num(best.used)} = ${num(best.unused)}`,
        why: `The ${NAMES[best.spare]} line does not pass through the optimum, so that constraint is not binding: its slack is the hours available minus the hours used.`,
        result: best.unused,
      },
    ];
  },

  distractors(p) {
    const best = optimum(p);
    const k = p.machines[best.spare];
    // The axis corner on the far side of the optimum's other neighbour: not on the spare machine's line.
    const pts = bikeCorners(p);
    const other = (best.spare === 2 ? pts[0] : pts[3]) as Point;
    return cleanDistractors(
      best.unused,
      [
        { value: best.used, mistakeCode: 'USED_NOT_UNUSED' },
        { value: 0, mistakeCode: 'ASSUMED_BINDING' },
        { value: k.c - (k.a * other[0] + k.b * other[1]), mistakeCode: 'OTHER_CORNER' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
