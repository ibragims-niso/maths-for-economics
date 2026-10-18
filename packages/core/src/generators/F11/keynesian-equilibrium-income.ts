import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Autonomous consumption. */
  a: number;
  /** Marginal propensity to consume, e.g. 0.8. */
  b: number;
  investment: number;
  government: number;
}

const MPC_PCT = [60, 70, 75, 80, 90] as const;

/** 1 − b in per cent, exact for the propensities above. */
const leakPct = (b: number) => 100 - Math.round(b * 100);
const autonomous = (p: Params) => p.a + p.investment + p.government;
/** Y* = (a + I + G)/(1 − b), in whole-number arithmetic so the result is exact. */
const income = (p: Params) => (100 * autonomous(p)) / leakPct(p.b);

/** The multiplier 1/(1 − b) as plain text: "= 5", or "≈ 3.33" when it does not stop after 2 decimals. */
const multiplierText = (b: number) =>
  `${10000 % leakPct(b) === 0 ? '=' : '≈'} ${num(100 / leakPct(b))}`;

/** F11, difficulty 1: equilibrium income Y* = (a + I + G)/(1 − b) in a closed economy. */
export const keynesianEquilibriumIncome: Generator<Params> = {
  id: 'keynesian-equilibrium-income',
  title: 'Equilibrium national income',
  topicId: 'F11',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    for (;;) {
      const bPct = rng.pick(MPC_PCT);
      const a = rng.int(2, 20) * 10;
      const investment = rng.int(5, 40) * 10;
      const government = rng.int(5, 40) * 10;
      // Keep only draws where (a + I + G)/(1 − b) is a whole number.
      if ((100 * (a + investment + government)) % (100 - bPct) === 0) {
        return { a, b: bPct / 100, investment, government };
      }
    }
  },

  stem: (p) =>
    `In a closed economy without income tax, consumption is $C = ${num(p.a)} + ${num(p.b)}Y$, investment is $I = ${num(p.investment)}$ and government spending is $G = ${num(p.government)}$ (all in billions). Find equilibrium income $Y^*$.`,

  answer: (p) => ({ kind: 'numeric', value: income(p), decimals: 0 }),

  steps(p) {
    const y = income(p);
    const consumption = p.a + p.b * y;
    return [
      {
        text: 'Set income equal to planned spending.',
        latex: `Y = ${num(p.a)} + ${num(p.b)}Y + ${num(p.investment)} + ${num(p.government)}`,
        why: 'In equilibrium firms produce exactly what households, firms and the government plan to buy: the spending line meets the 45° line.',
      },
      {
        text: 'Collect the Y terms on the left.',
        latex: `(1 - ${num(p.b)})Y = ${num(autonomous(p))} \\;\\Rightarrow\\; ${num(leakPct(p.b) / 100)}Y = ${num(autonomous(p))}`,
        why: 'Subtract bY from both sides. What is left, 1 − b, is the share of each extra unit of income that is saved rather than spent.',
        result: autonomous(p),
      },
      {
        text: 'Divide by 1 − b.',
        latex: `Y^* = \\dfrac{${num(autonomous(p))}}{${num(leakPct(p.b) / 100)}} = ${num(y)}`,
        why: `This is autonomous spending a + I + G times the multiplier 1/(1 − b) ${multiplierText(p.b)}.`,
        result: y,
      },
      {
        text: 'Check that planned spending equals income.',
        latex: `C = ${num(p.a)} + ${num(p.b)} \\cdot ${num(y)} = ${num(consumption)}, \\quad ${num(consumption)} + ${num(p.investment)} + ${num(p.government)} = ${num(y)}`,
        why: 'At Y* everything produced is bought, so firms have no reason to change output.',
      },
    ];
  },

  distractors: (p) =>
    cleanDistractors(income(p), [
      { value: round(autonomous(p) / p.b, 2), mistakeCode: 'DIVIDED_BY_MPC' },
      {
        value: round((100 * (p.investment + p.government)) / leakPct(p.b), 2),
        mistakeCode: 'FORGOT_AUTONOMOUS',
      },
      { value: autonomous(p), mistakeCode: 'NO_MULTIPLIER' },
    ]),
};
