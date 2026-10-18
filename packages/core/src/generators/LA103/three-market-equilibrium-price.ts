import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  augmented,
  divideByPivot,
  equation,
  plain,
  rowOp,
  rowOpText,
  signed,
  system,
  term,
} from './matrix-latex';

/**
 * The system is built as A = LU from the multipliers of elimination (l21, l31, l32) and the
 * echelon form U it ends in, so every row operation uses whole numbers and the prices are whole.
 */
interface Params {
  l21: number;
  l31: number;
  l32: number;
  u11: number;
  u12: number;
  u13: number;
  u22: number;
  u23: number;
  u33: number;
  /** Equilibrium prices P1, P2, P3. */
  prices: [number, number, number];
  /** Which price the question asks for: 1, 2 or 3. */
  ask: 1 | 2 | 3;
}

const NAMES = ['P_1', 'P_2', 'P_3'] as const;

type Row = [number, number, number];

/** The echelon form U and its right-hand side c = U·prices. */
const echelon = (p: Params) => {
  const [p1, p2, p3] = p.prices;
  const u: [Row, Row, Row] = [
    [p.u11, p.u12, p.u13],
    [0, p.u22, p.u23],
    [0, 0, p.u33],
  ];
  const c: Row = [p.u11 * p1 + p.u12 * p2 + p.u13 * p3, p.u22 * p2 + p.u23 * p3, p.u33 * p3];
  return { u, c };
};

const add = (x: Row, y: Row, m = 1): Row => [x[0] + m * y[0], x[1] + m * y[1], x[2] + m * y[2]];

/** The system the student sees, A·P = b, with A = LU. */
export const marketSystem = (p: Params) => {
  const { u, c } = echelon(p);
  const zero: Row = [0, 0, 0];
  const a: [Row, Row, Row] = [
    u[0],
    add(add(zero, u[0], p.l21), u[1]),
    add(add(add(zero, u[0], p.l31), u[1], p.l32), u[2]),
  ];
  const b: Row = [c[0], p.l21 * c[0] + c[1], p.l31 * c[0] + p.l32 * c[1] + c[2]];
  return { a, b };
};

type Shape = Omit<Params, 'prices' | 'ask'>;

/**
 * Every combination of multipliers and echelon form that gives a sensible market system, listed
 * once: each price is pushed up by its own market (positive diagonal), the goods are substitutes
 * or unrelated (no positive cross terms), coefficients stay small, the markets are really linked
 * (at most one zero cross term) and row 1 has a known part to move across in back substitution.
 */
const SHAPES: readonly Shape[] = (() => {
  const list: Shape[] = [];
  const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  for (const l21 of [-2, -1])
    for (const l31 of [-2, -1, 0])
      for (const l32 of [-2, -1, 1])
        for (const u11 of range(1, 3))
          for (const u12 of range(-3, 0))
            for (const u13 of range(-3, 0))
              for (const u22 of range(1, 4))
                for (const u23 of [-3, -2, -1, 1])
                  for (const u33 of range(1, 5)) {
                    const shape = { l21, l31, l32, u11, u12, u13, u22, u23, u33 };
                    if (u12 === 0 && u13 === 0) continue;
                    const { a } = marketSystem({ ...shape, prices: [1, 1, 1], ask: 1 });
                    const signsOk = a.every((row, i) =>
                      row.every((x, j) => (i === j ? x > 0 : x <= 0) && Math.abs(x) <= 12),
                    );
                    const zeros = a.flatMap((row, i) => row.filter((x, j) => i !== j && x === 0));
                    if (signsOk && zeros.length <= 1) list.push(shape);
                  }
  return list;
})();

/** Back substitution from an echelon form with right-hand side c: [P1, P2, P3]. */
const backSubstitute = (p: Params, c: Row): Row => {
  const p3 = c[2] / p.u33;
  const p2 = (c[1] - p.u23 * p3) / p.u22;
  const p1 = (c[0] - p.u12 * p2 - p.u13 * p3) / p.u11;
  return [p1, p2, p3];
};

/** The wrong answers of common slips, for the price that is asked. */
function wrongAnswers(p: Params): Distractor[] {
  const { c } = echelon(p);
  const [p1, p2, p3] = p.prices;
  const i = p.ask - 1;
  const answer = p.prices[i] ?? 0;
  // Sign slip on the right-hand side in the last row operation: c3 + l32·c2 instead of c3 − l32·c2.
  const slipped = backSubstitute(p, [c[0], c[1], c[2] + 2 * p.l32 * c[1]]);
  const list: Distractor[] = [{ value: round(slipped[i] ?? 0, 2), mistakeCode: 'ROW_OP_SIGN' }];
  if (p.ask === 3) {
    list.push({ value: c[2], mistakeCode: 'NOT_DIVIDED_BY_PIVOT' });
    list.push({ value: p1, mistakeCode: 'WRONG_VARIABLE' });
  } else if (p.ask === 2) {
    list.push({ value: c[1] - p.u23 * p3, mistakeCode: 'NOT_DIVIDED_BY_PIVOT' });
    list.push({ value: round((c[1] + p.u23 * p3) / p.u22, 2), mistakeCode: 'BACK_SUB_SIGN' });
    list.push({ value: p3, mistakeCode: 'WRONG_VARIABLE' });
  } else {
    const known = p.u12 * p2 + p.u13 * p3;
    list.push({ value: c[0] - known, mistakeCode: 'NOT_DIVIDED_BY_PIVOT' });
    list.push({ value: round((c[0] + known) / p.u11, 2), mistakeCode: 'BACK_SUB_SIGN' });
    list.push({ value: p2, mistakeCode: 'WRONG_VARIABLE' });
  }
  return cleanDistractors(answer, list);
}

