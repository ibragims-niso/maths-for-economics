import { useState } from 'react';
import { Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';
import { niceCeil } from './SpendingRounds';

// The power series 1 + x + x² + … of 1/(1 − x), summed term by term (topic C117).
const MAX_TERMS = 30;

/** The sum of the first n terms, 1 + x + … + xⁿ⁻¹, added one term at a time. */
export function partialSum(x: number, n: number): number {
  let sum = 0;
  let term = 1;
  for (let k = 0; k < n; k++) {
    sum += term;
    term *= x;
  }
  return sum;
}

/** The sum of the whole series, 1/(1 − x), or null when |x| ≥ 1 and the series diverges. */
export function seriesLimit(x: number): number | null {
  return Math.abs(x) < 1 ? 1 / (1 - x) : null;
}

/** The vertical window: every partial sum up to MAX_TERMS terms, and the limit, fit inside. */
export function frameFor(x: number) {
  const values = Array.from({ length: MAX_TERMS }, (_, i) => partialSum(x, i + 1));
  const limit = seriesLimit(x);
  if (limit !== null) values.push(limit);
  const top = niceCeil(Math.max(...values) * 1.15);
  const low = Math.min(...values);
  const bottom = low < 0 ? -niceCeil(-low * 1.15) : 0;
  return { xMin: 0, xMax: MAX_TERMS + 1, yMin: bottom, yMax: top };
}

/** C117: change x and the number of terms; watch the partial sums settle at 1/(1 − x), or not. */
export function GeometricPartialSums() {
  const [x, setX] = useState(0.8);
  const [n, setN] = useState(10);
  const frame = frameFor(x);
  const limit = seriesLimit(x);
  const sum = partialSum(x, n);
  const points = Array.from({ length: n }, (_, i) => [i + 1, partialSum(x, i + 1)] as const);

  let story: string;
  if (limit !== null) {
    story = `The terms xᵏ shrink towards 0, so the partial sums settle at 1/(1 − x) = ${fmt(limit)}: the series converges. Each extra term multiplies the gap by x.`;
  } else if (x >= 1) {
    story =
      'Now the terms xᵏ do not shrink (each is at least 1), so the partial sums grow without limit: the series diverges, and 1/(1 − x) is not its sum.';
  } else {
    story =
      'Now the terms alternate in sign but do not shrink, so the partial sums jump up and down and never settle: the series diverges.';
  }

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="n"
        yLabel="partial sum Sₙ"
        xTicks={[1, 10, 20, 30]}
        yTicks={frame.yMin < 0 ? [frame.yMin, frame.yMax] : [frame.yMax / 2, frame.yMax]}
      >
        {limit !== null && (
          <Segment
            frame={frame}
            from={[0, limit]}
            to={[MAX_TERMS + 1, limit]}
            tone="green"
            dashed
          />
        )}
        {points.slice(1).map(([k, s], i) => (
          <Segment
            key={k}
            frame={frame}
            from={[k - 1, points[i]?.[1] ?? s]}
            to={[k, s]}
            tone="lilac"
          />
        ))}
        {limit !== null && <Segment frame={frame} from={[n, sum]} to={[n, limit]} />}
        <Dot frame={frame} x={n} y={sum} />
        {limit !== null && (
          <Note
            frame={frame}
            x={MAX_TERMS + 0.6}
            y={limit + (frame.yMax - frame.yMin) * 0.04}
            anchor="end"
          >
            1/(1 − x) = {fmt(limit)}
          </Note>
        )}
      </Plot>
      <Slider label="Ratio x" value={x} min={-1.2} max={1.2} step={0.05} onChange={setX} />
      <Slider label="Terms n" value={n} min={1} max={MAX_TERMS} onChange={setN} />
      <Readout
        items={[
          [`Sum of ${n} terms`, fmt(sum)],
          ['Limit 1/(1 − x)', limit === null ? 'none (diverges)' : fmt(limit)],
          ['Gap to the limit', limit === null ? '–' : fmt(limit - sum)],
        ]}
      />
      <figcaption>
        The lilac line joins the partial sums Sₙ = 1 + x + x² + … + xⁿ⁻¹ of the power series of 1/(1
        − x), and the gold dot is the sum of n terms
        {limit !== null ? ', with its gap to the dashed limit in gold' : ''}. {story} The series
        converges only for −1 &lt; x &lt; 1: its radius of convergence is 1.
      </figcaption>
    </figure>
  );
}
