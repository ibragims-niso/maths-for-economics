import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { linear, paren, plain } from './terms';

type Context = 'inflation' | 'firms' | 'markets';

interface Params {
  context: Context;
  /** The second variable corrects itself at speed D: the bottom-right entry is −D (D > 0). */
  D: number;
  /** The cross effects: top-right b and bottom-left c of A = (k, b; c, −D). */
  b: number;
  c: number;
}

/** The threshold is a whole number or has 2 decimals; only that value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Trace k − D < 0 needs k < D. */
const traceBound = (p: Params) => p.D;
/** det = −Dk − bc > 0 needs k < −bc/D. */
const detBound = (p: Params) => round((-p.b * p.c) / p.D, 6);
const threshold = (p: Params) => Math.min(traceBound(p), detBound(p));

const candidates = (p: Params): Distractor[] => [
  { value: traceBound(p), mistakeCode: 'ONLY_TRACE' },
  { value: detBound(p), mistakeCode: 'ONLY_DETERMINANT' },
  // det written as ad + bc: the determinant condition becomes k < bc/D.
  { value: Math.min(traceBound(p), round((p.b * p.c) / p.D, 6)), mistakeCode: 'DET_SIGN' },
  // "Each variable must pull itself back": k < 0.
  { value: 0, mistakeCode: 'OWN_EFFECT_ONLY' },
];

/** Letters of the two variables and the signs their cross effects must have. */
const SETTING: Record<
  Context,
  { x: string; y: string; signB: 1 | -1; signC: 1 | -1; story: (system: string) => string }
> = {
  inflation: {
    x: '\\pi',
    y: 'u',
    signB: -1,
    signC: 1,
    story: (system) =>
      `The gaps of inflation $\\pi$ and unemployment $u$ from their long-run values follow ${system}. High unemployment pulls inflation down, and high inflation makes the central bank tighten, which raises unemployment; $k$ says how inflation feeds on itself through expectations.`,
  },
  firms: {
    x: 'n',
    y: 's',
    signB: 1,
    signC: -1,
    story: (system) =>
      `In a local market, the gaps of the number of firms $n$ and of unserved customers $s$ from their steady state follow ${system}. Unserved customers attract new firms, and more firms leave fewer customers unserved; $k$ says how the number of firms reacts to itself (crowding if negative, clustering if positive).`,
  },
  markets: {
    x: 'p_1',
    y: 'p_2',
    signB: 1,
    signC: 1,
    story: (system) =>
      `The gaps of the prices of two substitutes from their equilibrium follow ${system}. A higher price of either good raises demand for the other and so pushes its price up; $k$ says how the price of good 1 reacts to its own gap (speculation can make it positive).`,
  },
};

/** DY05, difficulty 2: the largest k for which ẋ = Ax is stable, from trace < 0 and det > 0. */
export const stabilityThresholdTraceDeterminant: Generator<Params> = {
  id: 'stability-threshold-trace-determinant',
  title: 'Stability threshold of a system',
  topicId: 'DY05',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['inflation', 'firms', 'markets'] as const);
      const { signB, signC } = SETTING[context];
      const p: Params = {
        context,
        D: rng.int(1, 6),
        b: signB * rng.int(1, 6),
        c: signC * rng.int(1, 6),
      };
      const q = (-p.b * p.c) / p.D;
      // The determinant bound must be readable (at most 2 decimals) ...
      if (Math.abs(q * 100 - Math.round(q * 100)) > 1e-9) continue;
      // ... and must not tie with the trace bound: D² ≠ −bc, compared in whole numbers.
      if (p.D * p.D === -p.b * p.c) continue;
      if (Math.abs(threshold(p)) > 12) continue;
      const kept = cleanDistractors(threshold(p), candidates(p), EXACT.tolerance, 0);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const { x, y, story } = SETTING[p.context];
    const whole = Number.isInteger(threshold(p));
    const system = `$\\dot ${x} = k${x} ${p.b < 0 ? '-' : '+'} ${linear(null, [[Math.abs(p.b), y]])}$ and $\\dot ${y} = ${linear(
      null,
      [
        [p.c, x],
        [-p.D, y],
      ],
    )}$`;
    return `${story(system)} The steady state $(0, 0)$ is stable exactly when $k < k^*$. Find $k^*$.${whole ? '' : ' Give your answer to 2 decimal places.'}`;
  },

  answer: (p) => ({
    kind: 'numeric',
    value: round(threshold(p), 2),
    decimals: Number.isInteger(threshold(p)) ? 0 : 2,
    ...EXACT,
  }),

  steps(p) {
    const T = traceBound(p);
    const Q = detBound(p);
    const k = round(threshold(p), 2);
    const traceBinds = T < Q;
    return [
      {
        text: 'Read off the matrix and write the trace condition.',
        latex: `A = \\begin{pmatrix} k & ${num(p.b)} \\\\ ${num(p.c)} & ${num(-p.D)} \\end{pmatrix}, \\qquad \\operatorname{tr} A = k - ${num(p.D)} < 0 \\iff k < ${num(T)}`,
        why: 'A 2×2 system is stable exactly when tr A < 0 and det A > 0: then both eigenvalues have negative real parts.',
        result: T,
      },
      {
        text: 'Write the determinant condition.',
        latex: `\\det A = k \\cdot ${paren(-p.D)} - ${paren(p.b)} \\cdot ${paren(p.c)} = ${linear(-p.b * p.c, [[-p.D, 'k']])} > 0 \\iff k < ${num(Q)}`,
        why:
          p.D === 1
            ? `det A = ad − bc, the product of the diagonal minus the product of the other two entries; it is positive while k < ${plain(Q)}.`
            : `det A = ad − bc. Moving the k term across gives ${num(p.D)}k < ${plain(-p.b * p.c)}; dividing by ${num(p.D)}, a positive number, keeps the direction of the inequality.`,
        result: Q,
      },
      {
        text: 'Both conditions must hold, so the tighter one decides.',
        latex: `k^* = \\min(${num(T)},\\ ${num(Q)}) = ${num(k)}`,
        why: traceBinds
          ? `As k rises past ${plain(k)}, the trace turns positive while the determinant is still positive: near k* the eigenvalues are complex with a positive real part, so paths spiral outwards.`
          : `As k rises past ${plain(k)}, the determinant turns negative: one eigenvalue becomes positive, and the steady state turns into a saddle.`,
        result: k,
      },
    ];
  },

  distractors: (p) => cleanDistractors(round(threshold(p), 2), candidates(p), EXACT.tolerance, 0),
};
