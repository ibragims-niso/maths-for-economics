import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  alpha: number;
  beta: number;
  /** Inverse demand P(Q) = α − βQ^k with k = 1/2 (a square root) or k = 2. */
  k: 0.5 | 2;
  q: number;
  /** Drawn first so it is whole: α = mr + (1 + k)βq^k. */
  mr: number;
}

const coef = (x: number) => (x === 1 ? '' : num(x));
/** βQ^k written in LaTeX for a given variable or number. */
const powerTerm = (k: 0.5 | 2, x: string) => (k === 0.5 ? `\\sqrt{${x}}` : `${x}^2`);

/** Q^k, exact for the perfect squares used with k = 1/2. */
const qPower = (k: 0.5 | 2, q: number) => (k === 0.5 ? Math.sqrt(q) : q ** 2);
const price = (p: Params) => p.alpha - p.beta * qPower(p.k, p.q);
/** Q · P′(Q) = −kβQ^k at the chosen quantity. */
const qTimesSlope = (p: Params) => -p.k * p.beta * qPower(p.k, p.q);

function candidates(p: Params) {
  return [
    { value: price(p), mistakeCode: 'PRICE_AS_MR' },
    // u′v′ = 1 · P′(Q) = −kβQ^(k − 1)
    { value: round(qTimesSlope(p) / p.q, 2), mistakeCode: 'PRODUCT_OF_DERIVATIVES' },
    // P′(Q) taken as −βQ^(k − 1), without the factor k
    { value: p.alpha - 2 * p.beta * qPower(p.k, p.q), mistakeCode: 'FORGOT_POWER' },
  ];
}

/** C103, difficulty 2: marginal revenue R′(Q₀) for R(Q) = Q · P(Q), P(Q) = α − β√Q or α − βQ². */
export const marginalRevenueProductRule: Generator<Params> = {
  id: 'marginal-revenue-product-rule',
  title: 'Marginal revenue with the product rule',
  topicId: 'C103',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const k = rng.pick([0.5, 2] as const);
      const mr = rng.int(2, 120);
      let beta: number;
      let q: number;
      if (k === 0.5) {
        const root = rng.int(2, 20);
        beta = rng.int(1, 10);
        // Q · P′(Q) = −β√Q/2 must be whole.
        if ((beta * root) % 2 !== 0) continue;
        q = root * root;
      } else {
        beta = rng.int(1, 5);
        q = rng.int(2, 12);
      }
      const p: Params = { alpha: mr + (1 + k) * beta * qPower(k, q), beta, k, q, mr };
      if (cleanDistractors(mr, candidates(p)).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm's inverse demand curve is $P(Q) = ${num(p.alpha)} - ${coef(p.beta)}${powerTerm(p.k, 'Q')}$, so its revenue is $R(Q) = Q \\cdot P(Q)$. Use the product rule to find the marginal revenue $R'(Q)$ at $Q = ${p.q}$.`,

  answer: (p) => ({ kind: 'numeric', value: p.mr, decimals: 2 }),

  steps(p) {
    const slope = p.k === 0.5 ? `-\\dfrac{${num(p.beta)}}{2\\sqrt{Q}}` : `-${num(2 * p.beta)}Q`;
    return [
      {
        text: 'Split revenue into two factors and differentiate each.',
        latex: `u = Q,\\; u' = 1; \\quad v = P(Q) = ${num(p.alpha)} - ${coef(p.beta)}${powerTerm(p.k, 'Q')},\\; v' = ${slope}`,
        why:
          p.k === 0.5
            ? 'Write √Q as Q^(1/2); the power rule gives (1/2)Q^(−1/2) = 1/(2√Q), and the constant −β stays in front.'
            : 'The power rule gives 2Q for Q², the constant −β stays in front, and the constant α has derivative 0.',
      },
      {
        text: `Find the price at Q = ${p.q}.`,
        latex: `P(${p.q}) = ${num(p.alpha)} - ${p.beta === 1 ? '' : `${num(p.beta)} \\cdot `}${powerTerm(p.k, String(p.q))} = ${num(price(p))}`,
        why: 'The first part of the product rule, u′v = 1 · P(Q), is the price the extra unit sells for.',
        result: price(p),
      },
      {
        text: `Find Q · P′(Q) at Q = ${p.q}.`,
        latex: `${p.q} \\cdot P'(${p.q}) = ${num(qTimesSlope(p))}`,
        why: 'The second part, uv′ = Q · P′(Q), is the revenue lost because selling more lowers the price on all the other units.',
        result: qTimesSlope(p),
      },
      {
        text: 'Add the two parts (product rule).',
        latex: `R'(${p.q}) = u'v + uv' = ${num(price(p))} - ${num(-qTimesSlope(p))} = ${num(p.mr)}`,
        why: 'The product rule (uv)′ = u′v + uv′: marginal revenue is the price minus the loss on earlier units.',
        result: p.mr,
      },
    ];
  },

  distractors: (p) => cleanDistractors(p.mr, candidates(p)),
};
