import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Profit is π(Q) = −aQ² + bQ − F. */
  a: number;
  b: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;
const A_VALUES = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5] as const;

/** Largest fixed cost that still allows break-even: b² − 4aF ≥ 0 gives F ≤ b²/(4a). */
const maxFixedCost = (p: Params) => (p.b * p.b) / (4 * p.a);
/** The only break-even output when F is at its limit. */
const singleOutput = (p: Params) => p.b / (2 * p.a);
const hasTwoDecimals = (x: number) => Math.abs(Math.round(x * 100) - x * 100) < 1e-9;
const isWhole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
const quadratic = (p: Params) => `-${p.a === 1 ? '' : num(p.a)}Q^2 + ${num(p.b)}Q`;

/** F02, difficulty 3: largest fixed cost F for which −aQ² + bQ − F = 0 still has a solution. */
export const breakEvenMaxFixedCost: Generator<Params> = {
  id: 'break-even-max-fixed-cost',
  title: 'Highest fixed cost that can break even',
  topicId: 'F02',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const a = rng.pick(A_VALUES);
      const b = rng.int(10, 500);
      const p = { a, b };
      // Readable numbers: the limit and the single break-even output have at most 2 decimals.
      if (singleOutput(p) < 5) continue;
      if (hasTwoDecimals(maxFixedCost(p)) && hasTwoDecimals(singleOutput(p))) return p;
    }
  },

  stem: (p) =>
    `A firm's revenue minus variable costs from producing $Q$ units is $${quadratic(p)}$, so with a fixed cost $F$ its profit is $\\pi(Q) = ${quadratic(p)} - F$. What is the largest fixed cost $F$ at which the firm can still break even at some output?${
      isWhole(maxFixedCost(p)) ? '' : ' Give your answer to 2 decimal places.'
    }`,

  answer: (p) => ({ kind: 'numeric', value: round(maxFixedCost(p), 2), decimals: 2, ...MONEY }),

  steps(p) {
    const b2 = p.b * p.b;
    const limit = round(maxFixedCost(p), 2);
    return [
      {
        text: 'Break-even means zero profit. Set π(Q) = 0 and multiply both sides by −1.',
        latex: `${p.a === 1 ? '' : num(p.a)}Q^2 - ${num(p.b)}Q + F = 0`,
        why: 'Multiplying by −1 keeps the same solutions and makes the Q² coefficient positive.',
      },
      {
        text: 'A break-even output exists only if the discriminant is not negative.',
        latex: `D = ${num(p.b)}^2 - 4 \\cdot ${num(p.a)} \\cdot F = ${num(b2)} - ${num(4 * p.a)}F \\ge 0`,
        why: 'With D < 0 the equation has no solution, so profit is never zero: the firm makes a loss at every output.',
        result: b2,
      },
      {
        text: 'Solve the inequality for F.',
        latex: `-${num(4 * p.a)}F \\ge -${num(b2)} \\;\\Rightarrow\\; F \\le \\dfrac{${num(b2)}}{${num(4 * p.a)}} = ${num(limit)}`,
        why: 'Subtract b² from both sides, then divide by the negative number −4a, which reverses the inequality.',
        result: limit,
      },
      {
        text: 'Interpret the limit.',
        latex: `F = ${num(limit)}: \\; D = 0, \\; Q = \\dfrac{${num(p.b)}}{2 \\cdot ${num(p.a)}} = ${num(singleOutput(p))}`,
        why: 'At the limit the discriminant is zero, so there is exactly one break-even output; any larger fixed cost makes D negative.',
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      round(maxFixedCost(p), 2),
      [
        { value: round((p.b * p.b) / p.a, 2), mistakeCode: 'FORGOT_FOUR' },
        { value: round(p.b / (4 * p.a), 2), mistakeCode: 'NOT_SQUARED' },
        { value: round(singleOutput(p), 2), mistakeCode: 'GAVE_QUANTITY' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    ),
};
