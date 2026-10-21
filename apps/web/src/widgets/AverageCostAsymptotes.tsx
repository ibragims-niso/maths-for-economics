import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic C121: average cost AC(q) = F/q + c + d·q has the asymptotes q = 0 and y = c + d·q.
const C = 20;
const FRAME = { xMin: 0, xMax: 40, yMin: 0, yMax: 200 };

export const averageCost = (F: number, d: number, q: number) => F / q + C + d * q;
/** The lowest point: AC′(q) = −F/q² + d = 0 at q = √(F/d), where AC = c + 2√(F·d). */
export const lowestPoint = (F: number, d: number) => {
  const q = Math.sqrt(F / d);
  return { q, ac: averageCost(F, d, q) };
};

/** C121: change the fixed cost and the slope of the variable cost; watch both asymptotes. */
export function AverageCostAsymptotes() {
  const [fixed, setFixed] = useState(200);
  const [d, setD] = useState(2);
  const low = lowestPoint(fixed, d);
  const line = (q: number) => C + d * q;
  const qShow = 20;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="output q"
        yLabel="cost per unit"
        xTicks={[0, 10, 20, 30, 40]}
        yTicks={[50, 100, 150, 200]}
      >
        <Segment frame={FRAME} from={[0, C]} to={[40, line(40)]} tone="gold" dashed />
        <Curve frame={FRAME} fn={(q) => averageCost(fixed, d, q)} from={0.5} to={40} />
        <Segment
          frame={FRAME}
          from={[qShow, line(qShow)]}
          to={[qShow, averageCost(fixed, d, qShow)]}
          tone="green"
        />
        <Guides frame={FRAME} x={low.q} y={low.ac} />
        <Dot frame={FRAME} x={low.q} y={low.ac} />
        <Note frame={FRAME} x={14} y={line(14) - 22}>
          y = 20 + {fmt(d, 1)}q
        </Note>
      </Plot>
      <Slider label="Fixed cost F" value={fixed} min={50} max={400} step={10} onChange={setFixed} />
      <Slider
        label="Slope d of the variable cost"
        value={d}
        min={0.5}
        max={4}
        step={0.1}
        onChange={setD}
        format={(v) => fmt(v, 1)}
      />
      <Readout
        items={[
          ['Lowest average cost', fmt(low.ac)],
          ['at output q', fmt(low.q)],
          ['Gap to the line at q = 20', fmt(fixed / qShow)],
        ]}
      />
      <figcaption>
        AC(q) = {fmt(fixed, 0)}/q + 20 + {fmt(d, 1)}q. Near q = 0 the fixed cost is spread over
        almost nothing, so the curve shoots up along the vertical axis (a vertical asymptote). For
        large q the term {fmt(fixed, 0)}/q fades and the curve hugs the dashed line y = 20 +{' '}
        {fmt(d, 1)}q (an oblique asymptote); the green bar shows the remaining gap, F/q.
      </figcaption>
    </figure>
  );
}
