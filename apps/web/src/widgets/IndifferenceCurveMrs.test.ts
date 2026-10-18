import { describe, expect, it } from 'vitest';
import { bundleY, mrsAt, slopeAt, tangentAt } from './IndifferenceCurveMrs';

describe('IndifferenceCurveMrs maths', () => {
  it('matches worked example 1 in C110 (xy = 48: slope −3 at (4, 12), −0.75 at (8, 6))', () => {
    expect(bundleY(48, 4)).toBe(12);
    expect(slopeAt(48, 4)).toBeCloseTo(-3, 12);
    expect(mrsAt(48, 4)).toBeCloseTo(3, 12);
    expect(bundleY(48, 8)).toBe(6);
    expect(slopeAt(48, 8)).toBeCloseTo(-0.75, 12);
  });

  it('agrees with the slope of the explicit curve y = U/x over a tiny step', () => {
    for (const u of [12, 36, 48, 60]) {
      for (const x of [2, 4.5, 8, 12]) {
        const h = 1e-5;
        const numeric = (bundleY(u, x + h) - bundleY(u, x - h)) / (2 * h);
        expect(slopeAt(u, x)).toBeCloseTo(numeric, 5);
      }
    }
  });

  it('draws a tangent that touches the curve and meets the axes at 2x and 2y', () => {
    const line = tangentAt(48, 4);
    expect(line(4)).toBeCloseTo(12, 12);
    expect(line(0)).toBeCloseTo(24, 12);
    expect(line(8)).toBeCloseTo(0, 12);
  });

  it('has a falling MRS along each curve on the slider range', () => {
    for (const u of [12, 48, 60]) {
      for (let x = 2; x < 12; x += 0.5) {
        expect(mrsAt(u, x + 0.5)).toBeLessThan(mrsAt(u, x));
        expect(bundleY(u, x)).toBeLessThanOrEqual(30);
      }
    }
  });
});
