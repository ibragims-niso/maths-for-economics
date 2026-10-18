import { describe, expect, it } from 'vitest';
import {
  growthLevel,
  growthSlope,
  LOG_FRAME,
  levelFrame,
  levelTicks,
  slopeOverLevelPercent,
} from './GrowthRateExplorer';

describe('growth-rate-explorer', () => {
  it('matches C105 Example 1 (400e^(0.03t) at t = 10)', () => {
    expect(growthLevel(3, 10)).toBeCloseTo(539.94, 2);
    expect(growthSlope(3, 10)).toBeCloseTo(16.2, 2);
    expect(slopeOverLevelPercent(3, 10)).toBeCloseTo(3, 10);
  });

  it('has slope equal to the numerical derivative, and slope ÷ level equal to g everywhere', () => {
    const h = 1e-5;
    for (let g = 0.5; g <= 8; g += 0.5) {
      for (let t = 0; t <= 30; t++) {
        const numeric = (growthLevel(g, t + h) - growthLevel(g, t - h)) / (2 * h);
        expect(growthSlope(g, t)).toBeCloseTo(numeric, 4);
        expect(slopeOverLevelPercent(g, t)).toBeCloseTo(g, 10);
        // On a log scale the path is a straight line with slope g/100.
        expect(Math.log(growthLevel(g, t))).toBeCloseTo(Math.log(400) + (g / 100) * t, 10);
      }
    }
  });

  it('keeps the path inside both graph windows for every slider value', () => {
    for (let g = 0.5; g <= 8; g += 0.5) {
      const f = levelFrame(g);
      for (const tick of levelTicks(g)) expect(tick).toBeLessThan(f.yMax);
      for (let t = 0; t <= 30; t++) {
        const y = growthLevel(g, t);
        expect(y).toBeLessThan(f.yMax);
        expect(Math.log(y)).toBeGreaterThan(LOG_FRAME.yMin);
        expect(Math.log(y)).toBeLessThan(LOG_FRAME.yMax);
      }
    }
  });
});
