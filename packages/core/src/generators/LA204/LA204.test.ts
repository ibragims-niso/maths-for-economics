import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import type { Answer } from '../../engine/types';
import type { Sym3 } from './forms';
import { hessianThirdLeadingMinor } from './hessian-third-leading-minor';
import { portfolioVarianceThreeAssets } from './portfolio-variance-three-assets';
import { quadraticFormSecondMinor } from './quadratic-form-second-minor';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const numericValue = (answer: Answer) => {
  if (answer.kind !== 'numeric') throw new Error('numeric expected');
  return answer.value;
};

/** True when x has at most `d` decimal places. */
const hasAtMostDecimals = (x: number, d: number) =>
  Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

const full = (m: Sym3) => [
  [m.p, m.d, m.e],
  [m.d, m.q, m.f],
  [m.e, m.f, m.r],
];

/** hᵀMh for a 3×3 matrix, summing every entry (no symmetry shortcut). */
const form3 = (m: number[][], h: number[]) =>
  m.reduce((s, row, i) => s + row.reduce((t, x, j) => t + (h[i] ?? 0) * x * (h[j] ?? 0), 0), 0);

/** The rule of Sarrus: a different route to a 3×3 determinant than cofactor expansion. */
const sarrus = (m: number[][]) => {
  const a = (i: number, j: number) => m[i]?.[j] ?? 0;
  return (
    a(0, 0) * a(1, 1) * a(2, 2) +
    a(0, 1) * a(1, 2) * a(2, 0) +
    a(0, 2) * a(1, 0) * a(2, 1) -
    a(0, 2) * a(1, 1) * a(2, 0) -
    a(0, 0) * a(1, 2) * a(2, 1) -
    a(0, 1) * a(1, 0) * a(2, 2)
  );
};

/**
 * A direction in which hᵀHh should be positive when H is not negative definite: if the top-left
 * 2×2 block is already indefinite, its eigenvector for the larger eigenvalue; otherwise
 * h = H⁻¹(0, 0, 1), found by Cramer's rule, for which hᵀHh = (H⁻¹)₃₃.
 */
function upDirection(m: Sym3): number[] {
  if (m.p * m.q - m.d * m.d < 0) {
    const big = (m.p + m.q + Math.sqrt((m.p - m.q) ** 2 + 4 * m.d * m.d)) / 2;
    return [m.d, big - m.p, 0];
  }
  const H = full(m);
  const D = sarrus(H);
  return [0, 1, 2].map(
    (col) => sarrus(H.map((row, i) => row.map((x, j) => (j === col ? (i === 2 ? 1 : 0) : x)))) / D,
  );
}

/** Every non-zero integer direction with entries from −3 to 3. */
const DIRECTIONS = [-3, -2, -1, 0, 1, 2, 3]
  .flatMap((x) =>
    [-3, -2, -1, 0, 1, 2, 3].flatMap((y) => [-3, -2, -1, 0, 1, 2, 3].map((z) => [x, y, z])),
  )
  .filter((h) => h.some((x) => x !== 0));

/** Q on the unit circle at 3,600 angles. */
const circle = Array.from({ length: 3600 }, (_, k) => (2 * Math.PI * k) / 3600);

describe('quadratic-form-second-minor', () => {
  it('equals the product of the largest and smallest values of Q on the unit circle', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer } = makeProblem(quadraticFormSecondMinor, seed);
        const value = numericValue(answer);
        const Q = (x: number, y: number) => p.a * x * x + p.b * x * y + p.c * y * y;
        const values = circle.map((t) => Q(Math.cos(t), Math.sin(t)));
        const hi = Math.max(...values);
        const lo = Math.min(...values);
        // The extremes on the unit circle are the two eigenvalues; their product is det A.
        expect(Math.abs(hi * lo - value)).toBeLessThan(0.01);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        // The sign of D₂ decides whether Q takes one sign or both.
        if (value > 0) expect(Math.sign(hi)).toBe(Math.sign(lo));
        if (value < 0) expect(hi > 0 && lo < 0).toBe(true);
        expect(p.a !== 0 && p.b !== 0 && p.c !== 0).toBe(true);
      }),
      RUNS,
    );
  });

  it('the matrix in the first step reproduces Q at any point', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p } = makeProblem(quadraticFormSecondMinor, seed);
        const A = [
          [p.a, p.b / 2],
          [p.b / 2, p.c],
        ];
        for (const [x, y] of [
          [1, 2],
          [-3, 5],
          [0.5, -1.5],
        ] as const) {
          const v = [x, y];
          const viaMatrix = A.reduce(
            (s, row, i) => s + row.reduce((t, a, j) => t + (v[i] ?? 0) * a * (v[j] ?? 0), 0),
            0,
          );
          expect(viaMatrix).toBeCloseTo(p.a * x * x + p.b * x * y + p.c * y * y, 9);
        }
      }),
      RUNS,
    );
  });

  it('reproduces LA204 Example 1 (2x² + 4xy + 5y²: D₂ = 6)', () => {
    const p = { a: 2, b: 4, c: 5 };
    expect(numericValue(quadraticFormSecondMinor.answer(p))).toBe(6);
    expect(quadraticFormSecondMinor.distractors(p)).toContainEqual({
      value: -6,
      mistakeCode: 'FORGOT_HALF',
    });
  });
});

