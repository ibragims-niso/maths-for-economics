import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, gcd } from '../MV08/budget';

interface Params {
  /** Q = A·K^(1/2)·L^(1/2). */
  A: number;
  /** Wage w per worker and rental r per machine: w = m²t and r = n²t, so √(wr) = mnt. */
  w: number;
  r: number;
  m: number;
  n: number;
  t: number;
  /** The output target Q̄ and the cost-minimising inputs, all whole. */
  target: number;
  L: number;
  K: number;
}

/** λ = w/MP_L = 2√(wr)/A = 2mnt/A, exact to 2 decimals by construction. */
const lambda = (p: Params) => round((2 * p.m * p.n * p.t) / p.A, 2);
const cost = (p: Params) => p.w * p.L + p.r * p.K;

function candidates(p: Params) {
  return [
    { value: cost(p), mistakeCode: 'GAVE_OPTIMAL_VALUE' },
    { value: round((p.m * p.n * p.t) / p.A, 2), mistakeCode: 'DROPPED_HALF' },
    { value: round(p.w / p.A, 2), mistakeCode: 'CONSTANT_MARGINAL_PRODUCT' },
    { value: round(p.A / (2 * p.m * p.n * p.t), 2), mistakeCode: 'INVERTED_MULTIPLIER' },
  ];
}

/** MV09, difficulty 2: the multiplier of cost minimisation with Q = A√(KL), which is marginal cost. */
export const shadowPriceMarginalCost: Generator<Params> = {
  id: 'shadow-price-marginal-cost',
  title: 'Marginal cost from the multiplier',
  topicId: 'MV09',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const m = rng.int(1, 5);
      const n = rng.int(1, 5);
      if (m === n || gcd(m, n) !== 1) continue;
      const t = rng.int(1, 12);
      const w = m * m * t;
      const r = n * n * t;
      if (w < 2 || r < 2 || w > 150 || r > 150) continue;
      const A = rng.int(2, 5);
      // λ = 2mnt/A must be exact to 2 decimals, and at most 50 so 1/λ still shows as a number.
      if ((200 * m * n * t) % A !== 0) continue;
      if (2 * m * n * t > 50 * A) continue;
      const c = rng.int(1, 25);
      const p: Params = { A, w, r, m, n, t, target: A * c * m * n, L: c * n * n, K: c * m * m };
      if (p.target < 10) continue;
      const kept = cleanDistractors(lambda(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4 || kept.some((d) => d.value <= 0)) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm makes $Q = ${num(p.A)}K^{1/2}L^{1/2}$ units with $K$ machines and $L$ workers, paying $w = ${num(p.w)}$ per worker and $r = ${num(p.r)}$ per machine. It minimises the cost $wL + rK$ of producing $\\bar Q = ${num(p.target)}$ units, using the Lagrangian $\\mathcal{L} = ${num(p.w)}L + ${num(p.r)}K - \\lambda\\big(${num(p.A)}K^{1/2}L^{1/2} - ${num(p.target)}\\big)$. Find $\\lambda$, the marginal cost of output. Give your answer to 2 decimal places if it is not whole.`,

  answer: (p) => ({ kind: 'numeric', value: lambda(p), decimals: 2, ...EXACT }),

  steps(p) {
    const half = p.A === 2 ? '' : `${num(p.A / 2)}\\,`;
    // MP_L = (A/2)·√(K/L) = A·m/(2n) at the optimum, shown as a reduced fraction.
    const g = gcd(p.A * p.m, 2 * p.n);
    const top = (p.A * p.m) / g;
    const bottom = (2 * p.n) / g;
    const mpl = bottom === 1 ? `${top}` : `\\tfrac{${top}}{${bottom}}`;
    return [
      {
        text: 'Write the first-order conditions for L and K and divide them.',
        latex: `${num(p.w)} = \\lambda\\,${half}K^{1/2}L^{-1/2}, \\quad ${num(p.r)} = \\lambda\\,${half}K^{-1/2}L^{1/2} \\quad\\Rightarrow\\quad \\dfrac{K}{L} = \\dfrac{w}{r} = \\dfrac{${num(p.w)}}{${num(p.r)}}`,
        why: 'Each input price equals λ times that input’s marginal product; dividing removes λ and gives MRTS = w/r.',
      },
      {
        text: 'Use the output target to find the cheapest inputs and the minimum cost.',
        latex: `L^* = ${num(p.L)}, \\quad K^* = ${num(p.K)}, \\quad C^* = ${num(p.w)}\\cdot${num(p.L)} + ${num(p.r)}\\cdot${num(p.K)} = ${num(cost(p))}`,
        why: `With K = (w/r)L, output is ${p.A}·L·√(w/r) = ${p.target}. The cost is not the answer; it is a check, since here it equals λ times the output.`,
        result: cost(p),
      },
      {
        text: 'Solve the labour condition for λ.',
        latex: `\\lambda = \\dfrac{w}{MP_L} = \\dfrac{${num(p.w)}}{${half}\\sqrt{${num(p.K)}/${num(p.L)}}} = \\dfrac{${num(p.w)}}{${mpl}} = ${num(lambda(p))} = \\dfrac{2\\sqrt{wr}}{A}`,
        why: `λ is the extra cost of one more unit of output at the best input mix: the marginal cost. With this technology C(Q̄) = (2√(wr)/A)·Q̄, so the cost per unit, ${cost(p)}/${p.target}, is the same number.`,
        result: lambda(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(lambda(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
