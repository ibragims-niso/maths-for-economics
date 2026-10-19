import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { cakeEatingConsumptionAtTime } from './cake-eating-consumption-at-time';
import { hotellingRentAtTime } from './hotelling-rent-at-time';
import { keynesRamseyConsumptionGrowth } from './keynes-ramsey-consumption-growth';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();

/** The x in [lo, hi] that maximises a single-peaked f, by golden-section search. */
function argmax(f: (x: number) => number, lo: number, hi: number): number {
  const k = (Math.sqrt(5) - 1) / 2;
  let a = lo;
  let b = hi;
  for (let i = 0; i < 200 && b - a > 1e-12 * (1 + Math.abs(b)); i++) {
    const x1 = b - k * (b - a);
    const x2 = a + k * (b - a);
    if (f(x1) < f(x2)) a = x1;
    else b = x2;
  }
  return (a + b) / 2;
}

const hasAtMostDecimals = (v: number, d: number) =>
  Math.abs(Math.round(v * 10 ** d) - v * 10 ** d) < 1e-6;

describe('hotelling-rent-at-time', () => {
  it('equals the value of selling now and banking the money with ever finer compounding', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(hotellingRentAtTime, seed);
        expect(p.rent0).toBeGreaterThanOrEqual(10);
        expect(p.rate).toBeGreaterThan(0);
        expect(p.years).toBeGreaterThanOrEqual(3);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        // No arbitrage: a tonne kept for t years must be worth the bank balance from selling it now.
        const n = 1e7;
        const banked = p.rent0 * (1 + p.rate / 100 / n) ** (n * p.years);
        expect(Math.abs(banked - value)).toBeLessThan(0.006 + 1e-4 * value);
        // The discounted rent is the constant shadow price λ = p₀.
        expect(value * Math.exp((-p.rate / 100) * p.years)).toBeCloseTo(p.rent0, 1);
        expect(value).toBeGreaterThan(p.rent0);
        expect(codes(problem.distractors)).toEqual([
          'ANNUAL_COMPOUNDING',
          'RENT_FALLS',
          'SIMPLE_GROWTH',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DO02 Example 1 (rent 20 at 5 %, 10 years: 32.97)', () => {
    const p = { rent0: 20, rate: 5, years: 10 };
    expect(hotellingRentAtTime.answer(p)).toMatchObject({ value: 32.97 });
    expect(hotellingRentAtTime.distractors(p).map((d) => d.value)).toEqual([30, 12.13, 32.58]);
  });
});

describe('keynes-ramsey-consumption-growth', () => {
  it('matches the best split between consuming now and a little later, found numerically', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(keynesRamseyConsumptionGrowth, seed);
        expect(p.rate).not.toBe(p.rho);
        expect(p.sigma).toBeGreaterThan(0);
        expect(p.sigma).not.toBe(1);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        // Two dates h apart: consume c₀ now, the rest grows at r until h. Utility is CRRA.
        const r = p.rate / 100;
        const rho = p.rho / 100;
        const h = 1;
        const W = 100;
        const u = (c: number) => c ** (1 - p.sigma) / (1 - p.sigma);
        const total = (c0: number) => u(c0) + Math.exp(-rho * h) * u(Math.exp(r * h) * (W - c0));
        const c0 = argmax(total, 1e-6, W - 1e-6);
        const c1 = Math.exp(r * h) * (W - c0);
        const growthPct = (100 * Math.log(c1 / c0)) / h;
        expect(Math.abs(growthPct - value)).toBeLessThan(0.0051);
        // Consumption grows exactly when the interest rate beats impatience.
        expect(Math.sign(value)).toBe(Math.sign(p.rate - p.rho));
        expect(codes(problem.distractors)).toEqual([
          'IGNORED_SIGMA',
          'MULTIPLIED_BY_SIGMA',
          'SIGN_REVERSED',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DO02 Example 2 (r = 6 %, ρ = 2 %, σ = 2: 2 %)', () => {
    const p = { rate: 6, rho: 2, sigma: 2 };
    expect(keynesRamseyConsumptionGrowth.answer(p)).toMatchObject({ value: 2 });
    expect(keynesRamseyConsumptionGrowth.distractors(p).map((d) => d.value)).toEqual([4, 8, -2]);
  });
});

describe('cake-eating-consumption-at-time', () => {
  it('matches the limit of the discrete-time rule c = (1 − β)x with very short periods', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(cakeEatingConsumptionAtTime, seed);
        expect(p.stock).toBeGreaterThan(0);
        expect(p.year).toBeGreaterThanOrEqual(1);
        expect(value).toBeGreaterThan(0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        const rho = p.rho / 100;
        // Periods of length h, β = e^(−ρh): each period eat (1 − β) of what is left (DO03).
        const h = 1e-5;
        const beta = Math.exp(-rho * h);
        const left = p.stock * beta ** Math.round(p.year / h);
        const rate = ((1 - beta) * left) / h;
        expect(Math.abs(rate - value)).toBeLessThan(0.006 + 1e-3 * value);
        // Among paths γS₀e^(−γt), which all use up the stock, γ = ρ gives the most utility:
        // J(γ) = ∫ e^(−ρt) ln(γS₀e^(−γt)) dt = ln(γS₀)/ρ − γ/ρ².
        const J = (g: number) => Math.log(g * p.stock) / rho - g / rho ** 2;
        expect(argmax(J, rho / 50, rho * 50)).toBeCloseTo(rho, 6);
        // The path implied by the answer uses up the whole stock: ∫₀^∞ c = c(0)/ρ = S₀,
        // up to the rounding of the answer (at most 0.005), carried back to t = 0.
        const c0 = value * Math.exp(rho * p.year);
        const slack = (0.0051 * Math.exp(rho * p.year)) / rho;
        expect(Math.abs(c0 / rho - p.stock)).toBeLessThan(slack);
        expect(codes(problem.distractors)).toEqual([
          'CONSTANT_CONSUMPTION',
          'STOCK_NOT_FLOW',
          'TILT_WRONG_WAY',
        ]);
      }),
      RUNS,
    );
  });

  it('reproduces DO02 Example 3 (S₀ = 100, ρ = 5 %, t = 10: 3.03)', () => {
    const p = { rho: 5, stock: 100, year: 10 };
    expect(cakeEatingConsumptionAtTime.answer(p)).toMatchObject({ value: 3.03 });
    expect(cakeEatingConsumptionAtTime.distractors(p).map((d) => d.value)).toEqual([
      5, 60.65, 8.24,
    ]);
  });
});
