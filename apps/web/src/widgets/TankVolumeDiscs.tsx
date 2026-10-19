import { useState } from 'react';
import { Area, Curve, fmt, Plot, Readout, Slider } from './kit';

// The tank of topic C118, Example 1: y = 2√x rotated about the x-axis.
const FRAME = { xMin: 0, xMax: 6.4, yMin: -7, yMax: 7 };

/** Radius of the tank at distance x from its tip: y = 2√x. */
export function tankRadius(x: number): number {
  return 2 * Math.sqrt(x);
}

/** Total volume of n equal discs on [0, b], each with the radius at its left edge. */
export function discSum(b: number, n: number): number {
  const h = b / n;
  let total = 0;
  for (let i = 0; i < n; i++) total += Math.PI * tankRadius(i * h) ** 2 * h;
  return total;
}

/** Exact volume π∫₀ᵇ (2√x)² dx = π∫₀ᵇ 4x dx = 2πb². */
export function exactVolume(b: number): number {
  return 2 * Math.PI * b * b;
}

/** Length of the curve y = 2√x from 0 to b: ∫₀ᵇ √(1 + 1/x) dx = √(b² + b) + ln(√b + √(b + 1)). */
export function wallLength(b: number): number {
  return Math.sqrt(b * b + b) + Math.log(Math.sqrt(b) + Math.sqrt(b + 1));
}

/** C118: slice a tank into discs and watch their total volume approach the integral. */
export function TankVolumeDiscs() {
  const [b, setB] = useState(4);
  const [n, setN] = useState(8);
  const h = b / n;
  const sum = discSum(b, n);
  const exact = exactVolume(b);
  const discs = Array.from({ length: n }, (_, i) => {
    const x = i * h;
    const r = tankRadius(x);
    return { x, r };
  });

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="length x (m)"
        yLabel="radius (m)"
        xTicks={[0, 2, 4, 6]}
        yTicks={[-4, 0, 4]}
      >
        {discs.map(({ x, r }, i) => (
          <Area
            key={x}
            tone={i % 2 === 0 ? 'gold' : 'green'}
            frame={FRAME}
            points={[
              [x, -r],
              [x + h, -r],
              [x + h, r],
              [x, r],
            ]}
          />
        ))}
        <Curve frame={FRAME} fn={tankRadius} from={0} to={b} />
        <Curve frame={FRAME} fn={(x) => -tankRadius(x)} from={0} to={b} />
      </Plot>
      <Slider
        label="Tank length b"
        value={b}
        min={1}
        max={6}
        step={0.5}
        onChange={setB}
        format={(v) => `${fmt(v)} m`}
      />
      <Slider label="Number of discs n" value={n} min={2} max={24} onChange={setN} />
      <Readout
        items={[
          [`Volume of ${n} discs`, `${fmt(sum)} m³`],
          ['Exact volume 2πb²', `${fmt(exact)} m³`],
          ['Length of the wall curve', `${fmt(wallLength(b))} m`],
        ]}
      />
      <figcaption>
        The lilac curves are the wall of the tank, y = 2√x and its mirror image; spinning them about
        the x-axis makes the tank. Each shaded rectangle is the side view of one disc, {fmt(h)} m
        thick, with the radius of the wall at its left edge, so the discs fit inside the tank (the
        first, at the tip, has radius 0). Their total, {fmt(sum)} m³, falls short of the exact
        volume π∫(2√x)² dx = {fmt(exact)} m³ by {fmt(exact - sum)} m³, exactly 1/{n} of it: more,
        thinner discs close the gap.
      </figcaption>
    </figure>
  );
}
