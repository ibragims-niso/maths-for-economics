import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { pmatrix } from '../LA102/matrix';
import { EXACT, minors3, paren, rows3, type Sym3, sylvesterVerdict } from './forms';

type Params = Sym3;

const candidates = (m: Params): Distractor[] => [
  { value: m.p * m.q * m.r, mistakeCode: 'DIAGONAL_PRODUCT' },
  {
    // The middle cofactor added instead of subtracted.
    value:
      m.p * (m.q * m.r - m.f * m.f) + m.d * (m.d * m.r - m.f * m.e) + m.e * (m.d * m.f - m.q * m.e),
    mistakeCode: 'COFACTOR_SIGN',
  },
  { value: minors3(m)[1], mistakeCode: 'SECOND_MINOR_GIVEN' },
];

const MEANING = {
  'negative definite':
    'The minors alternate −, +, −, so H is negative definite: profit falls in every direction away from the critical point, which is a strict local maximum.',
  'positive definite':
    'All three minors are positive, so H is positive definite: profit rises in every direction away from the critical point, which is a strict local minimum, the worst output plan nearby.',
  indefinite:
    'The signs follow neither pattern and D₃ ≠ 0, so H is indefinite: profit rises in some directions and falls in others. The critical point is a saddle, not a maximum.',
} as const;

/** LA204, difficulty 2: the third leading principal minor (determinant) of a 3×3 profit Hessian. */
export const hessianThirdLeadingMinor: Generator<Params> = {
  id: 'hessian-third-leading-minor',
  title: 'Third leading minor of a 3×3 Hessian',
  topicId: 'LA204',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      // Profit Hessians: negative diagonal (each output alone has diminishing returns),
      // small cross partials of either sign (complements or substitutes in production).
      const m: Params = {
        p: -rng.int(1, 8),
        q: -rng.int(1, 8),
        r: -rng.int(1, 8),
        d: rng.pick([1, -1]) * rng.int(1, 4),
        e: rng.int(-4, 4),
        f: rng.pick([1, -1]) * rng.int(1, 4),
      };
      const [, D2, D3] = minors3(m);
      // D₂ = 0 or D₃ = 0 would leave the test undecided; skip those.
      if (D2 === 0 || D3 === 0) continue;
      if (cleanDistractors(D3, candidates(m), EXACT.tolerance, 0).length < 3) continue;
      return m;
    }
  },

  stem: (m) =>
    `A firm making three products finds that, at a critical point of its profit, the Hessian is $H = ${pmatrix(rows3(m))}$. Find the third leading principal minor $D_3 = \\det H$.`,

  answer: (m) => ({ kind: 'numeric', value: minors3(m)[2], decimals: 0, ...EXACT }),

  steps(m) {
    const [D1, D2, D3] = minors3(m);
    const c1 = m.q * m.r - m.f * m.f;
    const c2 = m.d * m.r - m.f * m.e;
    const c3 = m.d * m.f - m.q * m.e;
    const verdict = sylvesterVerdict([D1, D2, D3]);
    return [
      {
        text: 'The first two leading principal minors come from the top-left corner.',
        latex: `D_1 = ${num(D1)}, \\qquad D_2 = ${paren(m.p)} \\cdot ${paren(m.q)} - ${paren(m.d)}^2 = ${num(D2)}`,
        why: 'D₁ is the top-left entry and D₂ the determinant of the top-left 2×2 block; they are needed for the verdict, but the question asks for D₃.',
        result: D2,
      },
      {
        text: 'Find the three 2×2 minors of the first row by deleting its row and each column in turn.',
        latex: `M_{11} = ${paren(m.q)} \\cdot ${paren(m.r)} - ${paren(m.f)}^2 = ${num(c1)}, \\quad M_{12} = ${paren(m.d)} \\cdot ${paren(m.r)} - ${paren(m.f)} \\cdot ${paren(m.e)} = ${num(c2)}, \\quad M_{13} = ${paren(m.d)} \\cdot ${paren(m.f)} - ${paren(m.q)} \\cdot ${paren(m.e)} = ${num(c3)}`,
        why: 'Expanding a 3×3 determinant along its first row needs the determinant of what is left after crossing out row 1 and the column of each entry.',
      },
      {
        text: 'Combine them with the signs +, −, + (cofactor expansion along the first row).',
        latex: `D_3 = ${paren(m.p)} \\cdot ${paren(c1)} - ${paren(m.d)} \\cdot ${paren(c2)} + ${paren(m.e)} \\cdot ${paren(c3)} = ${num(D3)}`,
        why: 'The signs of the cofactors follow a chessboard pattern starting with + in the top-left corner, so the middle term is subtracted.',
        result: D3,
      },
      {
        text: 'Read the signs of D₁, D₂, D₃ (Sylvester’s criterion).',
        latex: `D_1 = ${num(D1)},\\ D_2 = ${num(D2)},\\ D_3 = ${num(D3)}:\\ ${verdict.latex} \\Rightarrow \\text{${verdict.name}}`,
        why: MEANING[verdict.name],
      },
    ];
  },

  distractors: (m) => cleanDistractors(minors3(m)[2], candidates(m), EXACT.tolerance, 0),
};
