import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// The factory of topic MV11, Example 1: Q = 5·K^(1/3)·L^(2/3) with K machine-hours and L
// worker-hours a day, r = 1 per machine-hour. At w = 16 and Q̄ = 1000 the cheapest mix is
// L* = 100 and K* = 800, costing 2400.
const FRAME = { xMin: 0, xMax: 320, yMin: 0, yMax: 2200 };
export const A = 5;
export const ALPHA = 1 / 3;
export const BETA = 2 / 3;
/** The rental price of a machine-hour stays fixed; the slider moves the wage. */
export const RENT = 1;
/** Curves stop below this height, clear of the name of the K axis. */
const K_TOP = 1950;

/**
 * Where a falling curve should stop, given the worker-hours at which it reaches height K: at
 * K = 120 if that is left of L = 210, otherwise at K = 330 (or the frame edge) so that it stays
 * above the name of the L axis in the bottom-right corner.
 */
export function curveEnd(lAt: (K: number) => number) {
  const low = lAt(120);
  return low <= 210 ? low : Math.min(FRAME.xMax, Math.max(210, lAt(330)));
}

/** Output Q = A·K^α·L^β. */
export const output = (K: number, L: number) => A * K ** ALPHA * L ** BETA;

/** The tangency MRTS = (β/α)·(K/L) = w/r gives capital per worker-hour K/L = αw/(βr) = w/2. */
export const capitalPerWorker = (w: number) => (ALPHA * w) / (BETA * RENT);

/** The conditional factor demands L*(w, r, Q̄) and K*(w, r, Q̄) (α + β = 1). */
export function optimum(w: number, Q: number) {
  const ratio = capitalPerWorker(w);
  const L = Q / (A * ratio ** ALPHA);
  return { L, K: ratio * L };
}

/** The cost function C(w, r, Q̄) = wL* + rK*. */
export function minCost(w: number, Q: number) {
  const { L, K } = optimum(w, Q);
  return w * L + RENT * K;
}

/** The isoquant Q = Q̄ solved for K: K = (Q̄/(A·L^β))^(1/α). */
export const isoquantK = (Q: number, L: number) => (Q / (A * L ** BETA)) ** (1 / ALPHA);

/** The isocost line wL + rK = C solved for K. */
export const isocostK = (C: number, w: number, L: number) => (C - w * L) / RENT;

/** The worker-hours where the isoquant reaches height K (the inverse of isoquantK). */
export const isoquantL = (Q: number, K: number) => (Q / (A * K ** ALPHA)) ** (1 / BETA);

/** MV11: the cheapest mix of workers and machines for an output target, and how it moves with w. */
export function CobbDouglasCostMin() {
  const [w, setW] = useState(16);
  const [Q, setQ] = useState(1000);
  const best = optimum(w, Q);
  const C = minCost(w, Q);
  const ratio = capitalPerWorker(w);
  const lineFrom = Math.max(0, (C - K_TOP * RENT) / w);
  const lineTo = curveEnd((K) => (C - RENT * K) / w);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="L worker-hours"
        yLabel="K machine-hours"
        xTicks={[0, 100, 200, 300]}
        yTicks={[500, 1000, 1500, 2000]}
      >
        <Segment
          frame={FRAME}
          from={[0, 0]}
          to={[Math.min(FRAME.xMax, K_TOP / ratio), Math.min(K_TOP, ratio * FRAME.xMax)]}
          tone="gold"
          dashed
        />
        <Curve
          frame={FRAME}
          fn={(L) => isocostK(C, w, L)}
          from={lineFrom}
          to={lineTo}
          tone="green"
        />
        <Curve
          frame={FRAME}
          fn={(L) => isoquantK(Q, L)}
          from={isoquantL(Q, K_TOP)}
          to={curveEnd((K) => isoquantL(Q, K))}
        />
        <Guides frame={FRAME} x={best.L} y={best.K} />
        <Dot frame={FRAME} x={best.L} y={best.K} />
      </Plot>
      <Slider label="Wage w per worker-hour" value={w} min={6} max={32} onChange={setW} />
      <Slider label="Output target Q̄" value={Q} min={500} max={1500} step={100} onChange={setQ} />
      <Readout
        items={[
          ['Workers L*', fmt(best.L)],
          ['Machines K*', fmt(best.K)],
          ['Minimum cost', fmt(C)],
        ]}
      />
      <figcaption>
        The lilac curve is the isoquant 5K^(1/3)·L^(2/3) = {fmt(Q)}; the green line is the cheapest
        isocost line {fmt(w)}L + K = {fmt(C)} that still reaches it, and they touch at the dot,
        where MRTS = w/r = {fmt(w)}. The gold dashed ray is the expansion path K = {fmt(ratio)}
        L: change Q̄ and the dot slides along it, and the cost per unit stays {fmt(C / Q, 3)},
        because doubling both inputs doubles output. Raise the wage and the ray turns steeper: the
        firm swaps workers for machines, yet labour's share of the bill, wL*/C ={' '}
        {fmt((w * best.L) / C, 3)}, stays at 2/3.
      </figcaption>
    </figure>
  );
}
