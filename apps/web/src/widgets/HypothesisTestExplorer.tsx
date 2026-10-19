import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';
import { normalCdf, normalDensity, probText } from './NormalAreaExplorer';

const FRAME = { xMin: -4, xMax: 4, yMin: 0, yMax: 0.46 };

/** The standard normal density, the distribution of z when H₀ is true. */
const phi = (z: number) => normalDensity(z, 0, 1);

/** The z with 1 − Φ(z) = tail, found by bisection (tail between 0 and 1/2). */
export function upperQuantile(tail: number): number {
  let lo = 0;
  let hi = 8;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (1 - normalCdf(mid) > tail) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * The critical value for a z test at level α (in per cent): z_α for H₁: μ > μ₀ (one-sided),
 * z_(α/2) for H₁: μ ≠ μ₀ (two-sided, used as ±z_(α/2)).
 */
export function criticalValue(alphaPercent: number, twoSided: boolean): number {
  const alpha = alphaPercent / 100;
  return upperQuantile(twoSided ? alpha / 2 : alpha);
}

/** The p-value of an observed z: 1 − Φ(z) one-sided (H₁: μ > μ₀), 2(1 − Φ(|z|)) two-sided. */
export function pValueOf(z: number, twoSided: boolean): number {
  return twoSided ? 2 * (1 - normalCdf(Math.abs(z))) : 1 - normalCdf(z);
}

/** Reject H₀ when the p-value is at most α, which is the same as z falling in the rejection region. */
export function rejects(z: number, alphaPercent: number, twoSided: boolean): boolean {
  return pValueOf(z, twoSided) <= alphaPercent / 100;
}

/** The caption: the rejection region, where z falls, and what the decision means. */
export function describeTest(alphaPercent: number, z: number, twoSided: boolean): string {
  const c = criticalValue(alphaPercent, twoSided);
  const alpha = fmt(alphaPercent / 100, 3);
  const p = probText(pValueOf(z, twoSided));
  const region = twoSided
    ? `H₁: μ ≠ μ₀, so the rejection region is both gold tails, z below −${fmt(c, 3)} or above ${fmt(c, 3)}`
    : `H₁: μ > μ₀, so the rejection region is the gold right tail, z above ${fmt(c, 3)}`;
  const tails = twoSided ? 'the lilac areas beyond ±|z|' : 'the lilac area to the right of z';
  const verdict = rejects(z, alphaPercent, twoSided)
    ? `The observed z = ${fmt(z)} falls inside it, and the p-value (${tails}) is ${p}, not more than α = ${alpha}: reject H₀. A result this extreme would be unusual if H₀ were true.`
    : `The observed z = ${fmt(z)} falls outside it, and the p-value (${tails}) is ${p}, more than α = ${alpha}: do not reject H₀. That does not prove H₀; the data are simply compatible with it.`;
  return `The curve is N(0, 1), how z behaves when H₀ is true. ${region}; together the gold areas are α = ${fmt(alphaPercent, 1)} %, the chance of a type I error. ${verdict}`;
}

/** ST204: move α, the observed test statistic and the sides of H₁; see the rejection region and the p-value. */
export function HypothesisTestExplorer() {
  const [alpha, setAlpha] = useState(5);
  const [z, setZ] = useState(1.8);
  const [sides, setSides] = useState(1);
  const two = sides === 2;
  const c = criticalValue(alpha, two);
  const p = pValueOf(z, two);
  const reject = rejects(z, alpha, two);
  const a = Math.abs(z);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="z" yLabel="density" xTicks={[-3, -2, -1, 0, 1, 2, 3]}>
        <Area frame={FRAME} top={phi} from={c} to={FRAME.xMax} tone="gold" />
        {two && <Area frame={FRAME} top={phi} from={FRAME.xMin} to={-c} tone="gold" />}
        {two ? (
          <>
            <Area frame={FRAME} top={phi} from={a} to={FRAME.xMax} tone="lilac" />
            <Area frame={FRAME} top={phi} from={FRAME.xMin} to={-a} tone="lilac" />
          </>
        ) : (
          <Area frame={FRAME} top={phi} from={z} to={FRAME.xMax} tone="lilac" />
        )}
        <Curve frame={FRAME} fn={phi} />
        <Segment frame={FRAME} from={[c, 0]} to={[c, 0.3]} tone="green" dashed />
        <Note frame={FRAME} x={c + 0.1} y={0.32} anchor="start">
          reject
        </Note>
        {two && (
          <>
            <Segment frame={FRAME} from={[-c, 0]} to={[-c, 0.3]} tone="green" dashed />
            <Note frame={FRAME} x={-c - 0.1} y={0.32} anchor="end">
              reject
            </Note>
          </>
        )}
        <Segment frame={FRAME} from={[z, 0]} to={[z, phi(z)]} />
        <Dot frame={FRAME} x={z} y={phi(z)} />
      </Plot>
      <Slider
        label="Significance level α"
        value={alpha}
        min={1}
        max={10}
        step={0.5}
        onChange={setAlpha}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider label="Observed z" value={z} min={-4} max={4} step={0.01} onChange={setZ} />
      <Slider
        label="Sides of H₁ (1 or 2)"
        value={sides}
        min={1}
        max={2}
        step={1}
        onChange={setSides}
        format={(v) => (v === 2 ? '2: μ ≠ μ₀' : '1: μ > μ₀')}
      />
      <Readout
        items={[
          ['Critical value', two ? `±${fmt(c, 3)}` : fmt(c, 3)],
          ['p-value', probText(p)],
          ['Decision', reject ? 'reject H₀' : 'do not reject H₀'],
        ]}
      />
      <figcaption>{describeTest(alpha, z, two)}</figcaption>
    </figure>
  );
}
