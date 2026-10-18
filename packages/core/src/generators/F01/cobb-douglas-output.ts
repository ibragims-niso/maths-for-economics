import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, exponentLatex, powerWorking } from './fractional-powers';

interface Params {
  /** Productivity factor. */
  A: number;
  /** Capital exponent α = aNum/aDen. */
  aNum: number;
  aDen: number;
  /** Labour exponent β = bNum/bDen. */
  bNum: number;
  bDen: number;
  /** K = kRoot^aDen and L = lRoot^bDen, so K^α and L^β are whole numbers. */
  kRoot: number;
  lRoot: number;
  /** Show the exponents as decimals (0.5, 0.25, 0.75); only for halves and quarters. */
  asDecimals: boolean;
}

/** (α, β) as [aNum, aDen, bNum, bDen]. α ≠ β, so swapping them is a visible mistake. */
const PAIRS = [
  [1, 3, 2, 3],
  [2, 3, 1, 3],
  [1, 4, 3, 4],
  [3, 4, 1, 4],
  [1, 2, 1, 4],
  [1, 4, 1, 2],
  [1, 2, 1, 3],
  [1, 3, 1, 2],
] as const;

/** Largest root for each denominator, so K and L stay readable (at most 1,296). */
const MAX_ROOT: Record<number, number> = { 2: 20, 3: 9, 4: 6 };

const capital = (p: Params) => p.kRoot ** p.aDen;
const labour = (p: Params) => p.lRoot ** p.bDen;
const output = (p: Params) => p.A * p.kRoot ** p.aNum * p.lRoot ** p.bNum;

const candidates = (p: Params): Distractor[] => {
  const alpha = p.aNum / p.aDen;
  const beta = p.bNum / p.bDen;
  return [
    {
      value: round(p.A * alpha * capital(p) * beta * labour(p), 2),
      mistakeCode: 'POWER_AS_PRODUCT',
    },
    {
      value: round(p.A * capital(p) ** beta * labour(p) ** alpha, 2),
      mistakeCode: 'EXPONENTS_SWAPPED',
    },
    // Only differs from the answer when a numerator is above 1 (e.g. 2/3, 3/4).
    { value: p.A * p.kRoot * p.lRoot, mistakeCode: 'NUMERATOR_IGNORED' },
  ];
};

const expectedCount = (p: Params) => (p.aNum > 1 || p.bNum > 1 ? 3 : 2);

/** F01, difficulty 2: output of a Cobb–Douglas production function with fractional exponents. */
export const cobbDouglasOutput: Generator<Params> = {
  id: 'cobb-douglas-output',
  title: 'Cobb–Douglas output',
  topicId: 'F01',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const [aNum, aDen, bNum, bDen] = rng.pick(PAIRS);
      const p: Params = {
        A: rng.int(2, 12),
        aNum,
        aDen,
        bNum,
        bDen,
        kRoot: rng.int(2, MAX_ROOT[aDen] ?? 2),
        lRoot: rng.int(2, MAX_ROOT[bDen] ?? 2),
        asDecimals: aDen % 2 === 0 && bDen % 2 === 0 && rng.int(0, 1) === 1,
      };
      if (capital(p) === labour(p)) continue;
      const kept = cleanDistractors(output(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length === expectedCount(p)) return p;
    }
  },

  stem: (p) => {
    const alpha = exponentLatex(p.aNum, p.aDen, p.asDecimals);
    const beta = exponentLatex(p.bNum, p.bDen, p.asDecimals);
    return `A firm's output is $Q = ${num(p.A)}K^{${alpha}}L^{${beta}}$, where $K$ is capital and $L$ is labour. How much does it produce with $K = ${num(capital(p))}$ and $L = ${num(labour(p))}$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: output(p), decimals: 0, ...EXACT }),

  steps(p) {
    const kTerm = p.kRoot ** p.aNum;
    const lTerm = p.lRoot ** p.bNum;
    // Plain text (step text is not rendered as LaTeX): "K^0.25 = K^(1/4)" or "K^(1/3)".
    const term = (input: string, n: number, d: number) =>
      p.asDecimals ? `${input}^${n / d} = ${input}^(${n}/${d})` : `${input}^(${n}/${d})`;
    return [
      {
        text: `Work out the capital term ${term('K', p.aNum, p.aDen)}.`,
        latex: `${num(capital(p))}^{${p.aNum}/${p.aDen}} = ${powerWorking(p.kRoot, p.aNum, p.aDen)}`,
        why: 'An exponent p/q means: take the q-th root, then raise the result to the power p. Taking the root first keeps the numbers small.',
        result: kTerm,
      },
      {
        text: `Work out the labour term ${term('L', p.bNum, p.bDen)}.`,
        latex: `${num(labour(p))}^{${p.bNum}/${p.bDen}} = ${powerWorking(p.lRoot, p.bNum, p.bDen)}`,
        why: 'The same rule applies to labour, with its own exponent β.',
        result: lTerm,
      },
      {
        text: 'Multiply the productivity factor by the two terms.',
        latex: `Q = ${num(p.A)} \\cdot ${num(kTerm)} \\cdot ${num(lTerm)} = ${num(output(p))}`,
        why: 'In a Cobb–Douglas function the inputs enter as a product, so output is A × K^α × L^β.',
        result: output(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(output(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
