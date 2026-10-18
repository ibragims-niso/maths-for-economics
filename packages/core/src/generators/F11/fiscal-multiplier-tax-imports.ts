import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Marginal propensity to consume out of disposable income, e.g. 0.8. */
  b: number;
  /** Proportional income tax rate, e.g. 0.25. */
  t: number;
  /** Marginal propensity to import; 0 for a closed economy. */
  m: number;
  /** Rise in government spending. */
  change: number;
}

const MPC_PCT = [60, 70, 75, 80, 90] as const;
const TAX_PCT = [10, 15, 20, 25, 30, 40] as const;
const IMPORT_PCT = [5, 10, 15, 20] as const;

const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
const pct = (x: number) => Math.round(x * 100);

/** The leakage share 1 − b(1 − t) + m from rates in per cent, times 10,000 so it is whole. */
const leakFromPct = (bPct: number, tPct: number, mPct: number) =>
  10000 - bPct * (100 - tPct) + 100 * mPct;
const leak10k = (p: Params) => leakFromPct(pct(p.b), pct(p.t), pct(p.m));
/** ΔY = ΔG/(1 − b(1 − t) + m), in whole-number arithmetic so the result is exact. */
const rise = (p: Params) => (p.change * 10000) / leak10k(p);

/** F11, difficulty 2: change in equilibrium income after ΔG with income tax (and imports). */
export const fiscalMultiplierTaxImports: Generator<Params> = {
  id: 'fiscal-multiplier-tax-imports',
  title: 'Effect of extra government spending',
  topicId: 'F11',
  difficulty: 2,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const bPct = rng.pick(MPC_PCT);
      const tPct = rng.pick(TAX_PCT);
      const mPct = rng.int(0, 1) === 0 ? 0 : rng.pick(IMPORT_PCT);
      const leak = leakFromPct(bPct, tPct, mPct);
      // ΔY = ΔG · 10,000 / leak is whole when ΔG is a multiple of `step`; skip awkward steps.
      const step = leak / gcd(leak, 10000);
      if (step > 40) continue;
      const change = step * rng.int(Math.ceil(10 / step), Math.floor(300 / step));
      return { b: bPct / 100, t: tPct / 100, m: mPct / 100, change };
    }
  },

  stem: (p) =>
    p.m === 0
      ? `In a closed economy households spend a share $b = ${num(p.b)}$ of any extra disposable income, and income is taxed at the rate $t = ${num(p.t)}$. The government raises its spending by $${num(p.change)}$ (billion). By how much does equilibrium income rise?`
      : `Households spend a share $b = ${num(p.b)}$ of any extra disposable income, income is taxed at the rate $t = ${num(p.t)}$, and imports are $M = ${num(p.m)}Y$. The government raises its spending by $${num(p.change)}$ (billion). By how much does equilibrium income rise?`,

  answer: (p) => ({ kind: 'numeric', value: rise(p), decimals: 0 }),

  steps(p) {
    const leak = leak10k(p) / 10000;
    const spent = 1 - leak;
    const exact = 1000000 % leak10k(p) === 0; // does 1/leak stop after 2 decimals?
    const imports = p.m === 0 ? '' : ` - ${num(p.m)}`;
    return [
      {
        text: 'Find how much of an extra unit of income is spent again on home-produced goods.',
        latex: `${num(p.b)}(1 - ${num(p.t)})${imports} = ${num(spent, 4)}`,
        why:
          p.m === 0
            ? 'Households keep 1 − t of each extra unit after tax and spend the share b of what they keep.'
            : 'Households keep 1 − t of each extra unit after tax and spend the share b of it; the share m spent on imports becomes income abroad, not at home.',
        result: round(spent, 4),
      },
      {
        text: 'Work out the multiplier.',
        latex: `k = \\dfrac{1}{1 - ${num(spent, 4)}} = \\dfrac{1}{${num(leak, 4)}} ${exact ? '=' : '\\approx'} ${num(1 / leak)}`,
        why: 'Each round of spending is the previous round times the re-spent share, so the rounds form a geometric series: together they are 1/(1 − ratio) times the first round.',
        result: round(1 / leak, 2),
      },
      {
        text: 'Multiply the extra government spending by the multiplier.',
        latex: `\\Delta Y = \\dfrac{${num(p.change)}}{${num(leak, 4)}} = ${num(rise(p))}`,
        why: 'The extra spending is the first round of new income and the multiplier adds up all later rounds. Dividing by the leakage share is the same as multiplying by k, without rounding k first.',
        result: rise(p),
      },
    ];
  },

  distractors(p) {
    const imports =
      p.m === 0
        ? []
        : [
            {
              value: round(p.change / (1 - p.b * (1 - p.t)), 2),
              mistakeCode: 'IGNORED_IMPORTS',
            },
          ];
    return cleanDistractors(rise(p), [
      { value: round(p.change / (1 - p.b), 2), mistakeCode: 'SIMPLE_MULTIPLIER' },
      { value: round(p.change / (1 - p.b * p.t + p.m), 2), mistakeCode: 'TAX_NOT_COMPLEMENT' },
      ...imports,
      { value: p.change, mistakeCode: 'NO_MULTIPLIER' },
    ]);
  },
};
