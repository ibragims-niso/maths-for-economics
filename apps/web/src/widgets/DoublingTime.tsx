import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// A price index that starts at 100 and grows at g per year (topic F07, Example 1: g = 6 %).
const START = 100;
const FRAME = { xMin: 0, xMax: 50, yMin: 0, yMax: 400 };

/** The value after t years of growth at rate g: y₀(1 + g)ᵗ. */
export const grow = (start: number, g: number, t: number) => start * (1 + g) ** t;

/** The exact doubling time ln 2 ÷ ln(1 + g), for a rate g as a decimal (0.06 for 6 %). */
export const doublingTime = (g: number) => Math.log(2) / Math.log(1 + g);

/** The rule-of-70 estimate: 70 ÷ (growth rate in %). */
export const ruleOf70 = (g: number) => 70 / (100 * g);

/** F07: change the growth rate; compare the exact doubling time with the rule of 70. */
export function DoublingTime() {
  const [percent, setPercent] = useState(6);
  const g = percent / 100;
  const exact = doublingTime(g);
  const rule = ruleOf70(g);
  const gap = (rule - exact) / exact;
  // Stop both lines at 380 so they do not run into the axis name.
  const curveEnd = Math.min(50, Math.log(3.8) / Math.log(1 + g));
  const linearEnd = Math.min(50, 2.8 / g);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="years t"
        yLabel="price index"
        xTicks={[0, 10, 20, 30, 40, 50]}
        yTicks={[100, 200, 300, 400]}
      >
        <Segment frame={FRAME} from={[0, 2 * START]} to={[50, 2 * START]} tone="green" dashed />
        <Segment
          frame={FRAME}
          from={[0, START]}
          to={[linearEnd, START * (1 + linearEnd * g)]}
          tone="gold"
          dashed
        />
        <Curve frame={FRAME} fn={(t) => grow(START, g, t)} to={curveEnd} />
        <Guides frame={FRAME} x={exact} y={2 * START} />
        <Dot frame={FRAME} x={exact} y={2 * START} />
        <Dot frame={FRAME} x={rule} y={2 * START} hollow />
      </Plot>
      <Slider
        label="Growth rate g"
        value={percent}
        min={2}
        max={25}
        step={0.5}
        onChange={setPercent}
        format={(value) => `${fmt(value, 1)} %`}
      />
      <Readout
        items={[
          ['Exact doubling time', `${fmt(exact)} years`],
          ['Rule of 70', `${fmt(rule)} years`],
          ['Rule is off by', `${fmt(Math.abs(gap) * 100)} %`],
        ]}
      />
      <figcaption>
        The index starts at 100 and is multiplied by {fmt(1 + g, 3)} every year. The solid dot is
        where it reaches 200 (green line); the hollow dot is the rule-of-70 estimate. The gold line
        adds the first year's rise, {fmt(START * g)}, every year and needs {fmt(1 / g)} years to
        double.{' '}
        {Math.abs(gap) < 0.005
          ? 'At a rate this low the rule is almost exact.'
          : 'The rule is a little too short, and the gap grows as g rises.'}
      </figcaption>
    </figure>
  );
}
