import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { linear, paren } from './terms';

type Context = 'asset' | 'consumption';

/**
 * The model is k̇ = (a·k + b·y)/10, ẏ = (c·k + d·y)/10 in gaps from the steady state, with whole
 * numbers a, b, c, d; the matrix shown to the student is A/10, so its entries have one decimal.
 */
interface Params {
  context: Context;
  a: number;
  b: number;
  c: number;
  d: number;
  /** Ten times the stable (negative) and unstable (positive) eigenvalues. */
  stable: number;
  unstable: number;
  /** The capital gap k(0), a multiple of b so that the answer is a whole number. */
  k0: number;
}

/** The jump is a whole number, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** The slope y/k of the eigenvector for eigenvalue λ (times 10): (a − λ)·1 + b·y = 0. */
const slope = (p: Params, lambda: number) => (lambda - p.a) / p.b;
const jump = (p: Params) => round(slope(p, p.stable) * p.k0, 6);

const candidates = (p: Params): Distractor[] => [
  { value: round(slope(p, p.unstable) * p.k0, 6), mistakeCode: 'UNSTABLE_ARM' },
  { value: -jump(p), mistakeCode: 'EIGENVECTOR_SIGN' },
  // Choosing y(0) so that k̇ = 0: a·k + b·y = 0 (+ 0 turns −0 into 0).
  { value: round((-p.a * p.k0) / p.b, 6) + 0, mistakeCode: 'NULLCLINE_NOT_ARM' },
];

const SETTING: Record<Context, { y: string; signB: 1 | -1; signS: 1 | -1; story: string }> = {
  asset: {
    y: 'q',
    signB: 1,
    signS: -1,
    story:
      'In a model of investment, the gaps of the capital stock $k$ and of the share price $q$ of firms from their steady state follow',
  },
  consumption: {
    y: 'c',
    signB: -1,
    signS: 1,
    story:
      'In a linearised Ramsey growth model, the gaps of capital per worker $k$ and consumption per worker $c$ from their steady state follow',
  },
};

/** What the sign of the jump means, for capital below and above its steady state. */
const LESSON: Record<Context, [string, string]> = {
  asset: [
    'With too little capital its return is high, so the share price starts above its steady state.',
    'With too much capital its return is low, so the share price starts below its steady state.',
  ],
  consumption: [
    'With little capital, consumption starts below its steady state and rises together with capital.',
    'With much capital, consumption starts above its steady state and falls together with capital.',
  ],
};

const tenth = (x: number) => num(x / 10, 1);

/** DY05, difficulty 3: the jump of the forward-looking variable onto the saddle path. */
export const saddlePathInitialJump: Generator<Params> = {
  id: 'saddle-path-initial-jump',
  title: 'Jump onto the saddle path',
  topicId: 'DY05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['asset', 'consumption'] as const);
      const { signB, signS } = SETTING[context];
      const stable = -rng.int(1, 5);
      const unstable = rng.int(1, 6);
      const a = rng.int(-5, 5);
      const d = stable + unstable - a;
      if (Math.abs(d) > 6) continue;
      // b·c = ad − det, with det = stable·unstable < 0; same signs for b and c in both stories.
      const bc = a * d - stable * unstable;
      if (bc <= 0) continue;
      const sizes = [1, 2, 3, 4, 5, 6].filter((s) => bc % s === 0 && bc / s <= 9);
      if (sizes.length === 0) continue;
      const b = signB * rng.pick(sizes);
      const c = bc / b;
      const j = rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      const p: Params = { context, a, b, c, d, stable, unstable, k0: b * j };
      if (Math.abs(p.k0) > 12) continue;
      // The saddle path slopes the way the story says: q falls as k rises, c rises with k.
      if (Math.sign(slope(p, stable)) !== signS) continue;
      // In the asset story q̇ = r·q − (dividend), so the q coefficient is the interest rate > 0.
      if (context === 'asset' && d <= 0) continue;
      if (Math.abs(jump(p)) > 40) continue;
      if (cleanDistractors(jump(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const { y, story } = SETTING[p.context];
    const below = p.k0 < 0;
    return `${story} $\\dot k = ${linear(
      null,
      [
        [p.a / 10, 'k'],
        [p.b / 10, y],
      ],
      1,
    )}$ and $\\dot ${y} = ${linear(
      null,
      [
        [p.c / 10, 'k'],
        [p.d / 10, y],
      ],
      1,
    )}$, with time in years. Capital starts ${num(Math.abs(p.k0))} ${below ? 'below' : 'above'} its steady state, $k(0) = ${num(p.k0)}$, and cannot jump; $${y}$ is forward-looking and jumps at once onto the saddle path. Find $${y}(0)$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: jump(p), decimals: 0, ...EXACT }),

  steps(p) {
    const { y } = SETTING[p.context];
    const t = p.stable + p.unstable;
    const det = p.stable * p.unstable;
    const root = p.unstable - p.stable;
    const s = slope(p, p.stable);
    return [
      {
        text: 'Find the trace and the determinant.',
        latex: `\\operatorname{tr} A = ${tenth(p.a)} + ${paren(p.d / 10, 1)} = ${tenth(t)}, \\qquad \\det A = ${paren(p.a / 10, 1)} \\cdot ${paren(p.d / 10, 1)} - ${paren(p.b / 10, 1)} \\cdot ${paren(p.c / 10, 1)} = ${num(det / 100, 2)}`,
        why: 'A negative determinant means the eigenvalues are real with opposite signs: the steady state is a saddle.',
        result: det / 100,
      },
      {
        text: 'Solve the characteristic equation and keep the negative eigenvalue.',
        latex: `\\lambda = \\dfrac{${tenth(t)} \\pm \\sqrt{${num((t * t - 4 * det) / 100, 2)}}}{2} = \\dfrac{${tenth(t)} \\pm ${tenth(root)}}{2}, \\qquad \\lambda_s = ${tenth(p.stable)},\\ \\lambda_u = ${tenth(p.unstable)}`,
        why: 'λ² − (tr A)λ + det A = 0. Only the part of the start along the eigenvector of the negative eigenvalue dies out; the part along the other one grows like e^(λᵤt).',
        result: p.stable / 10,
      },
      {
        text: 'Find the direction of the stable eigenvector from the first row of A − λI.',
        latex: `${paren((p.a - p.stable) / 10, 1)} \\cdot 1 + ${paren(p.b / 10, 1)}\\,m = 0 \\;\\Rightarrow\\; m = \\dfrac{\\lambda_s - a_{11}}{a_{12}} = \\dfrac{${tenth(p.stable)} - ${paren(p.a / 10, 1)}}{${tenth(p.b)}} = ${num(s, 4)}`,
        why: `With v = (1, m), each unit of capital gap must come with m units of ${p.context === 'asset' ? 'share-price' : 'consumption'} gap. This line through the steady state is the saddle path.`,
        result: s,
      },
      {
        text: 'Put the starting point on that line.',
        latex: `${y}(0) = m \\cdot k(0) = ${num(s, 4)} \\cdot ${paren(p.k0)} = ${num(jump(p))}`,
        why: `Any other ${y}(0) would contain some of the unstable direction, and the path would run away from the steady state. ${LESSON[p.context][p.k0 < 0 ? 0 : 1]}`,
        result: jump(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(jump(p), candidates(p), EXACT.tolerance, 0),
};
