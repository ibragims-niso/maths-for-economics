import { round } from '../../engine/grading';
import type { Distractor, Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { CARTEL_INDUSTRIES, type CartelIndustry, pvCheat, pvCollude } from './cartel';

interface Params {
  industry: CartelIndustry;
  /** Profit per month: R if both collude, T for cheating once, P in every month of punishment. */
  R: number;
  T: number;
  P: number;
  /** Chosen so that 1/(1 − δ) and δ/(1 − δ) are whole or end in .5. */
  delta: number;
  /** The present value of cheating, or how much more colluding is worth than cheating. */
  ask: 'cheat' | 'difference';
}

/** Every answer is exact to 1 decimal place, so the tolerance can be tight. */
const VALUE = { tolerance: 0.01, relTolerance: 0 } as const;
const DECIMALS = 1;
const DELTAS = [0.5, 0.6, 0.75, 0.8, 0.9, 0.95] as const;

const cheat = (p: Params) => pvCheat(p.T, p.P, p.delta);
const collude = (p: Params) => pvCollude(p.R, p.delta);
const target = (p: Params) => round(p.ask === 'cheat' ? cheat(p) : collude(p) - cheat(p), DECIMALS);

function candidates(p: Params): Distractor[] {
  const k = 1 / (1 - p.delta);
  const cheatNow = p.T + p.P * k;
  const cheatForever = p.T * k;
  if (p.ask === 'cheat')
    return [
      { value: round(cheatNow, DECIMALS), mistakeCode: 'PUNISHMENT_NOT_DELAYED' },
      { value: round(cheatForever, DECIMALS), mistakeCode: 'TEMPTATION_FOREVER' },
      { value: p.T, mistakeCode: 'SHORT_SIGHTED' },
    ];
  return [
    { value: round(collude(p) - cheatNow, DECIMALS), mistakeCode: 'PUNISHMENT_NOT_DELAYED' },
    { value: round(collude(p) - cheatForever, DECIMALS), mistakeCode: 'TEMPTATION_FOREVER' },
    { value: p.R - p.T, mistakeCode: 'SHORT_SIGHTED' },
  ];
}

const QUESTION = {
  cheat:
    'What is the present value, in thousands, of cheating this month (counting this month’s profit undiscounted)?',
  difference:
    'By how much, in thousands, does the present value of colluding for ever exceed the present value of cheating this month (counting this month’s profit undiscounted)? Give a negative number if cheating pays more.',
} as const;

/** GT04, difficulty 2: present value of cheating on a grim-trigger cartel, or its gap to colluding. */
export const grimTriggerPresentValues: Generator<Params> = {
  id: 'grim-trigger-present-values',
  title: 'Present value of cheating on a cartel',
  topicId: 'GT04',
  difficulty: 2,
  timeSec: 150,

  params(rng) {
    for (;;) {
      const P = rng.int(2, 20);
      const R = P + rng.int(1, 12);
      const T = R + rng.int(1, 15);
      const p: Params = {
        industry: rng.pick(CARTEL_INDUSTRIES),
        R,
        T,
        P,
        delta: rng.pick(DELTAS),
        ask: rng.pick(['cheat', 'difference'] as const),
      };
      if (p.ask === 'difference' && Math.abs(collude(p) - cheat(p)) < 0.25) continue;
      const kept = cleanDistractors(target(p), candidates(p), VALUE.tolerance, VALUE.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `Two ${p.industry} run a cartel that is repeated every month, for ever, and both use grim-trigger strategies. If both keep to the cartel, each earns ${num(p.R)} thousand a month. A firm that cheats earns ${num(p.T)} thousand in the month it cheats; from the next month on, the rival cheats for ever and the cheat earns ${num(p.P)} thousand a month. The discount factor is $\\delta = ${num(p.delta)}$ per month. ${QUESTION[p.ask]} Give your answer to 1 decimal place.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: DECIMALS, ...VALUE }),

  steps: (p) => {
    const tail = round(cheat(p) - p.T, DECIMALS);
    const steps: Step[] = [
      {
        text: 'Present value of the punishment months, which start next month.',
        latex: `${num(p.P)}\\delta + ${num(p.P)}\\delta^2 + \\dots = \\dfrac{${num(p.P)} \\times ${num(p.delta)}}{1 - ${num(p.delta)}} = ${num(tail)}`,
        why: `A geometric series with first term ${num(p.P)}δ (the first punishment month is one month away, so it is discounted once) and ratio δ; its sum is first term/(1 − δ).`,
        result: tail,
      },
      {
        text: 'Add the profit of the month in which the firm cheats.',
        latex: `V_{\\text{cheat}} = ${num(p.T)} + ${num(tail)} = ${num(round(cheat(p), DECIMALS))}`,
        why: 'The temptation profit is earned today, so it is not discounted.',
        result: round(cheat(p), DECIMALS),
      },
    ];
    if (p.ask === 'difference')
      steps.push(
        {
          text: 'Present value of colluding for ever.',
          latex: `V_{\\text{collude}} = \\dfrac{${num(p.R)}}{1 - ${num(p.delta)}} = ${num(round(collude(p), DECIMALS))}`,
          why: 'A constant stream R, R, R, … starting today is a geometric series with first term R and ratio δ.',
          result: round(collude(p), DECIMALS),
        },
        {
          text: 'Subtract.',
          latex: `V_{\\text{collude}} - V_{\\text{cheat}} = ${num(round(collude(p), DECIMALS))} - ${num(round(cheat(p), DECIMALS))} = ${num(target(p))}`,
          why:
            target(p) >= 0
              ? 'Colluding is worth at least as much as cheating, so at this δ the cartel holds.'
              : 'Cheating is worth more, so at this δ the cartel breaks down.',
          result: target(p),
        },
      );
    return steps;
  },

  distractors: (p) =>
    cleanDistractors(target(p), candidates(p), VALUE.tolerance, VALUE.relTolerance),
};
