import { describe, expect, it } from 'vitest';
import { describeEntry, solveEntry } from './EntryDeterrenceTree';

describe('EntryDeterrenceTree maths', () => {
  it('matches Example 1 in GT03: the incumbent accommodates and the entrant enters', () => {
    const o = solveEntry(10, 0);
    expect(o.fights).toBe(false);
    expect(o.enters).toBe(true);
    expect(o.payoffs).toEqual([30, 40]);
    expect(describeEntry(10, 0)).toContain('not credible');
  });

  it('needs a penalty of 30 (= 40 − 10) to make the threat credible', () => {
    expect(solveEntry(10, 25).fights).toBe(false);
    const o = solveEntry(10, 30);
    expect(o.accommodateNet).toBe(10);
    expect(o.fights).toBe(true);
    expect(o.enters).toBe(false);
    expect(o.payoffs).toEqual([0, 100]);
    expect(describeEntry(10, 30)).toContain('40 − 30 = 10');
  });

  it('makes fighting credible on its own once F is at least 40', () => {
    expect(solveEntry(35, 0).payoffs).toEqual([30, 40]);
    expect(solveEntry(45, 0).payoffs).toEqual([0, 100]);
  });

  it('never leaves the incumbent worse off with a credible threat than without', () => {
    for (let f = 0; f <= 60; f += 5)
      for (let pen = 0; pen <= 50; pen += 5) {
        const o = solveEntry(f, pen);
        if (o.fights) expect(o.payoffs[1]).toBe(100);
      }
  });
});
