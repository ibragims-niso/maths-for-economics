import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, linearDemand, num } from '../format';

interface Params {
  /** Inverse demand P = a − bQ. */
  a: number;
  /** A multiple of 0.5. */
  b: number;
  /** Cost C(Q) = F + cQ + dQ². */
  fixedCost: number;
  c: number;
  /** A multiple of 0.5. */
  d: number;
  q0: number;
}

/** The answer is a whole number, so only a slip in the last digit is allowed. */
const EXACT = { tolerance: 0.01, relTolerance: 0.0001 } as const;

const price = (p: Params) => round(p.a - p.b * p.q0, 4);
const marginalRevenue = (p: Params) => round(p.a - 2 * p.b * p.q0, 4);
const marginalCost = (p: Params) => round(p.c + 2 * p.d * p.q0, 4);
const marginalProfit = (p: Params) => round(marginalRevenue(p) - marginalCost(p), 4);
const profit = (p: Params) =>
  round(price(p) * p.q0 - p.fixedCost - p.c * p.q0 - p.d * p.q0 * p.q0, 2);

const coef = (k: number) => (k === 1 ? '' : num(k));

/** C106, difficulty 3: marginal profit MR − MC at a given output, and whether to expand. */
export const marginalProfitAtOutput: Generator<Params> = {
  id: 'marginal-profit-at-output',
  title: 'Marginal profit: expand or cut back?',
  topicId: 'C106',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    // Draw the marginal profit first (either sign, never 0), then build the demand intercept.
    for (;;) {
      const b = rng.int(1, 8) / 2;
      const d = rng.int(1, 6) / 2;
      const c = rng.int(2, 40);
      const q0 = rng.int(5, 40);
      const mp = rng.int(-60, 60);
      const a = round(mp + c + 2 * (b + d) * q0, 4);
      const p = { a, b, fixedCost: rng.int(2, 30) * 50, c, d, q0 };
      // A positive price, and a marginal profit far enough from 0 that its sign is clear.
      if (Math.abs(mp) >= 2 && price(p) > 0) return p;
    }
  },

  stem: (p) =>
    `A firm faces inverse demand $P = ${linearDemand(p.a, p.b, 'Q')}$ and has total cost $C(Q) = ${num(p.fixedCost)} + ${num(p.c)}Q + ${coef(p.d)}Q^2$. Find its marginal profit at $Q = ${num(p.q0)}$ (negative if one more unit would lower profit).`,

  answer: (p) => ({ kind: 'numeric', value: marginalProfit(p), decimals: 2, ...EXACT }),

  steps: (p) => {
    const mp = marginalProfit(p);
    const verdict =
      mp > 0
        ? 'Positive: one more unit adds about this much to profit, so the firm should produce more.'
        : 'Negative: the last unit costs more than it brings in, so the firm should produce less.';
    return [
      {
        text: 'Marginal revenue from the demand line.',
        latex: `MR(Q) = ${num(p.a)} - ${coef(2 * p.b)}Q, \\quad MR(${num(p.q0)}) = ${num(marginalRevenue(p))}`,
        why: 'Revenue is (a − bQ)Q = aQ − bQ², and its derivative a − 2bQ falls twice as fast as the price.',
        result: marginalRevenue(p),
      },
      {
        text: 'Marginal cost from the cost function.',
        latex: `MC(Q) = ${num(p.c)} + ${coef(2 * p.d)}Q, \\quad MC(${num(p.q0)}) = ${num(marginalCost(p))}`,
        why: 'The fixed cost does not change with output, so it drops out; a term kQ² gives 2kQ.',
        result: marginalCost(p),
      },
      {
        text: 'Subtract: marginal profit is MR − MC.',
        latex: `\\pi'(${num(p.q0)}) = ${num(marginalRevenue(p))} - ${num(marginalCost(p))} = ${num(mp)}`,
        why: `Profit is revenue minus cost, so its rate of change is MR − MC. ${verdict}`,
        result: mp,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      marginalProfit(p),
      [
        { value: round(price(p) - marginalCost(p), 2), mistakeCode: 'MR_EQUALS_PRICE' },
        { value: round(-marginalProfit(p), 2), mistakeCode: 'REVERSED_DIFFERENCE' },
        {
          value: round(marginalRevenue(p) - p.c - p.d * p.q0, 2),
          mistakeCode: 'POWER_RULE_SLIP',
        },
        { value: profit(p), mistakeCode: 'TOTAL_NOT_MARGINAL' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
