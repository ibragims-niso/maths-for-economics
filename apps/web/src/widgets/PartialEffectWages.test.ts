import { describe, expect, it } from 'vitest';
import { correlation, explainGap, multipleFit, simpleFit, workers } from './PartialEffectWages';

const sum = (vs: number[]) => vs.reduce((s, v) => s + v, 0);

describe('PartialEffectWages', () => {
  it('reproduces EM01 Examples 2 and 3: b = (−10, 1.5, 0.5), SSR = 3, R² = 0.933', () => {
    const ws = workers();
    expect(ws.map((w) => w.educ)).toEqual([14, 16, 18, 10, 12, 14]);
    expect(ws.map((w) => w.exper)).toEqual([2, 2, 2, 10, 10, 10]);
    expect(ws.map((w) => w.wage)).toEqual([11.5, 16, 17.5, 10.5, 12, 16.5]);
    const fit = multipleFit(ws);
    expect(fit.b0).toBeCloseTo(-10, 9);
    expect(fit.b1).toBeCloseTo(1.5, 9);
    expect(fit.b2).toBeCloseTo(0.5, 9);
    expect(fit.ssr).toBeCloseTo(3, 9);
    expect(fit.r2).toBeCloseTo(1 - 3 / 45, 9);
  });

  it('residuals are orthogonal to every column of X (Xᵀe = 0)', () => {
    for (const m of [10, 12, 16, 20]) {
      for (const beta2 of [0, 0.5, 1]) {
        const ws = workers(m, beta2);
        const { b0, b1, b2 } = multipleFit(ws);
        const e = ws.map((w) => w.wage - b0 - b1 * w.educ - b2 * w.exper);
        expect(Math.abs(sum(e))).toBeLessThan(1e-9);
        expect(Math.abs(sum(e.map((v, i) => v * (ws[i]?.educ ?? 0))))).toBeLessThan(1e-9);
        expect(Math.abs(sum(e.map((v, i) => v * (ws[i]?.exper ?? 0))))).toBeLessThan(1e-9);
      }
    }
  });

  it('the simple slope is 0.9 with R² = 0.72, and the gap is β₂ times the slope of exper on educ', () => {
    const ws = workers();
    expect(simpleFit(ws).b1).toBeCloseTo(0.9, 9);
    expect(simpleFit(ws).r2).toBeCloseTo(0.72, 9);
    expect(correlation(ws)).toBeCloseTo(-48 / Math.sqrt(40 * 96), 12);
    expect(explainGap(ws)).toContain('too small');
    // Omitted-variable formula: simple = multiple + β₂ × (slope of the regression of exper on educ).
    for (let m = 10; m <= 20; m++) {
      for (let beta2 = 0; beta2 <= 1 + 1e-9; beta2 += 0.1) {
        const w = workers(m, beta2);
        const educ = w.map((v) => v.educ);
        const exper = w.map((v) => v.exper);
        const me = sum(educ) / 6;
        const mx = sum(exper) / 6;
        const slope =
          sum(educ.map((e, i) => (e - me) * ((exper[i] ?? 0) - mx))) /
          sum(educ.map((e) => (e - me) ** 2));
        expect(multipleFit(w).b1).toBeCloseTo(1.5, 9);
        expect(simpleFit(w).b1).toBeCloseTo(1.5 + beta2 * slope, 9);
      }
    }
  });

  it('at equal average education (16) the regressors are uncorrelated and the slopes agree', () => {
    const ws = workers(16);
    expect(correlation(ws)).toBeCloseTo(0, 12);
    expect(simpleFit(ws).b1).toBeCloseTo(1.5, 9);
    expect(explainGap(ws)).toContain('uncorrelated');
    expect(explainGap(workers(12, 0))).toContain('no effect');
    expect(explainGap(workers(20))).toContain('too large');
    expect(simpleFit(workers(20)).b1).toBeGreaterThan(1.5);
  });
});
