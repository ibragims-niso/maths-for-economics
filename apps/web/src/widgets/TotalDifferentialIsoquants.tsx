import { useState } from 'react';
import { Curve, Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

/** The input map (machines across, workers up). */
const FRAME = { xMin: 0, xMax: 30, yMin: 0, yMax: 44 };
/** Output along the straight move from the start (share 0) to the new bundle (share 1). */
const PATH = { xMin: 0, xMax: 1, yMin: 60, yMax: 300 };

/** The starting bundle of topic MV03, Example 1: 16 machines and 25 workers. */
export const K0 = 16;
export const L0 = 25;

/** Output Q = 10·K^0.5·L^0.5 (MV03, Example 1). */
export const output = (K: number, L: number) => 10 * Math.sqrt(K * L);

/** The marginal products MP_K = 0.5·Q/K and MP_L = 0.5·Q/L (MV02). */
export const marginalProducts = (K: number, L: number): [number, number] => {
  const q = output(K, L);
  return [(0.5 * q) / K, (0.5 * q) / L];
};

/** The total differential at the start: dQ = MP_K·ΔK + MP_L·ΔL. */
export const estimate = (dK: number, dL: number) => {
  const [mpk, mpl] = marginalProducts(K0, L0);
  return mpk * dK + mpl * dL;
};

/** The true change ΔQ = Q(K0 + ΔK, L0 + ΔL) − Q(K0, L0). */
export const exactChange = (dK: number, dL: number) => output(K0 + dK, L0 + dL) - output(K0, L0);

/** The error of the linear estimate, ΔQ − dQ. */
export const approximationError = (dK: number, dL: number) =>
  exactChange(dK, dL) - estimate(dK, dL);

/** The isoquant Q = level as L = (level/10)²/K. */
const isoquant = (level: number) => (K: number) => (level / 10) ** 2 / K;

/** An isoquant on the input map, drawn for L from 6 to 40 so it stays clear of the axis names. */
function Isoquant({
  level,
  tone,
  dashed = false,
}: {
  level: number;
  tone: 'lilac' | 'green' | 'gold';
  dashed?: boolean;
}) {
  const kl = (level / 10) ** 2;
  return (
    <Curve
      frame={FRAME}
      fn={isoquant(level)}
      from={kl / 40}
      to={Math.min(FRAME.xMax, kl / 6)}
      tone={tone}
      dashed={dashed}
    />
  );
}

/** How good the estimate is, in words. */
export function describeError(dK: number, dL: number): string {
  const err = Math.abs(approximationError(dK, dL));
  if (dK === 0 && dL === 0) return 'With no change there is nothing to estimate.';
  if (err < 0.05)
    return 'The estimate and the true change agree to within 0.05: for this move the marginal products hardly change along the way.';
  if (err < 1)
    return 'The estimate is close: the gold dashed and green isoquants almost coincide. Halve both changes and the error falls to about a quarter.';
  return 'The estimate is off by more than one unit: over a large move the marginal products change, so a straight-line estimate drifts. Double both changes and the error roughly quadruples.';
}

/** MV03: change K and L together and compare the total differential with the true change in output. */
export function TotalDifferentialIsoquants() {
  const [dK, setDK] = useState(2);
  const [dL, setDL] = useState(-1);
  const q0 = output(K0, L0);
  const [mpk, mpl] = marginalProducts(K0, L0);
  const dQ = estimate(dK, dL);
  const exact = exactChange(dK, dL);
  const err = approximationError(dK, dL);
  const K1 = K0 + dK;
  const L1 = L0 + dL;

  return (
    <figure className="widget">
      <Plot
        frame={PATH}
        xLabel="share of the move"
        yLabel="output Q"
        xTicks={[0, 0.5, 1]}
        yTicks={[100, 200, 300]}
      >
        <Curve frame={PATH} fn={(s) => q0 + exactChange(s * dK, s * dL)} tone="green" />
        <Curve frame={PATH} fn={(s) => q0 + s * dQ} tone="gold" dashed />
        <Segment frame={PATH} from={[1, q0 + dQ]} to={[1, q0 + exact]} tone="lilac" />
        <Dot frame={PATH} x={1} y={q0 + dQ} hollow />
        <Dot frame={PATH} x={1} y={q0 + exact} />
      </Plot>
      <Plot
        frame={FRAME}
        xLabel="K (machines)"
        yLabel="L (workers)"
        xTicks={[0, 8, 16, 24]}
        yTicks={[10, 25, 40]}
      >
        <Isoquant level={q0} tone="lilac" dashed />
        <Isoquant level={q0 + exact} tone="green" />
        <Isoquant level={q0 + dQ} tone="gold" dashed />
        <Segment frame={FRAME} from={[K0, L0]} to={[K1, L1]} tone="lilac" />
        <Dot frame={FRAME} x={K0} y={L0} />
        <Dot frame={FRAME} x={K1} y={L1} hollow />
      </Plot>
      <Slider
        label="Change in machines ΔK"
        value={dK}
        min={-8}
        max={8}
        step={0.5}
        onChange={setDK}
      />
      <Slider
        label="Change in workers ΔL"
        value={dL}
        min={-10}
        max={10}
        step={0.5}
        onChange={setDL}
      />
      <Readout
        items={[
          ['Exact ΔQ', fmt(exact)],
          ['Estimate dQ', fmt(dQ)],
          ['Error ΔQ − dQ', fmt(err)],
        ]}
      />
      <figcaption>
        Q = 10K^0.5·L^0.5 starts at K = {K0}, L = {L0} with Q = {fmt(q0)}, MP_K = {fmt(mpk)} and
        MP_L = {fmt(mpl)}, so the estimate is dQ = {fmt(mpk)}·ΔK + {fmt(mpl)}·ΔL = {fmt(dQ)}. Top:
        output along the move, true (green curve) and estimated (gold dashed line); the lilac gap at
        the end is the error. Bottom: the move on the input map, from the filled to the hollow dot,
        with the starting isoquant Q = {fmt(q0)} (lilac dashed), the isoquant really reached, Q ={' '}
        {fmt(q0 + exact)} (green), and the one the estimate predicts, Q = {fmt(q0 + dQ)} (gold
        dashed). {describeError(dK, dL)}
      </figcaption>
    </figure>
  );
}
