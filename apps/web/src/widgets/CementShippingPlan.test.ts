import { describe, expect, it } from 'vitest';
import {
  cheapestPlan,
  costTable,
  DEMAND,
  describeShipping,
  northWestPlan,
  planCost,
  shippingSummary,
  TOTAL,
} from './CementShippingPlan';

/** The two-source rule of OP05: A serves the sites with the smallest cost gap c_A − c_B first. */
function byGaps(supplyA: number, cost: number[][]): number[][] {
  const gaps = DEMAND.map((_, j) => (cost[0]?.[j] ?? 0) - (cost[1]?.[j] ?? 0));
  const order = [0, 1, 2].sort((p, q) => (gaps[p] ?? 0) - (gaps[q] ?? 0));
  const a = [0, 0, 0];
  let left = supplyA;
  for (const j of order) {
    a[j] = Math.min(left, DEMAND[j] ?? 0);
    left -= a[j] ?? 0;
  }
  return [a, DEMAND.map((d, j) => d - (a[j] ?? 0))];
}

describe('CementShippingPlan maths', () => {
  it('matches OP05 Example 1 and the two-source shortcut (730 against 530)', () => {
    const s = shippingSummary(3, 50);
    expect(s.nw).toEqual([
      [30, 20, 0],
      [0, 20, 50],
    ]);
    expect(s.nwCost).toBe(730);
    expect(s.best).toEqual([
      [0, 0, 50],
      [30, 40, 0],
    ]);
    expect(s.bestCost).toBe(530);
    expect(s.saving).toBe(200);
    expect(s.gaps).toEqual([-2, 3, -4]);
    // The Try it checks: a dearer route A → 3 changes only the cheapest plan; more capacity at A
    // lets A serve both sites where it is cheaper (the 470 of the "no limits" shortcut).
    expect([shippingSummary(9, 50).bestCost, shippingSummary(9, 50).nwCost]).toEqual([710, 730]);
    expect(shippingSummary(3, 80).bestCost).toBe(470);
  });

  it('agrees with the cost-gap rule for every slider setting, and the saving is never negative', () => {
    for (let a3 = 1; a3 <= 12; a3++) {
      for (let supplyA = 20; supplyA <= 100; supplyA += 10) {
        const cost = costTable(a3);
        const best = cheapestPlan(supplyA, cost);
        expect(planCost(best, cost)).toBe(planCost(byGaps(supplyA, cost), cost));
        // Both plans ship exactly what each plant makes and each site needs.
        for (const plan of [best, northWestPlan([supplyA, TOTAL - supplyA], DEMAND)]) {
          expect(plan[0]?.reduce((s, x) => s + x, 0)).toBe(supplyA);
          expect(plan[1]?.reduce((s, x) => s + x, 0)).toBe(TOTAL - supplyA);
          DEMAND.forEach((d, j) => {
            expect((plan[0]?.[j] ?? 0) + (plan[1]?.[j] ?? 0)).toBe(d);
          });
        }
        expect(shippingSummary(a3, supplyA).saving).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('describes both plans in the caption', () => {
    const text = describeShipping(3, 50);
    expect(text).toContain('A→3 50, B→1 30, B→2 40; total 530');
    expect(text).toContain('A→1 30, A→2 20, B→2 20, B→3 50 and costs 730');
    expect(text).toContain('−2, 3, −4');
  });
});
