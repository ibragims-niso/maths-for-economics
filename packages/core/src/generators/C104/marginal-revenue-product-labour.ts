import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Output Q(L) = k√L. */
  k: number;
  /** √L, so the number of workers L = root² and the output k·root are whole. */
  root: number;
  /** Revenue R(Q) = αQ − βQ². */
  alpha: number;
  beta: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

const labourOf = (p: Params) => p.root * p.root;
const outputOf = (p: Params) => p.k * p.root;
/** Marginal product of labour Q′(L) = k/(2√L). */
const mpl = (p: Params) => p.k / (2 * p.root);
const revenueOf = (p: Params, q: number) => p.alpha * q - p.beta * q * q;
/** Marginal revenue R′(Q) = α − 2βQ. */
const marginalRevenue = (p: Params, q: number) => p.alpha - 2 * p.beta * q;
const answerOf = (p: Params) => round(marginalRevenue(p, outputOf(p)) * mpl(p), 2);

/** " = 0.25" when k/(2√L) has at most 4 decimals; otherwise the fraction stands alone. */
const mplTex = (p: Params) => {
  const v = mpl(p);
  return Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-9 ? ` = ${num(v, 4)}` : '';
};

const revenueTex = (p: Params) => `${num(p.alpha)}Q - ${p.beta === 1 ? '' : num(p.beta)}Q^2`;

/** C104, difficulty 3: marginal revenue product of labour, dR/dL = R′(Q(L))·Q′(L). */
export const marginalRevenueProductLabour: Generator<Params> = {
  id: 'marginal-revenue-product-labour',
  title: 'Marginal revenue product of labour',
  topicId: 'C104',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const k = rng.int(2, 12);
      const root = rng.int(2, 12);
      // k = √L would make output equal to the number of workers, hiding the "wrong point" mistake;
      // k = 2√L would make the marginal product 1, so forgetting it would cost nothing.
      if (k === root || k === 2 * root) continue;
      const beta = rng.int(1, 4);
      // Marginal revenue is a multiple of 2√L / gcd(k, 2√L), so MR · k/(2√L) is a whole number.
      const step = (2 * root) / gcd(k, 2 * root);
      const mr = step * rng.int(1, Math.floor(200 / step));
      if (mr < 5) continue;
      return { k, root, alpha: mr + 2 * beta * k * root, beta };
    }
  },

  stem: (p) =>
    `A firm with $L$ workers produces $Q(L) = ${num(p.k)}\\sqrt{L}$ units, and its revenue from selling $Q$ units is $R(Q) = ${revenueTex(p)}$. Find the marginal revenue product of labour $\\dfrac{dR}{dL}$ at $L = ${num(labourOf(p))}$: the extra revenue from one more worker.`,

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2, ...MONEY }),

  steps(p) {
    const q = outputOf(p);
    const mr = marginalRevenue(p, q);
    return [
      {
        text: 'Revenue depends on workers through output, so use the chain rule.',
        latex: `\\dfrac{dR}{dL} = \\dfrac{dR}{dQ} \\cdot \\dfrac{dQ}{dL} = R'(Q(L)) \\cdot Q'(L)`,
        why: 'One more worker adds Q′(L) units of output, and each unit adds R′(Q) to revenue.',
      },
      {
        text: 'Find output and the marginal product of labour.',
        latex: `Q(${num(labourOf(p))}) = ${num(p.k)}\\sqrt{${num(labourOf(p))}} = ${num(q)}, \\quad Q'(L) = \\dfrac{${num(p.k)}}{2\\sqrt{L}} = \\dfrac{${num(p.k)}}{${num(2 * p.root)}}${mplTex(p)}`,
        why: 'k√L = kL^(1/2), and the power rule gives ½kL^(−1/2) = k/(2√L).',
        result: q,
      },
      {
        text: 'Find marginal revenue at that output.',
        latex: `R'(Q) = ${num(p.alpha)} - ${num(2 * p.beta)}Q \\;\\Rightarrow\\; R'(${num(q)}) = ${num(mr)}`,
        why: 'Marginal revenue is evaluated at the output the workers produce, Q(L), not at L.',
        result: mr,
      },
      {
        text: 'Multiply the two rates.',
        latex: `\\dfrac{dR}{dL} = ${num(mr)} \\cdot \\dfrac{${num(p.k)}}{${num(2 * p.root)}} = ${num(answerOf(p))}`,
        why: 'Marginal revenue product = marginal revenue × marginal product of labour.',
        result: answerOf(p),
      },
    ];
  },

  distractors(p) {
    const q = outputOf(p);
    const mr = marginalRevenue(p, q);
    return cleanDistractors(
      answerOf(p),
      [
        { value: mr, mistakeCode: 'FORGOT_INNER' },
        {
          value: round(marginalRevenue(p, labourOf(p)) * mpl(p), 2),
          mistakeCode: 'WRONG_POINT',
        },
        { value: round(revenueOf(p, q) * mpl(p), 2), mistakeCode: 'OUTER_NOT_DIFFERENTIATED' },
        { value: round((mr * p.k) / p.root, 2), mistakeCode: 'FORGOT_HALF' },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
