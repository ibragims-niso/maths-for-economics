import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Cost weights in F = a·ẋ² + b·x²; b/a = k² with k from a short list. */
  a: number;
  b: number;
  /** Length of the plan in years and the target x(T) = B, starting from x(0) = 0. */
  T: number;
  B: number;
}

const AMOUNT = { tolerance: 0.01, relTolerance: 0.001 } as const;

/** Pairs (a, b) with b/a a perfect square, so that k = √(b/a) is a simple number. */
const WEIGHTS: readonly [number, number][] = [
  [4, 1],
  [8, 2],
  [12, 3],
  [1, 1],
  [2, 2],
  [3, 3],
  [5, 5],
  [4, 9],
  [8, 18],
  [1, 4],
  [2, 8],
  [3, 12],
  [1, 9],
  [2, 18],
];

const kOf = (p: Params) => Math.sqrt(p.b / p.a);
const coth = (x: number) => Math.cosh(x) / Math.sinh(x);

/** Cost of the steady plan x = Bt/T: aB²/T for adjusting plus bB²T/3 for running. */
const adjustLine = (p: Params) => (p.a * p.B ** 2) / p.T;
const runLine = (p: Params) => (p.b * p.B ** 2 * p.T) / 3;
const lineCost = (p: Params) => adjustLine(p) + runLine(p);
/** Cost of the Euler–Lagrange path x = B·sinh(kt)/sinh(kT): a·x(T)·ẋ(T) = aB²k·coth(kT). */
const endSlope = (p: Params) => p.B * kOf(p) * coth(kOf(p) * p.T);
const bestCost = (p: Params) => p.a * p.B * endSlope(p);

/** Both costs are reported to 2 decimals and the extra cost is their difference. */
const saving = (p: Params) => round(round(lineCost(p), 2) - round(bestCost(p), 2), 2);

const candidates = (p: Params) => [
  { value: round(bestCost(p), 2), mistakeCode: 'OPTIMAL_NOT_SAVING' },
  { value: round(lineCost(p), 2), mistakeCode: 'LINE_COST_ONLY' },
  {
    value: round(adjustLine(p) + (p.b * p.B ** 2 * p.T) / 4 - bestCost(p), 2),
    mistakeCode: 'SQUARED_AVERAGE',
  },
];

/** The steady speed B/T: a whole number, or a fraction in brackets. */
const speed = (p: Params) =>
  Number.isInteger(p.B / p.T) ? num(p.B / p.T) : `\\big(\\tfrac{${p.B}}{${p.T}}\\big)`;

/** A coefficient in front of a term: "3", or nothing for 1. */
const coef = (x: number) => (x === 1 ? '' : num(x));
/** "a·" in front of a product, or nothing for 1. */
const times = (x: number) => (x === 1 ? '' : `${num(x)}\\cdot `);
/** kt in a sinh: "2t", or "t" for k = 1. */
const kt = (k: number) => (k === 1 ? 't' : `${num(k)}t`);
const years = (T: number) => (T === 1 ? '1 year' : `${num(T)} years`);

/** DO01, difficulty 3: extra cost of a steady build-up over the Euler–Lagrange path for ∫(aẋ² + bx²) dt. */
export const variationsAdjustmentSaving: Generator<Params> = {
  id: 'variations-adjustment-saving',
  title: 'Extra cost of a steady build-up',
  topicId: 'DO01',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const [a, b] = rng.pick(WEIGHTS);
      const p: Params = { a, b, T: rng.pick([1, 2, 3, 4, 5, 6]), B: rng.int(4, 80) };
      const kT = kOf(p) * p.T;
      if (kT < 0.5 || kT > 4) continue;
      // A saving worth reporting, and a mistake that still gives a positive extra cost.
      if (saving(p) < 1) continue;
      if ((candidates(p)[2]?.value ?? 0) <= 0) continue;
      const kept = cleanDistractors(
        saving(p),
        candidates(p),
        AMOUNT.tolerance,
        AMOUNT.relTolerance,
      );
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem(p) {
    return `A firm will raise production from $x(0) = 0$ to $x(${num(p.T)}) = ${num(p.B)}$ (thousand units a year) over ${years(p.T)}, and its cost is $\\int_0^{${num(p.T)}} \\big(${coef(p.a)}\\dot x^2 + ${coef(p.b)}x^2\\big)\\,dt$ (thousand). A manager proposes a steady build-up, $x(t) = ${speed(p)}t$. How much more does the steady plan cost than the cheapest plan? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: saving(p), decimals: 2, ...AMOUNT }),

  steps(p) {
    const k = kOf(p);
    const kT = k * p.T;
    return [
      {
        text: 'Cost of the steady plan.',
        latex: `\\int_0^{${num(p.T)}} \\Big(${times(p.a)}${speed(p)}^2 + ${coef(p.b)}\\big(${speed(p)}t\\big)^2\\Big)dt = ${num(adjustLine(p))} + ${num(runLine(p))} = ${num(lineCost(p))}`,
        why: 'The speed B/T is constant, so the adjustment part is a·B²/T; the running part integrates t² to T³/3, giving b·B²·T/3.',
        result: round(lineCost(p), 2),
      },
      {
        text: 'Find the cheapest path from the Euler–Lagrange equation.',
        latex: `\\ddot x = ${coef(p.b / p.a)}\\,x,\\; k = ${num(k)} \\;\\Rightarrow\\; x^*(t) = ${num(p.B)}\\,\\frac{\\sinh ${kt(k)}}{\\sinh ${num(kT)}}`,
        why: 'F = aẋ² + bx² gives 2bx − 2aẍ = 0. With x(0) = 0 the two exponentials combine into sinh(kt) = (e^(kt) − e^(−kt))/2, scaled to hit B at T.',
        result: k,
      },
      {
        text: 'Cost of the cheapest path.',
        latex: `\\dot x(${num(p.T)}) = ${num(p.B)}\\cdot ${times(k)}\\coth ${num(kT)} = ${num(endSlope(p), 4)}, \\qquad J^* = ${times(p.a)}x(${num(p.T)})\\,\\dot x(${num(p.T)}) = ${num(bestCost(p))}`,
        why: 'Integrating aẋ² by parts and using aẍ = bx, the integral of aẋ² + bx² collapses to a·x·ẋ at the ends; x(0) = 0 removes the lower end.',
        result: round(bestCost(p), 2),
      },
      {
        text: 'Subtract.',
        latex: `${num(lineCost(p))} - ${num(bestCost(p))} = ${num(saving(p))}`,
        why: 'Every path with the same ends costs at least J*, so the difference is what the steady plan wastes.',
        result: saving(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(saving(p), candidates(p), AMOUNT.tolerance, AMOUNT.relTolerance),
};
