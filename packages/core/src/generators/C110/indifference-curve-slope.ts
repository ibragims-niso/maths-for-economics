import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** U = x^a · y^b; either whole exponents (1–3, a ≠ b) or tenths with a + b = 1. */
  a: number;
  b: number;
  x: number;
  y: number;
}

/** A factor v^e in LaTeX: nothing for e = 0, "v" for e = 1, "v^{e}" otherwise. */
const power = (v: string, e: number) => (e === 0 ? '' : e === 1 ? v : `${v}^{${num(e)}}`);
/** A coefficient in front of a term: nothing for 1. */
const coef = (k: number) => (k === 1 ? '' : `${num(k)}\\,`);

/** dy/dx = −(a·y)/(b·x), from differentiating x^a·y^b = Ū with y = y(x). */
const slope = (p: Params) => round(-(p.a * p.y) / (p.b * p.x), 2);

/** The level Ū, shown in the stem when the exponents are whole numbers. */
const level = (p: Params) => p.x ** p.a * p.y ** p.b;
const wholeExponents = (p: Params) => Number.isInteger(p.a) && Number.isInteger(p.b);

function candidates(p: Params) {
  return [
    { value: round((p.a * p.y) / (p.b * p.x), 2), mistakeCode: 'SIGN' },
    { value: round(-(p.b * p.x) / (p.a * p.y), 2), mistakeCode: 'INVERTED_RATIO' },
    { value: round(-p.y / p.x, 2), mistakeCode: 'FORGOT_EXPONENTS' },
  ];
}

/** C110, difficulty 1: the slope dy/dx of an indifference curve x^a·y^b = Ū at a bundle. */
export const indifferenceCurveSlope: Generator<Params> = {
  id: 'indifference-curve-slope',
  title: 'Slope of an indifference curve',
  topicId: 'C110',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      let a: number;
      let b: number;
      if (rng.next() < 0.5) {
        a = rng.int(1, 3);
        b = rng.int(1, 3);
      } else {
        const tenths = rng.int(2, 8);
        a = tenths / 10;
        b = round(1 - a, 1);
      }
      if (a === b) continue;
      const p: Params = { a, b, x: rng.int(2, 30), y: rng.int(2, 30) };
      if (wholeExponents(p) && level(p) > 100000) continue;
      const s = Math.abs(slope(p));
      if (s < 0.1 || s > 20) continue;
      if (cleanDistractors(slope(p), candidates(p)).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const u = `${power('x', p.a)}${power('y', p.b)}`;
    const curve = wholeExponents(p) ? ` (the curve $${u} = ${num(level(p))}$)` : '';
    return `A consumer's utility from $x$ units of food and $y$ units of clothing is $U = ${u}$. Use implicit differentiation to find the slope $\\dfrac{dy}{dx}$ of the indifference curve through the bundle $(x, y) = (${p.x}, ${p.y})$${curve}. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: slope(p), decimals: 2 }),

  steps(p) {
    const ans = slope(p);
    const u = `${power('x', p.a)}${power('y', p.b)}`;
    const left = `${coef(p.a)}${power('x', p.a - 1)}${power('y', p.b)}`;
    const right = `${coef(p.b)}${power('x', p.a)}${power('y', p.b - 1)}`;
    return [
      {
        text: 'Write the indifference curve with y as an unknown function of x.',
        latex: `${u} = \\bar U, \\quad y = y(x)`,
        why: 'Along one indifference curve utility stays at the same level, so y must change with x in exactly the way that keeps the product constant.',
      },
      {
        text: 'Differentiate both sides with respect to x.',
        latex: `${left || '1'} + ${right}\\,\\dfrac{dy}{dx} = 0`,
        why: 'Use the product rule on the two factors. The factor in y depends on x, so the chain rule adds dy/dx. The right-hand side is a constant, so its derivative is 0.',
      },
      {
        text: 'Solve for dy/dx and simplify.',
        latex: `\\dfrac{dy}{dx} = -\\dfrac{${left || '1'}}{${right}} = -\\dfrac{${coef(p.a)}y}{${coef(p.b)}x}`,
        why: 'Move the first term to the other side and divide. The powers of x and y cancel down to a single y over a single x.',
      },
      {
        text: `Evaluate at (${p.x}, ${p.y}).`,
        latex: `\\dfrac{dy}{dx} = -\\dfrac{${num(p.a)} \\cdot ${p.y}}{${num(p.b)} \\cdot ${p.x}} = ${num(ans)}`,
        why: `The slope is negative: to stay equally happy with more food the consumer must have less clothing. The marginal rate of substitution is ${num(-ans)}.`,
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(slope(p), candidates(p)),
};
