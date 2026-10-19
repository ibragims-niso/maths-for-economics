import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { type Constraint, gcd, inequality, type Point } from '../OP02/lp';
import { dualPrices, dualSolution, TWO_DP } from './dual';

interface Params {
  /** Hours on machine A and machine B: a·x + b·y ≤ c, with x desks and y shelves. */
  machines: [Constraint, Constraint];
  /** Profit per desk and per shelf. */
  p: number;
  q: number;
  /** The best plan, where both machines are fully used; drawn first so it is whole. */
  x: number;
  y: number;
  /** The machine whose shadow price is asked for (0 = A, 1 = B). */
  asked: 0 | 1;
}

const NAMES = ['A', 'B'] as const;

/** Exact shadow prices of machines A and B. */
export function prices(p: Params): Point {
  const [k, l] = p.machines;
  return dualPrices(k, l, p.p, p.q) ?? [Number.NaN, Number.NaN];
}

/** The profit per hour on a machine of the product that earns most per hour there. */
export const bestProfitPerHour = (k: Constraint, p: number, q: number) =>
  Math.max(p / k.a, q / k.b);

function wrongAnswers(p: Params) {
  const price = prices(p);
  const k = p.machines[p.asked];
  return [
    { value: round(price[1 - p.asked] as number, 2), mistakeCode: 'OTHER_RESOURCE_PRICE' },
    { value: round(bestProfitPerHour(k, p.p, p.q), 2), mistakeCode: 'PROFIT_PER_HOUR' },
    { value: p.asked === 0 ? p.x : p.y, mistakeCode: 'PRIMAL_QUANTITY' },
  ];
}

/** OP03, difficulty 1: the shadow price of one machine when two machines are both fully used. */
export const lpDualShadowPrice: Generator<Params> = {
  id: 'lp-dual-shadow-price',
  title: 'Shadow price of a machine hour',
  topicId: 'OP03',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const a = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
      const b = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
      if (a.a * b.b - b.a * a.b === 0) continue;
      if (gcd(a.a, a.b) !== 1 || gcd(b.a, b.b) !== 1) continue;
      const x = rng.int(2, 30);
      const y = rng.int(2, 30);
      a.c = a.a * x + a.b * y;
      b.c = b.a * x + b.b * y;
      if (a.c > 300 || b.c > 300) continue;
      const params: Params = {
        machines: [a, b],
        p: 5 * rng.int(2, 16),
        q: 5 * rng.int(2, 16),
        x,
        y,
        asked: rng.int(0, 1) as 0 | 1,
      };
      // Both shadow prices positive: then the crossing (x, y) is the best plan and both bind.
      const [u, v] = prices(params);
      if (!(u >= 0.5 && v >= 0.5)) continue;
      const answer = round(prices(params)[params.asked], 2);
      if (cleanDistractors(answer, wrongAnswers(params), TWO_DP.tolerance, 0).length < 2) continue;
      return params;
    }
  },

  stem: (p) =>
    `A firm makes $x$ desks and $y$ shelves a week. Machine A allows $${inequality(p.machines[0])}$ hours and machine B allows $${inequality(p.machines[1])}$ hours, with $x, y \\ge 0$. A desk earns a profit of $${num(p.p)}$ and a shelf $${num(p.q)}$. At the best plan both products are made and both machines are fully used. What is the shadow price of machine ${NAMES[p.asked]}, the extra profit from one more hour on it? Give your answer to 2 decimal places.`,

  answer: (p) => ({
    kind: 'numeric',
    value: round(prices(p)[p.asked], 2),
    decimals: 2,
    ...TWO_DP,
  }),

  steps(p) {
    const [k, l] = p.machines;
    const [u, v] = prices(p);
    const asked = prices(p)[p.asked];
    const total = k.c * u + l.c * v;
    return [
      {
        text: 'Take the shadow prices of an hour on A and on B as unknowns. Write one dual constraint per product; both products are made, so each holds with equality. Solve.',
        latex: dualSolution(k, l, p.p, p.q, ['y_A', 'y_B']),
        why: 'A product’s dual constraint says the machine hours it uses, valued at the shadow prices, are worth at least its profit. By complementary slackness a product that is actually made earns exactly the value of the hours it uses, so the inequality is an equation.',
      },
      {
        text: 'Check with strong duality: the dual objective, hours available times shadow prices, equals the profit of the best plan.',
        latex: `${num(k.c)}y_A + ${num(l.c)}y_B = ${num(total)} = ${num(p.p)} \\cdot ${num(p.x)} + ${num(p.q)} \\cdot ${num(p.y)}`,
        why: 'At the optimum the value of all the resources at their shadow prices equals the maximum profit. Both prices are positive, so this pair of prices is the optimal dual solution.',
      },
      {
        text: `Read off the shadow price of machine ${NAMES[p.asked]}.`,
        latex: `y_${NAMES[p.asked]} = ${num(asked)}`,
        why: `One extra hour on machine ${NAMES[p.asked]} lets the firm shift production slightly and earn this much more profit, as long as both machines stay fully used.`,
        result: round(asked, 2),
      },
    ];
  },

  distractors(p) {
    return cleanDistractors(
      round(prices(p)[p.asked], 2),
      wrongAnswers(p),
      TWO_DP.tolerance,
      TWO_DP.relTolerance,
    );
  },
};
