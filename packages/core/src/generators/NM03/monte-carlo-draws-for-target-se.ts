import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

type Context = 'npv' | 'option' | 'loss';

interface Params {
  context: Context;
  /** Draws in the pilot run, a perfect square (400, 900, …, 10 000) so √N₀ is whole. */
  pilot: number;
  /** The pilot run's estimate (only for the story; it does not enter the answer). */
  estimate: number;
  /** The pilot run's standard error, SE₀ = ratio × target. */
  pilotSe: number;
  /** The standard error wanted. */
  target: number;
  /** SE₀/target, one of a few readable ratios. */
  ratio: number;
}

/** A count of draws: the whole number exactly. */
const COUNT = { tolerance: 0.5, relTolerance: 0 } as const;

const PILOTS = [400, 900, 1600, 2500, 3600, 4900, 6400, 10000] as const;
const RATIOS = [1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const;

/** Units and decimals of each story: the targets are whole multiples of `unit`. */
const SCALE: Record<Context, { unit: number; maxSteps: number; decimals: number; words: string }> =
  {
    npv: { unit: 1, maxSteps: 30, decimals: 0, words: ' thousand' },
    option: { unit: 0.01, maxSteps: 20, decimals: 2, words: '' },
    loss: { unit: 0.1, maxSteps: 30, decimals: 1, words: ' million' },
  };

/** N = N₀·(SE₀/d)²: the standard error falls like 1/√N. */
export const drawsNeeded = (p: Params) => Math.round(p.pilot * p.ratio ** 2);

/** The SD of one simulated value, recovered from the pilot run: s = SE₀·√N₀. */
export const singleDrawSd = (p: Params) => p.pilotSe * Math.sqrt(p.pilot);

function candidates(p: Params) {
  return [
    { value: Math.round(p.pilot * p.ratio), mistakeCode: 'SE_LINEAR_IN_N' },
    { value: Math.ceil(p.ratio ** 2 - 1e-9), mistakeCode: 'SE_AS_SD' },
  ];
}

const what = (p: Params) => {
  const se = num(p.pilotSe, SCALE[p.context].decimals + 2);
  switch (p.context) {
    case 'npv':
      return `estimates a project's expected net present value at $${num(p.estimate)}$ thousand, with a standard error of $${se}$ thousand`;
    case 'option':
      return `estimates the price of an option at $${num(p.estimate, 2)}$, with a standard error of $${se}$`;
    default:
      return `estimates a bank's expected credit loss at $${num(p.estimate, 1)}$ million, with a standard error of $${se}$ million`;
  }
};

/** NM03, difficulty 1: how many Monte Carlo draws bring the standard error down to a target. */
export const monteCarloDrawsForTargetSe: Generator<Params> = {
  id: 'monte-carlo-draws-for-target-se',
  title: 'Draws needed for a target standard error',
  topicId: 'NM03',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const context = rng.pick(['npv', 'option', 'loss'] as const);
      const { unit, maxSteps, decimals } = SCALE[context];
      const target = rng.int(1, maxSteps) * unit;
      const ratio = rng.pick(RATIOS);
      const pilotSe = Number((ratio * target).toFixed(decimals + 2));
      const estimate =
        context === 'npv'
          ? rng.int(20, 900)
          : context === 'option'
            ? rng.int(200, 2500) / 100
            : rng.int(50, 900) / 10;
      const p: Params = { context, pilot: rng.pick(PILOTS), estimate, pilotSe, target, ratio };
      // The standard error must be small next to the estimate, as in a real run.
      if (pilotSe > estimate / 4) continue;
      if (drawsNeeded(p) > 1_000_000) continue;
      return p;
    }
  },

  stem: (p) =>
    `A pilot Monte Carlo run of $${num(p.pilot)}$ draws ${what(p)}. Assuming the standard error falls like $1/\\sqrt{N}$, how many draws $N$ in total are needed to bring the standard error down to $${num(p.target, SCALE[p.context].decimals)}$${SCALE[p.context].words}? Give a whole number.`,

  answer: (p) => ({ kind: 'numeric', value: drawsNeeded(p), decimals: 0, ...COUNT }),

  steps(p) {
    const d = SCALE[p.context].decimals;
    const se = num(p.pilotSe, d + 2);
    const s = singleDrawSd(p);
    return [
      {
        text: 'Recover the standard deviation of one simulated value from the pilot run.',
        latex: `s = \\text{SE}_0\\sqrt{N_0} = ${se} \\times \\sqrt{${num(p.pilot)}} = ${se} \\times ${num(Math.sqrt(p.pilot))} = ${num(s, d + 2)}`,
        why: 'The standard error of an average of N₀ draws is s/√N₀, so s is the standard error times √N₀.',
        result: s,
      },
      {
        text: 'Require the new standard error to be at most the target.',
        latex: `\\dfrac{s}{\\sqrt{N}} \\le ${num(p.target, d)} \\iff \\sqrt{N} \\ge \\dfrac{${num(s, d + 2)}}{${num(p.target, d)}} = ${num(s / p.target, 2)}`,
        why: 'More draws shrink the standard error; solve for the √N that just reaches the target.',
        result: s / p.target,
      },
      {
        text: 'Square to get the number of draws.',
        latex: `N = ${num(s / p.target, 2)}^2 = ${num(drawsNeeded(p))} = ${num(p.pilot)} \\times \\left(\\dfrac{${se}}{${num(p.target, d)}}\\right)^2`,
        why: `Cutting the standard error by a factor of ${num(p.ratio)} needs ${num(p.ratio ** 2)} times the draws, because the error falls only like 1/√N.`,
        result: drawsNeeded(p),
      },
    ];
  },

  distractors: (p) => cleanDistractors(drawsNeeded(p), candidates(p), COUNT.tolerance, 0),
};
