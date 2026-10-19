import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { linear, paren, plain } from './terms';

interface Params {
  /** Own-price speeds: ṗ₁ falls by m₁ for each unit p₁ rises (m₁, m₂ > 0). */
  m1: number;
  m2: number;
  /** Cross effects: c₁₂ is the effect of p₂ on ṗ₁, c₂₁ that of p₁ on ṗ₂ (never 0). */
  c12: number;
  c21: number;
  /** The steady-state prices, drawn first; the constants are built from them. */
  p1: number;
  p2: number;
  /** Which price the question asks for. */
  ask: 1 | 2;
}

/** The steady-state price is a whole number, so only the exact value is correct. */
const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** The constants b₁ = m₁p₁* − c₁₂p₂* and b₂ = m₂p₂* − c₂₁p₁*, so that ṗ = 0 at p*. */
const constants = (p: Params) => [p.m1 * p.p1 - p.c12 * p.p2, p.m2 * p.p2 - p.c21 * p.p1] as const;
/** det of the coefficient matrix (m₁, −c₁₂; −c₂₁, m₂) of the equations ṗ₁ = ṗ₂ = 0. */
const det = (p: Params) => p.m1 * p.m2 - p.c12 * p.c21;
const asked = (p: Params) => (p.ask === 1 ? p.p1 : p.p2);
const other = (p: Params) => (p.ask === 1 ? p.p2 : p.p1);

const candidates = (p: Params): Distractor[] => {
  const [b1, b2] = constants(p);
  return [
    // Setting ṗᵢ = 0 but ignoring the other price: pᵢ = bᵢ/mᵢ.
    { value: round(p.ask === 1 ? b1 / p.m1 : b2 / p.m2, 2), mistakeCode: 'OWN_MARKET_ONLY' },
    // Solving Ap = b instead of Ap = −b flips the sign of the solution.
    { value: -asked(p), mistakeCode: 'SIGN_SOLVE' },
    { value: other(p), mistakeCode: 'OTHER_PRICE' },
  ];
};

/** DY05, difficulty 1: a steady-state price of two linked markets, ṗ = Ap + b with ṗ = 0. */
export const twoMarketSteadyStatePrice: Generator<Params> = {
  id: 'two-market-steady-state-price',
  title: 'Steady state of two linked markets',
  topicId: 'DY05',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const m1 = rng.int(1, 6);
      const m2 = rng.int(1, 6);
      const c12 = rng.pick([-3, -2, -1, 1, 2, 3]);
      const c21 = rng.pick([-3, -2, -1, 1, 2, 3]);
      const p: Params = {
        m1,
        m2,
        c12,
        c21,
        p1: rng.int(4, 60),
        p2: rng.int(4, 60),
        ask: rng.pick([1, 2] as const),
      };
      // Stable (trace −(m₁ + m₂) < 0 and det > 0), so prices really settle at p*.
      if (det(p) <= 0) continue;
      // Positive constants: with both prices at zero there is excess demand in both markets.
      const [b1, b2] = constants(p);
      if (b1 <= 0 || b2 <= 0) continue;
      if (cleanDistractors(asked(p), candidates(p), EXACT.tolerance, 0).length < 3) continue;
      return p;
    }
  },

  stem(p) {
    const [b1, b2] = constants(p);
    return `The prices of two related goods adjust to excess demand according to $\\dot p_1 = ${linear(
      b1,
      [
        [-p.m1, 'p_1'],
        [p.c12, 'p_2'],
      ],
    )}$ and $\\dot p_2 = ${linear(b2, [
      [p.c21, 'p_1'],
      [-p.m2, 'p_2'],
    ])}$. Find the steady-state price $p_${p.ask}^*$ of good ${p.ask}.`;
  },

  answer: (p) => ({ kind: 'numeric', value: asked(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [b1, b2] = constants(p);
    const D = det(p);
    const i = p.ask;
    const cramer =
      i === 1
        ? `p_1^* = \\dfrac{${num(b1)} \\cdot ${num(p.m2)} - ${paren(-p.c12)} \\cdot ${num(b2)}}{${num(D)}} = \\dfrac{${num(b1 * p.m2 + p.c12 * b2)}}{${num(D)}} = ${num(p.p1)}`
        : `p_2^* = \\dfrac{${num(p.m1)} \\cdot ${num(b2)} - ${paren(-p.c21)} \\cdot ${num(b1)}}{${num(D)}} = \\dfrac{${num(p.m1 * b2 + p.c21 * b1)}}{${num(D)}} = ${num(p.p2)}`;
    return [
      {
        text: 'Set both rates of change to zero and move the constants to the right.',
        latex: `${linear(null, [
          [p.m1, 'p_1'],
          [-p.c12, 'p_2'],
        ])} = ${num(b1)}, \\qquad ${linear(null, [
          [-p.c21, 'p_1'],
          [p.m2, 'p_2'],
        ])} = ${num(b2)}`,
        why: 'At a steady state neither price moves, so ṗ₁ = 0 and ṗ₂ = 0 hold at the same time: two linear equations in two unknowns.',
      },
      {
        text: 'Find the determinant of the coefficients.',
        latex: `\\det = ${num(p.m1)} \\cdot ${num(p.m2)} - ${paren(-p.c12)} \\cdot ${paren(-p.c21)} = ${num(D)}`,
        why: 'A non-zero determinant means the two lines cross in exactly one point, so there is exactly one steady state.',
        result: D,
      },
      {
        text: `Use Cramer's rule for p${i === 1 ? '₁' : '₂'}*.`,
        latex: cramer,
        why: `Replace column ${i} of the coefficients by the constants (${plain(b1)}, ${plain(b2)}) and divide that determinant by ${plain(D)}. This is the same as p* = −A⁻¹b for ṗ = Ap + b.`,
        result: asked(p),
      },
      {
        text: 'Check in both equations.',
        latex: `p^* = (${num(p.p1)},\\ ${num(p.p2)}): \\quad ${num(b1)} - ${num(p.m1)} \\cdot ${num(p.p1)} ${p.c12 < 0 ? '-' : '+'} ${num(Math.abs(p.c12))} \\cdot ${num(p.p2)} = 0, \\quad ${num(b2)} ${p.c21 < 0 ? '-' : '+'} ${num(Math.abs(p.c21))} \\cdot ${num(p.p1)} - ${num(p.m2)} \\cdot ${num(p.p2)} = 0`,
        why: `Both rates of change are zero there. The matrix of the system has trace ${plain(-p.m1 - p.m2)} < 0 and determinant ${plain(D)} > 0, so prices that start elsewhere move to this point.`,
      },
    ];
  },

  distractors: (p) => cleanDistractors(asked(p), candidates(p), EXACT.tolerance, 0),
};
