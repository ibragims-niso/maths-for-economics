import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { binomialTreeCallOnePeriod } from './binomial-tree-call-one-period';
import { binomialTreePutTwoPeriod } from './binomial-tree-put-two-period';
import { binomialTreeReplicatingLoan } from './binomial-tree-replicating-loan';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const byCode = (ds: { value: number; mistakeCode: string }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

/**
 * Replication without any probability: find Δ shares and a bond holding B (B < 0 is borrowing)
 * with Δ·S_up + B·R = V_up and Δ·S_down + B·R = V_down, by Cramer's rule. Returns Δ, B and the
 * cost today Δ·S + B.
 */
function replicate(s: number, sUp: number, sDown: number, r: number, vUp: number, vDown: number) {
  const det = sUp * r - sDown * r;
  const delta = (vUp * r - vDown * r) / det;
  const bond = (sUp * vDown - sDown * vUp) / det;
  return { delta, bond, cost: delta * s + bond };
}

/** The tree written out from the percentages, without the generators' helpers. */
const tree = (p: { s0: number; upPct: number; downPct: number; ratePct: number }) => ({
  u: (100 + p.upPct) / 100,
  d: (100 - p.downPct) / 100,
  r: (100 + p.ratePct) / 100,
});

describe('binomial-tree-call-one-period', () => {
  it('equals the cost of the replicating portfolio (no probabilities used)', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(binomialTreeCallOnePeriod, seed);
        const { u, d, r } = tree(p);
        const su = p.s0 * u;
        const sd = p.s0 * d;
        const rep = replicate(
          p.s0,
          su,
          sd,
          r,
          Math.max(su - p.strike, 0),
          Math.max(sd - p.strike, 0),
        );
        expect(Math.abs(value - rep.cost)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Δ between 0 and 1 and a loan (negative bond): a call is a leveraged position in the share.
        expect(rep.delta).toBeGreaterThan(0);
        expect(rep.delta).toBeLessThan(1);
        expect(rep.bond).toBeLessThan(0);
      }),
      RUNS,
    );
  });

  it('has no arbitrage, whole-number prices and a strike between them', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(binomialTreeCallOnePeriod, seed);
        const { u, d, r } = tree(p);
        expect(d).toBeLessThan(r);
        expect(r).toBeLessThan(u);
        const su = p.s0 * u;
        const sd = p.s0 * d;
        expect(Number.isInteger(Math.round(su * 1e6) / 1e6)).toBe(true);
        expect(Number.isInteger(Math.round(sd * 1e6) / 1e6)).toBe(true);
        expect(p.strike * 100).toBeGreaterThan(p.s0 * (100 - p.downPct));
        expect(p.strike * 100).toBeLessThan(p.s0 * (100 + p.upPct));
        expect(p.realUpTenths).toBeGreaterThanOrEqual(3);
        expect(p.realUpTenths).toBeLessThanOrEqual(8);
        // The call is worth less than the share and more than its value if exercised today.
        expect(value).toBeGreaterThanOrEqual(0.5);
        expect(value).toBeLessThan(p.s0);
        expect(value).toBeGreaterThanOrEqual(Math.max(p.s0 - p.strike / r, 0) - 0.005);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in SP04 (S₀ = 100, u = 1.25, d = 0.9, R = 1.04, K = 100)', () => {
    const p = {
      firm: 'airline',
      s0: 100,
      upPct: 25,
      downPct: 10,
      ratePct: 4,
      strike: 100,
      realUpTenths: 7,
    } as const;
    expect(binomialTreeCallOnePeriod.answer(p)).toMatchObject({ value: 9.62 });
    expect(byCode(binomialTreeCallOnePeriod.distractors(p))).toEqual({
      REAL_WORLD_PROB: 16.83,
      NO_DISCOUNT: 10,
      SWAPPED_Q: 14.42,
    });
  });
});

