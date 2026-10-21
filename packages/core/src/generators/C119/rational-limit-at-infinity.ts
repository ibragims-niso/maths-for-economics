import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'plants' | 'regions';

interface Params {
  context: Context;
  /** First quadratic a₁x² + b₁x + c₁. */
  a1: number;
  b1: number;
  c1: number;
  /** Second quadratic a₂x² + b₂x + c₂. */
  a2: number;
  b2: number;
  c2: number;
}

/** Exact ratios with at most 2 decimals; only rounding slips are forgiven. */
const RATIO = { tolerance: 0.005, relTolerance: 0 } as const;

const limitValue = (p: Params) => round(p.a1 / p.a2, 2);

/** "ax² + bx + c" in the variable v. */
const quadratic = (a: number, b: number, c: number, v: string) =>
  `${a === 1 ? '' : num(a)}${v}^2 + ${num(b)}${v} + ${num(c)}`;

const VARIABLE: Record<Context, string> = { plants: 'q', regions: 'n' };

const candidates = (p: Params) => [
  { value: round(p.c1 / p.c2, 2), mistakeCode: 'CONSTANT_RATIO' },
  { value: round(p.b1 / p.b2, 2), mistakeCode: 'MIDDLE_TERMS' },
  { value: round(p.a2 / p.a1, 2), mistakeCode: 'FLIPPED_RATIO' },
];

/** C119, difficulty 1: the limit at infinity of a ratio of two quadratics (leading terms). */
export const rationalLimitAtInfinity: Generator<Params> = {
  id: 'rational-limit-at-infinity',
  title: 'Long-run ratio of two quadratics',
  topicId: 'C119',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    for (;;) {
      const context = rng.pick(['plants', 'regions'] as const);
      // a₂ divides 100 so that a₁/a₂ has at most 2 decimals.
      const a2 = rng.pick([2, 4, 5, 10, 20, 25] as const);
      const a1 = rng.int(1, 12);
      const b1 = rng.int(1, 12) * 5;
      const b2 = rng.int(1, 12) * 5;
      const c1 = rng.int(1, 20) * 50;
      const c2 = rng.int(1, 20) * 50;
      if (a1 === a2) continue;
      const p: Params = { context, a1, b1, c1, a2, b2, c2 };
      if (cleanDistractors(limitValue(p), candidates(p), RATIO.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const v = VARIABLE[p.context];
    const f1 = quadratic(p.a1, p.b1, p.c1, v);
    const f2 = quadratic(p.a2, p.b2, p.c2, v);
    return p.context === 'plants'
      ? `Two plants make the same product. Producing $q$ units costs $C_1(q) = ${f1}$ in the old plant and $C_2(q) = ${f2}$ in the new one. What does the cost ratio $C_1(q)/C_2(q)$ tend to as output grows without limit? Give your answer to 2 decimal places.`
      : `After $n$ years, output in region A is modelled as $Y_A(n) = ${f1}$ and in region B as $Y_B(n) = ${f2}$. What does the ratio $Y_A(n)/Y_B(n)$ tend to as $n \\to \\infty$? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: limitValue(p), decimals: 2, ...RATIO }),

  steps(p) {
    const v = VARIABLE[p.context];
    return [
      {
        text: `Divide the top and the bottom by ${v}², the highest power.`,
        latex: `\\dfrac{${quadratic(p.a1, p.b1, p.c1, v)}}{${quadratic(p.a2, p.b2, p.c2, v)}} = \\dfrac{${num(p.a1)} + \\frac{${num(p.b1)}}{${v}} + \\frac{${num(p.c1)}}{${v}^2}}{${num(p.a2)} + \\frac{${num(p.b2)}}{${v}} + \\frac{${num(p.c2)}}{${v}^2}}`,
        why: 'Both top and bottom grow without limit (∞/∞), so plugging in tells you nothing. Dividing by the highest power leaves the size of each part visible.',
      },
      {
        text: 'Let the terms with the variable in the denominator vanish.',
        latex: `\\dfrac{${num(p.b1)}}{${v}},\\ \\dfrac{${num(p.c1)}}{${v}^2},\\ \\dfrac{${num(p.b2)}}{${v}},\\ \\dfrac{${num(p.c2)}}{${v}^2} \\to 0`,
        why: 'A fixed number divided by something that grows without limit is an infinitesimal. In the long run only the squared terms matter.',
      },
      {
        text: 'The limit is the ratio of the leading coefficients.',
        latex: `\\lim = \\dfrac{${num(p.a1)}}{${num(p.a2)}} = ${num(limitValue(p))}`,
        why: 'For two polynomials of the same degree, the long-run ratio is set by their leading coefficients alone; the constants (fixed costs, starting levels) stop mattering.',
        result: limitValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(limitValue(p), candidates(p), RATIO.tolerance, 0),
};
