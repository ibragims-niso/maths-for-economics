import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  col2,
  det2,
  diag2,
  drawUnimodular,
  fromEigen,
  inverseUnimodular,
  type M2,
  mul2,
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
  /** The power of A. */
  n: number;
  /** Row and column (0-based) of the entry asked for. */
  i: 0 | 1;
  j: 0 | 1;
}

/** The entry is a whole number, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const aOf = (p: Params) => fromEigen(p.p, p.lambda[0], p.lambda[1]);
const dn = (p: Params) => diag2(p.lambda[0] ** p.n, p.lambda[1] ** p.n);

/** (Aⁿ)ᵢⱼ = (P Dⁿ P⁻¹)ᵢⱼ. */
// + 0 turns a negative zero into 0.
const answerOf = (p: Params) => mul2(mul2(p.p, dn(p)), inverseUnimodular(p.p))[p.i][p.j] + 0;

const candidates = (p: Params): Distractor[] => {
  const a = aOf(p)[p.i][p.j];
  const wrongOrder = mul2(mul2(inverseUnimodular(p.p), dn(p)), p.p)[p.i][p.j];
  return [
    { value: a ** p.n, mistakeCode: 'ENTRY_POWER' },
    { value: p.n * a, mistakeCode: 'TIMES_N' },
    { value: dn(p)[p.i][p.j], mistakeCode: 'D_ONLY' },
    { value: wrongOrder, mistakeCode: 'WRONG_ORDER' },
  ];
};

/** LA203, difficulty 1: an entry of Aⁿ for a 2×2 matrix, computed as P Dⁿ P⁻¹. */
export const diagonalisationPowerEntry: Generator<Params> = {
  id: 'diagonalisation-power-entry',
  title: 'A matrix power by diagonalisation',
  topicId: 'LA203',
  difficulty: 1,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const p: Params = {
        p: drawUnimodular(rng),
        lambda: [rng.pick([-3, -2, -1, 1, 2, 3]), rng.pick([-3, -2, -1, 1, 2, 3])],
        n: rng.int(3, 6),
        i: rng.pick([0, 1] as const),
        j: rng.pick([0, 1] as const),
      };
      const [l1, l2] = p.lambda;
      if (l1 === l2) continue;
      // Keep the powers readable: at most 3⁵ = 243 or 2⁶ = 64.
      if (Math.max(Math.abs(l1), Math.abs(l2)) ** p.n > 243) continue;
      const a = aOf(p);
      // A small, genuinely non-diagonal matrix (otherwise the question is trivial).
      if (a.flat().some((x) => Math.abs(x) > 12)) continue;
      if (a[0][1] === 0 && a[1][0] === 0) continue;
      if (cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const [l1, l2] = p.lambda;
    return `The matrix $A = ${pm(aOf(p))}$ has eigenvalue $\\lambda_1 = ${num(l1)}$ with eigenvector $v_1 = ${vec2(col2(p.p, 0))}$ and eigenvalue $\\lambda_2 = ${num(l2)}$ with eigenvector $v_2 = ${vec2(col2(p.p, 1))}$. Write $A = PDP^{-1}$ and use it to find the entry in row ${p.i + 1}, column ${p.j + 1} of $A^{${p.n}}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [l1, l2] = p.lambda;
    const P = p.p;
    const Q = inverseUnimodular(P);
    const d = det2(P);
    const D = dn(p);
    const r = P[p.i];
    const value = answerOf(p);
    return [
      {
        text: 'Put the eigenvectors as the columns of P and the eigenvalues, in the same order, on the diagonal of D.',
        latex: `P = ${pm(P)}, \\quad D = ${pm(diag2(l1, l2))}`,
        why: 'Av₁ = λ₁v₁ and Av₂ = λ₂v₂ together say AP = PD. P is invertible because its columns are independent, so A = PDP⁻¹.',
      },
      {
        text: 'Invert P.',
        latex: `\\det P = ${num(d)}, \\quad P^{-1} = ${pm(Q)}`,
        why: 'For a 2×2 matrix swap the diagonal entries, change the sign of the other two and divide by the determinant; with det P = ±1 the inverse has whole-number entries.',
        result: d,
      },
      {
        text: `Raise D to the power ${p.n}.`,
        latex: `A^{${p.n}} = P D^{${p.n}} P^{-1}, \\quad D^{${p.n}} = ${pm(D)}`,
        why: `In A·A·…·A = PDP⁻¹·PDP⁻¹·…·PDP⁻¹ every P⁻¹P in the middle cancels, leaving P Dⁿ P⁻¹. A diagonal matrix is raised to a power entry by entry: ${plainParen(l1)}^${p.n} = ${plain(D[0][0])} and ${plainParen(l2)}^${p.n} = ${plain(D[1][1])}.`,
      },
      {
        text: `Multiply row ${p.i + 1} of P, scaled by Dⁿ, by column ${p.j + 1} of P⁻¹.`,
        latex: `(A^{${p.n}})_{${p.i + 1}${p.j + 1}} = ${paren(r[0])} \\cdot ${paren(D[0][0])} \\cdot ${paren(Q[0][p.j])} + ${paren(r[1])} \\cdot ${paren(D[1][1])} \\cdot ${paren(Q[1][p.j])} = ${num(value)}`,
        why: 'Entry (i, j) of P Dⁿ P⁻¹ is Σₖ pᵢₖ λₖⁿ qₖⱼ, where qₖⱼ are the entries of P⁻¹: each eigenvalue contributes its own power, weighted by the eigenvectors.',
        result: value,
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0),
};
