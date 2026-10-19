import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { saddlePathInitialJump } from './saddle-path-initial-jump';
import { stabilityThresholdTraceDeterminant } from './stability-threshold-trace-determinant';
import { twoMarketSteadyStatePrice } from './two-market-steady-state-price';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, distractors: pr.distractors, stem: pr.stem };
};

/** True when x has at most d decimal places (up to floating-point noise). */
const hasDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));

type Vec = [number, number];
type Field = (x: Vec) => Vec;

/** x(T) for ẋ = f(x) from x(0), by the classical Runge–Kutta method with step h. */
function integrate(f: Field, x0: Vec, T: number, h: number): Vec {
  let x = x0;
  const add = (u: Vec, v: Vec, s: number): Vec => [u[0] + s * v[0], u[1] + s * v[1]];
  for (let t = 0; t < T - 1e-9; t += h) {
    const k1 = f(x);
    const k2 = f(add(x, k1, h / 2));
    const k3 = f(add(x, k2, h / 2));
    const k4 = f(add(x, k3, h));
    x = [
      x[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
      x[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    ];
  }
  return x;
}

/** Reads "122 - 5p_1 + 3p_2" into its constant and the coefficients of p_1 and p_2. */
function parseLinear(text: string): { constant: number; p1: number; p2: number } {
  const out = { constant: 0, p1: 0, p2: 0 };
  for (const term of text.trim().split(/\s+(?=[+-]\s)/)) {
    const m = /^([+-]?)\s*(\d+(?:\.\d+)?)?(p_1|p_2)?$/.exec(term.trim());
    if (!m) throw new Error(`cannot read term "${term}"`);
    const size = m[2] === undefined ? 1 : Number(m[2]);
    const value = m[1] === '-' ? -size : size;
    if (m[3] === 'p_1') out.p1 += value;
    else if (m[3] === 'p_2') out.p2 += value;
    else out.constant += value;
  }
  return out;
}

// Answers are re-derived by reading the equations from the stem and integrating them, by
// scanning the parameter for stability, and by following paths from the claimed start; never
// with the formulas the generators use.
describe('two-market-steady-state-price', () => {
  it('solves the equations read from the stem, and prices integrated from zero settle there', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(twoMarketSteadyStatePrice, seed);
        const eq1 = parseLinear(/\\dot p_1 = ([^$]+)\$/.exec(stem)?.[1] ?? '');
        const eq2 = parseLinear(/\\dot p_2 = ([^$]+)\$/.exec(stem)?.[1] ?? '');
        const f: Field = ([x, y]) => [
          eq1.constant + eq1.p1 * x + eq1.p2 * y,
          eq2.constant + eq2.p1 * x + eq2.p2 * y,
        ];
        // Substitute the answer: the other price follows from the asked price's own equation,
        // and then both rates of change must be zero.
        const other =
          p.ask === 1
            ? -(eq1.constant + eq1.p1 * value) / eq1.p2
            : -(eq2.constant + eq2.p2 * value) / eq2.p1;
        const star: Vec = p.ask === 1 ? [value, other] : [other, value];
        expect(Math.abs(f(star)[0])).toBeLessThan(1e-9);
        expect(Math.abs(f(star)[1])).toBeLessThan(1e-9);
        // Stable: prices that start at zero end up close to the steady state.
        const end = integrate(f, [0, 0], 40, 0.05);
        const gap = (v: Vec) => Math.hypot(v[0] - star[0], v[1] - star[1]);
        expect(gap(end)).toBeLessThan(0.01 * gap([0, 0]));
        // Positive whole-number prices; the constants are positive, as in the stem.
        expect(Number.isInteger(value)).toBe(true);
        expect(value >= 4 && value <= 60).toBe(true);
        expect(other).toBeGreaterThan(3.9);
        expect(eq1.constant).toBeGreaterThan(0);
        expect(eq2.constant).toBeGreaterThan(0);
        expect(codes(distractors)).toEqual(['OTHER_PRICE', 'OWN_MARKET_ONLY', 'SIGN_SOLVE']);
        const d = byCode(distractors);
        expect(Math.abs((d.OTHER_PRICE ?? 0) - other)).toBeLessThan(1e-4);
        // Own market only: the asked price that makes its own equation zero at the other price 0.
        const own = p.ask === 1 ? -eq1.constant / eq1.p1 : -eq2.constant / eq2.p2;
        expect(Math.abs((d.OWN_MARKET_ONLY ?? 0) - own)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(d.SIGN_SOLVE).toBe(-value);
      }),
      RUNS,
    );
  });

  it('reproduces DY05 Example 1 (ṗ₁ = 20 − 3p₁ + p₂, ṗ₂ = 12 + p₁ − 3p₂: p* = (9, 7))', () => {
    const p = { m1: 3, m2: 3, c12: 1, c21: 1, p1: 9, p2: 7 };
    const one = twoMarketSteadyStatePrice.answer({ ...p, ask: 1 });
    const two = twoMarketSteadyStatePrice.answer({ ...p, ask: 2 });
    expect(one.kind === 'numeric' && one.value).toBe(9);
    expect(two.kind === 'numeric' && two.value).toBe(7);
    const stem = twoMarketSteadyStatePrice.stem({ ...p, ask: 1 });
    expect(stem).toContain('\\dot p_1 = 20 - 3p_1 + p_2');
    expect(stem).toContain('\\dot p_2 = 12 + p_1 - 3p_2');
    expect(twoMarketSteadyStatePrice.steps({ ...p, ask: 1 })[1]?.result).toBe(8);
  });
});

