import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, gcd } from '../MV08/budget';

interface Params {
  /** V(p_x, p_y, M) = A·M^(a+b)/(p_x^a·p_y^b), the indirect utility of U = x^a·y^b. */
  a: number;
  b: number;
  px: number;
  py: number;
  M: number;
  /** The demand for x, a whole number: x = a·M/((a+b)·p_x). */
  x: number;
}

/** Roy's identity: x = −(∂V/∂p_x)/(∂V/∂M) = (a·V/p_x)/((a+b)·V/M). */
const demand = (p: Params) => p.x;
/** The demand for y, from the p_y derivative instead. */
const otherDemand = (p: Params) => round((p.b * p.M) / ((p.a + p.b) * p.py), 2);

/** "x^{2}" in LaTeX, without the power when it is 1. */
const pow = (base: string, e: number) => (e === 1 ? base : `${base}^{${e}}`);

function candidates(p: Params) {
  return [
    { value: -demand(p), mistakeCode: 'ROY_SIGN' },
    { value: round(1 / demand(p), 4), mistakeCode: 'ROY_INVERTED' },
    { value: otherDemand(p), mistakeCode: 'OTHER_GOOD' },
    { value: (p.a + p.b) * demand(p), mistakeCode: 'INCOME_POWER' },
  ];
}

/** MV12, difficulty 3: the demand for x from an indirect utility A·M^(a+b)/(p_x^a·p_y^b) by Roy's identity. */
export const roysIdentityDemand: Generator<Params> = {
  id: 'roys-identity-demand',
  title: "Demand from Roy's identity",
  topicId: 'MV12',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 3);
      const b = rng.int(1, 3);
      const px = rng.int(2, 20);
      const py = rng.int(2, 20);
      if (px === py) continue;
      const x = rng.int(2, 80);
      // M = (a+b)·p_x·x/a must be a whole income.
      if (((a + b) * px * x) % a !== 0) continue;
      const M = ((a + b) * px * x) / a;
      if (M < 50 || M > 5000) continue;
      const p: Params = { a, b, px, py, M, x };
      const kept = cleanDistractors(demand(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer's indirect utility function is $V(p_x, p_y, M) = A\\,\\dfrac{${pow('M', p.a + p.b)}}{${pow('p_x', p.a)}\\,${pow('p_y', p.b)}}$, where $A > 0$ is a constant. Use Roy's identity to find her demand for good $x$ when $p_x = ${num(p.px)}$, $p_y = ${num(p.py)}$ and $M = ${num(p.M)}$.`,

  answer: (p) => ({ kind: 'numeric', value: demand(p), decimals: 2, ...EXACT }),

  steps(p) {
    const n = p.a + p.b;
    const aV = p.a === 1 ? 'V' : `${p.a}V`;
    // The share a/(a+b) of income spent on x, in lowest terms.
    const g = gcd(p.a, n);
    const share = `\\dfrac{${p.a / g}}{${n / g}}`;
    return [
      {
        text: 'Differentiate V with respect to the price of x.',
        latex: `\\dfrac{\\partial V}{\\partial p_x} = -${p.a === 1 ? '' : p.a}A\\,\\dfrac{${pow('M', n)}}{${pow('p_x', p.a + 1)}\\,${pow('p_y', p.b)}} = -\\dfrac{${aV}}{p_x}`,
        why: `p_x appears with the power −${p.a}, so the derivative multiplies V by −${p.a} and divides by p_x. It is negative: a dearer good lowers the best utility.`,
      },
      {
        text: 'Differentiate V with respect to income.',
        latex: `\\dfrac{\\partial V}{\\partial M} = ${n}A\\,\\dfrac{${pow('M', n - 1)}}{${pow('p_x', p.a)}\\,${pow('p_y', p.b)}} = \\dfrac{${n}V}{M}`,
        why: `M appears with the power ${n}, so the derivative is ${n}·V/M. This is λ, the marginal utility of income.`,
      },
      {
        text: "Apply Roy's identity and put in the numbers.",
        latex: `x^* = -\\dfrac{\\partial V/\\partial p_x}{\\partial V/\\partial M} = \\dfrac{${aV}/p_x}{${n}V/M} = ${share}\\cdot\\dfrac{M}{p_x} = ${share}\\cdot\\dfrac{${num(p.M)}}{${num(p.px)}} = ${num(demand(p))}`,
        why: `By the envelope theorem ∂V/∂p_x = −λx and ∂V/∂M = λ, so the ratio leaves x. A and V cancel, leaving the Cobb–Douglas demand: the share ${p.a / g}/${n / g} of income spent on x.`,
        result: demand(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(demand(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
