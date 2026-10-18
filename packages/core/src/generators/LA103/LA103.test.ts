import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Generator } from '../../engine/types';
import { machineHoursBackSubstitution } from './machine-hours-back-substitution';
import { singularSystemParameter } from './singular-system-parameter';
import { marketSystem, threeMarketEquilibriumPrice } from './three-market-equilibrium-price';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };
/** 1,000 runs of a 3×3 system can pass 5 s on a busy machine. */
const SLOW = 30_000;

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return { p: pr.params, value: pr.answer.value, problem: pr };
};

type M3 = number[][];

const det3 = (m: M3) => {
  const [r0 = [], r1 = [], r2 = []] = m;
  const e = (r: number[], j: number) => r[j] ?? 0;
  return (
    e(r0, 0) * (e(r1, 1) * e(r2, 2) - e(r1, 2) * e(r2, 1)) -
    e(r0, 1) * (e(r1, 0) * e(r2, 2) - e(r1, 2) * e(r2, 0)) +
    e(r0, 2) * (e(r1, 0) * e(r2, 1) - e(r1, 1) * e(r2, 0))
  );
};

/** Cramer's rule: a route that does no row operations at all. */
const cramer = (a: M3, b: number[]) => {
  const d = det3(a);
  return [0, 1, 2].map(
    (j) => det3(a.map((row, i) => row.map((x, k) => (k === j ? (b[i] ?? 0) : x)))) / d,
  );
};

const times = (a: M3, x: number[]) =>
  a.map((row) => row.reduce((s, v, j) => s + v * (x[j] ?? 0), 0));

describe('machine-hours-back-substitution', { timeout: SLOW }, () => {
  it('the plan found by searching every whole number uses exactly the hours available', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(machineHoursBackSubstitution, seed);
        const [cut, asm, fin] = rhsOf(problem.stem);
        // Search, bottom row first: the cabinets that use all finishing hours, then tables, then chairs.
        const fits = (lo: number, test: (n: number) => boolean) => {
          for (let n = lo; n <= 500; n++) if (test(n)) return n;
          return Number.NaN;
        };
        const z = fits(0, (n) => p.finCabinet * n === fin);
        const y = fits(0, (n) => p.asmTable * n + p.asmCabinet * z === asm);
        const x = fits(0, (n) => p.cutChair * n + p.cutTable * y + p.cutCabinet * z === cut);
        expect([x, y, z]).toEqual([p.chairs, p.tables, p.cabinets]);
        expect(value).toBe(x);
      }),
      RUNS,
    );
  });

  it('uses whole, positive quantities and hours, and offers at least two wrong answers', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(machineHoursBackSubstitution, seed);
        expect(Number.isInteger(value)).toBe(true);
        for (const q of [p.chairs, p.tables, p.cabinets]) {
          expect(q).toBeGreaterThanOrEqual(5);
          expect(q).toBeLessThanOrEqual(40);
        }
        for (const h of rhsOf(problem.stem)) expect(h).toBeGreaterThan(0);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
      }),
      RUNS,
    );
  });

  it('reproduces Example 1 in LA103 (2x + y + 2z = 100, 3y + 2z = 90, 4z = 60)', () => {
    const p = {
      cutChair: 2,
      cutTable: 1,
      cutCabinet: 2,
      asmTable: 3,
      asmCabinet: 2,
      finCabinet: 4,
      chairs: 25,
      tables: 20,
      cabinets: 15,
    };
    expect(machineHoursBackSubstitution.stem(p)).toContain(
      '2x + y + 2z = 100 \\\\ 3y + 2z = 90 \\\\ 4z = 60',
    );
    expect(machineHoursBackSubstitution.answer(p)).toEqual({
      kind: 'numeric',
      value: 25,
      decimals: 0,
    });
    expect(machineHoursBackSubstitution.steps(p).map((s) => s.result)).toEqual([
      undefined,
      15,
      20,
      25,
    ]);
    expect(machineHoursBackSubstitution.distractors(p)).toEqual([
      { value: 50, mistakeCode: 'NOT_DIVIDED_BY_PIVOT' },
      { value: 75, mistakeCode: 'BACK_SUB_SIGN' },
      { value: 20, mistakeCode: 'WRONG_VARIABLE' },
    ]);
  });
});

/** The right-hand sides of the system in a stem, "... = 100 \\ ... = 90 \\ ... = 60". */
function rhsOf(stem: string): number[] {
  return [...stem.matchAll(/= (-?[\d{},]+)/g)].map((m) =>
    Number((m[1] ?? '').replace(/[{},]/g, '')),
  );
}

