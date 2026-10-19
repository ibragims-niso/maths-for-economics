import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT } from '../MV08/budget';

interface Params {
  /** Revenue α·√w₁ + β·√w₂ from the two fields, with α = k·a0 and β = k·b0. */
  alpha: number;
  beta: number;
  /** a0² + b0² = s0², a Pythagorean triple, so √(α² + β²) = k·s0 is whole. */
  s: number;
  /** Water available W = q², with q = s0·j so the split is whole. */
  W: number;
  q: number;
  /** The best split of the water. */
  w1: number;
  w2: number;
}

const TRIPLES: readonly [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [5, 12, 13],
  [12, 5, 13],
  [8, 15, 17],
  [15, 8, 17],
  [7, 24, 25],
  [24, 7, 25],
  [20, 21, 29],
  [21, 20, 29],
  [12, 35, 37],
  [35, 12, 37],
  [9, 40, 41],
  [40, 9, 41],
];

/** λ = α/(2√w₁) = √(α² + β²)/(2√W), exact to 2 decimals by construction. */
const lambda = (p: Params) => round(p.s / (2 * p.q), 2);
/** The maximum revenue V(W) = α√w₁ + β√w₂ = √(α² + β²)·√W. */
const revenue = (p: Params) => p.s * p.q;

function candidates(p: Params) {
  return [
    { value: round(p.s / p.q, 2), mistakeCode: 'AVERAGE_NOT_MARGINAL' },
    { value: p.w1, mistakeCode: 'GAVE_QUANTITY' },
    { value: revenue(p), mistakeCode: 'GAVE_OPTIMAL_VALUE' },
    { value: round(p.alpha / (2 * p.q), 2), mistakeCode: 'ONE_FIELD_ONLY' },
  ];
}

/** MV09, difficulty 3: the shadow price of water shared between two fields with revenue α√w₁ + β√w₂. */
export const shadowPriceWater: Generator<Params> = {
  id: 'shadow-price-water',
  title: 'Shadow price of a scarce input',
  topicId: 'MV09',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const [a0, b0, s0] = rng.pick(TRIPLES);
      const k = rng.int(1, 60);
      const j = rng.int(1, 12);
      const q = s0 * j;
      const W = q * q;
      if (W < 25 || W > 3600) continue;
      // λ = k/(2j) must be exact to 2 decimals.
      if ((50 * k) % j !== 0) continue;
      const p: Params = {
        alpha: k * a0,
        beta: k * b0,
        s: k * s0,
        W,
        q,
        w1: (a0 * j) ** 2,
        w2: (b0 * j) ** 2,
      };
      if (p.alpha < 10 || p.beta < 10 || p.alpha > 400 || p.beta > 400) continue;
      if (lambda(p) < 0.25) continue;
      const kept = cleanDistractors(lambda(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 4) continue;
      return p;
    }
  },

  stem: (p) =>
    `A farm shares $W = ${num(p.W)}$ units of water between two fields. Revenue is $R = ${num(p.alpha)}\\sqrt{w_1} + ${num(p.beta)}\\sqrt{w_2}$ when field 1 gets $w_1$ units and field 2 gets $w_2$, with $w_1 + w_2 = ${num(p.W)}$. Find the shadow price of water $\\lambda$, the rise in maximum revenue per extra unit of water. Give your answer to 2 decimal places if it is not whole.`,

  answer: (p) => ({ kind: 'numeric', value: lambda(p), decimals: 2, ...EXACT }),

  steps(p) {
    const sumSq = p.alpha ** 2 + p.beta ** 2;
    return [
      {
        text: 'Write the Lagrangian and the first-order conditions.',
        latex: `\\mathcal{L} = ${num(p.alpha)}\\sqrt{w_1} + ${num(p.beta)}\\sqrt{w_2} - \\lambda(w_1 + w_2 - ${num(p.W)}), \\quad \\dfrac{${num(p.alpha)}}{2\\sqrt{w_1}} = \\lambda = \\dfrac{${num(p.beta)}}{2\\sqrt{w_2}}`,
        why: 'At the best split the last unit of water earns the same on both fields; that common value is λ.',
      },
      {
        text: 'Divide the conditions to find the split, then use the water limit.',
        latex: `\\dfrac{w_1}{w_2} = \\dfrac{${num(p.alpha)}^2}{${num(p.beta)}^2} \\;\\Rightarrow\\; w_1^* = \\dfrac{${num(p.alpha)}^2}{${num(sumSq)}}\\cdot${num(p.W)} = ${num(p.w1)}, \\quad w_2^* = ${num(p.w2)}`,
        why: 'Squaring √w₁/√w₂ = α/β shows that each field gets water in proportion to the square of its coefficient.',
        result: p.w1,
      },
      {
        text: 'Put the split into either condition to get λ.',
        latex: `\\lambda = \\dfrac{${num(p.alpha)}}{2\\sqrt{${num(p.w1)}}} = ${num(lambda(p))} = \\dfrac{\\sqrt{${num(p.alpha)}^2 + ${num(p.beta)}^2}}{2\\sqrt{${num(p.W)}}}`,
        why: `The maximum revenue is V(W) = √(α² + β²)·√W = ${revenue(p)}, and its slope dV/dW = √(α² + β²)/(2√W) is the same λ: the most the farm should pay for one more unit of water.`,
        result: lambda(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(lambda(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
