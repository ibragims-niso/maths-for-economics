import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  CONTEXTS,
  type Context,
  costSumLatex,
  drawAmounts,
  drawCosts,
  EXACT,
  leastCost,
  northWest,
  shipmentsLatex,
  type Table,
  tableauLatex,
  totalCost,
  twoSourceOptimum,
} from './transport';

interface Params {
  context: Context;
  /** Two sources. */
  supply: number[];
  /** Three destinations; the totals are equal. */
  demand: number[];
  /** Unit shipping costs, 2 × 3, all different. */
  cost: Table;
}

const target = (p: Params) => totalCost(twoSourceOptimum(p.supply, p.demand, p.cost).plan, p.cost);

/** Every destination served from its cheaper source, as if the sources had no limit. */
const noLimits = (p: Params) =>
  p.demand.reduce((s, d, j) => s + d * Math.min(p.cost[0]?.[j] ?? 0, p.cost[1]?.[j] ?? 0), 0);

const candidates = (p: Params) => [
  { value: totalCost(northWest(p.supply, p.demand), p.cost), mistakeCode: 'NORTH_WEST_START' },
  {
    value: totalCost(leastCost(p.supply, p.demand, p.cost), p.cost),
    mistakeCode: 'LEAST_COST_START',
  },
  { value: noLimits(p), mistakeCode: 'IGNORED_SUPPLY_LIMIT' },
];

/** OP05, difficulty 2: the minimum total cost of a balanced problem with two sources. */
export const transportTwoSourceMinimumCost: Generator<Params> = {
  id: 'transport-two-source-minimum-cost',
  title: 'Cheapest plan, two sources',
  topicId: 'OP05',
  difficulty: 2,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const context = rng.pick(['cement', 'shops', 'oil'] as const);
      const amounts = drawAmounts(rng, 2, 3);
      if (!amounts) continue;
      const p: Params = { context, ...amounts, cost: drawCosts(rng, 2, 3) };
      const { diff } = twoSourceOptimum(p.supply, p.demand, p.cost);
      // Different cost gaps give a single cheapest plan.
      if (new Set(diff).size < 3) continue;
      const answer = target(p);
      // The starting plan and the "no limits" shortcut must both miss the optimum.
      if (candidates(p)[0]?.value === answer || noLimits(p) === answer) continue;
      if (cleanDistractors(answer, candidates(p), EXACT.tolerance, EXACT.relTolerance).length >= 2)
        return p;
    }
  },

  stem(p) {
    const s = CONTEXTS[p.context];
    return `${s.intro} The table gives the cost of shipping one unit from each of the two ${s.srcName[1]} (rows) to each ${s.dstName[0]} (columns), with supplies and demands in ${s.unit}: $${tableauLatex(p.context, p.supply, p.demand, p.cost)}$ What is the minimum possible total shipping cost?`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps(p) {
    const { src, dst } = CONTEXTS[p.context];
    const { plan, order, diff } = twoSourceOptimum(p.supply, p.demand, p.cost);
    const base = p.demand.reduce((s, d, j) => s + d * (p.cost[1]?.[j] ?? 0), 0);
    const gaps = diff.map((d, j) => `d_${j + 1} = ${num(d)}`).join(',\\ ');
    const ranked = order.map((j) => `${dst}_${j + 1}`).join(',\\ ');
    return [
      {
        text: `Write ${src}₂'s shipments as what ${src}₁ leaves: x₂ⱼ = bⱼ − x₁ⱼ.`,
        latex: `\\text{cost} = \\sum_j c_{2j}b_j + \\sum_j (c_{1j} - c_{2j})\\,x_{1j} = ${num(base)} + \\sum_j d_j\\,x_{1j}, \\quad ${gaps}`,
        why: `Every unit a destination gets from ${src}₁ is a unit it does not get from ${src}₂, so sending it from ${src}₁ changes the cost by dⱼ = c₁ⱼ − c₂ⱼ. ${base} is the cost if ${src}₂ supplied everything.`,
        result: base,
      },
      {
        text: `Let ${src}₁ serve the destinations in order of dⱼ, smallest first.`,
        latex: `${ranked}:\\quad ${shipmentsLatex(plan)}`,
        why: `${src}₁ must send exactly its ${p.supply[0] ?? 0} units somewhere, and each unit saves most where dⱼ is lowest. Fill the destination with the lowest dⱼ completely, then the next, until ${src}₁ is used up; ${src}₂ sends the rest.`,
      },
      {
        text: 'Add up the cost of the plan.',
        latex: `${costSumLatex(plan, p.cost)} = ${num(target(p))}`,
        why: `A check: ${base} + Σ dⱼx₁ⱼ gives the same total. No other split of ${src}₁'s supply can be cheaper, because any unit moved to a destination with a larger dⱼ costs more.`,
        result: target(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
