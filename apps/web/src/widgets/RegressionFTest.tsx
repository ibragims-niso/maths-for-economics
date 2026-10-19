import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';
import { probText } from './NormalAreaExplorer';

const FRAME = { xMin: 0, xMax: 7, yMin: 0, yMax: 1 };

/** ln Γ(x) for x > 0 by the Lanczos approximation (accurate to about 1e-14). */
export function logGamma(x: number): number {
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const y = x - 1;
  let a = c[0] ?? 1;
  for (let i = 1; i < c.length; i++) a += (c[i] ?? 0) / (y + i);
  const t = y + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(a);
}

/** The density of the F(q, v) distribution at x (infinite at 0 when q = 1). */
export function fDensity(x: number, q: number, v: number): number {
  if (x <= 0) return q === 1 ? Number.POSITIVE_INFINITY : q === 2 ? 1 : 0;
  const logC =
    logGamma((q + v) / 2) - logGamma(q / 2) - logGamma(v / 2) + (q / 2) * Math.log(q / v);
  return Math.exp(logC + (q / 2 - 1) * Math.log(x) - ((q + v) / 2) * Math.log(1 + (q * x) / v));
}

/** Continued fraction for the incomplete beta function (modified Lentz method). */
function betaFraction(a: number, b: number, x: number): number {
  const tiny = 1e-300;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 500; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a - 1 + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + 1 + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const step = d * c;
    h *= step;
    if (Math.abs(step - 1) < 1e-15) break;
  }
  return h;
}

/** The regularised incomplete beta function I_x(a, b) = P(B ≤ x) for B ~ Beta(a, b). */
export function betaCdf(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (front * betaFraction(a, b, x)) / a
    : 1 - (front * betaFraction(b, a, 1 - x)) / b;
}

/** The p-value of an F test: P(F > f) for F ~ F(q, v), which is I_(v/(v + qf))(v/2, q/2). */
export function fTail(f: number, q: number, v: number): number {
  if (f <= 0) return 1;
  return betaCdf(v / (v + q * f), v / 2, q / 2);
}

/** The critical value: the f with P(F > f) = α (5 % unless given), by bisection. */
export function fCriticalValue(q: number, v: number, alpha = 0.05): number {
  let lo = 0;
  let hi = 100;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (fTail(mid, q, v) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The caption: the distribution, where the observed F falls and what the decision means. */
export function describeFTest(q: number, v: number, f: number): string {
  const c = fCriticalValue(q, v);
  const p = fTail(f, q, v);
  const restrictions = q === 1 ? '1 restriction' : `${q} restrictions`;
  const shape = `The curve is the F(${q}, ${v}) distribution: how F behaves when H₀ (${restrictions}) is true and the unrestricted model has n − k = ${v} residual degrees of freedom. The gold right tail beyond ${fmt(c, 2)} holds 5 % of the area; that is the rejection region.`;
  const verdict =
    p <= 0.05
      ? `The observed F = ${fmt(f)} lies in it: imposing H₀ raises SSR by more than chance usually would, the p-value (lilac) is ${probText(p)}, and H₀ is rejected at 5 %.`
      : `The observed F = ${fmt(f)} lies outside it: a rise in SSR of this size is common when H₀ holds, the p-value (lilac) is ${probText(p)}, and H₀ is not rejected at 5 %. That does not prove the restrictions are true.`;
  const link =
    q === 1
      ? ` With one restriction F = t², so this critical value is the square of the two-sided t value, ${fmt(Math.sqrt(c), 3)}.`
      : '';
  return `${shape} ${verdict}${link}`;
}

/** EM03: move the number of restrictions, the residual degrees of freedom and the observed F. */
export function RegressionFTest() {
  const [q, setQ] = useState(3);
  const [v, setV] = useState(40);
  const [f, setF] = useState(2);
  const c = fCriticalValue(q, v);
  const p = fTail(f, q, v);
  const density = (x: number) => fDensity(x, q, v);
  const height = Math.min(density(f), FRAME.yMax);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="F"
        yLabel="density"
        xTicks={[0, 1, 2, 3, 4, 5, 6, 7]}
        yTicks={[0.5, 1]}
      >
        <Area frame={FRAME} top={density} from={c} to={FRAME.xMax} tone="gold" />
        <Area frame={FRAME} top={density} from={Math.max(f, 0.001)} to={FRAME.xMax} tone="lilac" />
        <Curve frame={FRAME} fn={density} from={0.001} />
        <Segment frame={FRAME} from={[c, 0]} to={[c, 0.55]} tone="green" dashed />
        <Note frame={FRAME} x={c + 0.1} y={0.5} anchor="start">
          reject
        </Note>
        <Segment frame={FRAME} from={[f, 0]} to={[f, height]} />
        <Dot frame={FRAME} x={f} y={height} />
      </Plot>
      <Slider label="Restrictions q" value={q} min={1} max={6} step={1} onChange={setQ} />
      <Slider
        label="Residual degrees of freedom n − k"
        value={v}
        min={10}
        max={120}
        step={1}
        onChange={setV}
      />
      <Slider label="Observed F" value={f} min={0} max={7} step={0.05} onChange={setF} />
      <Readout
        items={[
          ['5 % critical value', fmt(c, 2)],
          ['p-value', probText(p)],
          ['Decision', p <= 0.05 ? 'reject H₀' : 'do not reject H₀'],
        ]}
      />
      <figcaption>{describeFTest(q, v, f)}</figcaption>
    </figure>
  );
}