/** LA103, difficulty 2: one equilibrium price of three related markets by Gaussian elimination. */
export const threeMarketEquilibriumPrice: Generator<Params> = {
  id: 'three-market-equilibrium-price',
  title: 'Three-market equilibrium price',
  topicId: 'LA103',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const shape = rng.pick(SHAPES);
      for (let tries = 0; tries < 20; tries++) {
        const p: Params = {
          ...shape,
          prices: [rng.int(4, 40), rng.int(4, 40), rng.int(4, 40)],
          ask: rng.pick([1, 2, 3] as const),
        };
        const { b } = marketSystem(p);
        // Demand exceeds supply at zero prices in every market, and a slip in the last row
        // operation (which uses c2) really changes the result.
        const rhsOk = b.every((x) => x > 0 && x <= 600) && echelon(p).c[1] !== 0;
        if (rhsOk && wrongAnswers(p).length >= 2) return p;
      }
    }
  },

  stem(p) {
    const { a, b } = marketSystem(p);
    return `After collecting terms, the market-clearing conditions of three related goods give this system for their equilibrium prices: $${system(a, NAMES, b)}$. Use Gaussian elimination to find $P_${p.ask}$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: p.prices[p.ask - 1] ?? 0, decimals: 0 }),

  steps(p) {
    const { a, b } = marketSystem(p);
    const { u, c } = echelon(p);
    const [p1, p2, p3] = p.prices;
    const row3After1 = add(add([0, 0, 0], u[1], p.l32), u[2]);
    const c3After1 = p.l32 * c[1] + c[2];
    const ops1 = [rowOp(2, p.l21, 1), ...(p.l31 === 0 ? [] : [rowOp(3, p.l31, 1)])];
    const steps = [
      {
        text: `Clear $P_1$ from rows 2 and 3 using the pivot ${num(p.u11)} in row 1.`,
        latex: `${augmented(a, b)} \\xrightarrow{${ops1.join(',\\ ')}} ${augmented([u[0], u[1], row3After1], [c[0], c[1], c3After1])}`,
        why:
          p.l31 === 0
            ? `The multiplier for row 2 is ${plain(a[1][0])}/${plain(p.u11)} = ${plain(p.l21)}, so ${rowOpText(2, p.l21, 1)} makes its first entry zero; row 3 has no P₁ term already. Every entry changes, including the right-hand side.`
            : `The multipliers are ${plain(a[1][0])}/${plain(p.u11)} = ${plain(p.l21)} for row 2 and ${plain(a[2][0])}/${plain(p.u11)} = ${plain(p.l31)} for row 3, so ${rowOpText(2, p.l21, 1)} and ${rowOpText(3, p.l31, 1)} make both first entries zero. Every entry changes, including the right-hand side.`,
      },
      {
        text: `Clear $P_2$ from row 3 using the pivot ${num(p.u22)} in row 2.`,
        latex: `\\xrightarrow{${rowOp(3, p.l32, 2)}} ${augmented(u, c)}`,
        why: `Row 3 has ${plain(row3After1[1])} in the P₂ column and the pivot above it is ${plain(p.u22)}, so the multiplier is ${plain(p.l32)} and ${rowOpText(3, p.l32, 2)} makes it zero. The matrix is now in row echelon form with three pivots, so there is exactly one solution.`,
      },
      {
        text: 'Back substitution: the last row gives $P_3$.',
        latex: `${equation(u[2], NAMES, c[2])} \\;\\Rightarrow\\; ${divideByPivot('P_3', c[2], p.u33, p3)}`,
        why: 'The last row has one unknown left, so divide by its pivot.',
        result: p3,
      },
    ];
    if (p.ask <= 2) {
      const known = p.u23 * p3;
      steps.push({
        text: 'Put $P_3$ into row 2 to find $P_2$.',
        latex: `${term(p.u22, 'P_2')}${signed(known)} = ${num(c[1])} \\;\\Rightarrow\\; ${divideByPivot('P_2', c[1] - known, p.u22, p2)}`,
        why: 'With P₃ known, row 2 has one unknown. Move the known part to the right-hand side and divide by the pivot.',
        result: p2,
      });
    }
    if (p.ask === 1) {
      const known = p.u12 * p2 + p.u13 * p3;
      steps.push({
        text: 'Put $P_2$ and $P_3$ into row 1 to find $P_1$.',
        latex: `${term(p.u11, 'P_1')}${signed(known)} = ${num(c[0])} \\;\\Rightarrow\\; ${divideByPivot('P_1', c[0] - known, p.u11, p1)}`,
        why: 'Row 1 now has only P₁ unknown. Move the known part to the right-hand side and divide by the pivot.',
        result: p1,
      });
    }
    return steps;
  },

  distractors: (p) => wrongAnswers(p),
};
