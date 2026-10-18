import { describe, expect, it } from 'vitest';
import {
  curveAt,
  describeBudget,
  INCOME,
  LEVELS,
  placeOnMap,
  spending,
  utility,
} from './IndifferenceMap';

describe('IndifferenceMap', () => {
  it('reproduces MV01 Example 1: (4, 10) and (8, 5) lie on U = 40; (5, 9) is higher', () => {
    expect(utility(4, 10)).toBe(40);
    expect(utility(8, 5)).toBe(40);
    expect(utility(5, 9)).toBe(45);
    expect(curveAt(40)(8)).toBe(5);
  });

  it('reproduces MV01 Example 3: U = 600 touches the budget line only at (30, 20)', () => {
    expect(utility(30, 20)).toBe(600);
    expect(spending(30, 20)).toBe(INCOME);
    expect(placeOnMap(600)).toBe('on U = 600');
    // Walk along the budget line: utility is highest, exactly 600, at x = 30 and lower elsewhere.
    let best = 0;
    for (let x = 0; x <= 60; x += 0.5) {
      const u = utility(x, (INCOME - 2 * x) / 3);
      expect(u).toBeLessThanOrEqual(600 + 1e-9);
      if (u > utility(best, (INCOME - 2 * best) / 3)) best = x;
    }
    expect(best).toBe(30);
  });

  it('every point of a drawn curve has the utility of its level', () => {
    for (const level of LEVELS) {
      for (const x of [8, 15, 30, 45, 56])
        expect(utility(x, curveAt(level)(x))).toBeCloseTo(level, 9);
    }
  });

  it('places a bundle between the right curves and against the budget', () => {
    expect(placeOnMap(60)).toBe('below 300');
    expect(placeOnMap(450)).toBe('300 to 600');
    expect(placeOnMap(800)).toBe('600 to 900');
    expect(placeOnMap(2400)).toBe('above 900');
    expect(describeBudget(30, 20)).toContain('exactly 120');
    expect(describeBudget(12, 5)).toContain('affordable');
    expect(describeBudget(60, 40)).toContain('cannot be bought');
  });

  it('the curves get closer together further out: equal utility steps, shrinking gaps', () => {
    // Along the diagonal x = y the curve U = c is at x = √c.
    const at = LEVELS.map((c) => Math.sqrt(c));
    const gap1 = (at[1] ?? 0) - (at[0] ?? 0);
    const gap2 = (at[2] ?? 0) - (at[1] ?? 0);
    expect(gap2).toBeLessThan(gap1);
  });
});
