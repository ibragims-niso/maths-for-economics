import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { type Constraint, gcd, inequality, lhs, type Point, point, ratio, value } from './lp';

interface Params {
  /** Protein a·x + b·y ≥ c: the steeper line, which sets the corner on the y-axis. */
  protein: Constraint;
  /** Fibre: the flatter line, which sets the corner on the x-axis. */
  fibre: Constraint;
  /** Cost per kg of feed A and of feed B. */
  costA: number;
  costB: number;
  /** Where both requirements are met exactly; drawn first so the corner is whole. */
  x: number;
  y: number;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** The three corners of the (unbounded) feasible region: on the y-axis, the crossing, on the x-axis. */
export function blendCorners(p: Params): Point[] {
  return [
    [0, p.protein.c / p.protein.b],
    [p.x, p.y],
    [p.fibre.c / p.fibre.a, 0],
  ];
}

const cheapest = (p: Params) =>
  Math.min(...blendCorners(p).map((pt) => value(p.costA, p.costB, pt)));

/** OP02, difficulty 3: the lowest cost of a feed blend that meets two nutrient requirements. */
export const lpMinCostFeedBlend: Generator<Params> = {
  id: 'lp-min-cost-feed-blend',
  title: 'Cheapest feed blend',
  topicId: 'OP02',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    const wantCross = rng.next() < 0.75;
    for (;;) {
      const protein = { a: rng.int(1, 6), b: rng.int(1, 6), c: 0 };
      const fibre = { a: rng.int(1, 6), b: rng.int(1, 6), c: 0 };
      if (protein.a * fibre.b - fibre.a * protein.b <= 0) continue;
      if (gcd(protein.a, protein.b) !== 1 || gcd(fibre.a, fibre.b) !== 1) continue;
      const x = rng.int(2, 25);
      const y = rng.int(2, 25);
      protein.c = protein.a * x + protein.b * y;
      fibre.c = fibre.a * x + fibre.b * y;
      if (protein.c % protein.b !== 0 || fibre.c % fibre.a !== 0) continue;
      if (protein.c > 300 || fibre.c > 300) continue;
      const params: Params = { protein, fibre, costA: rng.int(2, 15), costB: rng.int(2, 15), x, y };
      if (params.costA === params.costB) continue;
      const costs = blendCorners(params).map((pt) => value(params.costA, params.costB, pt));
      const low = Math.min(...costs);
      if (costs.filter((v) => v === low).length !== 1) continue;
      if ((costs[1] === low) !== wantCross) continue;
      return params;
    }
  },

  stem: (p) =>
    `A farm mixes $x$ kg of feed A with $y$ kg of feed B. The daily mix must meet a protein requirement $${inequality(p.protein, '\\ge')}$ and a fibre requirement $${inequality(p.fibre, '\\ge')}$ (in units of each nutrient), with $x, y \\ge 0$. Feed A costs $${num(p.costA)}$ and feed B $${num(p.costB)}$ per kg. What is the lowest possible daily cost?`,

  answer: (p) => ({ kind: 'numeric', value: cheapest(p), decimals: 0, ...EXACT }),

  steps(p) {
    const { protein: k, fibre: l } = p;
    const pts = blendCorners(p);
    return [
      {
        text: 'Sketch the feasible region: it lies above both lines and has no upper edge.',
        latex: `${inequality(k, '\\ge')}, \\quad ${inequality(l, '\\ge')}, \\quad x, y \\ge 0`,
        why: 'A "≥" requirement is met on the far side of its line from the origin. The origin itself (buy nothing) fails both requirements.',
      },
      {
        text: 'Find the corner where both requirements are met exactly.',
        latex: `\\begin{cases} ${lhs(k.a, k.b)} = ${num(k.c)} \\\\ ${lhs(l.a, l.b)} = ${num(l.c)} \\end{cases} \\Rightarrow (x, y) = ${point([p.x, p.y])}`,
        why: 'The two boundary lines cross at a corner of the region, where both constraints are binding.',
      },
      {
        text: 'Find the corners on the axes, where only one feed is used.',
        latex: `y = \\max\\left(${ratio(k.c, k.b)}, ${ratio(l.c, l.b)}\\right) = ${num(k.c / k.b)}, \\quad x = \\max\\left(${ratio(k.c, k.a)}, ${ratio(l.c, l.a)}\\right) = ${num(l.c / l.a)}`,
        why: 'With one feed alone you need enough of it to meet both requirements, so take the larger of the two amounts.',
      },
      {
        text: 'Work out the cost at each corner and pick the smallest.',
        latex: `${pts.map((pt) => `C${point(pt)} = ${num(value(p.costA, p.costB, pt))}`).join(',\\; ')} \\Rightarrow C_{\\min} = ${num(cheapest(p))}`,
        why: 'Costs are positive, so the cost falls towards the origin; the lowest iso-cost line that still touches the region does so at a corner.',
        result: cheapest(p),
      },
    ];
  },

  distractors(p) {
    const answer = cheapest(p);
    const costs = blendCorners(p).map((pt) => value(p.costA, p.costB, pt));
    const secondCheapest = Math.min(...costs.filter((v) => v !== answer));
    // Meeting only one requirement: the cheaper of that line's two intercepts.
    const onlyOne = (k: Constraint) => Math.min((p.costA * k.c) / k.a, (p.costB * k.c) / k.b);
    const ignored = [onlyOne(p.protein), onlyOne(p.fibre)]
      .filter((v) => v < answer - EXACT.tolerance)
      .sort((u, v) => v - u);
    return cleanDistractors(
      answer,
      [
        { value: secondCheapest, mistakeCode: 'OTHER_CORNER' },
        ...(ignored[0] === undefined
          ? []
          : [{ value: round(ignored[0], 2), mistakeCode: 'IGNORED_CONSTRAINT' }]),
        { value: 0, mistakeCode: 'INFEASIBLE_ORIGIN' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
