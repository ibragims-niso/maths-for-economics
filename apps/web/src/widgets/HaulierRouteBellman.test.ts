import { describe, expect, it } from 'vitest';
import {
  bestRoutes,
  describeRoute,
  greedyRoute,
  NAMES,
  ROADS,
  SB,
  valueFunction,
} from './HaulierRouteBellman';

/** Every route from S to T with its cost, listed one by one (no backward induction). */
function allRoutes(sb: number) {
  const cost = (i: number, j: number) => {
    const k = ROADS.findIndex(([a, b]) => a === i && b === j);
    return k === SB ? sb : (ROADS[k]?.[2] ?? Number.NaN);
  };
  const out: { route: string; cost: number }[] = [];
  for (const mid1 of [1, 2])
    for (const mid2 of [3, 4])
      out.push({
        route: [0, mid1, mid2, 5].map((i) => NAMES[i]).join(''),
        cost: cost(0, mid1) + cost(mid1, mid2) + cost(mid2, 5),
      });
  return out;
}

describe('HaulierRouteBellman maths', () => {
  it('matches DO03 Example 1 (V = 3, 6, 10, 6 and 10 at S; route SBCT; greedy 12)', () => {
    expect(valueFunction(4)).toEqual([10, 10, 6, 3, 6, 0]);
    expect(bestRoutes(4)).toEqual(['SBCT']);
    expect(greedyRoute(4)).toEqual({ route: 'SADT', cost: 12 });
    expect(allRoutes(4).map((r) => r.cost)).toEqual([13, 12, 10, 11]);
  });

  it('agrees with listing every route, for every slider position', () => {
    for (let sb = 3; sb <= 10; sb++) {
      const routes = allRoutes(sb);
      const least = Math.min(...routes.map((r) => r.cost));
      expect(valueFunction(sb)[0]).toBe(least);
      expect(valueFunction(sb)[0]).toBe(Math.min(12, sb + 6));
      expect(bestRoutes(sb).sort()).toEqual(
        routes
          .filter((r) => r.cost === least)
          .map((r) => r.route)
          .sort(),
      );
      // The greedy driver always takes S → A (cost 2 < 3) and never beats backward induction.
      expect(greedyRoute(sb)).toEqual({ route: 'SADT', cost: 12 });
      expect(describeRoute(sb)).not.toMatch(/NaN|undefined/);
    }
    expect(bestRoutes(6).sort()).toEqual(['SADT', 'SBCT']);
    expect(describeRoute(5)).toContain('1 less than the greedy 12');
    expect(describeRoute(6)).toContain('indifferent');
    expect(describeRoute(8)).toContain('via A is best');
  });
});
