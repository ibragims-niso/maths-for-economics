import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Output Q(L) = kL (linear) or Q(L) = k√L (square root, diminishing returns). */
  form: 'linear' | 'sqrt';
  k: number;
  /** Number of workers; a perfect square in the square-root form, so output is whole. */
  labour: number;
  fixedCost: number;
  unitCost: number;
}

const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

/** The production function Q(L), at any input (also used for the wrong-order mistake). */
const outputOf = (p: Params, x: number) => (p.form === 'linear' ? p.k * x : p.k * Math.sqrt(x));
/** The cost function C(Q) = F + cQ. */
const costOf = (p: Params, q: number) => p.fixedCost + p.unitCost * q;
const answerOf = (p: Params) => costOf(p, outputOf(p, p.labour));

/** Q(L) as LaTeX, with x (the letter L or a number) in place of L. */
const outputTex = (p: Params, x: string) => {
  if (p.form === 'sqrt') return `${num(p.k)}\\sqrt{${x}}`;
  return x === 'L' ? `${num(p.k)}L` : `${num(p.k)} \\cdot ${x}`;
};

/** F10, difficulty 2: evaluate the composite C(Q(L)), the cost of what L workers produce. */
export const compositeCostOfLabour: Generator<Params> = {
  id: 'composite-cost-of-labour',
  title: 'Cost of output made by workers',
  topicId: 'F10',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    const fixedCost = rng.int(5, 200) * 50;
    const unitCost = rng.int(2, 40);
    if (rng.next() < 0.5) {
      return { form: 'linear', k: rng.int(2, 25), labour: rng.int(5, 80), fixedCost, unitCost };
    }
    for (;;) {
      const k = rng.int(4, 30);
      const root = rng.int(2, 20);
      // k = √L would make "put L straight into C" give the right answer by luck.
      if (k !== root) return { form: 'sqrt', k, labour: root * root, fixedCost, unitCost };
    }
  },

  stem: (p) =>
    `A workshop that employs $L$ workers produces $Q(L) = ${outputTex(p, 'L')}$ units, and producing $Q$ units costs $C(Q) = ${num(p.fixedCost)} + ${num(p.unitCost)}Q$. Find $C(Q(${num(p.labour)}))$, the cost of producing what $${num(p.labour)}$ workers make.`,

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2, ...MONEY }),

  steps(p) {
    const q = outputOf(p, p.labour);
    const composite =
      p.form === 'linear'
        ? `${num(p.fixedCost)} + ${num(p.unitCost * p.k)}L`
        : `${num(p.fixedCost)} + ${num(p.unitCost * p.k)}\\sqrt{L}`;
    return [
      {
        text: 'Apply the inner function first: the output of the workers.',
        latex: `Q(${num(p.labour)}) = ${outputTex(p, num(p.labour))} = ${num(q)}`,
        why: 'In C(Q(L)) the function nearest to L acts first: workers produce output, and only then does output have a cost.',
        result: q,
      },
      {
        text: 'Apply the outer function to that output.',
        latex: `C(${num(q)}) = ${num(p.fixedCost)} + ${num(p.unitCost)} \\cdot ${num(q)} = ${num(answerOf(p))}`,
        why: 'The output of the inner function becomes the input of the outer one.',
        result: answerOf(p),
      },
      {
        text: 'Check with the composite function written out in terms of L.',
        latex: `C(Q(L)) = ${num(p.fixedCost)} + ${num(p.unitCost)} \\cdot ${outputTex(p, 'L')} = ${composite} \\;\\Rightarrow\\; C(Q(${num(p.labour)})) = ${num(answerOf(p))}`,
        why: 'Replacing Q in the cost function by the formula for Q(L) gives cost directly as a function of the number of workers.',
        result: answerOf(p),
      },
    ];
  },

  distractors(p) {
    const wrongOrder = outputOf(p, costOf(p, p.labour));
    return cleanDistractors(
      answerOf(p),
      [
        { value: costOf(p, p.labour), mistakeCode: 'SKIPPED_INNER' },
        { value: round(wrongOrder, 2), mistakeCode: 'WRONG_ORDER' },
        {
          value: costOf(p, p.labour) * outputOf(p, p.labour),
          mistakeCode: 'MULTIPLIED_FUNCTIONS',
        },
      ],
      MONEY.tolerance,
      MONEY.relTolerance,
    );
  },
};
