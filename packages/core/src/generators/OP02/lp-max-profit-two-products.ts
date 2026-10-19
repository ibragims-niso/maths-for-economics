import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { type Constraint, gcd, inequality, lhs, type Point, point, ratio, value } from './lp';

interface Params {
  /** Cutting hours a·x + b·y ≤ c: the steeper line, which stops production on the x-axis. */
  cutting: Constraint;
  /** Assembly hours: the flatter line, which stops production on the y-axis. */
  assembly: Constraint;
  /** Profit per chair and per table. */
  p: number;
  q: number;
  /** Where both machines are fully used; drawn first so the corner has whole coordinates. */
  x: number;
  y: number;
}

/** Answers are whole amounts of money: accept only the exact value. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** The three corners other than the origin: on the x-axis, where both lines cross, on the y-axis. */
export function profitCorners(p: Params): Point[] {
  return [
    [p.cutting.c / p.cutting.a, 0],
    [p.x, p.y],
    [0, p.assembly.c / p.assembly.b],
  ];
}

const best = (p: Params) => Math.max(...profitCorners(p).map((pt) => value(p.p, p.q, pt)));

/** OP02, difficulty 1: the maximum profit of a two-product plan with two machine-hour limits. */
export const lpMaxProfitTwoProducts: Generator<Params> = {
  id: 'lp-max-profit-two-products',
  title: 'Maximum profit with two machine limits',
  topicId: 'OP02',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    // Mostly the corner where both lines cross wins; sometimes a corner on an axis does.
    const wantCross = rng.next() < 0.75;
    for (;;) {
      const cutting = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
      const assembly = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
      if (cutting.a * assembly.b - assembly.a * cutting.b <= 0) continue;
      if (gcd(cutting.a, cutting.b) !== 1 || gcd(assembly.a, assembly.b) !== 1) continue;
      const x = rng.int(2, 30);
      const y = rng.int(2, 30);
      cutting.c = cutting.a * x + cutting.b * y;
      assembly.c = assembly.a * x + assembly.b * y;
      if (cutting.c % cutting.a !== 0 || assembly.c % assembly.b !== 0) continue;
      if (cutting.c > 300 || assembly.c > 300) continue;
      const params: Params = {
        cutting,
        assembly,
        p: 5 * rng.int(2, 16),
        q: 5 * rng.int(2, 16),
        x,
        y,
      };
      const profits = profitCorners(params).map((pt) => value(params.p, params.q, pt));
      const top = Math.max(...profits);
      if (profits.filter((v) => v === top).length !== 1) continue;
      if ((profits[1] === top) !== wantCross) continue;
      return params;
    }
  },

  stem: (p) =>
    `A workshop makes $x$ chairs and $y$ tables a week. Cutting time limits production to $${inequality(p.cutting)}$ hours and assembly time to $${inequality(p.assembly)}$ hours, with $x, y \\ge 0$. Each chair earns a profit of $${num(p.p)}$ and each table $${num(p.q)}$. What is the largest weekly profit?`,

  answer: (p) => ({ kind: 'numeric', value: best(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [onX, both, onY] = profitCorners(p);
    const { cutting: k, assembly: l } = p;
    const profit = (pt: Point) => `\\pi${point(pt)} = ${num(value(p.p, p.q, pt))}`;
    return [
      {
        text: 'Find the corner where both machines are fully used: solve the two constraints as equations.',
        latex: `\\begin{cases} ${lhs(k.a, k.b)} = ${num(k.c)} \\\\ ${lhs(l.a, l.b)} = ${num(l.c)} \\end{cases} \\Rightarrow (x, y) = ${point(both as Point)}`,
        why: 'Two boundary lines cross at a corner of the feasible region. At that corner both constraints are binding, so both hold with equality.',
      },
      {
        text: 'Find the corners on the axes, where only one product is made.',
        latex: `x = \\min\\left(${ratio(k.c, k.a)}, ${ratio(l.c, l.a)}\\right) = ${num(k.c / k.a)}, \\quad y = \\min\\left(${ratio(k.c, k.b)}, ${ratio(l.c, l.b)}\\right) = ${num(l.c / l.b)}`,
        why: 'With only chairs (y = 0) each machine allows at most its hours divided by the hours per chair, and the tighter machine stops production first, so take the smaller limit. The same goes for tables.',
      },
      {
        text: 'Work out the profit π = px + qy at every corner.',
        latex: `\\pi(0, 0) = 0,\\; ${profit(onX as Point)},\\; ${profit(both as Point)},\\; ${profit(onY as Point)}`,
        why: 'A linear objective over a region bounded by straight lines is largest at a corner (the corner-point theorem), so the corners are the only candidates.',
      },
      {
        text: 'The largest of these is the maximum profit.',
        latex: `\\pi_{\\max} = ${num(best(p))}`,
        why: 'Every other feasible plan lies between the corners and earns no more than the best corner.',
        result: best(p),
      },
    ];
  },

  distractors(p) {
    const answer = best(p);
    const profits = profitCorners(p).map((pt) => value(p.p, p.q, pt));
    const secondBest = Math.max(...profits.filter((v) => v !== answer));
    // Dropping one machine: the region has corners at the other machine's two intercepts only.
    const onlyOne = (k: Constraint) => Math.max((p.p * k.c) / k.a, (p.q * k.c) / k.b);
    const ignored = [onlyOne(p.assembly), onlyOne(p.cutting)]
      .filter((v) => v > answer + EXACT.tolerance)
      .sort((u, v) => u - v);
    return cleanDistractors(
      answer,
      [
        { value: secondBest, mistakeCode: 'OTHER_CORNER' },
        ...(ignored[0] === undefined
          ? []
          : [{ value: round(ignored[0], 2), mistakeCode: 'IGNORED_CONSTRAINT' }]),
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
