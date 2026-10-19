import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { inputSteps } from './cobb-douglas-conditional-labour';
import {
  type CostMin,
  drawCostMin,
  EXACT,
  labourAtRatio,
  minCost,
  plainFrac,
  technologyLatex,
} from './technology';

interface Params extends CostMin {
  /** Total cost C(w, r, Q̄), or average cost C/Q̄ to 2 decimals. */
  ask: 'total' | 'average';
}

const value = (p: Params) => (p.ask === 'total' ? minCost(p) : round(minCost(p) / p.Q, 2));

/** The cost of producing Q̄ with capital per worker fixed at `ratio`. */
const costAtRatio = (p: Params, ratio: number) => {
  const L = labourAtRatio(p, ratio);
  return p.w * L + p.r * ratio * L;
};

function candidates(p: Params) {
  const per = p.ask === 'total' ? 1 : p.Q;
  const list = [
    // Equal amounts of both inputs: K = L.
    { value: round(costAtRatio(p, 1) / per, 2), mistakeCode: 'EQUAL_INPUTS' },
    // Only the wage bill counted.
    { value: round((p.w * p.L) / per, 2), mistakeCode: 'LABOUR_COST_ONLY' },
    // Price ratio upside down: K/L = αr/(βw).
    {
      value: round(costAtRatio(p, (p.i * p.r) / (p.j * p.w)) / per, 2),
      mistakeCode: 'INVERTED_PRICE_RATIO',
    },
  ];
  if (p.ask === 'average') list.push({ value: minCost(p), mistakeCode: 'TOTAL_NOT_AVERAGE' });
  return list;
}

/** MV11, difficulty 3: the minimum total (or average) cost of an output target with Q = A·K^α·L^β. */
export const cobbDouglasMinimumCost: Generator<Params> = {
  id: 'cobb-douglas-minimum-cost',
  title: 'Minimum cost of an output target',
  topicId: 'MV11',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const base = drawCostMin(rng);
      if (!base) continue;
      const p: Params = { ...base, ask: rng.pick(['total', 'total', 'average'] as const) };
      // Average cost: exact to 2 decimals and at least 0.5, so the answers stay apart.
      if (p.ask === 'average' && (minCost(p) < 0.5 * p.Q || (100 * minCost(p)) % p.Q !== 0))
        continue;
      const kept = cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 3 || kept.some((d) => d.value <= 0)) continue;
      return p;
    }
  },

  stem: (p) =>
    `A factory makes $Q = ${technologyLatex(p)}$ units a day with $K$ machines and $L$ workers, paying $w = ${num(p.w)}$ per worker and $r = ${num(p.r)}$ per machine a day. What is the ${p.ask === 'total' ? 'minimum total cost $C$' : 'average cost $C/\\bar Q$ per unit'} of producing $\\bar Q = ${num(p.Q)}$ units a day?${p.ask === 'average' ? ' Give your answer to 2 decimal places.' : ''}`,

  answer: (p) => ({
    kind: 'numeric',
    value: value(p),
    decimals: p.ask === 'total' ? 0 : 2,
    ...EXACT,
  }),

  steps(p) {
    const C = minCost(p);
    const steps: Step[] = [
      ...inputSteps(p),
      {
        text: 'Add up the cost of both inputs.',
        latex: `C = wL^* + rK^* = ${num(p.w)}\\cdot ${num(p.L)} + ${num(p.r)}\\cdot ${num(p.K)} = ${num(C)}`,
        why: `Labour gets the share β/(α + β) = ${plainFrac(p.j, p.i + p.j)} of the cost: ${p.w * p.L} out of ${C}. That is a quick check on any Cobb–Douglas cost minimum.`,
        result: C,
      },
    ];
    if (p.ask === 'average')
      steps.push({
        text: 'Divide by the output.',
        latex: `\\dfrac{C}{\\bar Q} = \\dfrac{${num(C)}}{${num(p.Q)}} = ${num(value(p))}`,
        why: 'Average cost is the cost per unit produced at the cheapest mix of inputs.',
        result: value(p),
      });
    return steps;
  },

  distractors: (p) =>
    cleanDistractors(value(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
