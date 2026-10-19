import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { bondPriceAnnualCoupon } from './bond-price-annual-coupon';
import { bondPriceFallRateRise } from './bond-price-fall-rate-rise';
import { zeroCouponBondYield } from './zero-coupon-bond-yield';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors };
};

/** True when x has at most 2 decimal places. */
const twoDecimals = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;

/** Price by backward induction: at maturity the bond is worth F; one year earlier (C + next value)/(1 + y). */
function priceBackwards(face: number, couponPct: number, yieldPct: number, years: number) {
  const coupon = (face * couponPct) / 100;
  let value = face;
  // Each step moves one year closer to today: that year's coupon plus the value then, discounted.
  for (let k = 0; k < years; k++) value = (coupon + value) / (1 + yieldPct / 100);
  return value;
}

/** Price as the sum of every cash flow discounted on its own. */
function priceByFlows(face: number, couponPct: number, yieldPct: number, years: number) {
  let pv = 0;
  for (let k = 1; k <= years; k++) {
    const flow = (face * couponPct) / 100 + (k === years ? face : 0);
    pv += flow / (1 + yieldPct / 100) ** k;
  }
  return pv;
}

describe('bond-price-annual-coupon', () => {
  it('equals the value found backwards from maturity, year by year', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bondPriceAnnualCoupon, seed);
        const exact = priceBackwards(p.face, p.coupon, p.yield, p.years);
        expect(Math.abs(value - exact)).toBeLessThanOrEqual(0.005 + 1e-6);
        expect(Math.abs(value - priceByFlows(p.face, p.coupon, p.yield, p.years))).toBeLessThan(
          0.005 + 1e-6,
        );
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('trades at a premium exactly when the coupon rate is above the yield', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bondPriceAnnualCoupon, seed);
        expect(p.coupon).not.toBe(p.yield);
        expect(value > p.face).toBe(p.coupon > p.yield);
        // Between the face value alone, discounted, and all payments added up.
        expect(value).toBeGreaterThan(p.face / (1 + p.yield / 100) ** p.years);
        expect(value).toBeLessThan(p.face * (1 + (p.coupon / 100) * p.years));
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers and all four mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, distractors } = solve(bondPriceAnnualCoupon, seed);
        expect([100, 1000]).toContain(p.face);
        expect(p.coupon).toBeGreaterThanOrEqual(1);
        expect(p.coupon).toBeLessThanOrEqual(10);
        expect(p.yield).toBeGreaterThanOrEqual(1.5);
        expect(p.yield).toBeLessThanOrEqual(12);
        expect(Number.isInteger(p.years) && p.years >= 2 && p.years <= 10).toBe(true);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['COUPONS_UNDISCOUNTED', 'COUPON_RATE_USED', 'FORGOT_FACE', 'UNDISCOUNTED'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in FM07 (5 % coupon, 10 years, yield 6 %)', () => {
    const p = { context: 'government', face: 1000, coupon: 5, yield: 6, years: 10 } as const;
    expect(bondPriceAnnualCoupon.answer(p)).toMatchObject({ kind: 'numeric', value: 926.4 });
  });
});

describe('zero-coupon-bond-yield', () => {
  it('discounting the face value at the answer gives back the price', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zeroCouponBondYield, seed);
        // A yield to 2 decimals is off by at most 0.005 points, which moves the price by less
        // than n × 0.00005 of itself.
        const back = p.face / (1 + value / 100) ** p.years;
        expect(Math.abs(back - p.price) / p.price).toBeLessThan(p.years * 0.00005);
      }),
      RUNS,
    );
  });

  it('agrees with a bisection search for the rate', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(zeroCouponBondYield, seed);
        let lo = 0;
        let hi = 1;
        for (let k = 0; k < 60; k++) {
          const mid = (lo + hi) / 2;
          if (p.face / (1 + mid) ** p.years > p.price) lo = mid;
          else hi = mid;
        }
        expect(Math.abs(value - lo * 100)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(value).toBe(p.rate);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers and all three mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(zeroCouponBondYield, seed);
        expect(p.price).toBeGreaterThan(0);
        expect(p.price).toBeLessThan(p.face);
        expect(twoDecimals(p.price)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(2);
        expect(value).toBeLessThanOrEqual(12);
        expect(Math.abs(value * 4 - Math.round(value * 4))).toBeLessThan(1e-9);
        expect(Number.isInteger(p.years) && p.years >= 2 && p.years <= 10).toBe(true);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['RATIO_INVERTED', 'SIMPLE_YIELD', 'TOTAL_RETURN'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in FM07 (747.26 for 1000 in 5 years)', () => {
    const p = { context: 'government', rate: 6, years: 5, face: 1000, price: 747.26 } as const;
    expect(zeroCouponBondYield.answer(p)).toMatchObject({ kind: 'numeric', value: 6 });
  });
});

describe('bond-price-fall-rate-rise', () => {
  it('equals the drop in the sum of the discounted cash flows', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bondPriceFallRateRise, seed);
        const drop =
          priceByFlows(p.face, p.coupon, p.yield, p.years) -
          priceByFlows(p.face, p.coupon, p.yield + 1, p.years);
        // Both prices are rounded to the cent before subtracting.
        expect(Math.abs(value - drop)).toBeLessThanOrEqual(0.01 + 1e-6);
        expect(value).toBeGreaterThan(0);
        expect(twoDecimals(value)).toBe(true);
      }),
      RUNS,
    );
  });

  it('a 1-point fall in the yield would raise the price by more (the curve is convex)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bondPriceFallRateRise, seed);
        if (p.yield <= 1) return;
        const gain =
          priceBackwards(p.face, p.coupon, p.yield - 1, p.years) -
          priceBackwards(p.face, p.coupon, p.yield, p.years);
        expect(gain).toBeGreaterThan(value - 0.01);
      }),
      RUNS,
    );
  });

  it('keeps sensible numbers and all three mistakes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, distractors } = solve(bondPriceFallRateRise, seed);
        expect([100, 1000]).toContain(p.face);
        expect(p.coupon).toBeGreaterThanOrEqual(1);
        expect(p.coupon).toBeLessThanOrEqual(8);
        expect(p.yield).toBeGreaterThanOrEqual(1);
        expect(p.yield).toBeLessThanOrEqual(10);
        expect(Number.isInteger(p.years) && p.years >= 2 && p.years <= 12).toBe(true);
        expect(distractors.map((d) => d.mistakeCode).sort()).toEqual(
          ['FACE_ONLY', 'NEW_PRICE_GIVEN', 'ONE_PERCENT_RULE'].sort(),
        );
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in FM07 (yield 6 % to 7 %, 10-year 5 % bond)', () => {
    const p = { face: 1000, coupon: 5, yield: 6, years: 10 } as const;
    expect(bondPriceFallRateRise.answer(p)).toMatchObject({ kind: 'numeric', value: 66.87 });
  });
});
