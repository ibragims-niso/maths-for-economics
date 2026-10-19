import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

const FRAME = { xMin: 100, xMax: 700, yMin: 0, yMax: 0.0145 };

/** The N(mean, sd²) density at x. */
export function normalDensity(x: number, mean: number, sd: number): number {
  const z = (x - mean) / sd;
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}

/**
 * The standard normal cdf Φ(z) by Marsaglia's series, Φ(z) = 1/2 + φ(z)(z + z³/3 + z⁵/15 + …),
 * accurate to about 1e-15 (the same method as the ST105 generators).
 */
export function normalCdf(z: number): number {
  if (z < -8) return 0;
  if (z > 8) return 1;
  let sum = z;
  let term = z;
  for (let k = 3; ; k += 2) {
    term *= (z * z) / k;
    const next = sum + term;
    if (next === sum) break;
    sum = next;
  }
  return 0.5 + sum * normalDensity(z, 0, 1);
}

/** z-score of x and the area to its left, P(X < x). */
export function leftArea(x: number, mean: number, sd: number) {
  const z = (x - mean) / sd;
  return { z, p: normalCdf(z) };
}

/** A probability to 4 decimals; values that would round to 0 or 1 are shown as "< 0.0001" or "> 0.9999". */
export function probText(p: number): string {
  if (p < 0.00005) return '< 0.0001';
  if (p > 0.99995) return '> 0.9999';
  return fmt(p, 4);
}

const PERCENT_WITHIN = ['', '68 %', '95 %', '99.7 %'] as const;

/** How far x is from the mean in standard deviations, in the language of the 68–95–99.7 rule. */
export function band(z: number): string {
  const a = Math.abs(z);
  const k = Math.round(a);
  if (k >= 1 && k <= 3 && Math.abs(a - k) < 1e-9) return `exactly ${k}σ`;
  if (a < 1) return 'within 1σ';
  if (a < 2) return '1σ to 2σ';
  if (a < 3) return '2σ to 3σ';
  return 'beyond 3σ';
}

/** The caption: what the shaded area means, and where x sits by the 68–95–99.7 rule. */
export function describeNormal(mean: number, sd: number, x: number): string {
  const { z, p } = leftArea(x, mean, sd);
  const side = z >= 0 ? 'above' : 'below';
  const k = Math.min(3, Math.max(1, Math.ceil(Math.abs(z) - 1e-9)));
  const range = `between ${fmt(mean - k * sd)} and ${fmt(mean + k * sd)}`;
  const distance: Record<string, string> = {
    'within 1σ': 'less than 1σ',
    '1σ to 2σ': 'between 1σ and 2σ',
    '2σ to 3σ': 'between 2σ and 3σ',
  };
  const where =
    z === 0
      ? `The cut-off ${fmt(x)} is the mean itself, so half of the area lies on each side.`
      : Math.abs(z) > 3
        ? `The cut-off ${fmt(x)} is more than 3σ ${side} the mean: only about 0.3 % of days are that far out, both sides together.`
        : `The cut-off ${fmt(x)} is ${distance[band(z)] ?? band(z)} ${side} the mean; about ${PERCENT_WITHIN[k]} of days have demand within ${k}σ of it, ${range}.`;
  const shown = probText(p);
  const value = /^[<>]/.test(shown) ? shown : `= ${shown}`;
  return `The shaded area is P(X < ${fmt(x)}) ${value}, the share of days with demand below ${fmt(x)} loaves; the whole area under the curve is 1. ${where}`;
}

/** ST105: move the mean, the spread and a cut-off, and read P(X < x) as the area under the bell curve. */
export function NormalAreaExplorer() {
  const [mean, setMean] = useState(400);
  const [sd, setSd] = useState(50);
  const [x, setX] = useState(470);
  const { z, p } = leftArea(x, mean, sd);
  const f = (v: number) => normalDensity(v, mean, sd);
  const peak = f(mean);

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="x" yLabel="density f(x)" xTicks={[100, 250, 400, 550, 700]}>
        <Area frame={FRAME} top={f} from={FRAME.xMin} to={x} tone="gold" />
        <Curve frame={FRAME} fn={f} />
        <Segment frame={FRAME} from={[mean, 0]} to={[mean, peak]} tone="green" dashed />
        <Note frame={FRAME} x={mean} y={peak + 0.0007} anchor="middle">
          μ
        </Note>
        <Segment frame={FRAME} from={[x, 0]} to={[x, f(x)]} />
        <Dot frame={FRAME} x={x} y={f(x)} />
      </Plot>
      <Slider label="Mean μ" value={mean} min={300} max={500} step={10} onChange={setMean} />
      <Slider label="Standard deviation σ" value={sd} min={30} max={80} step={5} onChange={setSd} />
      <Slider label="Cut-off x" value={x} min={150} max={650} step={5} onChange={setX} />
      <Readout
        items={[
          ['z = (x − μ)/σ', fmt(z, 2)],
          ['P(X < x)', probText(p)],
          ['From μ', band(z)],
        ]}
      />
      <figcaption>{describeNormal(mean, sd, x)}</figcaption>
    </figure>
  );
}
