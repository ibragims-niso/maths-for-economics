import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { column, dot, dotLatex, type Matrix, pmatrix, row, sum } from './matrix';

const GOODS = [
  ['bread', 'milk', 'coffee'],
  ['apples', 'pears', 'plums'],
  ['notebooks', 'pens', 'folders'],
  ['tea', 'sugar', 'rice'],
] as const;

interface Params {
  /** Index into GOODS: the names of the three goods. */
  goods: number;
  /** Quantities sold: 2 shops × 3 goods. */
  q: Matrix;
  /** Prices per unit: 3 goods × 2 price lists (this year, next year). */
  p: Matrix;
  /** The entry asked for: row i (shop), column j (price list). */
  i: 1 | 2;
  j: 1 | 2;
}

/** Integer answers: no rounding, so an exact tolerance. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const LISTS = ["this year's", "next year's"] as const;

/** Entry (i, j) of QP: row i of Q times column j of P. */
const productEntry = (q: Matrix, p: Matrix, i: number, j: number) => dot(row(q, i), column(p, j));

const candidates = ({ q, p, i, j }: Params) => [
  // Entry (j, i) of QP: row j of Q with column i of P.
  { value: productEntry(q, p, j, i), mistakeCode: 'INDICES_SWAPPED' },
  // Entry (i, j) of PQ (a 3 × 3 matrix): row i of P with column j of Q.
  { value: dot(row(p, i), column(q, j)), mistakeCode: 'ORDER_SWAPPED' },
  { value: sum(row(q, i)) * sum(column(p, j)), mistakeCode: 'TOTALS_MULTIPLIED' },
];

/** LA102, difficulty 1: one entry of a product QP (2 × 3 times 3 × 2), read as a shop's revenue at one price list. */
export const matrixProductRevenueEntry: Generator<Params> = {
  id: 'matrix-product-revenue-entry',
  title: 'An entry of a matrix product',
  topicId: 'LA102',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const goods = rng.int(0, GOODS.length - 1);
      const q = [0, 1].map(() => [0, 1, 2].map(() => rng.int(1, 12) * 5));
      const p = [0, 1, 2].map(() => [0, 1].map(() => rng.int(1, 9)));
      const i = rng.pick([1, 2] as const);
      const j = rng.pick([1, 2] as const);
      const params: Params = { goods, q, p, i, j };
      // Every mistake must give its own wrong answer (for i = j, swapping the indices changes nothing).
      const expected = i === j ? 2 : 3;
      const kept = cleanDistractors(
        productEntry(q, p, i, j),
        candidates(params).filter((c) => i !== j || c.mistakeCode !== 'INDICES_SWAPPED'),
        EXACT.tolerance,
        EXACT.relTolerance,
      );
      if (kept.length === expected) return params;
    }
  },

  stem: (p) => {
    const [g1, g2, g3] = GOODS[p.goods] ?? GOODS[0];
    return `Two shops sell ${g1}, ${g2} and ${g3}. The matrix $Q$ gives one day's sales (rows: shop 1, shop 2; columns: ${g1}, ${g2}, ${g3}) and $P$ gives the prices per unit (rows: ${g1}, ${g2}, ${g3}; columns: this year's prices, next year's prices): $Q = ${pmatrix(p.q)}$, $P = ${pmatrix(p.p)}$. Find $(QP)_{${p.i}${p.j}}$, the entry in row ${p.i} and column ${p.j} of $QP$.`;
  },

  answer: (p) => ({
    kind: 'numeric',
    value: productEntry(p.q, p.p, p.i, p.j),
    decimals: 0,
    ...EXACT,
  }),

  steps(p) {
    const r = row(p.q, p.i);
    const c = column(p.p, p.j);
    const value = productEntry(p.q, p.p, p.i, p.j);
    return [
      {
        text: 'Check that the product is defined and find its size.',
        latex: `(2 \\times 3)(3 \\times 2) \\;\\Rightarrow\\; QP \\text{ is } 2 \\times 2`,
        why: 'Q has 3 columns and P has 3 rows (one for each good), so the inner sizes match; the outer sizes give the size of the result.',
      },
      {
        text: `Take row ${p.i} of Q and column ${p.j} of P.`,
        latex: `\\text{row } ${p.i} \\text{ of } Q = (${r.map((x) => num(x)).join(',\\ ')}), \\quad \\text{column } ${p.j} \\text{ of } P = (${c.map((x) => num(x)).join(',\\ ')})`,
        why: `Entry (${p.i}, ${p.j}) of a product always uses row ${p.i} of the left matrix and column ${p.j} of the right one.`,
      },
      {
        text: 'Multiply matching pairs and add.',
        latex: `(QP)_{${p.i}${p.j}} = ${dotLatex(r, c)} = ${num(value)}`,
        why: `Each good's quantity is paired with that same good's price, so the sum is shop ${p.i}'s revenue at ${LISTS[p.j - 1]} prices. Rows of QP belong to shops and columns to price lists.`,
        result: value,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(
      productEntry(p.q, p.p, p.i, p.j),
      candidates(p),
      EXACT.tolerance,
      EXACT.relTolerance,
    ),
};
