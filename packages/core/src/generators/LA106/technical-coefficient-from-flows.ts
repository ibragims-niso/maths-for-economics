import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { at, type Matrix } from '../LA105/matrix';
import { columnSum, flowsTableLatex, rowSum, sectorName } from './leontief';

interface Params {
  /** Input coefficients in hundredths (multiples of 5, from 0.05 to 0.35). */
  H: Matrix;
  /** Total outputs, multiples of 20, so every flow is a whole number. */
  x: number[];
  /** The coefficient asked for: input from sector i per unit of sector j's output (i ≠ j). */
  i: number;
  j: number;
}

/** The answer is exact to 2 decimals, so only a correctly rounded value is accepted. */
const TWO_DP = { tolerance: 0.005, relTolerance: 0 } as const;

/** z_ij = a_ij · x_j: what sector i sells to sector j. */
export const flows = (p: Params): Matrix =>
  p.H.map((row) => row.map((h, j) => (h * (p.x[j] ?? 0)) / 100));
/** d_i = x_i − Σ_j z_ij: what is left of sector i's output for final users. */
export const finalDemand = (p: Params) =>
  flows(p).map((_, i) => (p.x[i] ?? 0) - rowSum(flows(p), i));

const coefficient = (p: Params) => at(p.H, p.i, p.j) / 100;

const candidates = (p: Params): Distractor[] => {
  const z = flows(p);
  const xi = p.x[p.i] ?? 1;
  return [
    { value: round(at(z, p.i, p.j) / xi, 2), mistakeCode: 'DIVIDED_BY_SELLER' },
    { value: round(at(z, p.i, p.j) / columnSum(z, p.j), 2), mistakeCode: 'INTERMEDIATE_ONLY' },
    { value: round(at(z, p.j, p.i) / xi, 2), mistakeCode: 'FLOW_DIRECTION' },
  ];
};

const kept = (p: Params) =>
  cleanDistractors(coefficient(p), candidates(p), TWO_DP.tolerance, TWO_DP.relTolerance);

/** LA106, difficulty 1: a technical coefficient a_ij = z_ij / x_j from a flows table. */
export const technicalCoefficientFromFlows: Generator<Params> = {
  id: 'technical-coefficient-from-flows',
  title: 'Input coefficient from a flows table',
  topicId: 'LA106',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const n = rng.pick([2, 3]);
      const H = Array.from({ length: n }, () => Array.from({ length: n }, () => 5 * rng.int(1, 7)));
      // Every sector spends at most 0.8 of a unit on inputs per unit of output.
      if (H[0]?.some((_, j) => columnSum(H, j) > 80)) continue;
      const x = Array.from({ length: n }, () => 20 * rng.int(5, 50));
      const i = rng.int(0, n - 1);
      const j = (i + rng.int(1, n - 1)) % n;
      const p: Params = { H, x, i, j };
      // Final users get a clear positive amount of every good.
      if (finalDemand(p).some((d) => d < 10)) continue;
      if (kept(p).length === 3) return p;
    }
  },

  stem: (p) =>
    `The flows table of a small economy (million manat) shows what each sector sells (rows) to each sector (columns) and to final demand: $${flowsTableLatex(flows(p), finalDemand(p))}$ Find the technical coefficient $a_{${p.i + 1}${p.j + 1}}$, the input from ${sectorName(p.i)} needed per unit of ${sectorName(p.j)}'s output. Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: coefficient(p), decimals: 2, ...TWO_DP }),

  steps(p) {
    const z = flows(p);
    const d = finalDemand(p);
    const xj = p.x[p.j] ?? 0;
    const row = z[p.j] ?? [];
    return [
      {
        text: `Add up the ${sectorName(p.j)} row to get its total output.`,
        latex: `x_${p.j + 1} = ${[...row, d[p.j] ?? 0].map((v) => num(v)).join(' + ')} = ${num(xj)}`,
        why: 'Everything a sector produces is sold, either to a sector as an input or to final users, so its row total is its output.',
        result: xj,
      },
      {
        text: `Divide the flow from ${sectorName(p.i)} to ${sectorName(p.j)} by the output of the buying sector, ${sectorName(p.j)}.`,
        latex: `a_{${p.i + 1}${p.j + 1}} = \\dfrac{z_{${p.i + 1}${p.j + 1}}}{x_${p.j + 1}} = \\dfrac{${num(at(z, p.i, p.j))}}{${num(xj)}} = ${num(coefficient(p))}`,
        why: `The coefficient is an input per unit of the buyer's output: ${sectorName(p.j)} needs this much from ${sectorName(p.i)} to make one unit.`,
        result: coefficient(p),
      },
    ];
  },

  distractors: (p) => kept(p),
};
