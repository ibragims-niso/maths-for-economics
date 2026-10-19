import { describe, expect, it } from 'vitest';
import {
  BASE_DURATION,
  C,
  chains,
  criticalPaths,
  describeCatering,
  PREDS,
  schedule,
} from './ConferenceCriticalPath';

/** Project duration the long way: the longest chain from a start to the end. */
const longest = (c: number) => {
  const d = BASE_DURATION.map((x, i) => (i === C ? c : x));
  return Math.max(...chains().map((p) => p.reduce((s, i) => s + (d[i] ?? 0), 0)));
};

describe('ConferenceCriticalPath maths', () => {
  it('matches OP07 Example 2 (14 weeks, critical path A–D–E–F, floats 3 for B and 1 for C)', () => {
    const s = schedule(6);
    expect(s.es).toEqual([0, 0, 4, 4, 6, 11]);
    expect(s.ef).toEqual([4, 3, 10, 6, 11, 14]);
    expect(s.ls).toEqual([0, 3, 5, 4, 6, 11]);
    expect(s.lf).toEqual([4, 6, 11, 6, 11, 14]);
    expect(s.float).toEqual([0, 3, 1, 0, 0, 0]);
    expect(s.total).toBe(14);
    expect(criticalPaths(6)).toEqual(['ADEF']);
    expect(chains().map((p) => p.length)).toEqual([3, 4, 3]);
  });

  it('agrees with the longest chain and makes C critical from 7 weeks', () => {
    for (let c = 1; c <= 12; c++) {
      const s = schedule(c);
      expect(s.total).toBe(longest(c));
      expect(s.total).toBe(Math.max(14, c + 7));
      expect(s.float[C]).toBe(Math.max(0, 7 - c));
      // Every precedence is respected and no float is negative.
      PREDS.forEach((ps, j) => {
        for (const i of ps) expect(s.es[j]).toBeGreaterThanOrEqual(s.ef[i] ?? 0);
      });
      for (const f of s.float) expect(f).toBeGreaterThanOrEqual(0);
    }
    expect(criticalPaths(7)).toEqual(['ACF', 'ADEF']);
    expect(criticalPaths(9)).toEqual(['ACF']);
  });

  it('describes the three cases in the caption', () => {
    expect(describeCatering(6)).toContain('1 week of float');
    expect(describeCatering(3)).toContain('4 weeks of float');
    expect(describeCatering(7)).toContain('no float left');
    expect(describeCatering(10)).toContain('17 weeks instead of 14');
  });
});
