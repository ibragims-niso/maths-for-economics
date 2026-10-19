import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeProblem } from '../../engine/problem';
import { createRng } from '../../engine/rng';
import type { Generator } from '../../engine/types';
import { breuschPaganLmStatistic, CHI2_5PC, qOf } from './breusch-pagan-lm-statistic';
import { denominatorOf, durbinWatsonStatistic, numeratorOf } from './durbin-watson-statistic';
import { robustSeSimpleRegression, xsOf } from './robust-se-simple-regression';

const seeds = fc.integer({ min: 0, max: 2 ** 32 - 1 });
const RUNS = { numRuns: 1000 };

const solve = <P>(gen: Generator<P>, seed: number) => {
  const pr = makeProblem(gen, seed);
  if (pr.answer.kind !== 'numeric') throw new Error('numeric expected');
  return {
    p: pr.params,
    value: pr.answer.value,
    distractors: pr.distractors,
    stem: pr.stem,
    steps: pr.steps,
  };
};
const hasDecimals = (v: number, d: number) =>
  Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
const codes = (ds: { mistakeCode: string }[]) => ds.map((d) => d.mistakeCode).sort();
const byCode = (ds: { mistakeCode: string; value: number }[]) =>
  Object.fromEntries(ds.map((d) => [d.mistakeCode, d.value]));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** A standard normal draw from the seeded generator (Box–Muller). */
const normal = (next: () => number) =>
  Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());

/** Upper tail P(χ²_q > c) by Simpson's rule on the density, for q = 1, …, 4. */
function chi2Tail(q: number, c: number): number {
  const gammaHalf = [0, Math.sqrt(Math.PI), 1, Math.sqrt(Math.PI) / 2, 1]; // Γ(q/2)
  const g = gammaHalf[q] ?? 1;
  const pdf = (x: number) => (x ** (q / 2 - 1) * Math.exp(-x / 2)) / (2 ** (q / 2) * g);
  // Integrate from c to 80 in t = √(x − c) to tame the q = 1 density; the rest is negligible.
  const top = Math.sqrt(80 - c);
  const steps = 4000;
  const h = top / steps;
  let s = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i * h;
    const f = pdf(c + t * t) * 2 * t;
    s += (i === 0 || i === steps ? 1 : i % 2 === 1 ? 4 : 2) * f;
  }
  return (s * h) / 3;
}

/** R² of an OLS regression of y on one regressor with an intercept. */
function r2Simple(x: number[], y: number[]): number {
  const mx = sum(x) / x.length;
  const my = sum(y) / y.length;
  const sxy = sum(x.map((v, i) => (v - mx) * ((y[i] ?? 0) - my)));
  const sxx = sum(x.map((v) => (v - mx) ** 2));
  const syy = sum(y.map((v) => (v - my) ** 2));
  return (sxy * sxy) / (sxx * syy);
}

/** Residuals of an OLS regression of y on one regressor with an intercept. */
function residuals(x: number[], y: number[]): number[] {
  const mx = sum(x) / x.length;
  const my = sum(y) / y.length;
  const b1 = sum(x.map((v, i) => (v - mx) * ((y[i] ?? 0) - my))) / sum(x.map((v) => (v - mx) ** 2));
  return y.map((v, i) => v - (my - b1 * mx) - b1 * (x[i] ?? 0));
}

