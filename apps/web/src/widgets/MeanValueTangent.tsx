import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// Topic C120, Example 1: output Q(L) = 20√L for L hours of labour.
const K = 20;
const FRAME = { xMin: 0, xMax: 100, yMin: 0, yMax: 210 };

export const output = (L: number) => K * Math.sqrt(L);
export const marginal = (L: number) => K / (2 * Math.sqrt(L));

/** Chord slope between a and b, and the point c where the tangent has that slope. */
export function meanValue(a: number, b: number) {
  const slope = (output(b) - output(a)) / (b - a);
  const c = ((Math.sqrt(a) + Math.sqrt(b)) / 2) ** 2;
  return { slope, c };
}

/** C120: pick an interval of hours; the tangent at c runs parallel to the chord. */
export function MeanValueTangent() {
  const [start, setStart] = useState(4);
  const [extra, setExtra] = useState(60);
  const a = start;
  const b = start + extra;
  const { slope, c } = meanValue(a, b);
  const half = 18;
  const tangent = (L: number) => output(c) + marginal(c) * (L - c);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="hours L"
        yLabel="output Q"
        xTicks={[0, 25, 50, 75, 100]}
        yTicks={[50, 100, 150, 200]}
      >
        <Curve frame={FRAME} fn={output} />
        <Segment frame={FRAME} from={[a, output(a)]} to={[b, output(b)]} tone="gold" dashed />
        <Segment
          frame={FRAME}
          from={[c - half, tangent(c - half)]}
          to={[c + half, tangent(c + half)]}
          tone="green"
        />
        <Guides frame={FRAME} x={c} y={output(c)} />
        <Dot frame={FRAME} x={a} y={output(a)} hollow />
        <Dot frame={FRAME} x={b} y={output(b)} hollow />
        <Dot frame={FRAME} x={c} y={output(c)} />
      </Plot>
      <Slider label="Start, hours" value={start} min={1} max={40} step={1} onChange={setStart} />
      <Slider label="Extra hours" value={extra} min={4} max={60} step={1} onChange={setExtra} />
      <Readout
        items={[
          ['Average extra output per hour', fmt(slope, 3)],
          ['Mean value point c', `${fmt(c)} h`],
          ['Marginal product Q′(c)', fmt(marginal(c), 3)],
        ]}
      />
      <figcaption>
        From {fmt(a, 0)} to {fmt(b, 0)} hours output rises from {fmt(output(a))} to {fmt(output(b))}
        . The dashed gold chord has slope {fmt(slope, 3)}; the green tangent at c = {fmt(c)} hours
        has exactly the same slope, so the two lines are parallel. The midpoint {fmt((a + b) / 2)}{' '}
        is not the answer: c is the square of the average of √{fmt(a, 0)} and √{fmt(b, 0)}.
      </figcaption>
    </figure>
  );
}
