import { describe, expect, it } from 'vitest';
import {
  crossover,
  describeChoice,
  irr,
  LARGE_COST,
  largeFlows,
  npv,
  SMALL,
} from './NpvProfileTwoProjects';

describe('npv-profile-two-projects', () => {
  it('matches worked example 3 in FM06 at 8 %', () => {
    expect(npv(SMALL.cost, SMALL.flows, 8)).toBeCloseTo(1574.07, 2);
    expect(npv(LARGE_COST, largeFlows(10000), 8)).toBeCloseTo(3121.27, 2);
    expect(irr(SMALL.cost, SMALL.flows)).toBeCloseTo(25, 8);
    expect(irr(LARGE_COST, largeFlows(10000))).toBeCloseTo(12.59, 2);
    expect(crossover(10000)).toBeCloseTo(10.58, 2);
  });

  it('matches worked example 1 in FM06 (10000; 4000, 5000, 3000)', () => {
    expect(npv(10000, [4000, 5000, 3000], 8)).toBeCloseTo(371.89, 2);
    expect(npv(10000, [4000, 5000, 3000], 12)).toBeCloseTo(-307.26, 2);
    expect(irr(10000, [4000, 5000, 3000])).toBeCloseTo(10.13, 2);
  });

  it('finds the IRR as the rate where the NPV is zero, and the NPV falls as the rate rises', () => {
    for (const flow of [8000, 9500, 11500]) {
      const r = irr(LARGE_COST, largeFlows(flow)) ?? Number.NaN;
      expect(Math.abs(npv(LARGE_COST, largeFlows(flow), r))).toBeLessThan(1e-6);
      for (let rate = 0; rate < 30; rate += 0.5) {
        expect(npv(LARGE_COST, largeFlows(flow), rate + 0.5)).toBeLessThan(
          npv(LARGE_COST, largeFlows(flow), rate),
        );
      }
    }
    // The two-period project of Example 2 has its IRR at exactly 10 %.
    expect(irr(10000, [5000, 6600])).toBeCloseTo(10, 8);
  });

  it('puts the crossover where the two NPVs are equal, or reports none', () => {
    const c = crossover(11500) ?? Number.NaN;
    expect(npv(LARGE_COST, largeFlows(11500), c)).toBeCloseTo(npv(SMALL.cost, SMALL.flows, c), 6);
    expect(crossover(8000)).toBeNull();
  });

  it('says when the NPV and IRR rankings conflict', () => {
    expect(describeChoice(8, 10000)).toContain('conflict');
    expect(describeChoice(8, 10000)).toContain('choose B');
    expect(describeChoice(12, 10000)).toContain('agree');
    expect(describeChoice(30, 10000)).toContain('neither');
  });
});
