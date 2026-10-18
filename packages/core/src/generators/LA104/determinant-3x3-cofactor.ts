import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { bmatrix, EXACT, factor, type Matrix3 } from './matrix';

interface Params {
  /** The coefficient matrix, row by row. */
  m: Matrix3;
}

/** The three minors of the first row: M11, M12, M13. */
const minors = ({ m }: Params) => [
  m[1][1] * m[2][2] - m[1][2] * m[2][1],
  m[1][0] * m[2][2] - m[1][2] * m[2][0],
  m[1][0] * m[2][1] - m[1][1] * m[2][0],
];

/** Cofactor expansion along the first row, signs + − +. */
const determinant = (p: Params) => {
  const [m11 = 0, m12 = 0, m13 = 0] = minors(p);
  return p.m[0][0] * m11 - p.m[0][1] * m12 + p.m[0][2] * m13;
};

/** The three products down to the right (with wrap-around) and the three down to the left. */
const sarrus = ({ m }: Params) => ({
  forward: [m[0][0] * m[1][1] * m[2][2], m[0][1] * m[1][2] * m[2][0], m[0][2] * m[1][0] * m[2][1]],
  back: [m[0][2] * m[1][1] * m[2][0], m[0][0] * m[1][2] * m[2][1], m[0][1] * m[1][0] * m[2][2]],
});

const total = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

function candidates(p: Params): Distractor[] {
  const [m11 = 0, m12 = 0, m13 = 0] = minors(p);
  const { forward, back } = sarrus(p);
  const { m } = p;
  return [
    { value: m[0][0] * m11 + m[0][1] * m12 + m[0][2] * m13, mistakeCode: 'COFACTOR_SIGN' },
    { value: total(forward) + total(back), mistakeCode: 'SARRUS_ADDED' },
    {
      value: m[0][0] * m[1][1] * m[2][2] - m[0][2] * m[1][1] * m[2][0],
      mistakeCode: 'DIAGONALS_ONLY',
    },
  ];
}

const minorLatex = (a: number, b: number, c: number, d: number) =>
  `${factor(a)} \\cdot ${factor(d)} - ${factor(b)} \\cdot ${factor(c)}`;

/** A sum written out: [60, −1, −4] → "60 - 1 - 4". */
const sumLatex = (xs: number[]) =>
  xs.map((x, i) => (i === 0 ? num(x) : x < 0 ? `- ${num(-x)}` : `+ ${num(x)}`)).join(' ');

/** LA104, difficulty 2: the determinant of a 3×3 integer matrix by cofactor expansion. */
export const determinant3x3Cofactor: Generator<Params> = {
  id: 'determinant-3x3-cofactor',
  title: '3×3 determinant by cofactors',
  topicId: 'LA104',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const entry = (i: number, j: number) => (i === j ? rng.int(1, 7) : rng.int(-4, 4));
      const row = (i: number) => [entry(i, 0), entry(i, 1), entry(i, 2)] as const;
      const p: Params = { m: [row(0), row(1), row(2)] };
      const zeros = p.m.flat().filter((x) => x === 0).length;
      const det = determinant(p);
      // A non-zero determinant, at most two zero entries, and all three mistakes visible.
      if (det === 0 || zeros > 2 || Math.abs(det) > 400) continue;
      const kept = cleanDistractors(det, candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `The coefficients of a three-market equilibrium model form the matrix $A = ${bmatrix(p.m)}$. Find $\\det A$ by cofactor expansion along the first row.`,

  answer: (p) => ({ kind: 'numeric', value: determinant(p), decimals: 0, ...EXACT }),

  steps(p) {
    const { m } = p;
    const [m11 = 0, m12 = 0, m13 = 0] = minors(p);
    const det = determinant(p);
    const { forward, back } = sarrus(p);
    return [
      {
        text: 'Minor M₁₁: delete row 1 and column 1 and take the 2×2 determinant that is left.',
        latex: `M_{11} = ${minorLatex(m[1][1], m[1][2], m[2][1], m[2][2])} = ${num(m11)}`,
        why: 'A minor is the determinant of what remains after crossing out the row and the column of an entry.',
        result: m11,
      },
      {
        text: 'Minor M₁₂: delete row 1 and column 2.',
        latex: `M_{12} = ${minorLatex(m[1][0], m[1][2], m[2][0], m[2][2])} = ${num(m12)}`,
        why: 'The remaining entries keep their positions: columns 1 and 3 of rows 2 and 3.',
        result: m12,
      },
      {
        text: 'Minor M₁₃: delete row 1 and column 3.',
        latex: `M_{13} = ${minorLatex(m[1][0], m[1][1], m[2][0], m[2][1])} = ${num(m13)}`,
        why: 'What is left is columns 1 and 2 of rows 2 and 3.',
        result: m13,
      },
      {
        text: 'Combine the first-row entries with their minors, using the signs + − +.',
        latex: `\\det A = ${factor(m[0][0])} \\cdot ${factor(m11)} - ${factor(m[0][1])} \\cdot ${factor(m12)} + ${factor(m[0][2])} \\cdot ${factor(m13)} = ${num(det)}`,
        why: 'The cofactor of entry (i, j) is (−1)^(i+j) times its minor, so along the first row the signs alternate +, −, +.',
        result: det,
      },
      {
        text: 'Check with the rule of Sarrus: three products down to the right minus three products down to the left.',
        latex: `(${sumLatex(forward)}) - (${sumLatex(back)}) = ${num(total(forward))} - ${factor(total(back))} = ${num(det)}`,
        why: 'Sarrus’ rule only works for 3×3 matrices; it must give the same number as the cofactor expansion.',
        result: det,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(determinant(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
