import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, exponentLatex, powerWorking, rootLatex } from './fractional-powers';

interface Params {
  /** Productivity factor. */
  A: number;
  /** Capital exponent α = aNum/aDen. */
  aNum: number;
  aDen: number;
  /** Labour exponent β = bNum/bDen. */
  bNum: number;
  bDen: number;
  /** K = kRoot^aDen; the answer is L = lRoot^bDen, drawn first so it is a whole number. */
  kRoot: number;
  lRoot: number;
  /** Show the exponents as decimals (0.5, 0.25, 0.75); only for halves and quarters. */
  asDecimals: boolean;
}

/** (α, β) as [aNum, aDen, bNum, bDen]. */
const PAIRS = [
  [1, 2, 1, 2],
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
/** The labour needed: the answer. */
const labour = (p: Params) => p.lRoot ** p.bDen;
const output = (p: Params) => p.A * p.kRoot ** p.aNum * p.lRoot ** p.bNum;
/** The value of L^β once it is isolated. */
const labourTerm = (p: Params) => p.lRoot ** p.bNum;

const candidates = (p: Params): Distractor[] => {
  const beta = p.bNum / p.bDen;
  return [
    { value: labourTerm(p), mistakeCode: 'STOPPED_AT_POWER' },
    { value: round(labourTerm(p) ** beta, 2), mistakeCode: 'WRONG_INVERSE_POWER' },
    { value: round(labourTerm(p) / beta, 2), mistakeCode: 'POWER_AS_PRODUCT' },
  ];
};

/** F01, difficulty 3: rearrange Q = A·K^α·L^β for the labour needed to reach a target output. */
export const cobbDouglasLabourNeeded: Generator<Params> = {
  id: 'cobb-douglas-labour-needed',
  title: 'Labour needed for a target output',
  topicId: 'F01',
  difficulty: 3,
  timeSec: 180,

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
      const kept = cleanDistractors(labour(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) => {
    const alpha = exponentLatex(p.aNum, p.aDen, p.asDecimals);
    const beta = exponentLatex(p.bNum, p.bDen, p.asDecimals);
    return `A firm's output is $Q = ${num(p.A)}K^{${alpha}}L^{${beta}}$, where $K$ is capital and $L$ is labour. It has $K = ${num(capital(p))}$. How many units of labour does it need to produce $Q = ${num(output(p))}$?`;
  },

  answer: (p) => ({ kind: 'numeric', value: labour(p), decimals: 0, ...EXACT }),

  steps(p) {
    const kTerm = p.kRoot ** p.aNum;
    const lTerm = labourTerm(p);
    const beta = `${p.bNum}/${p.bDen}`;
    const inverse = p.bNum === 1 ? `${p.bDen}` : `${p.bDen}/${p.bNum}`;
    // Plain text (step text is not rendered as LaTeX): "K^0.25 = K^(1/4)" or "K^(1/3)".
    const term = (input: string, n: number, d: number) =>
      p.asDecimals ? `${input}^${n / d} = ${input}^(${n}/${d})` : `${input}^(${n}/${d})`;
    const undo =
      p.bNum === 1
        ? `L = ${num(lTerm)}^{${p.bDen}} = ${num(labour(p))}`
        : `L = ${num(lTerm)}^{${inverse}} = \\left(${rootLatex(p.bNum, lTerm)}\\right)^{${p.bDen}} = ${num(p.lRoot)}^{${p.bDen}} = ${num(labour(p))}`;
    return [
      {
        text: `Work out the capital term ${term('K', p.aNum, p.aDen)}.`,
        latex: `${num(capital(p))}^{${p.aNum}/${p.aDen}} = ${powerWorking(p.kRoot, p.aNum, p.aDen)}`,
        why: 'An exponent p/q means: take the q-th root, then raise the result to the power p.',
        result: kTerm,
      },
      {
        text: `Isolate the labour term ${term('L', p.bNum, p.bDen)}.`,
        latex: `L^{${beta}} = \\dfrac{${num(output(p))}}{${num(p.A)} \\cdot ${num(kTerm)}} = ${num(lTerm)}`,
        why: 'Divide both sides by everything that multiplies the labour term, so that it stands alone.',
        result: lTerm,
      },
      {
        text: `Raise both sides to the power ${inverse} to undo the power ${beta}.`,
        latex: undo,
        why: `(L^β)^(1/β) = L^(β × 1/β) = L¹, because a power of a power multiplies the exponents: ${beta} × ${inverse} = 1.`,
        result: labour(p),
      },
      {
        text: 'Check by putting the answer back into the production function.',
        latex: `${num(p.A)} \\cdot ${num(kTerm)} \\cdot ${num(labour(p))}^{${beta}} = ${num(p.A)} \\cdot ${num(kTerm)} \\cdot ${num(lTerm)} = ${num(output(p))}`,
        why: 'Substituting back is the surest way to catch a slip when rearranging.',
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(labour(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