/**
 * Plain Gaussian elimination on a 3×3 system without row swaps, then back substitution.
 * With `slip`, the last row operation adds instead of subtracts on the right-hand side.
 */
function eliminate(a: M3, b: number[], slip = false) {
  const at = (i: number, j: number) => a[i]?.[j] ?? Number.NaN;
  const m21 = at(1, 0) / at(0, 0);
  const m31 = at(2, 0) / at(0, 0);
  const s2 = [0, 1, 2].map((j) => at(1, j) - m21 * at(0, j));
  const s3 = [0, 1, 2].map((j) => at(2, j) - m31 * at(0, j));
  const [b1 = 0, b2 = 0, b3 = 0] = b;
  const c2 = b2 - m21 * b1;
  const c3 = b3 - m31 * b1;
  const [, s22 = 0, s23 = 0] = s2;
  const [, s32 = 0, s33 = 0] = s3;
  const m32 = s32 / s22;
  const e33 = s33 - m32 * s23;
  const x3 = (slip ? c3 + m32 * c2 : c3 - m32 * c2) / e33;
  const x2 = (c2 - s23 * x3) / s22;
  const x1 = (b1 - at(0, 1) * x2 - at(0, 2) * x3) / at(0, 0);
  return { m21, m31, m32, pivots: [at(0, 0), s22, e33], x: [x1, x2, x3] };
}

describe('three-market-equilibrium-price', { timeout: SLOW }, () => {
  it("agrees with Cramer's rule, and the prices clear all three markets", () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value } = solve(threeMarketEquilibriumPrice, seed);
        const { a, b } = marketSystem(p);
        const x = cramer(a, b);
        for (let i = 0; i < 3; i++) expect(x[i]).toBeCloseTo(p.prices[i] ?? Number.NaN, 9);
        expect(value).toBeCloseTo(x[p.ask - 1] ?? Number.NaN, 9);
        expect(times(a, p.prices)).toEqual(b);
      }),
      RUNS,
    );
  });

  it('elimination with whole multipliers reaches the echelon form shown in the steps', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p } = solve(threeMarketEquilibriumPrice, seed);
        const { a, b } = marketSystem(p);
        const e = eliminate(a, b);
        expect([e.m21, e.m31, e.m32].every(Number.isInteger)).toBe(true);
        // Three non-zero pivots: exactly one equilibrium.
        expect(e.pivots.every((v) => v !== 0)).toBe(true);
        expect(e.x).toEqual(p.prices);
      }),
      RUNS,
    );
  });

  it('has positive prices, positive intercept gaps and substitute-type coefficients', () => {
    let asks = [0, 0, 0];
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(threeMarketEquilibriumPrice, seed);
        const { a, b } = marketSystem(p);
        expect(Number.isInteger(value)).toBe(true);
        for (const price of p.prices) {
          expect(price).toBeGreaterThanOrEqual(4);
          expect(price).toBeLessThanOrEqual(40);
        }
        a.forEach((row, i) => {
          row.forEach((x, j) => {
            if (i === j) expect(x).toBeGreaterThan(0);
            else expect(x).toBeLessThanOrEqual(0);
          });
        });
        for (const x of b) expect(x).toBeGreaterThan(0);
        expect(problem.distractors.length).toBeGreaterThanOrEqual(2);
        asks = asks.map((n, i) => n + (p.ask === i + 1 ? 1 : 0));
      }),
      RUNS,
    );
    for (const n of asks) expect(n).toBeGreaterThan(200);
  });

  it('the ROW_OP_SIGN distractor is what a sign slip on the right-hand side gives', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, problem } = solve(threeMarketEquilibriumPrice, seed);
        const slip = problem.distractors.find((d) => d.mistakeCode === 'ROW_OP_SIGN');
        if (!slip) return;
        const { a, b } = marketSystem(p);
        // Do the elimination, but add the multiple of row 2's right-hand side in the last step.
        const expected = eliminate(a, b, true).x[p.ask - 1] ?? Number.NaN;
        // Rounded to 2 decimal places.
        expect(Math.abs(slip.value - expected)).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      RUNS,
    );
  });

  it('reproduces Example 2 in LA103 (tea, coffee and cocoa)', () => {
    const p = {
      l21: -1,
      l31: -1,
      l32: -1,
      u11: 2,
      u12: -1,
      u13: 0,
      u22: 3,
      u23: -1,
      u33: 4,
      prices: [15, 20, 22] as [number, number, number],
      ask: 1 as const,
    };
    expect(marketSystem(p)).toEqual({
      a: [
        [2, -1, 0],
        [-2, 4, -1],
        [-2, -2, 5],
      ],
      b: [10, 28, 40],
    });
    expect(threeMarketEquilibriumPrice.answer(p)).toEqual({
      kind: 'numeric',
      value: 15,
      decimals: 0,
    });
    const steps = threeMarketEquilibriumPrice.steps(p);
    expect(steps.map((s) => s.result)).toEqual([undefined, undefined, 22, 20, 15]);
    expect(steps[1]?.latex).toContain('0 & 0 & 4 & 88');
    expect(threeMarketEquilibriumPrice.distractors(p)).toEqual([
      { value: 11.83, mistakeCode: 'ROW_OP_SIGN' },
      { value: 30, mistakeCode: 'NOT_DIVIDED_BY_PIVOT' },
      { value: -5, mistakeCode: 'BACK_SUB_SIGN' },
      { value: 20, mistakeCode: 'WRONG_VARIABLE' },
    ]);
  });
});

