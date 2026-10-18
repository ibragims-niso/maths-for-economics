import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// A pension of 9000 a year (topic FM04, Example 1). Values are plotted in thousands.
const PAYMENT = 9000;
const FRAME = { xMin: 0, xMax: 60, yMin: 0, yMax: 600 };

/** Present value of n payments of C at the end of each period: C(1 − (1 + r)^(−n))/r. */
export function annuityValue(payment: number, rate: number, years: number): number {
  return (payment * (1 - (1 + rate) ** -years)) / rate;
}

/** Present value of C every period for ever: C/r. */
export function perpetuityValue(payment: number, rate: number): number {
  return payment / rate;
}

/** The share of the perpetuity's value that the first n payments make up: 1 − (1 + r)^(−n). */
export function shareOfPerpetuity(rate: number, years: number): number {
  return 1 - (1 + rate) ** -years;
}

/** FM04: change the interest rate and the number of payments; see the annuity approach C/r. */
export function AnnuityExplorer() {
  const [ratePct, setRatePct] = useState(4);
  const [years, setYears] = useState(20);
  const r = ratePct / 100;
  const pv = annuityValue(PAYMENT, r, years);
  const perpetuity = perpetuityValue(PAYMENT, r);
  const share = shareOfPerpetuity(r, years);
  const k = (v: number) => v / 1000;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="years n"
        yLabel="value (thousands)"
        xTicks={[0, 20, 40, 60]}
        yTicks={[100, 300, 500]}
      >
        <Curve frame={FRAME} fn={(n) => k(PAYMENT * n)} tone="green" dashed />
        <Segment frame={FRAME} from={[0, k(perpetuity)]} to={[FRAME.xMax, k(perpetuity)]} dashed />
        <Note frame={FRAME} x={2} y={k(perpetuity) + 14}>
          C/r
        </Note>
        <Curve frame={FRAME} fn={(n) => k(annuityValue(PAYMENT, r, n))} />
        <Guides frame={FRAME} x={years} y={k(pv)} />
        <Dot frame={FRAME} x={years} y={k(pv)} />
      </Plot>
      <Slider
        label="Interest rate r"
        value={ratePct}
        min={2}
        max={12}
        step={0.5}
        onChange={setRatePct}
        format={(v) => `${fmt(v)} %`}
      />
      <Slider
        label="Number of yearly payments n"
        value={years}
        min={1}
        max={60}
        onChange={setYears}
      />
      <Readout
        items={[
          ['Annuity value today', fmt(pv)],
          ['Perpetuity C/r', fmt(perpetuity)],
          ['Undiscounted n × C', fmt(PAYMENT * years)],
        ]}
      />
      <figcaption>
        The solid curve is the value today of {fmt(PAYMENT)} a year for n years; the green dashed
        line adds the payments up without discounting. With {years}{' '}
        {years === 1 ? 'payment' : 'payments'} the annuity is worth {fmt(share * 100, 1)} % of the
        perpetuity C/r (gold dashed line), which it approaches but never reaches.
      </figcaption>
    </figure>
  );
}
