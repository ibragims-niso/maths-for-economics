import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Rent of 12000 a year, received continuously (topic C116, Examples 1 and 2). Plotted in thousands.
const FLOW = 12000;
const FRAME = { xMin: 0, xMax: 80, yMin: 0, yMax: 14 };

/** Present value of A a year received continuously for T years: ∫₀ᵀ A·e^(−rt) dt = A(1 − e^(−rT))/r. */
export function streamValue(flow: number, rate: number, years: number): number {
  return (flow * (1 - Math.exp(-rate * years))) / rate;
}

/** Present value of the same stream for ever: ∫₀^∞ A·e^(−rt) dt = A/r. */
export function perpetualValue(flow: number, rate: number): number {
  return flow / rate;
}

/** The share of the perpetual value that the first T years provide: 1 − e^(−rT). */
export function shareCaptured(rate: number, years: number): number {
  return 1 - Math.exp(-rate * years);
}

/** C116: change the discount rate and the horizon T; the shaded area under A·e^(−rt) approaches A/r. */
export function ContinuousDiscountArea() {
  const [ratePct, setRatePct] = useState(6);
  const [years, setYears] = useState(15);
  const r = ratePct / 100;
  const k = (v: number) => v / 1000;
  const discounted = (t: number) => k(FLOW * Math.exp(-r * t));
  const share = shareCaptured(r, years);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="years t"
        yLabel="income a year (thousands)"
        xTicks={[0, 20, 40, 60, 80]}
        yTicks={[4, 8, 12]}
      >
        <Curve frame={FRAME} fn={() => k(FLOW)} tone="green" dashed />
        <Note frame={FRAME} x={79} y={k(FLOW) + 0.6} anchor="end">
          undiscounted
        </Note>
        <Area frame={FRAME} top={discounted} from={0} to={years} />
        <Curve frame={FRAME} fn={discounted} />
        <Guides frame={FRAME} x={years} y={discounted(years)} />
        <Dot frame={FRAME} x={years} y={discounted(years)} />
      </Plot>
      <Slider
        label="Discount rate r"
        value={ratePct}
        min={1}
        max={15}
        step={0.5}
        onChange={setRatePct}
        format={(v) => `${fmt(v)} %`}
      />
      <Slider label="Horizon T (years)" value={years} min={1} max={80} onChange={setYears} />
      <Readout
        items={[
          ['Value of first T years', fmt(streamValue(FLOW, r, years))],
          ['For ever, A/r', fmt(perpetualValue(FLOW, r))],
          ['Share captured', `${fmt(share * 100, 1)} %`],
        ]}
      />
      <figcaption>
        The solid curve is a rent of {fmt(FLOW)} a year discounted to today, {fmt(FLOW)}·e^(−rt);
        the green dashed line is the rent itself. The shaded area up to T = {years} is the value of
        the first {years} {years === 1 ? 'year' : 'years'}: {fmt(share * 100, 1)} % of the value of
        the rent for ever. Each extra year adds a thinner slice, so the area approaches A/r ={' '}
        {fmt(perpetualValue(FLOW, r))} but never passes it: the improper integral converges.
      </figcaption>
    </figure>
  );
}
