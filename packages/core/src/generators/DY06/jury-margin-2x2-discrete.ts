import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';

type Context = 'policy' | 'countries' | 'market';

interface Params {
  context: Context;
  /** Entries of A in tenths (whole numbers), so A = (1/10)·[[a, b], [c, d]]. */
  a: number;
  b: number;
  c: number;
  d: number;
}

/** The margin is exact in hundredths and asked to 2 decimal places. */
const DP2 = { tolerance: 0.005, relTolerance: 0 } as const;

/** tr A × 10 and det A × 100, whole numbers. */
const trace10 = (p: Params) => p.a + p.d;
const det100 = (p: Params) => p.a * p.d - p.b * p.c;
/** (1 + det A − |tr A|) × 100. */
const margin100 = (p: Params) => 100 + det100(p) - 10 * Math.abs(trace10(p));
const margin = (p: Params) => margin100(p) / 100;
/** Stable exactly when |tr A| < 1 + det A < 2. */
const isStable = (p: Params) => margin100(p) > 0 && det100(p) < 100;

const candidates = (p: Params): Distractor[] => [
  // tr A used with its sign: 1 + det − tr.
  { value: round((100 + det100(p) - 10 * trace10(p)) / 100, 2), mistakeCode: 'DROPPED_ABS' },
  // The determinant left out: 1 − |tr A|.
  { value: round((100 - 10 * Math.abs(trace10(p))) / 100, 2), mistakeCode: 'ONLY_TRACE' },
  // det A computed as ad + bc.
  {
    value: round((100 + p.a * p.d + p.b * p.c - 10 * Math.abs(trace10(p))) / 100, 2),
    mistakeCode: 'DET_PLUS',
  },
];

const SETTING: Record<Context, string> = {
  policy:
    'Deviations of inflation and of the output gap from their targets, $x_t = (\\pi_t, y_t)$, follow',
  countries:
    'Deviations of output in two trading countries from their trends, $x_t = (u_t, v_t)$, follow',
  market:
    'Deviations of a price and of the stock of unsold goods from their steady states, $x_t = (p_t, s_t)$, follow',
};

const matrixOf = (p: Params) => [
  [p.a / 10, p.b / 10],
  [p.c / 10, p.d / 10],
];

/** A factor in a product, in brackets when negative. */
const paren = (x: number) => (x < 0 ? `(${num(x)})` : num(x));

/** DY06, difficulty 2: the Jury margin 1 + det A − |tr A| of a discrete 2×2 system, which with det A < 1 decides stability. */
export const juryMargin2x2Discrete: Generator<Params> = {
  id: 'jury-margin-2x2-discrete',
  title: 'Stability test for a discrete 2×2 system',
  topicId: 'DY06',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    // Half the problems are stable and half unstable, so the verdict cannot be guessed.
    const wantStable = rng.pick([true, false]);
    for (;;) {
      const p: Params = {
        context: rng.pick(['policy', 'countries', 'market'] as const),
        a: rng.int(-6, 12),
        b: rng.int(1, 6) * rng.pick([1, -1]),
        c: rng.int(1, 6) * rng.pick([1, -1]),
        d: rng.int(-6, 10),
      };
      // A clear verdict: the margin and 1 − det A both well away from 0.
      if (Math.abs(margin100(p)) < 3 || Math.abs(det100(p) - 100) < 5) continue;
      if (det100(p) === 0 || trace10(p) === 0 || isStable(p) !== wantStable) continue;
      if (margin(p) < -1.5 || margin(p) > 1.5) continue;
      if (cleanDistractors(margin(p), candidates(p), DP2.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `${SETTING[p.context]} $x_{t+1} = Ax_t$ with $A = ${pmatrix(matrixOf(p))}$. For a $2 \\times 2$ discrete system both eigenvalues lie inside the unit circle exactly when $|\\operatorname{tr} A| < 1 + \\det A < 2$. Find the margin $1 + \\det A - |\\operatorname{tr} A|$. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: margin(p), decimals: 2, ...DP2 }),

  steps(p) {
    const t = trace10(p) / 10;
    const det = det100(p) / 100;
    const m = margin(p);
    let verdict: string;
    if (isStable(p))
      verdict =
        'Both conditions hold, so both eigenvalues are smaller than 1 in size: deviations die out and the steady state is stable.';
    else if (m <= 0)
      verdict =
        'The margin is negative, so p(1) or p(−1) is negative. Since p(λ) is positive for very large and very negative λ, a real eigenvalue lies beyond 1 or beyond −1: deviations grow and the system is unstable.';
    else
      verdict =
        'The margin is positive but det A ≥ 1: the eigenvalues are a complex pair of size √det A ≥ 1, so the cycles do not shrink and the system is unstable.';
    return [
      {
        text: 'Find the trace and the determinant.',
        latex: `\\operatorname{tr} A = ${num(p.a / 10)} + ${paren(p.d / 10)} = ${num(t)},\\qquad \\det A = ${paren(p.a / 10)} \\cdot ${paren(p.d / 10)} - ${paren(p.b / 10)} \\cdot ${paren(p.c / 10)} = ${num(det)}`,
        why: 'The eigenvalues solve λ² − (tr A)λ + det A = 0, so the trace and the determinant are all the test needs.',
        result: det,
      },
      {
        text: 'Compute the margin.',
        latex: `1 + \\det A - |\\operatorname{tr} A| = 1 + ${paren(det)} - ${num(Math.abs(t))} = ${num(m)}`,
        why: 'With p(λ) = λ² − (tr A)λ + det A, the margin is the smaller of p(1) = 1 − tr A + det A and p(−1) = 1 + tr A + det A. Both must be positive, so that no real eigenvalue lies beyond 1 or −1.',
        result: m,
      },
      {
        text: 'Check the second condition and decide.',
        latex: `${num(m)} ${m > 0 ? '>' : '<'} 0, \\qquad \\det A = ${num(det)} ${det < 1 ? '<' : '>'} 1`,
        why: verdict,
      },
    ];
  },

  distractors: (p) => cleanDistractors(margin(p), candidates(p), DP2.tolerance, 0),
};
