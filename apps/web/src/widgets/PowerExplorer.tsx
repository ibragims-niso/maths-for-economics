import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Slider } from './kit';

const FRAME = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };

/** An exponent in quarters written as a fraction: 0.5 → "1/2", −1.25 → "−5/4", 2 → "2". */
export function asFraction(p: number): string {
  const quarters = Math.round(p * 4);
  const sign = quarters < 0 ? '−' : '';
  const n = Math.abs(quarters);
  if (n % 4 === 0) return `${sign}${n / 4}`;
  if (n % 2 === 0) return `${sign}${n / 2}/2`;
  return `${sign}${n}/4`;
}

/** What the exponent does to the shape of y = x^p. */
export function describePower(p: number): string {
  if (p < 0) return 'A negative exponent means a reciprocal, x^−p = 1/x^p, so the curve falls.';
  if (p === 0) return 'Any positive number to the power 0 is 1, so the graph is a flat line at 1.';
  if (p < 1)
    return 'An exponent between 0 and 1 is a root: the curve rises more and more slowly, like output with diminishing returns.';
  if (p === 1) return 'With p = 1 the graph is the straight line y = x.';
  return 'An exponent above 1 makes the curve rise faster and faster.';
}

/** F01: change the exponent p and see how y = x^p behaves for zero, negative and fractional powers. */
export function PowerExplorer() {
  const [p, setP] = useState(0.5);
  const [x, setX] = useState(4);
  const y = x ** p;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="x"
        yLabel="y = xᵖ"
        xTicks={[0, 2, 4, 6, 8, 10]}
        yTicks={[1, 5, 10]}
      >
        <Curve frame={FRAME} fn={(v) => v} tone="green" dashed />
        <Curve frame={FRAME} fn={(v) => v ** p} from={0.05} />
        <Guides frame={FRAME} x={x} y={y} />
        <Dot frame={FRAME} x={x} y={y} />
      </Plot>
      <Slider
        label="Exponent p"
        value={p}
        min={-1}
        max={2}
        step={0.25}
        onChange={setP}
        format={asFraction}
      />
      <Slider label="Input x" value={x} min={1} max={9} onChange={setX} />
      <Readout
        items={[
          ['Exponent', asFraction(p)],
          [`${x} to the power ${asFraction(p)}`, fmt(y, 3)],
          ['Compared with x', y > x ? 'larger' : y < x ? 'smaller' : 'equal'],
        ]}
      />
      <figcaption>{describePower(p)} The dashed line is y = x, the case p = 1.</figcaption>
    </figure>
  );
}
