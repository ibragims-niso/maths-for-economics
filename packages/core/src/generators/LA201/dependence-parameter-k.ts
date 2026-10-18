import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Three vectors of ℝ³; w = s·u + t·v, so the three are dependent at the true k. */
  u: number[];
  v: number[];
  w: number[];
  /** The entry of w (0, 1 or 2) that the stem replaces by k; its true value is the answer. */
  row: number;
}

/** k is a whole number, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const at = (xs: readonly number[], i: number) => xs[i] ?? 0;

/** Minor of the third column at row r: the 2×2 determinant of u and v without row r. */
const minor = (p: Params, r: number) => {
  const [i, j] = [0, 1, 2].filter((x) => x !== r) as [number, number];
  return at(p.u, i) * at(p.v, j) - at(p.v, i) * at(p.u, j);
};
/** Cofactor of the third column at row r: the minor with the checkerboard sign (−1)^(r+3). */
const cofactor = (p: Params, r: number) => (r === 1 ? -1 : 1) * minor(p, r);

/** det = α·k + β, expanding along the third column (the column of w, which holds k). */
const alpha = (p: Params) => cofactor(p, p.row);
const beta = (p: Params) =>
  [0, 1, 2].filter((r) => r !== p.row).reduce((s, r) => s + at(p.w, r) * cofactor(p, r), 0);

const answerOf = (p: Params) => at(p.w, p.row);

const candidates = (p: Params): Distractor[] => {
  const k = answerOf(p);
  // Made v and w parallel in two entries: v_j·k − v_i·w_j = 0, with j the first other row
  // where v is not zero.
  const j = [0, 1, 2].find((r) => r !== p.row && at(p.v, r) !== 0) ?? 0;
  const pair = (at(p.v, p.row) * at(p.w, j)) / at(p.v, j);
  // Expanded without the checkerboard signs: every cofactor taken as the plain minor.
  const plainBeta = [0, 1, 2]
    .filter((r) => r !== p.row)
    .reduce((s, r) => s + at(p.w, r) * minor(p, r), 0);
  const plain = -plainBeta / minor(p, p.row);
  return [
    { value: -k, mistakeCode: 'SIGN' },
    { value: round(pair, 2), mistakeCode: 'PAIR_PROPORTIONAL' },
    { value: round(plain, 2), mistakeCode: 'CHECKERBOARD_SIGNS' },
  ];
};

const col = (xs: readonly number[], hide = -1) =>
  `\\begin{pmatrix} ${xs.map((x, i) => (i === hide ? 'k' : num(x))).join(' \\\\ ')} \\end{pmatrix}`;

/** "3k - 9", "k + 4", "-k": α·k + β written naturally. */
const linear = (a: number, b: number) => {
  const head = a === 1 ? 'k' : a === -1 ? '-k' : `${num(a)}k`;
  if (b === 0) return head;
  return `${head} ${b < 0 ? '-' : '+'} ${num(Math.abs(b))}`;
};

/** LA201, difficulty 3: the value of k that makes three vectors of ℝ³ linearly dependent. */
export const dependenceParameterK: Generator<Params> = {
  id: 'dependence-parameter-k',
  title: 'Making three vectors dependent',
  topicId: 'LA201',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const u = Array.from({ length: 3 }, () => rng.int(-3, 5));
      const v = Array.from({ length: 3 }, () => rng.int(-3, 5));
      const s = rng.pick([-2, -1, 1, 2, 3]);
      const t = rng.pick([-2, -1, 1, 2, 3]);
      const w = u.map((x, i) => s * x + t * at(v, i));
      const p: Params = { u, v, w, row: rng.int(0, 2) };
      if ([u, v, w].some((x) => x.every((y) => y === 0))) continue;
      if (w.some((x) => Math.abs(x) > 20)) continue;
      // k must matter: its cofactor is not zero, so exactly one k makes the vectors dependent.
      if (alpha(p) === 0) continue;
      if (answerOf(p) === 0) continue;
      if (cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0).length < 2) continue;
      return p;
    }
  },

  stem: (p) =>
    `For which value of $k$ are the vectors $u = ${col(p.u)}$, $v = ${col(p.v)}$ and $w = ${col(p.w, p.row)}$ linearly dependent?`,

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 0, ...EXACT }),

  steps(p) {
    const rowsLatex = [0, 1, 2]
      .map((r) =>
        [at(p.u, r), at(p.v, r)]
          .map((x) => num(x))
          .concat(r === p.row ? 'k' : num(at(p.w, r)))
          .join(' & '),
      )
      .join(' \\\\ ');
    const cofactors = [0, 1, 2].map((r) => `C_{${r + 1}3} = ${num(cofactor(p, r))}`).join(',\\; ');
    const terms = [0, 1, 2]
      .map((r) => {
        const c = cofactor(p, r);
        const x = at(p.w, r);
        const entry = r === p.row ? 'k' : x < 0 ? `(${num(x)})` : num(x);
        return `${entry} \\cdot ${c < 0 ? `(${num(c)})` : num(c)}`;
      })
      .join(' + ');
    const a = alpha(p);
    const b = beta(p);
    return [
      {
        text: 'Put the three vectors as the columns of a matrix.',
        latex: `M = \\begin{pmatrix} ${rowsLatex} \\end{pmatrix},\\quad \\text{dependent} \\iff \\det M = 0`,
        why: 'Three vectors in ℝ³ are linearly dependent exactly when the matrix with them as columns has determinant zero (rank below 3).',
      },
      {
        text: 'Find the cofactors of the third column.',
        latex: cofactors,
        why: 'Each cofactor is the 2×2 determinant left after deleting that row and the third column, with the checkerboard sign: + for rows 1 and 3, − for row 2.',
      },
      {
        text: 'Expand the determinant along the third column, the column that contains k.',
        latex: `\\det M = ${terms} = ${linear(a, b)}`,
        why: 'Expanding along the column with k makes the determinant a simple linear expression in k.',
      },
      {
        text: 'Set the determinant to zero and solve for k.',
        latex: `${linear(a, b)} = 0 \\;\\Rightarrow\\; k = ${num(answerOf(p))}`,
        why: 'At this value w is a combination of u and v, so it adds no new direction; for any other k the three vectors form a basis of ℝ³.',
        result: answerOf(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0),
};
