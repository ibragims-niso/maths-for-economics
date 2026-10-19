import { useState } from 'react';
import { Curve, Dot, fmt, Plot, Readout, Slider } from './kit';

// Six workers of topic EM01, Example 2: three recent graduates with 2 years' experience and three
// workers with 10 years. Wages follow −10 + 1.5·educ + β₂·exper plus small residuals that add up
// to 0 and are uncorrelated with education inside each group, so the multiple regression always
// recovers 1.5 exactly, wherever the slider puts the experienced workers' education.
export const RECENT_EDUC = [14, 16, 18];
const RECENT_RESID = [-0.5, 1, -0.5];
const EXPERIENCED_RESID = [0.5, -1, 0.5];
export const EXPER_RECENT = 2;
export const EXPER_SENIOR = 10;
const FRAME = { xMin: 6, xMax: 24, yMin: 0, yMax: 35 };

export interface Worker {
  educ: number;
  exper: number;
  wage: number;
}

/** The six workers when the experienced ones average `seniorEduc` years of education. */
export function workers(seniorEduc = 12, beta2 = 0.5): Worker[] {
  const wage = (educ: number, exper: number, e: number) => -10 + 1.5 * educ + beta2 * exper + e;
  return [
    ...RECENT_EDUC.map((educ, i) => ({
      educ,
      exper: EXPER_RECENT,
      wage: wage(educ, EXPER_RECENT, RECENT_RESID[i] ?? 0),
    })),
    ...[-2, 0, 2].map((dx, i) => {
      const educ = seniorEduc + dx;
      return {
        educ,
        exper: EXPER_SENIOR,
        wage: wage(educ, EXPER_SENIOR, EXPERIENCED_RESID[i] ?? 0),
      };
    }),
  ];
}

const sum = (vs: number[]) => vs.reduce((s, v) => s + v, 0);
const mean = (vs: number[]) => sum(vs) / vs.length;

/** Centred sums Σ(a − ā)(b − b̄). */
const centred = (a: number[], b: number[]) => {
  const ma = mean(a);
  const mb = mean(b);
  return sum(a.map((v, i) => (v - ma) * ((b[i] ?? 0) - mb)));
};

/**
 * OLS of wage on an intercept, education and experience, from the centred normal equations
 * (Sₑₑ Sₑₓ; Sₑₓ Sₓₓ)(b₁, b₂) = (Sₑy, Sₓy) and b₀ = ȳ − b₁·ēduc − b₂·ēxper.
 */
export function multipleFit(ws: Worker[]) {
  const e = ws.map((w) => w.educ);
  const x = ws.map((w) => w.exper);
  const y = ws.map((w) => w.wage);
  const [see, sex, sxx] = [centred(e, e), centred(e, x), centred(x, x)];
  const [sey, sxy, syy] = [centred(e, y), centred(x, y), centred(y, y)];
  const det = see * sxx - sex * sex;
  const b1 = (sxx * sey - sex * sxy) / det;
  const b2 = (see * sxy - sex * sey) / det;
  const b0 = mean(y) - b1 * mean(e) - b2 * mean(x);
  const ssr = sum(ws.map((w) => (w.wage - b0 - b1 * w.educ - b2 * w.exper) ** 2));
  return { b0, b1, b2, ssr, r2: 1 - ssr / syy };
}

/** OLS of wage on an intercept and education only. */
export function simpleFit(ws: Worker[]) {
  const e = ws.map((w) => w.educ);
  const y = ws.map((w) => w.wage);
  const b1 = centred(e, y) / centred(e, e);
  const b0 = mean(y) - b1 * mean(e);
  const ssr = sum(ws.map((w) => (w.wage - b0 - b1 * w.educ) ** 2));
  return { b0, b1, r2: 1 - ssr / centred(y, y) };
}

/** The sample correlation of education and experience. */
export function correlation(ws: Worker[]) {
  const e = ws.map((w) => w.educ);
  const x = ws.map((w) => w.exper);
  return centred(e, x) / Math.sqrt(centred(e, e) * centred(x, x));
}

/** Why the simple slope differs from the multiple one (or does not). Experience never lowers wages here. */
export function explainGap(ws: Worker[]): string {
  const r = correlation(ws);
  const simple = simpleFit(ws).b1;
  const multiple = multipleFit(ws).b1;
  if (Math.abs(simple - multiple) < 0.005) {
    return Math.abs(r) < 0.005
      ? 'Education and experience are uncorrelated here, so leaving experience out does no harm: the two slopes agree.'
      : 'Experience has no effect on wages here, so leaving it out does no harm: the two slopes agree.';
  }
  return r < 0
    ? `Here the more educated workers have less experience (correlation ${fmt(r)}), so the simple slope mixes the education effect with the wage cost of that missing experience: it is too small.`
    : `Here the more educated workers also have more experience (correlation ${fmt(r)}), so the simple slope credits education with part of the experience effect: it is too large.`;
}

/** EM01: two regressors. Holding experience constant versus leaving it out. */
export function PartialEffectWages() {
  const [seniorEduc, setSeniorEduc] = useState(12);
  const [beta2, setBeta2] = useState(0.5);
  const ws = workers(seniorEduc, beta2);
  const fit = multipleFit(ws);
  const simple = simpleFit(ws);
  const lineAt = (exper: number) => (x: number) => fit.b0 + fit.b1 * x + fit.b2 * exper;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="education (years)"
        yLabel="hourly wage"
        xTicks={[8, 12, 16, 20, 24]}
        yTicks={[10, 20, 30]}
      >
        <Curve frame={FRAME} fn={(x) => simple.b0 + simple.b1 * x} tone="gold" dashed />
        <Curve frame={FRAME} fn={lineAt(EXPER_SENIOR)} />
        <Curve frame={FRAME} fn={lineAt(EXPER_RECENT)} tone="green" />
        {ws.map((w) => (
          <Dot
            key={`${w.exper}-${w.educ}`}
            frame={FRAME}
            x={w.educ}
            y={w.wage}
            hollow={w.exper === EXPER_RECENT}
          />
        ))}
      </Plot>
      <Slider
        label="Average education, experienced workers"
        value={seniorEduc}
        min={10}
        max={20}
        onChange={setSeniorEduc}
      />
      <Slider
        label="Wage gain per year of experience β₂"
        value={beta2}
        min={0}
        max={1}
        step={0.1}
        onChange={setBeta2}
      />
      <Readout
        items={[
          ['Education slope, multiple', fmt(fit.b1)],
          ['Education slope, simple', fmt(simple.b1)],
          ['R², multiple', fmt(fit.r2, 3)],
        ]}
      />
      <figcaption>
        Hollow dots are three recent graduates (2 years' experience), filled dots three workers with
        10 years. The solid lines are the multiple regression's fitted wages at 10 years of
        experience (purple) and at 2 years (green): parallel, with slope {fmt(fit.b1)}, the wage
        gain per year of education holding experience constant, and {fmt(8 * fit.b2)} apart, the
        wage gain from 8 more years of experience. The dashed gold line regresses wages on education
        alone: slope {fmt(simple.b1)}, R² = {fmt(simple.r2, 3)}. {explainGap(ws)}
      </figcaption>
    </figure>
  );
}
