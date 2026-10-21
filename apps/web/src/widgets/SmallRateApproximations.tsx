import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic C119: ln(1 + g), eᵍ − 1 and sin g are all close to g when g is small.
const FRAME = { xMin: 0, xMax: 1, yMin: 0, yMax: 1.8 };

/** The ratio of each small quantity to g itself; each one tends to 1 as g → 0. */
export const ratios = (g: number) => ({
  log: Math.log1p(g) / g,
  exp: Math.expm1(g) / g,
  sin: Math.sin(g) / g,
});

/** C119: move the rate g and watch the three ratios approach 1 as g shrinks. */
export function SmallRateApproximations() {
  const [percent, setPercent] = useState(10);
  const g = percent / 100;
  const r = ratios(g);
  const gap = Math.abs(r.log - 1);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="rate g"
        yLabel="value"
        xTicks={[0, 0.25, 0.5, 0.75, 1]}
        yTicks={[0.5, 1, 1.5]}
      >
        <Segment frame={FRAME} from={[0, 0]} to={[1, 1]} tone="gold" dashed />
        <Curve frame={FRAME} fn={(x) => Math.expm1(x)} tone="green" />
        <Curve frame={FRAME} fn={(x) => Math.log1p(x)} />
        <Guides frame={FRAME} x={g} y={Math.expm1(g)} />
        <Dot frame={FRAME} x={g} y={Math.expm1(g)} hollow />
        <Dot frame={FRAME} x={g} y={g} hollow />
        <Dot frame={FRAME} x={g} y={Math.log1p(g)} />
        <Note frame={FRAME} x={0.62} y={1.5}>
          eᵍ − 1
        </Note>
        <Note frame={FRAME} x={0.78} y={0.88}>
          g
        </Note>
        <Note frame={FRAME} x={0.7} y={0.38}>
          ln(1 + g)
        </Note>
      </Plot>
      <Slider
        label="Rate g"
        value={percent}
        min={1}
        max={100}
        step={1}
        onChange={setPercent}
        format={(value) => `${fmt(value, 0)} %`}
      />
      <Readout
        items={[
          ['ln(1 + g) ÷ g', fmt(r.log, 3)],
          ['(eᵍ − 1) ÷ g', fmt(r.exp, 3)],
          ['sin g ÷ g', fmt(r.sin, 3)],
        ]}
      />
      <figcaption>
        At g = {fmt(percent, 0)} %, the log rate is ln(1 + g) = {fmt(Math.log1p(g) * 100)} % and
        the continuous rate g turns into eᵍ − 1 = {fmt(Math.expm1(g) * 100)} % a year.{' '}
        {gap < 0.05
          ? 'All three are within 5 % of g: near zero they are equivalent infinitesimals, and you can swap one for another.'
          : 'At a rate this large the curves have pulled away from the dashed line g, so the shortcut ln(1 + g) ≈ g is no longer safe.'}
      </figcaption>
    </figure>
  );
}
