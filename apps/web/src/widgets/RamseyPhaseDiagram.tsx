import { useState } from 'react';
import { Curve, Dot, type Frame, fmt, Note, Plot, Readout, Segment, Slider, sx, sy } from './kit';

// Topic DO04: f(k) = 1.2k^(1/3), n = 1 %, σ = 2 (Examples 1–3); ρ and δ are set by the sliders.
export const A = 1.2;
export const ALPHA = 1 / 3;
export const N = 0.01;
export const SIGMA = 2;
/** The hollow dot starts with this share of k*: k(0) = 6 when k* = 8, as in Example 3. */
export const START_SHARE = 0.75;

type Vec = [number, number];

export const output = (k: number) => A * k ** ALPHA;
export const mpk = (k: number) => ALPHA * A * k ** (ALPHA - 1);

/** The capital per worker where f′(k) = rate. */
const capitalAtMpk = (rate: number) => ((ALPHA * A) / rate) ** (1 / (1 - ALPHA));

/** The k̇ = 0 curve: the consumption that keeps capital per worker constant, f(k) − (n + δ)k. */
export function kDotZero(k: number, delta: number): number {
  return output(k) - (N + delta) * k;
}

/** The modified golden rule f′(k*) = ρ + δ and c* = f(k*) − (n + δ)k*. */
export function steadyState(rho: number, delta: number): { k: number; c: number } {
  const k = capitalAtMpk(rho + delta);
  return { k, c: kDotZero(k, delta) };
}

/** The golden rule f′(k) = n + δ: the top of the k̇ = 0 curve. */
export function goldenRule(delta: number): { k: number; c: number } {
  const k = capitalAtMpk(N + delta);
  return { k, c: kDotZero(k, delta) };
}

/** (k̇, ċ) at a point: k̇ = f(k) − c − (n + δ)k, ċ = c(f′(k) − δ − ρ)/σ. */
export function ramseyFlow(rho: number, delta: number, [k, c]: Vec): Vec {
  return [output(k) - c - (N + delta) * k, (c * (mpk(k) - delta - rho)) / SIGMA];
}

/** The negative eigenvalue at the steady state and the slope m of the saddle path there. */
export function stableRoot(rho: number, delta: number): { lambda: number; slope: number } {
  const ss = steadyState(rho, delta);
  // Jacobian [[ρ − n, −1], [c*f″(k*)/σ, 0]]: trace ρ − n, determinant c*f″(k*)/σ < 0.
  const f2 = ALPHA * (ALPHA - 1) * A * ss.k ** (ALPHA - 2);
  const tr = rho - N;
  const det = (ss.c * f2) / SIGMA;
  const lambda = (tr - Math.sqrt(tr * tr - 4 * det)) / 2;
  // First row of J − λI: (ρ − n − λ)·1 − m = 0.
  return { lambda, slope: tr - lambda };
}

