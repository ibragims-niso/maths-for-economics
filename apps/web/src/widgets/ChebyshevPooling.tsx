import { useState } from 'react';
import { Curve, Dot, fmt, Guides, Plot, Readout, Segment, Slider } from './kit';

// An insurer pools n independent policies (topic ST206, Example 2): the claim on one policy has
// mean 300 and standard deviation 1500. The premium is 300 + ε, so the insurer is safe when the
// average claim per policy stays less than ε away from 300.
export const MEAN_CLAIM = 300;
export const SD_CLAIM = 1500;
const N_MAX = 15000;
const X_MAX = 16000;
const FRAME = { xMin: 0, xMax: X_MAX, yMin: 0, yMax: 1.15 };

/** Var(X̄) = σ²/n for the average of n independent claims. */
export const varianceOfAverage = (n: number, sigma = SD_CLAIM) => sigma ** 2 / n;

/** Chebyshev's bound for the average: P(|X̄ − μ| ≥ ε) ≤ σ²/(nε²) (may exceed 1, then it says nothing). */
export const chebyshevBound = (n: number, eps: number, sigma = SD_CLAIM) =>
  varianceOfAverage(n, sigma) / eps ** 2;

/** The bound where it says something (at most 1); NaN above 1, so the curve starts at the value 1. */
export const cappedBound = (n: number, eps: number) => {
  const b = chebyshevBound(n, eps);
  return b <= 1 ? b : Number.NaN;
};

/** erfc(x) for x ≥ 0 (Chebyshev-fitted approximation, relative error below 1.2e−7). */
export function erfc(x: number): number {
  const t = 1 / (1 + 0.5 * x);
  const poly =
    -1.26551223 +
    t *
      (1.00002368 +
        t *
          (0.37409196 +
            t *
              (0.09678418 +
                t *
                  (-0.18628806 +
                    t *
                      (0.27886807 +
                        t *
                          (-1.13520398 +
                            t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))));
  return t * Math.exp(-x * x + poly);
}

/** P(|Z| ≥ z) for a standard normal Z. */
export const normalTwoSidedTail = (z: number) => erfc(Math.abs(z) / Math.SQRT2);

/** The normal approximation to P(|X̄ − μ| ≥ ε): ε is ε√n/σ standard deviations of X̄. */
export const normalApprox = (n: number, eps: number, sigma = SD_CLAIM) =>
  normalTwoSidedTail(eps / Math.sqrt(varianceOfAverage(n, sigma)));

/** The fewest policies for which Chebyshev's bound is at most α: n ≥ σ²/(αε²), rounded up. */
export const policiesNeeded = (eps: number, alpha: number, sigma = SD_CLAIM) =>
  Math.ceil(sigma ** 2 / (alpha * eps ** 2) - 1e-9);

/** One or two sentences on what the bound says for this pool. */
export function describePooling(n: number, eps: number): string {
  const bound = chebyshevBound(n, eps);
  const need = policiesNeeded(eps, 0.05);
  const target =
    need <= N_MAX
      ? ` The bound reaches 0.05 (the gold line) at n = ${fmt(need, 0)}.`
      : ` With this margin the bound only reaches 0.05 at n = ${fmt(need, 0)}, off the chart.`;
  if (bound >= 1)
    return `With n = ${fmt(n, 0)} the bound is ${fmt(bound, 2)}, at least 1, so Chebyshev tells you nothing yet.${target}`;
  return `With n = ${fmt(n, 0)} a premium of ${fmt(MEAN_CLAIM + eps, 0)} per policy covers the average claim with probability at least ${fmt(1 - bound, 4)}, whatever the shape of the claim distribution.${target}`;
}

/** ST206: choose the number of policies and the safety margin; watch the risk per policy shrink. */
export function ChebyshevPooling() {
  const [n, setN] = useState(2500);
  const [eps, setEps] = useState(60);
  const v = varianceOfAverage(n);
  const bound = chebyshevBound(n, eps);
  const normal = normalApprox(n, eps);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="n"
        yLabel="P(|X̄ − 300| ≥ ε)"
        xTicks={[5000, 10000, 15000]}
        yTicks={[0.05, 0.5, 1]}
      >
        <Segment frame={FRAME} from={[0, 0.05]} to={[N_MAX, 0.05]} tone="gold" dashed />
        <Curve
          frame={FRAME}
          fn={(x) => normalApprox(x, eps)}
          from={50}
          to={N_MAX}
          tone="green"
          dashed
        />
        <Curve frame={FRAME} fn={(x) => cappedBound(x, eps)} from={50} to={N_MAX} />
        <Guides frame={FRAME} x={n} y={Math.min(bound, 1)} />
        <Dot frame={FRAME} x={n} y={Math.min(bound, 1)} />
        <Dot frame={FRAME} x={n} y={normal} hollow />
      </Plot>
      <Slider label="Policies n" value={n} min={100} max={N_MAX} step={100} onChange={setN} />
      <Slider
        label="Margin ε per policy"
        value={eps}
        min={20}
        max={150}
        step={5}
        onChange={setEps}
      />
      <Readout
        items={[
          ['Var(X̄) | sd of X̄', `${fmt(v, 1)} | ${fmt(Math.sqrt(v), 2)}`],
          ['Chebyshev bound', bound >= 1 ? `${fmt(bound, 2)} (says nothing)` : fmt(bound, 4)],
          ['Normal approximation', fmt(normal, 4)],
        ]}
      />
      <figcaption>
        Each policy's claim has mean 300 and standard deviation 1500. The average claim X̄ of n
        independent policies has variance 1500²/n, so its spread shrinks like 1/√n: this is risk
        pooling. The lilac curve is Chebyshev's guarantee σ²/(nε²) for the chance that X̄ misses 300
        by ε or more (drawn where it is at most 1); the green dashed curve is the normal
        approximation (ST202), far smaller, because Chebyshev must hold for every possible
        distribution. The filled dot is the bound at your n, the hollow dot the normal
        approximation. {describePooling(n, eps)}
      </figcaption>
    </figure>
  );
}
