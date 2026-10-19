import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  basicCells,
  CONTEXTS,
  type Context,
  drawAmounts,
  drawCosts,
  EXACT,
  northWest,
  potentials,
  reducedCost,
  type Table,
  tableauLatex,
  traceLatex,
} from './transport';

interface Params {
  context: Context;
  /** Three sources. */
  supply: number[];
  /** Three destinations; the totals are equal and the north-west plan is non-degenerate. */
  demand: number[];
  /** Unit shipping costs, all different. */
  cost: Table;
  /** The empty cell asked about (1-based row and column). */
  i: number;
  j: number;
}

const solve = (p: Params) => {
  const plan = northWest(p.supply, p.demand);
  return { plan, ...potentials(basicCells(plan), p.cost, 3, 3) };
};

const target = (p: Params) => {
  const { u, v } = solve(p);
  return reducedCost(p.cost, u, v, p.i - 1, p.j - 1);
};

const candidates = (p: Params) => {
  const { u, v } = solve(p);
  return [
    { value: -target(p), mistakeCode: 'REDUCED_SIGN' },
    { value: (u[p.i - 1] ?? 0) + (v[p.j - 1] ?? 0), mistakeCode: 'IMPLIED_COST' },
  ];
};

/** OP05, difficulty 3: reduced cost cᵢⱼ − uᵢ − vⱼ of an empty cell, from the potentials method. */
export const transportReducedCostEmptyCell: Generator<Params> = {
  id: 'transport-reduced-cost-empty-cell',
  title: 'Reduced cost of an empty cell',
  topicId: 'OP05',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['cement', 'shops', 'oil'] as const);
      const amounts = drawAmounts(rng, 3, 3);
      if (!amounts) continue;
      const plan = northWest(amounts.supply, amounts.demand);
      const empty = [0, 1, 2].flatMap((i) =>
        [0, 1, 2].filter((j) => (plan[i]?.[j] ?? 0) === 0).map((j) => [i + 1, j + 1] as const),
      );
      const [i, j] = rng.pick(empty);
      const p: Params = { context, ...amounts, cost: drawCosts(rng, 3, 3), i, j };
      if (target(p) === 0) continue;
      const kept = cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length === 2) return p;
    }
  },

  stem(p) {
    const s = CONTEXTS[p.context];
    const plan = northWest(p.supply, p.demand);
    return `${s.intro} The table gives the cost of shipping one unit (rows = ${s.srcName[1]}, columns = ${s.dstName[1]}, amounts in ${s.unit}); the numbers in brackets are the current plan from the north-west corner rule: $${tableauLatex(p.context, p.supply, p.demand, p.cost, plan)}$ Using the potentials method with $u_1 = 0$, find the reduced cost $\\Delta_{${p.i}${p.j}} = c_{${p.i}${p.j}} - u_${p.i} - v_${p.j}$ of the empty cell $(${p.i}, ${p.j})$.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps(p) {
    const { u, v, trace } = solve(p);
    const c = p.cost[p.i - 1]?.[p.j - 1] ?? 0;
    const ui = u[p.i - 1] ?? 0;
    const vj = v[p.j - 1] ?? 0;
    const paren = (x: number) => (x < 0 ? `(${num(x)})` : num(x));
    const delta = target(p);
    return [
      {
        text: 'Find the potentials from the five used cells, starting from u₁ = 0.',
        latex: `u_1 = 0,\\ ${traceLatex(trace, p.cost, u, v)}`,
        why: 'On every used cell uᵢ + vⱼ = cᵢⱼ. There are 5 used cells (m + n − 1) and 6 unknowns, so one potential is fixed at 0 and each equation then gives one new potential.',
      },
      {
        text: `Compare the cost of cell (${p.i}, ${p.j}) with uᵢ + vⱼ.`,
        latex: `\\Delta_{${p.i}${p.j}} = c_{${p.i}${p.j}} - u_${p.i} - v_${p.j} = ${num(c)} - ${paren(ui)} - ${paren(vj)} = ${num(delta)}`,
        why: 'uᵢ + vⱼ is what the current plan implicitly charges for this route; the reduced cost is how much the true cost exceeds it.',
        result: delta,
      },
      {
        text:
          delta < 0
            ? 'Negative: this route would cut the cost.'
            : 'Positive: this route would raise the cost.',
        latex: `\\Delta_{${p.i}${p.j}} ${delta < 0 ? '<' : '>'} 0`,
        why:
          delta < 0
            ? `Each unit sent along this route (and shifted around its closed loop) lowers the total cost by ${-delta}, so the plan is not optimal yet.`
            : `Each unit sent along this route (and shifted around its closed loop) would raise the total cost by ${delta}, so this cell should stay empty.`,
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
