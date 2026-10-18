import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

/** Effective annual rate in per cent of a nominal rate (per cent) compounded m times a year. */
export function earPercent(ratePct: number, m: number): number {
  return ((1 + ratePct / 100 / m) ** m - 1) * 100;
}

/** The ceiling the effective rate approaches as compounding becomes continuous: e^r − 1. */
export function continuousEarPercent(ratePct: number): number {
  return (Math.exp(ratePct / 100) - 1) * 100;
}

/** The graph window: m from 1 to 24 across, effective rates from the nominal rate to the ceiling up. */
export function compoundingFrame(ratePct: number) {
  const gap = continuousEarPercent(ratePct) - ratePct;
  return { xMin: 0, xMax: 24, yMin: ratePct - 0.4 * gap, yMax: ratePct + 1.35 * gap };
}

const M_MAX = 24;

/** FM02: change the nominal rate and how often interest is added; watch the effective rate climb towards e^r − 1. */
export function CompoundingFrequency() {
  const [rate, setRate] = useState(18);
  const [m, setM] = useState(12);
  const frame = compoundingFrame(rate);
  const ear = earPercent(rate, m);
  const ceiling = continuousEarPercent(rate);
  const daily = earPercent(rate, 365);

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="times a year, m"
        yLabel="effective rate, %"
        xTicks={[1, 4, 12, 24]}
        yTicks={[rate, ceiling]}
      >
        <Segment frame={frame} from={[0, ceiling]} to={[M_MAX, ceiling]} tone="green" dashed />
        <Segment frame={frame} from={[0, rate]} to={[M_MAX, rate]} tone="gold" dashed />
        <Curve frame={frame} fn={(x) => earPercent(rate, x)} from={1} to={M_MAX} />
        <Guides frame={frame} x={m} y={ear} />
        <Dot frame={frame} x={m} y={ear} />
      </Plot>
      <Slider
        label="Nominal rate"
        value={rate}
        min={1}
        max={30}
        step={0.5}
        onChange={setRate}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider
        label="Times a year interest is added, m"
        value={m}
        min={1}
        max={M_MAX}
        onChange={setM}
      />
      <Readout
        items={[
          ['Rate per period r/m', `${fmt(rate / m, 3)} %`],
          ['Effective annual rate', `${fmt(ear, 2)} %`],
          ['Continuous ceiling eʳ − 1', `${fmt(ceiling, 2)} %`],
        ]}
      />
      <figcaption>
        The gold dashed line is the nominal rate, which equals the effective rate only when m = 1.
        The green dashed line is the ceiling for continuous compounding. Each extra period adds less
        than the one before: daily compounding (m = 365) gives {fmt(daily, 3)} %, almost exactly the
        ceiling.
      </figcaption>
    </figure>
  );
}
