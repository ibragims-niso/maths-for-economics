import { useState } from 'react';
import { Area, Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Optimal use of a fixed stock with u = ln c and discount rate ρ (topic DO02, Example 3).
const FRAME = { xMin: 0, xMax: 60, yMin: 0, yMax: 16 };
/** The date of the read-out "stock left". */
export const CHECK_YEAR = 10;

/** Optimal extraction c(t) = ρS₀e^(−ρt), with ρ as a decimal. */
export function extraction(rho: number, stock0: number, t: number): number {
  return rho * stock0 * Math.exp(-rho * t);
}

/** Stock still in the ground, S(t) = S₀e^(−ρt): everything the path will extract after t. */
export function stockLeft(rho: number, stock0: number, t: number): number {
  return stock0 * Math.exp(-rho * t);
}

/** Shadow price of the stock at t = 0: λ(0) = u′(c(0)) = 1/c(0) = 1/(ρS₀). */
export function shadowPrice0(rho: number, stock0: number): number {
  return 1 / extraction(rho, stock0, 0);
}

/** DO02: change the discount rate and the stock; impatience tilts extraction towards the present. */
export function ResourceExtractionPath() {
  const [rhoPct, setRhoPct] = useState(5);
  const [stock0, setStock0] = useState(100);
  const rho = rhoPct / 100;
  const c = (t: number) => extraction(rho, stock0, t);
  const left = stockLeft(rho, stock0, CHECK_YEAR);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="years t"
        yLabel="extraction a year, c(t)"
        xTicks={[0, 10, 20, 40, 60]}
        yTicks={[5, 10, 15]}
      >
        <Area frame={FRAME} top={c} from={0} to={CHECK_YEAR} tone="green" />
        <Area frame={FRAME} top={c} from={CHECK_YEAR} to={FRAME.xMax} />
        <Curve frame={FRAME} fn={c} />
        <Guides frame={FRAME} x={CHECK_YEAR} y={c(CHECK_YEAR)} />
        <Dot frame={FRAME} x={CHECK_YEAR} y={c(CHECK_YEAR)} />
        <Note frame={FRAME} x={CHECK_YEAR + 2} y={Math.min(c(CHECK_YEAR) + 1.2, 15)}>
          c({CHECK_YEAR}) = {fmt(c(CHECK_YEAR))}
        </Note>
      </Plot>
      <Slider
        label="Discount rate ρ"
        value={rhoPct}
        min={1}
        max={10}
        step={0.5}
        onChange={setRhoPct}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider
        label="Initial stock S₀"
        value={stock0}
        min={20}
        max={150}
        step={10}
        onChange={setStock0}
      />
      <Readout
        items={[
          ['Extraction c(0)', fmt(c(0))],
          [`Stock left S(${CHECK_YEAR})`, fmt(left)],
          ['Shadow price λ(0)', fmt(shadowPrice0(rho, stock0), 3)],
        ]}
      />
      <figcaption>
        The curve is the optimal extraction path c(t) = ρS₀e^(−ρt) = {fmt(c(0))}e^(−
        {fmt(rho, 3)}t). The green area is what is used in the first {CHECK_YEAR} years,{' '}
        {fmt(stock0 - left)}; the gold area, running on for ever, is the stock still in the ground,{' '}
        {fmt(left)}. Together they make S₀ = {stock0}: nothing is left unused. A more impatient
        owner (higher ρ) starts higher and falls faster, tilting use towards the present, and each
        year uses the share ρ of what is left. The shadow price λ(0) = 1/c(0) is the utility value
        of one more unit of stock.
      </figcaption>
    </figure>
  );
}
