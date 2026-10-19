import { useState } from 'react';
import { Curve, Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic ST201, Example 3: a share fund (expected return 10 %, SD 20 %) and a bond fund
// (expected return 4 %, SD 10 %). The student chooses the weight w in shares and the correlation ρ.
export const SHARES = { mean: 10, sd: 20 };
export const BONDS = { mean: 4, sd: 10 };
const FRAME = { xMin: 0, xMax: 1, yMin: 0, yMax: 24 };

/** E[R_p] = w·μ₁ + (1 − w)·μ₂. */
export const portfolioMean = (w: number) => w * SHARES.mean + (1 - w) * BONDS.mean;

/** σ_p² = w²σ₁² + (1 − w)²σ₂² + 2w(1 − w)ρσ₁σ₂, never below 0 (rounding can leave −1e−15). */
export const portfolioVariance = (w: number, rho: number) =>
  Math.max(
    0,
    w ** 2 * SHARES.sd ** 2 +
      (1 - w) ** 2 * BONDS.sd ** 2 +
      2 * w * (1 - w) * rho * SHARES.sd * BONDS.sd,
  );

export const portfolioSd = (w: number, rho: number) => Math.sqrt(portfolioVariance(w, rho));

/** w·σ₁ + (1 − w)·σ₂: the portfolio SD only when ρ = 1. */
export const averageSd = (w: number) => w * SHARES.sd + (1 - w) * BONDS.sd;

/** The weight in shares with the lowest risk, kept between 0 and 1. */
export function safestWeight(rho: number): number {
  const cov = rho * SHARES.sd * BONDS.sd;
  const w = (BONDS.sd ** 2 - cov) / (SHARES.sd ** 2 + BONDS.sd ** 2 - 2 * cov);
  return Math.min(1, Math.max(0, w));
}

/** One or two sentences on the diversification gain at the chosen mix. */
export function describeDiversification(w: number, rho: number): string {
  if (w < 1e-9 || w > 1 - 1e-9)
    return 'With everything in one fund there is nothing to diversify: the portfolio SD is that fund’s SD.';
  const gain = averageSd(w) - portfolioSd(w, rho);
  if (gain < 1e-9)
    return 'With ρ = 1 the two returns move in lockstep, so the curve is the straight dashed line: mixing gives no diversification gain.';
  return `Because ρ < 1, the portfolio SD is ${fmt(gain)} percentage points below the weighted average of the two SDs: that is the diversification gain. The least risky mix puts w = ${fmt(safestWeight(rho))} in shares.`;
}

/** ST201: choose the weight in shares and the correlation; watch the portfolio SD fall below the straight line. */
export function TwoAssetPortfolio() {
  const [w, setW] = useState(0.6);
  const [rho, setRho] = useState(-0.2);
  const sd = portfolioSd(w, rho);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="weight in shares w"
        yLabel="portfolio SD %"
        xTicks={[0, 0.25, 0.5, 0.75, 1]}
        yTicks={[10, 20]}
      >
        <Curve frame={FRAME} fn={averageSd} tone="gold" dashed />
        <Curve frame={FRAME} fn={(v) => portfolioSd(v, rho)} />
        {averageSd(w) - sd > 0.3 && (
          <Segment frame={FRAME} from={[w, sd]} to={[w, averageSd(w)]} tone="green" />
        )}
        <Dot frame={FRAME} x={w} y={averageSd(w)} hollow />
        <Dot frame={FRAME} x={w} y={sd} />
        <Note frame={FRAME} x={0.98} y={21.6} anchor="end">
          dashed: ρ = 1
        </Note>
      </Plot>
      <Slider
        label="Weight in the share fund w"
        value={w}
        min={0}
        max={1}
        step={0.05}
        onChange={setW}
      />
      <Slider
        label="Correlation ρ"
        value={rho}
        min={-1}
        max={1}
        step={0.1}
        onChange={(v) => setRho(Math.round(v * 10) / 10)}
      />
      <Readout
        items={[
          ['Portfolio mean', `${fmt(portfolioMean(w))} %`],
          ['Portfolio SD', `${fmt(sd)} %`],
          ['Weighted average of SDs', `${fmt(averageSd(w))} %`],
        ]}
      />
      <figcaption>
        The share fund returns 10 % on average with an SD of 20 %, the bond fund 4 % with an SD of
        10 %. The solid curve is the portfolio SD for every weight w at the chosen ρ; the dashed
        line is the weighted average of the two SDs, which is the portfolio SD only when ρ = 1. The
        filled dot is your mix, the hollow dot the weighted average above it.{' '}
        {describeDiversification(w, rho)}
      </figcaption>
    </figure>
  );
}
