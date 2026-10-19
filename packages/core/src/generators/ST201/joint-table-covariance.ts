import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  cell,
  colTotal,
  drawJointTable,
  type JointTable,
  paren,
  prob,
  rowTotal,
  tableLatex,
  tableLead,
} from './joint-table';

interface Params {
  table: JointTable;
}

/** Cov is exact to 4 decimals (values in whole numbers, probabilities in hundredths) and asked to 2. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

const meanX = (t: JointTable) => t.xs.reduce((s, x, i) => s + x * prob(rowTotal(t, i)), 0);
const meanY = (t: JointTable) => t.ys.reduce((s, y, j) => s + y * prob(colTotal(t, j)), 0);
const meanXY = (t: JointTable) =>
  t.xs.reduce((s, x, i) => s + t.ys.reduce((r, y, j) => r + x * y * prob(cell(t, i, j)), 0), 0);
const covariance = (t: JointTable) => meanXY(t) - meanX(t) * meanY(t);
const variance = (vs: number[], ps: number[]) => {
  const m = vs.reduce((s, v, k) => s + v * (ps[k] ?? 0), 0);
  return vs.reduce((s, v, k) => s + (v - m) ** 2 * (ps[k] ?? 0), 0);
};
const correlation = (t: JointTable) => {
  const vx = variance(
    t.xs,
    t.xs.map((_, i) => prob(rowTotal(t, i))),
  );
  const vy = variance(
    t.ys,
    t.ys.map((_, j) => prob(colTotal(t, j))),
  );
  return covariance(t) / Math.sqrt(vx * vy);
};
const target = (t: JointTable) => round(covariance(t), 2);

/** "a(p) + b(q)" with negative values in brackets. */
const weighted = (vs: number[], ps: number[]) =>
  vs.map((v, k) => `${paren(v)}(${num(ps[k] ?? 0)})`).join(' + ');

/** ST201, difficulty 2: covariance Cov(X, Y) = E[XY] − E[X]E[Y] from a 2×2 or 2×3 joint probability table. */
export const jointTableCovariance: Generator<Params> = {
  id: 'joint-table-covariance',
  title: 'Covariance from a joint table',
  topicId: 'ST201',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const table = drawJointTable(rng, rng.pick(['shares', 'spending'] as const));
      // A clear co-movement: not close to 0, so its sign means something.
      if (Math.abs(correlation(table)) < 0.1) continue;
      if (Math.abs(covariance(table)) < (table.context === 'shares' ? 2 : 0.1)) continue;
      return { table };
    }
  },

  stem(p) {
    return `${tableLead(p.table)} $${tableLatex(p.table)}$ What is the covariance $\\operatorname{Cov}(X, Y)$? Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p.table), decimals: 2, ...EXACT }),

  steps(p) {
    const t = p.table;
    const px = t.xs.map((_, i) => prob(rowTotal(t, i)));
    const py = t.ys.map((_, j) => prob(colTotal(t, j)));
    const terms = t.xs.flatMap((x, i) =>
      t.ys.map((y, j) => `(${num(x)})(${num(y)})(${num(prob(cell(t, i, j)))})`),
    );
    const ex = meanX(t);
    const ey = meanY(t);
    const exy = meanXY(t);
    return [
      {
        text: 'Add each row to get the distribution of X, then find E[X].',
        latex: `P(X) = ${px.map((v) => num(v)).join(',\\ ')};\\quad E[X] = ${weighted(t.xs, px)} = ${num(ex)}`,
        why: 'The row totals are the marginal distribution of X: each value of X can happen with any value of Y.',
        result: round(ex, 2),
      },
      {
        text: 'Add each column to get the distribution of Y, then find E[Y].',
        latex: `P(Y) = ${py.map((v) => num(v)).join(',\\ ')};\\quad E[Y] = ${weighted(t.ys, py)} = ${num(ey)}`,
        why: 'The column totals are the marginal distribution of Y.',
        result: round(ey, 2),
      },
      {
        text: 'Find E[XY] from every cell of the table.',
        latex: `E[XY] = ${terms.join(' + ')} = ${num(exy)}`,
        why: 'XY is a function of both variables, so each cell contributes its product xy weighted by its joint probability.',
        result: round(exy, 2),
      },
      {
        text: 'Subtract the product of the means.',
        latex: `\\operatorname{Cov}(X, Y) = E[XY] - E[X]E[Y] = ${num(exy)} - ${paren(ex)}(${paren(ey)}) = ${num(covariance(t), 4)}`,
        why: 'E[XY] − E[X]E[Y] is a shortcut for E[(X − μ_X)(Y − μ_Y)], the average product of the two deviations from their means. It is positive when the variables tend to be above (or below) their means together.',
        result: target(t),
      },
    ];
  },

  distractors(p) {
    const t = p.table;
    const simpleX = t.xs.reduce((s, x) => s + x, 0) / t.xs.length;
    const simpleY = t.ys.reduce((s, y) => s + y, 0) / t.ys.length;
    return cleanDistractors(
      target(t),
      [
        { value: round(meanXY(t), 2), mistakeCode: 'NO_PRODUCT_OF_MEANS' },
        { value: round(meanXY(t) - simpleX * simpleY, 2), mistakeCode: 'SIMPLE_MEANS' },
        { value: -target(t), mistakeCode: 'REVERSED_ORDER' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
