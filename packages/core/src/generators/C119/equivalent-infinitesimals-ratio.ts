import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Small quantities that behave like (factor)·u as u → 0. */
export const FORMS = {
  sin: { factor: 1, latex: (u: string) => `\\sin ${u}`, near: 'sin u ≈ u' },
  tan: { factor: 1, latex: (u: string) => `\\tan ${u}`, near: 'tan u ≈ u' },
  ln: { factor: 1, latex: (u: string) => `\\ln(1 + ${u})`, near: 'ln(1 + u) ≈ u' },
  exp: { factor: 1, latex: (u: string) => `e^{${u}} - 1`, near: 'eᵘ − 1 ≈ u' },
  sqrt: { factor: 0.5, latex: (u: string) => `\\sqrt{1 + ${u}} - 1`, near: '√(1 + u) − 1 ≈ u/2' },
} as const;

export type Form = keyof typeof FORMS;

export const evaluateForm = (form: Form, u: number) => {
  switch (form) {
    case 'sin':
      return Math.sin(u);
    case 'tan':
      return Math.tan(u);
    case 'ln':
      return Math.log1p(u);
    case 'exp':
      return Math.expm1(u);
    case 'sqrt':
      return Math.sqrt(1 + u) - 1;
  }
};

interface Params {
  top: Form;
  bottom: Exclude<Form, 'sqrt'>;
  a: number;
  b: number;
}

const RATIO = { tolerance: 0.005, relTolerance: 0 } as const;

export const exactLimit = (p: Params) => (FORMS[p.top].factor * p.a) / p.b;
const limitValue = (p: Params) => round(exactLimit(p), 2);

/** "ax" for the argument of a function. */
const arg = (k: number) => `${k === 1 ? '' : num(k)}x`;

function candidates(p: Params) {
  const list = [
    { value: round(p.b / (FORMS[p.top].factor * p.a), 2), mistakeCode: 'FLIPPED_RATIO' },
    { value: 1, mistakeCode: 'DROPPED_COEFFICIENTS' },
    { value: 0, mistakeCode: 'ZERO_OVER_ZERO' },
  ];
  if (p.top === 'sqrt') list.push({ value: round(p.a / p.b, 2), mistakeCode: 'FORGOT_POWER' });
  return list;
}

/** C119, difficulty 3: a 0/0 limit solved by replacing small quantities with equivalent ones. */
export const equivalentInfinitesimalsRatio: Generator<Params> = {
  id: 'equivalent-infinitesimals-ratio',
  title: 'A 0/0 limit by equivalent infinitesimals',
  topicId: 'C119',
  difficulty: 3,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const top = rng.pick(['sin', 'tan', 'ln', 'exp', 'sqrt'] as const);
      const bottom = rng.pick(['sin', 'tan', 'ln', 'exp'] as const);
      const a = rng.int(1, 9);
      // b divides 100 so that a/b has at most 2 decimals (a/(2b) is rounded for √).
      const b = rng.pick([1, 2, 4, 5] as const);
      if (top === bottom || a === b) continue;
      const p: Params = { top, bottom, a, b };
      if (Math.abs(exactLimit(p) - 1) < 0.01) continue;
      if (cleanDistractors(limitValue(p), candidates(p), RATIO.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `Find $\\displaystyle\\lim_{x \\to 0} \\dfrac{${FORMS[p.top].latex(arg(p.a))}}{${FORMS[p.bottom].latex(arg(p.b))}}$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: limitValue(p), decimals: 2, ...RATIO }),

  steps(p) {
    const top = FORMS[p.top];
    const bottom = FORMS[p.bottom];
    const topEq = top.factor === 1 ? arg(p.a) : `\\tfrac12 \\cdot ${arg(p.a)}`;
    return [
      {
        text: 'Plug in x = 0 to see the form.',
        latex: `\\dfrac{${top.latex('0')}}{${bottom.latex('0')}} = \\dfrac{0}{0}`,
        why: '0/0 does not mean 0 or 1: both parts are infinitesimals, and the answer depends on how fast each one shrinks.',
      },
      {
        text: 'Replace each small quantity by its simple equivalent.',
        latex: `${top.latex(arg(p.a))} \\sim ${topEq}, \\qquad ${bottom.latex(arg(p.b))} \\sim ${arg(p.b)}`,
        why: `Near zero ${top.near} and ${bottom.near}, with u = ${arg(p.a)} on top and u = ${arg(p.b)} below. In a product or a quotient an infinitesimal may be swapped for an equivalent one without changing the limit.`,
      },
      {
        text: 'Cancel x and read off the limit.',
        latex: `\\lim_{x \\to 0} \\dfrac{${topEq}}{${arg(p.b)}} = \\dfrac{${num(top.factor * p.a)}}{${num(p.b)}} = ${num(limitValue(p))}`,
        why: 'Both equivalents are multiples of x, so their ratio is a constant: the ratio of the coefficients.',
        result: limitValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(limitValue(p), candidates(p), RATIO.tolerance, 0),
};
