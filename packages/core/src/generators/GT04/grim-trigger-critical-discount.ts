import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { CARTEL_INDUSTRIES, type CartelIndustry, cartelLatex, criticalDelta } from './cartel';

interface Params {
  industry: CartelIndustry;
  /** Reward (both collude), sucker (collude against a cheat), temptation, punishment (both cheat). */
  R: number;
  S: number;
  T: number;
  P: number;
}

const DELTA = { tolerance: 0.005, relTolerance: 0 } as const;
const DECIMALS = 2;

const target = (p: Params) => round(criticalDelta(p), DECIMALS);

function candidates(p: Params): Distractor[] {
  return [
    { value: round((p.R - p.P) / (p.T - p.P), DECIMALS), mistakeCode: 'COMPLEMENT_DELTA' },
    { value: round((p.T - p.R) / (p.T - p.S), DECIMALS), mistakeCode: 'SUCKER_PAYOFF' },
    { value: round((p.T - p.R) / (p.R - p.P), DECIMALS), mistakeCode: 'GAIN_OVER_LOSS' },
  ];
}

/** GT04, difficulty 1: the critical discount factor (T − R)/(T − P) for grim-trigger collusion. */
export const grimTriggerCriticalDiscount: Generator<Params> = {
  id: 'grim-trigger-critical-discount',
  title: 'Critical discount factor for a cartel',
  topicId: 'GT04',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const P = rng.int(2, 30);
      const R = P + rng.int(1, 15);
      const T = R + rng.int(1, 15);
      const S = P - rng.int(1, Math.min(P, 10));
      const p: Params = { industry: rng.pick(CARTEL_INDUSTRIES), R, S, T, P };
      const d = criticalDelta(p);
      if (d < 0.1 || d > 0.9) continue;
      const kept = cleanDistractors(target(p), candidates(p), DELTA.tolerance, DELTA.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `Two ${p.industry} form a cartel and play the game below every month, for ever. Each cell shows (profit of A, profit of B) in thousands per month: $${cartelLatex(p)}$ Both firms use grim-trigger strategies: collude in the first month, and keep colluding as long as nobody has ever cheated; after any cheating, cheat for ever. What is the smallest discount factor $\\delta$ at which this cartel is stable? Give your answer to 2 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: DECIMALS, ...DELTA }),

  steps: (p) => [
    {
      text: 'Read the four payoffs of one firm.',
      latex: `T = ${num(p.T)},\\quad R = ${num(p.R)},\\quad P = ${num(p.P)},\\quad S = ${num(p.S)}`,
      why: 'Temptation T is the profit from cheating on a rival who colludes, reward R the profit when both collude, punishment P the profit when both cheat. Cheating is dominant in one month (T > R and P > S), so the one-shot game is a prisoner’s dilemma.',
    },
    {
      text: 'Compare colluding for ever with cheating once and then being punished for ever.',
      latex: `\\dfrac{${num(p.R)}}{1 - \\delta} \\ge ${num(p.T)} + \\dfrac{${num(p.P)}\\,\\delta}{1 - \\delta}`,
      why: 'Both sides are geometric series. Cheating earns T now, but from next month on the rival cheats for ever, so the firm earns P instead of R in every later month.',
    },
    {
      text: 'Multiply by 1 − δ and solve for δ.',
      latex: `${num(p.R)} \\ge ${num(p.T)}(1 - \\delta) + ${num(p.P)}\\,\\delta \\;\\Rightarrow\\; \\delta \\ge \\dfrac{${num(p.T)} - ${num(p.R)}}{${num(p.T)} - ${num(p.P)}} = \\dfrac{${num(p.T - p.R)}}{${num(p.T - p.P)}} = ${num(target(p))}`,
      why: 'This is δ* = (T − R)/(T − P): the one-off gain from cheating over the whole drop from temptation to punishment. Firms at least this patient keep to the cartel.',
      result: target(p),
    },
  ],

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), DELTA.tolerance, DELTA.relTolerance),
};
