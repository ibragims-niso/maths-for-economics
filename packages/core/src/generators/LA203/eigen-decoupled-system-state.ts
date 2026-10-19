import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  col2,
  colvec,
  drawUnimodular,
  fromEigen,
  inverseUnimodular,
  type M2,
  paren,
  plain,
  plainParen,
  pm,
  vec2,
} from './eigen2';

interface Params {
  /** Eigenvector matrix: v₁ and v₂ are its columns; determinant ±1. */
  p: M2;
  /** Eigenvalues λ₁, λ₂ (distinct integers), in the order of the columns of P. */
  lambda: [number, number];
  /** Coordinates of x₀ in the eigenvector basis: x₀ = c₁v₁ + c₂v₂. */
  c: [number, number];
  /** Number of periods. */
  t: number;
  /** Which entry of x_t is asked for (0-based). */
  k: 0 | 1;
}

/** The entry is a whole number, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const x0Of = (p: Params): [number, number] => [
  p.p[0][0] * p.c[0] + p.p[0][1] * p.c[1],
  p.p[1][0] * p.c[0] + p.p[1][1] * p.c[1],
];

/** Entry k of c₁λ₁ᵗv₁ + c₂λ₂ᵗv₂ for given coordinates and eigenvalues. */
const combine = (p: Params, c: readonly number[], l1: number, l2: number) =>
  (c[0] ?? 0) * l1 ** p.t * p.p[p.k][0] + (c[1] ?? 0) * l2 ** p.t * p.p[p.k][1] + 0;

const answerOf = (p: Params) => combine(p, p.c, p.lambda[0], p.lambda[1]);

const candidates = (p: Params): Distractor[] => {
  const [l1, l2] = p.lambda;
  const x0 = x0Of(p);
  // Coordinates found with P x₀ instead of P⁻¹ x₀.
  const viaP = [p.p[0][0] * x0[0] + p.p[0][1] * x0[1], p.p[1][0] * x0[0] + p.p[1][1] * x0[1]];
  return [
    { value: l1 ** p.t * x0[p.k], mistakeCode: 'ONE_EIGENVALUE' },
    { value: p.c[0] * l1 ** p.t * p.p[p.k][0], mistakeCode: 'DROPPED_TERM' },
    { value: combine(p, viaP, l1, l2), mistakeCode: 'MULTIPLIED_BY_P' },
    { value: combine(p, p.c, l2, l1), mistakeCode: 'SWAPPED_EIGENVALUES' },
  ].map((d) => ({ ...d, value: d.value + 0 }));
};

/** LA203, difficulty 2: an entry of x_t for x_{t+1} = Ax_t, by writing x₀ in eigenvector coordinates. */
export const eigenDecoupledSystemState: Generator<Params> = {
  id: 'eigen-decoupled-system-state',
  title: 'A linear system over time, by eigenvectors',
  topicId: 'LA203',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        p: drawUnimodular(rng),
        lambda: [rng.pick([-2, -1, 1, 2, 3]), rng.pick([-2, -1, 1, 2, 3])],
        c: [rng.pick([-4, -3, -2, -1, 1, 2, 3, 4]), rng.pick([-4, -3, -2, -1, 1, 2, 3, 4])],
        t: rng.int(2, 4),
        k: rng.pick([0, 1] as const),
      };
      const [l1, l2] = p.lambda;
      if (l1 === l2) continue;
      // Keep the powers readable: at most 3³ = 27 or 2⁴ = 16.
      if (Math.max(Math.abs(l1), Math.abs(l2)) ** p.t > 27) continue;
      const a = fromEigen(p.p, l1, l2);
      if (a.flat().some((x) => Math.abs(x) > 12)) continue;
      if (a[0][1] === 0 && a[1][0] === 0) continue;
      const x0 = x0Of(p);
      if (x0.some((x) => x === 0 || Math.abs(x) > 20)) continue;
      if (cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const [l1, l2] = p.lambda;
    const which = p.k === 0 ? 'first' : 'second';
    return `Two linked variables move by $x_{t+1} = Ax_t$ with $A = ${pm(fromEigen(p.p, l1, l2))}$, which has eigenvalue $\\lambda_1 = ${num(l1)}$ with eigenvector $v_1 = ${vec2(col2(p.p, 0))}$ and eigenvalue $\\lambda_2 = ${num(l2)}$ with eigenvector $v_2 = ${vec2(col2(p.p, 1))}$. Starting from $x_0 = ${vec2(x0Of(p))}$, find the ${which} entry of $x_{${p.t}}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [l1, l2] = p.lambda;
    const [c1, c2] = p.c;
    const Q = inverseUnimodular(p.p);
    const x0 = x0Of(p);
    const value = answerOf(p);
    const v1k = p.p[p.k][0];
    const v2k = p.p[p.k][1];
    return [
      {
        text: 'Write x₀ in eigenvector coordinates, c = P⁻¹x₀, with v₁ and v₂ as the columns of P.',
        latex: `P^{-1} = ${pm(Q)}, \\quad c = P^{-1}${colvec(x0)} = ${vec2(p.c)}`,
        why: 'x₀ = c₁v₁ + c₂v₂ means x₀ = Pc, so c = P⁻¹x₀. Check: these coordinates rebuild x₀ from the two eigenvectors.',
        result: c1,
      },
      {
        text: 'Each coordinate is multiplied by its own eigenvalue every period.',
        latex: `x_t = c_1 \\lambda_1^t v_1 + c_2 \\lambda_2^t v_2 = ${num(c1)} \\cdot ${paren(l1)}^{t}\\, ${vec2(col2(p.p, 0))} + ${paren(c2)} \\cdot ${paren(l2)}^{t}\\, ${vec2(col2(p.p, 1))}`,
        why: 'Since Av₁ = λ₁v₁ and Av₂ = λ₂v₂, one period turns c₁v₁ + c₂v₂ into c₁λ₁v₁ + c₂λ₂v₂. The system is decoupled: each eigen-direction grows or shrinks on its own.',
      },
      {
        text: `Put in t = ${p.t} and read off the ${p.k === 0 ? 'first' : 'second'} entry.`,
        latex: `${num(c1)} \\cdot ${num(l1 ** p.t)} \\cdot ${paren(v1k)} + ${paren(c2)} \\cdot ${paren(l2 ** p.t)} \\cdot ${paren(v2k)} = ${num(value)}`,
        why: `${plainParen(l1)}^${p.t} = ${plain(l1 ** p.t)} and ${plainParen(l2)}^${p.t} = ${plain(l2 ** p.t)}; the ${p.k === 0 ? 'first' : 'second'} entries of v₁ and v₂ are ${plain(v1k)} and ${plain(v2k)}.`,
        result: value,
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0),
};