describe('breusch-pagan-lm-statistic', () => {
  it('gives n·R² read back from the stem, with the right degrees of freedom and decision', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem, steps } = solve(breuschPaganLmStatistic, seed);
        // Read n and R² back from the stem text and multiply in whole numbers.
        const n = Number(/ of (\d+) (?:workers|households|firms|flats)/.exec(stem)?.[1]);
        const r2 = /R\^2 = (0\.\d+)\$/.exec(stem)?.[1] ?? '';
        const thousandths = Math.round(Number(r2) * 1000);
        expect(n).toBe(p.n);
        expect(Math.abs(value - (n * thousandths) / 1000)).toBeLessThan(1e-9);
        expect(hasDecimals(value, 2)).toBe(true);
        // q counts the regressors named in the main regression, not the intercept.
        const q = qOf(p);
        expect(stem).toContain(`\\chi^2_{${q}}`);
        expect(steps[0]?.result).toBe(q);
        // A clear verdict: the statistic is not within 0.5 of the critical value.
        const crit = CHI2_5PC[q] ?? 0;
        expect(Math.abs(value - crit)).toBeGreaterThanOrEqual(0.5);
        expect(steps[2]?.latex).toContain(value > crit ? '>' : '<');
        expect(Number(r2)).toBeGreaterThan(0);
        expect(Number(r2)).toBeLessThanOrEqual(0.25);
        const ds = byCode(distractors);
        expect(codes(distractors)).toEqual(['BP_DF_SCALED', 'BP_ONE_MINUS_R2', 'BP_R2_ONLY']);
        expect(ds.BP_R2_ONLY).toBeCloseTo(Number(r2), 9);
        expect(ds.BP_DF_SCALED).toBeLessThan(value);
        expect(ds.BP_ONE_MINUS_R2).toBeGreaterThan(value);
      }),
      RUNS,
    );
  });

  it('uses the correct 5 % critical values of χ² with 1 to 4 degrees of freedom', () => {
    for (const q of [1, 2, 3, 4]) {
      const c = CHI2_5PC[q] ?? 0;
      expect(Math.abs(chi2Tail(q, c) - 0.05)).toBeLessThan(0.0001);
    }
  });

  it('reproduces worked example 1 in EM04 (120 households, R² = 0.094: 11.28)', () => {
    const p = { context: 'food' as const, n: 120, r: 94 };
    expect(qOf(p)).toBe(2);
    expect(breuschPaganLmStatistic.answer(p)).toMatchObject({ value: 11.28 });
    expect(byCode(breuschPaganLmStatistic.distractors(p))).toEqual({
      BP_R2_ONLY: 0.094,
      BP_DF_SCALED: 11,
      BP_ONE_MINUS_R2: 108.72,
    });
    // With 2 degrees of freedom the p-value is exactly exp(−LM/2).
    expect(Math.exp(-11.28 / 2)).toBeCloseTo(0.00355, 5);
    expect(chi2Tail(2, 11.28)).toBeCloseTo(Math.exp(-11.28 / 2), 6);
  });

  it('rejects about 5 % of the time with constant variance and far more when it grows with x', () => {
    const rng = createRng(20261019);
    const n = 200;
    const reps = 600;
    const x = Array.from({ length: n }, (_, i) => 1 + (9 * i) / (n - 1));
    let homo = 0;
    let hetero = 0;
    for (let r = 0; r < reps; r++) {
      const y1 = x.map((v) => 2 + 0.5 * v + normal(rng.next));
      const y2 = x.map((v) => 2 + 0.5 * v + 0.3 * v * normal(rng.next));
      const lm1 =
        n *
        r2Simple(
          x,
          residuals(x, y1).map((e) => e * e),
        );
      const lm2 =
        n *
        r2Simple(
          x,
          residuals(x, y2).map((e) => e * e),
        );
      if (lm1 > (CHI2_5PC[1] ?? 0)) homo++;
      if (lm2 > (CHI2_5PC[1] ?? 0)) hetero++;
    }
    expect(homo / reps).toBeGreaterThan(0.02);
    expect(homo / reps).toBeLessThan(0.09);
    expect(hetero / reps).toBeGreaterThan(0.9);
  });
});

describe('durbin-watson-statistic', () => {
  it('agrees with d = (2Σe² − e₁² − eₙ² − 2Σeₜeₜ₋₁)/Σe², on genuine-looking residuals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors, stem } = solve(durbinWatsonStatistic, seed);
        const e = p.e;
        const n = e.length;
        expect(n === 6 || n === 7).toBe(true);
        // OLS residuals with an intercept add up to zero; small whole numbers, at most one zero.
        expect(sum(e)).toBe(0);
        for (const v of e) {
          expect(Number.isInteger(v)).toBe(true);
          expect(Math.abs(v)).toBeLessThanOrEqual(7);
        }
        expect(e.filter((v) => v === 0).length).toBeLessThanOrEqual(1);
        // A different route to d: expand the squares instead of differencing.
        const ss = sum(e.map((v) => v * v));
        const lag = sum(e.slice(1).map((v, i) => v * (e[i] ?? 0)));
        const first = e[0] ?? 0;
        const lastE = e[n - 1] ?? 0;
        const d = (2 * ss - first * first - lastE * lastE - 2 * lag) / ss;
        expect(numeratorOf(p)).toBe(2 * ss - first * first - lastE * lastE - 2 * lag);
        expect(denominatorOf(p)).toBe(ss);
        expect(d).toBeGreaterThan(0);
        expect(d).toBeLessThan(4);
        const expected = p.ask === 'd' ? d : 1 - d / 2;
        expect(Math.abs(value - expected)).toBeLessThanOrEqual(0.0005 + 1e-9);
        expect(hasDecimals(value, 3)).toBe(true);
        // The residuals are printed in the stem in time order.
        expect(stem).toContain(e.map((v) => String(v)).join(',\\ '));
        const ds = byCode(distractors);
        if (p.ask === 'd') {
          expect(codes(distractors)).toEqual(['DW_DENOM_SHORT', 'DW_E0_ZERO', 'DW_NOT_SQUARED']);
          // Leaving out e₁² shrinks the denominator; adding e₁² to the top grows the numerator.
          expect(ds.DW_DENOM_SHORT).toBeGreaterThan(value);
          expect(ds.DW_E0_ZERO).toBeGreaterThan(value);
        } else {
          expect(codes(distractors)).toEqual(['DW_DENOM_SHORT', 'D_NOT_RHO', 'RHO_HALF_D']);
          expect(Math.abs((ds.RHO_HALF_D ?? 0) - d / 2)).toBeLessThanOrEqual(0.0005 + 1e-9);
          expect(Math.abs((ds.D_NOT_RHO ?? 0) - d)).toBeLessThanOrEqual(0.0005 + 1e-9);
          expect(value).toBeGreaterThan(-1);
          expect(value).toBeLessThan(1);
        }
      }),
      RUNS,
    );
  });

  it('reproduces worked example 2 in EM04 (residuals 2, 3, 1, −1, −3, −2: d = 0.5, ρ̂ = 0.75)', () => {
    const e = [2, 3, 1, -1, -3, -2];
    const pd = { context: 'consumption' as const, ask: 'd' as const, e };
    expect(numeratorOf(pd)).toBe(14);
    expect(denominatorOf(pd)).toBe(28);
    expect(durbinWatsonStatistic.answer(pd)).toMatchObject({ value: 0.5 });
    expect(byCode(durbinWatsonStatistic.distractors(pd))).toEqual({
      DW_NOT_SQUARED: 0.286,
      DW_DENOM_SHORT: 0.583,
      DW_E0_ZERO: 0.643,
    });
    const pr = { ...pd, ask: 'rho' as const };
    expect(durbinWatsonStatistic.answer(pr)).toMatchObject({ value: 0.75 });
    expect(byCode(durbinWatsonStatistic.distractors(pr))).toEqual({
      RHO_HALF_D: 0.25,
      D_NOT_RHO: 0.5,
      DW_DENOM_SHORT: 0.708,
    });
  });

  it('gives d near 2(1 − ρ) for a long simulated AR(1) series', () => {
    const rng = createRng(4);
    for (const rho of [-0.5, 0, 0.6]) {
      const u = [normal(rng.next) / Math.sqrt(1 - rho * rho)];
      for (let t = 1; t < 20000; t++) u.push(rho * (u[t - 1] ?? 0) + normal(rng.next));
      const top = sum(u.slice(1).map((v, i) => (v - (u[i] ?? 0)) ** 2));
      const d = top / sum(u.map((v) => v * v));
      expect(Math.abs(d - 2 * (1 - rho))).toBeLessThan(0.05);
    }
  });
});