describe('singular-system-parameter', { timeout: SLOW }, () => {
  /** The coefficient matrix with a number in place of k, read back from the stem. */
  const matrixAt = (stem: string, k: number): M3 => {
    const body = /\\begin\{cases\}(.*)\\end\{cases\}/.exec(stem)?.[1] ?? '';
    return body.split('\\\\').map((line) => {
      const left = line.split('=')[0] ?? '';
      return ['x_1', 'x_2', 'x_3'].map((name) => {
        const m = new RegExp(`([+-])?\\s*(\\d*|k)${name}`).exec(left.replace(/\s+/g, ' '));
        if (!m) return 0;
        const sign = m[1] === '-' ? -1 : 1;
        const size = m[2] === 'k' ? k : m[2] ? Number(m[2]) : 1;
        return sign * size;
      });
    });
  };

  it('the determinant is zero at the answer and only there', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { value, problem } = solve(singularSystemParameter, seed);
        // det A(k) is linear in k, so two other values pin it down.
        expect(Math.abs(det3(matrixAt(problem.stem, value)))).toBe(0);
        for (const k of [value - 1, value + 1, value + 7]) {
          expect(det3(matrixAt(problem.stem, k))).not.toBe(0);
        }
        expect(Number.isInteger(value)).toBe(true);
        expect(value).not.toBe(0);
        expect(problem.distractors).toHaveLength(3);
      }),
      RUNS,
    );
  });

  it('names the right case at the critical k: no solution or infinitely many', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, problem } = solve(singularSystemParameter, seed);
        const a = matrixAt(problem.stem, value);
        // A row vector y with yA = 0 (two columns' cross product); the system is consistent
        // exactly when y·b = 0 as well.
        const col = (j: number) => a.map((r) => r[j] ?? 0);
        const [u0 = 0, u1 = 0, u2 = 0] = col(0);
        const [v0 = 0, v1 = 0, v2 = 0] = col(1);
        const y = [u1 * v2 - u2 * v1, u2 * v0 - u0 * v2, u0 * v1 - u1 * v0];
        expect(y.some((t) => t !== 0)).toBe(true);
        expect(Math.abs(y.reduce((s, t, i) => s + t * (col(2)[i] ?? 0), 0))).toBe(0);
        const consistent = y.reduce((s, t, i) => s + t * (p.b[i] ?? 0), 0) === 0;
        const why = problem.steps.at(-1)?.why ?? '';
        expect(why).toContain(consistent ? 'infinitely many solutions' : 'no solution');
      }),
      RUNS,
    );
  });

  it('reproduces Example 3 in LA103 (feed blend, barley price k)', () => {
    const p = {
      l21: 1,
      l31: 2,
      l32: 1,
      u11: 1,
      u12: 1,
      u13: 1,
      u22: 3,
      u23: 1,
      b: [100, 200, 300] as [number, number, number],
    };
    const stem = singularSystemParameter.stem(p);
    expect(stem).toContain(
      'x_1 + x_2 + x_3 = 100 \\\\ x_1 + 4x_2 + 2x_3 = 200 \\\\ 2x_1 + 5x_2 + kx_3 = 300',
    );
    expect(singularSystemParameter.answer(p)).toEqual({ kind: 'numeric', value: 3, decimals: 0 });
    const steps = singularSystemParameter.steps(p);
    expect(steps[1]?.latex).toContain('0 & 0 & k - 3 & 0');
    expect(steps[2]?.why).toContain('infinitely many solutions');
    expect(singularSystemParameter.distractors(p)).toEqual([
      { value: 1, mistakeCode: 'ROW_OP_SIGN' },
      { value: 2, mistakeCode: 'STOPPED_EARLY' },
      { value: 0, mistakeCode: 'ENTRY_SET_TO_ZERO' },
    ]);
  });
});
