import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Payoffs of asset A and asset B in a recession and in a boom. */
  a: [number, number];
  b: [number, number];
  /** Units of A and B that give the target payoff: its coordinates in the basis {A, B}. */
  c: [number, number];
  /** Which coordinate the question asks for: 0 = units of A, 1 = units of B. */
  which: 0 | 1;
}

/** The coordinate is a whole number of units, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const vec = (xs: readonly number[]) => `(${xs.map((x) => num(x)).join(', ')})`;
const det = (p: Params) => p.a[0] * p.b[1] - p.b[0] * p.a[1];
const target = (p: Params): [number, number] => [
  p.c[0] * p.a[0] + p.c[1] * p.b[0],
  p.c[0] * p.a[1] + p.c[1] * p.b[1],
];

const answerOf = (p: Params) => p.c[p.which];

const candidates = (p: Params): Distractor[] => {
  const x = target(p);
  const d = det(p);
  const i = p.which;
  // P x instead of P⁻¹ x.
  const px = [p.a[0] * x[0] + p.b[0] * x[1], p.a[1] * x[0] + p.b[1] * x[1]];
  // A and B written as the rows of P: the inverse of the transpose.
  const rows = [(p.b[1] * x[0] - p.a[1] * x[1]) / d, (-p.b[0] * x[0] + p.a[0] * x[1]) / d];
  // The 2×2 inverse without the minus signs on the off-diagonal entries.
  const signs = [(p.b[1] * x[0] + p.b[0] * x[1]) / d, (p.a[1] * x[0] + p.a[0] * x[1]) / d];
  return [
    { value: x[i], mistakeCode: 'STANDARD_COORDINATES' },
    { value: px[i] ?? 0, mistakeCode: 'MULTIPLIED_BY_P' },
    { value: round(rows[i] ?? 0, 2), mistakeCode: 'BASIS_AS_ROWS' },
    { value: round(signs[i] ?? 0, 2), mistakeCode: 'INVERSE_SIGNS' },
  ];
};

/** LA201, difficulty 1: one coordinate of a payoff in the basis of two assets, c = P⁻¹x. */
export const replicatePayoffCoordinates: Generator<Params> = {
  id: 'replicate-payoff-coordinates',
  title: 'Replicating a payoff with two assets',
  topicId: 'LA201',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const p: Params = {
        a: [rng.int(1, 6), rng.int(1, 6)],
        b: [rng.int(1, 6), rng.int(1, 6)],
        c: [rng.int(1, 6), rng.int(1, 6)],
        which: rng.pick([0, 1] as const),
      };
      // The assets must form a basis: their payoff vectors are not parallel.
      if (det(p) === 0) continue;
      if (cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const asset = p.which === 0 ? 'A' : 'B';
    return `Asset A pays $${vec(p.a)}$ and asset B pays $${vec(p.b)}$: the first entry is the payoff in a recession, the second in a boom. You want exactly the payoff $x = ${vec(target(p))}$ by holding $c_1$ units of A and $c_2$ units of B, so $x = c_1 A + c_2 B$. How many units of asset ${asset} do you need, $c_${p.which + 1}$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 0, ...EXACT }),

  steps(p) {
    const d = det(p);
    const x = target(p);
    const [a1, a2] = p.a;
    const [b1, b2] = p.b;
    const row =
      p.which === 0
        ? `${num(b2)} \\cdot ${num(x[0])} - ${num(b1)} \\cdot ${num(x[1])}`
        : `-${num(a2)} \\cdot ${num(x[0])} + ${num(a1)} \\cdot ${num(x[1])}`;
    const top = p.which === 0 ? b2 * x[0] - b1 * x[1] : -a2 * x[0] + a1 * x[1];
    return [
      {
        text: 'Put the payoff vectors of A and B as the columns of P and find its determinant.',
        latex: `P = \\begin{pmatrix} ${num(a1)} & ${num(b1)} \\\\ ${num(a2)} & ${num(b2)} \\end{pmatrix},\\quad \\det P = ${num(a1)} \\cdot ${num(b2)} - ${num(b1)} \\cdot ${num(a2)} = ${num(d)}`,
        why: 'The determinant is not zero, so A and B are linearly independent and form a basis: every payoff can be built from them in exactly one way.',
        result: d,
      },
      {
        text: 'Write down the inverse of P.',
        latex: `P^{-1} = \\dfrac{1}{${num(d)}} \\begin{pmatrix} ${num(b2)} & ${num(-b1)} \\\\ ${num(-a2)} & ${num(a1)} \\end{pmatrix}`,
        why: 'For a 2×2 matrix, swap the diagonal entries, change the sign of the other two and divide by the determinant.',
      },
      {
        text: `Multiply row ${p.which + 1} of the inverse by x.`,
        latex: `c_${p.which + 1} = \\dfrac{${row}}{${num(d)}} = \\dfrac{${num(top)}}{${num(d)}} = ${num(answerOf(p))}`,
        why: 'Since x = Pc, the coordinates are c = P⁻¹x: the recipe of x in terms of the new basis.',
        result: answerOf(p),
      },
      {
        text: 'Check by rebuilding the payoff.',
        latex: `${num(p.c[0])}${vec(p.a)} + ${num(p.c[1])}${vec(p.b)} = ${vec(x)}`,
        why: 'The holding must reproduce the payoff in both states; if it does, the coordinates are right.',
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerOf(p), candidates(p), EXACT.tolerance, 0),
};
