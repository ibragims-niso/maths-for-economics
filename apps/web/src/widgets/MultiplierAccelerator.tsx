import { useState } from 'react';
import { Dot, fmt, Plot, Readout, Segment, Slider } from './kit';

// Topic DY02, Example 3: Samuelson's multiplier–accelerator with c = 0.5 and v = 1. Income starts
// at its old equilibrium (an index of 100) in periods 0 and 1, and government spending is 10 %
// higher from period 2 on, so the new equilibrium is 110 whatever c and v are.
export const PERIODS = 30;
const OLD = 100;
const NEW = 110;
const FRAME = { xMin: 0, xMax: PERIODS, yMin: 95, yMax: 125 };

/** The coefficients of Y(t) = k₁·Y(t − 1) − k₂·Y(t − 2) + G: k₁ = c(1 + v), k₂ = cv. */
export const samuelsonCoefficients = (c: number, v: number) => ({ k1: c * (1 + v), k2: c * v });

/** Y(0), …, Y(30): the old equilibrium twice, then the model with G raised by 10 %. */
export function incomePath(c: number, v: number, periods = PERIODS): number[] {
  const { k1, k2 } = samuelsonCoefficients(c, v);
  const g = (1 - c) * NEW;
  const y = [OLD, OLD];
  for (let t = 2; t <= periods; t++) y.push(k1 * (y[t - 1] ?? OLD) - k2 * (y[t - 2] ?? OLD) + g);
  return y;
}

export type Roots =
  | { kind: 'real'; r1: number; r2: number }
  | { kind: 'repeated'; r: number }
  | { kind: 'complex'; re: number; im: number; modulus: number; angle: number };

/** The roots of r² − c(1 + v)r + cv = 0 (the characteristic equation of the model). */
export function characteristicRoots(c: number, v: number): Roots {
  const { k1, k2 } = samuelsonCoefficients(c, v);
  const d = k1 * k1 - 4 * k2;
  if (Math.abs(d) < 1e-9) return { kind: 'repeated', r: k1 / 2 };
  if (d > 0) return { kind: 'real', r1: (k1 + Math.sqrt(d)) / 2, r2: (k1 - Math.sqrt(d)) / 2 };
  const modulus = Math.sqrt(k2);
  return {
    kind: 'complex',
    re: k1 / 2,
    im: Math.sqrt(-d) / 2,
    modulus,
    angle: Math.acos(k1 / 2 / modulus),
  };
}

/** The size of the largest root; it decides whether the path settles (below 1) or not. */
export function largestRoot(roots: Roots): number {
  if (roots.kind === 'repeated') return Math.abs(roots.r);
  if (roots.kind === 'complex') return roots.modulus;
  return Math.max(Math.abs(roots.r1), Math.abs(roots.r2));
}

/** The roots as text: "0.5 ± 0.5i", "0.78 and 0.1", "1.5 twice". */
export function rootsText(roots: Roots): string {
  if (roots.kind === 'repeated') return `${fmt(roots.r)} twice`;
  if (roots.kind === 'real') return `${fmt(roots.r1)} and ${fmt(roots.r2)}`;
  return `${fmt(roots.re)} ± ${fmt(roots.im)}i`;
}

/** Periods per full cycle, 2π/θ, when the roots are complex; null otherwise. */
export const cycleLength = (roots: Roots) =>
  roots.kind === 'complex' ? (2 * Math.PI) / roots.angle : null;

export type Regime =
  | 'monotone convergence'
  | 'damped cycle'
  | 'regular cycle'
  | 'explosive cycle'
  | 'explosive growth';

/** Samuelson's four regimes (and the borderline cv = 1), from the kind and size of the roots. */
export function regime(c: number, v: number): Regime {
  const roots = characteristicRoots(c, v);
  const size = largestRoot(roots);
  if (roots.kind !== 'complex') return size < 1 ? 'monotone convergence' : 'explosive growth';
  if (Math.abs(size - 1) < 1e-9) return 'regular cycle';
  return size < 1 ? 'damped cycle' : 'explosive cycle';
}

