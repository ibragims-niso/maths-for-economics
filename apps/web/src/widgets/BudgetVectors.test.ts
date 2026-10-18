import { describe, expect, it } from 'vitest';
import { angleBetween, budgetStatus, dot, footOfBudgetLine, norm } from './BudgetVectors';

describe('BudgetVectors maths (LA101)', () => {
  it('prices the bundles of Example 3: p = (4, 3), budget 24', () => {
    expect(dot([4, 3], [3, 4])).toBe(24);
    expect(dot([4, 3], [6, 0])).toBe(24);
    expect(dot([4, 3], [2, 3])).toBe(17);
    expect(budgetStatus(dot([4, 3], [2, 3]), 24)).toBe('inside');
    expect(budgetStatus(dot([4, 3], [3, 4]), 24)).toBe('on');
    expect(budgetStatus(dot([4, 3], [6, 1]), 24)).toBe('outside');
  });

  it('finds lengths and angles as in Example 3', () => {
    expect(norm([3, 4])).toBe(5);
    expect(norm([6, 0])).toBe(6);
    expect(angleBetween([3, 4], [6, 0])).toBeCloseTo(53.13, 2);
    expect(angleBetween([4, 3], [3, -4])).toBeCloseTo(90, 10);
    expect(angleBetween([4, 3], [0, 0])).toBeNull();
  });

  it('puts the foot of the price arrow on the budget line, in the direction of p', () => {
    for (const p1 of [2, 4, 5.5, 8]) {
      const foot = footOfBudgetLine([p1, 3], 24);
      expect(dot([p1, 3], foot)).toBeCloseTo(24, 10);
      expect(foot[0] / foot[1]).toBeCloseTo(p1 / 3, 10);
    }
    // Any step along the budget line is orthogonal to p.
    const a = [24 / 4, 0] as [number, number];
    const b = [0, 24 / 3] as [number, number];
    expect(dot([4, 3], [b[0] - a[0], b[1] - a[1]])).toBe(0);
  });
});
