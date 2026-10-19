import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic DY06, Example 3: capital per worker follows k(t+1) = k(t) + g(k(t)) + z, with net
// investment g(k) = −0.02(k − 2)(k − 5)(k − 10) and a permanent boost z (aid or a productivity
// gain). With z = 0 the steady states are 2 and 10 (stable) and 5 (unstable); the example
// starts at 4 and at 6. The model is meant for capital between 1 and 11.
export const STEPS = 20;
const K_MAX = 12;
const FRAME = { xMin: 0, xMax: K_MAX, yMin: 0, yMax: K_MAX };
const TIME = { xMin: 0, xMax: STEPS, yMin: 0, yMax: K_MAX };

/** Net investment per worker, g(k) + z. */
export const netInvestment = (k: number, z: number) => -0.02 * (k - 2) * (k - 5) * (k - 10) + z;

/** The map f(k) = k + g(k) + z: next period's capital per worker. */
export const nextCapital = (k: number, z: number) => k + netInvestment(k, z);

/** f′(k) = 1 − 0.02(3k² − 34k + 80); the boost z shifts the curve but not its slope. */
export const mapSlope = (k: number) => 1 - 0.02 * (3 * k * k - 34 * k + 80);

/** The steady states in [0, 12]: where net investment is zero (scan for sign changes, then bisect). */
export function steadyStates(z: number): number[] {
  const roots: number[] = [];
  const n = 1200;
  for (let i = 0; i < n; i++) {
    let lo = (K_MAX * i) / n;
    let hi = (K_MAX * (i + 1)) / n;
    const gLo = netInvestment(lo, z);
    if (gLo === 0) {
      roots.push(lo);
      continue;
    }
    if (gLo * netInvestment(hi, z) >= 0) continue;
    for (let j = 0; j < 60; j++) {
      const mid = (lo + hi) / 2;
      if (netInvestment(lo, z) * netInvestment(mid, z) <= 0) hi = mid;
      else lo = mid;
    }
    roots.push((lo + hi) / 2);
  }
  return roots;
}

/** Locally stable when |f′(k*)| < 1. */
export const isStable = (k: number) => Math.abs(mapSlope(k)) < 1;

/** k(0), k(1), …, k(steps), by applying the map again and again. */
export function capitalPath(start: number, z: number, steps = STEPS): number[] {
  const path = [start];
  for (let t = 1; t <= steps; t++) path.push(nextCapital(path[t - 1] ?? start, z));
  return path;
}

/** The steady state the path heads for in the long run (after 2000 steps, the nearest one). */
export function longRunSteadyState(start: number, z: number): number {
  const end = capitalPath(start, z, 2000).at(-1) ?? start;
  const states = steadyStates(z);
  return states.reduce((best, k) => (Math.abs(k - end) < Math.abs(best - end) ? k : best), end);
}

/** The corners of the staircase: up from the axis to the curve, across to the 45° line, up again… */
export function staircase(path: number[]): [number, number][] {
  const first = path[0] ?? 0;
  const corners: [number, number][] = [[first, 0]];
  for (let t = 1; t < path.length; t++) {
    const before = path[t - 1] ?? first;
    const now = path[t] ?? before;
    corners.push([before, now], [now, now]);
  }
  return corners;
}

const list = (xs: number[]) =>
  xs.length === 0
    ? 'none'
    : xs.length === 1
      ? fmt(xs[0] ?? 0)
      : `${xs
          .slice(0, -1)
          .map((x) => fmt(x))
          .join(', ')} and ${fmt(xs.at(-1) ?? 0)}`;

