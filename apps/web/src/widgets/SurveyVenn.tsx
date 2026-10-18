import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

/** Households in the survey (worked example 1 of F09). */
export const SURVEY_SIZE = 500;

const FRAME = { xMin: 0, xMax: SURVEY_SIZE, yMin: 0, yMax: 4.6 };

/** The overlap |A ∩ B| can be at most the smaller group and must keep |A ∪ B| within the survey. */
export function overlapRange(total: number, a: number, b: number): [number, number] {
  return [Math.max(0, a + b - total), Math.min(a, b)];
}

/** The regions of a two-set Venn diagram, by inclusion–exclusion. */
export function vennCounts(total: number, a: number, b: number, both: number) {
  const union = a + b - both;
  return {
    onlyA: a - both,
    onlyB: b - both,
    union,
    neither: total - union,
    exactlyOne: a + b - 2 * both,
  };
}

/** The caption: why the overlap is subtracted, with the current numbers. */
export function describeCount(total: number, a: number, b: number, both: number): string {
  const { union, neither } = vennCounts(total, a, b, both);
  const bars = `Each bar is one group of the ${fmt(total)} households; the gold block is the overlap.`;
  const count =
    both === 0
      ? ` The groups do not overlap, so |S ∪ C| = ${fmt(a)} + ${fmt(b)} = ${fmt(union)} (solid gold line).`
      : ` Adding ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)} counts the ${fmt(both)} households with both twice, so |S ∪ C| = ${fmt(a)} + ${fmt(b)} − ${fmt(both)} = ${fmt(union)} (solid gold line).`;
  const rest =
    neither === 0
      ? ' Every household has at least one of the two.'
      : ` The dashed line is the ${fmt(neither)} households with neither.`;
  return bars + count + rest;
}

/** F09: set the two groups and their overlap and watch inclusion–exclusion count the households. */
export function SurveyVenn() {
  const [a, setA] = useState(320);
  const [b, setB] = useState(210);
  const [bothRaw, setBoth] = useState(150);
  const [lo, hi] = overlapRange(SURVEY_SIZE, a, b);
  const both = Math.min(Math.max(bothRaw, lo), hi);
  const c = vennCounts(SURVEY_SIZE, a, b, both);
  // Savings holders take households 0 … |S|; card holders start where the overlap starts.
  const bStart = c.onlyA;
  const band = (from: number, to: number, y0: number, y1: number): [number, number][] => [
    [from, y0],
    [to, y0],
    [to, y1],
    [from, y1],
  ];

  return (
    <figure className="widget">
      <Plot frame={FRAME} xLabel="households" yLabel="" xTicks={[0, 100, 200, 300, 400, 500]}>
        <Area frame={FRAME} points={band(0, bStart, 3, 3.9)} tone="lilac" />
        <Area frame={FRAME} points={band(a, bStart + b, 1.7, 2.6)} tone="green" />
        {both > 0 && <Area frame={FRAME} points={band(bStart, a, 1.7, 3.9)} tone="gold" />}
        <Note frame={FRAME} x={4} y={4.15}>
          savings S: {fmt(a)}
        </Note>
        <Note
          frame={FRAME}
          x={bStart > SURVEY_SIZE / 2 ? bStart + b : bStart}
          y={1.3}
          anchor={bStart > SURVEY_SIZE / 2 ? 'end' : 'start'}
        >
          card C: {fmt(b)}
        </Note>
        <Segment frame={FRAME} from={[0, 0.8]} to={[c.union, 0.8]} tone="gold" />
        <Segment frame={FRAME} from={[c.union, 0.8]} to={[SURVEY_SIZE, 0.8]} tone="lilac" dashed />
      </Plot>
      <Slider
        label="Savings account |S|"
        value={a}
        min={0}
        max={SURVEY_SIZE}
        step={10}
        onChange={setA}
      />
      <Slider
        label="Credit card |C|"
        value={b}
        min={0}
        max={SURVEY_SIZE}
        step={10}
        onChange={setB}
      />
      <Slider label="Both |S ∩ C|" value={both} min={lo} max={hi} step={10} onChange={setBoth} />
      <Readout
        items={[
          ['At least one', fmt(c.union)],
          ['Neither', fmt(c.neither)],
          ['Exactly one', fmt(c.exactlyOne)],
        ]}
      />
      <figcaption>{describeCount(SURVEY_SIZE, a, b, both)}</figcaption>
    </figure>
  );
}
