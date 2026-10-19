import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'price': a price-adjustment rule (k may be negative); 'capital': K ↦ I + (1 − δ)K. */
  context: 'price' | 'capital';
  /** The rule x ↦ a + k·x. For 'capital', a is investment I and k = 1 − δ. */
  a: number;
  k: number;
  /** Depreciation rate δ (capital only; 0 for prices). */
  delta: number;
  /** Starting value x₀. */
  x0: number;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** The rule f(x) = a + k·x. */
export const contractionStep = (p: Params, x: number) => p.a + p.k * x;

/** The fixed point x* = a/(1 − k); for capital this is I/δ. */
export const linearFixedPoint = (p: Params) =>
  round(p.context === 'capital' ? p.a / p.delta : p.a / (1 - p.k), 2);

function candidates(p: Params): Distractor[] {
  const list: Distractor[] = [
    { value: p.a, mistakeCode: 'INTERCEPT_ONLY' },
    { value: round(p.a / (1 + p.k), 2), mistakeCode: 'SIGN_OF_K' },
    { value: round(contractionStep(p, p.x0), 2), mistakeCode: 'ONE_ITERATION' },
  ];
  if (p.k > 0) list.push({ value: round(p.a / p.k, 2), mistakeCode: 'DIVIDED_BY_K' });
  return list;
}

const rule = (p: Params) => {
  const v = p.context === 'capital' ? 'K' : 'p';
  const sign = p.k < 0 ? '-' : '+';
  return `${v}_{t+1} = ${num(p.a)} ${sign} ${num(Math.abs(p.k))}\\,${v}_t`;
};

/** AN05, difficulty 1: the fixed point of a linear contraction x ↦ a + kx, where iteration settles. */
export const linearContractionFixedPoint: Generator<Params> = {
  id: 'linear-contraction-fixed-point',
  title: 'Fixed point of a contraction',
  topicId: 'AN05',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['price', 'capital'] as const);
      let p: Params;
      if (context === 'capital') {
        const delta = rng.pick([0.04, 0.05, 0.08, 0.1, 0.2, 0.25] as const);
        const a = rng.int(2, 60);
        const star = a / delta;
        p = {
          context,
          a,
          k: round(1 - delta, 2),
          delta,
          x0: round(star * rng.int(1, 18) * 0.1, 0),
        };
      } else {
        const k = rng.pick([
          -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
        ] as const);
        const a = rng.int(5, 120);
        const star = a / (1 - k);
        p = { context, a, k, delta: 0, x0: Math.max(1, round(star * rng.int(1, 18) * 0.1, 0)) };
      }
      const star = linearFixedPoint(p);
      // A start that is not already (close to) the fixed point, so the first step moves.
      if (Math.abs(p.x0 - star) < 1) continue;
      if (cleanDistractors(star, candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem(p) {
    const whole = Number.isInteger(linearFixedPoint(p));
    const tail = whole ? '' : ' Give your answer to 2 decimal places.';
    if (p.context === 'capital')
      return `A firm invests ${num(p.a)} a year and its machines lose ${num(p.delta * 100)}% of their value each year, so its capital follows $${rule(p)}$, starting from $K_0 = ${num(p.x0)}$. The rule is a contraction, so capital converges to its unique fixed point $K^*$. Find $K^*$.${tail}`;
    return `In a market, next period's price follows the rule $${rule(p)}$, starting from $p_0 = ${num(p.x0)}$. The rule is a contraction, so the prices converge to its unique fixed point $p^*$. Find $p^*$.${tail}`;
  },

  answer: (p) => ({ kind: 'numeric', value: linearFixedPoint(p), decimals: 2, ...EXACT }),

  steps(p) {
    const v = p.context === 'capital' ? 'K' : 'p';
    const star = linearFixedPoint(p);
    const x1 = contractionStep(p, p.x0);
    return [
      {
        text: `Check that the rule is a contraction: two values ${v} and ${v}′ end up |k| times as far apart.`,
        latex: `|f(${v}) - f(${v}')| = ${num(Math.abs(p.k))}\\,|${v} - ${v}'|, \\quad k = ${num(p.k)}, \\; |k| < 1`,
        why: 'The constant a cancels in the difference, so only the slope k matters. With |k| < 1 the Banach fixed-point theorem gives exactly one fixed point, and the iteration reaches it from any start.',
        result: Math.abs(p.k),
      },
      {
        text: `A fixed point is a value the rule leaves unchanged: set ${v}_{t+1} = ${v}_t = ${v}*.`,
        latex: `${v}^* = ${num(p.a)} ${p.k < 0 ? '-' : '+'} ${num(Math.abs(p.k))}\\,${v}^*`,
        why: `Once the sequence reaches ${v}*, the next value is ${v}* again, so it stays there for ever.`,
      },
      {
        text: `Collect the ${v}* terms and divide by 1 − k.`,
        latex: `${v}^* = \\dfrac{${num(p.a)}}{1 - ${p.k < 0 ? `(${num(p.k)})` : num(p.k)}} = \\dfrac{${num(p.a)}}{${num(round(1 - p.k, 2))}} = ${num(star)}`,
        why: `${v}*(1 − k) = a, and 1 − k > 0 because k < 1. The starting value ${p.x0} does not matter: the first step only moves it to ${round(x1, 2)}, and later steps close the gap to ${star}.`,
        result: star,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(linearFixedPoint(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
