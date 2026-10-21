import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Structure matrix in tenths: column j (entries a_ij·10) adds up to 10. */
  tenths: number[][];
  /** Country 1's national income (billion). */
  x1: number;
}

const MONEY = { tolerance: 0.005, relTolerance: 0 } as const;

const entry = (p: Params, i: number, j: number) => (p.tenths[i]?.[j] ?? 0) / 10;

/** A positive solution of (A − I)x = 0, from the cross product of its first two rows (×10). */
export function incomeRatios(p: Params): [number, number, number] {
  const r = (i: number) => [0, 1, 2].map((j) => (p.tenths[i]?.[j] ?? 0) - (i === j ? 10 : 0));
  const [a1, a2, a3] = r(0) as [number, number, number];
  const [b1, b2, b3] = r(1) as [number, number, number];
  const v: [number, number, number] = [a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1];
  return v[0] < 0 ? [-v[0], -v[1], -v[2]] : v;
}

export const balancedIncome3 = (p: Params) => {
  const v = incomeRatios(p);
  return (p.x1 * v[2]) / v[0];
};
const answerValue = (p: Params) => round(balancedIncome3(p), 2);

const candidates = (p: Params) => {
  const v = incomeRatios(p);
  return [
    { value: p.x1, mistakeCode: 'EQUAL_INCOMES' },
    { value: round((p.x1 * v[0]) / v[2], 2), mistakeCode: 'RATIO_FLIPPED' },
    { value: round((p.x1 * entry(p, 2, 0)) / entry(p, 0, 0), 2), mistakeCode: 'ONE_COLUMN' },
  ];
};

const matrixLatex = (p: Params) =>
  `\\begin{pmatrix} ${p.tenths.map((row) => row.map((t) => num(t / 10)).join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

/** LA205, difficulty 3: national incomes that balance trade among three countries (eigenvalue 1). */
export const tradeModelThreeCountries: Generator<Params> = {
  id: 'trade-model-three-countries',
  title: 'Balanced trade among three countries',
  topicId: 'LA205',
  difficulty: 3,
  timeSec: 240,

  params(rng) {
    for (;;) {
      // Each column: three shares in tenths, each at least 1, adding up to 10.
      const cols = [0, 1, 2].map(() => {
        const first = rng.int(2, 6);
        const second = rng.int(1, 9 - first);
        return [first, second, 10 - first - second];
      });
      // Put the home share on the diagonal: rotate each column so its first draw is a_jj.
      const tenths = [0, 1, 2].map((i) =>
        [0, 1, 2].map((j) => (cols[j] as number[])[(i - j + 3) % 3] as number),
      );
      const x1 = rng.int(4, 30) * 10;
      const p: Params = { tenths, x1 };
      const v = incomeRatios(p);
      if (v.some((c) => c <= 0)) continue;
      if (v[0] === v[2]) continue;
      if (cleanDistractors(answerValue(p), candidates(p), MONEY.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem: (p) =>
    `Three countries trade only with one another. Their structure matrix is $A = ${matrixLatex(p)}$, where $a_{ij}$ is the share of country $j$'s national income spent on goods from country $i$ (each column adds up to 1). Country 1's national income is ${num(p.x1)} billion. What must country 3's national income be for trade to be balanced, $Ax = x$? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: answerValue(p), decimals: 2, ...MONEY }),

  steps(p) {
    const v = incomeRatios(p);
    const row = (i: number) =>
      [0, 1, 2]
        .map((j) => {
          const c = (p.tenths[i]?.[j] ?? 0) - (i === j ? 10 : 0);
          return `${j === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : num(Math.abs(c))}x_{${j + 1}}`;
        })
        .join('');
    return [
      {
        text: 'Write balance as the homogeneous system (A − I)x = 0, multiplied by 10.',
        latex: `${row(0)} = 0, \\qquad ${row(1)} = 0`,
        why: 'Ax = x says every country’s sales equal its income. The columns of A − I add up to 0, so the three equations are dependent (det(A − I) = 0, eigenvalue 1) and two of them are enough.',
      },
      {
        text: 'Solve: the solutions form a line, found from the cross product of the two rows.',
        latex: `x = t\\,(${num(v[0])},\\ ${num(v[1])},\\ ${num(v[2])})`,
        why: 'A vector orthogonal to both rows satisfies both equations; any multiple of it does too, so only the ratios of the incomes are fixed (a fundamental system of one vector).',
      },
      {
        text: 'Scale to country 1’s income.',
        latex: `t = \\dfrac{${num(p.x1)}}{${num(v[0])}}, \\qquad x_3 = ${num(v[2])}\\,t = ${num(answerValue(p))}`,
        why: 'Choose t so that x₁ is the given income; then read off x₃.',
        result: answerValue(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(answerValue(p), candidates(p), MONEY.tolerance, 0),
};
