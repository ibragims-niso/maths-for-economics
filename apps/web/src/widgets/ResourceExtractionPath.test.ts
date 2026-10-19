import { describe, expect, it } from 'vitest';
import { CHECK_YEAR, extraction, shadowPrice0, stockLeft } from './ResourceExtractionPath';

describe('ResourceExtractionPath maths', () => {
  it('matches DO02 Example 3 (S₀ = 100, ρ = 5 %)', () => {
    expect(extraction(0.05, 100, 0)).toBeCloseTo(5, 12);
    expect(extraction(0.05, 100, CHECK_YEAR)).toBeCloseTo(3.03, 2);
    expect(stockLeft(0.05, 100, CHECK_YEAR)).toBeCloseTo(60.65, 2);
    expect(shadowPrice0(0.05, 100)).toBeCloseTo(0.2, 12);
  });

  it('extracts exactly the stock that is left: ∫ₜ^∞ c(s) ds = S(t)', () => {
    for (const [rho, s0, t] of [
      [0.01, 20, 0],
      [0.05, 100, 10],
      [0.1, 150, 25],
    ] as const) {
      // Midpoint sum out to a horizon where almost nothing is left.
      const end = t + 40 / rho;
      const n = 40000;
      const h = (end - t) / n;
      let sum = 0;
      for (let i = 0; i < n; i++) sum += extraction(rho, s0, t + (i + 0.5) * h) * h;
      expect(sum).toBeCloseTo(stockLeft(rho, s0, t), 3);
    }
  });

  it('uses the share ρ of the remaining stock, so consumption falls at rate ρ', () => {
    for (const rho of [0.01, 0.035, 0.1]) {
      const t = 7;
      expect(extraction(rho, 80, t) / stockLeft(rho, 80, t)).toBeCloseTo(rho, 12);
      const dt = 1e-6;
      const growth =
        (Math.log(extraction(rho, 80, t + dt)) - Math.log(extraction(rho, 80, t))) / dt;
      expect(growth).toBeCloseTo(-rho, 6);
    }
  });
});
