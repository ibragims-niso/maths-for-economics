import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { type Constraint, gcd, inequality } from '../OP02/lp';
import { dualSolution, EXACT } from './dual';
import { bestProfitPerHour } from './lp-dual-shadow-price';

interface Params {
  /** Hours on machine A and machine B: a·x + b·y ≤ c, with x lamps and y chairs. */
  machines: [Constraint, Constraint];
  /** Profit per lamp and per chair, built from whole shadow prices. */
  p: number;
  q: number;
  /** The best plan, where both machines are fully used. */
  x: number;
  y: number;
  /** Shadow prices of an hour on A and on B, drawn first. */
  prices: [number, number];
  /** The machine that gets extra hours (0 = A, 1 = B) and how many. */
  asked: 0 | 1;
  extra: number;
}

const NAMES = ['A', 'B'] as const;

const change = (p: Params) => p.extra * p.prices[p.asked];

/**
 * The best plan after the extra hours, times det = aA·bB − aB·bA (whole numbers): the crossing of
 * the two machine lines moves by extra·(bB, −aB)/det when A grows and extra·(−bA, aA)/det when B does.
 */
export function newPlanTimesDet(p: Params): { det: number; x: number; y: number } {
  const [k, l] = p.machines;
  const det = k.a * l.b - l.a * k.b;
  const [dx, dy] = p.asked === 0 ? [l.b, -l.a] : [-k.b, k.a];
  return { det, x: p.x * det + p.extra * dx, y: p.y * det + p.extra * dy };
}

function wrongAnswers(p: Params) {
  const k = p.machines[p.asked];
  return [
    { value: p.extra * p.prices[p.asked === 0 ? 1 : 0], mistakeCode: 'OTHER_RESOURCE_PRICE' },
    { value: round(p.extra * bestProfitPerHour(k, p.p, p.q), 2), mistakeCode: 'PROFIT_PER_HOUR' },
    { value: p.p * p.x + p.q * p.y + change(p), mistakeCode: 'TOTAL_NOT_CHANGE' },
  ];
}

/** OP03, difficulty 2: the rise in maximum profit when one fully used machine gets extra hours. */
export const lpDualProfitChange: Generator<Params> = {
  id: 'lp-dual-profit-change',
  title: 'Extra profit from extra machine hours',
  topicId: 'OP03',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const a = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
      const b = { a: rng.int(1, 5), b: rng.int(1, 5), c: 0 };
      if (a.a * b.b - b.a * a.b === 0) continue;
      if (gcd(a.a, a.b) !== 1 || gcd(b.a, b.b) !== 1) continue;
      const prices: [number, number] = [rng.int(1, 15), rng.int(1, 15)];
      if (prices[0] === prices[1]) continue;
      const x = rng.int(2, 30);
      const y = rng.int(2, 30);
      a.c = a.a * x + a.b * y;
      b.c = b.a * x + b.b * y;
      if (a.c > 300 || b.c > 300) continue;
      const params: Params = {
        machines: [a, b],
        // A product made at the optimum earns exactly the value of the hours it uses.
        p: a.a * prices[0] + b.a * prices[1],
        q: a.b * prices[0] + b.b * prices[1],
        x,
        y,
        prices,
        asked: rng.int(0, 1) as 0 | 1,
        extra: rng.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]),
      };
      // Within the range: after the extra hours both products are still made (strictly).
      const moved = newPlanTimesDet(params);
      if (moved.x * moved.det <= 0 || moved.y * moved.det <= 0) continue;
      if (cleanDistractors(change(params), wrongAnswers(params), EXACT.tolerance, 0).length < 2)
        continue;
      return params;
    }
  },

  stem: (p) =>
    `A firm makes $x$ lamps and $y$ chairs a week. Machine A allows $${inequality(p.machines[0])}$ hours and machine B allows $${inequality(p.machines[1])}$ hours, with $x, y \\ge 0$. A lamp earns a profit of $${num(p.p)}$ and a chair $${num(p.q)}$. At the best plan both products are made and both machines are fully used. The firm can get $${num(p.extra)}$ extra hours on machine ${NAMES[p.asked]}, few enough that both machines stay fully used. By how much does the maximum weekly profit rise?`,

  answer: (p) => ({ kind: 'numeric', value: change(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [k, l] = p.machines;
    const name = NAMES[p.asked];
    const price = p.prices[p.asked];
    return [
      {
        text: 'Find the shadow prices of an hour on A and on B: both products are made, so each product’s dual constraint holds with equality.',
        latex: dualSolution(k, l, p.p, p.q, ['y_A', 'y_B']),
        why: 'The hours a product uses, valued at the shadow prices, are worth exactly its profit when the product is made (complementary slackness). Two products give two equations in the two prices.',
        result: price,
      },
      {
        text: `Multiply the extra hours by the shadow price of machine ${name}.`,
        latex: `\\Delta\\pi = ${num(p.extra)} \\times y_${name} = ${num(p.extra)} \\times ${num(price)} = ${num(change(p))}`,
        why: `The shadow price is the extra profit per extra hour. It stays the same over the range in which the same two machines are fully used, so each of the ${num(p.extra)} hours adds the same amount.`,
        result: change(p),
      },
    ];
  },

  distractors(p) {
    return cleanDistractors(change(p), wrongAnswers(p), EXACT.tolerance, EXACT.relTolerance);
  },
};
