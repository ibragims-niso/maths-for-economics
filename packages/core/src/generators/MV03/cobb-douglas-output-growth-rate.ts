import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Exponents in tenths: α = alphaT/10 on capital, β = betaT/10 on labour, α + β ≤ 1. */
  alphaT: number;
  betaT: number;
  /** Growth rates of A, K and L in tenths of a per cent a year (gA = 15 means 1.5 %). */
  gA: number;
  gK: number;
  gL: number;
  /** Growth of total output, or of output per worker Y/L. */
  ask: 'output' | 'perWorker';
}

/** (α, β) in tenths, α ≠ β: constant returns (α + β = 1) and some decreasing-returns pairs. */
const PAIRS = [
  [2, 8],
  [3, 7],
  [4, 6],
  [3, 6],
  [4, 5],
  [2, 6],
] as const;

const alphaOf = (p: Params) => p.alphaT / 10;
const betaOf = (p: Params) => p.betaT / 10;
const gA = (p: Params) => p.gA / 10;
const gK = (p: Params) => p.gK / 10;
const gL = (p: Params) => p.gL / 10;

/** dY/Y = dA/A + α·dK/K + β·dL/L, in per cent. Whole-number arithmetic in hundredths avoids float noise. */
const outputGrowth = (p: Params) => (10 * p.gA + p.alphaT * p.gK + p.betaT * p.gL) / 100;
/** Growth of Y/L is the growth of Y minus the growth of L. */
const answerOf = (p: Params) =>
  round(p.ask === 'output' ? outputGrowth(p) : outputGrowth(p) - gL(p), 2);

const candidates = (p: Params): Distractor[] => {
  const perWorker = p.ask === 'perWorker' ? gL(p) : 0;
  const list: Distractor[] = [
    { value: round(gA(p) + gK(p) + gL(p) - perWorker, 2), mistakeCode: 'FORGOT_EXPONENTS' },
    {
      value: round(gA(p) + betaOf(p) * gK(p) + alphaOf(p) * gL(p) - perWorker, 2),
      mistakeCode: 'SWAPPED_SHARES',
    },
    {
      value: round(alphaOf(p) * gK(p) + betaOf(p) * gL(p) - perWorker, 2),
      mistakeCode: 'FORGOT_TFP',
    },
  ];
  if (p.ask === 'perWorker') {
    list.push({ value: round(outputGrowth(p), 2), mistakeCode: 'TOTAL_NOT_PER_WORKER' });
  }
  return list;
};

const wrongAnswers = (p: Params) => cleanDistractors(answerOf(p), candidates(p));

const pct = (tenths: number) => `${num(tenths / 10, 1)}\\%`;
/** A growth rate inside a product, in brackets when negative. */
const factor = (x: number) => (x < 0 ? `(${num(x, 1)})` : num(x, 1));

/** MV03, difficulty 2: the growth rate of Cobb–Douglas output (or output per worker) from the growth rates of A, K and L. */
export const cobbDouglasOutputGrowthRate: Generator<Params> = {
  id: 'cobb-douglas-output-growth-rate',
  title: 'Output growth from input growth',
  topicId: 'MV03',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const [alphaT, betaT] = rng.pick(PAIRS);
      const p: Params = {
        alphaT,
        betaT,
        gA: rng.int(5, 30),
        gK: rng.int(5, 80),
        gL: rng.int(-10, 30),
        ask: rng.pick(['output', 'perWorker'] as const),
      };
      if (p.gL === 0) continue;
      const g = answerOf(p);
      if (Math.abs(g) >= 0.2 && wrongAnswers(p).length >= 3) return p;
    }
  },

  stem(p) {
    const asked =
      p.ask === 'output'
        ? 'the growth rate of output $Y$'
        : 'the growth rate of output per worker $Y/L$';
    const labour =
      p.gL >= 0 ? `employment grows by $${pct(p.gL)}$` : `employment falls by $${pct(-p.gL)}$`;
    return `A country's output is $Y = A K^{${num(alphaOf(p))}} L^{${num(betaOf(p))}}$. Each year total factor productivity $A$ grows by $${pct(p.gA)}$, the capital stock $K$ by $${pct(p.gK)}$, and ${labour}. Treat these as small (instantaneous) growth rates and use the total differential to find ${asked}, in per cent a year. Give your answer to 2 decimal places.`;
  },

  answer: (p) => ({ kind: 'numeric', value: answerOf(p), decimals: 2 }),

  steps(p) {
    const a = num(alphaOf(p));
    const b = num(betaOf(p));
    const y = outputGrowth(p);
    const steps = [
      {
        text: 'Take the total differential and divide by Y.',
        latex: `\\dfrac{dY}{Y} = \\dfrac{dA}{A} + ${a}\\,\\dfrac{dK}{K} + ${b}\\,\\dfrac{dL}{L}`,
        why: `∂Y/∂K = ${a}·Y/K and ∂Y/∂L = ${b}·Y/L, and ∂Y/∂A = Y/A; dividing dY by Y turns each term into an exponent times a growth rate.`,
      },
      {
        text: 'Substitute the growth rates (in per cent).',
        latex: `\\dfrac{dY}{Y} = ${num(gA(p), 1)} + ${a} \\cdot ${factor(gK(p))} + ${b} \\cdot ${factor(gL(p))} = ${num(y)}\\%`,
        why: 'Each input adds its own growth rate weighted by its exponent; productivity growth adds one for one.',
        result: round(y, 2),
      },
    ];
    if (p.ask === 'output') return steps;
    return [
      ...steps,
      {
        text: 'Subtract the growth of employment.',
        latex: `\\dfrac{d(Y/L)}{Y/L} = \\dfrac{dY}{Y} - \\dfrac{dL}{L} = ${num(y)} - ${factor(gL(p))} = ${num(answerOf(p))}\\%`,
        why: 'The growth rate of a ratio is the growth rate of the top minus that of the bottom (C105).',
        result: answerOf(p),
      },
    ];
  },

  distractors: wrongAnswers,
};
