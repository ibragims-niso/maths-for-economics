import { useState } from 'react';
import { Area, Curve, fmt, Note, Plot, Readout, Segment, Slider } from './kit';
import { normalCdf, normalDensity, probText } from './NormalAreaExplorer';

/** The true return to education: 1.5 more per hour for each year (EM02, Example 1). */
export const BETA1 = 1.5;
/** The starting case of Example 1: σ = 6, n = 25 workers, education spread SD 2 years. */
export const START = { sigma: 6, n: 25, sdX: 2 } as const;

const X_MIN = -1.5;
const X_MAX = 4.5;

/**
 * SE(b₁) = σ/√Σ(x − x̄)² with Σ(x − x̄)² = n·SD², where SD is the spread of x (divisor n):
 * the standard deviation of the slope across samples (EM02, Var(b₁ | X) = σ²/Σ(x − x̄)²).
 */
export function slopeSe(sigma: number, n: number, sdX: number): number {
  return sigma / Math.sqrt(n * sdX * sdX);
}

/** The middle 95 % of the sampling distribution N(β₁, SE²): β₁ ± 1.96·SE. */
export function range95(beta: number, se: number): [number, number] {
  return [beta - 1.96 * se, beta + 1.96 * se];
}

/** The probability that a sample gives a slope of the wrong sign (below 0 when β₁ > 0). */
export function wrongSignProbability(beta: number, se: number): number {
  return normalCdf(-Math.abs(beta) / se);
}

/** The caption: what the curve is, the current numbers, and what makes the SE small. */
export function describeSampling(sigma: number, n: number, sdX: number): string {
  const se = slopeSe(sigma, n, sdX);
  const [lo, hi] = range95(BETA1, se);
  const p = probText(wrongSignProbability(BETA1, se));
  const wrong = /^[<>]/.test(p) ? `a share ${p}` : `a share of ${p}`;
  const start =
    sigma === START.sigma && n === START.n && sdX === START.sdX
      ? 'This is the starting case of Example 1.'
      : 'The green dashed curve is the starting case of Example 1 (σ = 6, n = 25, SD 2).';
  return `The lilac curve shows where the OLS slope b₁ lands across many samples of ${n} workers, when the true return to education is β₁ = 1.5 an hour per year and the errors are normal with SD σ = ${fmt(sigma)}. It is centred on 1.5 whatever you choose, because OLS is unbiased. Its spread is SE(b₁) = σ/√(n·SD²) = ${fmt(sigma)}/√(${n} × ${fmt(sdX)}²) = ${fmt(se, 3)}: 95 % of samples give a slope between ${fmt(lo)} and ${fmt(hi)}, and ${wrong} (gold) even gives the wrong sign. ${start} Four times as many workers, twice the spread of education or half the noise σ each halve the SE.`;
}

/** EM02: change the noise, the sample size and the spread of x, and watch the distribution of b₁ narrow. */
export function OlsSlopeSampling() {
  const [sigma, setSigma] = useState<number>(START.sigma);
  const [n, setN] = useState<number>(START.n);
  const [sdX, setSdX] = useState<number>(START.sdX);
  const se = slopeSe(sigma, n, sdX);
  const seStart = slopeSe(START.sigma, START.n, START.sdX);
  const f = (b: number) => normalDensity(b, BETA1, se);
  const g = (b: number) => normalDensity(b, BETA1, seStart);
  const peak = f(BETA1);
  const top = 1.18 * Math.max(peak, g(BETA1));
  const frame = { xMin: X_MIN, xMax: X_MAX, yMin: 0, yMax: top };
  const [lo, hi] = range95(BETA1, se);

  return (
    <figure className="widget">
      <Plot frame={frame} xLabel="slope b₁" yLabel="density" xTicks={[-1, 0, 1, 2, 3, 4]}>
        <Area frame={frame} top={f} from={X_MIN} to={0} tone="gold" />
        <Curve frame={frame} fn={g} tone="green" dashed />
        <Curve frame={frame} fn={f} />
        <Segment frame={frame} from={[BETA1, 0]} to={[BETA1, peak]} tone="lilac" dashed />
        <Note frame={frame} x={BETA1 + 0.08} y={0.93 * top}>
          β₁ = 1.5
        </Note>
      </Plot>
      <Slider label="Error SD σ" value={sigma} min={1} max={15} onChange={setSigma} />
      <Slider label="Sample size n" value={n} min={5} max={200} onChange={setN} />
      <Slider
        label="SD of education (years)"
        value={sdX}
        min={0.5}
        max={5}
        step={0.5}
        onChange={setSdX}
      />
      <Readout
        items={[
          ['SE(b₁)', fmt(se, 3)],
          ['95 % range', `${fmt(lo)} to ${fmt(hi)}`],
          ['P(b₁ < 0)', probText(wrongSignProbability(BETA1, se))],
        ]}
      />
      <figcaption>{describeSampling(sigma, n, sdX)}</figcaption>
    </figure>
  );
}
