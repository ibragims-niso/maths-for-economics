import { describe, expect, it } from 'vitest';
import {
  describeShape,
  INFLECTION,
  marginalProduct,
  output,
  outputSecond,
  shapeAt,
  tangentAt,
} from './ProductionConcavity';

describe('ProductionConcavity', () => {
  it('reproduces C108 Example 3: inflection at L = 20, where MP peaks at 120 and Q = 1600', () => {
    expect(outputSecond(INFLECTION)).toBeCloseTo(0, 12);
    expect(marginalProduct(20)).toBeCloseTo(120, 12);
    expect(output(20)).toBeCloseTo(1600, 9);
    expect(shapeAt(20)).toBe('inflection');
    expect(describeShape(20)).toContain('highest, 120');
  });

  it('matches the check in the topic text: MP 90 at L = 10 and L = 30, Q″ = 6 and −6', () => {
    expect(marginalProduct(10)).toBeCloseTo(90, 12);
    expect(marginalProduct(30)).toBeCloseTo(90, 12);
    expect(outputSecond(10)).toBeCloseTo(6, 12);
    expect(outputSecond(30)).toBeCloseTo(-6, 12);
    expect(shapeAt(10)).toBe('convex');
    expect(shapeAt(30)).toBe('concave');
    expect(marginalProduct(40)).toBeCloseTo(0, 12);
  });

  it('MP and Q″ are the numeric first and second derivatives of output', () => {
    const h = 1e-3;
    for (let l = 0; l <= 40; l += 2.5) {
      expect(marginalProduct(l)).toBeCloseTo((output(l + h) - output(l - h)) / (2 * h), 5);
      expect(outputSecond(l)).toBeCloseTo(
        (output(l + h) - 2 * output(l) + output(l - h)) / (h * h),
        3,
      );
    }
  });

  it('the marginal product is highest at the inflection point (scan of the slider values)', () => {
    let best = 0;
    for (let l = 0; l <= 40; l++) if (marginalProduct(l) > marginalProduct(best)) best = l;
    expect(best).toBe(INFLECTION);
  });

  it('the tangent lies below the convex part and above the concave part', () => {
    for (const l0 of [5, 10, 15]) {
      const line = tangentAt(l0);
      for (const d of [-2, 2]) expect(line(l0 + d)).toBeLessThan(output(l0 + d));
    }
    for (const l0 of [25, 30, 35]) {
      const line = tangentAt(l0);
      for (const d of [-2, 2]) expect(line(l0 + d)).toBeGreaterThan(output(l0 + d));
    }
  });

  it('a chord lies above the convex part and below the concave part (Example 3)', () => {
    expect((output(0) + output(20)) / 2).toBeCloseTo(800, 9);
    expect(output(10)).toBeCloseTo(500, 9);
    expect((output(30) + output(40)) / 2).toBeCloseTo(2950, 9);
    expect(output(35)).toBeCloseTo(3062.5, 9);
  });
});
