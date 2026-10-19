import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Slider } from './kit';

// Topic MV05, Example 2: demand Q = 92 − 0.5p² + 4I, supply Q = 12 + e·p; at I = 10, e = 4 the
// market clears at p* = 12, q* = 60, and dp*/dI = 0.25.
const FRAME = { xMin: 0, xMax: 160, yMin: 0, yMax: 24 };
const BASE_INCOME = 10;

/** Quantity demanded at price p and income I (in thousands). */
export const demandQ = (p: number, income: number) => 92 - 0.5 * p * p + 4 * income;

/** The demand curve solved for the price, to draw it with quantity on the horizontal axis. */
export const demandPrice = (q: number, income: number) => Math.sqrt(2 * (92 + 4 * income - q));

/** Quantity supplied at price p when supply rises by e units per unit of price. */
export const supplyQ = (p: number, e: number) => 12 + e * p;

/** Where the drawn demand curve stops (at p = 3), so it keeps clear of the axis label. */
const demandEnd = (income: number) => 92 + 4 * income - 4.5;

/** The equilibrium price: the positive root of 0.5p² + e·p − (80 + 4I) = 0. */
export const equilibriumPrice = (income: number, e: number) =>
  -e + Math.sqrt(e * e + 2 * (80 + 4 * income));

/**
 * Implicit function theorem on F(p, I) = demand − supply: F_I = 4 and F_p = −p − e, so
 * dp* / dI = −F_I / F_p = 4 / (p* + e).
 */
export const iftSlope = (income: number, e: number) => 4 / (equilibriumPrice(income, e) + e);

/** The change in p* found by solving the market again with one more unit of income. */
export const resolvedChange = (income: number, e: number) =>
  equilibriumPrice(income + 1, e) - equilibriumPrice(income, e);

/** MV05: shift demand with income and compare the theorem's dp* / dI with re-solving the market. */
export function IncomeShiftEquilibrium() {
  const [income, setIncome] = useState(BASE_INCOME);
  const [e, setE] = useState(4);
  const p = equilibriumPrice(income, e);
  const q = supplyQ(p, e);
  const slope = iftSlope(income, e);
  const change = resolvedChange(income, e);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="quantity Q"
        yLabel="price p"
        xTicks={[0, 40, 80, 120, 160]}
        yTicks={[8, 16, 24]}
      >
        {income !== BASE_INCOME && (
          <Curve
            frame={FRAME}
            fn={(v) => demandPrice(v, BASE_INCOME)}
            to={demandEnd(BASE_INCOME)}
            dashed
          />
        )}
        <Curve frame={FRAME} fn={(v) => demandPrice(v, income)} to={demandEnd(income)} />
        <Curve frame={FRAME} fn={(v) => (v - 12) / e} from={12} tone="green" />
        <Guides frame={FRAME} x={q} y={p} />
        <Dot frame={FRAME} x={q} y={p} />
      </Plot>
      <Slider label="Income I" value={income} min={0} max={30} onChange={setIncome} />
      <Slider label="Supply response e" value={e} min={1} max={10} step={0.5} onChange={setE} />
      <Readout
        items={[
          ['Equilibrium (q*, p*)', `(${fmt(q, 1)}, ${fmt(p)})`],
          ['dp*/dI by the theorem', fmt(slope, 3)],
          ['Re-solved change in p*', fmt(change, 3)],
        ]}
      />
      <figcaption>
        The market clears where the lilac demand curve meets the green supply line
        {income !== BASE_INCOME ? '; the dashed curve is demand at the starting income I = 10' : ''}
        . The equation demand − supply = 0 ties the price to income, and the implicit function
        theorem gives its slope without solving: dp*/dI = −F_I/F_p = 4/(p* + e) = {fmt(slope, 3)}.
        Solving the market again with one more unit of income moves the price by {fmt(change, 3)},
        almost the same, because the theorem gives the slope at this point and the change over a
        whole unit is only slightly smaller.
      </figcaption>
    </figure>
  );
}
