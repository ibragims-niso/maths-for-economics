import { useState } from 'react';
import { Curve, fmt, Plot, Readout, Slider } from './kit';

// Topic DY04: the gap y(t) from equilibrium in y″ + a₁y′ + a₂y = 0, starting at y(0) = 1 at
// rest, y′(0) = 0. The default a₁ = 1, a₂ = 4.25 is the market of Example 3 (roots −0.5 ± 2i).
const T_MAX = 10;
const FRAME = { xMin: 0, xMax: T_MAX, yMin: -1.5, yMax: 1.5 };
const EPS = 1e-9;

export type Roots =
  | { kind: 'real'; r1: number; r2: number }
  | { kind: 'repeated'; r: number }
  | { kind: 'complex'; h: number; k: number };

/** The roots of r² + a₁r + a₂ = 0: two real ones (r1 > r2), a repeated one, or h ± ki. */
export function characteristicRoots(a1: number, a2: number): Roots {
  const disc = a1 * a1 - 4 * a2;
  if (Math.abs(disc) < EPS) return { kind: 'repeated', r: -a1 / 2 };
  if (disc > 0) {
    const s = Math.sqrt(disc);
    return { kind: 'real', r1: (-a1 + s) / 2, r2: (-a1 - s) / 2 };
  }
  return { kind: 'complex', h: -a1 / 2, k: Math.sqrt(-disc) / 2 };
}

/** The gap y(t) with y(0) = 1 and y′(0) = 0, from the solution formula for each kind of root. */
export function gapAt(a1: number, a2: number, t: number): number {
  const roots = characteristicRoots(a1, a2);
  if (roots.kind === 'real') {
    // A + B = 1 and r₁A + r₂B = 0.
    const { r1, r2 } = roots;
    const A = r2 / (r2 - r1);
    return A * Math.exp(r1 * t) + (1 - A) * Math.exp(r2 * t);
  }
  if (roots.kind === 'repeated') {
    // y = (A + Bt)e^(rt) with A = 1 and r·A + B = 0.
    return (1 - roots.r * t) * Math.exp(roots.r * t);
  }
  // y = e^(ht)(A cos kt + B sin kt) with A = 1 and hA + kB = 0.
  const { h, k } = roots;
  return Math.exp(h * t) * (Math.cos(k * t) - (h / k) * Math.sin(k * t));
}

/**
 * For complex roots the gap is R·e^(ht)·cos(kt − φ) with R = √(1 + (h/k)²), so it swings between
 * the envelope curves ±R·e^(ht). Returns R·e^(ht), or null when the roots are real.
 */
export function envelopeAt(a1: number, a2: number, t: number): number | null {
  const roots = characteristicRoots(a1, a2);
  if (roots.kind !== 'complex') return null;
  const { h, k } = roots;
  return Math.sqrt(1 + (h / k) ** 2) * Math.exp(h * t);
}

/** The time 2π/k of one full cycle, when the roots are complex. */
export function cyclePeriod(a1: number, a2: number): number | null {
  const roots = characteristicRoots(a1, a2);
  return roots.kind === 'complex' ? (2 * Math.PI) / roots.k : null;
}

export type Regime =
  | 'overdamped'
  | 'critically damped'
  | 'damped oscillation'
  | 'steady oscillation'
  | 'explosive oscillation'
  | 'explosive'
  | 'no pull back';

/** How the gap behaves, from the roots. */
export function regime(a1: number, a2: number): Regime {
  // a₂ = 0 makes one root 0; from a start at rest the path then stays where it is.
  if (Math.abs(a2) < EPS) return 'no pull back';
  const roots = characteristicRoots(a1, a2);
  if (roots.kind === 'complex') {
    if (Math.abs(roots.h) < EPS) return 'steady oscillation';
    return roots.h < 0 ? 'damped oscillation' : 'explosive oscillation';
  }
  const largest = roots.kind === 'real' ? roots.r1 : roots.r;
  if (Math.abs(largest) < EPS) return 'no pull back';
  if (largest > 0) return 'explosive';
  return roots.kind === 'real' ? 'overdamped' : 'critically damped';
}

