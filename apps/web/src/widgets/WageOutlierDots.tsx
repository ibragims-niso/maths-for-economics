import { useState } from 'react';
import { Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// The monthly wages of a small firm (topic ST101, Example 1): eight staff wages, sorted, plus the
// manager's pay, which the student moves.
export const STAFF_WAGES = [820, 860, 900, 940, 980, 1000, 1050, 1100];
const FRAME = { xMin: 500, xMax: 6200, yMin: 0, yMax: 12 };
const SD_ROW = 10.4;
// A small key in the empty lower-right corner of the graph.
const KEY_X = 4200;
const KEY_LEN = 400;

export const meanOf = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

/** The middle value in order of size, or the average of the two middle values. */
export function medianOf(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  const hi = s[Math.floor(n / 2)] ?? 0;
  return n % 2 === 1 ? hi : ((s[n / 2 - 1] ?? 0) + hi) / 2;
}

/** Sample standard deviation s, dividing the squared deviations by n − 1. */
export function sampleSd(xs: number[]): number {
  const m = meanOf(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

/** All nine wages with the manager's pay last. */
export const wagesWith = (pay: number) => [...STAFF_WAGES, pay];

/** What the student should notice at this manager's pay. */
export function describeOutlier(pay: number): string {
  const xs = wagesWith(pay);
  const mean = meanOf(xs);
  const below = xs.filter((x) => x < mean).length;
  if (mean - medianOf(xs) < 50)
    return `With the manager paid close to everyone else, the mean (${fmt(mean)}) and the median (${fmt(medianOf(xs))}) almost agree and s is only ${fmt(sampleSd(xs))}. Drag the manager's pay to the right and compare how far each one moves.`;
  return `The median stays at ${fmt(medianOf(xs))}: it is the 5th of the 9 wages in order, and raising the top wage does not change which wage is in the middle. The mean, ${fmt(mean)}, is pulled up by the one large wage, and ${below} of the 9 employees earn less than it. The standard deviation, ${fmt(sampleSd(xs))}, reacts most, because the manager's distance from the mean is squared.`;
}

/** ST101: move the manager's pay and compare how the mean, the median and s react to one outlier. */
export function WageOutlierDots() {
  const [pay, setPay] = useState(3600);
  const xs = wagesWith(pay);
  const mean = meanOf(xs);
  const median = medianOf(xs);
  const sd = sampleSd(xs);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="monthly wage"
        yLabel="employees"
        xTicks={[1000, 2000, 3000, 4000, 5000, 6000]}
      >
        <Segment frame={FRAME} from={[median, 0]} to={[median, 9.6]} tone="green" />
        <Segment frame={FRAME} from={[mean, 0]} to={[mean, 9.6]} dashed />
        <Segment frame={FRAME} from={[mean, SD_ROW]} to={[mean + sd, SD_ROW]} tone="lilac" />
        <Note frame={FRAME} x={mean + sd + 80} y={SD_ROW - 0.3}>
          s
        </Note>
        <Segment frame={FRAME} from={[KEY_X, 5]} to={[KEY_X + KEY_LEN, 5]} tone="green" />
        <Note frame={FRAME} x={KEY_X + KEY_LEN + 100} y={4.7}>
          median
        </Note>
        <Segment frame={FRAME} from={[KEY_X, 3]} to={[KEY_X + KEY_LEN, 3]} dashed />
        <Note frame={FRAME} x={KEY_X + KEY_LEN + 100} y={2.7}>
          mean
        </Note>
        {xs.map((x, k) => (
          <Dot key={x} frame={FRAME} x={x} y={k + 1} hollow={k === xs.length - 1} />
        ))}
      </Plot>
      <Slider
        label="Manager's monthly pay"
        value={pay}
        min={1200}
        max={6000}
        step={100}
        onChange={setPay}
      />
      <Readout
        items={[
          ['Mean', fmt(mean)],
          ['Median', fmt(median)],
          ['Standard deviation s', fmt(sd)],
        ]}
      />
      <figcaption>
        Each dot is one employee; the hollow dot at the top is the manager. The green line marks the
        median and the dashed gold line the mean; the lilac bar starts at the mean and is one
        standard deviation, s, long. {describeOutlier(pay)}
      </figcaption>
    </figure>
  );
}
