import { useState } from 'react';
import { Area, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// An investment's return next year (topic ST103, Examples 1 and 2): −10 % in a bad year,
// 5 % in a normal year and a good-year return the student chooses.
const BAD = -10;
const NORMAL = 5;
const FRAME = { xMin: -20, xMax: 55, yMin: 0, yMax: 1.25 };
const HALF_WIDTH = 2.5;
const SD_LINE = 1.17;

/** Puts the "±1 SD" label beside the gold line, on whichever side has room. */
function sdLabel(mean: number, sd: number) {
  const right = mean + sd < 42;
  return {
    frame: FRAME,
    x: right ? mean + sd + 1 : mean - sd - 1,
    y: SD_LINE - 0.02,
    anchor: right ? ('start' as const) : ('end' as const),
  };
}

/** The good-year probability: whatever the other two leave, in hundredths to avoid float noise. */
export const goodChance = (bad: number, normal: number) =>
  Math.max(0, Math.round((1 - bad - normal) * 100) / 100);

/** Keeps the normal-year probability small enough that the three still add up to 1. */
export const fitNormal = (bad: number, normal: number) =>
  Math.min(normal, Math.round((1 - bad) * 100) / 100);

/** E[X] = Σ x·p(x). */
export const expectation = (xs: number[], ps: number[]) =>
  xs.reduce((s, x, k) => s + x * (ps[k] ?? 0), 0);

/** Var(X) = E[X²] − (E[X])², never below 0 (rounding can leave −1e−15). */
export const variance = (xs: number[], ps: number[]) =>
  Math.max(
    0,
    expectation(
      xs.map((x) => x * x),
      ps,
    ) -
      expectation(xs, ps) ** 2,
  );

/** One sentence on what the spread means for the investor. */
export function describeRisk(mean: number, sd: number): string {
  if (sd < 1e-9)
    return 'Only one outcome can happen, so the standard deviation is 0: a sure return with no risk.';
  return `A typical year lands about ${fmt(sd)} percentage points away from the expected ${fmt(mean)} %. The mean says how well the investment does on average; the standard deviation says how risky it is.`;
}

/** ST103: set the chances of a bad and a normal year and the good-year return; watch E[X] and the SD. */
export function InvestmentRiskBars() {
  const [bad, setBad] = useState(0.2);
  const [normalRaw, setNormal] = useState(0.5);
  const [good, setGood] = useState(20);
  const normal = fitNormal(bad, normalRaw);
  const xs = [BAD, NORMAL, good];
  const ps = [bad, normal, goodChance(bad, normal)];
  const mean = expectation(xs, ps);
  const sd = Math.sqrt(variance(xs, ps));

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="return %"
        yLabel="probability"
        xTicks={[-10, 0, 10, 20, 30, 40, 50]}
        yTicks={[0.5, 1]}
      >
        {xs.map((x, k) => {
          const p = ps[k] ?? 0;
          return [
            <Area
              key={`bar${x}`}
              frame={FRAME}
              tone="lilac"
              points={[
                [x - HALF_WIDTH, 0],
                [x + HALF_WIDTH, 0],
                [x + HALF_WIDTH, p],
                [x - HALF_WIDTH, p],
              ]}
            />,
            <Segment
              key={`top${x}`}
              frame={FRAME}
              from={[x - HALF_WIDTH, p]}
              to={[x + HALF_WIDTH, p]}
              tone="lilac"
            />,
            <Note key={`p${x}`} frame={FRAME} x={x} y={p + 0.03} anchor="middle">
              {fmt(p)}
            </Note>,
          ];
        })}
        <Segment frame={FRAME} from={[mean - sd, SD_LINE]} to={[mean + sd, SD_LINE]} />
        <Dot frame={FRAME} x={mean} y={SD_LINE} hollow />
        {sd > 1e-9 && <Note {...sdLabel(mean, sd)}>±1 SD</Note>}
        <Dot frame={FRAME} x={mean} y={0} />
      </Plot>
      <Slider
        label="Chance of a bad year (−10 %)"
        value={bad}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => {
          setBad(v);
          setNormal((n) => fitNormal(v, n));
        }}
      />
      <Slider
        label="Chance of a normal year (5 %)"
        value={normal}
        min={0}
        max={Math.round((1 - bad) * 100) / 100}
        step={0.05}
        onChange={setNormal}
      />
      <Slider
        label="Return in a good year"
        value={good}
        min={10}
        max={35}
        onChange={setGood}
        format={(v) => `${fmt(v)} %`}
      />
      <Readout
        items={[
          ['Expected return E[X]', `${fmt(mean)} %`],
          ['Variance Var(X)', fmt(variance(xs, ps))],
          ['Standard deviation', `${fmt(sd)} %`],
        ]}
      />
      <figcaption>
        Bar heights are the probabilities; the good year gets whatever is left ({fmt(ps[2] ?? 0)}),
        so they always add up to 1. The dot on the axis is the expected return, the point where the
        bars would balance; the gold line above it reaches one standard deviation either side.{' '}
        {describeRisk(mean, sd)}
      </figcaption>
    </figure>
  );
}
