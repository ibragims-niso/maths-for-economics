import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Who produces the sequence, and what pₙ measures. */
  setting: string;
  /** The sequence is pₙ = (a·n + b)/(n + c); its limit is a. */
  a: number;
  b: number;
  c: number;
  /** ε in thousandths, so ε = epsK/1000 and every comparison stays in whole numbers. */
  epsK: number;
}

/** N is a whole number: only that number is correct, never a neighbour. */
const WHOLE = { tolerance: 0.4, relTolerance: 0 } as const;

const SETTINGS = [
  'After $n$ rounds of price adjustment, an auctioneer’s estimate of the equilibrium price is',
  'After $n$ iterations, a numerical algorithm’s estimate of the value of an asset is',
  'After $n$ periods of learning, a firm’s estimate of its rival’s output (in thousands of units) is',
] as const;

const EPS_K = [500, 400, 300, 250, 200, 150, 100, 60, 50, 40, 30, 20, 10, 5, 2, 1] as const;

/** |b − ac|, the numerator of the gap |pₙ − a| = |b − ac|/(n + c). */
const gapTop = (p: Params) => Math.abs(p.b - p.a * p.c);

/** n must exceed X = |b − ac|/ε − c; X·epsK = 1000·|b − ac| − c·epsK is a whole number. */
const xTimesEps = (p: Params) => 1000 * gapTop(p) - p.c * p.epsK;

/** True when X itself is a whole number, so n = X gives a gap of exactly ε. */
const boundaryIsWhole = (p: Params) => xTimesEps(p) % p.epsK === 0;

/** The smallest whole number strictly greater than X (and at least 1). */
const threshold = (p: Params) => Math.max(1, Math.floor(xTimesEps(p) / p.epsK) + 1);

const eps = (p: Params) => p.epsK / 1000;

/** "an" with 1·n written as n. */
const aN = (a: number) => `${a === 1 ? '' : num(a)}n`;

/** The denominator n + c, or just n when c = 0. */
const bottomOf = (c: number) => (c === 0 ? 'n' : `n + ${num(c)}`);

/** "\dfrac{3n + 7}{n + 2}", writing 1·n as n and leaving out "+ 0". */
export function sequenceLatex(p: Pick<Params, 'a' | 'b' | 'c'>): string {
  return `\\dfrac{${aN(p.a)} + ${num(p.b)}}{${bottomOf(p.c)}}`;
}

function candidates(p: Params) {
  const N = threshold(p);
  const d = gapTop(p);
  return [
    { value: N - 1, mistakeCode: boundaryIsWhole(p) ? 'NON_STRICT' : 'ROUNDED_DOWN' },
    { value: Math.floor((1000 * d) / p.epsK) + 1, mistakeCode: 'FORGOT_SHIFT' },
    {
      value: Math.max(1, Math.floor((1000 - p.c * p.epsK) / p.epsK) + 1),
      mistakeCode: 'DROPPED_CONSTANT',
    },
  ];
}

/** AN02, difficulty 2: the smallest N with |pₙ − L| < ε for all n ≥ N, for pₙ = (an + b)/(n + c). */
export const epsilonNThreshold: Generator<Params> = {
  id: 'epsilon-n-threshold',
  title: 'Finding N for a given ε',
  topicId: 'AN02',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const a = rng.int(1, 9);
      const c = rng.int(0, 9);
      const d = rng.int(1, 9) * (rng.next() < 0.5 ? -1 : 1);
      const b = a * c + d;
      const epsK = rng.pick(EPS_K);
      const p: Params = { setting: rng.pick(SETTINGS), a, b, c, epsK };
      // Positive terms, and a threshold of at least 3 and at most a few thousand.
      if (b < 1) continue;
      const N = threshold(p);
      if (N < 3 || N > 5000) continue;
      if (cleanDistractors(N, candidates(p), WHOLE.tolerance, WHOLE.relTolerance).length < 2)
        continue;
      return p;
    }
  },

  stem: (p) =>
    `${p.setting} $p_n = ${sequenceLatex(p)}$, which tends to $${num(p.a)}$ as $n \\to \\infty$. Find the smallest whole number $N$ such that $|p_n - ${num(p.a)}| < ${num(eps(p), 3)}$ for every $n \\ge N$.`,

  answer: (p) => ({ kind: 'numeric', value: threshold(p), decimals: 0, ...WHOLE }),

  steps(p) {
    const d = gapTop(p);
    const N = threshold(p);
    const X = xTimesEps(p) / p.epsK;
    const e = num(eps(p), 3);
    const bottom = bottomOf(p.c);
    const aTimesBottom = p.c === 0 ? aN(p.a) : p.a === 1 ? `(${bottom})` : `${num(p.a)}(${bottom})`;
    const shift = p.c === 0 ? '' : ` - ${num(p.c)}`;
    const at = (n: number) => (p.c === 0 ? `${n}` : `${n} + ${num(p.c)}`);
    return [
      {
        text: 'Write the gap between pₙ and the limit as one fraction.',
        latex: `|p_n - ${num(p.a)}| = \\left|\\frac{${aN(p.a)} + ${num(p.b)} - ${aTimesBottom}}{${bottom}}\\right| = \\frac{${num(d)}}{${bottom}}`,
        why: `The n terms cancel in the numerator, leaving the constant |b − a·c| = ${d}. So the gap shrinks steadily as n grows: once it is below ε it stays below ε.`,
      },
      {
        text: 'Solve the strict inequality gap < ε for n.',
        latex: `\\frac{${num(d)}}{${bottom}} < ${e} \\iff n > \\frac{${num(d)}}{${e}}${shift} ${boundaryIsWhole(p) ? '=' : '\\approx'} ${num(X, 2)}`,
        why: 'Both sides are positive, so multiplying out keeps the direction of the inequality; then subtract the shift in the denominator.',
        result: X,
      },
      {
        text: 'Take the first whole number that is strictly larger.',
        latex: `N = ${N}`,
        why: boundaryIsWhole(p)
          ? `At n = ${N - 1} the gap is exactly ε, and the definition needs a gap strictly less than ε, so n = ${N - 1} does not qualify.`
          : `n must be larger than ${num(X, 2)}, and the first whole number above it is ${N}; rounding down would give a term whose gap is still too large.`,
        result: N,
      },
      {
        text: 'Check both sides of the threshold.',
        latex: `\\frac{${num(d)}}{${at(N - 1)}} ${boundaryIsWhole(p) ? '=' : '>'} ${e}, \\quad \\frac{${num(d)}}{${at(N)}} < ${e}`,
        why: 'The term just before N is not close enough, and from N on the shrinking gap stays below ε.',
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(threshold(p), candidates(p), WHOLE.tolerance, WHOLE.relTolerance),
};