function rk4(rho: number, delta: number, x: Vec, h: number): Vec {
  const add = (a: Vec, b: Vec, s: number): Vec => [a[0] + s * b[0], a[1] + s * b[1]];
  const k1 = ramseyFlow(rho, delta, x);
  const k2 = ramseyFlow(rho, delta, add(x, k1, h / 2));
  const k3 = ramseyFlow(rho, delta, add(x, k2, h / 2));
  const k4 = ramseyFlow(rho, delta, add(x, k3, h));
  return [
    x[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    x[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
  ];
}

/**
 * The saddle path from k = kMin to k = kMax, found by backward shooting: start a hair away from
 * the steady state along the stable eigenvector and run time backwards, on both sides.
 * Points are sorted by k.
 */
export function saddlePath(rho: number, delta: number, kMin: number, kMax: number): Vec[] {
  const ss = steadyState(rho, delta);
  const { slope } = stableRoot(rho, delta);
  const eps = 1e-3 * ss.k;
  const branch = (side: 1 | -1): Vec[] => {
    let x: Vec = [ss.k + side * eps, ss.c + side * eps * slope];
    const pts: Vec[] = [x];
    for (let i = 0; i < 6000; i++) {
      // Smaller steps where things move fast (near k = 0), so the method stays accurate.
      const v = ramseyFlow(rho, delta, x);
      const speed = Math.abs(v[0] / x[0]) + Math.abs(v[1] / x[1]);
      x = rk4(rho, delta, x, -Math.min(0.1, 0.1 / speed));
      if (!(x[0] > kMin && x[0] < kMax && x[1] > 0 && x[1] < 1e3)) break;
      pts.push(x);
    }
    return pts;
  };
  return [...branch(-1).reverse(), [ss.k, ss.c], ...branch(1)];
}

/** Consumption on the saddle path at capital k (linear interpolation between computed points). */
export function saddleConsumption(path: Vec[], k: number): number {
  for (let i = 1; i < path.length; i++) {
    const [k0, c0] = path[i - 1] as Vec;
    const [k1, c1] = path[i] as Vec;
    if (k >= k0 && k <= k1) return c0 + ((c1 - c0) * (k - k0)) / (k1 - k0);
  }
  return Number.NaN;
}

/** The smallest of 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8 × 10^j that is at least x. */
export function niceCeil(x: number): number {
  const p = 10 ** Math.floor(Math.log10(x));
  const m = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * p >= x - 1e-9) ?? 10;
  return m * p;
}

/** The window: twice the golden-rule capital across, 1.5 times its consumption up. */
export function frameFor(delta: number): Frame {
  const g = goldenRule(delta);
  return { xMin: 0, xMax: niceCeil(2 * g.k), yMin: 0, yMax: niceCeil(1.5 * g.c) };
}

/** An arrow of a fixed length on the screen, from a point in the direction (sign k̇, sign ċ). */
function Arrow({ frame, at, dir }: { frame: Frame; at: Vec; dir: Vec }) {
  // Pixels per unit on each axis, so the arrow is 16 px long whatever the scales.
  const px = sx(frame, 1) - sx(frame, 0) || 1;
  const py = sy(frame, 0) - sy(frame, 1) || 1;
  const len = 16;
  const head = 5;
  const to: Vec = [at[0] + (dir[0] * len) / px, at[1] + (dir[1] * len) / py];
  // Barbs: back along the shaft and out to each side, in pixels.
  const barb = (sign: 1 | -1): Vec => [
    to[0] + (-dir[0] * head + sign * -dir[1] * head * 0.7) / px,
    to[1] + (-dir[1] * head + sign * dir[0] * head * 0.7) / py,
  ];
  return (
    <>
      <Segment frame={frame} from={at} to={to} tone="lilac" />
      <Segment frame={frame} from={barb(1)} to={to} tone="lilac" />
      <Segment frame={frame} from={barb(-1)} to={to} tone="lilac" />
    </>
  );
}

/**
 * Four points, one in each region cut out by the two loci, with their directions of motion. The
 * upper-right one sits between the hump and the saddle path, so the arrows do not cross the path;
 * the two on the left are left out when the region left of k* is too narrow to hold them.
 */
export function regionArrows(
  rho: number,
  delta: number,
  frame: Frame,
  path: Vec[],
): { at: Vec; dir: Vec }[] {
  const ss = steadyState(rho, delta);
  const left = 0.45 * ss.k;
  const right = ss.k + 0.6 * (frame.xMax - ss.k);
  const far = 0.82 * frame.xMax;
  const saddleFar = saddleConsumption(path, far);
  const ceiling = Number.isFinite(saddleFar) ? Math.min(saddleFar, frame.yMax) : frame.yMax;
  const saddleLeft = saddleConsumption(path, left);
  const roomLeft = sx(frame, ss.k) - sx(frame, 0) >= 44;
  const pts: Vec[] = [
    ...(roomLeft
      ? ([
          [left, Math.min(kDotZero(left, delta) + 0.3 * frame.yMax, 0.92 * frame.yMax)],
          [left, 0.45 * (Number.isFinite(saddleLeft) ? saddleLeft : kDotZero(left, delta))],
        ] as Vec[])
      : []),
    [far, kDotZero(far, delta) + 0.5 * (ceiling - kDotZero(far, delta))],
    [right, 0.45 * Math.max(kDotZero(right, delta), 0.3 * frame.yMax)],
  ];
  return pts.map((at) => {
    const v = ramseyFlow(rho, delta, at);
    return { at, dir: [Math.sign(v[0]), Math.sign(v[1])] as Vec };
  });
}

/** DO04: the Ramsey phase diagram in (k, c), with the two loci, the saddle path and the golden rule. */
export function RamseyPhaseDiagram() {
  const [rhoPct, setRhoPct] = useState(4);
  const [deltaPct, setDeltaPct] = useState(6);
  const rho = rhoPct / 100;
  const delta = deltaPct / 100;
  const frame = frameFor(delta);
  const ss = steadyState(rho, delta);
  const gold = goldenRule(delta);
  const path = saddlePath(rho, delta, 1e-3 * frame.xMax, 1.2 * frame.xMax);
  const k0 = START_SHARE * ss.k;
  const c0 = saddleConsumption(path, k0);
  const { lambda } = stableRoot(rho, delta);
  const arrows = regionArrows(rho, delta, frame, path);
  // The "ċ = 0" label goes right of the green line unless the golden-rule line is in the way.
  const labelRight = sx(frame, gold.k) - sx(frame, ss.k) > 44;
  const xTicks = [1, 2, 3, 4].map((i) => (i * frame.xMax) / 4);
  const yTicks = [1, 2].map((i) => (i * frame.yMax) / 2);

  return (
    <figure className="widget">
      <Plot
        frame={frame}
        xLabel="capital per worker k"
        yLabel="consumption c"
        xTicks={xTicks}
        yTicks={yTicks}
      >
        <Curve frame={frame} fn={(k) => kDotZero(k, delta)} from={0} />
        <Segment frame={frame} from={[ss.k, 0]} to={[ss.k, frame.yMax]} tone="green" />
        <Segment frame={frame} from={[gold.k, 0]} to={[gold.k, gold.c]} tone="lilac" dashed />
        <Curve frame={frame} fn={(k) => saddleConsumption(path, k)} tone="gold" />
        {arrows.map(({ at, dir }) => (
          <Arrow key={`h${at[0]},${at[1]}`} frame={frame} at={at} dir={[dir[0], 0]} />
        ))}
        {arrows.map(({ at, dir }) => (
          <Arrow key={`v${at[0]},${at[1]}`} frame={frame} at={at} dir={[0, dir[1]]} />
        ))}
        <Note
          frame={frame}
          x={labelRight ? ss.k + 0.015 * frame.xMax : ss.k - 0.015 * frame.xMax}
          y={0.05 * frame.yMax}
          anchor={labelRight ? 'start' : 'end'}
        >
          ċ = 0
        </Note>
        <Note
          frame={frame}
          x={0.98 * frame.xMax}
          y={kDotZero(0.98 * frame.xMax, delta) - 0.12 * frame.yMax}
          anchor="end"
        >
          k̇ = 0
        </Note>
        <Dot frame={frame} x={ss.k} y={ss.c} />
        {Number.isFinite(c0) && <Dot frame={frame} x={k0} y={c0} hollow />}
      </Plot>
      <Slider
        label="Rate of time preference ρ"
        value={rhoPct}
        min={2}
        max={10}
        step={0.5}
        onChange={setRhoPct}
        format={(v) => `${fmt(v, 1)} %`}
      />
      <Slider
        label="Depreciation δ"
        value={deltaPct}
        min={2}
        max={10}
        step={1}
        onChange={setDeltaPct}
        format={(v) => `${fmt(v, 0)} %`}
      />
      <Readout
        items={[
          ['Steady-state k*', fmt(ss.k)],
          ['Steady-state c*', fmt(ss.c)],
          ['Golden-rule k', fmt(gold.k)],
        ]}
      />
      <figcaption>
        Output per worker f(k) = 1.2k^(1/3), population growth n = 1 % and σ = 2. The lilac hump is
        the k̇ = 0 locus, c = f(k) − (n + δ)k: above it capital falls, below it capital grows. The
        green vertical line is the ċ = 0 locus at k* = {fmt(ss.k)}, where f′(k*) = ρ + δ: to its
        left consumption rises, to its right it falls, as the lilac arrows show. They cross at the
        steady state (filled dot). The gold curve is the saddle path, computed by running the
        equations backwards from the steady state: it is the only path that reaches the steady
        state. An economy that starts with k(0) = {fmt(k0)} must set consumption at c(0) = {fmt(c0)}{' '}
        (hollow dot) and then glide along it; near the steady state the gap shrinks at about{' '}
        {fmt(-100 * lambda, 1)} % a year. Starting above the gold curve eats up all the capital;
        starting below it piles up capital that is never consumed. Because ρ = {fmt(rhoPct, 1)} % is
        above n = 1 %, k* stays left of the dashed golden-rule capital {fmt(gold.k)}, the top of the
        hump.
      </figcaption>
    </figure>
  );
}
