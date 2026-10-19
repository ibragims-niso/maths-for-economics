import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, gcd, minLatex, setPriceLatex, term } from './complements';

interface Params {
  /** U = min(a·x, b·y), a and b coprime. */
  a: number;
  b: number;
  px: number;
  py: number;
  /** Income: it does not affect either elasticity. */
  M: number;
  /** Own-price elasticity of x, or its cross-price elasticity with respect to p_y. */
  ask: 'own' | 'cross';
}

/** Demand x = M/(p_x + (a/b)·p_y) = b·M/(b·p_x + a·p_y). */
const setPrice = (p: Params) => p.b * p.px + p.a * p.py;
const ownExact = (p: Params) => -(p.b * p.px) / setPrice(p);
const crossExact = (p: Params) => -(p.a * p.py) / setPrice(p);
const exact = (p: Params) => (p.ask === 'own' ? ownExact(p) : crossExact(p));
const value = (p: Params) => round(exact(p), 2);

/** "(3/2)" or "3": the ratio a/b as plain text for the why lines. */
const share = (a: number, b: number) =>
  a === b ? '' : a % b === 0 ? num(a / b) : `(${num(a)}/${num(b)})`;

function candidates(p: Params) {
  const own = p.ask === 'own';
  return [
    { value: own ? -1 : 0, mistakeCode: 'COBB_DOUGLAS_ELASTICITY' },
    { value: -value(p), mistakeCode: 'ELASTICITY_SIGN' },
    { value: round(own ? crossExact(p) : ownExact(p), 2), mistakeCode: 'SWAPPED_ELASTICITY' },
    { value: round(1 / exact(p), 2), mistakeCode: 'INVERTED_ELASTICITY' },
  ];
}

/** MV10, difficulty 3: an own- or cross-price elasticity of demand for perfect complements. */
export const complementsPriceElasticity: Generator<Params> = {
  id: 'complements-price-elasticity',
  title: 'Price elasticities for complements',
  topicId: 'MV10',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 4);
      const b = rng.int(1, 4);
      if (gcd(a, b) !== 1) continue;
      const px = rng.int(2, 40);
      const py = rng.int(2, 40);
      const M = 100 * rng.int(2, 50);
      const p: Params = { a, b, px, py, M, ask: rng.pick(['own', 'cross'] as const) };
      // Keep both elasticities clearly inside (−1, 0) and apart from each other (they add up to −1).
      const e = Math.abs(ownExact(p));
      if (e < 0.1 || e > 0.9 || Math.abs(e - 0.5) < 0.05) continue;
      const kept = cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A consumer uses goods $x$ and $y$ only together, so her utility is $U = ${minLatex(p.a, p.b)}$. The prices are $p_x = ${num(p.px)}$ and $p_y = ${num(p.py)}$ and her income is $M = ${num(p.M)}$. ${
      p.ask === 'own'
        ? 'Find the price elasticity of her demand for $x$ at these prices.'
        : 'Find the cross-price elasticity of her demand for $x$ with respect to the price of $y$ at these prices.'
    } Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...EXACT }),

  steps(p) {
    const own = p.ask === 'own';
    const D = setPrice(p);
    const top = own ? p.b * p.px : p.a * p.py;
    const x = (p.b * p.M) / D;
    // With b = 1 the general form is the same as the first one, so it is left out.
    const general =
      p.b === 1 ? '' : `\\dfrac{${term(p.b, 'M')}}{${term(p.b, 'p_x')} + ${term(p.a, 'p_y')}} = `;
    return [
      {
        text: 'Write down the demand function: income divided by the price of one complete set.',
        latex: `x = \\dfrac{M}{${setPriceLatex(p.a, p.b)}} = ${general}\\dfrac{${num(p.b * p.M)}}{${num(D)}} \\approx ${num(x)}`,
        why: `No units are wasted, so ${term(p.a, 'x')} = ${term(p.b, 'y')}; putting y = ${share(p.a, p.b)}x into the budget gives the demand.`,
      },
      {
        text: own
          ? 'Differentiate with respect to the price of x.'
          : 'Differentiate with respect to the price of y.',
        latex: own
          ? `\\dfrac{\\partial x}{\\partial p_x} = -\\dfrac{${term(p.b * p.b, 'M')}}{(${term(p.b, 'p_x')} + ${term(p.a, 'p_y')})^2}`
          : `\\dfrac{\\partial x}{\\partial p_y} = -\\dfrac{${term(p.a * p.b, 'M')}}{(${term(p.b, 'p_x')} + ${term(p.a, 'p_y')})^2}`,
        why: own
          ? `x = ${term(p.b, 'M')}·(${term(p.b, 'pₓ')} + ${term(p.a, 'p_y')})⁻¹, so the chain rule brings down −1 and the inner derivative ${num(p.b)}.`
          : `x = ${term(p.b, 'M')}·(${term(p.b, 'pₓ')} + ${term(p.a, 'p_y')})⁻¹, so the chain rule brings down −1 and the inner derivative ${num(p.a)}. A dearer y makes every set dearer, so less x is bought.`,
      },
      {
        text: 'Multiply by price over quantity.',
        latex: own
          ? `\\varepsilon = \\dfrac{\\partial x}{\\partial p_x}\\cdot\\dfrac{p_x}{x} = -\\dfrac{${term(p.b, 'p_x')}}{${term(p.b, 'p_x')} + ${term(p.a, 'p_y')}} = -\\dfrac{${num(top)}}{${num(D)}} \\approx ${num(value(p))}`
          : `\\varepsilon_{xy} = \\dfrac{\\partial x}{\\partial p_y}\\cdot\\dfrac{p_y}{x} = -\\dfrac{${term(p.a, 'p_y')}}{${term(p.b, 'p_x')} + ${term(p.a, 'p_y')}} = -\\dfrac{${num(top)}}{${num(D)}} \\approx ${num(value(p))}`,
        why: own
          ? `M cancels: the elasticity is minus the share of income spent on x. It lies between −1 and 0, unlike the constant −1 of Cobb–Douglas demand.`
          : `M cancels: the elasticity is minus the share of income spent on y. It is negative because x and y are complements; own and cross elasticities add up to −1.`,
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