/** The first period in which income leaves the graph (below 95 or above 125), or null. */
export function firstExit(path: number[]): number | null {
  const t = path.findIndex((y) => y < FRAME.yMin || y > FRAME.yMax);
  return t === -1 ? null : t;
}

/** How far income rises above the new equilibrium of 110 at its highest point. */
export const overshoot = (path: number[]) => Math.max(...path) - NEW;

/** Below this overshoot the waves of a damped cycle are too small to see on the graph. */
export const VISIBLE = 0.5;

const FAINT_CYCLE =
  'Here the roots are only just complex: in theory income swings round 110, but the waves are so small that the path looks smooth. Raise v to see them.';

const REGIME_TEXT: Record<Regime, string> = {
  'monotone convergence':
    'Here the roots are real and below 1: investment reacts too little to start a cycle, and income climbs to 110 without swinging around it.',
  'damped cycle':
    'Here the roots are complex with size below 1 (cv < 1): income overshoots 110, falls back below it and swings round it in ever smaller waves.',
  'regular cycle':
    'Here cv = 1, so the complex roots have size exactly 1: the waves keep the same size for ever.',
  'explosive cycle':
    'Here the roots are complex with size above 1 (cv > 1): every boom and every slump is bigger than the one before.',
  'explosive growth':
    'Here the roots are real and the larger one is above 1: investment feeds on itself and income runs away upwards without turning.',
};

/** DY02: Samuelson's multiplier–accelerator. Change c and v and see income settle, cycle or explode. */
export function MultiplierAccelerator() {
  const [c, setC] = useState(0.5);
  const [v, setV] = useState(1);
  const path = incomePath(c, v);
  const roots = characteristicRoots(c, v);
  const kind = regime(c, v);
  const length = cycleLength(roots);
  const exit = firstExit(path);
  const periods = path.slice(1).map((y, t) => ({
    id: `period${t + 1}`,
    from: [t, path[t] ?? OLD] as [number, number],
    to: [t + 1, y] as [number, number],
  }));
  const cycle = length === null ? '' : ` One full wave lasts about ${fmt(length, 1)} periods.`;
  const leaves = exit === null ? '' : ` Income leaves the graph in period ${exit}.`;

  return (
    <figure className="widget">
      <Plot
        frame={FRAME}
        xLabel="period t"
        yLabel="income Yₜ"
        xTicks={[0, 10, 20, 30]}
        yTicks={[95, 100, 105, 110, 115, 120, 125]}
      >
        <Segment frame={FRAME} from={[0, NEW]} to={[PERIODS, NEW]} tone="green" dashed />
        {periods.map((p) => (
          <Segment key={p.id} frame={FRAME} from={p.from} to={p.to} />
        ))}
        <Dot frame={FRAME} x={0} y={OLD} />
      </Plot>
      <Slider
        label="Marginal propensity to consume c"
        value={c}
        min={0.1}
        max={0.95}
        step={0.05}
        onChange={setC}
      />
      <Slider label="Accelerator v" value={v} min={0} max={4} step={0.1} onChange={setV} />
      <Readout
        items={[
          ['Roots r', rootsText(roots)],
          ['Largest |r|', fmt(largestRoot(roots))],
          ['Path', kind],
        ]}
      />
      <figcaption>
        Income (gold) as an index: 100 is the old equilibrium, and government spending is 10 %
        higher from period 2 on, so the new equilibrium is 110 (dashed). A rise in income raises
        consumption, and firms invest v times the rise in consumption; when income growth slows,
        that investment falls away and pulls income back, which is how cycles arise.{' '}
        {kind === 'damped cycle' && overshoot(path) < VISIBLE ? FAINT_CYCLE : REGIME_TEXT[kind]}
        {cycle}
        {leaves}
      </figcaption>
    </figure>
  );
}
