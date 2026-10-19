import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Buyers spend a fixed amount A: demand A/p. */
  spend: number;
  /** Supply s·p + t. */
  s: number;
  t: number;
  /** Starting interval [low, low + width]. */
  low: number;
  width: number;
  /** Number of bisection steps. */
  k: number;
}

/** Midpoints are multiples of 0.25, so the answer is exact to 2 decimals. */
const PRICE = { tolerance: 0.005, relTolerance: 0 } as const;
/** Every point where Z is evaluated stays this far from the root, so its sign is clear. */
const MARGIN = 0.05;

/** Excess demand Z(p) = A/p − (s·p + t): positive when the price is too low. */
export const excessDemand = (p: Params, price: number) => p.spend / price - (p.s * price + p.t);

/** The equilibrium price, the positive root of s·p² + t·p − A = 0. */
export const equilibriumRoot = (p: Params) =>
  (-p.t + Math.sqrt(p.t * p.t + 4 * p.s * p.spend)) / (2 * p.s);

export interface BisectionRun {
  /** The midpoints tested, one per step. */
  tested: number[];
  /** The interval left after the k steps. */
  lo: number;
  hi: number;
}

/**
 * Runs k steps of bisection. The correct rule keeps the half on which Z changes sign
 * (Z(m) > 0: the price is too low, keep [m, hi]); `reversed` keeps the other half.
 */
export function bisect(p: Params, reversed = false): BisectionRun {
  let lo = p.low;
  let hi = p.low + p.width;
  const tested: number[] = [];
  for (let j = 0; j < p.k; j++) {
    const m = (lo + hi) / 2;
    tested.push(m);
    const goRight = excessDemand(p, m) > 0;
    if (goRight !== reversed) lo = m;
    else hi = m;
  }
  return { tested, lo, hi };
}

const estimate = (p: Params) => {
  const { lo, hi } = bisect(p);
  return (lo + hi) / 2;
};

const zText = (p: Params, price: number) => num(round(excessDemand(p, price), 2));
const supply = (p: Params) => `${p.s === 1 ? '' : num(p.s)}p${p.t > 0 ? ` + ${num(p.t)}` : ''}`;

/** AN03, difficulty 3: the bisection estimate of the equilibrium price after k steps on excess demand (intermediate value theorem). */
export const bisectionEquilibriumMidpoint: Generator<Params> = {
  id: 'bisection-equilibrium-midpoint',
  title: 'Bisection for an equilibrium price',
  topicId: 'AN03',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const width = rng.pick([2, 4, 8, 16] as const);
      // The final midpoint is a multiple of width / 2^(k+1) ≥ 0.25, so 2 decimals suffice.
      const k = width === 2 ? 2 : rng.int(2, 3);
      const low = rng.int(2, 30);
      const s = rng.int(1, 6);
      const t = rng.int(0, 8) * 5;
      const target = low + (rng.int(5, 95) / 100) * width;
      const p: Params = {
        spend: Math.round(target * (s * target + t)),
        s,
        t,
        low,
        width,
        k,
      };
      const root = equilibriumRoot(p);
      const run = bisect(p);
      const points = [p.low, p.low + p.width, ...run.tested, estimate(p)];
      if (points.some((x) => Math.abs(x - root) < MARGIN)) continue;
      if (!(root > p.low && root < p.low + p.width)) continue;
      if ([p.low, p.low + p.width, ...run.tested].some((x) => Math.abs(excessDemand(p, x)) < 0.5))
        continue;
      return p;
    }
  },

  stem: (p) =>
    `Buyers spend ${num(p.spend)} on a good whatever its price, so demand is $D(p) = \\dfrac{${num(p.spend)}}{p}$; supply is $S(p) = ${supply(p)}$. Excess demand $Z(p) = D(p) - S(p)$ is positive at $p = ${num(p.low)}$ and negative at $p = ${num(p.low + p.width)}$. Run ${p.k} steps of bisection on $[${num(p.low)}, ${num(p.low + p.width)}]$: each step evaluates $Z$ at the midpoint and keeps the half on which $Z$ changes sign. What is the midpoint of the interval left after ${p.k} steps?`,

  answer: (p) => ({ kind: 'numeric', value: estimate(p), decimals: 2, ...PRICE }),

  steps(p) {
    const hiStart = p.low + p.width;
    const run = bisect(p);
    let lo = p.low;
    let hi = hiStart;
    const stepLines = run.tested.map((m, j) => {
      const z = excessDemand(p, m);
      if (z > 0) lo = m;
      else hi = m;
      return {
        text: `Step ${j + 1}: test the midpoint ${m}.`,
        latex: `Z(${num(m)}) = ${zText(p, m)} ${z > 0 ? '> 0' : '< 0'} \\Rightarrow [${num(lo)}, ${num(hi)}]`,
        why:
          z > 0
            ? 'Excess demand is still positive, so the price is too low and the sign change, the equilibrium, lies in the right half.'
            : 'Excess demand is negative, so the price is too high and the sign change, the equilibrium, lies in the left half.',
        result: m,
      };
    });
    return [
      {
        text: 'Check the signs at the ends: an equilibrium lies inside.',
        latex: `Z(${num(p.low)}) = ${zText(p, p.low)} > 0, \\quad Z(${num(hiStart)}) = ${zText(p, hiStart)} < 0`,
        why: 'Z is continuous for p > 0 and changes sign on the interval, so by the intermediate value theorem Z(p*) = 0 at some p* between the ends.',
        result: round(excessDemand(p, p.low), 2),
      },
      ...stepLines,
      {
        text: 'Take the midpoint of the last interval.',
        latex: `\\dfrac{${num(run.lo)} + ${num(run.hi)}}{2} = ${num(estimate(p))}`,
        why: `The equilibrium lies in [${run.lo}, ${run.hi}], so its midpoint is within half the width, ${(run.hi - run.lo) / 2}, of the equilibrium price.`,
        result: estimate(p),
      },
    ];
  },

  distractors(p) {
    const run = bisect(p);
    const lastTested = run.tested[run.tested.length - 1] ?? Number.NaN;
    const otherEnd = run.lo === lastTested ? run.hi : run.lo;
    const wrong = bisect(p, true);
    return cleanDistractors(
      estimate(p),
      [
        { value: lastTested, mistakeCode: 'ONE_STEP_SHORT' },
        { value: otherEnd, mistakeCode: 'ENDPOINT_NOT_MIDPOINT' },
        { value: (wrong.lo + wrong.hi) / 2, mistakeCode: 'WRONG_HALF' },
        { value: round(equilibriumRoot(p), 2), mistakeCode: 'EXACT_ROOT' },
      ],
      PRICE.tolerance,
      PRICE.relTolerance,
    );
  },
};