/** The caption's explanation of the basins of attraction for the current boost. */
export function explainBasins(z: number): string {
  const states = steadyStates(z);
  const stable = states.filter(isStable);
  const unstable = states.filter((k) => !isStable(k));
  if (states.length === 1)
    return `With this boost there is only one steady state, ${fmt(states[0] ?? 0)}, and it is stable: every start leads to it, so it is globally stable on this range. ${(states[0] ?? 0) > 5 ? 'The trap has disappeared.' : 'The rich steady state has disappeared.'}`;
  return `The unstable steady state ${list(unstable)} is a threshold: every start below it ends at ${fmt(stable[0] ?? 0)}, every start above it at ${fmt(stable.at(-1) ?? 0)}. These two ranges are the basins of attraction, so each stable steady state is only locally stable.`;
}

/** DY06: a poverty trap. A map with three steady states, the 45° line and a staircase path. */
export function PovertyTrapMap() {
  const [z, setZ] = useState(0);
  const [start, setStart] = useState(4);
  const path = capitalPath(start, z);
  const corners = staircase(path);
  const legs = corners.slice(1).map((to, i) => ({ id: `leg${i}`, from: corners[i] ?? to, to }));
  const steps = path.slice(1).map((k, t) => ({
    id: `step${t + 1}`,
    from: [t, path[t] ?? start] as [number, number],
    to: [t + 1, k] as [number, number],
  }));
  const states = steadyStates(z);
  const stable = states.filter(isStable);
  const end = path[STEPS] ?? start;
  const target = longRunSteadyState(start, z);
  const heading = isStable(target) ? `towards ${fmt(target)}` : `stuck at ${fmt(target)}`;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="kₜ"
        yLabel="kₜ₊₁"
        xTicks={[0, 2, 4, 6, 8, 10, 12]}
        yTicks={[2, 4, 6, 8, 10]}
      >
        <Curve frame={FRAME} fn={(k) => k} tone="green" dashed />
        <Curve frame={FRAME} fn={(k) => nextCapital(k, z)} from={1} to={11} />
        {legs.map((leg) => (
          <Segment key={leg.id} frame={FRAME} from={leg.from} to={leg.to} />
        ))}
        {states.map((k) => (
          <Dot key={k.toFixed(4)} frame={FRAME} x={k} y={k} hollow={!isStable(k)} />
        ))}
        <Note frame={FRAME} x={10.4} y={11.4} anchor="end">
          45°
        </Note>
        <Note frame={FRAME} x={11.9} y={nextCapital(11, z) - 1.4} anchor="end">
          f(k)
        </Note>
      </Plot>
      <Plot
        frame={TIME}
        xLabel="t"
        yLabel="kₜ"
        xTicks={[0, 5, 10, 15, 20]}
        yTicks={[2, 4, 6, 8, 10]}
      >
        {states.map((k) => (
          <Segment
            key={k.toFixed(4)}
            frame={TIME}
            from={[0, k]}
            to={[STEPS, k]}
            tone={isStable(k) ? 'green' : 'gold'}
            dashed
          />
        ))}
        {steps.map((s) => (
          <Segment key={s.id} frame={TIME} from={s.from} to={s.to} tone="lilac" />
        ))}
        <Dot frame={TIME} x={0} y={start} />
      </Plot>
      <Slider
        label="Boost to investment z"
        value={z}
        min={-0.8}
        max={0.4}
        step={0.05}
        onChange={setZ}
      />
      <Slider
        label="Starting capital k₀"
        value={start}
        min={1}
        max={11}
        step={0.5}
        onChange={setStart}
      />
      <Readout
        items={[
          ['Steady states', list(states)],
          ['Stable (|f′| < 1)', list(stable)],
          [`k after ${STEPS} steps`, `${fmt(end)}, ${heading}`],
        ]}
      />
      <figcaption>
        Top: next period's capital per worker, f(k) = k + g(k) + z (lilac), against the dashed 45°
        line; they cross at the steady states (solid dots stable, hollow dots unstable). The gold
        staircase follows {STEPS} steps from k₀. Bottom: the same path over time, with the stable
        steady states dashed green and the unstable ones dashed gold. {explainBasins(z)}
      </figcaption>
    </figure>
  );
}
