import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  context: 'cost' | 'demand' | 'tax';
  /** Intercept: fixed cost, demand at price 0, or the tax allowance term (subtracted). */
  intercept: number;
  /** Size of the slope, |m| > 0: cost per unit, units lost per unit of price, or the tax rate. */
  slope: number;
  /** The point a at which continuity is checked. */
  point: number;
  /** The tolerance ε on the output. */
  eps: number;
}

/** δ is printed to 2 decimals; the answer must be exact to the hundredth. */
const DELTA = { tolerance: 0.001, relTolerance: 0 } as const;

/** f(x) for the context; the tax line has a negative intercept term (an allowance). */
export const linearValue = (p: Params, x: number) =>
  p.context === 'demand'
    ? p.intercept - p.slope * x
    : p.context === 'tax'
      ? p.slope * x - p.intercept
      : p.intercept + p.slope * x;

/** The largest δ with |x − a| < δ ⇒ |f(x) − f(a)| < ε for f(x) = mx + c: δ = ε/|m|. */
const largestDelta = (p: Params) => round(p.eps / p.slope, 2);

const formula = (p: Params) => {
  if (p.context === 'cost') return `C(q) = ${num(p.intercept)} + ${num(p.slope)}q`;
  if (p.context === 'demand') return `Q(P) = ${num(p.intercept)} - ${num(p.slope)}P`;
  return `T(y) = ${num(p.slope)}y - ${num(p.intercept)}`;
};

const NAMES = {
  cost: { f: 'C', x: 'q' },
  demand: { f: 'Q', x: 'P' },
  tax: { f: 'T', x: 'y' },
} as const;

/** AN03, difficulty 1: the largest δ that works in the ε–δ definition for a linear function. */
export const epsilonDeltaLinear: Generator<Params> = {
  id: 'epsilon-delta-linear',
  title: 'Largest δ for a straight line',
  topicId: 'AN03',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    const context = rng.pick(['cost', 'demand', 'tax'] as const);
    if (context === 'cost') {
      const slope = rng.int(2, 20);
      const hundredths = rng.int(1, 50);
      return {
        context,
        intercept: rng.int(2, 60) * 50,
        slope,
        point: rng.int(2, 40) * 5,
        eps: (slope * hundredths) / 100,
      };
    }
    if (context === 'demand') {
      const slope = rng.int(2, 10);
      const price = rng.int(2, 30);
      const hundredths = rng.int(1, 50);
      return {
        context,
        // Demand stays positive well beyond P₀ + δ.
        intercept: slope * price + rng.int(4, 40) * 5,
        slope,
        point: price,
        eps: (slope * hundredths) / 100,
      };
    }
    const slope = rng.pick([0.1, 0.2, 0.25, 0.3, 0.4] as const);
    const fives = rng.int(1, 40);
    const point = rng.int(10, 60) * 1000;
    return {
      context,
      // At most half the gross tax, so the tax due stays positive.
      intercept: rng.int(1, Math.floor((slope * point) / 1000)) * 500,
      slope,
      point,
      eps: round(slope * fives * 5, 2),
    };
  },

  stem(p) {
    const { f, x } = NAMES[p.context];
    const a = num(p.point);
    const lead =
      p.context === 'cost'
        ? `A firm's total cost is $${formula(p)}$ and it plans to produce $q_0 = ${a}$ units.`
        : p.context === 'demand'
          ? `Demand for a good is $${formula(p)}$ and the current price is $P_0 = ${a}$.`
          : `Income tax due on income $y$ is $${formula(p)}$ and a worker earns $y_0 = ${a}$.`;
    return `${lead} Find the largest $\\delta$ such that every $${x}$ with $|${x} - ${a}| < \\delta$ gives $|${f}(${x}) - ${f}(${a})| < ${num(p.eps)}$, that is, the largest $\\delta$ that works for $\\varepsilon = ${num(p.eps)}$. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: largestDelta(p), decimals: 2, ...DELTA }),

  steps(p) {
    const { f, x } = NAMES[p.context];
    const a = num(p.point);
    const m = num(p.slope);
    return [
      {
        text: `Write the distance between ${f}(${x}) and ${f}(${p.point}).`,
        latex: `|${f}(${x}) - ${f}(${a})| = |${p.context === 'demand' ? '-' : ''}${m}(${x} - ${a})| = ${m}\\,|${x} - ${a}|`,
        why:
          p.context === 'demand'
            ? `The constant ${p.intercept} cancels, and |−${p.slope}| = ${p.slope}: a distance is never negative, so the minus sign of the falling line disappears.`
            : `The constant ${p.intercept} cancels, so only the slope times the change in ${x} is left.`,
      },
      {
        text: 'Turn the condition on the output into a condition on the input.',
        latex: `${m}\\,|${x} - ${a}| < ${num(p.eps)} \\iff |${x} - ${a}| < \\dfrac{${num(p.eps)}}{${m}}`,
        why: `Dividing both sides by the positive number ${p.slope} keeps the inequality the same way round.`,
      },
      {
        text: 'Read off the largest δ.',
        latex: `\\delta = \\dfrac{\\varepsilon}{|m|} = \\dfrac{${num(p.eps)}}{${m}} = ${num(largestDelta(p))}`,
        why: `Every ${x} closer than this works. With any larger δ the interval contains points slightly further out, where the gap ${p.slope}·|${x} − ${p.point}| is ${p.eps} or more.`,
        result: largestDelta(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      largestDelta(p),
      [
        { value: round(p.eps * p.slope, 4), mistakeCode: 'MULTIPLIED_BY_SLOPE' },
        { value: p.eps, mistakeCode: 'IGNORED_SLOPE' },
        { value: round(p.eps / 2, 4), mistakeCode: 'HALVED_EPSILON' },
        ...(p.context === 'demand'
          ? [{ value: -largestDelta(p), mistakeCode: 'NEGATIVE_DELTA' }]
          : []),
      ],
      DELTA.tolerance,
      DELTA.relTolerance,
    ),
};
