import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { EXACT, plainFrac } from './technology';

interface Params {
  /** Q = A·K^α·L^β with α = a/100 and β = b/100. */
  A: number;
  a: number;
  b: number;
  /** The old output and its minimum cost. */
  Q1: number;
  C1: number;
  /** The new output Q2 = Q1·tn/td; the cost changes by the factor (tn/td)^(1/(α + β)) = fn/fd. */
  Q2: number;
  tn: number;
  td: number;
  fn: number;
  fd: number;
  /** Both input prices are multiplied by pc/100 (100 = unchanged). */
  pc: number;
}

/** Returns to scale and the output ratios t whose power t^(1/(α + β)) is a whole fraction. */
interface Scale {
  /** Pairs of exponents (α, β) in hundredths with the same sum. */
  pairs: [number, number][];
  /** Output ratio tn/td and its power fn/fd = (tn/td)^(1/(α + β)). */
  ratios: [number, number, number, number][];
}

const SCALES: Scale[] = [
  {
    pairs: [
      [25, 25],
      [20, 30],
      [30, 20],
      [10, 40],
    ],
    // α + β = 0.5: the cost factor is t².
    ratios: [
      [2, 1, 4, 1],
      [3, 1, 9, 1],
      [4, 1, 16, 1],
      [1, 2, 1, 4],
      [3, 2, 9, 4],
    ],
  },
  {
    pairs: [
      [25, 50],
      [50, 25],
      [40, 35],
      [30, 45],
    ],
    // α + β = 0.75: the cost factor is t^(4/3).
    ratios: [
      [8, 1, 16, 1],
      [1, 8, 1, 16],
    ],
  },
  {
    pairs: [
      [50, 100],
      [75, 75],
      [60, 90],
      [100, 50],
    ],
    // α + β = 1.5: the cost factor is t^(2/3).
    ratios: [
      [8, 1, 4, 1],
      [27, 1, 9, 1],
      [1, 8, 1, 4],
    ],
  },
  {
    pairs: [
      [100, 100],
      [80, 120],
      [120, 80],
    ],
    // α + β = 2: the cost factor is t^(1/2).
    ratios: [
      [4, 1, 2, 1],
      [9, 1, 3, 1],
      [16, 1, 4, 1],
      [1, 4, 1, 2],
      [9, 4, 3, 2],
    ],
  },
];

const PRICE_CHANGES = [100, 100, 100, 110, 120, 125, 150, 200] as const;

const degree = (p: Params) => (p.a + p.b) / 100;
const outputRatio = (p: Params) => p.tn / p.td;
const priceFactor = (p: Params) => p.pc / 100;
const value = (p: Params) => (p.C1 * p.pc * p.fn) / (100 * p.fd);

function candidates(p: Params) {
  const t = outputRatio(p);
  const list = [
    // Cost in proportion to output, as under constant returns.
    { value: round(p.C1 * priceFactor(p) * t, 2), mistakeCode: 'CRS_ASSUMED' },
    // The power α + β instead of 1/(α + β).
    { value: round(p.C1 * priceFactor(p) * t ** degree(p), 2), mistakeCode: 'DEGREE_NOT_INVERTED' },
  ];
  if (p.pc !== 100)
    list.push({ value: round((p.C1 * p.fn) / p.fd, 2), mistakeCode: 'PRICES_IGNORED' });
  return list;
}

/** "0.25" for 25: an exponent in hundredths. */
const hundredths = (x: number) => num(x / 100);
const exponent = (x: number) => (x === 100 ? '' : `^{${hundredths(x)}}`);
const fraction = (top: number, bottom: number) =>
  bottom === 1 ? `${top}` : `\\tfrac{${top}}{${bottom}}`;

