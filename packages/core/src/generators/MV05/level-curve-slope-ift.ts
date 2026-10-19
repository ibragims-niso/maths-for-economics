import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /**
   * utility: U(x, y) = xy + a·x + c·y, a consumer's indifference curve.
   * cost: C(x, y) = a·x² + b·xy + c·y² + f·x + g·y, a firm's curve of equal total cost.
   */
  kind: 'utility' | 'cost';
  a: number;
  b: number;
  c: number;
  f: number;
  g: number;
  x: number;
  y: number;
}

/** A coefficient in front of a term: nothing for 1. */
const coef = (k: number) => (k === 1 ? '' : num(k));
/** " + k·v", or nothing when k = 0. */
const plus = (k: number, v: string) => (k === 0 ? '' : ` + ${coef(k)}${v}`);

/** The partial derivative with respect to x at the point. */
const fx = (p: Params) => (p.kind === 'utility' ? p.y + p.a : 2 * p.a * p.x + p.b * p.y + p.f);
/** The partial derivative with respect to y at the point. */
const fy = (p: Params) => (p.kind === 'utility' ? p.x + p.c : p.b * p.x + 2 * p.c * p.y + p.g);
/** The same partials with the cross term xy left out. */
const fxNoCross = (p: Params) => (p.kind === 'utility' ? p.a : 2 * p.a * p.x + p.f);
const fyNoCross = (p: Params) => (p.kind === 'utility' ? p.c : 2 * p.c * p.y + p.g);

/** The value of the function at the point, i.e. the level of the curve. */
const levelOf = (p: Params) =>
  p.kind === 'utility'
    ? p.x * p.y + p.a * p.x + p.c * p.y
    : p.a * p.x ** 2 + p.b * p.x * p.y + p.c * p.y ** 2 + p.f * p.x + p.g * p.y;

/** Implicit function theorem: dy/dx = −F_x/F_y. */
const slope = (p: Params) => round(-fx(p) / fy(p), 2);

function candidates(p: Params) {
  return [
    { value: round(fx(p) / fy(p), 2), mistakeCode: 'SIGN' },
    { value: round(-fy(p) / fx(p), 2), mistakeCode: 'INVERTED_RATIO' },
    { value: round(-fxNoCross(p) / fyNoCross(p), 2), mistakeCode: 'DROPPED_CROSS_TERM' },
  ];
}

/** The right-hand side of U(x, y) = … or C(x, y) = …, as LaTeX. */
const expr = (p: Params) =>
  p.kind === 'utility'
    ? `xy${plus(p.a, 'x')}${plus(p.c, 'y')}`
    : `${coef(p.a)}x^2${plus(p.b, 'xy')}${plus(p.c, 'y^2')}${plus(p.f, 'x')}${plus(p.g, 'y')}`;
const formula = (p: Params) => `${p.kind === 'utility' ? 'U' : 'C'}(x, y) = ${expr(p)}`;

/** MV05, difficulty 1: dy/dx = −F_x/F_y on a level curve (indifference curve or equal-cost curve). */
export const levelCurveSlopeIft: Generator<Params> = {
  id: 'level-curve-slope-ift',
  title: 'Slope of a level curve',
  topicId: 'MV05',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const kind = rng.pick(['utility', 'cost'] as const);
      const p: Params =
        kind === 'utility'
          ? { kind, a: rng.int(1, 12), b: 1, c: rng.int(1, 12), f: 0, g: 0, x: 0, y: 0 }
          : {
              kind,
              a: rng.int(1, 3),
              b: rng.int(1, 4),
              c: rng.int(1, 3),
              f: rng.int(0, 8) * 5,
              g: rng.int(0, 8) * 5,
              x: 0,
              y: 0,
            };
      p.x = rng.int(2, 30);
      p.y = rng.int(2, 30);
      const s = Math.abs(slope(p));
      if (s < 0.1 || s > 10) continue;
      if (levelOf(p) > 10000) continue;
      if (cleanDistractors(slope(p), candidates(p)).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const at = `$(x, y) = (${p.x}, ${p.y})$`;
    const tail =
      'Use the implicit function theorem to find $\\dfrac{dy}{dx}$ along this curve at that point. Give your answer to 2 decimal places.';
    return p.kind === 'utility'
      ? `A consumer's utility from $x$ units of good X and $y$ units of good Y is $${formula(p)}$. The bundle ${at} lies on the indifference curve $U(x, y) = ${num(levelOf(p))}$. ${tail}`
      : `A firm's total cost of making $x$ units of product A and $y$ units of product B is $${formula(p)}$. At the output pair ${at} the cost is ${num(levelOf(p))}, and the firm considers all pairs with the same cost, $C(x, y) = ${num(levelOf(p))}$. ${tail}`;
  },

  answer: (p) => ({ kind: 'numeric', value: slope(p), decimals: 2 }),

  steps(p) {
    const ans = slope(p);
    const F = p.kind === 'utility' ? 'U' : 'C';
    const partials =
      p.kind === 'utility'
        ? `${F}_x = y + ${num(p.a)}, \\quad ${F}_y = x + ${num(p.c)}`
        : `${F}_x = ${num(2 * p.a)}x${plus(p.b, 'y')}${p.f ? ` + ${num(p.f)}` : ''}, \\quad ${F}_y = ${coef(p.b)}x${plus(2 * p.c, 'y')}${p.g ? ` + ${num(p.g)}` : ''}`;
    return [
      {
        text: `Write the curve as F(x, y) = 0 with F = ${F}(x, y) − ${num(levelOf(p))}.`,
        latex: `F(x, y) = ${expr(p)} - ${num(levelOf(p))} = 0`,
        why: 'Along the curve the function keeps the same value, so F is zero at every point of it. The constant drops out of both partial derivatives.',
      },
      {
        text: 'Find both partial derivatives.',
        latex: partials,
        why: 'For F_x hold y fixed; for F_y hold x fixed. The cross term xy contributes to both: y to F_x and x to F_y.',
      },
      {
        text: `Evaluate them at (${p.x}, ${p.y}).`,
        latex: `${F}_x = ${num(fx(p))}, \\quad ${F}_y = ${num(fy(p))}`,
        why: 'F_y is not zero here, so the theorem applies: near this point the curve is the graph of a function y(x).',
        result: fy(p),
      },
      {
        text: 'Apply dy/dx = −F_x/F_y.',
        latex: `\\dfrac{dy}{dx} = -\\dfrac{${F}_x}{${F}_y} = -\\dfrac{${num(fx(p))}}{${num(fy(p))}} = ${num(ans)}`,
        why:
          p.kind === 'utility'
            ? `Along the curve F_x dx + F_y dy = 0. The slope is negative: with more X the consumer needs less Y to stay equally happy, and the MRS is ${num(-ans)}.`
            : `Along the curve F_x dx + F_y dy = 0. To make one more unit of A at the same total cost, the firm must make about ${num(-ans)} fewer units of B.`,
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(slope(p), candidates(p)),
};
