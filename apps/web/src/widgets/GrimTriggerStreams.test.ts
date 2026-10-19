import { describe, expect, it } from 'vitest';
import {
  criticalDelta,
  discountedProfits,
  pvCheat,
  pvCollude,
  verdict,
} from './GrimTriggerStreams';

describe('GrimTriggerStreams', () => {
  it('reproduces GT04 Examples 1 and 2 (R = 12, T = 18, P = 8)', () => {
    expect(criticalDelta(18, 12, 8)).toBeCloseTo(0.6, 12);
    expect(pvCollude(12, 0.75)).toBeCloseTo(48, 9);
    expect(pvCheat(18, 8, 0.75)).toBeCloseTo(42, 9);
    expect(pvCollude(12, 0.5)).toBeCloseTo(24, 9);
    expect(pvCheat(18, 8, 0.5)).toBeCloseTo(26, 9);
  });

  it('the present values equal the bars added up month by month', () => {
    for (const delta of [0.05, 0.3, 0.6, 0.75, 0.95])
      for (const T of [13, 18, 30]) {
        let collude = 0;
        let cheat = 0;
        for (let t = 0; t < 2000; t++) {
          const v = discountedProfits(T, 12, 8, delta, t);
          collude += v.collude;
          cheat += v.cheat;
        }
        expect(pvCollude(12, delta)).toBeCloseTo(collude, 6);
        expect(pvCheat(T, 8, delta)).toBeCloseTo(cheat, 6);
      }
  });

  it('colluding pays more exactly when δ is above δ*', () => {
    for (const T of [13, 18, 25, 30]) {
      const star = criticalDelta(T, 12, 8);
      expect(pvCollude(12, star)).toBeCloseTo(pvCheat(T, 8, star), 9);
      expect(pvCollude(12, star + 0.01)).toBeGreaterThan(pvCheat(T, 8, star + 0.01));
      expect(pvCollude(12, star - 0.01)).toBeLessThan(pvCheat(T, 8, star - 0.01));
    }
  });
});

describe('GrimTriggerStreams verdict', () => {
  it('says hold, indifferent or break down as in Example 2 and the Try it checks', () => {
    expect(verdict(pvCollude(12, 0.75), pvCheat(18, 8, 0.75)).sign).toBe('>');
    expect(verdict(pvCollude(12, 0.6), pvCheat(18, 8, 0.6)).sign).toBe('=');
    expect(verdict(pvCollude(12, 0.55), pvCheat(18, 8, 0.55)).sign).toBe('<');
    expect(pvCollude(12, 0.55)).toBeCloseTo(26.67, 2);
    expect(pvCheat(18, 8, 0.55)).toBeCloseTo(27.78, 2);
  });
});
