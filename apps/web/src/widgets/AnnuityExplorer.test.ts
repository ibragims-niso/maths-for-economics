import { describe, expect, it } from 'vitest';
import { annuityValue, perpetuityValue, shareOfPerpetuity } from './AnnuityExplorer';

describe('AnnuityExplorer maths', () => {
  it('matches worked example 1 in FM04 (9000 a year for 20 years at 4 %)', () => {
    expect(annuityValue(9000, 0.04, 20)).toBeCloseTo(122312.94, 2);
    expect(perpetuityValue(9000, 0.04)).toBeCloseTo(225000, 9);
  });

  it('equals the sum of the payments discounted one by one', () => {
    for (const [r, n] of [
      [0.02, 1],
      [0.065, 17],
      [0.12, 60],
    ] as const) {
      let sum = 0;
      for (let k = 1; k <= n; k++) sum += 9000 / (1 + r) ** k;
      expect(annuityValue(9000, r, n)).toBeCloseTo(sum, 6);
    }
  });

  it('is the perpetuity times the share 1 − (1 + r)^(−n), and approaches C/r', () => {
    expect(annuityValue(9000, 0.04, 20)).toBeCloseTo(
      perpetuityValue(9000, 0.04) * shareOfPerpetuity(0.04, 20),
      9,
    );
    expect(shareOfPerpetuity(0.04, 20)).toBeCloseTo(0.5436, 4);
    expect(annuityValue(9000, 0.12, 60)).toBeLessThan(perpetuityValue(9000, 0.12));
    expect(annuityValue(9000, 0.12, 60) / perpetuityValue(9000, 0.12)).toBeGreaterThan(0.99);
  });
});
