import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Marginal propensity to consume c, in hundredths (50 means 0.5). */
  cPct: number;
  /** Accelerator v, in tenths (10 means 1). */
  vTenths: number;
  /** Equilibrium income before the change, a multiple of 100 so that G = (1 − c)Y is whole. */
  yOld: number;
  /** The permanent rise in government spending from period 2 on. */
  rise: number;
  /** The period asked for (3 or 4). */
  n: number;
}

const VALUE = { tolerance: 0.01, relTolerance: 0.0005 } as const;
const MPCS = [50, 60, 75, 80, 90] as const;
const ACCELERATORS = [5, 10, 15, 20, 25, 30, 40] as const;

const mpc = (p: Params) => p.cPct / 100;
const accel = (p: Params) => p.vTenths / 10;
const gOld = (p: Params) => (p.yOld * (100 - p.cPct)) / 100;
const gNew = (p: Params) => gOld(p) + p.rise;

/**
 * Y(0), …, Y(n) from Y(t) = k₁·Y(t − 1) − k₂·Y(t − 2) + G, starting at the old equilibrium in
 * periods 0 and 1 with the new G from period 2. The model has k₁ = c(1 + v) and k₂ = cv.
 */
function path(p: Params, k1: number, k2: number): number[] {
  const y = [p.yOld, p.yOld];
  for (let t = 2; t <= p.n; t++) y.push(k1 * (y[t - 1] ?? 0) - k2 * (y[t - 2] ?? 0) + gNew(p));
  return y;
}
const correct = (p: Params) => path(p, mpc(p) * (1 + accel(p)), mpc(p) * accel(p));
const income = (p: Params) => round(correct(p)[p.n] ?? 0, 2);

const candidates = (p: Params) => [
  // No accelerator (v = 0): Y(t) = c·Y(t − 1) + G, the plain multiplier of DY01.
  { value: round(path(p, mpc(p), 0)[p.n] ?? 0, 2), mistakeCode: 'NO_ACCELERATOR' },
  // Investment reacting to the change in income, I(t) = v(Y(t − 1) − Y(t − 2)).
  {
    value: round(path(p, mpc(p) + accel(p), accel(p))[p.n] ?? 0, 2),
    mistakeCode: 'ACCEL_ON_INCOME',
  },
  { value: round(gNew(p) / (1 - mpc(p)), 2), mistakeCode: 'STEADY_STATE_ONLY' },
  { value: round(correct(p)[p.n - 1] ?? 0, 2), mistakeCode: 'ONE_PERIOD_SHORT' },
];

/** DY02, difficulty 3: income in period n of the Samuelson multiplier–accelerator after a rise in G. */
export const multiplierAcceleratorIncome: Generator<Params> = {
  id: 'multiplier-accelerator-income',
  title: 'Multiplier–accelerator income',
  topicId: 'DY02',
  difficulty: 3,
  timeSec: 180,

  params(rng) {
    for (;;) {
      const cPct = rng.pick(MPCS);
      const vTenths = rng.pick(ACCELERATORS);
      const yOld = rng.int(1, 30) * 100;
      const gBefore = (yOld * (100 - cPct)) / 100;
      // A rise of 5 % to 30 % in government spending, as a whole number.
      const rise = rng.int(
        Math.max(1, Math.ceil(0.05 * gBefore)),
        Math.max(2, Math.floor(0.3 * gBefore)),
      );
      const n = rng.int(3, 4);
      const p: Params = { cPct, vTenths, yOld, rise, n };
      if (
        cleanDistractors(income(p), candidates(p), VALUE.tolerance, VALUE.relTolerance).length < 4
      )
        continue;
      return p;
    }
  },

  stem: (p) =>
    `In a multiplier–accelerator model, consumption is $C_t = ${num(mpc(p))}\\,Y_{t-1}$, investment is $I_t = ${num(accel(p))}\\,(C_t - C_{t-1})$ and income is $Y_t = C_t + I_t + G$. The economy has been in equilibrium with $G = ${num(gOld(p))}$ and $Y_0 = Y_1 = ${num(p.yOld)}$. From period 2 on, government spending is permanently $${num(gNew(p))}$. What is income in period ${p.n}? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: income(p), decimals: 2, ...VALUE }),

  steps(p) {
    const c = mpc(p);
    const v = accel(p);
    const k1 = c * (1 + v);
    const k2 = c * v;
    const y = correct(p);
    const rounds = y.slice(2).map((x, i) => {
      const t = i + 2;
      return `Y_${t} = ${num(k1, 4)} \\cdot ${num(y[t - 1] ?? 0, 4)} - ${num(k2, 4)} \\cdot ${num(y[t - 2] ?? 0, 4)} + ${num(gNew(p))} = ${num(x, 4)}`;
    });
    return [
      {
        text: 'Combine the three equations into one for income.',
        latex: `Y_t = cY_{t-1} + cv(Y_{t-1} - Y_{t-2}) + G = ${num(k1, 4)}\\,Y_{t-1} - ${num(k2, 4)}\\,Y_{t-2} + G`,
        why: 'Investment reacts to the change in consumption, C(t) − C(t − 1) = c(Y(t − 1) − Y(t − 2)), so income depends on the last two periods: a second-order equation with coefficients c(1 + v) and cv.',
        result: round(k1, 4),
      },
      {
        text: 'Check the starting point.',
        latex: `\\dfrac{${num(gOld(p))}}{1 - ${num(c)}} = ${num(p.yOld)}`,
        why: 'In equilibrium income does not change, so investment is zero and Y = G/(1 − c): the accelerator does not change the equilibrium, only the path towards it.',
        result: p.yOld,
      },
      {
        text: `Iterate from period 2 to period ${p.n}.`,
        latex: rounds.join(', \\quad '),
        why: 'In period 2 only the extra spending arrives; from period 3 on, rising consumption also triggers investment, which pushes income up by more than the plain multiplier would.',
        result: income(p),
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(income(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