/** MV11, difficulty 1: the minimum cost of a new output level from C(w, r, Q) ∝ Q^(1/(α+β)). */
export const costFunctionOutputScaling: Generator<Params> = {
  id: 'cost-function-output-scaling',
  title: 'Cost of a new output level',
  topicId: 'MV11',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const scale = rng.pick(SCALES);
      const [a, b] = rng.pick(scale.pairs);
      const [tn, td, fn, fd] = rng.pick(scale.ratios);
      const Q1 = td * rng.int(1, Math.floor(1000 / td)) * (rng.int(0, 1) === 0 ? 1 : 10);
      const Q2 = (Q1 * tn) / td;
      if (Q1 < 10 || Q2 < 10 || Q1 > 5000 || Q2 > 20000) continue;
      const C1 = 10 * rng.int(10, 5000);
      const pc = rng.pick(PRICE_CHANGES);
      const p: Params = { A: rng.int(1, 6), a, b, Q1, C1, Q2, tn, td, fn, fd, pc };
      // The new cost must be a whole number between 100 and 1,000,000.
      if ((C1 * pc * fn) % (100 * fd) !== 0) continue;
      if (value(p) < 100 || value(p) > 1_000_000) continue;
      const kept = cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 2 || kept.some((d) => d.value <= 0)) continue;
      return p;
    }
  },

  stem: (p) => {
    const prices =
      p.pc === 100
        ? 'Input prices do not change.'
        : p.pc === 200
          ? 'Both the wage and the machine rental double.'
          : `Both the wage and the machine rental rise by ${p.pc - 100} %.`;
    return `A firm produces $Q = ${p.A === 1 ? '' : num(p.A)}K${exponent(p.a)}L${exponent(p.b)}$ and always uses the cheapest mix of capital $K$ and labour $L$. Producing $${num(p.Q1)}$ units costs it $${num(p.C1)}$ at the current input prices. ${prices} What is the minimum cost of producing $${num(p.Q2)}$ units?`;
  },

  answer: (p) => ({ kind: 'numeric', value: value(p), decimals: 0, ...EXACT }),

  steps(p) {
    const s = degree(p);
    const kind = s < 1 ? 'decreasing' : 'increasing';
    const inv = plainFrac(100, p.a + p.b);
    const steps: Step[] = [
      {
        text: 'Find the degree of homogeneity, α + β, and the power of Q in the cost function.',
        latex: `\\alpha + \\beta = ${hundredths(p.a)} + ${hundredths(p.b)} = ${num(s)} \\;\\Rightarrow\\; C(w, r, Q) \\propto Q^{1/(\\alpha + \\beta)} = Q^{${inv}}`,
        why: `Output is homogeneous of degree ${num(s)} in the inputs, so there are ${kind} returns to scale. To multiply output by t the firm multiplies both inputs by t^(1/(α + β)), and cost grows by that factor too.`,
      },
      {
        text: 'Raise the output ratio to the power 1/(α + β).',
        latex: `\\left(\\dfrac{${num(p.Q2)}}{${num(p.Q1)}}\\right)^{${inv}} = \\left(${fraction(p.tn, p.td)}\\right)^{${inv}} =${fraction(p.fn, p.fd)}`,
        why:
          s < 1
            ? 'With decreasing returns, cost grows faster than output, so average cost rises.'
            : 'With increasing returns, cost grows more slowly than output, so average cost falls.',
        result: p.fn / p.fd,
      },
    ];
    if (p.pc !== 100)
      steps.push({
        text: 'Scale for the input prices.',
        latex: `C(\\theta w, \\theta r, Q) = \\theta\\, C(w, r, Q), \\quad \\theta = ${num(priceFactor(p))}`,
        why: 'When every input price is multiplied by θ the cheapest mix of inputs does not change, so the bill is multiplied by θ: the cost function is homogeneous of degree 1 in prices.',
        result: priceFactor(p),
      });
    steps.push({
      text: 'Multiply the old cost by the factors.',
      latex: `C = ${num(p.C1)}\\cdot ${fraction(p.fn, p.fd)}${p.pc === 100 ? '' : `\\cdot ${num(priceFactor(p))}`} = ${num(value(p))}`,
      why: 'The constant A and the price levels cancel out of the ratio of two costs, so only the changes in output and prices matter.',
      result: value(p),
    });
    return steps;
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
