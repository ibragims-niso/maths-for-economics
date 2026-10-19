import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// The household basket of topic ST106, Example 2: 90 loaves of bread at 1.00 manat and 40 litres
// of fuel at 1.50 manat a month. Bread rises by 10 %; the student sets the fuel price rise and how
// much less fuel the household buys.
const BREAD = { p0: 1, q0: 90, rise: 10 };
const FUEL = { p0: 1.5, q0: 40 };
const FRAME = { xMin: 0, xMax: 3.6, yMin: 88, yMax: 162 };
const HALF_WIDTH = 0.36;

export interface TwoGoodBasket {
  /** Prices and quantities of bread and fuel in the base and the current period. */
  p0: [number, number];
  p1: [number, number];
  q0: [number, number];
  q1: [number, number];
}

/** The basket after fuel's price rises by `fuelRise` % and fuel bought falls by `fuelCut` %. */
export function basketAfter(fuelRise: number, fuelCut: number): TwoGoodBasket {
  return {
    p0: [BREAD.p0, FUEL.p0],
    p1: [BREAD.p0 * (1 + BREAD.rise / 100), FUEL.p0 * (1 + fuelRise / 100)],
    q0: [BREAD.q0, FUEL.q0],
    q1: [BREAD.q0, FUEL.q0 * (1 - fuelCut / 100)],
  };
}

const dot = (a: [number, number], b: [number, number]) => a[0] * b[0] + a[1] * b[1];

/** Laspeyres: the base-period basket at current prices over its base cost, × 100. */
export const laspeyresIndex = (b: TwoGoodBasket) => (dot(b.p1, b.q0) / dot(b.p0, b.q0)) * 100;

/** Paasche: the current basket at current prices over the same basket at base prices, × 100. */
export const paascheIndex = (b: TwoGoodBasket) => (dot(b.p1, b.q1) / dot(b.p0, b.q1)) * 100;

/** Fisher's ideal index: the geometric mean of Laspeyres and Paasche. */
export const fisherIndex = (b: TwoGoodBasket) => Math.sqrt(laspeyresIndex(b) * paascheIndex(b));

/** What the gap between the indices says, for the caption. */
export function describeBias(fuelRise: number, fuelCut: number): string {
  if (fuelCut === 0)
    return 'The household buys the same basket in both periods, so all three indices agree.';
  if (fuelRise === BREAD.rise)
    return 'Both prices rose by 10 %, so every index is 110 whatever the household buys.';
  return `Fuel became dearer relative to bread, and the household buys ${fmt(fuelCut)} % less of it. Laspeyres still prices the old 40 litres, so it overstates the rise in the cost of living; Paasche prices only the new, smaller amount, so it understates it. Fisher lies between the two.`;
}

const BARS = [
  { x: 0.7, name: 'Laspeyres', tone: 'lilac' },
  { x: 1.8, name: 'Paasche', tone: 'green' },
  { x: 2.9, name: 'Fisher', tone: 'gold' },
] as const;

/** ST106: raise the fuel price, cut fuel bought, and compare the Laspeyres, Paasche and Fisher indices. */
export function IndexNumberBasket() {
  const [fuelRise, setFuelRise] = useState(40);
  const [fuelCut, setFuelCut] = useState(25);
  const b = basketAfter(fuelRise, fuelCut);
  const values = [laspeyresIndex(b), paascheIndex(b), fisherIndex(b)];

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="" yLabel="price index" yTicks={[100, 120, 140]}>
        <Segment frame={FRAME} from={[0, 100]} to={[3.6, 100]} tone="green" dashed />
        {BARS.map((bar, k) => {
          const v = values[k] ?? 100;
          return [
            <Area
              key={`bar${bar.name}`}
              frame={FRAME}
              tone={bar.tone}
              points={[
                [bar.x - HALF_WIDTH, 100],
                [bar.x + HALF_WIDTH, 100],
                [bar.x + HALF_WIDTH, v],
                [bar.x - HALF_WIDTH, v],
              ]}
            />,
            <Segment
              key={`top${bar.name}`}
              frame={FRAME}
              from={[bar.x - HALF_WIDTH, v]}
              to={[bar.x + HALF_WIDTH, v]}
              tone={bar.tone}
            />,
            <Note key={`v${bar.name}`} frame={FRAME} x={bar.x} y={v + 2} anchor="middle">
              {fmt(v)}
            </Note>,
            <Note key={`n${bar.name}`} frame={FRAME} x={bar.x} y={93} anchor="middle">
              {bar.name}
            </Note>,
          ];
        })}
      </Plot>
      <Slider
        label="Fuel price rise"
        value={fuelRise}
        min={10}
        max={100}
        step={5}
        onChange={setFuelRise}
        format={(v) => `${fmt(v)} %`}
      />
      <Slider
        label="Cut in fuel bought"
        value={fuelCut}
        min={0}
        max={50}
        step={5}
        onChange={setFuelCut}
        format={(v) => `${fmt(v)} %`}
      />
      <Readout
        items={[
          ['Laspeyres', fmt(values[0] ?? 100)],
          ['Paasche', fmt(values[1] ?? 100)],
          ['Fisher', fmt(values[2] ?? 100)],
        ]}
      />
      <figcaption>
        A month’s basket of 90 loaves of bread (1.00 manat, now 10 % dearer) and 40 litres of fuel
        (1.50 manat). Bars start at the base of 100 (dashed line). {describeBias(fuelRise, fuelCut)}
      </figcaption>
    </figure>
  );
}
