import { useState } from 'react';
import { Area, Curve, fmt, Note, Plot, Readout, Segment, Slider } from './kit';
import { normalCdf, normalDensity, probText } from './NormalAreaExplorer';

/**
 * Weekly spending on eating out of one household: a strongly right-skewed (exponential)
 * population with mean 60 and standard deviation 60, as in worked example 1 of ST202.
 */
export const POP_MEAN = 60;
export const POP_SD = 60;

const FRAME = { xMin: 0, xMax: 180, yMin: 0, yMax: 0.075 };

/** The population density: e^(−x/60)/60 for x ≥ 0. */
export function populationDensity(x: number): number {
  return x < 0 ? 0 : Math.exp(-x / POP_MEAN) / POP_MEAN;
}

/** ln (n − 1)!, the log of the gamma function at a whole number n. */
function logFactorial(m: number): number {
  let s = 0;
  for (let k = 2; k <= m; k++) s += Math.log(k);
  return s;
}

/**
 * The exact density of the mean X̄ of n independent households. A sum of n exponential variables
 * has a gamma distribution, so X̄ is gamma with shape n and scale 60/n.
 */
export function sampleMeanDensity(x: number, n: number): number {
  if (x <= 0) return n === 1 && x === 0 ? 1 / POP_MEAN : 0;
  const scale = POP_MEAN / n;
  return Math.exp((n - 1) * Math.log(x) - x / scale - logFactorial(n - 1) - n * Math.log(scale));
}

/** Exact P(X̄ ≤ x): 1 − Σ_{k<n} e^(−λ) λ^k / k! with λ = n·x/60 (the Erlang distribution). */
export function sampleMeanCdf(x: number, n: number): number {
  if (x <= 0) return 0;
  const lambda = (n * x) / POP_MEAN;
  let term = Math.exp(-lambda);
  let sum = term;
  for (let k = 1; k < n; k++) {
    term *= lambda / k;
    sum += term;
  }
  return Math.max(0, 1 - sum);
}

/** The standard error σ/√n of the sample mean. */
export function standardError(n: number): number {
  return POP_SD / Math.sqrt(n);
}

/** The normal curve N(60, σ²/n) that the central limit theorem gives for X̄. */
export function normalApproxDensity(x: number, n: number): number {
  return normalDensity(x, POP_MEAN, standardError(n));
}

/** P(60 − c < X̄ < 60 + c), exactly and by the normal approximation. */
export function withinProbability(n: number, c: number) {
  const exact = sampleMeanCdf(POP_MEAN + c, n) - sampleMeanCdf(POP_MEAN - c, n);
  const z = c / standardError(n);
  return { exact, normal: normalCdf(z) - normalCdf(-z) };
}

/** The caption: what the curves are, how well the normal curve fits, and the 1/√n rule. */
export function describeClt(n: number, c: number): string {
  const se = standardError(n);
  const { exact } = withinProbability(n, c);
  const text = probText(exact);
  const shown = /^[<>]/.test(text) ? text : `= ${text}`;
  const fit =
    n === 1
      ? 'With n = 1 the average is a single household, so the lilac curve is the skewed population itself and the normal curve fits badly; it even gives negative spending a probability of 0.16.'
      : n < 30
        ? `With n = ${n} the lilac curve is still visibly skewed: its peak lies left of 60 and its right tail is longer than the gold one.`
        : `With n = ${n} the lilac and gold curves almost coincide: the average is close to normal although single households are far from it.`;
  return `Green dashed: the weekly spending of one household, mean 60 and SD 60. Lilac: the exact distribution of the average X̄ of ${n === 1 ? 'n = 1 household' : `n = ${n} households`}; gold dashed: the normal curve N(60, ${fmt(se)}²) of the central limit theorem. ${fit} The shaded area is P(${fmt(POP_MEAN - c)} < X̄ < ${fmt(POP_MEAN + c)}) ${shown}. The standard error 60/√n = ${fmt(se)} shrinks like 1/√n: four times as many households halve it.`;
}

/** ST202: change the sample size and watch the distribution of the sample mean narrow and turn normal. */
export function SampleMeanClt() {
  const [n, setN] = useState(36);
  const [c, setC] = useState(10);
  const exactF = (x: number) => sampleMeanDensity(x, n);
  const normalF = (x: number) => normalApproxDensity(x, n);
  const { exact, normal } = withinProbability(n, c);
  const top = Math.min(FRAME.yMax, Math.max(exactF(POP_MEAN), normalF(POP_MEAN)));

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="spending"
        yLabel="density"
        xTicks={[0, 30, 60, 90, 120, 150, 180]}
      >
        <Area
          frame={FRAME}
          top={exactF}
          from={Math.max(0, POP_MEAN - c)}
          to={POP_MEAN + c}
          tone="lilac"
        />
        <Curve frame={FRAME} fn={populationDensity} tone="green" dashed />
        <Curve frame={FRAME} fn={normalF} tone="gold" dashed />
        <Curve frame={FRAME} fn={exactF} from={0.01} />
        <Segment frame={FRAME} from={[POP_MEAN, 0]} to={[POP_MEAN, top]} tone="green" dashed />
        <Note frame={FRAME} x={POP_MEAN + 3} y={Math.min(top, 0.068) + 0.003}>
          μ = 60
        </Note>
      </Plot>
      <Slider label="Sample size n" value={n} min={1} max={100} onChange={setN} />
      <Slider label="Half-width c" value={c} min={2} max={30} onChange={setC} />
      <Readout
        items={[
          ['SE = σ/√n', fmt(standardError(n))],
          ['P(|X̄ − 60| < c)', probText(exact)],
          ['Normal approx.', probText(normal)],
        ]}
      />
      <figcaption>{describeClt(n, c)}</figcaption>
    </figure>
  );
}
