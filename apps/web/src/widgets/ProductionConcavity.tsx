import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Note, Plot, Readout, Slider } from './kit';

// Output Q(L) = 6L² − 0.1L³ for 0 ≤ L ≤ 40 (topic C108, Example 3: inflection at L = 20).
const FRAME = { xMin: 0, xMax: 42, yMin: 0, yMax: 3500 };

/** Labour at which the curve changes from convex to concave: Q″(L) = 0 at L = 12/0.6. */
export const INFLECTION = 20;

/** Output with L workers: Q(L) = 6L² − 0.1L³. */
export const output = (l: number) => 6 * l * l - 0.1 * l ** 3;

/** Marginal product of labour, the slope of the curve: Q′(L) = 12L − 0.3L². */
export const marginalProduct = (l: number) => 12 * l - 0.3 * l * l;

/** The second derivative, the slope of the marginal product: Q″(L) = 12 − 0.6L. */
export const outputSecond = (l: number) => 12 - 0.6 * l;

/** The tangent to the production curve at l0, as a function of labour. */
export const tangentAt = (l0: number) => (l: number) => output(l0) + marginalProduct(l0) * (l - l0);

/** How the curve bends at labour l, read from the sign of Q″. */
export function shapeAt(l: number): 'convex' | 'concave' | 'inflection' {
  const second = outputSecond(l);
  if (Math.abs(second) < 1e-9) return 'inflection';
  return second > 0 ? 'convex' : 'concave';
}

/** One sentence on what the bend means for the marginal product at labour l. */
export function describeShape(l: number): string {
  const shape = shapeAt(l);
  if (shape === 'convex')
    return 'Q″ > 0: the curve is convex (bending up), the tangent lies below it and each extra worker adds more than the last.';
  if (shape === 'concave')
    return 'Q″ < 0: the curve is concave (bending down), the tangent lies above it and each extra worker adds less than the last: diminishing marginal returns.';
  return 'Q″ = 0 and changes sign here: this is the inflection point, where the marginal product is highest, 120.';
}

/** C108: slide along an S-shaped production curve and watch Q″ change sign at the inflection point. */
export function ProductionConcavity() {
  const [l, setL] = useState(10);
  const y = output(l);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="L"
        yLabel="output Q(L)"
        xTicks={[0, 10, 20, 30, 40]}
        yTicks={[1000, 2000, 3000]}
      >
        <Curve frame={FRAME} fn={output} from={0} to={INFLECTION} tone="green" />
        <Curve frame={FRAME} fn={output} from={INFLECTION} to={40} />
        <Curve
          frame={FRAME}
          fn={tangentAt(l)}
          from={Math.max(0, l - 7)}
          to={Math.min(40, l + 7)}
          tone="gold"
        />
        <Guides frame={FRAME} x={l} y={y} />
        <Dot frame={FRAME} x={INFLECTION} y={output(INFLECTION)} hollow />
        <Dot frame={FRAME} x={l} y={y} />
        <Note frame={FRAME} x={2} y={700}>
          convex
        </Note>
        <Note frame={FRAME} x={21.5} y={1450}>
          inflection
        </Note>
        <Note frame={FRAME} x={29} y={2000}>
          concave
        </Note>
      </Plot>
      <Slider label="Workers L" value={l} min={0} max={40} step={1} onChange={setL} />
      <Readout
        items={[
          ['Marginal product Q′(L)', fmt(marginalProduct(l))],
          ['Q″(L)', fmt(outputSecond(l))],
          ['Shape', shapeAt(l)],
        ]}
      />
      <figcaption>
        Output Q(L) = 6L² − 0.1L³: convex (green) up to L = 20, concave (lilac) after it, with the
        inflection point marked by the hollow dot. The gold line is the tangent at L = {fmt(l)}.{' '}
        {describeShape(l)}
      </figcaption>
    </figure>
  );
}
