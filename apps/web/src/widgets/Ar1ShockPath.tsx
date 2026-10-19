import { useState } from 'react';
import { Area, Curve, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

// Topic EM06, Example 1: inflation follows π(t) = c + φ·π(t − 1) + ε(t) with c = 1.2, φ = 0.6 and
// shocks of standard deviation σ = 1.2, starting from its long-run mean of 3.

/**
 * Sixty fixed standard normal draws, one per period. They were made once with the app's seeded
 * generator (seed 390, Box–Muller) and rounded to 2 decimals, so every student sees the same
 * shocks and only φ and c change the path; no Math.random.
 */
export const DRAWS = [
  -0.32, 0.98, 0.69, 0.56, 1.15, -1.04, -0.42, 0.34, -0.45, -0.42, 0.15, 2.15, 0.55, -0.44, 0.4,
  1.72, -1.3, -0.77, 0.87, -0.32, -0.12, -0.68, 1.21, -1.86, 0.21, -0.81, 0.16, -0.88, -1.94, 0.75,
  0.15, -1.65, -0.74, 0.54, 0.67, -0.85, 0.25, 0.12, -0.99, 0.25, 2.25, 0.63, 0.81, 0.77, -2.21,
  1.05, -1.66, -1.53, -0.15, -1.61, -0.62, 0.25, 0.41, 0.31, 1.09, 1.09, 0.04, -0.37, -0.02, 0.44,
] as const;

/** The standard deviation of the shocks. */
export const SIGMA = 1.2;
/** The starting value y(0), the mean in Example 1. */
export const START = 3;
export const PERIODS = DRAWS.length;

/** φ = 1 (up to slider rounding): a unit root. */
export const isUnitRoot = (phi: number) => Math.abs(phi - 1) < 1e-9;

/** y(0), y(1), …, y(60) from y(t) = c + φ·y(t − 1) + σ·z(t) with the fixed draws z. */
export function ar1Path(phi: number, c: number): number[] {
  const path = [START];
  DRAWS.forEach((z, t) => {
    path.push(c + phi * (path[t] ?? START) + SIGMA * z);
  });
  return path;
}

/** The long-run mean c/(1 − φ); null when |φ| ≥ 1, where there is none. */
export const ar1Mean = (phi: number, c: number) => (Math.abs(phi) < 1 ? c / (1 - phi) : null);

/** The long-run variance σ²/(1 − φ²); null when |φ| ≥ 1. */
export const ar1Variance = (phi: number) =>
  Math.abs(phi) < 1 ? SIGMA ** 2 / (1 - phi ** 2) : null;

/** The autocorrelation at lag k, φᵏ; null when |φ| ≥ 1. */
export const ar1Autocorrelation = (phi: number, k = 1) => (Math.abs(phi) < 1 ? phi ** k : null);

/** The value of the path between whole periods, on the straight line joining them. */
export function between(path: number[], x: number): number {
  const at = Math.min(Math.max(x, 0), path.length - 1);
  const t = Math.min(Math.floor(at), path.length - 2);
  const a = path[t] ?? 0;
  const b = path[t + 1] ?? a;
  return a + (b - a) * (at - t);
}

const STEPS = [1, 2, 5, 10, 20, 50, 100];

/** A vertical window with round ticks that holds every value, with at most 6 gaps between ticks. */
export function verticalFrame(values: number[]) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = STEPS.find((s) => Math.ceil(hi / s) - Math.floor(lo / s) <= 6) ?? 100;
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.max(Math.ceil(hi / step) * step, yMin + step);
  const ticks: number[] = [];
  for (let y = yMin; y <= yMax + 1e-9; y += step) ticks.push(y);
  return { yMin, yMax, ticks };
}

/** What the path shows, by the value of φ. */
export function verdict(phi: number): string {
  if (isUnitRoot(phi))
    return 'φ = 1 is a unit root: the series is a random walk (with drift c), every shock stays in it for ever, and there is no mean to return to. Its change, c + ε(t), is stationary: differencing removes the unit root.';
  if (phi < 0)
    return 'With φ < 0 a high value tends to be followed by a low one, so the path zig-zags around the mean.';
  if (phi >= 0.9)
    return 'With φ this close to 1 the series is very persistent: shocks fade slowly, the path wanders far from the mean for long spells, and the variance and the mean c/(1 − φ) are large.';
  return 'With 0 ≤ φ < 1 each period keeps a share φ of the last deviation from the mean, so shocks fade geometrically and the path keeps coming back to the dashed mean.';
}

/** EM06: an AR(1) path driven by fixed shocks; φ and c change its persistence and level. */
export function Ar1ShockPath() {
  const [phi, setPhi] = useState(0.6);
  const [c, setC] = useState(1.2);
  const path = ar1Path(phi, c);
  const mean = ar1Mean(phi, c);
  const variance = ar1Variance(phi);
  const rho = ar1Autocorrelation(phi);
  const band = mean !== null && variance !== null ? 2 * Math.sqrt(variance) : null;
  const { yMin, yMax, ticks } = verticalFrame(
    mean !== null && band !== null
      ? [...path, mean - 1.25 * band, mean + 1.25 * band, 0]
      : [...path, 0],
  );
  const frame = { xMin: 0, xMax: PERIODS + 2, yMin, yMax };
  const last = path[PERIODS] ?? START;

  return (
    <figure className="widget">
      <Plot frame={frame} xLabel="period t" yLabel="yₜ" xTicks={[20, 40, 60]} yTicks={ticks}>
        {mean !== null && band !== null && (
          <Area
            frame={frame}
            points={[
              [0, mean - band],
              [PERIODS, mean - band],
              [PERIODS, mean + band],
              [0, mean + band],
            ]}
          />
        )}
        {mean !== null && (
          <Segment frame={frame} from={[0, mean]} to={[PERIODS, mean]} tone="green" dashed />
        )}
        <Curve frame={frame} fn={(x) => between(path, x)} to={PERIODS} />
        <Dot frame={frame} x={0} y={START} />
        <Dot frame={frame} x={PERIODS} y={last} hollow />
      </Plot>
      <Slider label="Persistence φ" value={phi} min={-0.95} max={1} step={0.05} onChange={setPhi} />
      <Slider label="Intercept c" value={c} min={0} max={2} step={0.1} onChange={setC} />
      <Readout
        items={
          mean !== null && variance !== null && rho !== null
            ? [
                ['Mean μ', fmt(mean)],
                ['Variance', fmt(variance)],
                ['Autocorr. ρ₁', fmt(rho)],
              ]
            : [
                ['Mean', 'none: random walk'],
                ['Variance', 'grows: t·σ²'],
                ['Autocorr. ρ₁', 'not defined'],
              ]
        }
      />
      <figcaption>
        The lilac line is y(t) over {PERIODS} periods, driven by the same shocks (σ = {fmt(SIGMA)})
        whatever the sliders say; it starts at {fmt(START)} (solid dot) and ends at {fmt(last)}{' '}
        (hollow dot).{' '}
        {mean !== null
          ? 'The dashed green line is the mean and the gold band is the mean ± 2 standard deviations, where the series spends about 95 % of its time. '
          : ''}
        {verdict(phi)}
      </figcaption>
    </figure>
  );
}
