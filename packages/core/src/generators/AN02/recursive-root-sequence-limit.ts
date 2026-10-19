import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** The limit, drawn first; the constant is then a = L(L − b). */
  L: number;
  /** The coefficient of xₙ under the square root. */
  b: number;
  /** The starting value x₁ (below L, so the sequence rises). */
  x1: number;
}

const EXACT = { tolerance: 0.01, relTolerance: 0 } as const;

/** The constant under the root, chosen so that L solves L² = a + bL. */
export const constantOf = (p: Pick<Params, 'L' | 'b'>) => p.L * (p.L - p.b);

/** One step of the rule xₙ₊₁ = √(a + b·xₙ). */
export const nextTerm = (p: Pick<Params, 'L' | 'b'>, x: number) =>
  Math.sqrt(constantOf(p) + p.b * x);

const rule = (p: Params) =>
  `x_{n+1} = \\sqrt{${num(constantOf(p))} + ${p.b === 1 ? '' : num(p.b)}x_n}`;

function candidates(p: Params) {
  return [
    { value: p.b - p.L, mistakeCode: 'NEGATIVE_ROOT' },
    { value: constantOf(p), mistakeCode: 'CONSTANT_AS_LIMIT' },
    { value: round(nextTerm(p, p.x1), 2), mistakeCode: 'ONE_STEP' },
  ];
}

/** AN02, difficulty 3: the limit of xₙ₊₁ = √(a + b·xₙ), the positive root of L² − bL − a = 0. */
export const recursiveRootSequenceLimit: Generator<Params> = {
  id: 'recursive-root-sequence-limit',
  title: 'Limit of a recursive sequence',
  topicId: 'AN02',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const b = rng.int(1, 4);
      // L − b ≥ 2 keeps a = L(L − b) different from L.
      const L = rng.int(b + 2, b + 15);
      const p: Params = { L, b, x1: rng.int(0, 4) };
      if (p.x1 >= L) continue;
      if (cleanDistractors(L, candidates(p), EXACT.tolerance, EXACT.relTolerance).length < 3)
        continue;
      return p;
    }
  },

  stem: (p) =>
    `An algorithm searching for an equilibrium value starts from $x_1 = ${p.x1}$ and updates its estimate by $${rule(p)}$. The sequence is increasing and bounded above, so it converges. Find its limit.`,

  answer: (p) => ({ kind: 'numeric', value: p.L, decimals: 2, ...EXACT }),

  steps(p) {
    const a = constantOf(p);
    const bx = p.b === 1 ? '' : num(p.b);
    const disc = p.b * p.b + 4 * a;
    const root = Math.sqrt(disc);
    return [
      {
        text: 'Let n → ∞ on both sides of the rule.',
        latex: `L = \\sqrt{${num(a)} + ${bx}L}`,
        why: 'If xₙ → L then xₙ₊₁ → L as well (it is the same sequence, one step later), and the square root changes smoothly, so the limit must satisfy the rule itself.',
      },
      {
        text: 'Square both sides and collect the terms.',
        latex: `L^2 - ${bx}L - ${num(a)} = 0`,
        why: 'Squaring removes the root and leaves a quadratic equation in L.',
      },
      {
        text: 'Solve the quadratic.',
        latex: `L = \\frac{${num(p.b)} \\pm \\sqrt{${num(p.b)}^2 + 4 \\cdot ${num(a)}}}{2} = \\frac{${num(p.b)} \\pm ${num(root)}}{2}`,
        why: `The discriminant is ${disc} = ${root}², so the two roots are ${p.L} and −${p.L - p.b}.`,
        result: root,
      },
      {
        text: 'Keep the root that the sequence can reach.',
        latex: `L = ${p.L}`,
        why: `Every term is a square root, so xₙ ≥ 0 and the limit cannot be negative; the root −${p.L - p.b} came in when we squared. Check: √(${a} + ${p.b}·${p.L}) = √${p.L * p.L} = ${p.L}.`,
        result: p.L,
      },
    ];
  },

  distractors: (p) => cleanDistractors(p.L, candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
