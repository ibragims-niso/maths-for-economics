import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** What is searched for: an IRR in per cent or an equilibrium price. */
  context: 'irr' | 'price';
  /** The starting interval [lo, hi], whole numbers. */
  lo: number;
  hi: number;
  /** The tolerance ε in thousandths (1 = 0.001, 50 = 0.05), so all checks use whole numbers. */
  epsMilli: number;
}

const EPS_MILLI = [1, 5, 10, 50, 100] as const;

/** (b − a)/ε as a fraction: numerator over epsMilli. */
const ratioNumerator = (p: Params) => (p.hi - p.lo) * 1000;

/** Smallest n with base^n · epsMilli ≥ target, in whole numbers (no logarithms, no rounding). */
const smallestPower = (base: number, target: number, epsMilli: number) => {
  let n = 0;
  let power = 1;
  while (power * epsMilli < target) {
    power *= base;
    n++;
  }
  return n;
};

/** The smallest n with (b − a)/2ⁿ ≤ ε. */
export const stepsNeeded = (p: Params) => smallestPower(2, ratioNumerator(p), p.epsMilli);

const eps = (p: Params) => p.epsMilli / 1000;
const ratio = (p: Params) => ratioNumerator(p) / p.epsMilli;

function candidates(p: Params) {
  return [
    { value: stepsNeeded(p) - 1, mistakeCode: 'STEPS_ROUNDED_DOWN' },
    { value: smallestPower(10, ratioNumerator(p), p.epsMilli), mistakeCode: 'LOG_BASE_10' },
    { value: smallestPower(2, 1000, p.epsMilli), mistakeCode: 'IGNORED_INTERVAL_WIDTH' },
  ];
}

/** NM01, difficulty 1: the number of bisection steps needed to shrink an interval below a tolerance. */
export const bisectionStepsForTolerance: Generator<Params> = {
  id: 'bisection-steps-for-tolerance',
  title: 'Bisection steps for a tolerance',
  topicId: 'NM01',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['irr', 'price'] as const);
      const lo = context === 'irr' ? 0 : rng.int(1, 40);
      const hi = context === 'irr' ? rng.int(8, 40) : lo + rng.int(3, 60);
      const p: Params = { context, lo, hi, epsMilli: rng.pick(EPS_MILLI) };
      const n = stepsNeeded(p);
      // (b − a)/ε must not be a power of 2, so rounding log₂ up or down gives different answers.
      if (2 ** (n - 1) * p.epsMilli >= ratioNumerator(p)) continue;
      if (n < 4 || n > 20) continue;
      return p;
    }
  },

  stem: (p) =>
    p.context === 'irr'
      ? `An analyst finds the internal rate of return of a project by bisection on the net present value, starting from the interval $[${num(p.lo)}\\%, ${num(p.hi)}\\%]$, where the NPV changes sign. How many bisection steps are needed to make sure the interval that is left is no wider than $${num(eps(p), 3)}$ percentage points?`
      : `Excess demand for a good is positive at a price of $${num(p.lo)}$ and negative at $${num(p.hi)}$. How many bisection steps on $[${num(p.lo)}, ${num(p.hi)}]$ are needed to make sure the interval that is left, which contains the equilibrium price, is no wider than $${num(eps(p), 3)}$?`,

  answer: (p) => ({ kind: 'numeric', value: stepsNeeded(p), decimals: 0 }),

  steps(p) {
    const n = stepsNeeded(p);
    const w = p.hi - p.lo;
    return [
      {
        text: 'Write the width after n steps.',
        latex: `\\text{width after } n \\text{ steps} = \\dfrac{b - a}{2^n} = \\dfrac{${num(w)}}{2^n}`,
        why: 'Each step keeps one half of the interval, so the width halves every time.',
      },
      {
        text: 'Require this width to be at most ε and rearrange.',
        latex: `\\dfrac{${num(w)}}{2^n} \\le ${num(eps(p), 3)} \\iff 2^n \\ge \\dfrac{${num(w)}}{${num(eps(p), 3)}} = ${num(ratio(p))}`,
        why: 'Multiplying both sides by 2ⁿ/ε (both positive) keeps the direction of the inequality.',
        result: ratio(p),
      },
      {
        text: 'Find the smallest whole n with 2ⁿ at least this large.',
        latex: `2^{${n - 1}} = ${num(2 ** (n - 1))} < ${num(ratio(p))} \\le 2^{${n}} = ${num(2 ** n)} \\;\\Rightarrow\\; n = ${n}`,
        why: `log₂ of ${ratio(p)} lies between ${n - 1} and ${n}; steps come in whole numbers, so round up: ${n - 1} steps leave the interval slightly too wide.`,
        result: n,
      },
    ];
  },

  distractors: (p) => cleanDistractors(stepsNeeded(p), candidates(p)),
};
