import { useState } from 'react';
import { fmt, Note, Plot, Readout, Segment, Slider } from './kit';
import { normalCdf } from './NormalAreaExplorer';

/**
 * Monthly household income in a region, as in worked example 1 of ST203: the true mean μ = 1200
 * (which a real survey never sees) and the known standard deviation σ = 400.
 */
export const TRUE_MEAN = 1200;
export const POP_SD = 400;

/**
 * Twenty fixed standard normal draws, one per survey: survey i finds x̄ = μ + Z_i·σ/√n. They were
 * made once with the app's seeded generator (seed 137, Box–Muller) and rounded to 3 decimals,
 * so the picture is the same every time; no Math.random.
 */
export const DRAWS = [
  -0.866, 1.379, 0.206, 0.324, 0.123, 1.335, -1.163, 0.139, 0.653, 0.802, -1.885, 1.218, -0.496,
  2.166, -0.165, -0.767, -0.612, 0.881, 0.316, -0.68,
] as const;

const FRAME = { xMin: 500, xMax: 1900, yMin: 0, yMax: 23 };

/** The z value of a level% confidence interval, P(|Z| < z) = level/100, rounded to 3 decimals as in a table. */
export function zForLevel(level: number): number {
  let lo = 0;
  let hi = 10;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (2 * normalCdf(mid) - 1 < level / 100) lo = mid;
    else hi = mid;
  }
  return Math.round(((lo + hi) / 2) * 1000) / 1000;
}

/** The margin of error z·σ/√n. */
export const marginOf = (level: number, n: number) => (zForLevel(level) * POP_SD) / Math.sqrt(n);

/** The width of every interval, 2z·σ/√n. */
export const widthOf = (level: number, n: number) => 2 * marginOf(level, n);

/** The 20 surveys' intervals x̄ ± z·σ/√n and whether each covers the true mean. */
export function intervals(level: number, n: number) {
  const se = POP_SD / Math.sqrt(n);
  const e = marginOf(level, n);
  return DRAWS.map((z) => {
    const mean = TRUE_MEAN + z * se;
    return {
      mean,
      lower: mean - e,
      upper: mean + e,
      covers: mean - e < TRUE_MEAN && TRUE_MEAN < mean + e,
    };
  });
}

/** How many of the 20 intervals contain μ. */
export const coverCount = (level: number, n: number) =>
  intervals(level, n).filter((iv) => iv.covers).length;

/** The caption: what the bars are, how many miss, and what the confidence level promises. */
export function describeCoverage(level: number, n: number): string {
  const count = coverCount(level, n);
  const miss = DRAWS.length - count;
  const misses =
    miss === 0
      ? 'all 20 cover it this time'
      : `${count} of the 20 cover it and the ${miss === 1 ? 'gold one misses' : `${miss} gold ones miss`}`;
  return `Each bar is the ${level} % interval x̄ ± ${fmt(zForLevel(level), 3)} × 400/√${n} from one of 20 surveys of ${n} households; the dashed line is the true mean income μ = 1200, which the surveys never see. Here ${misses}. In the long run ${level} % of such intervals cover μ: that is what "${level} % confidence" means. A single interval either contains μ or it does not, and from one survey you cannot tell which. A larger n makes every bar shorter, but the same surveys miss: how often the method misses depends only on the confidence level.`;
}

/** ST203: twenty surveys' confidence intervals around the true mean; change the level and the sample size. */
export function ConfidenceIntervalCoverage() {
  const [level, setLevel] = useState(95);
  const [n, setN] = useState(64);
  const bars = intervals(level, n);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="income"
        yLabel="survey"
        xTicks={[600, 900, 1200, 1500, 1800]}
        yTicks={[5, 10, 15, 20]}
      >
        <Segment frame={FRAME} from={[TRUE_MEAN, 0]} to={[TRUE_MEAN, 20.8]} tone="green" dashed />
        <Note frame={FRAME} x={TRUE_MEAN} y={21.5} anchor="middle">
          μ = 1200
        </Note>
        {bars.map((iv, i) => (
          <Segment
            key={DRAWS[i]}
            frame={FRAME}
            from={[iv.lower, i + 1]}
            to={[iv.upper, i + 1]}
            tone={iv.covers ? 'lilac' : 'gold'}
          />
        ))}
      </Plot>
      <Slider
        label="Confidence level"
        value={level}
        min={80}
        max={99}
        onChange={setLevel}
        format={(v) => `${v} %`}
      />
      <Slider label="Sample size n" value={n} min={16} max={400} onChange={setN} />
      <Readout
        items={[
          ['z value', fmt(zForLevel(level), 3)],
          ['Width 2zσ/√n', fmt(widthOf(level, n))],
          ['Cover μ', `${coverCount(level, n)} of 20`],
        ]}
      />
      <figcaption>{describeCoverage(level, n)}</figcaption>
    </figure>
  );
}