describe('hessian-third-leading-minor', () => {
  it('equals the determinant by the rule of Sarrus, and the verdict matches hᵀHh', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: m, answer, steps } = makeProblem(hessianThirdLeadingMinor, seed);
        const value = numericValue(answer);
        const H = full(m);
        expect(value).toBe(sarrus(H));
        expect(Number.isInteger(value) && value !== 0).toBe(true);
        expect(m.p < 0 && m.q < 0 && m.r < 0).toBe(true);
        const signs = DIRECTIONS.map((h) => Math.sign(form3(H, h)));
        const verdict = steps[steps.length - 1]?.latex ?? '';
        if (verdict.includes('negative definite')) expect(signs.every((s) => s < 0)).toBe(true);
        else {
          // Indefinite: some direction raises profit (and h = (1, 0, 0) lowers it, as π₁₁ < 0).
          expect(verdict).toContain('indefinite');
          expect(signs.some((s) => s < 0)).toBe(true);
          expect(form3(H, upDirection(m))).toBeGreaterThan(0);
        }
      }),
      RUNS,
    );
  });

  it('reproduces LA204 Example 2 (D₃ = −30, negative definite)', () => {
    const m = { p: -4, q: -6, r: -2, d: 1, e: 0, f: 2 };
    expect(numericValue(hessianThirdLeadingMinor.answer(m))).toBe(-30);
    expect(hessianThirdLeadingMinor.steps(m)[3]?.latex).toContain('negative definite');
  });
});

describe('portfolio-variance-three-assets', () => {
  it('equals w·(Σw), and Σ is positive definite by a Cholesky factorisation', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { params: p, answer } = makeProblem(portfolioVarianceThreeAssets, seed);
        const value = numericValue(answer);
        const w = p.w.map((x) => x / 10);
        const S = full(p.cov);
        const Sw = S.map((row) => row.reduce((s, x, j) => s + x * (w[j] ?? 0), 0));
        const direct = w.reduce((s, x, i) => s + x * (Sw[i] ?? 0), 0);
        expect(Math.abs(direct - value)).toBeLessThan(1e-6);
        expect(hasAtMostDecimals(value, 2)).toBe(true);
        expect(value).toBeGreaterThan(0);
        expect(p.w.reduce((s, x) => s + x, 0)).toBe(10);
        expect(p.w.every((x) => Number.isInteger(x) && x >= 1)).toBe(true);
        // Cholesky: S = LLᵀ with a positive diagonal exactly when S is positive definite.
        const L = [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j <= i; j++) {
            let s = S[i]?.[j] ?? 0;
            for (let k = 0; k < j; k++) s -= (L[i]?.[k] ?? 0) * (L[j]?.[k] ?? 0);
            const row = L[i] as number[];
            if (i === j) {
              expect(s).toBeGreaterThan(0);
              row[j] = Math.sqrt(s);
            } else row[j] = s / (L[j]?.[j] ?? 1);
          }
        }
        // Variances are squares of whole-number SDs; correlations lie in [−1, 1].
        for (const v of [p.cov.p, p.cov.q, p.cov.r])
          expect(Number.isInteger(Math.sqrt(v))).toBe(true);
        for (const [c, x, y] of [
          [p.cov.d, p.cov.p, p.cov.q],
          [p.cov.e, p.cov.p, p.cov.r],
          [p.cov.f, p.cov.q, p.cov.r],
        ] as const) {
          expect(Math.abs(c)).toBeLessThan(Math.sqrt(x * y));
        }
      }),
      RUNS,
    );
  });

  it('reproduces LA204 Example 3 (w = (0.6, 0.2, 0.2): variance 93.6)', () => {
    const p = {
      w: [6, 2, 2] as [number, number, number],
      cov: { p: 100, q: 100, r: 100, d: 90, e: 90, f: 80 },
    };
    expect(numericValue(portfolioVarianceThreeAssets.answer(p))).toBe(93.6);
    expect(portfolioVarianceThreeAssets.distractors(p)).toContainEqual({
      value: 44,
      mistakeCode: 'NO_COVARIANCE_TERM',
    });
  });
});
