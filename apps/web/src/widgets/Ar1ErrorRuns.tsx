import { useState } from 'react';
import { fmt, Plot, Readout, Segment, Slider } from './kit';

/**
 * 40 quarterly shocks εₜ, drawn once from a standard normal (mulberry32 seed 52 with Box–Muller,
 * rounded to 2 decimals) and stored here, so the picture is the same on every visit.
 */
export const SHOCKS: readonly number[] = [
  0.69, 0.5, -1.25, -0.13, -1.06, -1.89, -1.02, 0.02, -0.17, -0.54, -1.44, 0.63, 0.03, 0.11, -0.59,
  -0.25, -0.05, 2.76, -0.11, 0.36, -0.2, -0.06, 0.01, 3.18, -0.39, -0.48, 0.85, -0.28, -1.52, 1.37,
  0.02, -0.35, 0.73, -1.12, -0.67, 0.22, -0.75, 0.83, 0.83, -0.96,
];

/** The starting value of ρ: Example 2 of EM04 finds ρ̂ ≈ 0.75 from d = 0.5. */
export const START_RHO = 0.75;

const T = SHOCKS.length;
const FRAME = { xMin: 1, xMax: T, yMin: -6, yMax: 6 };

/** The AR(1) errors u₁ = ε₁, uₜ = ρ·uₜ₋₁ + εₜ, built from the fixed shocks. */
export function errorSeries(rho: number, shocks: readonly number[] = SHOCKS): number[] {
  const u: number[] = [];
  shocks.forEach((eps, t) => {
    u.push(t === 0 ? eps : rho * (u[t - 1] ?? 0) + eps);
  });
  return u;
}

/** The Durbin–Watson statistic d = Σₜ₌₂(uₜ − uₜ₋₁)² / Σₜ₌₁uₜ². */
export function durbinWatson(u: readonly number[]): number {
  let top = 0;
  let bottom = 0;
  u.forEach((v, t) => {
    bottom += v * v;
    if (t > 0) top += (v - (u[t - 1] ?? 0)) ** 2;
  });
  return top / bottom;
}

/** How many times the series crosses zero from one period to the next. */
export function signChanges(u: readonly number[]): number {
  let count = 0;
  for (let t = 1; t < u.length; t++) if ((u[t] ?? 0) * (u[t - 1] ?? 0) < 0) count++;
  return count;
}

/** The caption: what is drawn, the runs of same-sign errors, and how d moves with ρ. */
export function describeRuns(rho: number): string {
  const u = errorSeries(rho);
  const d = durbinWatson(u);
  const c = signChanges(u);
  let story: string;
  if (rho > 0.2) {
    story = `With ρ > 0 each error carries part of the one before, so the errors come in long runs of the same sign: a bad quarter tends to be followed by another bad one. Neighbours are alike, the changes uₜ − uₜ₋₁ are small, and d = ${fmt(d)} is well below 2.`;
  } else if (rho < -0.2) {
    story = `With ρ < 0 the errors tend to flip sign from one quarter to the next. The changes uₜ − uₜ₋₁ are large, and d = ${fmt(d)} is above 2.`;
  } else {
    story = `With ρ close to 0 the errors are almost the raw shocks, with no pattern from one quarter to the next, and d = ${fmt(d)} is close to 2.`;
  }
  return `The errors uₜ = ρ·uₜ₋₁ + εₜ of a quarterly regression over ${T} quarters, built from the same fixed shocks εₜ whatever ρ you choose; lilac where the error is above 0, gold where it is below. They change sign ${c} times in ${T - 1} steps. ${story} In long series d ≈ 2(1 − ρ) = ${fmt(2 * (1 - rho))}.`;
}

/** EM04: AR(1) errors. Move ρ and watch runs of same-sign errors appear and d fall below 2. */
export function Ar1ErrorRuns() {
  const [rho, setRho] = useState(START_RHO);
  const u = errorSeries(rho);
  const steps = u.slice(1).map((v, i) => {
    const before = u[i] ?? 0;
    return {
      id: `q${i + 2}`,
      from: [i + 1, before] as [number, number],
      to: [i + 2, v] as [number, number],
      tone: before + v >= 0 ? ('lilac' as const) : ('gold' as const),
    };
  });

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="quarter t"
        yLabel="error uₜ"
        xTicks={[10, 20, 30, 40]}
        yTicks={[-4, -2, 2, 4]}
      >
        {steps.map((s) => (
          <Segment key={s.id} frame={FRAME} from={s.from} to={s.to} tone={s.tone} />
        ))}
      </Plot>
      <Slider
        label="Autocorrelation ρ"
        value={rho}
        min={-0.9}
        max={0.9}
        step={0.05}
        onChange={setRho}
      />
      <Readout
        items={[
          ['ρ', fmt(rho)],
          ['DW d', fmt(durbinWatson(u))],
          ['2(1 − ρ)', fmt(2 * (1 - rho))],
        ]}
      />
      <figcaption>{describeRuns(rho)}</figcaption>
    </figure>
  );
}
