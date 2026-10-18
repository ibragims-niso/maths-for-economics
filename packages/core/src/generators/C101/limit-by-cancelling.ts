import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The point x approaches; the denominator is x − a. */
  a: number;
  /** The other root of the numerator is −b, so the numerator is (x − a)(x + b). */
  b: number;
}

/** " + 3x", " - x", " - 40", or "" for a zero coefficient. */
function term(coefficient: number, variable: string): string {
  if (coefficient === 0) return '';
  const size = Math.abs(coefficient);
  const shown = size === 1 && variable ? '' : num(size);
  return `${coefficient < 0 ? ' - ' : ' + '}${shown}${variable}`;
}

/** The numerator (x − a)(x + b) multiplied out: x² + (b − a)x − ab. */
export const numerator = (p: Params) => `x^2${term(p.b - p.a, 'x')}${term(-p.a * p.b, '')}`;

/** The middle term with x replaced by a (a > 0): " + 3 \cdot 5", " - 5", or "". */
function times(coefficient: number, a: number): string {
  if (coefficient === 0) return '';
  const size = Math.abs(coefficient);
  const shown = size === 1 ? num(a) : `${num(size)} \\cdot ${num(a)}`;
  return `${coefficient < 0 ? ' - ' : ' + '}${shown}`;
}

/** "x + 8" or "x - 3". */
const factor = (b: number) => `x${term(b, '')}`;

/** C101, difficulty 1: a 0/0 limit of a rational function, found by factorising and cancelling. */
export const limitByCancelling: Generator<Params> = {
  id: 'limit-by-cancelling',
  title: 'Limit by cancelling a factor',
  topicId: 'C101',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 9);
      const b = rng.int(-9, 12);
      // b = 0 makes the numerator x(x − a) with no constant; b = −a makes the limit 0.
      if (b !== 0 && a + b !== 0) return { a, b };
    }
  },

  stem: (p) =>
    `Find $\\displaystyle\\lim_{x \\to ${num(p.a)}} \\frac{${numerator(p)}}{x - ${num(p.a)}}$.`,

  answer: (p) => ({ kind: 'numeric', value: p.a + p.b, decimals: 2 }),

  steps: (p) => [
    {
      text: 'Substitute first to see what kind of limit it is.',
      latex: `\\frac{${num(p.a)}^2${times(p.b - p.a, p.a)}${term(-p.a * p.b, '')}}{${num(p.a)} - ${num(p.a)}} = \\frac{0}{0}`,
      why: '0/0 is not a number: it says the top and the bottom share the factor (x − a), which must be cancelled before the limit can be read off.',
    },
    {
      text: 'Factorise the numerator and cancel the common factor.',
      latex: `\\frac{(x - ${num(p.a)})(${factor(p.b)})}{x - ${num(p.a)}} = ${factor(p.b)} \\quad (x \\ne ${num(p.a)})`,
      why: `The numerator is 0 at x = ${p.a}, so (x − ${p.a}) is one of its factors. Cancelling is allowed because the limit only looks at x close to ${p.a}, never at x = ${p.a} itself.`,
    },
    {
      text: 'Now substitute into what is left.',
      latex: `\\lim_{x \\to ${num(p.a)}} (${factor(p.b)}) = ${num(p.a)}${term(p.b, '')} = ${num(p.a + p.b)}`,
      why: 'What is left is a polynomial, which is continuous, so its limit is simply its value at the point.',
      result: p.a + p.b,
    },
  ],

  distractors: (p) =>
    cleanDistractors(p.a + p.b, [
      { value: 0, mistakeCode: 'ZERO_OVER_ZERO' },
      { value: p.a - p.b, mistakeCode: 'SIGN_IN_FACTOR' },
      { value: p.b, mistakeCode: 'PART_OF_FACTOR' },
    ]),
};
