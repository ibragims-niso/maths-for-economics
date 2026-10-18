import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { column, dot, dotLatex, type Matrix, pmatrix, row, sum } from './matrix';

interface Params {
  /** Inputs per unit: 2 products × 3 inputs (labour hours, energy in kWh, materials in kg). */
  r: Matrix;
  /** Input prices: per hour, per kWh, per kg. */
  w: readonly number[];
  /** Monthly output: 2 plants × 2 products. */
  x: Matrix;
  /** The plant asked about. */
  i: 1 | 2;
}

/** Integer answers: no rounding, so an exact tolerance. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** Cost of one unit of each product: c = Rw. */
const unitCosts = (p: Params) => [dot(row(p.r, 1), p.w), dot(row(p.r, 2), p.w)];
/** Plant i's input cost: row i of X times c, the i-th entry of XRw. */
const plantCost = (p: Params) => dot(row(p.x, p.i), unitCosts(p));

const candidates = (p: Params) => {
  const c = unitCosts(p);
  return [
    { value: dot(column(p.x, p.i), c), mistakeCode: 'COLUMN_FOR_ROW' },
    { value: sum(row(p.x, p.i)) * sum(c), mistakeCode: 'TOTALS_MULTIPLIED' },
  ];
};

/** LA102, difficulty 3: a plant's total input cost, the i-th entry of XRw (output plan × input needs × input prices). */
export const matrixChainPlantCost: Generator<Params> = {
  id: 'matrix-chain-plant-cost',
  title: 'Input cost from a chain of matrices',
  topicId: 'LA102',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const r = [0, 1].map(() => [rng.int(1, 6), rng.int(2, 12), rng.int(1, 5)]);
      const w = [rng.int(10, 25), rng.int(1, 3), rng.int(2, 9)];
      const x = [0, 1].map(() => [rng.int(2, 20) * 10, rng.int(2, 20) * 10]);
      const p: Params = { r, w, x, i: rng.pick([1, 2] as const) };
      const kept = cleanDistractors(
        plantCost(p),
        candidates(p),
        EXACT.tolerance,
        EXACT.relTolerance,
      );
      if (kept.length === 2) return p;
    }
  },

  stem: (p) =>
    `A firm makes two products in two plants. The matrix $R = ${pmatrix(p.r)}$ gives the inputs needed for one unit of each product (rows: product 1, product 2; columns: hours of labour, kWh of energy, kg of materials). Input prices are $${num(p.w[0] ?? 0)}$ per hour, $${num(p.w[1] ?? 0)}$ per kWh and $${num(p.w[2] ?? 0)}$ per kg. This month's plan is $X = ${pmatrix(p.x)}$ (rows: plant 1, plant 2; columns: units of product 1, units of product 2). What is the total input cost of plant ${p.i} this month?`,

  answer: (p) => ({ kind: 'numeric', value: plantCost(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [c1 = 0, c2 = 0] = unitCosts(p);
    const value = plantCost(p);
    return [
      {
        text: 'Cost of one unit of product 1: row 1 of R times the vector of input prices w.',
        latex: `w = (${p.w.map((x) => num(x)).join(',\\ ')}), \\quad c_1 = ${dotLatex(row(p.r, 1), p.w)} = ${num(c1)}`,
        why: 'Each input needed for one unit is paired with that input’s price; the sum is the unit cost.',
        result: c1,
      },
      {
        text: 'Cost of one unit of product 2: row 2 of R times w.',
        latex: `c_2 = ${dotLatex(row(p.r, 2), p.w)} = ${num(c2)}`,
        why: 'Together the two unit costs form the vector c = Rw, a 2 × 3 matrix times a 3-vector giving a 2-vector.',
        result: c2,
      },
      {
        text: `Plant ${p.i}'s cost: row ${p.i} of X times c.`,
        latex: `(XRw)_${p.i} = ${dotLatex(row(p.x, p.i), [c1, c2])} = ${num(value)}`,
        why: `Row ${p.i} of X lists how many units of each product plant ${p.i} makes; multiply each by its unit cost and add. Because matrix multiplication is associative, X(Rw) = (XR)w.`,
        result: value,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(plantCost(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
