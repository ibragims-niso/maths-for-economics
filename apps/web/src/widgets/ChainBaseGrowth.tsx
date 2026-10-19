import { useState } from 'react';
import { Area, Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Six yearly growth rates, the base index they build (2018 = 100) and two ways to average them
// (topic ST107). The rates for 2020 and 2021 come from the sliders; the others are fixed.

export const BASE_YEAR = 2018;
/** Default yearly growth rates in per cent for 2019–2024 (worked example 2 in ST107). */
export const DEFAULT_RATES = [4, -6, 8, 3, 2, 3.5] as const;

/** Base indices (base year = 100) for the base year and each year after it. */
export function baseIndices(rates: readonly number[]): number[] {
  const out = [100];
  for (const r of rates) out.push((out.at(-1) ?? 100) * (1 + r / 100));
  return out;
}

/** Average growth rate in per cent: the geometric mean of the growth factors, minus 1. */
export function geometricMeanRate(rates: readonly number[]): number {
  const total = rates.reduce((s, r) => s * (1 + r / 100), 1);
  return 100 * (total ** (1 / rates.length) - 1);
}

/** The arithmetic mean of the rates in per cent (the wrong average for growth). */
export function arithmeticMeanRate(rates: readonly number[]): number {
  return rates.reduce((s, r) => s + r, 0) / rates.length;
}

/** The vertical window: a multiple of 5 below and above everything drawn. */
export function indexWindow(values: readonly number[]): { lo: number; hi: number } {
  const lo = Math.floor((Math.min(...values) - 2) / 5) * 5;
  const hi = Math.ceil((Math.max(...values) + 3) / 5) * 5;
  return { lo, hi };
}

/** Tick values every 5, 10 or 20 points between lo and hi. */
export function indexTicks(lo: number, hi: number): number[] {
  const step = hi - lo > 60 ? 20 : hi - lo > 25 ? 10 : 5;
  const ticks: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(t);
  return ticks;
}

const signed = (r: number) => (r > 0 ? `+${fmt(r, 1)}` : fmt(r, 1));

/** ST107: change two years' growth; see the base index and the right and wrong average growth. */
export function ChainBaseGrowth() {
  const [r2020, setR2020] = useState<number>(DEFAULT_RATES[1]);
  const [r2021, setR2021] = useState<number>(DEFAULT_RATES[2]);
  const rates = [DEFAULT_RATES[0], r2020, r2021, ...DEFAULT_RATES.slice(3)];
  const n = rates.length;
  const levels = baseIndices(rates);
  const last = levels.at(-1) ?? 100;
  const gm = geometricMeanRate(rates);
  const am = arithmeticMeanRate(rates);
  const amEnd = 100 * (1 + am / 100) ** n;

  const { lo, hi } = indexWindow([...levels, amEnd]);
  // Year t after the base year is drawn at u = t + 1, so the frame never contains u = 0 (where
  // the kit would draw a dashed axis); a strip under the bars holds the year labels.
  const frame = { xMin: 0.4, xMax: n + 1.6, yMin: lo - 0.24 * (hi - lo), yMax: hi };
  const gap = amEnd - last;
  // Year t after the base year: its rate, where its bar is drawn and the base index before and after.
  const years = rates.map((rate, i) => ({
    year: BASE_YEAR + i + 1,
    rate,
    u: i + 2,
    from: levels[i] ?? 100,
    to: levels[i + 1] ?? 100,
  }));

  return (
    <figure className="widget">
      <Plot frame={frame} xLabel="" yLabel="base index (2018 = 100)" yTicks={indexTicks(lo, hi)}>
        {years.map((y) => (
          <Area
            key={`bar${y.year}`}
            frame={frame}
            points={[
              [y.u - 0.36, y.from],
              [y.u - 0.36, y.to],
              [y.u + 0.36, y.to],
              [y.u + 0.36, y.from],
            ]}
            tone={y.rate >= 0 ? 'green' : 'gold'}
          />
        ))}
        <Curve
          frame={frame}
          fn={(u) => 100 * (1 + am / 100) ** (u - 1)}
          from={1}
          to={n + 1}
          tone="gold"
          dashed
        />
        <Curve
          frame={frame}
          fn={(u) => 100 * (1 + gm / 100) ** (u - 1)}
          from={1}
          to={n + 1}
          tone="green"
          dashed
        />
        {years.map((y) => (
          <Segment
            key={`line${y.year}`}
            frame={frame}
            from={[y.u - 1, y.from]}
            to={[y.u, y.to]}
            tone="lilac"
          />
        ))}
        {years.map((y) => (
          <Note
            key={`rate${y.year}`}
            frame={frame}
            x={y.u}
            y={lo - 0.07 * (hi - lo)}
            anchor="middle"
          >
            {signed(y.rate)}
          </Note>
        ))}
        {[0, 2, 4, 6].map((t) => (
          <Note key={`year${t}`} frame={frame} x={t + 1} y={lo - 0.2 * (hi - lo)} anchor="middle">
            {BASE_YEAR + t}
          </Note>
        ))}
        <Dot frame={frame} x={n + 1} y={amEnd} hollow />
        <Dot frame={frame} x={n + 1} y={last} />
      </Plot>
      <Slider
        label="Growth in 2020 (%)"
        value={r2020}
        min={-15}
        max={15}
        step={0.5}
        onChange={setR2020}
        format={signed}
      />
      <Slider
        label="Growth in 2021 (%)"
        value={r2021}
        min={-15}
        max={15}
        step={0.5}
        onChange={setR2021}
        format={signed}
      />
      <Readout
        items={[
          ['Base index 2024', fmt(last, 2)],
          ['Average growth (geometric mean)', `${fmt(gm, 2)} %`],
          ['Arithmetic mean of the rates', `${fmt(am, 2)} %`],
        ]}
      />
      <figcaption>
        Each bar is one year’s growth, drawn as the step it adds to the base index (green for a
        rise, gold for a fall, with the rate in per cent under it); the lilac line is the base index
        itself, the product of the yearly factors. The green dashed curve grows by the geometric
        mean, {fmt(gm, 2)} %, every year and lands exactly on {fmt(last, 2)}. The gold dashed curve
        uses the arithmetic mean, {fmt(am, 2)} %, and ends at {fmt(amEnd, 2)}, which is{' '}
        {fmt(gap, 2)} points too high: growth rates multiply, so the right average multiplies too.
        {r2020 < 0 && r2021 === -r2020
          ? ` A fall of ${fmt(-r2020, 1)} % followed by a rise of ${fmt(r2021, 1)} % does not get back to the start: the two years together multiply the level by ${fmt((1 + r2020 / 100) * (1 + r2021 / 100), 4)}.`
          : ''}
      </figcaption>
    </figure>
  );
}
