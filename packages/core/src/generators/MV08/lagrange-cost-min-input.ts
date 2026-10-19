import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, gcd } from './budget';

interface Params {
  /** Q = A·K^(1/2)·L^(1/2). */
  A: number;
  /** Wage w per worker and rental r per machine. */
  w: number;
  r: number;
  /** The output target Q̄. */
  target: number;
  /** The cost-minimising inputs, drawn first so both are whole. */
  L: number;
  K: number;
  /** The input asked for. */
  ask: 'L' | 'K';
}

const value = (p: Params) => (p.ask === 'L' ? p.L : p.K);

/** sqrt(w/r) = sqrt(K/L) as a reduced fraction m/n: K = c·m² and L = c·n² with m, n coprime. */
function rootRatio(p: Params) {
  const c = gcd(p.K, p.L);
  return { m: Math.round(Math.sqrt(p.K / c)), n: Math.round(Math.sqrt(p.L / c)) };
}

/** A fraction as LaTeX, or a whole number when the bottom is 1. */
const frac = (top: number, bottom: number) =>
  bottom === 1 ? `${top}` : `\\tfrac{${top}}{${bottom}}`;

function candidates(p: Params) {
  const base = p.target / p.A;
  const ratio = p.ask === 'L' ? p.r / p.w : p.w / p.r;
  return [
    { value: p.ask === 'L' ? p.K : p.L, mistakeCode: 'INVERTED_PRICE_RATIO' },
    { value: round(base, 2), mistakeCode: 'EQUAL_INPUTS' },
    { value: round(base * ratio, 2), mistakeCode: 'MISSED_SQUARE_ROOT' },
    { value: round(p.target * Math.sqrt(ratio), 2), mistakeCode: 'FORGOT_COEFFICIENT' },
  ];
}

/** MV08, difficulty 2: the cost-minimising labour or capital for an output target with Q = A√(KL). */
export const lagrangeCostMinInput: Generator<Params> = {
  id: 'lagrange-cost-min-input',
  title: 'Cheapest way to make a target output',
  topicId: 'MV08',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      // w/r = m²/n², so the square roots in the solution are whole fractions.
      const m = rng.int(1, 5);
      const n = rng.int(1, 5);
      if (m === n || gcd(m, n) !== 1) continue;
      const t = rng.int(1, 12);
      const w = m * m * t;
      const r = n * n * t;
      if (w < 2 || r < 2 || w > 150 || r > 150) continue;
      const c = rng.int(1, 25);
      const A = rng.int(2, 5);
      const p: Params = {
        A,
        w,
        r,
        target: A * c * m * n,
        L: c * n * n,
        K: c * m * m,
        ask: rng.pick(['L', 'L', 'K'] as const),
      };
      if (p.target < 10) continue;
      const kept = cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4 || kept.some((d) => d.value <= 0)) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm makes $Q = ${num(p.A)}K^{1/2}L^{1/2}$ units of output with $K$ machines and $L$ workers. A worker costs $w = ${num(p.w)}$ and a machine $r = ${num(p.r)}$ per day. The firm must produce $\\bar Q = ${num(p.target)}$ units a day at the lowest cost. How many ${p.ask === 'L' ? 'workers $L$' : 'machines $K$'} does it use?`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const { m, n } = rootRatio(p);
    const askL = p.ask === 'L';
    const base = p.target / p.A;
    const half = p.A === 2 ? '' : `${num(p.A / 2)}\\,`;
    return [
      {
        text: 'Minimise cost subject to the output target: write the Lagrangian and the conditions for L and K.',
        latex: `\\begin{aligned} \\mathcal{L} &= ${num(p.w)}L + ${num(p.r)}K - \\lambda\\big(${num(p.A)}K^{1/2}L^{1/2} - ${num(p.target)}\\big) \\\\ \\mathcal{L}_L &= ${num(p.w)} - \\lambda\\,${half}K^{1/2}L^{-1/2} = 0 \\\\ \\mathcal{L}_K &= ${num(p.r)} - \\lambda\\,${half}K^{-1/2}L^{1/2} = 0 \\end{aligned}`,
        why: 'Each input is used until its price equals λ times its marginal product; the third condition is the output target itself.',
      },
      {
        text: 'Divide the two conditions: the MRTS equals the ratio of input prices.',
        latex: `MRTS = \\dfrac{MP_L}{MP_K} = \\dfrac{K}{L} = \\dfrac{w}{r} = \\dfrac{${num(p.w)}}{${num(p.r)}} \\quad\\Rightarrow\\quad K = \\dfrac{${num(p.w)}}{${num(p.r)}}\\,L`,
        why: 'Dividing removes λ. The isoquant is tangent to the cheapest isocost line, so its slope equals the slope of the isocost line, w/r.',
      },
      {
        text: `Put this into the output target and solve for ${askL ? 'L' : 'K'}.`,
        latex: askL
          ? `${num(p.A)}\\sqrt{\\tfrac{${num(p.w)}}{${num(p.r)}}}\\,L = ${num(p.A)}\\cdot${frac(m, n)}\\,L = ${num(p.target)} \\quad\\Rightarrow\\quad L^* = ${num(base)}\\cdot${frac(n, m)} = ${num(p.L)}`
          : `${num(p.A)}\\sqrt{\\tfrac{${num(p.r)}}{${num(p.w)}}}\\,K = ${num(p.A)}\\cdot${frac(n, m)}\\,K = ${num(p.target)} \\quad\\Rightarrow\\quad K^* = ${num(base)}\\cdot${frac(m, n)} = ${num(p.K)}`,
        why: `With K = (w/r)L, √(KL) = L·√(w/r), so output is a multiple of one input. The other input is ${askL ? `K* = ${num(p.K)}` : `L* = ${num(p.L)}`} and the minimum cost is ${num(p.w * p.L + p.r * p.K)}.`,
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
