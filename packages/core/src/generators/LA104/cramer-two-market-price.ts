import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  bmatrix,
  det2,
  det2Added,
  det2Working,
  EXACT,
  type Matrix2,
  replaceColumn,
} from './matrix';

interface Params {
  /** Market 1: demand Q = a1 − b1·P1 + c1·P2, supply Q = d1·P1 − s1. */
  a1: number;
  b1: number;
  c1: number;
  d1: number;
  s1: number;
  /** Market 2: demand Q = a2 + c2·P1 − b2·P2, supply Q = d2·P2 − s2. */
  a2: number;
  b2: number;
  c2: number;
  d2: number;
  s2: number;
  /** The price asked for: P1 (column 1) or P2 (column 2). */
  ask: 1 | 2;
}

/** Demand = supply in each market: (b1 + d1)P1 − c1·P2 = a1 + s1 and −c2·P1 + (b2 + d2)P2 = a2 + s2. */
const matrix = (p: Params): Matrix2 => [
  [p.b1 + p.d1, -p.c1],
  [-p.c2, p.b2 + p.d2],
];
const rhs = (p: Params): [number, number] => [p.a1 + p.s1, p.a2 + p.s2];
const column = (p: Params): 0 | 1 => (p.ask === 1 ? 0 : 1);
const price = (p: Params, j: 0 | 1) => det2(replaceColumn(matrix(p), j, rhs(p))) / det2(matrix(p));
const value = (p: Params) => price(p, column(p));

/** "c·x" with the coefficient 1 left out: (1, "P_2") → "P_2", (3, "P_2") → "3P_2". */
const term = (c: number, x: string) => `${c === 1 ? '' : num(c)}${x}`;
/** Supply d·P − s, written without "- 0". */
const supply = (d: number, s: number, x: string) =>
  s === 0 ? term(d, x) : `${term(d, x)} - ${num(s)}`;

/** LA104, difficulty 3: an equilibrium price in two related markets, by Cramer's rule. */
export const cramerTwoMarketPrice: Generator<Params> = {
  id: 'cramer-two-market-price',
  title: "Two related markets by Cramer's rule",
  topicId: 'LA104',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      // Draw the equilibrium prices first, then build demand intercepts that give them.
      const p1 = rng.int(4, 30);
      const p2 = rng.int(4, 30);
      const b1 = rng.int(1, 4);
      const b2 = rng.int(1, 4);
      const c1 = rng.int(1, b1);
      const c2 = rng.int(1, b2);
      const d1 = rng.int(1, 4);
      const d2 = rng.int(1, 4);
      const s1 = rng.int(0, 20);
      const s2 = rng.int(0, 20);
      const q1 = d1 * p1 - s1;
      const q2 = d2 * p2 - s2;
      const a1 = q1 + b1 * p1 - c1 * p2;
      const a2 = q2 + b2 * p2 - c2 * p1;
      // Positive quantities and demand intercepts; different prices so the wrong column shows.
      if (p1 === p2 || q1 < 2 || q2 < 2 || a1 < 1 || a2 < 1) continue;
      return { a1, b1, c1, d1, s1, a2, b2, c2, d2, s2, ask: rng.pick([1, 2] as const) };
    }
  },

  stem: (p) =>
    `Two goods are substitutes. Market 1: demand $Q_1 = ${num(p.a1)} - ${term(p.b1, 'P_1')} + ${term(p.c1, 'P_2')}$, supply $Q_1 = ${supply(p.d1, p.s1, 'P_1')}$. Market 2: demand $Q_2 = ${num(p.a2)} + ${term(p.c2, 'P_1')} - ${term(p.b2, 'P_2')}$, supply $Q_2 = ${supply(p.d2, p.s2, 'P_2')}$. Use Cramer's rule to find the equilibrium price $P_${p.ask}$.`,

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const A = matrix(p);
    const j = column(p);
    const Aj = replaceColumn(A, j, rhs(p));
    const detA = det2(A);
    const detAj = det2(Aj);
    const answer = value(p);
    const other = price(p, j === 0 ? 1 : 0);
    const [P1, P2] = j === 0 ? [answer, other] : [other, answer];
    return [
      {
        text: 'Set demand equal to supply in each market and collect the prices on the left.',
        latex: `\\begin{aligned} ${term(A[0][0], 'P_1')} - ${term(p.c1, 'P_2')} &= ${num(rhs(p)[0])} \\\\ -${term(p.c2, 'P_1')} + ${term(A[1][1], 'P_2')} &= ${num(rhs(p)[1])} \\end{aligned}`,
        why: 'In equilibrium each market clears. Both prices appear in both equations because the goods are linked, so the markets must be solved together.',
      },
      {
        text: 'Find the determinant of the coefficient matrix.',
        latex: `\\det ${bmatrix(A)} = ${det2Working(A)} = ${num(detA)}`,
        why: 'It is not zero, so the two markets have exactly one equilibrium.',
        result: detA,
      },
      {
        text: `Replace column ${p.ask} (the coefficients of P${p.ask === 1 ? '₁' : '₂'}) by the right-hand side.`,
        latex: `\\det A_${p.ask} = \\det ${bmatrix(Aj)} = ${det2Working(Aj)} = ${num(detAj)}`,
        why: 'Cramer’s rule swaps the column of the unknown you want for the constants and leaves the other column alone.',
        result: detAj,
      },
      {
        text: 'Divide by det A.',
        latex: `P_${p.ask} = \\dfrac{${num(detAj)}}{${num(detA)}} = ${num(answer)}`,
        why: 'Each unknown is the determinant of its replaced matrix divided by det A.',
        result: answer,
      },
      {
        text: 'Check: with both prices, demand equals supply in the market you solved for.',
        latex:
          p.ask === 1
            ? `${num(p.a1)} - ${term(p.b1, `(${num(P1)})`)} + ${term(p.c1, `(${num(P2)})`)} = ${num(p.d1 * P1 - p.s1)} = ${supply(p.d1, p.s1, `(${num(P1)})`)}`
            : `${num(p.a2)} + ${term(p.c2, `(${num(P1)})`)} - ${term(p.b2, `(${num(P2)})`)} = ${num(p.d2 * P2 - p.s2)} = ${supply(p.d2, p.s2, `(${num(P2)})`)}`,
        why: `The other price, P${p.ask === 1 ? '₂' : '₁'} = ${num(other)}, comes from the other column in the same way.`,
      },
    ];
  },

  distractors(p) {
    const j = column(p);
    const Aj = replaceColumn(matrix(p), j, rhs(p));
    return cleanDistractors(
      value(p),
      [
        { value: price(p, j === 0 ? 1 : 0), mistakeCode: 'WRONG_COLUMN' },
        { value: det2(Aj), mistakeCode: 'NOT_DIVIDED' },
        { value: round(det2(matrix(p)) / det2(Aj), 4), mistakeCode: 'INVERTED_CRAMER' },
        { value: round(det2Added(Aj) / det2Added(matrix(p)), 2), mistakeCode: 'DET_ADDED' },
      ],
      EXACT.tolerance,
      EXACT.relTolerance,
    );
  },
};
