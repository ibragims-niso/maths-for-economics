import { describe, expect, it } from 'vitest';
import {
  demand,
  INCOME,
  PRICE_Y,
  type Preference,
  priceElasticity,
  shareOnX,
  utility,
} from './DemandPreferenceTypes';

const PREFS: Preference[] = [1, 2, 3];

describe('DemandPreferenceTypes maths', () => {
  it('shows the numbers quoted in the Try it text of MV10', () => {
    expect(demand(1, 6)).toMatchObject({ x: 10, y: 15 });
    expect(priceElasticity(1, 6)).toBe(-1);
    expect(shareOnX(1, 6)).toBeCloseTo(0.5, 12);
    expect(demand(2, 6)).toMatchObject({ x: 12, y: 12 });
    expect(priceElasticity(2, 6)).toBeCloseTo(-0.6, 12);
    expect(demand(3, 6)).toMatchObject({ x: 0, y: 30 });
    expect(priceElasticity(3, 6)).toBeNull();
    expect(demand(3, 3)).toMatchObject({ x: 40, y: 0 });
    expect(priceElasticity(3, 3)).toBe(-1);
    expect(demand(3, 4).tie).toBe(true);
  });

  it('spends the whole budget and beats every other bundle on the line (brute force)', () => {
    for (const pref of PREFS) {
      for (let px = 3; px <= 12; px++) {
        const best = demand(pref, px);
        expect(px * best.x + PRICE_Y * best.y).toBeCloseTo(INCOME, 9);
        const top = utility(pref, best.x, best.y);
        for (let i = 0; i <= 400; i++) {
          const x = ((INCOME / px) * i) / 400;
          // Clamped at 0: rounding can leave −1e-15 at the end of the line.
          const y = Math.max(0, (INCOME - px * x) / PRICE_Y);
          expect(utility(pref, x, y)).toBeLessThanOrEqual(top + 1e-9);
        }
      }
    }
  });

  it('gives elasticities equal to a numerical log-derivative of demand', () => {
    for (const pref of PREFS) {
      for (let px = 3; px <= 12; px++) {
        const e = priceElasticity(pref, px);
        const h = 1e-4;
        const up = demand(pref, px * (1 + h)).x;
        const down = demand(pref, px * (1 - h)).x;
        if (e === null) {
          expect(demand(pref, px).x === 0 || demand(pref, px).tie).toBe(true);
          continue;
        }
        const numeric = (Math.log(up) - Math.log(down)) / (Math.log(1 + h) - Math.log(1 - h));
        expect(numeric).toBeCloseTo(e, 6);
      }
    }
  });

  it('keeps the Cobb–Douglas budget share fixed and the complements share rising with p_x', () => {
    for (let px = 3; px <= 12; px++) expect(shareOnX(1, px)).toBeCloseTo(0.5, 12);
    for (let px = 3; px < 12; px++) {
      expect(shareOnX(2, px + 1) ?? 0).toBeGreaterThan(shareOnX(2, px) ?? 1);
    }
  });
});
