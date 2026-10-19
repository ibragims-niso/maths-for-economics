import { createRng } from '@mfe/core';
import { useState } from 'react';
import { Area, Curve, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

// Topic NM03: the project of Example 1. It costs 1000 today; next year's cash flow C is uniform
// between 960 and 1680 and is discounted at 20 %, so NPV = −1000 + C/1.2 = −200 + 600u for a
// uniform draw u. The true expected NPV is 100 and the true SD is 600/√12 ≈ 173.21.

export const MAX_DRAWS = 2000;
export const SEEDS = 5;
export const TRUE_MEAN = 100;
export const TRUE_SD = 600 / Math.sqrt(12);

/** The inverse transform for a uniform cash flow, then the NPV: −1000 + (960 + 720u)/1.2. */
export const npvFromUniform = (u: number) => -1000 + (960 + 720 * u) / 1.2;

/**
 * Fixed draws: for seed k (1 to 5), 2000 uniform numbers from the app's seeded generator
 * createRng(k), so every student sees the same runs; no Math.random.
 */
export const DRAWS: readonly (readonly number[])[] = Array.from({ length: SEEDS }, (_, k) => {
  const rng = createRng(k + 1);
  return Array.from({ length: MAX_DRAWS }, () => npvFromUniform(rng.next()));
});

export interface RunStats {
  /** The Monte Carlo estimate: the average of the first n simulated NPVs. */
  mean: number;
  /** Sample standard deviation of those NPVs (divisor n − 1). */
  sd: number;
  /** Estimated standard error s/√n. */
  se: number;
}

/** The Monte Carlo estimate x̄, the sample SD s and the standard error s/√n of simulated values. */
export function summarise(xs: readonly number[]): RunStats {
  const n = xs.length;
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1));
  return { mean, sd, se: sd / Math.sqrt(n) };
}

/** Estimate, s and s/√n from the first n draws of a seed. */
export const runStats = (seed: number, n: number) => summarise((DRAWS[seed - 1] ?? []).slice(0, n));

/** The running estimate after 1, 2, …, 2000 draws (index 0 is unused). */
export const RUNNING: readonly (readonly number[])[] = DRAWS.map((xs) => {
  const out = [Number.NaN];
  let sum = 0;
  xs.forEach((x, i) => {
    sum += x;
    out.push(sum / (i + 1));
  });
  return out;
});

/** The running estimate at a real x, on the straight line between whole numbers of draws. */
export function runningAt(seed: number, x: number): number {
  const path = RUNNING[seed - 1] ?? [];
  if (x < 1) return Number.NaN;
  const at = Math.min(x, MAX_DRAWS);
  const t = Math.min(Math.floor(at), MAX_DRAWS - 1);
  const a = path[t] ?? 0;
  const b = path[t + 1] ?? a;
  return a + (b - a) * (at - t);
}

/** Half-width of the band where the estimate lands about 95 % of the time: 2σ/√n. */
export const bandHalfWidth = (n: number) => (2 * TRUE_SD) / Math.sqrt(n);

/** What the graph shows, in words, for the caption. */
export function caption(n: number, mean: number): string {
  const inside = Math.abs(mean - TRUE_MEAN) <= bandHalfWidth(n);
  return `The lilac line is the average simulated NPV of the project in Example 1 after each draw, and the green dashed line is the true expected NPV, 100. After N = ${n} draws the estimate (dot) is ${fmt(mean, 2)}, ${inside ? 'inside' : 'outside'} the gold band 100 ± 2σ/√n = 100 ± ${fmt(bandHalfWidth(n), 1)}, where about 95 % of runs end. The band narrows like 1/√n: four times the draws halve its width. Each seed gives a different run, and the same seed always gives the same one.`;
}

const TICK_STEPS = [5, 10, 25, 50, 100, 250, 500];

/** Round ticks for a horizontal axis from 0 to n: the smallest step giving at most 4 of them. */
export function drawTicks(n: number): number[] {
  const step = TICK_STEPS.find((s) => Math.floor(n / s) <= 4) ?? 500;
  const ticks: number[] = [];
  for (let t = step; t <= n * 0.97; t += step) ticks.push(t);
  return ticks;
}

/** Pieces of the path, each drawn with its own 120 points, so the early part keeps its detail. */
const pieces = (n: number): [number, number][] => {
  const cuts = [1, n / 20, n / 4, n].filter((c, i, a) => i === 0 || c > (a[i - 1] ?? 0) + 1e-9);
  return cuts.slice(1).map((to, i) => [cuts[i] ?? 1, to]);
};

/** NM03: the running Monte Carlo estimate of a project's expected NPV settling inside ±2 SE. */
export function MonteCarloRunningMean() {
  const [n, setN] = useState(400);
  const [seed, setSeed] = useState(1);
  const { mean, se } = runStats(seed, n);
  // The window follows N, so the whole run so far fills the graph.
  const frame = { xMin: 0, xMax: n * 1.05, yMin: 0, yMax: 200 };

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="draws n"
        yLabel="estimate"
        xTicks={drawTicks(n)}
        yTicks={[0, 50, 100, 150, 200]}
      >
        <Area
          frame={frame}
          top={(x) => TRUE_MEAN + bandHalfWidth(Math.max(x, 1))}
          bottom={(x) => TRUE_MEAN - bandHalfWidth(Math.max(x, 1))}
          from={1}
          to={n}
        />
        <Segment frame={frame} from={[0, TRUE_MEAN]} to={[n, TRUE_MEAN]} tone="green" dashed />
        {pieces(n).map(([from, to]) => (
          <Curve key={from} frame={frame} fn={(x) => runningAt(seed, x)} from={from} to={to} />
        ))}
        <Dot frame={frame} x={n} y={mean} />
      </Plot>
      <Slider label="Draws N" value={n} min={10} max={MAX_DRAWS} step={10} onChange={setN} />
      <Slider label="Seed" value={seed} min={1} max={SEEDS} onChange={setSeed} />
      <Readout
        items={[
          ['Estimate', fmt(mean, 2)],
          ['SE = s/√N', fmt(se, 2)],
          ['True value', fmt(TRUE_MEAN)],
        ]}
      />
      <figcaption>{caption(n, mean)}</figcaption>
    </figure>
  );
}
