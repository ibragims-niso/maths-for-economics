import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import type { Bimatrix } from '../GT01/game';
import { auditProbabilityIndifference } from './audit-probability-indifference';
import { mixedEquilibriumExpectedPayoff } from './mixed-equilibrium-expected-payoff';
import { mixedEquilibriumProbability } from './mixed-equilibrium-probability';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

const A = (g: Bimatrix, r: number, c: number) => g.a[r]?.[c] ?? 0;
const B = (g: Bimatrix, r: number, c: number) => g.b[r]?.[c] ?? 0;

/** Expected payoffs of each pure choice when the opponent mixes: A's rows against q, B's columns against p. */
const rowPay = (g: Bimatrix, r: number, q: number) => q * A(g, r, 0) + (1 - q) * A(g, r, 1);
const colPay = (g: Bimatrix, c: number, p: number) => p * B(g, 0, c) + (1 - p) * B(g, 1, c);

/** Root of a function that changes sign on [0, 1], by bisection (no formula). */
function bisect(f: (x: number) => number): number {
  let lo = 0;
  let hi = 1;
  const sLo = Math.sign(f(lo));
  expect(sLo).not.toBe(0);
  expect(Math.sign(f(hi))).toBe(-sLo);
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(f(mid)) === sLo) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The mixed equilibrium found by bisection: p makes B indifferent, q makes A indifferent. */
const equilibriumByBisection = (g: Bimatrix) => ({
  p: bisect((x) => colPay(g, 0, x) - colPay(g, 1, x)),
  q: bisect((x) => rowPay(g, 0, x) - rowPay(g, 1, x)),
});

/** No cell survives a one-player deviation (pure equilibria checked the long way). */
function hasNoPureEquilibrium(g: Bimatrix): boolean {
  for (const r of [0, 1])
    for (const c of [0, 1])
      if (A(g, r, c) >= A(g, 1 - r, c) && B(g, r, c) >= B(g, r, 1 - c)) return false;
  return true;
}

const decimalsOk = (x: number, d: number) => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Example 3 of GT02: two supermarkets, rows and columns Promote / Regular. */
const PROMOTION: Bimatrix = {
  a: [
    [4, 3],
    [2, 6],
  ],
  b: [
    [2, 5],
    [6, 4],
  ],
};

describe('mixed-equilibrium-probability', { timeout: SLOW }, () => {
  it('equals the probability found by bisection that makes the OTHER firm indifferent', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(mixedEquilibriumProbability, seed);
        expect(hasNoPureEquilibrium(p.game)).toBe(true);
        const eq = equilibriumByBisection(p.game);
        const x = p.asked === 'A' ? eq.p : eq.q;
        expect(Math.abs(value - x)).toBeLessThanOrEqual(0.0005 + 1e-9);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(1);
        expect(decimalsOk(value, 3)).toBe(true);
      }),
      RUNS,
    );
  });

  it('is a Nash equilibrium: at the mixes, no pure deviation pays more for either firm', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(mixedEquilibriumProbability, seed);
        const eq = equilibriumByBisection(p.game);
        const uA = (x: number) => x * rowPay(p.game, 0, eq.q) + (1 - x) * rowPay(p.game, 1, eq.q);
        const uB = (y: number) => y * colPay(p.game, 0, eq.p) + (1 - y) * colPay(p.game, 1, eq.p);
        for (const dev of [0, 1]) {
          expect(uA(dev)).toBeLessThanOrEqual(uA(eq.p) + 1e-9);
          expect(uB(dev)).toBeLessThanOrEqual(uB(eq.q) + 1e-9);
        }
      }),
      RUNS,
    );
  });

  it('uses whole payoffs 0–9, all contexts and both firms, with three distinct wrong answers', () => {
    const contexts = new Set<string>();
    const asked = new Set<string>();
    const answers = new Set<number>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(mixedEquilibriumProbability, seed);
        for (const x of [...p.game.a.flat(), ...p.game.b.flat()]) {
          expect(Number.isInteger(x) && x >= 0 && x <= 9).toBe(true);
        }
        expect(problem.distractors).toHaveLength(3);
        contexts.add(p.context);
        asked.add(p.asked);
        answers.add(value);
      }),
      RUNS,
    );
    expect(contexts.size).toBe(4);
    expect(asked.size).toBe(2);
    expect(answers.size).toBeGreaterThan(30);
  });

  it('reproduces Example 3 in GT02: A promotes with probability 0.4, B with 0.6', () => {
    expect(
      mixedEquilibriumProbability.answer({ context: 'promotion', game: PROMOTION, asked: 'A' }),
    ).toMatchObject({ value: 0.4 });
    expect(
      mixedEquilibriumProbability.answer({ context: 'promotion', game: PROMOTION, asked: 'B' }),
    ).toMatchObject({ value: 0.6 });
    // The classic mix-up (A's own indifference) gives 0.6 for A.
    const wrong = mixedEquilibriumProbability.distractors({
      context: 'promotion',
      game: PROMOTION,
      asked: 'A',
    });
    expect(wrong.find((d) => d.mistakeCode === 'OWN_INDIFFERENCE')?.value).toBe(0.6);
  });
});

