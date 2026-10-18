import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

/** Starting level of the path, as in C105 Example 1 (GDP of 400 billion). */
export const START = 400;
const T_MAX = 30;
const G_MAX = 8;

/** The level y(t) = y₀·e^(gt), with g in per cent a year. */
export function growthLevel(gPct: number, t: number, y0 = START): number {
  return y0 * Math.exp((gPct / 100) * t);
}

/** The slope dy/dt = g·y₀·e^(gt): the chain rule brings down the factor g. */
export function growthSlope(gPct: number, t: number, y0 = START): number {
  return (gPct / 100) * growthLevel(gPct, t, y0);
}

/** Slope ÷ level in per cent; it equals g at every t. */
export function slopeOverLevelPercent(gPct: number, t: number, y0 = START): number {
  return (100 * growthSlope(gPct, t, y0)) / growthLevel(gPct, t, y0);
}

/** Graph window for the normal scale: up to a little above the level at the end of the period. */
export function levelFrame(gPct: number) {
  return { xMin: 0, xMax: T_MAX, yMin: 0, yMax: 1.12 * growthLevel(gPct, T_MAX) };
}

/** Graph window for the log scale; fixed, so lines for different g can be compared by steepness. */
export const LOG_FRAME = {
  xMin: 0,
  xMax: T_MAX,
  yMin: Math.log(START) - 0.25,
  yMax: Math.log(START) + (G_MAX / 100) * T_MAX + 0.25,
};

/** Tick values for the level axis: the start level and a round number near the top. */
export function levelTicks(gPct: number): number[] {
  const top = growthLevel(gPct, T_MAX);
  const step = top > 2000 ? 1000 : top > 800 ? 200 : 100;
  const upper = Math.floor(top / step) * step;
  return upper - START >= step ? [START, upper] : [START];
}

/** C105: change g and t on the path y = 400e^(gt); the slope grows with the level, slope ÷ level stays g. */
export function GrowthRateExplorer() {
  const [g, setG] = useState(3);
  const [t, setT] = useState(10);
  const [logScale, setLogScale] = useState(0);
  const y = growthLevel(g, t);
  const slope = growthSlope(g, t);
  const isLog = logScale === 1;
  const frame = isLog ? LOG_FRAME : levelFrame(g);
  const half = 6;

  return (
    <figure className="widget">
      {isLog ? (
        <Plot
          frame={frame}
          xLabel="years, t"
          yLabel="ln y"
          xTicks={[0, 10, 20, 30]}
          yTicks={[6, 7, 8]}
        >
          <Curve frame={frame} fn={(x) => Math.log(growthLevel(g, x))} />
          <Guides frame={frame} x={t} y={Math.log(y)} />
          <Dot frame={frame} x={t} y={Math.log(y)} />
        </Plot>
      ) : (
        <Plot
          frame={frame}
          xLabel="years, t"
          yLabel="GDP, y"
          xTicks={[0, 10, 20, 30]}
          yTicks={levelTicks(g)}
        >
          <Curve frame={frame} fn={(x) => growthLevel(g, x)} />
          <Segment
            frame={frame}
            from={[t - half, y - slope * half]}
            to={[t + half, y + slope * half]}
          />
          <Guides frame={frame} x={t} y={y} />
          <Dot frame={frame} x={t} y={y} />
        </Plot>
      )}
      <Slider
        label="Growth rate g"
        value={g}
        min={0.5}
        max={G_MAX}
        step={0.5}
        onChange={setG}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider label="Time t" value={t} min={0} max={T_MAX} onChange={setT} />
      <Slider
        label="Vertical scale"
        value={logScale}
        min={0}
        max={1}
        onChange={setLogScale}
        format={(v) => (v === 1 ? 'log (ln y)' : 'normal')}
      />
      <Readout
        items={[
          ['Level y(t)', fmt(y, 2)],
          ['Slope dy/dt', fmt(slope, 2)],
          ['Slope ÷ level', `${fmt(slopeOverLevelPercent(g, t), 2)} %`],
        ]}
      />
      <figcaption>
        {isLog
          ? `On a log scale the path is the straight line ln y = ln 400 + ${fmt(g / 100, 3)}t. Its slope is the growth rate g, the same at every point; a faster-growing path is a steeper line.`
          : `The path y = 400e^(${fmt(g / 100, 3)}t) and its gold tangent at t = ${t}. The tangent gets steeper as GDP grows, but the slope divided by the level stays at g = ${fmt(g, 1)} %.`}
      </figcaption>
    </figure>
  );
}
