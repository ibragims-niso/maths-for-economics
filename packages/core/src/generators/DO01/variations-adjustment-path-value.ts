import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Cost weights in F = a·ẋ² + b·x²; b/a = k² with k from a short list. */
  a: number;
  b: number;
  /** Length of the plan in years, the fixed ends x(0) = A and x(T) = B, and the time asked for. */
  T: number;
  A: number;
  B: number;
  t: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.001 } as const;

/** Pairs (a, b) with b/a a perfect square, so that k = √(b/a) is a simple number. */
const WEIGHTS: readonly [number, number][] = [
  [4, 1],
  [8, 2],
  [1, 1],
  [2, 2],
  [3, 3],
  [5, 5],
  [4, 9],
  [1, 4],
  [2, 8],
  [3, 12],
  [1, 9],
  [2, 18],
];

const kOf = (p: Params) => Math.sqrt(p.b / p.a);

/** The path c₁e^(kt) + c₂e^(−kt) through x(0) = A and x(T) = B, for any rate k > 0. */
function constants(k: number, p: Params) {
  const c1 = (p.B - p.A * Math.exp(-k * p.T)) / (Math.exp(k * p.T) - Math.exp(-k * p.T));
  return { c1, c2: p.A - c1 };
}
function pathAt(k: number, p: Params, t: number) {
  const { c1, c2 } = constants(k, p);
  return c1 * Math.exp(k * t) + c2 * Math.exp(-k * t);
}

const value = (p: Params) => round(pathAt(kOf(p), p, p.t), 2);

const candidates = (p: Params) => {
  const k = kOf(p);
  return [
    { value: round(p.A + ((p.B - p.A) * p.t) / p.T, 2), mistakeCode: 'STRAIGHT_LINE' },
    { value: round(p.B * Math.exp(k * (p.t - p.T)), 2), mistakeCode: 'EXP_ONLY' },
    // With k = 1 the slip k² = k changes nothing, so it is not a distinct mistake.
    ...(k === 1 ? [] : [{ value: round(pathAt(k * k, p, p.t), 2), mistakeCode: 'K_SQUARED' }]),
  ];
};

/** "+ x" or "- x", for a term added after another one. */
const plus = (x: number, d = 4) => (x < 0 ? `- ${num(-x, d)}` : `+ ${num(x, d)}`);
/** A coefficient in front of a term: "3", or nothing for 1. */
const coef = (x: number) => (x === 1 ? '' : num(x));
/** kt in an exponent: "2t", or "t" for k = 1. */
const kt = (k: number) => (k === 1 ? 't' : `${num(k)}t`);
const years = (T: number) => (T === 1 ? '1 year' : `${num(T)} years`);

/** DO01, difficulty 2: x(t) on the cheapest path for ∫(aẋ² + bx²) dt with fixed ends, from x″ = (b/a)x. */
export const variationsAdjustmentPathValue: Generator<Params> = {
  id: 'variations-adjustment-path-value',
  title: 'Cheapest production path with a running cost',
  topicId: 'DO01',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const [a, b] = rng.pick(WEIGHTS);
      const T = rng.pick([1, 2, 3, 4]);
      const A = rng.int(0, 8) * 5;
      const p: Params = {
        a,
        b,
        T,
        A,
        B: A + rng.int(2, 12) * 5,
        t: T * rng.pick([0.25, 0.5, 0.75]),
      };
      const kT = kOf(p) * T;
      // The running cost matters (kT not tiny) but the path is not flat until the very end.
      if (kT < 0.5 || kT > 4) continue;
      // Every mistake lands clearly away from the answer (at least 0.05 off).
      if (candidates(p).some((c) => Math.abs(c.value - value(p)) < 0.05)) continue;
      const kept = cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length < candidates(p).length) continue;
      return p;
    }
  },

  stem(p) {
    return `A firm will raise production from $x(0) = ${num(p.A)}$ to $x(${num(p.T)}) = ${num(p.B)}$ (thousand units a year) over ${years(p.T)}. Running at level $x$ costs $${coef(p.b)}x^2$ a year and changing the level costs $${coef(p.a)}\\dot x^2$ a year, so it chooses $x(t)$ to minimise $\\int_0^{${num(p.T)}} \\big(${coef(p.a)}\\dot x^2 + ${coef(p.b)}x^2\\big)\\,dt$. Use the Euler–Lagrange equation to find $x(${num(p.t)})$ on the cheapest path. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 2, ...VALUE }),

  steps(p) {
    const k = kOf(p);
    const { c1, c2 } = constants(k, p);
    const eT = Math.exp(k * p.T);
    return [
      {
        text: 'Write the Euler–Lagrange equation.',
        latex: `F_x - \\frac{d}{dt}F_{\\dot x} = ${num(2 * p.b)}x - ${num(2 * p.a)}\\ddot x = 0 \\;\\Rightarrow\\; \\ddot x = ${coef(p.b / p.a)}\\,x, \\quad k = \\sqrt{${num(p.b / p.a)}} = ${num(k)}`,
        why: '∂F/∂x = 2bx and ∂F/∂ẋ = 2aẋ, whose time derivative is 2aẍ. Dividing by 2a gives ẍ = (b/a)x, and k is the square root of b/a.',
        result: k,
      },
      {
        text: 'Write the general solution and use both fixed ends.',
        latex: `x(t) = c_1e^{${kt(k)}} + c_2e^{-${kt(k)}}:\\quad c_1 + c_2 = ${num(p.A)},\\quad c_1e^{${num(k * p.T)}} + c_2e^{-${num(k * p.T)}} = ${num(p.B)}`,
        why: 'The characteristic equation r² = k² has the roots k and −k (DY04). Each fixed end gives one equation for the two constants.',
      },
      {
        text: 'Solve for the constants.',
        latex: `c_1 = \\dfrac{${num(p.B)} - ${num(p.A)}e^{-${num(k * p.T)}}}{e^{${num(k * p.T)}} - e^{-${num(k * p.T)}}} = ${num(c1, 4)}, \\quad c_2 = ${num(c2, 4)}`,
        why: `Substitute c₂ = A − c₁ into the second equation: c₁(e^(kT) − e^(−kT)) = B − A·e^(−kT). Here e^(kT) = ${num(eT, 4)}.`,
        result: round(c1, 4),
      },
      {
        text: `Evaluate the path at t = ${num(p.t)}.`,
        latex: `x(${num(p.t)}) = ${num(c1, 4)}e^{${num(k * p.t)}} ${plus(c2)}e^{-${num(k * p.t)}} = ${num(value(p))}`,
        why: 'Both exponentials are needed: the e^(kt) term carries the path up to the target and the e^(−kt) term lets it start from x(0).',
        result: value(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
