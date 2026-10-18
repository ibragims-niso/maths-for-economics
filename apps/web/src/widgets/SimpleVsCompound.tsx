import { useState } from 'react';
import { Area, Curve, Dot, fmt, Plot, Readout, Slider } from './kit';

// A deposit of 5000 (topic FM01, Example 2: 4 % a year, compounded quarterly, for 3 years).
const DEPOSIT = 5000;
const HORIZON = 30;

/** How often interest is added in a year, from the slider position. */
export const FREQUENCIES = [
  { m: 1, label: 'yearly' },
  { m: 2, label: 'half-yearly' },
  { m: 4, label: 'quarterly' },
  { m: 12, label: 'monthly' },
  { m: 365, label: 'daily' },
] as const;

/** The compounding frequency at a slider position (quarterly if the position is out of range). */
export const frequencyAt = (i: number) => FREQUENCIES[i] ?? FREQUENCIES[2];

/** Simple interest: A = P(1 + rt), with r as a decimal. */
export const simpleAmount = (p: number, r: number, t: number) => p * (1 + r * t);

/** Compound interest added m times a year: A = P(1 + r/m)^(mt). */
export const compoundAmount = (p: number, r: number, m: number, t: number) =>
  p * (1 + r / m) ** (m * t);

/** The top of the vertical axis and its ticks, in thousands, so the largest value fits. */
export function amountAxis(largest: number): { top: number; ticks: number[] } {
  const thousands = largest / 1000;
  const step = [2, 5, 10, 20, 50, 100].find((s) => thousands / s <= 4) ?? 100;
  const top = Math.ceil((thousands * 1.08) / step) * step;
  // The top value is left unlabelled: the axis name sits there.
  const ticks = Array.from({ length: Math.ceil(top / step) - 1 }, (_, i) => (i + 1) * step);
  return { top, ticks };
}

/** FM01: simple and compound growth of the same deposit; change the rate, the frequency and the time. */
export function SimpleVsCompound() {
  const [rate, setRate] = useState(4);
  const [freq, setFreq] = useState(2);
  const [years, setYears] = useState(3);
  const r = rate / 100;
  const { m, label } = frequencyAt(freq);
  const simple = (t: number) => simpleAmount(DEPOSIT, r, t) / 1000;
  const compound = (t: number) => compoundAmount(DEPOSIT, r, m, t) / 1000;
  const axis = amountAxis(compoundAmount(DEPOSIT, r, m, HORIZON));
  // The frame runs past the last year so the end points never sit on the axis name.
  const frame = { xMin: 0, xMax: HORIZON + 6, yMin: 0, yMax: axis.top };
  const s = simpleAmount(DEPOSIT, r, years);
  const c = compoundAmount(DEPOSIT, r, m, years);

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="years"
        yLabel="amount (thousands)"
        xTicks={[0, 10, 20, 30]}
        yTicks={axis.ticks}
      >
        <Area frame={frame} top={compound} bottom={simple} from={0} to={years} />
        <Curve frame={frame} fn={simple} to={HORIZON} tone="green" />
        <Curve frame={frame} fn={compound} to={HORIZON} />
        <Dot frame={frame} x={years} y={simple(years)} hollow />
        <Dot frame={frame} x={years} y={compound(years)} />
      </Plot>
      <Slider
        label="Interest rate"
        value={rate}
        min={1}
        max={12}
        step={0.5}
        onChange={setRate}
        format={(v) => `${fmt(v)} %`}
      />
      <Slider
        label="Compounded"
        value={freq}
        min={0}
        max={FREQUENCIES.length - 1}
        onChange={setFreq}
        format={(i) => frequencyAt(i).label}
      />
      <Slider label="Years" value={years} min={1} max={HORIZON} onChange={setYears} />
      <Readout
        items={[
          ['Simple interest', fmt(s)],
          ['Compound interest', fmt(c)],
          ['Gap', fmt(c - s)],
        ]}
      />
      <figcaption>
        A deposit of 5000 at {fmt(rate)} % a year for {years} {years === 1 ? 'year' : 'years'},
        compounded {label}. The green line is simple interest: the same interest every year. The
        lilac curve is compound interest: interest is earned on interest, so it bends upwards. The
        shaded gap is the interest earned on interest.
      </figcaption>
    </figure>
  );
}
