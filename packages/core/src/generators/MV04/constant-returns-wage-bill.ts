import { round } from '../../engine/grading';
import type { Rng } from '../../engine/rng';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

/** Money answers: almost exact, like FM01. */
const MONEY = { tolerance: 0.05, relTolerance: 0.00005 } as const;

interface Params {
  /** Productivity factor in Q = A·K^α·L^(1−α). */
  A: number;
  /** Capital's exponent in quarters: α = alphaQ/4, labour's is 1 − α (constant returns). */
  alphaQ: number;
  /** K = kRoot^kPower and L = lRoot^lPower, chosen so K^α and L^β are whole numbers. */
  kRoot: number;
  kPower: number;
  lRoot: number;
  lPower: number;
  /** Price of one unit of output. */
  P: number;
}

const alphaOf = (p: Params) => p.alphaQ / 4;
const betaOf = (p: Params) => (4 - p.alphaQ) / 4;
const capital = (p: Params) => p.kRoot ** p.kPower;
const labour = (p: Params) => p.lRoot ** p.lPower;
const kTerm = (p: Params) => p.kRoot ** ((p.alphaQ * p.kPower) / 4);
const lTerm = (p: Params) => p.lRoot ** (((4 - p.alphaQ) * p.lPower) / 4);
const output = (p: Params) => p.A * kTerm(p) * lTerm(p);
/** MP_L = β·Q/L; the competitive wage is its value P·MP_L. */
const mpl = (p: Params) => (betaOf(p) * output(p)) / labour(p);
const wage = (p: Params) => p.P * mpl(p);
/** Wage bill w·L = β·P·Q: labour's share β of revenue. */
const wageBill = (p: Params) => round(wage(p) * labour(p), 2);

const candidates = (p: Params): Distractor[] => [
  { value: round(alphaOf(p) * p.P * output(p), 2), mistakeCode: 'WRONG_SHARE' },
  { value: round(wage(p), 2), mistakeCode: 'WAGE_NOT_BILL' },
  { value: round(mpl(p) * labour(p), 2), mistakeCode: 'FORGOT_PRICE' },
  { value: round(p.P * output(p), 2), mistakeCode: 'REVENUE_NOT_SHARE' },
];

const wrongAnswers = (p: Params) =>
  cleanDistractors(wageBill(p), candidates(p), MONEY.tolerance, MONEY.relTolerance);

/** A perfect square for an exponent of 1/2, a perfect fourth power for 1/4 or 3/4. */
const drawLevel = (rng: Rng, quarters: number) =>
  quarters === 2 ? { root: rng.int(2, 20), power: 2 } : { root: rng.int(2, 5), power: 4 };

/** MV04, difficulty 2: the total wage bill β·P·Q of a constant-returns Cobb–Douglas firm. */
export const constantReturnsWageBill: Generator<Params> = {
  id: 'constant-returns-wage-bill',
  title: 'Wage bill under constant returns',
  topicId: 'MV04',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const alphaQ = rng.int(1, 3);
      const k = drawLevel(rng, alphaQ);
      const l = drawLevel(rng, 4 - alphaQ);
      const p: Params = {
        A: rng.int(1, 12),
        alphaQ,
        kRoot: k.root,
        kPower: k.power,
        lRoot: l.root,
        lPower: l.power,
        P: rng.int(2, 25),
      };
      if (capital(p) === labour(p)) continue;
      if (output(p) > 20000 || wage(p) < 0.5) continue;
      if (wrongAnswers(p).length >= 3) return p;
    }
  },

  stem(p) {
    const coefficient = p.A === 1 ? '' : num(p.A);
    return `In a competitive industry a firm's output is $Q = ${coefficient}K^{${num(alphaOf(p))}}L^{${num(betaOf(p))}}$. It uses $K = ${num(capital(p))}$ machines and $L = ${num(labour(p))}$ workers and sells its output at a price of $${num(p.P)}$ per unit. Each worker is paid the value of the marginal product of labour, $P \\times MP_L$. What is the firm's total wage bill?`;
  },

  answer: (p) => ({ kind: 'numeric', value: wageBill(p), decimals: 2, ...MONEY }),

  steps(p) {
    const A = num(p.A);
    const a = num(alphaOf(p));
    const b = num(betaOf(p));
    const q = output(p);
    return [
      {
        text: 'Work out output.',
        latex: `Q = ${A} \\cdot ${num(capital(p))}^{${a}} \\cdot ${num(labour(p))}^{${b}} = ${A} \\cdot ${num(kTerm(p))} \\cdot ${num(lTerm(p))} = ${num(q)}`,
        why: `The exponents add up to ${a} + ${b} = 1, so the function is homogeneous of degree 1: constant returns to scale.`,
        result: q,
      },
      {
        text: 'Find the marginal product of labour.',
        latex: `MP_L = ${b}\\,\\dfrac{Q}{L} = ${b} \\cdot \\dfrac{${num(q)}}{${num(labour(p))}} = ${num(mpl(p), 4)}`,
        why: 'Differentiating A·K^α·L^β with respect to L gives β·Q/L (MV02).',
        result: round(mpl(p), 4),
      },
      {
        text: 'The wage is the value of that marginal product.',
        latex: `w = P \\cdot MP_L = ${num(p.P)} \\times ${num(mpl(p), 4)} = ${num(wage(p), 4)}`,
        why: 'A competitive firm hires workers until one more worker adds exactly as much revenue as the wage.',
        result: round(wage(p), 4),
      },
      {
        text: 'Multiply by the number of workers.',
        latex: `w \\cdot L = ${num(wage(p), 4)} \\times ${num(labour(p))} = ${num(wageBill(p))} = ${b} \\times ${num(p.P)} \\times ${num(q)}`,
        why: `Labour receives the share β = ${b} of revenue P·Q; by Euler's theorem capital receives the other ${a}, and nothing is left over.`,
        result: wageBill(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
