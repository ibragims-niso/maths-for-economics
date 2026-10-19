import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { bertrandCartelMaxFirms } from './bertrand-cartel-max-firms';
import { grimTriggerCriticalDiscount } from './grim-trigger-critical-discount';
import { grimTriggerPresentValues } from './grim-trigger-present-values';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

/** The present value of a payoff stream, added term by term (no series formula). */
function presentValue(payoff: (t: number) => number, delta: number, periods = 3000): number {
  let total = 0;
  let weight = 1;
  for (let t = 0; t < periods; t++) {
    total += weight * payoff(t);
    weight *= delta;
  }
  return total;
}

/** Collude for ever versus cheat in period 0 and be punished from period 1 on. */
const colludeStream = (R: number) => () => R;
const cheatStream = (T: number, P: number) => (t: number) => (t === 0 ? T : P);

const decimalsAtMost = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

describe('grim-trigger-critical-discount', { timeout: SLOW }, () => {
  it('is the δ where colluding stops paying more than cheating, found by adding the streams', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(grimTriggerCriticalDiscount, seed);
        // A prisoner's dilemma with whole payoffs: T > R > P > S ≥ 0.
        for (const x of [p.R, p.S, p.T, p.P]) expect(Number.isInteger(x)).toBe(true);
        expect(p.T).toBeGreaterThan(p.R);
        expect(p.R).toBeGreaterThan(p.P);
        expect(p.P).toBeGreaterThan(p.S);
        expect(p.S).toBeGreaterThanOrEqual(0);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(decimalsAtMost(value, 2)).toBe(true);
        // The true δ* is within 0.005 of the rounded answer: just above, colluding pays more;
        // just below, cheating pays more.
        const gap = (d: number) =>
          presentValue(colludeStream(p.R), d) - presentValue(cheatStream(p.T, p.P), d);
        expect(gap(value + 0.006)).toBeGreaterThan(0);
        expect(gap(value - 0.006)).toBeLessThan(0);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 of GT04 (T = 18, R = 12, P = 8, S = 4)', () => {
    const p = { industry: 'cement producers' as const, R: 12, S: 4, T: 18, P: 8 };
    expect(grimTriggerCriticalDiscount.answer(p)).toMatchObject({ value: 0.6 });
  });
});

describe('grim-trigger-present-values', { timeout: SLOW }, () => {
  it('matches the streams added month by month, to 1 decimal place exactly', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(grimTriggerPresentValues, seed);
        expect(p.T).toBeGreaterThan(p.R);
        expect(p.R).toBeGreaterThan(p.P);
        expect(p.P).toBeGreaterThan(0);
        expect(p.delta).toBeGreaterThan(0);
        expect(p.delta).toBeLessThan(1);
        const cheat = presentValue(cheatStream(p.T, p.P), p.delta);
        const collude = presentValue(colludeStream(p.R), p.delta);
        const expected = p.ask === 'cheat' ? cheat : collude - cheat;
        expect(Math.abs(value - expected)).toBeLessThan(1e-6);
        expect(decimalsAtMost(value, 1)).toBe(true);
        if (p.ask === 'difference') expect(value).not.toBe(0);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 of GT04 (δ = 0.75: cheating is worth 42, colluding 6 more)', () => {
    const base = { industry: 'cement producers' as const, R: 12, T: 18, P: 8, delta: 0.75 };
    expect(grimTriggerPresentValues.answer({ ...base, ask: 'cheat' })).toMatchObject({ value: 42 });
    expect(grimTriggerPresentValues.answer({ ...base, ask: 'difference' })).toMatchObject({
      value: 6,
    });
    expect(
      grimTriggerPresentValues.answer({ ...base, delta: 0.5, ask: 'difference' }),
    ).toMatchObject({ value: -2 });
  });
});

describe('bertrand-cartel-max-firms', { timeout: SLOW }, () => {
  /** Largest n for which a 1/n share for ever beats the whole market once, by adding streams. */
  function largestStableCartel(survive: number, rate: number): number {
    // The market still exists in year t with probability survive^t; money is discounted at rate.
    const delta = survive / (1 + rate);
    // Monopoly profit 1: colluding pays 1/n every year, undercutting pays 1 once and then 0.
    const shareForEver = presentValue(() => 1, delta);
    const undercut = presentValue((t) => (t === 0 ? 1 : 0), delta);
    let best = 0;
    for (let n = 1; n <= 200; n++) if (shareForEver / n >= undercut) best = n;
    return best;
  }

  it('agrees with a brute-force search over the number of firms', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(bertrandCartelMaxFirms, seed);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(2);
        expect(p.survive).toBeGreaterThan(0);
        expect(p.survive).toBeLessThan(100);
        expect(p.rate).toBeGreaterThan(0);
        expect(value).toBe(largestStableCartel(p.survive / 100, p.rate / 100));
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 of GT04 (survival 0.9, interest 4 %: at most 7 firms)', () => {
    expect(bertrandCartelMaxFirms.answer({ survive: 90, rate: 4 })).toMatchObject({ value: 7 });
  });
});
