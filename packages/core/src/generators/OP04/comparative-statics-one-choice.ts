import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /**
   * 'output': a competitive firm with cost C(q) = F + q³/k chooses output q; the parameter is the
   * price p. 'labour': a firm with profit B·√L − wL chooses workers L; the parameter is the wage w.
   */
  kind: 'output' | 'labour';
  /** Fixed cost (output case only; 0 for labour). */
  F: number;
  /** Cost q³/k (output case) or revenue B·√L (labour case). */
  k: number;
  B: number;
  /** The parameter's value: the price p or the wage w. */
  theta: number;
  /** The best choice at that value: q* or L*, a whole number. */
  x: number;
}

/** Output case: k values and outputs that give whole prices p = 3q²/k. */
const K_VALUES = [3, 6, 12, 15, 24, 30, 48, 60, 75, 120, 150, 300] as const;

/** The second derivative of profit in the choice, at the optimum. */
const fxx = (p: Params) =>
  p.kind === 'output' ? (-6 * p.x) / p.k : -p.B / (4 * Math.sqrt(p.x) ** 3);
/** The cross-partial with the parameter: ∂²π/∂q∂p = 1, ∂²π/∂L∂w = −1. */
const fxt = (p: Params) => (p.kind === 'output' ? 1 : -1);
/** d(x*)/dθ = −f_xθ / f_xx. */
const response = (p: Params) => round(-fxt(p) / fxx(p), 2);

function candidates(p: Params) {
  return [
    { value: -response(p), mistakeCode: 'SIGN' },
    { value: round(-fxx(p) / fxt(p), 2), mistakeCode: 'INVERTED_RATIO' },
    // The envelope theorem's answer, dπ*/dθ = ∂π/∂θ at the optimum: q* for a price, −L* for a wage.
    { value: p.kind === 'output' ? p.x : -p.x, mistakeCode: 'VALUE_NOT_CHOICE' },
  ];
}

/** OP04, difficulty 1: d(x*)/dθ = −f_xθ/f_xx for a firm's output (price) or labour (wage). */
export const comparativeStaticsOneChoice: Generator<Params> = {
  id: 'comparative-statics-one-choice',
  title: 'How the best choice responds',
  topicId: 'OP04',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const kind = rng.pick(['output', 'labour'] as const);
      let p: Params;
      if (kind === 'output') {
        const k = rng.pick(K_VALUES);
        const q = rng.int(2, 80);
        const price = (3 * q * q) / k;
        if (!Number.isInteger(price) || price < 4 || price > 800) continue;
        // Maximum profit is p·q − q³/k − F = 2q³/k − F; keep it positive.
        const top = Math.floor((0.9 * 2 * q ** 3) / k / 10);
        if (top < 1) continue;
        p = { kind, F: 10 * rng.int(1, Math.min(top, 100)), k, B: 0, theta: price, x: q };
      } else {
        const w = rng.int(2, 60);
        const s = rng.int(2, 30);
        p = { kind, F: 0, k: 0, B: 2 * w * s, theta: w, x: s * s };
      }
      const r = -fxt(p) / fxx(p);
      if (Math.abs(r) < 0.1 || Math.abs(r) > 150) continue;
      if (cleanDistractors(response(p), candidates(p)).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    p.kind === 'output'
      ? `A competitive firm sells its output at the price $p$ and has cost $C(q) = ${num(p.F)} + \\dfrac{q^3}{${num(p.k)}}$, so its profit is $\\pi(q, p) = pq - C(q)$. At $p = ${num(p.theta)}$ its best output is $q^* = ${num(p.x)}$. Differentiate the first-order condition to find $dq^*/dp$, the slope of its supply curve, at this price. Give your answer to 2 decimal places.`
      : `A firm's profit from employing $L$ workers at the wage $w$ is $\\pi(L, w) = ${num(p.B)}\\sqrt{L} - wL$. At $w = ${num(p.theta)}$ it employs $L^* = ${num(p.x)}$ workers. Differentiate the first-order condition to find $dL^*/dw$, the slope of its labour demand, at this wage. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: response(p), decimals: 2 }),

  steps(p) {
    const ans = response(p);
    const second = fxx(p);
    if (p.kind === 'output') {
      return [
        {
          text: 'Write the first-order condition, which holds at the best output for every price.',
          latex: `\\pi_q = p - \\dfrac{3q^2}{${num(p.k)}} = 0, \\quad\\text{at } q^* = ${num(p.x)}:\\ ${num(p.theta)} - \\dfrac{3 \\cdot ${num(p.x * p.x)}}{${num(p.k)}} = 0`,
          why: `Price equals marginal cost 3q²/${num(p.k)} at the best output. This equation ties q* to p, so it defines the supply curve q*(p) implicitly.`,
        },
        {
          text: 'Find the second derivative in q and the cross-partial with p, at the optimum.',
          latex: `\\pi_{qq} = -\\dfrac{6q}{${num(p.k)}} = -\\dfrac{${num(6 * p.x)}}{${num(p.k)}} = ${num(second, 4)}, \\quad \\pi_{qp} = 1`,
          why: 'π_qq < 0 confirms a maximum. π_qp = 1 because a higher price raises the marginal profit of every unit by 1.',
          result: round(second, 4),
        },
        {
          text: 'Apply dq*/dp = −π_qp / π_qq.',
          latex: `\\dfrac{dq^*}{dp} = -\\dfrac{\\pi_{qp}}{\\pi_{qq}} = -\\dfrac{1}{${num(second, 4)}} = ${num(ans)}`,
          why: `Differentiating π_q(q*(p), p) = 0 gives π_qq·dq*/dp + π_qp = 0. The sign is the sign of π_qp, because π_qq < 0: a price rise of 1 raises output by about ${num(ans)}.`,
          result: ans,
        },
      ];
    }
    const s = Math.sqrt(p.x);
    return [
      {
        text: 'Write the first-order condition, which holds at the best employment for every wage.',
        latex: `\\pi_L = \\dfrac{${num(p.B)}}{2\\sqrt{L}} - w = 0, \\quad\\text{at } L^* = ${num(p.x)}:\\ \\dfrac{${num(p.B)}}{${num(2 * s)}} - ${num(p.theta)} = 0`,
        why: 'The firm hires until the marginal revenue product of labour equals the wage. This equation ties L* to w, so it defines the labour demand L*(w) implicitly.',
      },
      {
        text: 'Find the second derivative in L and the cross-partial with w, at the optimum.',
        latex: `\\pi_{LL} = -\\dfrac{${num(p.B)}}{4L^{3/2}} = -\\dfrac{${num(p.B)}}{4 \\cdot ${num(s ** 3)}} = ${num(second, 4)}, \\quad \\pi_{Lw} = -1`,
        why: 'π_LL < 0 confirms a maximum. π_Lw = −1 because a higher wage lowers the marginal profit of every worker by 1.',
        result: round(second, 4),
      },
      {
        text: 'Apply dL*/dw = −π_Lw / π_LL.',
        latex: `\\dfrac{dL^*}{dw} = -\\dfrac{\\pi_{Lw}}{\\pi_{LL}} = -\\dfrac{-1}{${num(second, 4)}} = ${num(ans)}`,
        why: `Differentiating π_L(L*(w), w) = 0 gives π_LL·dL*/dw + π_Lw = 0. Both terms are negative, so the ratio is negative: a wage rise of 1 cuts employment by about ${num(Math.abs(ans))} workers.`,
        result: ans,
      },
    ];
  },

  distractors: (p) => cleanDistractors(response(p), candidates(p)),
};
