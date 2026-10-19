import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// The log-likelihood of a default probability p from k defaults among n loans (topic EM05).

/** Half the 5 % critical value of χ² with 1 degree of freedom: LR = 2 × drop > 3.841. */
export const LR_DROP = 3.841 / 2;

const FRAME = { xMin: 0, xMax: 1, yMin: -4, yMax: 0.6 };

/** ℓ(p) = k ln p + (n − k) ln(1 − p), with 0 × ln 0 taken as 0. */
export function bernoulliLogLik(k: number, n: number, p: number): number {
  const a = k === 0 ? 0 : k * Math.log(p);
  const b = n - k === 0 ? 0 : (n - k) * Math.log(1 - p);
  return a + b;
}

/** The maximum likelihood estimate p̂ = k/n. */
export const mleShare = (k: number, n: number) => k / n;

/** The approximate standard error 1/√(−ℓ″(p̂)) = √(p̂(1 − p̂)/n). */
export function standardError(k: number, n: number): number {
  const p = mleShare(k, n);
  return Math.sqrt((p * (1 - p)) / n);
}

/** The curvature −ℓ″(p̂) = k/p̂² + (n − k)/(1 − p̂)², the observed information. */
export function information(k: number, n: number): number {
  const p = mleShare(k, n);
  return k / p ** 2 + (n - k) / (1 - p) ** 2;
}

/** The values of p whose log-likelihood is within 1.92 of the peak (not rejected by the LR test). */
export function likelihoodInterval(k: number, n: number): [number, number] {
  const p = mleShare(k, n);
  const top = bernoulliLogLik(k, n, p);
  const gap = (q: number) => bernoulliLogLik(k, n, q) - top + LR_DROP;
  const cross = (inside: number, outside: number) => {
    let a = inside;
    let b = outside;
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2;
      if (gap(m) >= 0) a = m;
      else b = m;
    }
    return (a + b) / 2;
  };
  return [cross(p, 1e-12), cross(p, 1 - 1e-12)];
}

/** An interval end for the caption: 4 decimals close to 0 or 1, where 3 would show 0 or 1. */
export const endLabel = (q: number) => fmt(q, q < 0.01 || q > 0.99 ? 4 : 3);

/** EM05: choose the number of loans and of defaults; see the log-likelihood peak at p̂ = k/n. */
export function BernoulliLogLikelihood() {
  const [n, setN] = useState(60);
  const [k, setK] = useState(9);
  const kk = Math.min(k, n - 1);
  const p = mleShare(kk, n);
  const top = bernoulliLogLik(kk, n, p);
  const [lo, hi] = likelihoodInterval(kk, n);
  const curve = (q: number) => bernoulliLogLik(kk, n, q) - top;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="p"
        yLabel="ℓ(p) − ℓ(p̂)"
        xTicks={[0, 0.25, 0.5, 0.75, 1]}
        yTicks={[-4, -LR_DROP, 0]}
      >
        <Segment frame={FRAME} from={[0, -LR_DROP]} to={[1, -LR_DROP]} tone="gold" dashed />
        {/* Two halves that both end exactly at p̂, so a narrow peak is never cut off. */}
        <Curve frame={FRAME} fn={curve} from={0.0002} to={p} />
        <Curve frame={FRAME} fn={curve} from={p} to={0.9998} />
        <Guides frame={FRAME} x={p} y={0} />
        <Dot frame={FRAME} x={lo} y={-LR_DROP} hollow />
        <Dot frame={FRAME} x={hi} y={-LR_DROP} hollow />
        <Dot frame={FRAME} x={p} y={0} />
      </Plot>
      <Slider label="Loans n" value={n} min={10} max={240} step={5} onChange={setN} />
      <Slider
        label="Defaults k"
        value={kk}
        min={1}
        max={n - 1}
        onChange={(v) => setK(Math.min(v, n - 1))}
      />
      <Readout
        items={[
          ['MLE p̂ = k/n', fmt(p, 3)],
          ['Log-likelihood ℓ(p̂)', fmt(top, 2)],
          ['Standard error of p̂', fmt(standardError(kk, n), 3)],
        ]}
      />
      <figcaption>
        The lilac curve is the log-likelihood ℓ(p) = k ln p + (n − k) ln(1 − p) of the default
        probability p, shifted down by ℓ(p̂) so that its peak sits at 0, exactly above p̂ = k/n. Where
        it stays above the dashed gold line, 1.92 below the peak, p would survive a likelihood-ratio
        test at 5 %: here from {endLabel(lo)} to {endLabel(hi)} (hollow dots). Keep the share k/n
        fixed and raise n: the curve gets narrower, because more data pin p down more precisely, and
        the standard error falls like 1/√n.
      </figcaption>
    </figure>
  );
}
