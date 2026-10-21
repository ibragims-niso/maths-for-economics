import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The limit is lim_{x→∞} ((x + a)/(x + b))^(c·x). */
  a: number;
  b: number;
  c: number;
}

/** The answer e^(c(a − b)) to 4 decimals. */
const FOUR = { tolerance: 0.0001, relTolerance: 0.0005 } as const;

export const exponent = (p: Params) => p.c * (p.a - p.b);
const limitValue = (p: Params) => round(Math.exp(exponent(p)), 4);

const candidates = (p: Params) => [
  { value: 1, mistakeCode: 'ONE_TO_INFINITY' },
  { value: round(Math.exp(p.a - p.b), 4), mistakeCode: 'DROPPED_FACTOR' },
  { value: round(Math.exp(-exponent(p)), 4), mistakeCode: 'SIGN_SLIP' },
];

/** "x + a" with a sign that reads naturally for negative a. */
const shift = (a: number) => (a === 0 ? 'x' : a < 0 ? `x - ${num(-a)}` : `x + ${num(a)}`);

/** C119, difficulty 2: a 1^∞ limit, lim ((x + a)/(x + b))^(cx) = e^(c(a − b)). */
export const oneToInfinityLimit: Generator<Params> = {
  id: 'one-to-infinity-limit',
  title: 'A limit of the form 1 to the power infinity',
  topicId: 'C119',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const a = rng.int(-6, 9);
      const b = rng.int(-6, 9);
      const c = rng.int(2, 4);
      const p: Params = { a, b, c };
      const k = exponent(p);
      // Keep e^k readable to 4 decimals and away from 1.
      if (k === 0 || Math.abs(k) > 6) continue;
      if (
        cleanDistractors(limitValue(p), candidates(p), FOUR.tolerance, FOUR.relTolerance).length < 3
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `Compound growth leads to limits of the form $1^\\infty$. Find $\\displaystyle\\lim_{x \\to \\infty} \\left(\\dfrac{${shift(p.a)}}{${shift(p.b)}}\\right)^{${num(p.c)}x}$. Give your answer to 4 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: limitValue(p), decimals: 4, ...FOUR }),

  steps(p) {
    const d = p.a - p.b;
    const small = `${d < 0 ? '-' : '+'} \\dfrac{${num(Math.abs(d))}}{${shift(p.b)}}`;
    return [
      {
        text: 'Check the form: the base tends to 1 and the power to infinity.',
        latex: `\\dfrac{${shift(p.a)}}{${shift(p.b)}} \\to 1, \\quad ${num(p.c)}x \\to \\infty`,
        why: '1 to the power infinity is not 1: a base a little above (or below) 1, raised to a huge power, can tend to any positive number. That is exactly how compound interest grows.',
      },
      {
        text: 'Write the base as 1 plus a small part.',
        latex: `\\dfrac{${shift(p.a)}}{${shift(p.b)}} = 1 ${small}`,
        why: 'Subtract and add x + b in the numerator: (x + a) = (x + b) + (a − b).',
      },
      {
        text: 'Use the standard limit (1 + k/t)^t → e^k.',
        latex: `\\left(1 ${small}\\right)^{${num(p.c)}x} \\to e^{${num(p.c)} \\cdot (${num(d)})} = e^{${num(exponent(p))}}`,
        why: 'With t = x + b, the bracket raised to the power t tends to e^(a − b); the power c·x is c times t minus a fixed amount, and the fixed part does not change the limit.',
      },
      {
        text: 'Evaluate.',
        latex: `e^{${num(exponent(p))}} = ${num(limitValue(p), 4)}`,
        why: 'A calculator gives the power of e; round only at the end.',
        result: limitValue(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(limitValue(p), candidates(p), FOUR.tolerance, FOUR.relTolerance),
};
