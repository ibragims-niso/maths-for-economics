import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** lim_{x→∞} (√(x² + ax + b) − √(x² + cx + d)) = (a − c)/2. */
  a: number;
  b: number;
  c: number;
  d: number;
}

/** (a − c)/2 has at most one decimal, so it is exact. */
const EXACT = { tolerance: 0.005, relTolerance: 0 } as const;

export const limitValue = (p: Params) => (p.a - p.c) / 2;

const candidates = (p: Params) => [
  { value: 0, mistakeCode: 'INFINITY_MINUS_INFINITY' },
  { value: p.a - p.c, mistakeCode: 'FORGOT_HALF' },
  { value: (p.b - p.d) / 2, mistakeCode: 'CONSTANT_TERMS' },
];

/** "x² + ax + b" with signs that read naturally. */
const inside = (a: number, b: number) =>
  `x^2 ${a < 0 ? '-' : '+'} ${Math.abs(a) === 1 ? '' : num(Math.abs(a))}x ${b < 0 ? '-' : '+'} ${num(Math.abs(b))}`;

/** C119, difficulty 1: an ∞ − ∞ limit of two square roots, solved with the conjugate. */
export const conjugateLimitAtInfinity: Generator<Params> = {
  id: 'conjugate-limit-at-infinity',
  title: 'An infinity-minus-infinity limit with square roots',
  topicId: 'C119',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const a = rng.int(-12, 20);
      const c = rng.int(-12, 20);
      const b = rng.int(-9, 60);
      const d = rng.int(-9, 60);
      if (a === c || a === 0 || c === 0 || b === 0 || d === 0) continue;
      const p: Params = { a, b, c, d };
      if (cleanDistractors(limitValue(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `Two costs grow almost alike for large output $x$: $\\sqrt{${inside(p.a, p.b)}}$ and $\\sqrt{${inside(p.c, p.d)}}$. Find the limit of their gap, $\\displaystyle\\lim_{x \\to \\infty} \\left(\\sqrt{${inside(p.a, p.b)}} - \\sqrt{${inside(p.c, p.d)}}\\right)$.`,

  answer: (p) => ({ kind: 'numeric', value: limitValue(p), decimals: 1, ...EXACT }),

  steps(p) {
    const top = inside(p.a, p.b);
    const bottom = inside(p.c, p.d);
    const da = p.a - p.c;
    const db = p.b - p.d;
    return [
      {
        text: 'Multiply and divide by the conjugate (the sum of the two roots).',
        latex: `\\sqrt{${top}} - \\sqrt{${bottom}} = \\dfrac{(${top}) - (${bottom})}{\\sqrt{${top}} + \\sqrt{${bottom}}} = \\dfrac{${num(da)}x ${db < 0 ? '-' : '+'} ${num(Math.abs(db))}}{\\sqrt{${top}} + \\sqrt{${bottom}}}`,
        why: 'Both roots grow without limit, an ∞ − ∞ form. Since (u − v)(u + v) = u² − v², the conjugate removes the roots from the top, and the x² terms cancel.',
      },
      {
        text: 'Divide the top and the bottom by x.',
        latex: `\\dfrac{${num(da)} ${db < 0 ? '-' : '+'} \\frac{${num(Math.abs(db))}}{x}}{\\sqrt{1 ${p.a < 0 ? '-' : '+'} \\frac{${num(Math.abs(p.a))}}{x} ${p.b < 0 ? '-' : '+'} \\frac{${num(Math.abs(p.b))}}{x^2}} + \\sqrt{1 ${p.c < 0 ? '-' : '+'} \\frac{${num(Math.abs(p.c))}}{x} ${p.d < 0 ? '-' : '+'} \\frac{${num(Math.abs(p.d))}}{x^2}}}`,
        why: 'For large positive x, √(x² + …) = x·√(1 + …), so dividing by x leaves square roots that tend to 1.',
      },
      {
        text: 'Let x grow without limit.',
        latex: `\\to \\dfrac{${num(da)}}{1 + 1} = ${num(limitValue(p))}`,
        why: 'Every term with x in a denominator vanishes. The gap settles at half the difference of the x-coefficients; the constant terms do not matter.',
        result: limitValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(limitValue(p), candidates(p), EXACT.tolerance, 0),
};
