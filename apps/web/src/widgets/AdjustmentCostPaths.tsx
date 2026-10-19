import { useState } from 'react';
import { Curve, Dot, fmt, Plot, Readout, Slider } from './kit';

// Topic DO01: a firm raises production from x(0) = 0 to x(T) = 10 and pays
// ∫₀ᵀ (a·ẋ² + b·x²) dt with a = 1. The defaults T = 2, b/a = 1 are Example 2.
export const T = 2;
export const TARGET = 10;
const FRAME = { xMin: 0, xMax: T, yMin: 0, yMax: 11 };
const EPS = 1e-9;

/** The Euler–Lagrange path for x″ = r·x through x(0) = 0 and x(T) = 10: 10·sinh(kt)/sinh(kT). */
export function bestPath(r: number, t: number): number {
  const k = Math.sqrt(r);
  if (k < EPS) return (TARGET * t) / T;
  return (TARGET * Math.sinh(k * t)) / Math.sinh(k * T);
}

/** The trial path 10·(t/T)^p: p = 1 is the straight line, p > 1 starts slowly and ends fast. */
export function trialPath(p: number, t: number): number {
  return TARGET * (t / T) ** p;
}

/** Cost of the best path, a·x(T)·ẋ(T) = 100·k·coth(kT) (100/T when there is no running cost). */
export function bestCost(r: number): number {
  const k = Math.sqrt(r);
  if (k < EPS) return TARGET ** 2 / T;
  return (TARGET ** 2 * k * Math.cosh(k * T)) / Math.sinh(k * T);
}

/** Cost of the trial path: 100p²/(T(2p − 1)) for adjusting plus r·100·T/(2p + 1) for running (p > ½). */
export function trialCost(p: number, r: number): number {
  return (TARGET ** 2 * p * p) / (T * (2 * p - 1)) + (r * TARGET ** 2 * T) / (2 * p + 1);
}

/** Why the best path looks as it does, and how close the trial path is. */
export function explainPaths(p: number, r: number): string {
  const extra = trialCost(p, r) - bestCost(r);
  const shape =
    r < EPS
      ? 'With no running cost only the speed matters, and since ẋ² punishes bursts, an even speed is cheapest: the best path is the straight line.'
      : 'Running at a high level costs b·x², so it pays to stay low early and build up late; but leaving it too late makes ẋ² large near the end. The Euler–Lagrange path x″ = (b/a)x balances the two at every moment, so every other path with the same ends costs more.';
  // Is the trial path below the best path halfway through, i.e. does it leave the build-up late?
  const late = trialPath(p, T / 2) < bestPath(r, T / 2);
  let verdict: string;
  if (extra < 0.005) verdict = ' Here the trial path is the best path.';
  else if (extra < 0.02 * bestCost(r))
    verdict = ' Here the trial path is within 2 % of the best cost and wastes little.';
  else if (r < EPS)
    verdict = late
      ? ' This trial path saves the change for the end, and the late burst costs more than an even speed.'
      : ' This trial path rushes at the start, and the early burst costs more than an even speed.';
  else
    verdict = late
      ? ' This trial path waits too long and then has to rush.'
      : ' This trial path builds up too early and pays running costs it could have avoided.';
  return `${shape}${verdict}`;
}

/** DO01: compare a trial production path with the Euler–Lagrange path and see the extra cost. */
export function AdjustmentCostPaths() {
  const [p, setP] = useState(1);
  const [r, setR] = useState(1);
  const best = bestCost(r);
  const trial = trialCost(p, r);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="time t (years)"
        yLabel="production x"
        xTicks={[0, 0.5, 1, 1.5, 2]}
        yTicks={[0, 5, 10]}
      >
        <Curve frame={FRAME} fn={(t) => trialPath(p, t)} tone="gold" dashed />
        <Curve frame={FRAME} fn={(t) => bestPath(r, t)} />
        <Dot frame={FRAME} x={0} y={0} />
        <Dot frame={FRAME} x={T} y={TARGET} />
      </Plot>
      <Slider
        label="Trial path curvature p"
        value={p}
        min={0.75}
        max={4}
        step={0.05}
        onChange={setP}
      />
      <Slider
        label="Running-cost ratio b/a"
        value={r}
        min={0}
        max={4}
        step={0.25}
        onChange={setR}
      />
      <Readout
        items={[
          ['Cost of best path', fmt(best)],
          ['Cost of trial path', fmt(trial)],
          ['Extra cost', fmt(trial - best)],
        ]}
      />
      <figcaption>
        The lilac curve is the cheapest way to raise production from 0 to 10 in 2 years with cost
        ∫(ẋ² + (b/a)·x²) dt; the dashed gold curve is the trial path x = 10(t/2)ᵖ.{' '}
        {explainPaths(p, r)}
      </figcaption>
    </figure>
  );
}
