import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'value': value function iteration with discount factor β; 'price': a price-finding algorithm. */
  context: 'value' | 'price';
  /** Contraction modulus k (β for value function iteration). */
  k: number;
  /** Size of the first step, |x₁ − x₀|. */
  d: number;
  /** Required accuracy ε. */
  eps: number;
}

const WHOLE = { tolerance: 0.4, relTolerance: 0 } as const;

/** Smallest n ≥ 0 with factor·kⁿ ≤ eps, found by counting rounds. */
export function roundsUntil(k: number, factor: number, eps: number): number {
  let n = 0;
  let bound = factor;
  while (bound > eps) {
    n++;
    bound = factor * k ** n;
  }
  return n;
}

/** The Banach a-priori bound after n rounds: kⁿ/(1 − k)·d. */
export const banachBound = (p: Params, n: number) => (p.k ** n / (1 - p.k)) * p.d;

/** Smallest n with kⁿ/(1 − k)·d ≤ ε. */
export const iterationsNeeded = (p: Params) => roundsUntil(p.k, p.d / (1 - p.k), p.eps);

function candidates(p: Params): Distractor[] {
  const n = iterationsNeeded(p);
  return [
    { value: n - 1, mistakeCode: 'ROUNDED_DOWN' },
    { value: roundsUntil(p.k, p.d, p.eps), mistakeCode: 'FORGOT_FACTOR' },
    { value: roundsUntil(p.k, 1 / (1 - p.k), p.eps), mistakeCode: 'IGNORED_FIRST_STEP' },
  ];
}

/** Three significant figures for LaTeX, written as a × 10^m when the number is tiny. */
export function sig(x: number): string {
  if (x >= 0.001) return String(Number(x.toPrecision(3)));
  const m = Math.floor(Math.log10(x));
  return `${Number((x / 10 ** m).toPrecision(3))} \\times 10^{${m}}`;
}

/** Distance of ln(target)/ln(k) from the nearest whole number: small means a near-tie. */
const tieGap = (k: number, factor: number, eps: number) => {
  const l = Math.log(eps / factor) / Math.log(k);
  return Math.abs(l - Math.round(l));
};

/** AN05, difficulty 2: the number of iterations the Banach error bound needs for a given accuracy. */
export const banachIterationsNeeded: Generator<Params> = {
  id: 'banach-iterations-needed',
  title: 'Iterations for a guaranteed accuracy',
  topicId: 'AN05',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['value', 'price'] as const);
      const k =
        context === 'value'
          ? rng.pick([0.8, 0.85, 0.9, 0.95] as const)
          : rng.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8] as const);
      const d = context === 'value' ? rng.int(2, 100) : rng.int(2, 60) / 2;
      const eps = rng.pick([0.1, 0.05, 0.01, 0.005, 0.001] as const);
      const p: Params = { context, k, d, eps };
      const n = iterationsNeeded(p);
      if (n < 3 || n > 300) continue;
      // Keep every threshold well away from a whole number, so rounding noise cannot move it.
      if ([d / (1 - k), d, 1 / (1 - k)].some((factor) => tieGap(k, factor, eps) < 1e-6) || d === 1)
        continue;
      if (cleanDistractors(n, candidates(p), WHOLE.tolerance, WHOLE.relTolerance).length < 2)
        continue;
      return p;
    }
  },

  stem(p) {
    const setting =
      p.context === 'value'
        ? `Value function iteration for a saving problem applies the Bellman map, a contraction with modulus $\\beta = ${num(p.k)}$ (the discount factor). The first round changes the value function by at most $d = ${num(p.d)}$, the largest gap between $V_0$ and $V_1$.`
        : `A computer finds an equilibrium price by iterating a contraction with modulus $k = ${num(p.k)}$. The first iteration moves the price by $|p_1 - p_0| = ${num(p.d)}$.`;
    return `${setting} Using the Banach error bound, what is the smallest number of rounds $n$ that guarantees an error of at most $${num(p.eps, 3)}$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: iterationsNeeded(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const k = p.context === 'value' ? '\\beta' : 'k';
    const n = iterationsNeeded(p);
    const target = (p.eps * (1 - p.k)) / p.d;
    const l = Math.log(target) / Math.log(p.k);
    return [
      {
        text: 'Write the Banach bound and require it to be at most ε.',
        latex: `\\dfrac{${k}^n}{1 - ${k}}\\,d \\le \\varepsilon \\iff ${num(p.k)}^n \\le \\dfrac{${num(p.eps, 3)} \\times ${num(round(1 - p.k, 2))}}{${num(p.d)}} = ${sig(target)}`,
        why: 'After n rounds the distance to the fixed point is at most kⁿ/(1 − k) times the first step. Multiply both sides by (1 − k)/d to isolate kⁿ.',
        result: target,
      },
      {
        text: 'Take natural logs; ln k is negative, so the inequality flips.',
        latex: `n \\ge \\dfrac{\\ln(${sig(target)})}{\\ln ${num(p.k)}} = ${num(l)}`,
        why: 'Dividing an inequality by a negative number reverses it.',
        result: round(l, 2),
      },
      {
        text: 'Round up to the next whole number of rounds.',
        latex: `n = ${n}: \\quad \\text{bound} = ${sig(banachBound(p, n))} \\le ${num(p.eps, 3)} < ${sig(banachBound(p, n - 1))}`,
        why: `n must be a whole number at least ${round(l)}. With ${n - 1} rounds the bound is still above ε, so ${n} is the smallest that guarantees the accuracy.`,
        result: n,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(iterationsNeeded(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};
