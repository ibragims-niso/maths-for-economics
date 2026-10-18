import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** y = (ax + b)ⁿ (a power of a linear expression) or y = √(ax² + b) (a root of a quadratic). */
  form: 'power' | 'sqrt';
  a: number;
  b: number;
  /** The outer power: 2 to 5, or 0.5 for the square root. */
  n: number;
  x0: number;
}

/** The inner function u(x) = ax + b or ax² + b at x. */
const innerAt = (p: Params, x: number) => (p.form === 'power' ? p.a * x + p.b : p.a * x * x + p.b);
/** The derivative of the inner function, u′(x) = a or 2ax. */
const innerSlope = (p: Params, x: number) => (p.form === 'power' ? p.a : 2 * p.a * x);
/** n·u^(n−1), the derivative of the outer function at u. */
const outerSlope = (p: Params, u: number) => p.n * u ** (p.n - 1);
const answerOf = (p: Params) => round(outerSlope(p, innerAt(p, p.x0)) * innerSlope(p, p.x0), 2);

/** a·x + b or a·x² + b as LaTeX, e.g. "3x - 2", "x^2 + 16". */
const innerTex = (p: Params) => {
  const coef = p.a === 1 ? '' : num(p.a);
  const term = p.form === 'power' ? `${coef}x` : `${coef}x^2`;
  return `${term} ${p.b < 0 ? '-' : '+'} ${num(Math.abs(p.b))}`;
};
/** "^{3}", or nothing for a power of 1. */
const powerTex = (k: number) => (k === 1 ? '' : `^{${k}}`);
const functionTex = (p: Params) =>
  p.form === 'power' ? `(${innerTex(p)})^{${p.n}}` : `\\sqrt{${innerTex(p)}}`;

/** C104, difficulty 1: the derivative of (ax + b)ⁿ or √(ax² + b) at a point, by the chain rule. */
export const chainRulePowerAtPoint: Generator<Params> = {
  id: 'chain-rule-power-at-point',
  title: 'Chain rule: slope at a point',
  topicId: 'C104',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    if (rng.next() < 0.5) {
      // Keep u(x₀)^(n−1) small, so the slope stays readable.
      const largestInner: Record<number, number> = { 2: 12, 3: 7, 4: 5, 5: 3 };
      for (;;) {
        const n = rng.int(2, 5);
        const a = rng.int(2, 6); // a = 1 would make "forgot the inner derivative" right by luck
        const b = rng.int(-9, 9);
        const x0 = rng.int(1, 4);
        const u = a * x0 + b;
        if (b !== 0 && u >= 1 && u <= (largestInner[n] ?? 0)) return { form: 'power', a, b, n, x0 };
      }
    }
    for (;;) {
      const a = rng.int(1, 6);
      const x0 = rng.int(1, 6);
      const root = rng.int(2, 15); // u(x₀) = root², so √u(x₀) is whole
      const b = root * root - a * x0 * x0;
      if (b >= 1 && b <= 200) return { form: 'sqrt', a, b, n: 0.5, x0 };
    }
  },

  stem: (p) => {
    const value = answerOf(p);
    const precision = Number.isInteger(value) ? '' : ' Give your answer to 2 decimal places.';
    return `Use the chain rule to find the slope of $y = ${functionTex(p)}$ at $x = ${num(p.x0)}$, that is $\\dfrac{dy}{dx}$ at $x = ${num(p.x0)}$.${precision}`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2 }),

  steps(p) {
    const u = innerAt(p, p.x0);
    const value = answerOf(p);
    if (p.form === 'power') {
      return [
        {
          text: 'Name the inside and the outside.',
          latex: `u = ${innerTex(p)}, \\quad y = u^{${p.n}}`,
          why: 'The bracket is worked out first, so it is the inner function; raising it to a power is the outer one.',
        },
        {
          text: 'Differentiate the outside, leaving the inside alone, and multiply by the derivative of the inside.',
          latex: `\\dfrac{dy}{dx} = ${p.n}(${innerTex(p)})${powerTex(p.n - 1)} \\cdot ${num(p.a)}`,
          why: 'Chain rule: dy/dx = dy/du · du/dx. The power rule gives n·uⁿ⁻¹, and the inside ax + b changes at rate a.',
        },
        {
          text: 'Evaluate the inside at the point.',
          latex: `u(${num(p.x0)}) = ${num(p.a)} \\cdot ${num(p.x0)} ${p.b < 0 ? '-' : '+'} ${num(Math.abs(p.b))} = ${num(u)}`,
          why: 'The outer derivative is evaluated at the value of the inside, not at x itself.',
          result: u,
        },
        {
          text: 'Put the numbers in.',
          latex: `\\dfrac{dy}{dx} = ${p.n} \\cdot ${num(u)}${powerTex(p.n - 1)} \\cdot ${num(p.a)} = ${num(value)}`,
          why: 'Multiply the outer rate by the inner rate.',
          result: value,
        },
      ];
    }
    const root = Math.sqrt(u);
    return [
      {
        text: 'Name the inside and the outside.',
        latex: `u = ${innerTex(p)}, \\quad y = \\sqrt{u} = u^{1/2}`,
        why: 'The expression under the root is worked out first, so it is the inner function; the square root is the outer one.',
      },
      {
        text: 'Differentiate the outside, then multiply by the derivative of the inside.',
        latex: `\\dfrac{dy}{dx} = \\dfrac{1}{2\\sqrt{${innerTex(p)}}} \\cdot ${num(2 * p.a)}x = \\dfrac{${p.a === 1 ? '' : num(p.a)}x}{\\sqrt{${innerTex(p)}}}`,
        why: 'The derivative of u^(1/2) is ½u^(−1/2) = 1/(2√u), and the derivative of ax² + b is 2ax; the 2s cancel.',
      },
      {
        text: 'Evaluate the inside at the point.',
        latex: `u(${num(p.x0)}) = ${num(p.a)} \\cdot ${num(p.x0)}^2 + ${num(p.b)} = ${num(u)}, \\quad \\sqrt{${num(u)}} = ${num(root)}`,
        why: 'The outer derivative is evaluated at the value of the inside.',
        result: u,
      },
      {
        text: 'Put the numbers in.',
        latex: `\\dfrac{dy}{dx} = \\dfrac{${num(p.a)} \\cdot ${num(p.x0)}}{${num(root)}} = ${num(value)}`,
        why: 'Multiply the outer rate 1/(2√u) by the inner rate 2ax.',
        result: value,
      },
    ];
  },

  distractors(p) {
    const u = innerAt(p, p.x0);
    const du = innerSlope(p, p.x0);
    const candidates = [
      { value: round(outerSlope(p, u), 2), mistakeCode: 'FORGOT_INNER' },
      { value: round(p.n * u ** p.n * du, 2), mistakeCode: 'POWER_NOT_REDUCED' },
      { value: du, mistakeCode: 'INSIDE_ONLY' },
    ];
    if (p.form === 'power') {
      // (ax + b)ⁿ read as (ax)ⁿ + bⁿ, then differentiated.
      candidates.push({
        value: p.n * p.a ** p.n * p.x0 ** (p.n - 1),
        mistakeCode: 'EXPAND_TERMWISE',
      });
    } else {
      // d/du √u taken as 1/√u instead of 1/(2√u).
      candidates.push({ value: round(du / Math.sqrt(u), 2), mistakeCode: 'FORGOT_HALF' });
    }
    return cleanDistractors(answerOf(p), candidates);
  },
};
