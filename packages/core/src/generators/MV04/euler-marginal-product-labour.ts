import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Degree of homogeneity times 10 (10 = constant returns to scale). */
  k10: number;
  /** Capital and labour in use. */
  K: number;
  L: number;
  /** Output at (K, L). */
  Q: number;
  /** Marginal product of capital times 100 (so it has at most 2 decimals). */
  mpk100: number;
}

const degree = (p: Params) => p.k10 / 10;
const mpk = (p: Params) => p.mpk100 / 100;
/** k·Q and K·MP_K in hundredths, as whole numbers, so no rounding creeps in. */
const kQ100 = (p: Params) => p.k10 * p.Q * 10;
const capitalPay100 = (p: Params) => p.K * p.mpk100;
/** Euler: K·MP_K + L·MP_L = k·Q, so L·MP_L = k·Q − K·MP_K. */
const labourPay = (p: Params) => (kQ100(p) - capitalPay100(p)) / 100;
const exact = (p: Params) => labourPay(p) / p.L;
const mpl = (p: Params) => round(exact(p), 2);

const candidates = (p: Params): Distractor[] => [
  {
    value: round((p.Q - (p.K * p.mpk100) / 100) / p.L, 2),
    mistakeCode: 'FORGOT_DEGREE',
  },
  { value: round(p.Q / p.L, 2), mistakeCode: 'OUTPUT_PER_WORKER' },
  { value: round((degree(p) * p.Q - mpk(p)) / p.L, 2), mistakeCode: 'MP_NOT_WEIGHTED' },
  { value: round(labourPay(p), 2), mistakeCode: 'LABOUR_PAYMENT_GIVEN' },
];

const wrongAnswers = (p: Params) =>
  cleanDistractors(
    mpl(p),
    candidates(p).filter((d) => d.value > 0),
  );

/** MV04, difficulty 3: Euler's theorem gives MP_L from Q, K, L and MP_K for a degree-k technology. */
export const eulerMarginalProductLabour: Generator<Params> = {
  id: 'euler-marginal-product-labour',
  title: "Marginal product from Euler's theorem",
  topicId: 'MV04',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const k10 = rng.pick([8, 9, 10, 10, 10, 11, 12, 13]);
      const K = rng.int(2, 60) * 5;
      const L = rng.int(4, 100) * 5;
      const Q = rng.int(20, 400) * 10;
      // Capital's part of k·Q: between 20 % of Q and (k − 0.2)·Q, as in a Cobb–Douglas.
      const alpha100 = rng.int(20, k10 * 10 - 20);
      const mpk100 = Math.round((alpha100 * Q) / K);
      const p: Params = { k10, K, L, Q, mpk100 };
      const alpha = (K * mpk100) / (100 * Q);
      if (mpk100 < 10 || alpha <= 0.15 || alpha >= degree(p) - 0.15) continue;
      const answer = mpl(p);
      if (answer < 0.1 || answer > 500) continue;
      if (wrongAnswers(p).length >= 2) return p;
    }
  },

  stem(p) {
    const tech =
      p.k10 === 10
        ? 'has constant returns to scale (it is homogeneous of degree 1)'
        : `is homogeneous of degree $${num(degree(p))}$`;
    return `A firm's production function $Q = f(K, L)$ ${tech}. With $K = ${num(p.K)}$ machines and $L = ${num(p.L)}$ workers it produces $Q = ${num(p.Q)}$ units, and the marginal product of capital is $${num(mpk(p))}$. Use Euler's theorem to find the marginal product of labour. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: mpl(p), decimals: 2 }),

  steps(p) {
    const k = num(degree(p));
    const kq = kQ100(p) / 100;
    return [
      {
        text: "Write down Euler's theorem for a function homogeneous of degree k.",
        latex: `K \\cdot MP_K + L \\cdot MP_L = k\\,Q, \\quad k = ${k}`,
        why: 'Raising every input by the same small proportion raises output by k times that proportion; counting the rise input by input, through the marginal products, must give the same total.',
      },
      {
        text: 'Work out the right-hand side.',
        latex: `k\\,Q = ${k} \\times ${num(p.Q)} = ${num(kq)}`,
        why:
          p.k10 === 10
            ? 'With constant returns k = 1, so the inputs paid their marginal products use up exactly the whole output.'
            : `With k = ${k} the marginal products add up to ${k} times output, not output itself.`,
        result: kq,
      },
      {
        text: "Subtract capital's part.",
        latex: `L \\cdot MP_L = ${num(kq)} - ${num(p.K)} \\times ${num(mpk(p))} = ${num(labourPay(p))}`,
        why: 'K·MP_K is what capital would receive if each machine were paid its marginal product; the rest of k·Q belongs to labour.',
        result: labourPay(p),
      },
      {
        text: 'Divide by the number of workers.',
        latex: `MP_L = \\dfrac{${num(labourPay(p))}}{${num(p.L)}} = ${num(mpl(p))}`,
        why: 'The total for labour is L times the marginal product of one worker.',
        result: mpl(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
