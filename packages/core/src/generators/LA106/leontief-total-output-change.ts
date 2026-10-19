import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { at, type Matrix } from '../LA105/matrix';
import {
  columnSum,
  det100,
  fromTenths,
  leontief2,
  NICE_2X2,
  rowSum,
  sectorName,
  tenthsLatex,
} from './leontief';

interface Params {
  /** Input coefficients in tenths, chosen so that (I − A)⁻¹ is exact to 2 decimals. */
  T: Matrix;
  /** The sector whose final demand rises, counting from 0. */
  j: number;
  /** The rise in final demand, a multiple of 5 from 10 to 400 (million manat). */
  delta: number;
}

/** (I − A)⁻¹ is exact to 2 decimals and Δ is a multiple of 5, so the answer is exact to 2 decimals. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Leontief inverse rounded to 2 decimals (exact by construction; rounding only removes float noise). */
const inv = (p: Params) => leontief2(p.T).map((row) => row.map((x) => round(x, 2)));
/** The output multiplier of sector j: column sum j of (I − A)⁻¹. */
export const multiplier = (p: Params) => round(columnSum(inv(p), p.j), 2);
const target = (p: Params) => round(p.delta * multiplier(p), 2);

const candidates = (p: Params): Distractor[] => {
  const A = fromTenths(p.T);
  const colA = columnSum(A, p.j);
  return [
    { value: round(p.delta * colA, 2), mistakeCode: 'COLUMN_SUM_A' },
    { value: round(p.delta * (1 + colA), 2), mistakeCode: 'ONE_ROUND' },
    { value: round(p.delta / (1 - at(A, p.j, p.j)), 2), mistakeCode: 'OWN_SECTOR_ONLY' },
    { value: round(p.delta * rowSum(inv(p), p.j), 2), mistakeCode: 'ROW_NOT_COLUMN' },
  ];
};

const kept = (p: Params) =>
  cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);

/** LA106, difficulty 3: rise in total output of both sectors = Δd × output multiplier. */
export const leontiefTotalOutputChange: Generator<Params> = {
  id: 'leontief-total-output-change',
  title: 'Total output from a demand rise',
  topicId: 'LA106',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p: Params = {
        T: rng.pick(NICE_2X2),
        j: rng.int(0, 1),
        delta: 5 * rng.int(2, 80),
      };
      if (kept(p).length >= 3) return p;
    }
  },

  stem: (p) =>
    `An economy has two sectors, agriculture (1) and industry (2), with input coefficients $A = ${tenthsLatex(p.T)}$ ($a_{ij}$ is the input from sector $i$ per unit of sector $j$'s output). Household demand for ${sectorName(p.j)}'s goods rises by ${num(p.delta)} million manat, and final demand for the other good does not change. By how much does the total output of the two sectors together rise?`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 2, ...EXACT }),

  steps(p) {
    const D = det100(p.T) / 100;
    const L = inv(p);
    const col = L.map((row) => row[p.j] ?? 0);
    const m = multiplier(p);
    const name = sectorName(p.j);
    return [
      {
        text: 'Find the determinant of I − A.',
        latex: `\\det(I - A) = (1 - ${num(at(p.T, 0, 0) / 10)})(1 - ${num(at(p.T, 1, 1) / 10)}) - ${num(at(p.T, 0, 1) / 10)} \\cdot ${num(at(p.T, 1, 0) / 10)} = ${num(D)}`,
        why: 'The Leontief inverse (I − A)⁻¹ is the adjugate of I − A divided by this number.',
        result: D,
      },
      {
        text: `Find column ${p.j + 1} of the Leontief inverse.`,
        latex: `(I - A)^{-1} = \\dfrac{1}{${num(D)}}\\begin{pmatrix} 1 - a_{22} & a_{12} \\\\ a_{21} & 1 - a_{11} \\end{pmatrix}, \\quad \\text{column } ${p.j + 1}: \\begin{pmatrix} ${num(col[0] ?? 0)} \\\\ ${num(col[1] ?? 0)} \\end{pmatrix}`,
        why: `Column ${p.j + 1} lists how much each sector must produce, directly and indirectly, for one extra unit of ${name}'s goods sold to final users.`,
      },
      {
        text: `Add the column to get ${name}'s output multiplier.`,
        latex: `m_${p.j + 1} = ${num(col[0] ?? 0)} + ${num(col[1] ?? 0)} = ${num(m)}`,
        why: 'The column sum is the extra output of the whole economy per unit of extra final demand for this sector.',
        result: m,
      },
      {
        text: 'Multiply by the rise in final demand.',
        latex: `\\Delta x_1 + \\Delta x_2 = ${num(m)} \\cdot ${num(p.delta)} = ${num(target(p))}`,
        why: 'The model is linear, so every effect scales with the size of the demand change.',
        result: target(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
