import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** U = x^a·y^(1−a): the consumer spends the share a of income on x. Stored in hundredths. */
  a100: number;
  M: number;
  px: number;
  py: number;
  /** Which term of the Slutsky equation is asked for. */
  ask: 'substitution' | 'income';
}

const SHARES = [20, 25, 30, 40, 50, 60, 70, 75, 80] as const;
const PRICES = [2, 2.5, 4, 5, 8, 10, 12.5, 16, 20, 25] as const;

const share = (p: Params) => p.a100 / 100;
/** Cobb–Douglas demand x = aM/pₓ. */
const demand = (p: Params) => (share(p) * p.M) / p.px;
/** ∂x/∂pₓ = −aM/pₓ², the total effect. */
const total = (p: Params) => (-share(p) * p.M) / (p.px * p.px);
/** ∂x/∂M = a/pₓ. */
const incomeSlope = (p: Params) => share(p) / p.px;
/** Income effect −x·∂x/∂M = −a²M/pₓ². */
const incomeEffect = (p: Params) => -demand(p) * incomeSlope(p);
/** Substitution effect ∂h/∂pₓ = ∂x/∂pₓ + x·∂x/∂M = −a(1 − a)M/pₓ². */
const substitutionEffect = (p: Params) => total(p) - incomeEffect(p);

const value = (p: Params) =>
  round(p.ask === 'substitution' ? substitutionEffect(p) : incomeEffect(p), 2);

function candidates(p: Params) {
  const sub = p.ask === 'substitution';
  return [
    { value: round(total(p), 2), mistakeCode: 'TOTAL_NOT_SPLIT' },
    {
      value: round(sub ? incomeEffect(p) : substitutionEffect(p), 2),
      mistakeCode: 'SWAPPED_EFFECTS',
    },
    { value: -value(p), mistakeCode: 'EFFECT_SIGN' },
    // The income term without the factor x: −∂x/∂M, or the substitution term built from it.
    {
      value: round(sub ? total(p) + incomeSlope(p) : -incomeSlope(p), 2),
      mistakeCode: 'FORGOT_QUANTITY',
    },
  ];
}

const twoDecimals = (v: number) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
const utility = (p: Params) => `x^{${num(share(p))}}y^{${num(1 - share(p))}}`;

/** OP04, difficulty 3: the substitution or income term of the Slutsky equation for Cobb–Douglas demand. */
export const slutskyEquationCobbDouglas: Generator<Params> = {
  id: 'slutsky-equation-cobb-douglas',
  title: 'The Slutsky equation',
  topicId: 'OP04',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        a100: rng.pick(SHARES),
        M: 100 * rng.int(2, 60),
        px: rng.pick(PRICES),
        py: rng.int(1, 20),
        ask: rng.pick(['substitution', 'income'] as const),
      };
      const x = demand(p);
      if (Math.abs(x - Math.round(x)) > 1e-9 || x < 5) continue;
      if (!twoDecimals(total(p)) || !twoDecimals(incomeEffect(p))) continue;
      if (!twoDecimals(substitutionEffect(p))) continue;
      const v = Math.abs(value(p));
      if (v < 0.5 || v > 300) continue;
      if (cleanDistractors(value(p), candidates(p)).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer with utility $U = ${utility(p)}$ has income $M = ${num(p.M)}$ and faces the prices $p_x = ${num(p.px)}$ and $p_y = ${num(p.py)}$. In the Slutsky equation $\\dfrac{\\partial x}{\\partial p_x} = \\dfrac{\\partial h}{\\partial p_x} - x\\,\\dfrac{\\partial x}{\\partial M}$, find the ${p.ask === 'substitution' ? 'substitution effect $\\partial h/\\partial p_x$' : 'income effect $-x\\,\\partial x/\\partial M$'} at these prices. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2 }),

  steps(p) {
    const a = num(share(p));
    const x = demand(p);
    const first = [
      {
        text: 'Find the demand for x.',
        latex: `x = \\dfrac{aM}{p_x} = \\dfrac{${a} \\cdot ${num(p.M)}}{${num(p.px)}} = ${num(x)}`,
        why: `With Cobb–Douglas utility the consumer spends the share a = ${a} of income on x, whatever the prices; p_y does not enter.`,
        result: x,
      },
      {
        text: 'Differentiate demand with respect to the price and to income.',
        latex: `\\dfrac{\\partial x}{\\partial p_x} = -\\dfrac{aM}{p_x^2} = ${num(total(p))}, \\quad \\dfrac{\\partial x}{\\partial M} = \\dfrac{a}{p_x} = ${num(incomeSlope(p), 4)}`,
        why: 'The first is the total effect of a price rise on demand; the second is the slope of the Engel curve, which is positive, so x is a normal good.',
        result: round(total(p), 2),
      },
    ];
    const incomeStep = {
      text: 'Compute the income effect.',
      latex: `-x\\,\\dfrac{\\partial x}{\\partial M} = -${num(x)} \\times ${num(incomeSlope(p), 4)} = ${num(incomeEffect(p))}`,
      why: `A price rise of 1 costs the consumer about x = ${num(x)} of income (the envelope theorem), and losing that income cuts demand at the rate ∂x/∂M.`,
      result: round(incomeEffect(p), 2),
    };
    if (p.ask === 'income') return [...first, incomeStep];
    return [
      ...first,
      incomeStep,
      {
        text: 'The substitution effect is the total effect minus the income effect.',
        latex: `\\dfrac{\\partial h}{\\partial p_x} = ${num(total(p))} - (${num(incomeEffect(p))}) = ${num(substitutionEffect(p))}`,
        why: `It is negative, as a substitution effect must be. Check: it equals −a(1 − a)M/pₓ² = −(1 − a)·x/pₓ, the slope of the compensated demand.`,
        result: value(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(value(p), candidates(p)),
};
