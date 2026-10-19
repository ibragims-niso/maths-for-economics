import { useState } from 'react';
import { Area, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// The binomial B(n, p) next to the Poisson distribution with the same mean λ = np (topic ST104).

/** P(X = k) for X ~ B(n, p), built term by term so large n does not overflow. */
export function binomialPmf(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let logC = 0;
  for (let i = 1; i <= k; i++) logC += Math.log(n - k + i) - Math.log(i);
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/** P(Y = k) for Y ~ Poisson(λ). */
export function poissonPmf(lambda: number, k: number): number {
  if (k < 0) return 0;
  let logF = 0;
  for (let i = 2; i <= k; i++) logF += Math.log(i);
  return Math.exp(-lambda + k * Math.log(lambda) - logF);
}

/** The counts shown: from about 4 Poisson standard deviations below the mean to 4 above. */
export function windowFor(n: number, p: number): { from: number; to: number } {
  const mean = n * p;
  const spread = 4 * Math.sqrt(mean);
  const from = Math.max(0, Math.floor(mean - spread));
  const to = Math.max(from + 8, Math.ceil(mean + spread + 1));
  return { from, to };
}

/** The largest gap between a binomial bar and the Poisson mark at the same count. */
export function largestGap(n: number, p: number): number {
  const { from, to } = windowFor(n, p);
  let gap = 0;
  for (let k = from; k <= to; k++) {
    gap = Math.max(gap, Math.abs(binomialPmf(n, p, k) - poissonPmf(n * p, k)));
  }
  return gap;
}

/** About five counts to label along the horizontal axis. */
export function countTicks(from: number, to: number): number[] {
  const step = Math.max(1, Math.ceil((to - from) / 5));
  const ticks: number[] = [];
  for (let k = from; k <= to; k += step) ticks.push(k);
  return ticks;
}

/** The top of the vertical axis: above the tallest bar or mark, an even number of 2-decimal steps. */
export function axisTop(tallest: number): number {
  const unit = Math.max(0.01, 10 ** Math.floor(Math.log10(tallest)) / 2);
  return Math.ceil((tallest * 1.12) / (2 * unit)) * 2 * unit;
}

/** ST104: change n and p; compare the binomial bars with the Poisson marks of the same mean. */
export function BinomialPoissonBars() {
  const [n, setN] = useState(8);
  const [p, setP] = useState(0.1);
  const mean = n * p;
  const { from, to } = windowFor(n, p);
  const counts = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const bars = counts.map((k) => [k, binomialPmf(n, p, k), poissonPmf(mean, k)] as const);
  const top = axisTop(Math.max(...bars.map(([, b, q]) => Math.max(b, q))));
  // Count k is drawn at u = k − from + 1, so the frame never reaches u = 0 (where the kit would
  // draw a dashed axis through the first bar); the counts are labelled in a strip below the bars.
  const u = (k: number) => k - from + 1;
  const frame = { xMin: 0.4, xMax: u(to) + 1.2, yMin: -0.12 * top, yMax: top };
  const unitPx = 266 / (frame.xMax - frame.xMin);
  const labels = countTicks(from, to).filter((k) => (frame.xMax - u(k)) * unitPx > 16);
  const m = Math.round(mean);
  const gap = largestGap(n, p);

  let story: string;
  if (gap < 0.01) {
    story = `Here p is small, so the two almost coincide: the largest gap is only ${fmt(gap, 4)}. This is the Poisson approximation, B(n, p) ≈ Poisson(np) for large n and small p.`;
  } else if (p > 0.1) {
    story = `With p = ${fmt(p)} the factor 1 − p is well below 1, so the Poisson marks are too spread out (largest gap ${fmt(gap, 3)}). Lower p and raise n to bring them together.`;
  } else {
    story = `With only n = ${n} trials the two still differ (largest gap ${fmt(gap, 3)}). Raise n while keeping np about the same.`;
  }

  return (
    <figure className="widget">
      <Plot frame={frame} xLabel="k" yLabel="P(X = k)" yTicks={top > 1 ? [0.5, 1] : [top / 2, top]}>
        {bars.map(([k, b]) => (
          <Area
            key={`b${k}`}
            frame={frame}
            points={[
              [u(k) - 0.38, 0],
              [u(k) - 0.38, b],
              [u(k) + 0.38, b],
              [u(k) + 0.38, 0],
            ]}
            tone="lilac"
          />
        ))}
        {bars.map(([k, , q]) => (
          <Segment
            key={`q${k}`}
            frame={frame}
            from={[u(k) - 0.38, q]}
            to={[u(k) + 0.38, q]}
            tone="green"
          />
        ))}
        {labels.map((k) => (
          <Note key={`l${k}`} frame={frame} x={u(k)} y={-0.1 * top} anchor="middle">
            {k}
          </Note>
        ))}
      </Plot>
      <Slider label="Trials n" value={n} min={2} max={100} onChange={setN} />
      <Slider label="Probability p" value={p} min={0.01} max={0.5} step={0.01} onChange={setP} />
      <Readout
        items={[
          ['Mean np', fmt(mean, 2)],
          ['Variance: binomial | Poisson', `${fmt(mean * (1 - p), 3)} | ${fmt(mean, 2)}`],
          [
            `P(X = ${m}): binomial | Poisson`,
            `${fmt(binomialPmf(n, p, m), 4)} | ${fmt(poissonPmf(mean, m), 4)}`,
          ],
        ]}
      />
      <figcaption>
        The lilac bars are the binomial probabilities of k successes in n independent trials, and
        the green marks the Poisson probabilities with the same mean λ = np. Their variances are
        np(1 − p) and np, so they can only match when 1 − p is close to 1. {story}
        {to > n &&
          ` There are no bars beyond k = ${n}: the binomial cannot count more successes than trials, while the Poisson has no upper limit.`}
      </figcaption>
    </figure>
  );
}
