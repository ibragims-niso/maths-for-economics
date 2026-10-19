import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  context: 'pure' | 'royalty';
  /** The integrand is c·x^(−p) on [a, ∞). */
  c: number;
  /** Exponent, always above 1 so that the integral converges. */
  p: number;
  /** Lower limit a ≥ 1. */
  a: number;
}

const TOL = { tolerance: 0.01, relTolerance: 0.001 } as const;

/** ∫ₐ^∞ c·x^(−p) dx = c·a^(1−p)/(p − 1) for p > 1. */
const value = (p: Params) => round((p.c * p.a ** (1 - p.p)) / (p.p - 1), 2);

function candidates(p: Params) {
  return [
    { value: round((p.c * p.a ** (1 - p.p)) / p.p, 2), mistakeCode: 'DIVIDED_BY_P' },
    { value: -value(p), mistakeCode: 'SIGN' },
    { value: round(p.c / (p.p - 1), 2), mistakeCode: 'IGNORED_LOWER_LIMIT' },
  ];
}

/** C116, difficulty 3: value of the convergent improper integral ∫ₐ^∞ c·x^(−p) dx with p > 1. */
export const improperPowerIntegral: Generator<Params> = {
  id: 'improper-power-integral',
  title: 'Improper integral of a power',
  topicId: 'C116',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p = rng.pick([1.5, 2, 2.5, 3, 4] as const);
      // Half-integer powers need a perfect-square lower limit so that a^(1−p) stays readable.
      const a = Number.isInteger(p) ? rng.pick([1, 2, 3, 4, 5, 10]) : rng.pick([1, 4, 9, 16, 25]);
      const context = rng.pick(['pure', 'royalty'] as const);
      const c = context === 'pure' ? rng.int(1, 30) : rng.int(2, 60) * 50;
      const params: Params = { context, c, p, a };
      const v = value(params);
      if (v < 1) continue;
      return params;
    }
  },

  stem: (p) =>
    p.context === 'pure'
      ? `Evaluate the improper integral $\\displaystyle\\int_{${p.a}}^{\\infty} ${p.c === 1 ? '' : p.c}\\,x^{-${num(p.p)}}\\,dx$. Give your answer to 2 decimal places.`
      : `After a book goes out of print, its author's royalties flow at the rate $${num(p.c)}\\,t^{-${num(p.p)}}$ a year at time $t$ years, from $t = ${p.a}$ onwards, for ever. Ignoring discounting, what total income, $\\int_{${p.a}}^{\\infty} ${num(p.c)}\\,t^{-${num(p.p)}}\\,dt$, will the author receive? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...TOL }),

  steps(p) {
    const q = num(p.p - 1);
    const c = num(p.c);
    const power = p.a ** (1 - p.p);
    const v = p.context === 'royalty' ? 't' : 'x';
    return [
      {
        text: 'Find an antiderivative with the power rule.',
        latex: `\\int ${c}\\,${v}^{-${num(p.p)}}\\,d${v} = \\frac{${c}\\,${v}^{-${q}}}{-${q}} = -\\frac{${c}}{${q}\\,${v}^{${q}}}`,
        why: 'Raise the power by 1, from −p to 1 − p, and divide by the new power 1 − p, which is negative here.',
        result: p.p - 1,
      },
      {
        text: 'Integrate up to b and let b grow without limit.',
        latex: `\\int_{${p.a}}^{b} ${c}\\,${v}^{-${num(p.p)}}\\,d${v} =\\frac{${c}}{${q}}\\left(${p.a}^{-${q}} - b^{-${q}}\\right) \\to \\frac{${c}}{${q}} \\cdot ${p.a}^{-${q}} \\text{ as } b \\to \\infty`,
        why: 'Because p > 1 the power of b is negative, so b^(1 − p) shrinks to 0 and the integral converges.',
      },
      {
        text: 'Evaluate the limit.',
        latex: `\\frac{${c}}{${q}} \\times ${num(power, 6)} = ${num(value(p))}`,
        why: 'Only the lower limit is left; the far end of the curve adds less and less.',
        result: value(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(value(p), candidates(p), TOL.tolerance, TOL.relTolerance),
};
