import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { EXACT, powerWorking } from '../F01/fractional-powers';
import { cleanDistractors, num } from '../format';

interface Params {
  /** 'utility': U(x, y) of two goods; 'production': Q(K, L) of capital and labour. */
  context: 'utility' | 'production';
  /** The coefficient in front, e.g. 4 in Q = 4K^(1/2)L^(1/2). */
  A: number;
  /** Exponent of the first input, aNum/aDen. */
  aNum: number;
  aDen: number;
  /** Exponent of the second input, bNum/bDen. */
  bNum: number;
  bDen: number;
  /** First input = firstRoot^aDen and second = secondRoot^bDen, so both powers are whole. */
  firstRoot: number;
  secondRoot: number;
}

/** Exponent pairs [aNum, aDen, bNum, bDen]; all are textbook Cobb–Douglas shapes. */
const PAIRS = [
  [1, 2, 1, 2],
  [1, 3, 2, 3],
  [2, 3, 1, 3],
  [1, 4, 3, 4],
  [3, 4, 1, 4],
  [1, 2, 1, 4],
  [1, 4, 1, 2],
] as const;

/** Largest root for each denominator, so the inputs stay readable (at most 256). */
const MAX_ROOT: Record<number, number> = { 2: 15, 3: 6, 4: 4 };

const names = (p: Params) =>
  p.context === 'utility' ? (['x', 'y'] as const) : (['K', 'L'] as const);
const first = (p: Params) => p.firstRoot ** p.aDen;
const second = (p: Params) => p.secondRoot ** p.bDen;
const firstTerm = (p: Params) => p.firstRoot ** p.aNum;
const secondTerm = (p: Params) => p.secondRoot ** p.bNum;
/** The level of the curve through the point: the answer. */
const level = (p: Params) => p.A * firstTerm(p) * secondTerm(p);

const candidates = (p: Params): Distractor[] => [
  {
    value: round(p.A * first(p) ** (p.bNum / p.bDen) * second(p) ** (p.aNum / p.aDen), 2),
    mistakeCode: 'EXPONENTS_SWAPPED',
  },
  { value: p.A * (firstTerm(p) + secondTerm(p)), mistakeCode: 'ADDED_NOT_MULTIPLIED' },
  { value: firstTerm(p) * secondTerm(p), mistakeCode: 'FORGOT_COEFFICIENT' },
];

/** MV01, difficulty 1: the level c of the indifference curve or isoquant through a given point. */
export const levelCurveThroughPoint: Generator<Params> = {
  id: 'level-curve-through-point',
  title: 'Level curve through a point',
  topicId: 'MV01',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const [aNum, aDen, bNum, bDen] = rng.pick(PAIRS);
      const p: Params = {
        context: rng.pick(['utility', 'production'] as const),
        A: rng.int(2, 12),
        aNum,
        aDen,
        bNum,
        bDen,
        firstRoot: rng.int(2, MAX_ROOT[aDen] ?? 2),
        secondRoot: rng.int(2, MAX_ROOT[bDen] ?? 2),
      };
      if (first(p) === second(p)) continue;
      const kept = cleanDistractors(level(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length >= 2) return p;
    }
  },

  stem: (p) => {
    const [u, v] = names(p);
    const fn = `${num(p.A)}${u}^{${p.aNum}/${p.aDen}}${v}^{${p.bNum}/${p.bDen}}`;
    return p.context === 'utility'
      ? `A consumer's utility from $x$ units of food and $y$ units of clothing is $U(x, y) = ${fn}$. Which indifference curve $U = c$ passes through the bundle $x = ${num(first(p))}$, $y = ${num(second(p))}$? Find $c$.`
      : `A firm's output is $Q(K, L) = ${fn}$, where $K$ is capital and $L$ is labour. Which isoquant $Q = c$ passes through the input mix $K = ${num(first(p))}$, $L = ${num(second(p))}$? Find $c$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: level(p), decimals: 0, ...EXACT }),

  steps(p) {
    const [u, v] = names(p);
    const f = p.context === 'utility' ? 'U' : 'Q';
    return [
      {
        text: `Work out the first power, ${u}^(${p.aNum}/${p.aDen}).`,
        latex: `${num(first(p))}^{${p.aNum}/${p.aDen}} = ${powerWorking(p.firstRoot, p.aNum, p.aDen)}`,
        why: 'An exponent p/q means: take the q-th root, then raise it to the power p.',
        result: firstTerm(p),
      },
      {
        text: `Work out the second power, ${v}^(${p.bNum}/${p.bDen}).`,
        latex: `${num(second(p))}^{${p.bNum}/${p.bDen}} = ${powerWorking(p.secondRoot, p.bNum, p.bDen)}`,
        why: 'Each input has its own exponent; the exponent belongs to the letter it sits on.',
        result: secondTerm(p),
      },
      {
        text: 'Multiply the coefficient by the two powers.',
        latex: `${f} = ${num(p.A)} \\cdot ${num(firstTerm(p))} \\cdot ${num(secondTerm(p))} = ${num(level(p))}`,
        why: 'The level curve through a point is the curve f = c whose level c is the value of the function at that point.',
        result: level(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(level(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
