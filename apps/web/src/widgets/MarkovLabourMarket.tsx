import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic SP01, Examples 1 and 2: 4 % of employed workers lose their job each quarter, 36 % of the
// unemployed find one, and unemployment starts at 20 % after a recession.
const START = 0.2;
const QUARTERS = 20;

/** One quarter of the two-state chain: the unemployed who stay plus the employed who lose their job. */
export const nextUnemployment = (s: number, f: number, u: number) => u * (1 - f) + (1 - u) * s;

/** The unemployment share after n quarters, by applying the chain n times. */
export function unemploymentAfter(s: number, f: number, u0: number, n: number): number {
  let u = u0;
  for (let k = 0; k < n; k++) u = nextUnemployment(s, f, u);
  return u;
}

/** The long-run (stationary) unemployment share, where inflows s(1 − u) equal outflows f·u. */
export const longRunUnemployment = (s: number, f: number) => s / (s + f);

/** The factor by which the gap to the long-run share shrinks each quarter. */
export const gapFactor = (s: number, f: number) => 1 - s - f;

/** The top of the vertical axis in per cent: a multiple of 5 a little above the highest value. */
export const axisTop = (highestPercent: number) => Math.ceil((highestPercent * 1.15) / 5) * 5;

/** The piecewise-linear path through the quarterly values, for drawing. */
function pathFn(s: number, f: number, u0: number) {
  const values = Array.from(
    { length: QUARTERS + 1 },
    (_, k) => 100 * unemploymentAfter(s, f, u0, k),
  );
  return (x: number) => {
    const k = Math.min(Math.floor(x), QUARTERS - 1);
    const a = values[k] ?? 0;
    const b = values[k + 1] ?? a;
    return a + (b - a) * (x - k);
  };
}

/** SP01: a two-state labour market; the unemployment share converges to s/(s + f) from any start. */
export function MarkovLabourMarket() {
  const [s, setS] = useState(0.04);
  const [f, setF] = useState(0.36);
  const [n, setN] = useState(2);
  const longRun = longRunUnemployment(s, f);
  const now = unemploymentAfter(s, f, START, n);
  const top = axisTop(Math.max(100 * START, 100 * longRun));
  const frame = { xMin: 0, xMax: QUARTERS, yMin: 0, yMax: top };
  const tick = top > 30 ? 10 : 5;
  const yTicks = Array.from({ length: Math.floor(top / tick) }, (_, i) => (i + 1) * tick);

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="n"
        yLabel="unemployed, %"
        xTicks={[0, 5, 10, 15, 20]}
        yTicks={yTicks}
      >
        <Segment
          frame={frame}
          from={[0, 100 * longRun]}
          to={[QUARTERS, 100 * longRun]}
          tone="green"
          dashed
        />
        <Curve frame={frame} fn={pathFn(s, f, 0)} tone="gold" dashed />
        <Curve frame={frame} fn={pathFn(s, f, START)} />
        <Guides frame={frame} x={n} y={100 * now} />
        <Dot frame={frame} x={n} y={100 * now} />
        <Note frame={frame} x={14} y={100 * longRun + top * 0.04} anchor="middle">
          long run {fmt(100 * longRun, 1)} %
        </Note>
      </Plot>
      <Slider label="Job-loss rate s" value={s} min={0.01} max={0.1} step={0.01} onChange={setS} />
      <Slider
        label="Job-finding rate f"
        value={f}
        min={0.1}
        max={0.6}
        step={0.01}
        onChange={setF}
      />
      <Slider label="Quarters n" value={n} min={0} max={QUARTERS} onChange={setN} />
      <Readout
        items={[
          [`Unemployed after ${n} quarter${n === 1 ? '' : 's'}`, `${fmt(100 * now, 1)} %`],
          ['Long-run share', `${fmt(100 * longRun, 1)} %`],
          ['Gap', `${fmt(100 * (now - longRun), 2)} points`],
        ]}
      />
      <figcaption>
        The solid line starts at 20 % unemployment, the dashed one at 0 %. Each quarter the gap to
        the long-run share shrinks by the factor 1 − s − f = {fmt(gapFactor(s, f))}, so both lines
        settle on the green line s/(s + f), whatever the start. A higher job-finding rate pulls the
        lines in faster and lowers the long-run share.
      </figcaption>
    </figure>
  );
}
