import { useState } from 'react';
import { Area, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Topic OP05, Example 1: plants A and B ship cement to three sites that need 30, 40 and 50 t.
export const DEMAND = [30, 40, 50] as const;
export const TOTAL = 120;
/** Cost per tonne: rows = plants A and B, columns = sites 1–3. The slider changes A → site 3. */
export const BASE_COST = [
  [4, 8, 3],
  [6, 5, 7],
] as const;

type Plan = number[][];

/** The cost table with the cost from plant A to site 3 replaced. */
export function costTable(a3: number): number[][] {
  return [[BASE_COST[0][0], BASE_COST[0][1], a3], [...BASE_COST[1]]];
}

/** Σ cᵢⱼxᵢⱼ over all cells. */
export function planCost(plan: Plan, cost: number[][]): number {
  return plan.reduce((s, row, i) => s + row.reduce((t, x, j) => t + x * (cost[i]?.[j] ?? 0), 0), 0);
}

/** North-west corner rule: fill from the top-left, move right when a site is full, down when a plant is empty. */
export function northWestPlan(supply: readonly number[], demand: readonly number[]): Plan {
  const plan = supply.map(() => demand.map(() => 0));
  const s = [...supply];
  const d = [...demand];
  let i = 0;
  let j = 0;
  while (i < s.length && j < d.length) {
    const x = Math.min(s[i] ?? 0, d[j] ?? 0);
    (plan[i] as number[])[j] = x;
    s[i] = (s[i] ?? 0) - x;
    d[j] = (d[j] ?? 0) - x;
    if (s[i] === 0) i++;
    else j++;
  }
  return plan;
}

/**
 * The cheapest plan, by trying every whole-number split: plant A's shipments x₁ and x₂ to sites
 * 1 and 2 fix everything else (A sends the rest of its supply to site 3, B covers what is left).
 */
export function cheapestPlan(supplyA: number, cost: number[][]): Plan {
  let best: Plan = [];
  let bestCost = Number.POSITIVE_INFINITY;
  const [d1, d2, d3] = DEMAND;
  for (let x1 = 0; x1 <= Math.min(supplyA, d1); x1++) {
    for (let x2 = 0; x2 <= Math.min(supplyA - x1, d2); x2++) {
      const x3 = supplyA - x1 - x2;
      if (x3 > d3) continue;
      const plan = [
        [x1, x2, x3],
        [d1 - x1, d2 - x2, d3 - x3],
      ];
      const c = planCost(plan, cost);
      if (c < bestCost) {
        bestCost = c;
        best = plan;
      }
    }
  }
  return best;
}

/** Everything the figure shows for one setting of the two sliders. */
export function shippingSummary(a3: number, supplyA: number) {
  const cost = costTable(a3);
  const supply = [supplyA, TOTAL - supplyA];
  const nw = northWestPlan(supply, DEMAND);
  const best = cheapestPlan(supplyA, cost);
  const nwCost = planCost(nw, cost);
  const bestCost = planCost(best, cost);
  // Cost of a site's tonne from A minus from B: A serves the most negative gaps first.
  const gaps = DEMAND.map((_, j) => (cost[0]?.[j] ?? 0) - (cost[1]?.[j] ?? 0));
  return { cost, supply, nw, best, nwCost, bestCost, saving: nwCost - bestCost, gaps };
}

const LABEL = ['A', 'B'];
const listShipments = (plan: Plan) =>
  plan
    .flatMap((row, i) => row.map((x, j) => (x > 0 ? `${LABEL[i]}→${j + 1} ${fmt(x)}` : '')))
    .filter(Boolean)
    .join(', ');

/** The caption: the two plans and the rule behind the cheapest one. */
export function describeShipping(a3: number, supplyA: number): string {
  const s = shippingSummary(a3, supplyA);
  const gaps = s.gaps.map((g) => fmt(g)).join(', ');
  return `Under each name are the tonnes it makes or needs. Each cell shows the cost per tonne and, shaded, the tonnes shipped in the cheapest plan (${listShipments(s.best)}; total ${fmt(s.bestCost)}). The north-west corner plan ships ${listShipments(s.nw)} and costs ${fmt(s.nwCost)}. Plant A goes first to the sites where it is cheapest compared with B: cost from A minus cost from B is ${gaps} for sites 1, 2, 3.`;
}

const FRAME = { xMin: 0, xMax: 4, yMin: 0, yMax: 3 };
const PLANTS = [0, 1] as const;
const SITES = [0, 1, 2] as const;
/** Top and bottom of the header row and of the rows for plants A and B. */
const ROWS: [number, number][] = [
  [1.15, 2.3],
  [0, 1.15],
];

/** OP05: two plants, three sites; change one cost and A's capacity and compare the plans. */
export function CementShippingPlan() {
  const [a3, setA3] = useState(3);
  const [supplyA, setSupplyA] = useState(50);
  const s = shippingSummary(a3, supplyA);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="" yLabel="">
        {PLANTS.flatMap((i) =>
          SITES.map((j) => {
            const [lo, hi] = ROWS[i] ?? [0, 0];
            return (s.best[i]?.[j] ?? 0) > 0 ? (
              <Area
                key={`a${i}${j}`}
                frame={FRAME}
                points={[
                  [j + 1, lo],
                  [j + 2, lo],
                  [j + 2, hi],
                  [j + 1, hi],
                ]}
                tone="green"
              />
            ) : null;
          }),
        )}
        <Guides frame={FRAME} x={4} y={3} />
        <Guides frame={FRAME} x={4} y={2.3} />
        <Guides frame={FRAME} x={4} y={1.15} />
        {[1, 2, 3].map((x) => (
          <Guides key={`g${x}`} frame={FRAME} x={x} y={3} />
        ))}
        {SITES.map((j) => (
          <g key={`h${j}`}>
            <Note frame={FRAME} x={j + 1.5} y={2.72} anchor="middle">
              Site {j + 1}
            </Note>
            <Note frame={FRAME} x={j + 1.5} y={2.45} anchor="middle">
              {DEMAND[j]} t
            </Note>
          </g>
        ))}
        {PLANTS.map((i) => {
          const [lo, hi] = ROWS[i] ?? [0, 0];
          const mid = (lo + hi) / 2;
          return (
            <g key={LABEL[i]}>
              <Note frame={FRAME} x={0.5} y={mid + 0.12} anchor="middle">
                Plant {LABEL[i]}
              </Note>
              <Note frame={FRAME} x={0.5} y={mid - 0.25} anchor="middle">
                {fmt(s.supply[i] ?? 0)} t
              </Note>
              {SITES.map((j) => (
                <g key={`c${i}${j}`}>
                  <Note frame={FRAME} x={j + 1.5} y={mid + 0.12} anchor="middle">
                    cost {fmt(s.cost[i]?.[j] ?? 0)}
                  </Note>
                  <Note frame={FRAME} x={j + 1.5} y={mid - 0.25} anchor="middle">
                    {(s.best[i]?.[j] ?? 0) > 0 ? `${fmt(s.best[i]?.[j] ?? 0)} t` : '–'}
                  </Note>
                </g>
              ))}
            </g>
          );
        })}
      </Plot>
      <Slider label="Cost A → site 3" value={a3} min={1} max={12} onChange={setA3} />
      <Slider
        label="Plant A makes (B makes the rest of 120 t)"
        value={supplyA}
        min={20}
        max={100}
        step={10}
        onChange={setSupplyA}
      />
      <Readout
        items={[
          ['Cheapest plan', fmt(s.bestCost)],
          ['North-west', fmt(s.nwCost)],
          ['Saving', fmt(s.saving)],
        ]}
      />
      <figcaption>{describeShipping(a3, supplyA)}</figcaption>
    </figure>
  );
}
