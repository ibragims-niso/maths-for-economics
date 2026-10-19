import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic FM06, Example 3. Project A: small and quick. Project B: large and long-lived; its yearly
// cash flow is set by a slider. NPVs are plotted in thousands against the discount rate in per cent.
export const SMALL = { cost: 10000, flows: [12500] };
export const LARGE_COST = 30000;
export const LARGE_YEARS = 4;
const FRAME = { xMin: 0, xMax: 30, yMin: -16, yMax: 18 };

/** The large project's cash flows: `flow` at the end of each of its years. */
export const largeFlows = (flow: number) => Array.from({ length: LARGE_YEARS }, () => flow);

/** NPV = −C₀ + Σ CFₜ/(1 + r)ᵗ, with the rate in per cent and the first cash flow after one year. */
export function npv(cost: number, flows: number[], ratePercent: number): number {
  return flows.reduce((total, cf, i) => total + cf / (1 + ratePercent / 100) ** (i + 1), -cost);
}

/**
 * The rate in per cent between `lo` and `hi` where `fn` changes sign, by bisection, or null when
 * it has the same sign at both ends.
 */
export function signChange(fn: (rate: number) => number, lo = 0, hi = 60): number | null {
  if (fn(lo) * fn(hi) > 0) return null;
  let a = lo;
  let b = hi;
  for (let k = 0; k < 60; k++) {
    const mid = (a + b) / 2;
    if (fn(a) * fn(mid) <= 0) b = mid;
    else a = mid;
  }
  return (a + b) / 2;
}

/** The IRR in per cent: the rate at which the NPV is zero. */
export const irr = (cost: number, flows: number[]) => signChange((r) => npv(cost, flows, r));

/** The rate where the two NPV curves cross (Fisher's crossover rate), if it lies in 0–60 %. */
export const crossover = (largeFlow: number) =>
  signChange((r) => npv(LARGE_COST, largeFlows(largeFlow), r) - npv(SMALL.cost, SMALL.flows, r));

/** What the picture says about the choice at this rate. */
export function describeChoice(ratePercent: number, largeFlow: number): string {
  const a = npv(SMALL.cost, SMALL.flows, ratePercent);
  const b = npv(LARGE_COST, largeFlows(largeFlow), ratePercent);
  const irrA = irr(SMALL.cost, SMALL.flows) ?? 0;
  const irrB = irr(LARGE_COST, largeFlows(largeFlow)) ?? 0;
  if (a <= 0 && b <= 0)
    return 'At this rate both NPVs are negative: neither project earns the discount rate, so the firm should do neither.';
  const best = b > a ? 'B' : 'A';
  const bestIrr = irrB > irrA ? 'B' : 'A';
  if (best === bestIrr)
    return `At this rate project ${best} has both the higher NPV and the higher IRR, so the two rules agree.`;
  return `At this rate the rules conflict: project ${bestIrr} has the higher IRR, but project ${best} has the higher NPV and adds more value, so choose ${best}.`;
}

const pct = (v: number | null) => (v === null ? 'none' : `${fmt(v)} %`);

/** FM06: NPV profiles of a small, quick project and a large, long one; IRRs and the crossover. */
export function NpvProfileTwoProjects() {
  const [rate, setRate] = useState(8);
  const [flow, setFlow] = useState(10000);
  const k = (v: number) => v / 1000;
  const profileA = (r: number) => k(npv(SMALL.cost, SMALL.flows, r));
  const profileB = (r: number) => k(npv(LARGE_COST, largeFlows(flow), r));
  const irrA = irr(SMALL.cost, SMALL.flows);
  const irrB = irr(LARGE_COST, largeFlows(flow));
  const cross = crossover(flow);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="rate %"
        yLabel="NPV (thousands)"
        xTicks={[0, 10, 20, 30]}
        yTicks={[-10, 0, 10]}
      >
        <Segment frame={FRAME} from={[rate, FRAME.yMin]} to={[rate, FRAME.yMax]} dashed />
        <Curve frame={FRAME} fn={profileA} tone="green" />
        <Curve frame={FRAME} fn={profileB} />
        <Note frame={FRAME} x={29.5} y={profileA(29.5) + 1}>
          A
        </Note>
        <Note frame={FRAME} x={22} y={profileB(22) - 2.4}>
          B
        </Note>
        {cross !== null && cross <= FRAME.xMax && (
          <Note frame={FRAME} x={cross + 0.6} y={profileA(cross) + 1.2}>
            crossover
          </Note>
        )}
        {irrA !== null && irrA <= FRAME.xMax && (
          <>
            <Dot frame={FRAME} x={irrA} y={0} hollow />
            <Note frame={FRAME} x={irrA} y={-2.4} anchor="middle">
              IRR A
            </Note>
          </>
        )}
        {irrB !== null && irrB <= FRAME.xMax && (
          <>
            <Dot frame={FRAME} x={irrB} y={0} hollow />
            <Note
              frame={FRAME}
              x={irrB < 6 ? irrB + 0.6 : irrB - 0.4}
              y={irrB < 6 ? -4 : -2.4}
              anchor={irrB < 6 ? 'start' : 'end'}
            >
              IRR B
            </Note>
          </>
        )}
        <Dot frame={FRAME} x={rate} y={profileA(rate)} />
        <Dot frame={FRAME} x={rate} y={profileB(rate)} />
      </Plot>
      <Slider
        label="Discount rate"
        value={rate}
        min={0}
        max={30}
        step={0.5}
        onChange={setRate}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider
        label="B's yearly cash flow"
        value={flow}
        min={8000}
        max={11500}
        step={500}
        onChange={setFlow}
      />
      <Readout
        items={[
          ['NPV of A', fmt(npv(SMALL.cost, SMALL.flows, rate))],
          ['NPV of B', fmt(npv(LARGE_COST, largeFlows(flow), rate))],
          ['IRR of A | B', `${pct(irrA)} | ${pct(irrB)}`],
        ]}
      />
      <figcaption>
        Project A (green) costs 10,000 and returns 12,500 after one year. Project B (lilac) costs
        30,000 and returns {fmt(flow)} a year for 4 years. Each curve is the project's NPV at every
        discount rate; it crosses zero at the project's IRR (hollow dots). B's curve is steeper
        because its money comes later.{' '}
        {cross === null
          ? 'The curves do not cross at any rate from 0 to 60 %.'
          : `The curves cross at ${fmt(cross)} %.`}{' '}
        {describeChoice(rate, flow)}
      </figcaption>
    </figure>
  );
}
