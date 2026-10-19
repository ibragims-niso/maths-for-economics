import { describe, expect, it } from 'vitest';
import {
  describeFit,
  INCOME,
  leastSquares,
  residuals,
  rSquared,
  SPENDING,
  ssrOf,
  sst,
} from './LeastSquaresFit';

const sum = (vs: number[]) => vs.reduce((s, v) => s + v, 0);

describe('LeastSquaresFit', () => {
  it('reproduces ST205 Example 2: ŷ = 10 + 0.8x, SSR = 176, SST = 2864, R² = 0.939', () => {
    const { b0, b1 } = leastSquares();
    expect(b0).toBeCloseTo(10, 12);
    expect(b1).toBeCloseTo(0.8, 12);
    expect(ssrOf(b0, b1)).toBeCloseTo(176, 9);
    expect(sst()).toBe(2864);
    expect(rSquared()).toBeCloseTo(0.9385, 4);
    expect(residuals(b0, b1).map((e) => Math.round(e * 1e9) / 1e9)).toEqual([
      4, -6, 2, 4, -8, 0, 6, -2,
    ]);
  });

  it('the start line (b₀ = 30, b₁ = 0.5) has SSR 652 and residuals adding up to −28', () => {
    expect(ssrOf(30, 0.5)).toBeCloseTo(652, 9);
    expect(sum(residuals(30, 0.5))).toBeCloseTo(-28, 9);
    expect(describeFit(30, 0.5)).toContain('476 more');
    expect(describeFit(30, 0.5)).toContain('lower the intercept');
  });

  it('shifting the best line by c raises SSR by n·c² (8 × 2² = 32)', () => {
    expect(ssrOf(12, 0.8)).toBeCloseTo(208, 9);
    expect(ssrOf(8, 0.8)).toBeCloseTo(208, 9);
    expect(describeFit(12, 0.8)).toContain('lower the intercept');
    expect(describeFit(8, 0.8)).toContain('raise the intercept');
  });

  it('no slider position beats the least-squares line', () => {
    const best = ssrOf(10, 0.8);
    for (let b1 = 0.3; b1 <= 1.3 + 1e-9; b1 += 0.05) {
      for (let b0 = -10; b0 <= 40; b0 += 1) {
        expect(ssrOf(b0, b1)).toBeGreaterThanOrEqual(best - 1e-9);
      }
    }
    expect(describeFit(10, 0.8)).toMatch(/found the least-squares line/);
  });

  it('R² equals the squared correlation of income and spending', () => {
    const mx = sum(INCOME) / 8;
    const my = sum(SPENDING) / 8;
    const sxy = sum(INCOME.map((x, i) => (x - mx) * ((SPENDING[i] ?? 0) - my)));
    const sxx = sum(INCOME.map((x) => (x - mx) ** 2));
    const r = sxy / Math.sqrt(sxx * sst());
    expect(rSquared()).toBeCloseTo(r * r, 12);
  });
});
