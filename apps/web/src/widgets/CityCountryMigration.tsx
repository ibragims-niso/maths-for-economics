import { useState } from 'react';
import { Dot, fmt, Note, Plot, Readout, Segment, Slider } from './kit';

// Topic LA203, Example 2: 90 million people, 36 million in the city and 54 million in the
// countryside; each year a share a of city dwellers and a share b of countryside dwellers move.
const TOTAL = 90;
const START: [number, number] = [36, 54];
const YEARS = 30;
const FRAME = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };

/** The eigenvalues of A = (1 − a, b; a, 1 − b): 1, because the columns add up to 1, and 1 − a − b. */
export const migrationEigenvalues = (a: number, b: number): [number, number] => [1, 1 - a - b];

/** One year of migration: x_{t+1} = Ax_t with x = (city, countryside). */
export const stepPopulation = (a: number, b: number, x: [number, number]): [number, number] => [
  (1 - a) * x[0] + b * x[1],
  a * x[0] + (1 - b) * x[1],
];

/** The populations x₀, x₁, …, xₙ, by applying A year after year. */
export function populationPath(
  a: number,
  b: number,
  x0: [number, number],
  n: number,
): [number, number][] {
  const path: [number, number][] = [x0];
  for (let t = 0; t < n; t++) path.push(stepPopulation(a, b, path[t] ?? x0));
  return path;
}

/** Long-run city share b/(a + b), from the eigenvector (b, a) for the eigenvalue 1. */
export const longRunCityShare = (a: number, b: number) => b / (a + b);

/** City share after n years by diagonalisation: s* + λ₂ⁿ(s₀ − s*). */
export function cityShareAfter(a: number, b: number, s0: number, n: number): number {
  const star = longRunCityShare(a, b);
  return star + migrationEigenvalues(a, b)[1] ** n * (s0 - star);
}

/** What the second eigenvalue does to the path. */
export function describeSpeed(lambda2: number): string {
  const l = fmt(lambda2);
  if (Math.abs(lambda2) < 1e-9)
    return 'Here λ₂ = 0: the v₂ part vanishes at once, so the long run is reached after one year.';
  if (lambda2 < 0)
    return `Here λ₂ = ${l} is negative: the v₂ part changes sign every year, so the dots jump from one side of the green line to the other while closing in.`;
  return `Each year the distance to the green line is multiplied by λ₂ = ${l}: the closer λ₂ is to 0, the faster the population settles; close to 1, it takes decades.`;
}

/** LA203: two-region migration; the path moves along v₂ = (1, −1) to the eigenvector v₁ = (b, a). */
export function CityCountryMigration() {
  const [a, setA] = useState(0.1);
  const [b, setB] = useState(0.2);
  const [n, setN] = useState(5);
  const [, l2] = migrationEigenvalues(a, b);
  const star = longRunCityShare(a, b);
  const path = populationPath(a, b, START, n);
  const now = path[n] ?? START;
  const share = cityShareAfter(a, b, START[0] / TOTAL, n);
  // The eigenvector v₁ = (b, a), drawn from the origin to the long-run point on the gold line.
  const longRun: [number, number] = [TOTAL * star, TOTAL * (1 - star)];
  const mid: [number, number] = [longRun[0] / 2, longRun[1] / 2];
  // Its label sits above a shallow green line and below a steep one, clear of both lines.
  const shallow = longRun[1] < longRun[0];

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="city, m"
        yLabel="countryside, m"
        xTicks={[0, 30, 60, 90]}
        yTicks={[30, 60, 90]}
      >
        <Segment frame={FRAME} from={[0, TOTAL]} to={[TOTAL, 0]} tone="gold" dashed />
        <Segment frame={FRAME} from={[0, 0]} to={longRun} tone="green" dashed />
        {Array.from({ length: n }, (_, k) => k).map((t) => (
          <Dot key={`year${t}`} frame={FRAME} x={path[t]?.[0] ?? 0} y={path[t]?.[1] ?? 0} hollow />
        ))}
        <Dot frame={FRAME} x={now[0]} y={now[1]} />
        <Note frame={FRAME} x={START[0] - 3} y={START[1] - 9} anchor="end">
          start
        </Note>
        <Note frame={FRAME} x={54} y={64}>
          v₂ = (1, −1)
        </Note>
        <Note
          frame={FRAME}
          x={shallow ? mid[0] - 4 : mid[0] + 4}
          y={shallow ? mid[1] + 5 : mid[1] - 5}
          anchor={shallow ? 'end' : 'start'}
        >
          v₁ = (b, a)
        </Note>
      </Plot>
      <Slider
        label="City move-out rate a"
        value={a}
        min={0.02}
        max={0.6}
        step={0.01}
        onChange={setA}
      />
      <Slider
        label="Countryside move-out rate b"
        value={b}
        min={0.02}
        max={0.6}
        step={0.01}
        onChange={setB}
      />
      <Slider label="Years n" value={n} min={0} max={YEARS} onChange={setN} />
      <Readout
        items={[
          ['Eigenvalues', `1 and ${fmt(l2)}`],
          [`City share after ${n} year${n === 1 ? '' : 's'}`, `${fmt(100 * share, 1)} %`],
          ['Long-run city share', `${fmt(100 * star, 1)} %`],
        ]}
      />
      <figcaption>
        The dots are the city and countryside populations year by year, starting from 36 and 54
        million. The total stays 90 million, so they move along the gold line, the direction of the
        eigenvector v₂ = (1, −1). They head for the green line, the eigenvector v₁ = (b, a) for λ₁ =
        1, where the split no longer changes. {describeSpeed(l2)}
      </figcaption>
    </figure>
  );
}
