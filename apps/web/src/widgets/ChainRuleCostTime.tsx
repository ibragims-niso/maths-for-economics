import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 9000 };
/** Output at opening, as in C104 Example 2: Q(t) = 40 + gt. */
const START = 40;
/** Half the width of the tangent line, in weeks. */
const HALF = 2.5;

/** Weekly output t weeks after opening when output grows by g units a week. */
export function outputAt(t: number, g: number): number {
  return START + g * t;
}

/** Weekly cost of producing Q units: C(Q) = 500 + 6Q + 0.5Q² (C104 Example 2). */
export function costOf(q: number): number {
  return 500 + 6 * q + 0.5 * q * q;
}

/** Marginal cost C′(Q) = 6 + Q. */
export function marginalCost(q: number): number {
  return 6 + q;
}

/** dC/dt = C′(Q(t)) · Q′(t), with Q′(t) = g. */
export function costRate(t: number, g: number): number {
  return marginalCost(outputAt(t, g)) * g;
}

/** C104: cost depends on output, output on time; dC/dt is marginal cost times output growth. */
export function ChainRuleCostTime() {
  const [t, setT] = useState(4);
  const [g, setG] = useState(5);
  const q = outputAt(t, g);
  const cost = costOf(q);
  const mc = marginalCost(q);
  const rate = costRate(t, g);
  const costAtTime = (s: number) => costOf(outputAt(s, g));

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="Weeks t"
        yLabel="Weekly cost C"
        xTicks={[0, 2, 4, 6, 8, 10]}
        yTicks={[2000, 4000, 6000, 8000]}
      >
        <Curve frame={FRAME} fn={costAtTime} />
        <Segment
          frame={FRAME}
          from={[t - HALF, cost - rate * HALF]}
          to={[t + HALF, cost + rate * HALF]}
        />
        <Guides frame={FRAME} x={t} y={cost} />
        <Dot frame={FRAME} x={t} y={cost} />
      </Plot>
      <Slider label="Time t (weeks)" value={t} min={0} max={10} step={0.5} onChange={setT} />
      <Slider label="Output growth g (units a week)" value={g} min={1} max={8} onChange={setG} />
      <Readout
        items={[
          ['Output growth Q′(t)', fmt(g)],
          [`Marginal cost C′(${fmt(q)})`, fmt(mc)],
          ['Cost change dC/dt', fmt(rate)],
        ]}
      />
      <figcaption>
        The purple curve is weekly cost C(Q(t)), with output Q(t) = {START} + gt units a week and
        cost C(Q) = 500 + 6Q + 0.5Q². At t = {fmt(t)} the factory makes {fmt(q)} units, which cost{' '}
        {fmt(cost)}. Each extra unit adds C′({fmt(q)}) = {fmt(mc)} to cost and output grows by Q′(t)
        = {g} units a week, so cost rises by {fmt(mc)} × {g} = {fmt(rate)} a week: the slope of the
        gold tangent.
      </figcaption>
    </figure>
  );
}
