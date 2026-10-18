import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The frontier a·x² + b·xy + c·y² = d, an ellipse arc (b² < 4ac). */
  a: number;
  b: number;
  c: number;
  x: number;
  y: number;
}

/** A coefficient in front of a term: nothing for 1. */
const coef = (k: number) => (k === 1 ? '' : num(k));

const level = (p: Params) => p.a * p.x ** 2 + p.b * p.x * p.y + p.c * p.y ** 2;
/** The x-terms after differentiating: 2a·x + b·y. */
const top = (p: Params) => 2 * p.a * p.x + p.b * p.y;
/** The factor of dy/dx after differentiating: b·x + 2c·y. */
const bottom = (p: Params) => p.b * p.x + 2 * p.c * p.y;
const slope = (p: Params) => round(-top(p) / bottom(p), 2);

function candidates(p: Params) {
  return [
    { value: round(top(p) / bottom(p), 2), mistakeCode: 'SIGN' },
    { value: round(-bottom(p) / top(p), 2), mistakeCode: 'INVERTED_RATIO' },
    {
      value: round((-2 * p.a * p.x) / bottom(p), 2),
      mistakeCode: 'MISSED_PRODUCT_RULE',
    },
    {
      value: round(-(top(p) + 2 * p.c * p.y) / (p.b * p.x), 2),
      mistakeCode: 'FORGOT_CHAIN',
    },
  ];
}

/** C110, difficulty 3: dy/dx on a frontier a·x² + b·xy + c·y² = d at a point (product rule inside). */
export const frontierSlopeImplicit: Generator<Params> = {
  id: 'frontier-slope-implicit',
  title: 'Slope of a production frontier',
  topicId: 'C110',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 3);
      const b = rng.int(1, 3);
      const c = rng.int(1, 3);
      if (b * b >= 4 * a * c) continue;
      const p: Params = { a, b, c, x: rng.int(2, 40), y: rng.int(2, 40) };
      if (level(p) > 20000) continue;
      const s = Math.abs(slope(p));
      if (s < 0.1 || s > 10) continue;
      if (cleanDistractors(slope(p), candidates(p)).length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A farm can grow $x$ tonnes of wheat and $y$ tonnes of barley. Its production possibility frontier is $${coef(p.a)}x^2 + ${coef(p.b)}xy + ${coef(p.c)}y^2 = ${num(level(p))}$. At the point $(x, y) = (${p.x}, ${p.y})$ on the frontier, use implicit differentiation to find $\\dfrac{dy}{dx}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: slope(p), decimals: 2 }),

  steps(p) {
    const ans = slope(p);
    const twoA = coef(2 * p.a);
    const B = coef(p.b);
    const twoC = coef(2 * p.c);
    return [
      {
        text: 'Differentiate every term with respect to x, treating y as a function of x.',
        latex: `${twoA}x + ${B}\\left(y + x\\,\\dfrac{dy}{dx}\\right) + ${twoC}y\\,\\dfrac{dy}{dx} = 0`,
        why: 'The xy term is a product, so it needs the product rule. y² needs the chain rule: its derivative is 2y times dy/dx. The constant on the right has derivative 0.',
      },
      {
        text: 'Collect the dy/dx terms on one side.',
        latex: `(${B}x + ${twoC}y)\\,\\dfrac{dy}{dx} = -(${twoA}x + ${B}y)`,
        why: 'dy/dx appears in two terms; factor it out so it can be isolated.',
      },
      {
        text: `Put in the point (${p.x}, ${p.y}).`,
        latex: `${num(bottom(p))}\\,\\dfrac{dy}{dx} = -${num(top(p))}`,
        why: `${B}x + ${twoC}y = ${num(bottom(p))} and ${twoA}x + ${B}y = ${num(top(p))} at this point.`,
        result: bottom(p),
      },
      {
        text: 'Divide.',
        latex: `\\dfrac{dy}{dx} = -\\dfrac{${num(top(p))}}{${num(bottom(p))}} = ${num(ans)}`,
        why: `Near this point, growing one more tonne of wheat costs about ${num(-ans)} tonnes of barley: that is the marginal rate of transformation.`,
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(slope(p), candidates(p)),
};
