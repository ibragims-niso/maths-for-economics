import { round } from '../../engine/grading';
import type { Distractor, Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

interface Params {
  /** Tax saved by under-reporting when there is no audit, in thousands. */
  gain: number;
  /** Fine paid on top of the missing tax when an audit catches the cheat, in thousands (> gain). */
  fine: number;
  /** Cost of one audit to the tax office, in thousands (< gain). */
  cost: number;
}

const PROB = { tolerance: 0.001, relTolerance: 0 } as const;
const DECIMALS = 3;

/** The audit rate that leaves the taxpayer indifferent: (1 − p)·gain − p·fine = 0. */
const target = (p: Params) => round(p.gain / (p.gain + p.fine), DECIMALS);

function candidates(p: Params): Distractor[] {
  return [
    // The office's own indifference gives the cheating rate cost/gain, not the audit rate.
    { value: round(p.cost / p.gain, DECIMALS), mistakeCode: 'OWN_INDIFFERENCE' },
    { value: round(p.fine / (p.gain + p.fine), DECIMALS), mistakeCode: 'COMPLEMENT' },
    { value: round(p.gain / p.fine, DECIMALS), mistakeCode: 'GAIN_LEFT_OUT' },
  ];
}

/** GT02, difficulty 1: the audit probability that makes a taxpayer indifferent between cheating and reporting honestly. */
export const auditProbabilityIndifference: Generator<Params> = {
  id: 'audit-probability-indifference',
  title: 'Equilibrium audit rate',
  topicId: 'GT02',
  difficulty: 1,
  timeSec: 90,

  params(rng) {
    for (;;) {
      const gain = rng.int(2, 40);
      const fine = rng.int(gain + 1, 8 * gain);
      // Keep the answer a short, exact decimal: gain/(gain + fine) has at most 3 decimal places.
      if ((1000 * gain) % (gain + fine) !== 0) continue;
      const p: Params = { gain, fine, cost: rng.int(1, gain - 1) };
      const kept = cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance);
      if (kept.length === 3) return p;
    }
  },

  stem: (p) =>
    `A taxpayer can report income honestly or under-report it. Under-reporting saves $${num(p.gain)}$ thousand in tax if there is no audit; if the tax office audits, the taxpayer must pay the missing tax plus a fine of $${num(p.fine)}$ thousand. Each audit costs the office $${num(p.cost)}$ thousand, and an undetected cheat costs it the $${num(p.gain)}$ thousand of tax. In the mixed-strategy equilibrium, with what probability $p$ does the office audit? Give your answer to 3 decimal places.`,

  answer: (p) => ({ kind: 'numeric', value: target(p), decimals: DECIMALS, ...PROB }),

  steps: (p) => [
    {
      text: 'Compare the taxpayer’s two choices when the office audits with probability p.',
      latex: `\\text{honest: } 0, \\qquad \\text{cheat: } (1 - p)\\cdot ${num(p.gain)} - p \\cdot ${num(p.fine)}`,
      why: 'Measured against honest reporting: without an audit the cheat keeps the tax saved; with an audit it pays the missing tax back, which brings it level with honesty, and then pays the fine on top.',
    },
    {
      text: 'The office audits just often enough to make cheating pay nothing on average.',
      latex: `(1 - p)\\cdot ${num(p.gain)} = p \\cdot ${num(p.fine)} \\;\\Rightarrow\\; p = \\frac{${num(p.gain)}}{${num(p.gain)} + ${num(p.fine)}} = ${num(target(p), DECIMALS)}`,
      why: `The taxpayer mixes only if both choices give the same expected payoff, so the audit rate comes from the taxpayer’s payoffs. The office’s audit cost does not enter: it fixes the cheating rate instead (audit cost ÷ tax saved = ${num(p.cost)}/${num(p.gain)}).`,
      result: target(p),
    },
  ],

  distractors: (p) => cleanDistractors(target(p), candidates(p), PROB.tolerance, PROB.relTolerance),
};
