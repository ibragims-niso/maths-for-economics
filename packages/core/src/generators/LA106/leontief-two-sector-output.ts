import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { at, colLatex, type Matrix, matLatex } from '../LA105/matrix';
import { adj10, COEFFICIENTS_2X2, det100, sectorName, tenthsLatex } from './leontief';

interface Params {
  /** Input coefficients in tenths (1 to 5), columns adding up to at most 0.8. */
  T: Matrix;
  /** The total outputs, multiples of 10; drawn first, then d = (I − A)x. */
  x: number[];
  /** Which sector's output is asked for, counting from 0. */
  k: number;
}

/** Default grading: a student who rounds (I − A)⁻¹ along the way is still within 0.5 %. */
const TOL = { tolerance: 0.01, relTolerance: 0.005 } as const;

/** d = (I − A)x: whole numbers, because x is a multiple of 10 and A is in tenths. */
export const finalDemand2 = (p: Params) =>
  p.x.map((xi, i) => xi - (p.T[i] ?? []).reduce((s, t, j) => s + t * (p.x[j] ?? 0), 0) / 10);

const candidates = (p: Params): Distractor[] => {
  const d = finalDemand2(p);
  const dk = d[p.k] ?? 0;
  const oneRound = dk + (p.T[p.k] ?? []).reduce((s, t, j) => s + t * (d[j] ?? 0), 0) / 10;
  const adjRow = adj10(p.T)[p.k] ?? [];
  return [
    { value: dk, mistakeCode: 'IGNORED_INTERMEDIATE' },
    { value: round(oneRound, 2), mistakeCode: 'ONE_ROUND' },
    {
      value: round(adjRow.reduce((s, a, j) => s + a * (d[j] ?? 0), 0) / 10, 2),
      mistakeCode: 'NO_DIVIDE_DET',
    },
    { value: round((10 * dk) / (10 - at(p.T, p.k, p.k)), 2), mistakeCode: 'OWN_SECTOR_ONLY' },
  ];
};

const kept = (p: Params) =>
  cleanDistractors(p.x[p.k] ?? 0, candidates(p), TOL.tolerance, TOL.relTolerance);

/** LA106, difficulty 2: total output of one sector of a 2-sector economy, x = (I − A)⁻¹d. */
export const leontiefTwoSectorOutput: Generator<Params> = {
  id: 'leontief-two-sector-output',
  title: 'Output needed for final demand',
  topicId: 'LA106',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const T = rng.pick(COEFFICIENTS_2X2);
      const x = [10 * rng.int(10, 90), 10 * rng.int(10, 90)];
      const p: Params = { T, x, k: rng.int(0, 1) };
      // Households and other final users buy a clear positive amount of both goods.
      if (finalDemand2(p).some((d) => d < 20)) continue;
      if (kept(p).length === 4) return p;
    }
  },

  stem(p) {
    const d = finalDemand2(p);
    return `An economy has two sectors, agriculture (1) and industry (2). Each unit of output of sector $j$ needs $a_{ij}$ units of input from sector $i$, with $A = ${tenthsLatex(p.T)}$. Final demand (households, government, investment and exports) is $d = ${colLatex(d)}$ million manat. How much must ${sectorName(p.k)} produce in total, $x_${p.k + 1}$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: p.x[p.k] ?? 0, decimals: 2, ...TOL }),

  steps(p) {
    const d = finalDemand2(p);
    const D = det100(p.T) / 100;
    const IA = p.T.map((row, i) => row.map((t, j) => ((i === j ? 10 : 0) - t) / 10));
    const adj = adj10(p.T).map((row) => row.map((a) => a / 10));
    const adjRow = adj[p.k] ?? [];
    const xk = p.x[p.k] ?? 0;
    const other = 1 - p.k;
    return [
      {
        text: 'Write the balance x = Ax + d as a linear system.',
        latex: `(I - A)x = d, \\qquad I - A = ${matLatex(IA)}`,
        why: 'Each sector must produce what the sectors buy from it as inputs (Ax) plus what final users buy (d).',
      },
      {
        text: 'Find the determinant of I − A.',
        latex: `\\det(I - A) = ${num(at(IA, 0, 0))} \\cdot ${num(at(IA, 1, 1))} - ${num(-at(IA, 0, 1))} \\cdot ${num(-at(IA, 1, 0))} = ${num(D, 4)}`,
        why: 'It is positive, so I − A has an inverse and the system has exactly one solution.',
        result: D,
      },
      {
        text: `Use row ${p.k + 1} of (I − A)⁻¹ = adj(I − A)/det(I − A).`,
        latex: `x_${p.k + 1} = \\dfrac{${num(adjRow[p.k] ?? 0)} \\cdot ${num(d[p.k] ?? 0)} + ${num(adjRow[other] ?? 0)} \\cdot ${num(d[other] ?? 0)}}{${num(D, 4)}} = ${num(xk)}`,
        why: 'For a 2×2 matrix the adjugate swaps the diagonal and changes the signs of the other two entries, so the minus signs of I − A disappear.',
        result: xk,
      },
      {
        text: `Check: with x = (${p.x.map((v) => num(v)).join(', ')}), ${sectorName(p.k)}'s output covers its inputs to both sectors plus final demand.`,
        latex: `${num(at(p.T, p.k, 0) / 10)} \\cdot ${num(p.x[0] ?? 0)} + ${num(at(p.T, p.k, 1) / 10)} \\cdot ${num(p.x[1] ?? 0)} + ${num(d[p.k] ?? 0)} = ${num(xk)}`,
        why: 'Putting the answer back into x = Ax + d catches any slip in the inverse.',
      },
    ];
  },

  distractors: (p) => kept(p),
};