/** The roots in words, e.g. "−1 and −2", "−2 (twice)", "−0.5 ± 2i". */
export function rootsText(a1: number, a2: number): string {
  const roots = characteristicRoots(a1, a2);
  if (roots.kind === 'real') return `${fmt(roots.r1)} and ${fmt(roots.r2)}`;
  if (roots.kind === 'repeated') return `${fmt(roots.r)} (twice)`;
  const h = Math.abs(roots.h) < EPS ? '' : `${fmt(roots.h)} `;
  return `${h}± ${fmt(roots.k)}i`;
}

/** Why the path behaves as it does, linked to the signs of a₁ and a₂. */
export function explainRegime(a1: number, a2: number): string {
  const kind = regime(a1, a2);
  const stable = a1 > 0 && a2 > 0;
  const signs = `a₁ = ${fmt(a1)} and a₂ = ${fmt(a2)}`;
  const verdict = stable
    ? `Here ${signs} are both positive, so both roots have negative real parts and the gap dies out.`
    : `Here ${signs} are not both positive, so at least one root has a real part ≥ 0 and the gap does not die out.`;
  const story: Record<Regime, string> = {
    overdamped:
      'Strong damping (a₁² > 4a₂): two negative real roots, so the path glides back to equilibrium without crossing it.',
    'critically damped':
      'The boundary case a₁² = 4a₂: one repeated root; for this stiffness it is the fastest return that does not overshoot.',
    'damped oscillation':
      'Weak damping (a₁² < 4a₂): complex roots, so the path overshoots and cycles, and each swing is smaller than the last.',
    'steady oscillation':
      'No damping (a₁ = 0): the roots are purely imaginary, so the path cycles for ever with the same swings.',
    'explosive oscillation':
      'Negative damping (a₁ < 0): the real part of the complex roots is positive, so the swings grow.',
    explosive:
      'A positive real root: the term with e^(rt), r > 0, grows without limit and the path runs away.',
    'no pull back':
      'With a₂ = 0 one root is 0: nothing pulls the variable back, so a gap is never closed.',
  };
  return `${story[kind]} ${verdict}`;
}

/** DY04: damping a₁ and stiffness a₂ decide whether a gap from equilibrium dies out, cycles or explodes. */
export function SecondOrderDamping() {
  const [a1, setA1] = useState(1);
  const [a2, setA2] = useState(4.25);
  const period = cyclePeriod(a1, a2);

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="time t"
        yLabel="gap y − y*"
        xTicks={[0, 2, 4, 6, 8, 10]}
        yTicks={[-1, 0, 1]}
      >
        {period !== null && (
          <>
            <Curve frame={FRAME} fn={(t) => envelopeAt(a1, a2, t) ?? 0} tone="green" dashed />
            <Curve frame={FRAME} fn={(t) => -(envelopeAt(a1, a2, t) ?? 0)} tone="green" dashed />
          </>
        )}
        <Curve frame={FRAME} fn={(t) => gapAt(a1, a2, t)} />
      </Plot>
      <Slider label="Damping a₁" value={a1} min={-1} max={5} step={0.25} onChange={setA1} />
      <Slider label="Stiffness a₂" value={a2} min={-1} max={6} step={0.25} onChange={setA2} />
      <Readout
        items={[
          ['Roots', rootsText(a1, a2)],
          ['Regime', regime(a1, a2)],
          ['Period 2π/k', period === null ? 'no cycle' : fmt(period)],
        ]}
      />
      <figcaption>
        The lilac curve is the gap from equilibrium in y″ + a₁y′ + a₂y = 0, starting at 1 and at
        rest
        {period !== null && '; the dashed green curves are the envelope, proportional to e^(ht)'}.{' '}
        {explainRegime(a1, a2)}
      </figcaption>
    </figure>
  );
}
