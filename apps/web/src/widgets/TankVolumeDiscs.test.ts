import { describe, expect, it } from 'vitest';
import { discSum, exactVolume, tankRadius, wallLength } from './TankVolumeDiscs';

describe('TankVolumeDiscs maths', () => {
  it('matches worked example 1 in C118 (y = 2√x, b = 4: V = 32π = 100.53)', () => {
    expect(tankRadius(4)).toBe(4);
    expect(exactVolume(4)).toBeCloseTo(32 * Math.PI, 9);
    expect(exactVolume(4)).toBeCloseTo(100.53, 2);
  });

  it('the discs fit inside and miss exactly 1/n of the volume', () => {
    expect(discSum(4, 8)).toBeCloseTo(87.96, 2);
    for (const b of [1, 2.5, 4, 6]) {
      for (const n of [2, 8, 24]) {
        expect(discSum(b, n)).toBeLessThan(exactVolume(b));
        expect(exactVolume(b) - discSum(b, n)).toBeCloseTo(exactVolume(b) / n, 9);
      }
      expect(Math.abs(discSum(b, 100000) - exactVolume(b))).toBeLessThan(exactVolume(b) * 1e-4);
    }
  });

  it('the wall length agrees with a fine polyline and is longer than the straight chord', () => {
    for (const b of [1, 4, 6]) {
      const n = 200000;
      let length = 0;
      for (let i = 0; i < n; i++) {
        const x0 = (b * i) / n;
        const x1 = (b * (i + 1)) / n;
        length += Math.hypot(x1 - x0, tankRadius(x1) - tankRadius(x0));
      }
      expect(wallLength(b)).toBeCloseTo(length, 4);
      expect(wallLength(b)).toBeGreaterThan(Math.hypot(b, tankRadius(b)));
    }
    expect(wallLength(4)).toBeCloseTo(5.92, 2);
  });
});
