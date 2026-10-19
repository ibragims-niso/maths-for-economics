import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  type CostMin,
  drawCostMin,
  EXACT,
  frac,
  labourAtRatio,
  plainFrac,
  power,
  raised,
  technologyLatex,
} from './technology';

type Params = CostMin;

function candidates(p: Params) {
  return [
    // Price ratio upside down: K/L = αr/(βw).
    {
      value: round(labourAtRatio(p, (p.i * p.r) / (p.j * p.w)), 2),
      mistakeCode: 'INVERTED_PRICE_RATIO',
    },
    // Exponents ignored, as if α = β: K/L = w/r.
    { value: round(labourAtRatio(p, p.w / p.r), 2), mistakeCode: 'EQUAL_EXPONENTS' },
    // Exponents swapped: K/L = βw/(αr).
    {
      value: round(labourAtRatio(p, (p.j * p.w) / (p.i * p.r)), 2),
      mistakeCode: 'SWAPPED_EXPONENTS',
    },
    // The constant A left out of the output target.
    {
      value: round(labourAtRatio(p, (p.i * p.w) / (p.j * p.r), 1), 2),
      mistakeCode: 'FORGOT_COEFFICIENT',
    },
  ];
}

/**
 * The three steps shared with cobb-douglas-minimum-cost: the tangency K/L = αw/(βr), the output
 * target, and L* with K*.
 */
export function inputSteps(p: CostMin): Step[] {
  const ratio = frac(p.i * p.w, p.j * p.r);
  const s = plainFrac(p.i + p.j, p.d);
  // ratio^α = (m/n)^i, and L^s = Q̄·n^i/(A·m^i).
  const root = frac(p.m ** p.i, p.n ** p.i);
  const coefficient = root === '1' ? num(p.A) : `${num(p.A)}\\cdot${root}`;
  const v = (p.Q * p.n ** p.i) / (p.A * p.m ** p.i);
  const crs = p.i + p.j === p.d;
  return [
    {
      text: 'Set the MRTS equal to the price ratio and solve for capital per worker.',
      latex: `MRTS = \\dfrac{MP_L}{MP_K} = \\dfrac{\\beta K}{\\alpha L} = \\dfrac{w}{r} \\;\\Rightarrow\\; \\dfrac{K}{L} = \\dfrac{\\alpha w}{\\beta r} = \\dfrac{${plainFrac(p.i, p.d)}\\cdot ${num(p.w)}}{${plainFrac(p.j, p.d)}\\cdot ${num(p.r)}} = ${ratio}`,
      why: `At the cheapest point the isoquant is tangent to an isocost line, so their slopes match. For Q = A·K^α·L^β with α = ${plainFrac(p.i, p.d)} and β = ${plainFrac(p.j, p.d)}, MP_L/MP_K = (β/α)·(K/L): the exponents matter as well as the prices.`,
    },
    {
      text: 'Put K into the output target.',
      latex: `${num(p.A)}\\big(${ratio}\\,L\\big)${power(p.i, p.d)}${raised('L', p.j, p.d)} = ${coefficient}\\,${raised('L', p.i + p.j, p.d)} = ${num(p.Q)} \\;\\Rightarrow\\; ${raised('L', p.i + p.j, p.d)} = ${num(v)}`,
      why: `The tangency fixes the mix of inputs and the target fixes the scale. The powers of L add up to α + β = ${s}.`,
    },
    {
      text: 'Solve for L, then K.',
      latex: `L^* = ${crs ? '' : `${num(v)}${power(p.d, p.i + p.j)} = `}${num(p.L)}, \\qquad K^* = ${ratio}\\cdot ${num(p.L)} = ${num(p.K)}`,
      why: `${crs ? 'With α + β = 1 output is proportional to L along the cheapest mix, so L* comes straight from the target.' : `Raise both sides to the power 1/(α + β) = ${plainFrac(p.d, p.i + p.j)}.`} Check: ${p.A}·${p.K}^(${plainFrac(p.i, p.d)})·${p.L}^(${plainFrac(p.j, p.d)}) = ${p.Q}, the target.`,
      result: p.L,
    },
  ];
}

/** MV11, difficulty 2: the conditional labour demand L* for Q = A·K^α·L^β, given w, r and Q̄. */
export const cobbDouglasConditionalLabour: Generator<Params> = {
  id: 'cobb-douglas-conditional-labour',
  title: 'Cost-minimising labour',
  topicId: 'MV11',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const p = drawCostMin(rng);
      if (!p) continue;
      const kept = cleanDistractors(p.L, candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length < 2 || kept.some((d) => d.value <= 0)) continue;
      return p;
    }
  },

  stem: (p) =>
    `A factory makes $Q = ${technologyLatex(p)}$ units a day with $K$ machines and $L$ workers. A worker costs $w = ${num(p.w)}$ and a machine $r = ${num(p.r)}$ a day. It must produce $\\bar Q = ${num(p.Q)}$ units a day at the lowest possible cost. How many workers $L^*$ does it use?`,

  answer: (p) => ({ kind: 'numeric', value: p.L, decimals: 0, ...EXACT }),

  steps: inputSteps,

  distractors: (p) => cleanDistractors(p.L, candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
