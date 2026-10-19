import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'price' | 'inventory' | 'output';

interface Params {
  context: Context;
  /** Damping a₁ > 0 in y″ + a₁y′ + a₂y = b. */
  a1: number;
  /** Stiffness a₂ > a₁²/4, so the roots are complex. */
  a2: number;
  /** The steady state (0 for the output gap). */
  steady: number;
}

const PERIOD = { tolerance: 0.01, relTolerance: 0.002 } as const;

/** The frequency k = √(4a₂ − a₁²)/2 of the roots h ± ki. */
const frequency = (p: Params) => Math.sqrt(4 * p.a2 - p.a1 ** 2) / 2;
/** The period 2π/k of one full cycle. */
const period = (p: Params) => round((2 * Math.PI) / frequency(p), 2);
const b = (p: Params) => round(p.a2 * p.steady, 6);

const candidates = (p: Params) => [
  { value: round((2 * Math.PI) / Math.sqrt(p.a2), 2), mistakeCode: 'IGNORED_DAMPING' },
  { value: round(frequency(p), 2), mistakeCode: 'FREQUENCY_NOT_PERIOD' },
  {
    value: round((2 * Math.PI) / Math.sqrt(4 * p.a2 - p.a1 ** 2), 2),
    mistakeCode: 'DISCRIMINANT_NOT_HALVED',
  },
];

const LETTER: Record<Context, string> = { price: 'P', inventory: 'N', output: 'x' };
const UNIT: Record<Context, string> = { price: 'weeks', inventory: 'months', output: 'quarters' };

/** A coefficient in front of a term: "3", or nothing for 1. */
const coef = (x: number) => (x === 1 ? '' : num(x));

function stem(p: Params): string {
  const y = LETTER[p.context];
  const eq = `\\ddot ${y} + ${coef(p.a1)}\\,\\dot ${y} + ${coef(p.a2)}\\,${y} = ${num(b(p))}`;
  const setting = {
    price: `Traders who react to the trend of a price make it follow $${eq}$, with time in weeks.`,
    inventory: `A firm that reacts to its stock of goods $N$ with a delay makes the stock follow $${eq}$, with time in months.`,
    output: `In a simple model of the business cycle the output gap $x$ (in % of potential output) follows $${eq}$, with time in quarters.`,
  }[p.context];
  return `${setting} The path oscillates around its steady state while it settles. How long is one full cycle, from one peak to the next? Give your answer in ${UNIT[p.context]} to 2 decimal places.`;
}

/** DY04, difficulty 3: the period 2π/k of a damped cycle, where h ± ki are the complex roots. */
export const dampedCyclePeriod: Generator<Params> = {
  id: 'damped-cycle-period',
  title: 'Period of a damped cycle',
  topicId: 'DY04',
  difficulty: 3,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const context = rng.pick(['price', 'inventory', 'output'] as const);
      const a1 = rng.int(1, 20) / 10;
      const a2 = rng.int(1, 40) / 4;
      const steady =
        context === 'output' ? 0 : context === 'price' ? rng.int(5, 120) : rng.int(4, 60) * 5;
      const p: Params = { context, a1, a2, steady };
      // Complex roots, with a cycle between 1 and 40 time units.
      if (4 * a2 - a1 ** 2 <= 0.04) continue;
      const T = period(p);
      if (T < 1 || T > 40) continue;
      // The swings stay visible: one cycle shrinks them to no less than 2 % (e^(hT) ≥ 0.02).
      if (Math.exp((-a1 / 2) * ((2 * Math.PI) / frequency(p))) < 0.02) continue;
      // Every mistake lands clearly away from the answer (at least 3 % off).
      if (candidates(p).some((c) => Math.abs(c.value - T) < 0.03 * T)) continue;
      const kept = cleanDistractors(T, candidates(p), PERIOD.tolerance, PERIOD.relTolerance);
      if (kept.length < 3) continue;
      return p;
    }
  },

  stem,

  answer: (p) => ({ kind: 'numeric', value: period(p), decimals: 2, ...PERIOD }),

  steps(p) {
    const disc = round(p.a1 ** 2 - 4 * p.a2, 6);
    const k = frequency(p);
    const h = -p.a1 / 2;
    return [
      {
        text: 'Write the characteristic equation and its discriminant.',
        latex: `r^2 + ${coef(p.a1)}\\,r + ${num(p.a2)} = 0, \\qquad ${num(p.a1)}^2 - 4 \\cdot ${num(p.a2)} = ${num(disc, 4)} < 0`,
        why: 'A negative discriminant means the roots are a complex pair h ± ki, and complex roots are what make the path oscillate.',
        result: disc,
      },
      {
        text: 'Split the roots into a real part h and an imaginary part k.',
        latex: `r = \\dfrac{-${num(p.a1)} \\pm \\sqrt{${num(disc, 4)}}}{2} = ${num(h, 3)} \\pm ${num(k, 4)}\\,i, \\qquad k = \\dfrac{\\sqrt{${num(-disc, 4)}}}{2} = ${num(k, 4)}`,
        why: `The real part h = −a₁/2 = ${num(h, 3).replace('-', '−')} is negative, so the swings shrink like e^(ht); the imaginary part k sets how fast the path turns, through cos kt and sin kt.`,
        result: k,
      },
      {
        text: 'One full cycle is when kt has grown by 2π.',
        latex: `T = \\dfrac{2\\pi}{k} = \\dfrac{2\\pi}{${num(k, 4)}} = ${num(period(p))}`,
        why: 'cos kt and sin kt repeat when kt increases by 2π, so the time between two peaks is 2π/k; the factor e^(ht) only shrinks the swings, it does not change their timing.',
        result: period(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(period(p), candidates(p), PERIOD.tolerance, PERIOD.relTolerance),
};