describe('robust-se-simple-regression', () => {
  it('equals √[(XᵀX)⁻¹XᵀΣX(XᵀX)⁻¹]₂₂ with Σ = diag(e²), for genuine OLS residuals', () => {
    fc.assert(
      fc.property(seeds, (seed) => {
        const { p, value, distractors } = solve(robustSeSimpleRegression, seed);
        const x = xsOf(p);
        const e = p.e;
        // Genuine residuals: refitting y = 3 + 1.5x + e by OLS gives back exactly e.
        const y = x.map((v, i) => 3 + 1.5 * v + (e[i] ?? 0));
        residuals(x, y).forEach((r, i) => {
          expect(Math.abs(r - (e[i] ?? 0))).toBeLessThan(1e-9);
        });
        // The sandwich with raw (uncentred) x: A = XᵀX, B = XᵀΣX, V = A⁻¹BA⁻¹.
        const a11 = x.length;
        const a12 = sum(x);
        const a22 = sum(x.map((v) => v * v));
        const det = a11 * a22 - a12 * a12;
        const inv = [
          [a22 / det, -a12 / det],
          [-a12 / det, a11 / det],
        ];
        const w = e.map((v) => v * v);
        const b = [
          [sum(w), sum(w.map((v, i) => v * (x[i] ?? 0)))],
          [sum(w.map((v, i) => v * (x[i] ?? 0))), sum(w.map((v, i) => v * (x[i] ?? 0) ** 2))],
        ];
        const row = [0, 1].map((j) =>
          sum([0, 1].map((k) => (inv[1]?.[k] ?? 0) * (b[k]?.[j] ?? 0))),
        );
        const v22 = sum([0, 1].map((j) => (row[j] ?? 0) * (inv[j]?.[1] ?? 0)));
        expect(Math.abs(value - Math.sqrt(v22))).toBeLessThanOrEqual(0.0005 + 1e-9);
        expect(hasDecimals(value, 3)).toBe(true);
        expect(value).toBeGreaterThan(0);
        // Readable data: positive x, five distinct values, small whole-number residuals.
        expect(new Set(x).size).toBe(5);
        for (const v of x) expect(v).toBeGreaterThan(0);
        for (const v of e) expect(Math.abs(v)).toBeLessThanOrEqual(8);
        // Spread at least as wide at the top of x as at the bottom.
        expect(Math.abs(e[4] ?? 0)).toBeGreaterThanOrEqual(Math.abs(e[0] ?? 0));
        const ds = byCode(distractors);
        expect(codes(distractors)).toEqual([
          'ROBUST_DENOM_NOT_SQUARED',
          'ROBUST_VAR_NOT_SE',
          'USUAL_SE',
        ]);
        // The usual SE: s/√Σ(x − x̄)² with s² = Σe²/(n − 2).
        const sxx = a22 - (a12 * a12) / a11;
        expect(Math.abs((ds.USUAL_SE ?? 0) - Math.sqrt(sum(w) / 3 / sxx))).toBeLessThanOrEqual(
          0.0005 + 1e-9,
        );
        expect(ds.ROBUST_DENOM_NOT_SQUARED).toBeGreaterThan(value);
      }),
      RUNS,
    );
  });
});