describe('audit-probability-indifference', { timeout: SLOW }, () => {
  it('leaves the taxpayer exactly indifferent: cheating gains nothing on average', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(auditProbabilityIndifference, seed);
        // The answer is exact (no rounding), so substituting it back gives zero.
        expect((1 - value) * p.gain - value * p.fine).toBeCloseTo(0, 9);
        // A slightly lower audit rate makes cheating pay; a slightly higher one makes it lose.
        expect((1 - (value - 0.01)) * p.gain - (value - 0.01) * p.fine).toBeGreaterThan(0);
        expect((1 - (value + 0.01)) * p.gain - (value + 0.01) * p.fine).toBeLessThan(0);
        expect(decimalsOk(value, 3)).toBe(true);
      }),
      RUNS,
    );
  });

  it('pairs with a cheating rate cost/gain that leaves the office indifferent', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(auditProbabilityIndifference, seed);
        const q = p.cost / p.gain;
        // Audit: pay the cost and recover any tax; no audit: lose the tax whenever there is a cheat.
        expect(-p.cost).toBeCloseTo(-q * p.gain, 9);
        expect(q).toBeGreaterThan(0);
        expect(q).toBeLessThan(1);
      }),
      RUNS,
    );
  });

  it('has whole amounts, a fine above the gain, a cost below it, and three wrong answers', () => {
    const answers = new Set<number>();
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(auditProbabilityIndifference, seed);
        for (const x of [p.gain, p.fine, p.cost]) expect(Number.isInteger(x) && x > 0).toBe(true);
        expect(p.fine).toBeGreaterThan(p.gain);
        expect(p.cost).toBeLessThan(p.gain);
        expect(value).toBeGreaterThan(0);
        expect(value).toBeLessThan(0.5);
        expect(problem.distractors).toHaveLength(3);
        answers.add(value);
      }),
      RUNS,
    );
    expect(answers.size).toBeGreaterThan(30);
  });

  it('reproduces Example 1 in GT02: gain 10, fine 30, cost 2 → audit rate 0.25', () => {
    const ex = { gain: 10, fine: 30, cost: 2 };
    expect(auditProbabilityIndifference.answer(ex)).toMatchObject({ value: 0.25 });
    const wrong = auditProbabilityIndifference.distractors(ex);
    expect(wrong.map((d) => d.value)).toEqual([0.2, 0.75, 0.333]);
  });
});

describe('mixed-equilibrium-expected-payoff', { timeout: SLOW }, () => {
  it('equals the double sum over all four cells with the bisection mixes', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(mixedEquilibriumExpectedPayoff, seed);
        const eq = equilibriumByBisection(p.game);
        const pay = p.asked === 'A' ? A : B;
        let total = 0;
        for (const r of [0, 1])
          for (const c of [0, 1])
            total += (r === 0 ? eq.p : 1 - eq.p) * (c === 0 ? eq.q : 1 - eq.q) * pay(p.game, r, c);
        expect(Math.abs(value - total)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(decimalsOk(value, 2)).toBe(true);
      }),
      RUNS,
    );
  });

  it('lies between the firm’s smallest and largest payoffs, with three wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(mixedEquilibriumExpectedPayoff, seed);
        const own = (p.asked === 'A' ? p.game.a : p.game.b).flat();
        expect(value).toBeGreaterThanOrEqual(Math.min(...own));
        expect(value).toBeLessThanOrEqual(Math.max(...own));
        expect(hasNoPureEquilibrium(p.game)).toBe(true);
        expect(problem.distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in GT02: A expects 3.6 and B 4.4', () => {
    expect(
      mixedEquilibriumExpectedPayoff.answer({ context: 'promotion', game: PROMOTION, asked: 'A' }),
    ).toMatchObject({ value: 3.6 });
    expect(
      mixedEquilibriumExpectedPayoff.answer({ context: 'promotion', game: PROMOTION, asked: 'B' }),
    ).toMatchObject({ value: 4.4 });
  });
});
