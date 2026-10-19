import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Profit π = m1·q1 − b1·q1² + m2·q2 − b2·q2². */
  m1: number;
  b1: number;
  m2: number;
  b2: number;
  /** Plant capacity: q1 + q2 ≤ capacity. */
  capacity: number;
}

/** Whole-number answers (0 when capacity is slack) are exact, so the tolerance is tight. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Output of product i when its marginal profit m − 2bq equals λ. */
export const outputAt = (m: number, b: number, lambda: number) => (m - lambda) / (2 * b);

/** Total output with no capacity limit (λ = 0). */
export const freeTotal = (p: Params) => outputAt(p.m1, p.b1, 0) + outputAt(p.m2, p.b2, 0);

/**
 * The λ that makes q1 + q2 equal capacity: (m1 − λ)/(2b1) + (m2 − λ)/(2b2) = K. It is negative
 * when the plant has spare capacity, which is not allowed.
 */
export const lambdaIfBinding = (p: Params) =>
  (p.m1 / (2 * p.b1) + p.m2 / (2 * p.b2) - p.capacity) / (1 / (2 * p.b1) + 1 / (2 * p.b2));

/** The Kuhn–Tucker multiplier: λ from the binding case, or 0 when capacity is slack. */
export const capacityMultiplier = (p: Params) => Math.max(0, round(lambdaIfBinding(p), 2));

const sq = (b: number, q: string) => `${b === 1 ? '' : num(b)}${q}^2`;

/** OP01, difficulty 3: the multiplier on a shared capacity limit for two products (0 when slack). */
export const capacityMultiplierTwoProducts: Generator<Params> = {
  id: 'capacity-multiplier-two-products',
  title: 'Multiplier on a capacity limit',
  topicId: 'OP01',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const b1 = rng.int(1, 4);
      const b2 = rng.int(1, 4);
      // Draw the optimum first: outputs q1, q2 and the multiplier λ (0 for a slack plant).
      const q1 = rng.int(4, 30);
      const q2 = rng.int(4, 30);
      const binds = rng.next() < 0.75;
      const lambda = binds ? rng.int(2, 40) : 0;
      // The free outputs q + λ/(2b) must be readable: whole or at most 2 decimals.
      if ([b1, b2].some((b) => (lambda * 100) % (2 * b) !== 0)) continue;
      const capacity = q1 + q2 + (binds ? 0 : rng.int(2, 20));
      return {
        m1: lambda + 2 * b1 * q1,
        b1,
        m2: lambda + 2 * b2 * q2,
        b2,
        capacity,
      };
    }
  },

  stem: (p) =>
    `A firm makes two products in a plant that can turn out at most $${num(p.capacity)}$ units a day in total, so $q_1 + q_2 \\le ${num(p.capacity)}$. Its daily profit is $\\pi = ${num(p.m1)}q_1 - ${sq(p.b1, 'q_1')} + ${num(p.m2)}q_2 - ${sq(p.b2, 'q_2')}$. Find the Kuhn–Tucker multiplier $\\lambda$ on the capacity constraint: the extra profit from one more unit of capacity.`,

  answer: (p) => ({ kind: 'numeric', value: capacityMultiplier(p), decimals: 2, ...EXACT }),

  steps(p) {
    const u1 = outputAt(p.m1, p.b1, 0);
    const u2 = outputAt(p.m2, p.b2, 0);
    const free = u1 + u2;
    const first = {
      text: 'Try the case where capacity is slack (λ = 0): set each marginal profit to zero.',
      latex: `${num(p.m1)} - ${num(2 * p.b1)}q_1 = 0,\\; ${num(p.m2)} - ${num(2 * p.b2)}q_2 = 0 \\;\\Rightarrow\\; q_1 + q_2 = ${num(u1)} + ${num(u2)} = ${num(free)}`,
      why: 'With L = π − λ(q1 + q2 − K), stationarity says ∂π/∂qᵢ = λ for each product. If the constraint is slack, complementary slackness forces λ = 0.',
      result: free,
    };
    if (free <= p.capacity) {
      return [
        first,
        {
          text: 'The free plan fits in the plant, so this case is the optimum.',
          latex: `${num(free)} \\le ${num(p.capacity)} \\;\\Rightarrow\\; \\lambda = 0`,
          why: 'The plant has spare capacity, and one more unit of it would only add to the spare units: the multiplier of a slack constraint is 0.',
          result: 0,
        },
      ];
    }
    const lambda = capacityMultiplier(p);
    const q1 = outputAt(p.m1, p.b1, lambda);
    const q2 = outputAt(p.m2, p.b2, lambda);
    return [
      first,
      {
        text: 'The free plan does not fit, so capacity binds: each marginal profit equals λ.',
        latex: `${num(free)} > ${num(p.capacity)}, \\quad q_1 = \\frac{${num(p.m1)} - \\lambda}{${num(2 * p.b1)}}, \\quad q_2 = \\frac{${num(p.m2)} - \\lambda}{${num(2 * p.b2)}}`,
        why: 'The slack case breaks the constraint, so q1 + q2 = K. The last unit of capacity must earn the same in either product, and that common marginal profit is λ.',
      },
      {
        text: 'Substitute into q₁ + q₂ = K and solve for λ.',
        latex: `\\frac{${num(p.m1)} - \\lambda}{${num(2 * p.b1)}} + \\frac{${num(p.m2)} - \\lambda}{${num(2 * p.b2)}} = ${num(p.capacity)} \\;\\Rightarrow\\; \\lambda = ${num(lambda)}`,
        why: 'This is one linear equation in λ. Multiplying through by the denominators clears the fractions.',
        result: lambda,
      },
      {
        text: 'Check the signs.',
        latex: `\\lambda = ${num(lambda)} \\ge 0, \\quad q_1 = ${num(q1)} > 0, \\quad q_2 = ${num(q2)} > 0`,
        why: 'λ ≥ 0 and both outputs positive, so every Kuhn–Tucker condition holds. Profit is concave and the constraint is linear, so this is the global maximum.',
        result: lambda,
      },
    ];
  },

  distractors(p) {
    const lambda = capacityMultiplier(p);
    const free = freeTotal(p);
    if (lambda === 0) {
      return cleanDistractors(
        0,
        [
          { value: round(lambdaIfBinding(p), 2), mistakeCode: 'NEGATIVE_MULTIPLIER' },
          { value: round(p.capacity - free, 2), mistakeCode: 'SLACK_NOT_MULTIPLIER' },
        ],
        EXACT.tolerance,
        EXACT.relTolerance,
      );
    }
    const q1 = outputAt(p.m1, p.b1, lambda);
    return cleanDistractors(
      lambda,
      [
        { value: 0, mistakeCode: 'IGNORED_CONSTRAINT' },
        { value: round(lambda + p.b1 * q1, 2), mistakeCode: 'AVERAGE_NOT_MARGINAL' },
        { value: round(free - p.capacity, 2), mistakeCode: 'CAPACITY_SHORTFALL' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
