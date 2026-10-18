import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Segment, Slider } from './kit';

// Tax-free up to 10,000, 20 % up to 40,000, 40 % above (topic F03, example 3). Graph in thousands.
export const ALLOWANCE = 10000;
export const BAND_TOP = 40000;
export const BASIC_RATE = 0.2;
export const HIGHER_RATE = 0.4;
const FRAME = { xMin: 0, xMax: 80, yMin: 0, yMax: 30 };

/** The piecewise tax function T(Y). */
export function incomeTax(income: number): number {
  if (income <= ALLOWANCE) return 0;
  if (income <= BAND_TOP) return BASIC_RATE * (income - ALLOWANCE);
  return BASIC_RATE * (BAND_TOP - ALLOWANCE) + HIGHER_RATE * (income - BAND_TOP);
}

/** Total tax over total income (0 for no income). */
export const averageRate = (income: number) => (income > 0 ? incomeTax(income) / income : 0);

/** The rate on the next unit of income: the rate of the band the income is in. */
export function bandRate(income: number): number {
  if (income < ALLOWANCE) return 0;
  if (income < BAND_TOP) return BASIC_RATE;
  return HIGHER_RATE;
}

const percent = (r: number) => `${fmt(r * 100)} %`;

/** F03: slide income along a piecewise tax function; compare the band rate with the average rate. */
export function TaxBandExplorer() {
  const [income, setIncome] = useState(52000);
  const tax = incomeTax(income);
  const x = income / 1000;
  const y = tax / 1000;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="Y (000s)"
        yLabel="tax T (000s)"
        xTicks={[0, 10, 20, 40, 60, 80]}
        yTicks={[0, 10, 20, 30]}
      >
        <Segment frame={FRAME} from={[10, 0]} to={[10, 24]} tone="green" dashed />
        <Segment frame={FRAME} from={[40, 0]} to={[40, 24]} tone="green" dashed />
        <Note frame={FRAME} x={5} y={27} anchor="middle">
          0 %
        </Note>
        <Note frame={FRAME} x={25} y={27} anchor="middle">
          20 %
        </Note>
        <Note frame={FRAME} x={60} y={27} anchor="middle">
          40 %
        </Note>
        <Curve frame={FRAME} fn={(v) => incomeTax(v * 1000) / 1000} />
        {income > 0 && <Segment frame={FRAME} from={[0, 0]} to={[x, y]} dashed />}
        <Guides frame={FRAME} x={x} y={y} />
        <Dot frame={FRAME} x={x} y={y} />
      </Plot>
      <Slider
        label="Income Y"
        value={income}
        min={0}
        max={80000}
        step={1000}
        onChange={setIncome}
      />
      <Readout
        items={[
          ['Tax T(Y)', fmt(tax)],
          ['Average rate', percent(averageRate(income))],
          ['Rate on the next unit', percent(bandRate(income))],
        ]}
      />
      <figcaption>
        Each band has its own rule; the dashed green lines mark the band edges, and the graph has no
        jumps there. The slope of the dashed gold line from the origin is the average rate, which
        stays below the rate of the top band.
      </figcaption>
    </figure>
  );
}
