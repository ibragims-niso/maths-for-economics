import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import {
  basicCells,
  CONTEXTS,
  type Context,
  costSumLatex,
  drawAmounts,
  drawCosts,
  EXACT,
  leastCost,
  northWest,
  shipmentsLatex,
  sum,
  type Table,
  tableauLatex,
  totalCost,
} from './transport';

interface Params {
  context: Context;
  /** Amount each source can send (2 or 3 sources). */
  supply: number[];
  /** Amount each destination needs (3 destinations); the totals are equal. */
  demand: number[];
  /** Unit shipping costs, all different. */
  cost: Table;
}

const target = (p: Params) => totalCost(northWest(p.supply, p.demand), p.cost);

const candidates = (p: Params) => {
  const plan = northWest(p.supply, p.demand);
  const cells = basicCells(plan);
  const [li, lj] = cells[cells.length - 1] ?? [0, 0];
  const all = p.cost.flat();
  return [
    {
      value: totalCost(leastCost(p.supply, p.demand, p.cost), p.cost),
      mistakeCode: 'LEAST_COST_RULE',
    },
    {
      value: target(p) - (plan[li]?.[lj] ?? 0) * (p.cost[li]?.[lj] ?? 0),
      mistakeCode: 'MISSED_ALLOCATION',
    },
    { value: round((sum(p.supply) * sum(all)) / all.length, 2), mistakeCode: 'AVERAGE_COST' },
  ];
};

/** OP05, difficulty 1: total cost of the north-west corner starting plan of a balanced problem. */
export const transportNorthWestCost: Generator<Params> = {
  id: 'transport-north-west-cost',
  title: 'North-west corner plan cost',
  topicId: 'OP05',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(['cement', 'shops', 'oil'] as const);
      const m = rng.pick([2, 3]);
      const amounts = drawAmounts(rng, m, 3);
      if (!amounts) continue;
      const p: Params = { context, ...amounts, cost: drawCosts(rng, m, 3) };
      const kept = cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem(p) {
    const s = CONTEXTS[p.context];
    return `${s.intro} The table gives the cost of shipping one unit from each ${s.srcName[0]} (rows) to each ${s.dstName[0]} (columns), with supplies and demands in ${s.unit}: $${tableauLatex(p.context, p.supply, p.demand, p.cost)}$ Find the total cost of the starting plan given by the north-west corner rule.`;
  },

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: 0, ...EXACT }),

  steps(p) {
    const plan = northWest(p.supply, p.demand);
    const m = p.supply.length;
    const n = p.demand.length;
    return [
      {
        text: 'Check that the problem is balanced.',
        latex: `${p.supply.map((x) => num(x)).join(' + ')} = ${p.demand.map((x) => num(x)).join(' + ')} = ${num(sum(p.supply))}`,
        why: 'Total supply equals total demand, so every unit sent is needed and no dummy row or column is required.',
        result: sum(p.supply),
      },
      {
        text: 'Fill the table from the top-left cell.',
        latex: shipmentsLatex(plan),
        why: `In each cell ship as much as the row and the column still allow, min(supply left, demand left); then move right if the column is satisfied or down if the row is used up. The plan uses m + n − 1 = ${m} + ${n} − 1 = ${m + n - 1} cells.`,
      },
      {
        text: 'Multiply each shipment by its unit cost and add.',
        latex: `\\sum c_{ij}x_{ij} = ${costSumLatex(plan, p.cost)} = ${num(target(p))}`,
        why: 'Only the cells with a shipment cost anything; each costs its amount times the cost per unit.',
        result: target(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), EXACT.tolerance, EXACT.relTolerance),
};
