import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, gcd } from '../MV08/budget';

interface Params {
  /** C(w, r, Q) = k·w^(i/d)·r^((d−i)/d)·Q^γ. */
  k: number;
  i: number;
  d: number;
  /** The power of Q: 1/2, 1 or 2. */
  gamma: 0.5 | 1 | 2;
  /** w = m^d·s and r = n^d·s, so w^(i/d)·r^((d−i)/d) = w·(n/m)^(d−i) is exact. */
  m: number;
  n: number;
  s: number;
  w: number;
  r: number;
  Q: number;
}

/** Q^γ, a whole number by construction (Q is a perfect square when γ = 1/2). */
const qPower = (p: Params) => (p.gamma === 0.5 ? Math.round(Math.sqrt(p.Q)) : p.Q ** p.gamma);
/** w^(i/d)·r^((d−i)/d) = m^i·n^(d−i)·s, a whole number. */
const pricePart = (p: Params) => p.m ** p.i * p.n ** (p.d - p.i) * p.s;
/** Minimum cost C(w, r, Q). */
const cost = (p: Params) => p.k * pricePart(p) * qPower(p);
/** Shephard's lemma: L* = ∂C/∂w = (i/d)·C/w, exact to 2 decimals by construction. */
const labour = (p: Params) => round((p.i * cost(p)) / (p.d * p.w), 2);
/** K* = ∂C/∂r = ((d−i)/d)·C/r. */
const capital = (p: Params) => round(((p.d - p.i) * cost(p)) / (p.d * p.r), 2);

/** The power i/d of w in the cost function (the power of r is 1 − i/d). */
const EXPONENTS = [
  [1, 2],
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
] as const;

/** "a/b" in LaTeX, or a whole number when b = 1. */
const frac = (a: number, b: number) => (b === 1 ? num(a) : `\\tfrac{${num(a)}}{${num(b)}}`);

function costLatex(p: Params) {
  const k = p.k === 1 ? '' : `${num(p.k)}\\,`;
  const q = p.gamma === 1 ? 'Q' : p.gamma === 2 ? 'Q^2' : 'Q^{1/2}';
  return `${k}w^{${p.i}/${p.d}}\\,r^{${p.d - p.i}/${p.d}}\\,${q}`;
}

function candidates(p: Params) {
  return [
    { value: cost(p), mistakeCode: 'GAVE_COST' },
    { value: round(cost(p) / p.w, 2), mistakeCode: 'FORGOT_EXPONENT' },
    { value: round((p.i * cost(p)) / p.d, 2), mistakeCode: 'FORGOT_DIVIDE_BY_PRICE' },
    { value: capital(p), mistakeCode: 'GAVE_OTHER_INPUT' },
  ];
}

/** MV12, difficulty 2: labour demand L* = ∂C/∂w from a Cobb–Douglas cost function (Shephard's lemma). */
export const shephardLabourDemand: Generator<Params> = {
  id: 'shephard-labour-demand',
  title: 'Labour demand from the cost function',
  topicId: 'MV12',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    // The power of w, drawn once so that each exponent keeps its share of problems.
    const [i, d] = rng.pick(EXPONENTS);
    for (;;) {
      const m = rng.int(1, 5);
      const n = rng.int(1, 5);
      if (m === n || gcd(m, n) !== 1) continue;
      const s = rng.int(1, 20);
      const w = m ** d * s;
      const r = n ** d * s;
      if (w < 2 || r < 2 || w > 250 || r > 250) continue;
      const gamma = rng.pick([0.5, 1, 2] as const);
      const Q = gamma === 1 ? rng.int(10, 300) : gamma === 2 ? rng.int(2, 30) : rng.int(3, 30) ** 2;
      const k = rng.int(1, 6);
      const p: Params = { k, i, d, gamma, m, n, s, w, r, Q };
      const C = cost(p);
      if (C > 200_000) continue;
      // L* = i·C/(d·w) and K* must be exact to 2 decimals, and at least 1.
      if ((100 * i * C) % (d * w) !== 0) continue;
      if ((100 * (d - i) * C) % (d * r) !== 0) continue;
      if (labour(p) < 1) continue;
      const kept = cleanDistractors(labour(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A firm's minimum cost of producing $Q$ units, when labour costs $w$ a unit and capital $r$ a unit, is $C(w, r, Q) = ${costLatex(p)}$. At $w = ${num(p.w)}$, $r = ${num(p.r)}$ and $Q = ${num(p.Q)}$, how many units of labour does the cheapest plan use? Use Shephard's lemma. Give your answer to 2 decimal places if it is not whole.`,

  answer: (p) => ({ kind: 'numeric', value: labour(p), decimals: 2, ...EXACT }),

  steps(p) {
    const qText =
      p.gamma === 1
        ? num(p.Q)
        : p.gamma === 2
          ? `${num(p.Q)}^2 = ${num(qPower(p))}`
          : `\\sqrt{${num(p.Q)}} = ${num(qPower(p))}`;
    const ratio = frac(p.n ** p.d, p.m ** p.d);
    const power = frac(p.n ** (p.d - p.i), p.m ** (p.d - p.i));
    return [
      {
        text: "Apply Shephard's lemma and the power rule.",
        latex: `L^* = \\dfrac{\\partial C}{\\partial w} = \\dfrac{${p.i}}{${p.d}}\\cdot\\dfrac{C}{w}`,
        why: `By the envelope theorem the derivative of minimum cost with respect to the wage is the labour in the cheapest plan. Differentiating w^(${p.i}/${p.d}) multiplies by ${p.i}/${p.d} and lowers the power by 1, which divides by w.`,
      },
      {
        text: 'Work out the minimum cost at these prices.',
        latex: `w^{${p.i}/${p.d}}\\,r^{${p.d - p.i}/${p.d}} = w\\left(\\dfrac{r}{w}\\right)^{${p.d - p.i}/${p.d}} = ${num(p.w)}\\left(${ratio}\\right)^{${p.d - p.i}/${p.d}} = ${num(p.w)}\\cdot ${power} = ${num(pricePart(p))}, \\quad Q^{\\gamma} = ${qText}, \\quad C = ${num(cost(p))}`,
        why: `The powers of w and r add up to 1, so the price part is w times a power of r/w = ${num(p.r)}/${num(p.w)}, which is a perfect power here. The cost itself is not the answer.`,
        result: cost(p),
      },
      {
        text: 'Divide by the wage and multiply by the exponent.',
        latex: `L^* = \\dfrac{${p.i}}{${p.d}}\\cdot\\dfrac{${num(cost(p))}}{${num(p.w)}} = ${num(labour(p))}`,
        why: `A wage rise of 1 raises the minimum cost by about L*, 1 for each unit of labour in use; re-mixing the inputs has no first-order effect. Labour's share of cost, w·L*/C, is the exponent ${p.i}/${p.d}.`,
        result: labour(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(labour(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
