import { createRng } from '@mfe/core';
import { useState } from 'react';
import { Area, Curve, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

// Topic SP03: ten random walks Sₙ = X₁ + … + Xₙ with steps +1 (probability p) or −1, as in
// Examples 1 and 2 (a share price that moves by 1 a day; after 100 days SD = 10 when p = ½).

export const PATHS = 10;
export const STEPS = 100;
/** 0, 1, …, 9: the paths' numbers, also used as React keys. */
const PATH_IDS = Array.from({ length: PATHS }, (_, i) => i);

/**
 * Fixed coin tosses: one uniform number in [0, 1) per path and step, from the app's seeded
 * generator (seed 130), so every student sees the same paths; no Math.random. A step goes up
 * when its number is below p, so moving the p slider bends the same paths instead of redrawing.
 */
export const TOSSES: readonly (readonly number[])[] = (() => {
  const rng = createRng(130);
  return Array.from({ length: PATHS }, () => Array.from({ length: STEPS }, () => rng.next()));
})();

/** S₀ = 0, S₁, …, S₁₀₀ for path i when a step goes up with probability p. */
export function walkPath(i: number, p: number): number[] {
  const path = [0];
  (TOSSES[i] ?? []).forEach((u, t) => {
    path.push((path[t] ?? 0) + (u < p ? 1 : -1));
  });
  return path;
}

/** E[Sₙ] = n(2p − 1). */
export const walkMean = (n: number, p: number) => n * (2 * p - 1);
/** Var(Sₙ) = 4np(1 − p); n for p = ½. */
export const walkVariance = (n: number, p: number) => 4 * n * p * (1 - p);
export const walkSd = (n: number, p: number) => Math.sqrt(walkVariance(n, p));

/** Where the ten paths are after n steps. */
export const endpoints = (n: number, p: number) =>
  Array.from({ length: PATHS }, (_, i) => walkPath(i, p)[n] ?? 0);

/** How many of the ten paths end inside E[Sₙ] ± 2 SD after n steps. */
export function insideCount(n: number, p: number): number {
  const m = walkMean(n, p);
  const band = 2 * walkSd(n, p);
  return endpoints(n, p).filter((s) => Math.abs(s - m) <= band + 1e-9).length;
}

/** The value of a path between whole steps, on the straight line joining them. */
export function between(path: number[], x: number): number {
  const at = Math.min(Math.max(x, 0), path.length - 1);
  const t = Math.min(Math.floor(at), path.length - 2);
  const a = path[t] ?? 0;
  const b = path[t + 1] ?? a;
  return a + (b - a) * (at - t);
}

const TICK_STEPS = [5, 10, 20, 25, 50];

/** A vertical window with round ticks holding every path and the band over all 100 steps. */
export function verticalFrame(p: number) {
  const values = [0];
  for (let i = 0; i < PATHS; i++) values.push(...walkPath(i, p));
  const m = walkMean(STEPS, p);
  const band = 2 * walkSd(STEPS, p);
  values.push(m - 1.2 * band, m + 1.2 * band);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const step = TICK_STEPS.find((s) => Math.ceil(hi / s) - Math.floor(lo / s) <= 6) ?? 50;
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let y = yMin; y <= yMax + 1e-9; y += step) ticks.push(y);
  return { yMin, yMax, ticks };
}

/** SP03: random-walk paths with the E ± 2 SD band; the spread grows like √n. */
export function RandomWalkFan() {
  const [n, setN] = useState(100);
  const [p, setP] = useState(0.5);
  const { yMin, yMax, ticks } = verticalFrame(p);
  const frame = { xMin: 0, xMax: STEPS + 2, yMin, yMax };
  const paths = PATH_IDS.map((id) => ({ id, path: walkPath(id, p) }));
  const mean = walkMean(n, p);
  const sd = walkSd(n, p);
  const inside = insideCount(n, p);
  const quarter = Math.max(1, Math.round(n / 4));

  return (
    <figure className="widget">
      <Plot frame={frame} xLabel="n" yLabel="Sₙ" xTicks={[25, 50, 75, 100]} yTicks={ticks}>
        <Area
          frame={frame}
          top={(x) => walkMean(x, p) + 2 * walkSd(x, p)}
          bottom={(x) => walkMean(x, p) - 2 * walkSd(x, p)}
          from={0}
          to={STEPS}
        />
        {paths.map(({ id, path }) => (
          <Curve key={id} frame={frame} fn={(x) => between(path, x)} from={0} to={n} />
        ))}
        <Segment frame={frame} from={[0, 0]} to={[STEPS, walkMean(STEPS, p)]} tone="green" dashed />
        {paths.map(({ id, path }) => (
          <Dot key={id} frame={frame} x={n} y={path[n] ?? 0} hollow />
        ))}
      </Plot>
      <Slider label="Steps n" value={n} min={1} max={STEPS} onChange={setN} />
      <Slider
        label="Probability of an up-step p"
        value={p}
        min={0.3}
        max={0.7}
        step={0.05}
        onChange={setP}
      />
      <Readout
        items={[
          ['E[Sₙ]', fmt(mean)],
          ['SD(Sₙ)', fmt(sd)],
          ['Inside ±2 SD', `${inside} of ${PATHS}`],
        ]}
      />
      <figcaption>
        Ten random walks that start at 0 and move up 1 with probability p or down 1 otherwise, all
        driven by the same fixed coin tosses; the hollow dots mark where they are after n = {n}{' '}
        steps. The dashed green line is the mean E[Sₙ] = n(2p − 1) and the gold band is the mean ± 2
        standard deviations, where about 95 % of paths should end. The band widens like √n, not like
        n
        {n >= 4
          ? `: after ${quarter} steps its half-width is ${fmt(2 * walkSd(quarter, p))}, after ${n} steps ${fmt(2 * sd)}, only ${fmt(Math.sqrt(n / quarter))} times as wide for ${fmt(n / quarter)} times the steps.`
          : '.'}
        {Math.abs(p - 0.5) > 1e-9
          ? ' With p ≠ ½ the drift grows like n while the spread grows only like √n, so in the long run the drift dominates.'
          : ''}
      </figcaption>
    </figure>
  );
}
