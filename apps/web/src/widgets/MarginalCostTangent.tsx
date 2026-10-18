import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Slider } from './kit';

// The cost function of topic C103, Example 1: C(q) = 400 + 90q − 3q² + 0.1q³.
const F = 400;
const A = 90;
const B = 3;
const C = 0.1;
const FRAME = { xMin: 0, xMax: 27, yMin: 0, yMax: 2700 };

/** Total cost C(q) = 400 + 90q − 3q² + 0.1q³. */
export function cost(q: number): number {
  return F + A * q - B * q ** 2 + C * q ** 3;
}

/** Marginal cost by the differentiation rules: C′(q) = 90 − 6q + 0.3q². */
export function marginalCost(q: number): number {
  return A - 2 * B * q + 3 * C * q ** 2;
}

/** The actual cost of one more unit: C(q + 1) − C(q). */
export function extraCost(q: number): number {
  return cost(q + 1) - cost(q);
}

/** The tangent line to the cost curve at q, as a function of x. */
export function tangentAt(q: number): (x: number) => number {
  return (x) => cost(q) + marginalCost(q) * (x - q);
}

/** C103: move the output; the tangent's slope C′(q) nearly equals the cost of one more unit. */
export function MarginalCostTangent() {
  const [q, setQ] = useState(10);
  const mc = marginalCost(q);
  const extra = extraCost(q);
  const gap = extra - mc;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output q"
        yLabel="total cost C(q)"
        xTicks={[0, 5, 10, 15, 20, 25]}
        yTicks={[500, 1000, 1500, 2000, 2500]}
      >
        <Curve frame={FRAME} fn={tangentAt(q)} tone="gold" dashed />
        <Curve frame={FRAME} fn={cost} />
        <Guides frame={FRAME} x={q} y={cost(q)} />
        <Dot frame={FRAME} x={q + 1} y={cost(q + 1)} hollow />
        <Dot frame={FRAME} x={q} y={cost(q)} />
      </Plot>
      <Slider label="Output q" value={q} min={1} max={24} onChange={setQ} />
      <Readout
        items={[
          ['Total cost C(q)', fmt(cost(q))],
          ['Marginal cost C′(q)', fmt(mc)],
          ['C(q + 1) − C(q)', fmt(extra)],
        ]}
      />
      <figcaption>
        The gold dashed line is the tangent at q = {q}; its slope is the marginal cost C′({q}) ={' '}
        {fmt(mc)}. Making unit {q + 1} (the hollow point) actually adds {fmt(extra)} to cost, a gap
        of {fmt(Math.abs(gap))} because the curve bends away from its tangent. Marginal cost is a
        quick, close estimate of the cost of one more unit.
      </figcaption>
    </figure>
  );
}
