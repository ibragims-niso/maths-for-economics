import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** f(x) = (a x² + b x + c)/(x + d), with d > 0. */
  a: number;
  b: number;
  c: number;
  d: number;
}

const WHOLE = { tolerance: 0.001, relTolerance: 0 } as const;

/** The oblique asymptote is y = a x + (b − a d). */
export const intercept = (p: Params) => p.b - p.a * p.d;
/** The remainder of the division, c − d(b − a d); non-zero, so the curve really is a hyperbola. */
export const remainder = (p: Params) => p.c - p.d * intercept(p);

const candidates = (p: Params) => [
  { value: p.b, mistakeCode: 'FORGOT_SHIFT' },
  { value: p.b + p.a * p.d, mistakeCode: 'SIGN_SLIP' },
  { value: p.a, mistakeCode: 'SLOPE_NOT_INTERCEPT' },
];

const numerator = (p: Params) =>
  `${p.a === 1 ? '' : num(p.a)}q^2 ${p.b < 0 ? '-' : '+'} ${num(Math.abs(p.b))}q + ${num(p.c)}`;

/** C121, difficulty 1: the oblique asymptote of (aq² + bq + c)/(q + d), found by long division. */
export const obliqueAsymptoteIntercept: Generator<Params> = {
  id: 'oblique-asymptote-intercept',
  title: 'Oblique asymptote of a unit cost curve',
  topicId: 'C121',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 6);
      const b = rng.int(-10, 40);
      const c = rng.int(1, 40) * 10;
      const d = rng.int(1, 9);
      const p: Params = { a, b, c, d };
      if (b === 0 || remainder(p) === 0) continue;
      if (cleanDistractors(intercept(p), candidates(p), WHOLE.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm models its cost per order as $u(q) = \\dfrac{${numerator(p)}}{q + ${num(p.d)}}$, where $q$ is the order size. For large orders the graph approaches a straight line $y = kq + m$ (an oblique asymptote). Find $m$.`,

  answer: (p) => ({ kind: 'numeric', value: intercept(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const m = intercept(p);
    const r = remainder(p);
    return [
      {
        text: 'Find the slope k as the limit of u(q)/q.',
        latex: `k = \\lim_{q \\to \\infty} \\dfrac{${numerator(p)}}{q\\,(q + ${num(p.d)})} = ${num(p.a)}`,
        why: 'Both top and bottom are quadratics, so the ratio tends to the ratio of the leading coefficients (C119).',
      },
      {
        text: 'Find m as the limit of u(q) − kq.',
        latex: `u(q) - ${num(p.a)}q = \\dfrac{${numerator(p)} - ${num(p.a)}q(q + ${num(p.d)})}{q + ${num(p.d)}} = \\dfrac{${num(p.b - p.a * p.d)}q + ${num(p.c)}}{q + ${num(p.d)}} \\to ${num(m)}`,
        why: 'Subtract the line and put everything over one denominator: the q² terms cancel, leaving a ratio of two linear terms that tends to the ratio of their q-coefficients.',
      },
      {
        text: 'Check by long division.',
        latex: `u(q) = ${num(p.a)}q ${m < 0 ? '-' : '+'} ${num(Math.abs(m))} ${r < 0 ? '-' : '+'} \\dfrac{${num(Math.abs(r))}}{q + ${num(p.d)}}, \\qquad m = ${num(m)}`,
        why: 'The last fraction tends to 0 as q grows, so the curve gets ever closer to the line y = kq + m.',
        result: m,
      },
    ];
  },

  distractors: (p) => cleanDistractors(intercept(p), candidates(p), WHOLE.tolerance, 0),
};
