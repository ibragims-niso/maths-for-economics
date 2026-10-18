import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Demand P = 120 − 3Q and cost C = F + vQ (topic F06, Example 3).
const ALPHA = 120;
const BETA = 3;
const FRAME = { xMin: 0, xMax: 42, yMin: -800, yMax: 1400 };

/** The top of a parabola: the quantity, the price that sells it and the height of the curve. */
export interface Top {
  q: number;
  p: number;
  value: number;
}

/** Revenue R(Q) = (α − βQ)Q. */
export const revenue = (alpha: number, beta: number, q: number) => (alpha - beta * q) * q;

/** Profit π(Q) = R(Q) − (F + vQ). */
export const profit = (alpha: number, beta: number, v: number, fixed: number, q: number) =>
  revenue(alpha, beta, q) - fixed - v * q;

/** Revenue is largest at Q = α/(2β), where P = α/2 and R = α²/(4β). */
export function revenueTop(alpha: number, beta: number): Top {
  const q = alpha / (2 * beta);
  return { q, p: alpha - beta * q, value: revenue(alpha, beta, q) };
}

/** Profit is largest at Q = (α − v)/(2β), where P = (α + v)/2. */
export function profitTop(alpha: number, beta: number, v: number, fixed: number): Top {
  const q = (alpha - v) / (2 * beta);
  return { q, p: alpha - beta * q, value: profit(alpha, beta, v, fixed, q) };
}

/** F06: change the costs and compare the top of the revenue parabola with the top of profit. */
export function RevenueProfit() {
  const [v, setV] = useState(30);
  const [fixed, setFixed] = useState(400);
  const r = revenueTop(ALPHA, BETA);
  const p = profitTop(ALPHA, BETA, v, fixed);
  // Label the profit curve just right of its falling side, above the bottom of the graph.
  const drop = Math.min(600, p.value - FRAME.yMin - 80);
  const piLabel = { q: p.q + Math.sqrt(drop / BETA) + 1.5, y: p.value - drop };

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="Q"
        yLabel="R, π"
        xTicks={[10, 20, 30, 40]}
        yTicks={[-800, 0, 600, 1200]}
      >
        <Curve frame={FRAME} fn={(q) => revenue(ALPHA, BETA, q)} to={40} />
        <Curve frame={FRAME} fn={(q) => profit(ALPHA, BETA, v, fixed, q)} tone="green" />
        <Guides frame={FRAME} x={r.q} y={r.value} />
        <Guides frame={FRAME} x={p.q} y={p.value} />
        <Dot frame={FRAME} x={r.q} y={r.value} />
        <Dot frame={FRAME} x={p.q} y={p.value} hollow />
        <Note frame={FRAME} x={33} y={revenue(ALPHA, BETA, 31)}>
          R(Q)
        </Note>
        <Note frame={FRAME} x={piLabel.q} y={piLabel.y}>
          π(Q)
        </Note>
      </Plot>
      <Slider label="Cost per unit v" value={v} min={0} max={60} step={5} onChange={setV} />
      <Slider label="Fixed cost F" value={fixed} min={0} max={800} step={50} onChange={setFixed} />
      <Readout
        items={[
          ['Revenue top', `Q ${fmt(r.q)}, P ${fmt(r.p)}`],
          ['Profit top', `Q ${fmt(p.q)}, P ${fmt(p.p)}`],
          ['Largest profit', fmt(p.value)],
        ]}
      />
      <figcaption>
        Demand P = 120 − 3Q, cost C = {fmt(fixed)} + {fmt(v)}Q. The solid dot is the top of revenue
        (lilac), the hollow dot the top of profit (green). A higher v moves the profit top left, to
        fewer units at a higher price; F only moves the profit curve down.
      </figcaption>
    </figure>
  );
}