/** The largest real part of the eigenvalues of (k, b; c, d), from the roots of the quadratic. */
function maxRealPart(k: number, b: number, c: number, d: number): number {
  const t = k + d;
  const disc = (k - d) ** 2 + 4 * b * c;
  return disc >= 0 ? (t + Math.sqrt(disc)) / 2 : t / 2;
}

describe('stability-threshold-trace-determinant', () => {
  it('separates the values of k with all eigenvalues in the left half-plane from the rest', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(stabilityThresholdTraceDeterminant, seed);
        const d = -p.D;
        // Stable on a grid below k*, unstable just above it.
        for (let k = value - 20; k < value - 1e-9; k += 0.25) {
          expect(maxRealPart(k, p.b, p.c, d)).toBeLessThan(0);
        }
        expect(maxRealPart(value - 0.005, p.b, p.c, d)).toBeLessThan(0);
        expect(maxRealPart(value + 0.005, p.b, p.c, d)).toBeGreaterThan(0);
        expect(maxRealPart(value + 1, p.b, p.c, d)).toBeGreaterThan(0);
        expect(hasDecimals(value, 2)).toBe(true);
        expect(p.D >= 1 && p.D <= 6).toBe(true);
        expect(p.b !== 0 && p.c !== 0).toBe(true);
        // The signs of the cross effects match the story.
        if (p.context === 'inflation') expect(p.b < 0 && p.c > 0).toBe(true);
        if (p.context === 'firms') expect(p.b > 0 && p.c < 0).toBe(true);
        if (p.context === 'markets') expect(p.b > 0 && p.c > 0).toBe(true);
        const found = codes(distractors);
        expect(found).toContain('DET_SIGN');
        expect(found).toContain('OWN_EFFECT_ONLY');
        expect(found.length).toBe(3);
        // Exactly one of the single-condition answers is wrong, and it is offered.
        expect(found.includes('ONLY_TRACE') !== found.includes('ONLY_DETERMINANT')).toBe(true);
      }),
      RUNS,
    );
  });

  it('reproduces the Try it check in DY05, scaled by 10 (π̇ = kπ − u, u̇ = 2π − u: k* = 1)', () => {
    const p = { context: 'inflation' as const, D: 1, b: -1, c: 2 };
    const answer = stabilityThresholdTraceDeterminant.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(1);
    const steps = stabilityThresholdTraceDeterminant.steps(p);
    expect(steps[0]?.result).toBe(1);
    expect(steps[1]?.result).toBe(2);
  });
});

describe('saddle-path-initial-jump', () => {
  it('starts a path that returns to the steady state, while nearby starts run away', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(saddlePathInitialJump, seed);
        const f: Field = ([k, y]) => [(p.a * k + p.b * y) / 10, (p.c * k + p.d * y) / 10];
        const size = (v: Vec) => Math.hypot(v[0], v[1]);
        const start: Vec = [p.k0, value];
        // On the saddle path the motion points straight back at the steady state: f(x) = μx, μ < 0.
        const [dk, dy] = f(start);
        expect(Math.abs(dk * start[1] - dy * start[0])).toBeLessThan(1e-9);
        expect(dk * start[0] + dy * start[1]).toBeLessThan(0);
        const mu = (dk * start[0] + dy * start[1]) / size(start) ** 2;
        const onPath = integrate(f, start, 2 / -mu, 0.05);
        expect(size(onPath)).toBeLessThan(0.15 * size(start));
        // Runaway checks: |λ| ≤ 0.6 here, so a step of 0.25 is accurate and keeps the test fast.
        const T = 60;
        for (const shift of [-1, 1]) {
          const off = integrate(f, [p.k0, value + shift], T, 0.25);
          expect(size(off)).toBeGreaterThan(size(start));
        }
        // A saddle: det < 0, eigenvalues of opposite signs.
        expect(p.a * p.d - p.b * p.c).toBeLessThan(0);
        expect(Number.isInteger(value)).toBe(true);
        expect(p.k0 !== 0 && Math.abs(p.k0) <= 12).toBe(true);
        // The path slopes as the story says: q against k, consumption with k.
        if (p.context === 'asset') expect(Math.sign(value)).toBe(-Math.sign(p.k0));
        else expect(Math.sign(value)).toBe(Math.sign(p.k0));
        expect(codes(distractors)).toEqual([
          'EIGENVECTOR_SIGN',
          'NULLCLINE_NOT_ARM',
          'UNSTABLE_ARM',
        ]);
        const dv = byCode(distractors);
        // The nullcline start has k̇ = 0; the unstable-arm start runs away.
        expect(Math.abs(f([p.k0, dv.NULLCLINE_NOT_ARM ?? 0])[0])).toBeLessThan(1e-9);
        const away = integrate(f, [p.k0, dv.UNSTABLE_ARM ?? 0], T, 0.25);
        expect(size(away)).toBeGreaterThan(size(start));
      }),
      RUNS,
    );
  });

  it('reproduces the saddle-path example in DY05 (k̇ = −0.1k + 0.2q, q̇ = 0.2k + 0.2q, k(0) = −4: q(0) = 2)', () => {
    const p = {
      context: 'asset' as const,
      a: -1,
      b: 2,
      c: 2,
      d: 2,
      stable: -2,
      unstable: 3,
      k0: -4,
    };
    const answer = saddlePathInitialJump.answer(p);
    expect(answer.kind === 'numeric' && answer.value).toBe(2);
    const steps = saddlePathInitialJump.steps(p);
    expect(steps[0]?.result).toBeCloseTo(-0.06, 12);
    expect(steps[1]?.result).toBe(-0.2);
    expect(steps[2]?.result).toBe(-0.5);
    expect(saddlePathInitialJump.stem(p)).toContain('\\dot k = -0.1k + 0.2q');
  });
});