describe('binomial-tree-replicating-loan', () => {
  it('borrows exactly what makes the portfolio pay the call in both states', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(binomialTreeReplicatingLoan, seed);
        const { u, d, r } = tree(p);
        const su = p.s0 * u;
        const sd = p.s0 * d;
        const cu = su - p.strike;
        const rep = replicate(p.s0, su, sd, r, cu, 0);
        expect(Math.abs(value - -rep.bond)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Substitute back: shares minus the repayment equal the call payoff in each state.
        expect(Math.abs(rep.delta * su - value * r - cu)).toBeLessThan(0.006 * r + 1e-9);
        expect(Math.abs(rep.delta * sd - value * r)).toBeLessThan(0.006 * r + 1e-9);
        // The portfolio's cost agrees with the risk-neutral price of the call.
        const q = (r - d) / (u - d);
        expect(Math.abs(rep.delta * p.s0 - value - (q * cu) / r)).toBeLessThan(0.006);
      }),
      RUNS,
    );
  });

  it('uses a sensible tree and a readable loan', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(binomialTreeReplicatingLoan, seed);
        const { u, d, r } = tree(p);
        expect(d).toBeLessThan(r);
        expect(r).toBeLessThan(u);
        expect(p.strike * 100).toBeGreaterThan(p.s0 * (100 - p.downPct));
        expect(p.strike * 100).toBeLessThan(p.s0 * (100 + p.upPct));
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(p.s0);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 1 in SP04 (borrow 61.81)', () => {
    const p = {
      asset: 'energy',
      s0: 100,
      upPct: 25,
      downPct: 10,
      ratePct: 4,
      strike: 100,
    } as const;
    expect(binomialTreeReplicatingLoan.answer(p)).toMatchObject({ value: 61.81 });
    expect(byCode(binomialTreeReplicatingLoan.distractors(p))).toEqual({
      NO_DISCOUNT: 64.29,
      SHARE_VALUE: 71.43,
      GAVE_CALL_PRICE: 9.62,
    });
  });
});

describe('binomial-tree-put-two-period', () => {
  it('matches node-by-node replication, the path sum and put–call parity', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(binomialTreePutTwoPeriod, seed);
        const { u, d, r } = tree(p);
        const k = p.strike;
        const s = (ups: number, downs: number) => p.s0 * u ** ups * d ** downs;
        const putPay = (x: number) => Math.max(k - x, 0);
        // Route 1: replicate at each node, no probabilities at all.
        const vu = replicate(s(1, 0), s(2, 0), s(1, 1), r, putPay(s(2, 0)), putPay(s(1, 1))).cost;
        const vd = replicate(s(0, 1), s(1, 1), s(0, 2), r, putPay(s(1, 1)), putPay(s(0, 2))).cost;
        const v0 = replicate(p.s0, s(1, 0), s(0, 1), r, vu, vd).cost;
        expect(Math.abs(value - v0)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Route 2: four paths, each with risk-neutral probability q^ups (1 − q)^downs.
        const q = (r - d) / (u - d);
        let putSum = 0;
        let callSum = 0;
        for (const path of [
          [1, 1],
          [1, 0],
          [0, 1],
          [0, 0],
        ]) {
          const ups = path.reduce((a, b) => a + b, 0);
          const prob = q ** ups * (1 - q) ** (2 - ups);
          putSum += prob * putPay(s(ups, 2 - ups));
          callSum += prob * Math.max(s(ups, 2 - ups) - k, 0);
        }
        expect(Math.abs(value - putSum / r ** 2)).toBeLessThanOrEqual(0.005 + 1e-9);
        // Route 3: put–call parity, C − P = S₀ − K/R².
        expect(Math.abs(callSum / r ** 2 - value - (p.s0 - k / r ** 2))).toBeLessThan(0.006);
      }),
      RUNS,
    );
  });

  it('uses prices with at most 2 decimals, a strike the put can reach and a readable answer', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(binomialTreePutTwoPeriod, seed);
        const { u, d, r } = tree(p);
        expect(d).toBeLessThan(r);
        expect(r).toBeLessThan(u);
        for (const [ups, downs] of [
          [2, 0],
          [1, 1],
          [0, 2],
        ] as const) {
          expect(hasAtMostDecimals(p.s0 * u ** ups * d ** downs, 2)).toBe(true);
        }
        // Whole-number comparisons: K·100² > S₀(100 − b)² and K·100 ≤ S₀(100 + a).
        expect(p.strike * 10000).toBeGreaterThan(p.s0 * (100 - p.downPct) ** 2);
        expect(p.strike * 100).toBeLessThanOrEqual(p.s0 * (100 + p.upPct));
        expect(value).toBeGreaterThanOrEqual(0.5);
        // A European put is worth less than the present value of the strike.
        expect(value).toBeLessThan(p.strike / r ** 2);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(distractors).toHaveLength(4);
      }),
      RUNS,
    );
  });

  it('reproduces worked example 3 in SP04 (two-period put, K = 100: 6.32)', () => {
    const p = { firm: 'steel', s0: 100, upPct: 25, downPct: 10, ratePct: 4, strike: 100 } as const;
    expect(binomialTreePutTwoPeriod.answer(p)).toMatchObject({ value: 6.32 });
    expect(byCode(binomialTreePutTwoPeriod.distractors(p))).toEqual({
      ONE_DISCOUNT: 6.58,
      NO_DISCOUNT: 6.84,
      SWAPPED_Q: 2.81,
      CALL_PAYOFF: 13.87,
    });
  });
});
