import { useState } from 'react';
import { Area, Curve, Dot, type Frame, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// AN03: continuity of f(x) = x² at a point a ≥ 0, in ε–δ form.
/** A window 2.2 wide centred on a, so the width of a δ band can be compared as a moves. */
export const frameFor = (a: number): Frame => ({
  xMin: a - 1.1,
  xMax: a + 1.1,
  yMin: Math.max(0, Math.floor((a - 1.1) ** 2)),
  yMax: Math.ceil((a + 1.1) ** 2),
});

export const f = (x: number) => x * x;

/** The largest δ with |x − a| < δ ⇒ |x² − a²| < ε, for a ≥ 0: the right side binds, (a + δ)² = a² + ε. */
export const largestDelta = (a: number, eps: number) => Math.sqrt(a * a + eps) - a;

/** The δ of the textbook proof: keep |x − a| < 1, so |x + a| < 2a + 1, then δ = min(1, ε/(2a + 1)). */
export const proofDelta = (a: number, eps: number) => Math.min(1, eps / (2 * a + 1));

/** How far x² can get from a² when |x − a| < δ (a ≥ 0): the gap approaches (a + δ)² − a² = 2aδ + δ². */
export const worstGap = (a: number, delta: number) => 2 * a * delta + delta * delta;

/** A chosen δ works when the worst gap stays within ε (equality is fine: the gap is never reached). */
export const deltaWorks = (a: number, eps: number, delta: number) =>
  worstGap(a, delta) <= eps + 1e-9;

function describe(a: number, eps: number, delta: number): string {
  const best = largestDelta(a, eps);
  const lead = `The gold band is f(a) ± ε = ${fmt(f(a), 4)} ± ${fmt(eps)}. The green band is |x − a| < ${fmt(best, 3)}, the widest that keeps x² inside the gold band.`;
  if (deltaWorks(a, eps, delta))
    return `${lead} Your δ = ${fmt(delta)} works: both hollow points stay inside the gold band, and so does every point between them.`;
  return `${lead} Your δ = ${fmt(delta)} is too wide: points just inside x = a + δ give x² close to ${fmt(f(a + delta), 4)}, above the gold band.`;
}

/** AN03: choose ε, the point a and a δ, and see whether every x within δ of a keeps x² within ε of a². */
export function EpsilonDeltaSquare() {
  const [eps, setEps] = useState(1);
  const [a, setA] = useState(2);
  const [delta, setDelta] = useState(0.2);
  const best = largestDelta(a, eps);
  const frame = frameFor(a);
  const fa = f(a);
  const works = deltaWorks(a, eps, delta);

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="x"
        yLabel="f(x) = x²"
        xTicks={[a - 1, a, a + 1]}
        yTicks={[frame.yMin, fa, frame.yMax]}
      >
        <Area
          frame={frame}
          points={[
            [frame.xMin, fa - eps],
            [frame.xMax, fa - eps],
            [frame.xMax, fa + eps],
            [frame.xMin, fa + eps],
          ]}
        />
        <Area
          frame={frame}
          tone="green"
          points={[
            [a - best, frame.yMin],
            [a + best, frame.yMin],
            [a + best, frame.yMax],
            [a - best, frame.yMax],
          ]}
        />
        <Segment frame={frame} from={[frame.xMin, fa + eps]} to={[frame.xMax, fa + eps]} dashed />
        <Segment frame={frame} from={[frame.xMin, fa - eps]} to={[frame.xMax, fa - eps]} dashed />
        <Curve frame={frame} fn={f} />
        <Guides frame={frame} x={a + delta} y={f(a + delta)} />
        <Dot frame={frame} x={a} y={fa} />
        <Dot frame={frame} x={a - delta} y={f(a - delta)} hollow />
        <Dot frame={frame} x={a + delta} y={f(a + delta)} hollow />
      </Plot>
      <Slider label="Tolerance ε" value={eps} min={0.1} max={2} step={0.1} onChange={setEps} />
      <Slider label="Point a" value={a} min={1.25} max={3} step={0.25} onChange={setA} />
      <Slider label="Your δ" value={delta} min={0.01} max={1} step={0.01} onChange={setDelta} />
      <Readout
        items={[
          ['Largest δ that works', fmt(best, 3)],
          ['Worst gap |x² − a²|', fmt(worstGap(a, delta), 3)],
          ['Your δ works?', works ? 'yes' : 'no'],
        ]}
      />
      <figcaption>{describe(a, eps, delta)}</figcaption>
    </figure>
  );
}
