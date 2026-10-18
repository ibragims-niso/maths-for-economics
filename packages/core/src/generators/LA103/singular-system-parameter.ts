import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { augmented, type Entry, kMinus, plain, rowOp, rowOpText, system } from './matrix-latex';

/**
 * Built like three-market-equilibrium-price: A = LU from the multipliers (l21, l31, l32) and the
 * first two rows of U, except that the bottom-right entry of A is the parameter k. Elimination
 * then leaves k − k₀ as the last pivot, with k₀ = l31·u13 + l32·u23.
 */
interface Params {
  l21: number;
  l31: number;
  l32: number;
  u11: number;
  u12: number;
  u13: number;
  u22: number;
  u23: number;
  /** Right-hand side. */
  b: [number, number, number];
}

const NAMES = ['x_1', 'x_2', 'x_3'] as const;

/** The value of k that makes the last pivot zero. */
const critical = (p: Params) => p.l31 * p.u13 + p.l32 * p.u23;

/** The coefficient matrix with k in the corner, as LaTeX entries, and the numeric rows. */
const matrix = (p: Params) => {
  const row1 = [p.u11, p.u12, p.u13];
  const row2 = [p.l21 * p.u11, p.l21 * p.u12 + p.u22, p.l21 * p.u13 + p.u23];
  const row3 = [p.l31 * p.u11, p.l31 * p.u12 + p.l32 * p.u22];
  return { row1, row2, row3 };
};

/** Right-hand sides after stage 1 (c2, and row 3 before the last step) and in echelon form. */
const rhs = (p: Params) => {
  const [b1, b2, b3] = p.b;
  const c2 = b2 - p.l21 * b1;
  const r3 = b3 - p.l31 * b1;
  return { c1: b1, c2, r3, c3: r3 - p.l32 * c2 };
};

/** LA103, difficulty 3: the value of a parameter k for which a 3×3 system has no unique solution. */
export const singularSystemParameter: Generator<Params> = {
  id: 'singular-system-parameter',
  title: 'When a system has no unique solution',
  topicId: 'LA103',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    const nonZero = [-2, -1, 1, 2] as const;
    for (;;) {
      const p: Params = {
        l21: rng.pick(nonZero),
        l31: rng.pick(nonZero),
        l32: rng.pick(nonZero),
        u11: rng.int(1, 2),
        u12: rng.int(-3, 3),
        u13: rng.pick([-3, -2, -1, 1, 2, 3] as const),
        u22: rng.int(1, 3),
        u23: rng.pick([-3, -2, -1, 1, 2, 3] as const),
        b: [rng.int(1, 60), rng.int(1, 60), rng.int(1, 60)],
      };
      const { row1, row2, row3 } = matrix(p);
      const small = [...row1, ...row2, ...row3].every((x) => Math.abs(x) <= 9);
      const k0 = critical(p);
      // A non-zero k₀ that differs from what the two common slips give (see distractors).
      const slipsDiffer = k0 !== 0 && p.l31 * p.u13 - p.l32 * p.u23 !== 0;
      if (small && slipsDiffer) return p;
    }
  },

  stem(p) {
    const { row1, row2, row3 } = matrix(p);
    return `A linear model of three related quantities contains a parameter $k$: $${system([row1, row2, [...row3, 'k']], NAMES, p.b)}$. For which value of $k$ does the system fail to have exactly one solution?`;
  },

  answer: (p) => ({ kind: 'numeric', value: critical(p), decimals: 0 }),

  steps(p) {
    const { row1, row2, row3 } = matrix(p);
    const { c1, c2, r3, c3 } = rhs(p);
    const k0 = critical(p);
    const u2 = [0, p.u22, p.u23];
    const after1: Entry[] = [0, p.l32 * p.u22, kMinus(p.l31 * p.u13)];
    const echelon: Entry[] = [0, 0, kMinus(k0)];
    const at = c3 === 0 ? 'infinitely many solutions' : 'no solution';
    return [
      {
        text: `Clear $x_1$ from rows 2 and 3 using the pivot ${num(p.u11)} in row 1.`,
        latex: `${augmented([row1, row2, [...row3, 'k']], p.b)} \\xrightarrow{${rowOp(2, p.l21, 1)},\\ ${rowOp(3, p.l31, 1)}} ${augmented([row1, u2, after1], [c1, c2, r3])}`,
        why: `The multipliers are ${plain(p.l21)} and ${plain(p.l31)} (first entry of the row divided by the pivot). The k entry changes like any other entry: ${rowOpText(3, p.l31, 1)} turns k into ${kMinus(p.l31 * p.u13).replace('-', '−')}.`,
      },
      {
        text: `Clear $x_2$ from row 3 using the pivot ${num(p.u22)} in row 2.`,
        latex: `\\xrightarrow{${rowOp(3, p.l32, 2)}} ${augmented([row1, u2, echelon], [c1, c2, c3])}`,
        why: `The multiplier is ${plain(p.l32 * p.u22)}/${plain(p.u22)} = ${plain(p.l32)}. Now the matrix is in row echelon form and the last pivot is ${kMinus(k0).replace('-', '−')}.`,
      },
      {
        text: 'The system has exactly one solution only if every pivot is non-zero.',
        latex: `${kMinus(k0)} = 0 \\;\\Rightarrow\\; k = ${num(k0)}`,
        why: `For any other k there are three pivots and back substitution gives one solution. At k = ${plain(k0)} the last row reads 0 = ${plain(c3)}, so the system has ${at}.`,
        result: k0,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(critical(p), [
      // Sign slip in the last row operation on the k entry.
      { value: p.l31 * p.u13 - p.l32 * p.u23, mistakeCode: 'ROW_OP_SIGN' },
      // Set the k entry to zero after the first stage, before row 3 is in echelon form.
      { value: p.l31 * p.u13, mistakeCode: 'STOPPED_EARLY' },
      { value: 0, mistakeCode: 'ENTRY_SET_TO_ZERO' },
    ]),
};
