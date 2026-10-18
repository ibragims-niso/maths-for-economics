import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// Topic C112, Example 1: MC(q) = 20 + 4q + 0.3q², so C(q) = 20q + 2q² + 0.1q³ + F.
const FAMILY = [0, 250, 500, 750, 1000];
const FRAME = { xMin: 0, xMax: 20, yMin: 0, yMax: 3200 };
/** Half the width, in units of q, of the short tangent drawn at q on each curve. */
const HALF = 1.5;

/** Marginal cost MC(q) = 20 + 4q + 0.3q². */
export function marginalCost(q: number): number {
  return 20 + 4 * q + 0.3 * q ** 2;
}

/** The antiderivative of MC with constant F (the fixed cost): C(q) = 20q + 2q² + 0.1q³ + F. */
export function totalCost(q: number, fixedCost: number): number {
  return 20 * q + 2 * q ** 2 + 0.1 * q ** 3 + fixedCost;
}

/** The slope of the cost curve at q, measured from the curve itself over a tiny step. */
export function slopeOfCost(q: number, fixedCost: number): number {
  const h = 1e-3;
  return (totalCost(q + h, fixedCost) - totalCost(q - h, fixedCost)) / (2 * h);
}

/** C112: shift the cost curve with the fixed cost; its slope at every q stays equal to MC. */
export function AntiderivativeFamily() {
  const [fixedCost, setFixedCost] = useState(500);
  const [q, setQ] = useState(10);
  const mc = marginalCost(q);
  const tangent = (f: number): [[number, number], [number, number]] => [
    [q - HALF, totalCost(q, f) - mc * HALF],
    [q + HALF, totalCost(q, f) + mc * HALF],
  ];
  const others = FAMILY.filter((f) => f !== fixedCost);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output q"
        yLabel="total cost C(q)"
        xTicks={[0, 5, 10, 15, 20]}
        yTicks={[1000, 2000, 3000]}
      >
        {others.map((f) => (
          <Curve key={f} frame={FRAME} fn={(x) => totalCost(x, f)} dashed />
        ))}
        {others.map((f) => {
          const [from, to] = tangent(f);
          return <Segment key={f} frame={FRAME} from={from} to={to} />;
        })}
        <Curve frame={FRAME} fn={(x) => totalCost(x, fixedCost)} />
        <Segment frame={FRAME} from={tangent(fixedCost)[0]} to={tangent(fixedCost)[1]} />
        <Guides frame={FRAME} x={q} y={totalCost(q, fixedCost)} />
        <Dot frame={FRAME} x={q} y={totalCost(q, fixedCost)} />
      </Plot>
      <Slider
        label="Fixed cost F = C(0)"
        value={fixedCost}
        min={0}
        max={1000}
        step={50}
        onChange={setFixedCost}
      />
      <Slider label="Output q" value={q} min={1} max={20} onChange={setQ} />
      <Readout
        items={[
          ['Marginal cost MC(q)', fmt(mc)],
          ['Total cost C(q)', fmt(totalCost(q, fixedCost))],
          ['Slope of C at q', fmt(slopeOfCost(q, fixedCost))],
        ]}
      />
      <figcaption>
        Each curve is C(q) = 20q + 2q² + 0.1q³ + F, an antiderivative of MC(q) = 20 + 4q + 0.3q²
        with its own constant F: dashed for F = 0, 250, 500, 750, 1,000, solid for the slider’s F.
        They are one curve shifted up or down, so at q = {q} every one has slope MC({q}) = {fmt(mc)}{' '}
        and the gold tangents are parallel. Marginal cost cannot tell them apart; the fixed cost{' '}
        {fmt(fixedCost)}, where the solid curve starts on the cost axis, picks one and gives C({q})
        = {fmt(totalCost(q, fixedCost))}.
      </figcaption>
    </figure>
  );
}
