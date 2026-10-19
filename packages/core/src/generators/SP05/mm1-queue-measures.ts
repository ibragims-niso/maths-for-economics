import { round } from '../../engine/grading';
import type { Generator, Step } from '../../engine/types';
import { cleanDistractors, num } from '../format';
import { MM1_CONTEXTS, type Mm1Context, mm1L, mm1Lq, mm1Setting } from './queue';

type Measure = 'L' | 'Lq' | 'W' | 'Wq';

interface Params {
  context: Mm1Context;
  /** Arrival rate λ per hour. */
  lambda: number;
  /** Service rate μ per hour. */
  mu: number;
  measure: Measure;
}

/** The measure asked for; times in minutes. */
export function measureValue(p: Params): number {
  const { lambda, mu } = p;
  if (p.measure === 'L') return mm1L(lambda, mu);
  if (p.measure === 'Lq') return mm1Lq(lambda, mu);
  if (p.measure === 'W') return 60 / (mu - lambda);
  return (60 * lambda) / (mu * (mu - lambda));
}

/** True when the measure has at most 2 decimals exactly (checked with whole numbers). */
function isClean(p: Params): boolean {
  const { lambda, mu } = p;
  const gap = mu - lambda;
  if (p.measure === 'L') return (100 * lambda) % gap === 0;
  if (p.measure === 'Lq') return (100 * lambda * lambda) % (mu * gap) === 0;
  if (p.measure === 'W') return 6000 % gap === 0;
  return (6000 * lambda) % (mu * gap) === 0;
}

function wrongAnswers(p: Params) {
  const { lambda, mu } = p;
  const rho = lambda / mu;
  const W = 60 / (mu - lambda);
  const Wq = (60 * lambda) / (mu * (mu - lambda));
  const candidates =
    p.measure === 'L'
      ? [
          { value: round(rho, 2), mistakeCode: 'NO_ONE_MINUS' },
          { value: round(mm1Lq(lambda, mu), 2), mistakeCode: 'QUEUE_VS_SYSTEM' },
        ]
      : p.measure === 'Lq'
        ? [
            { value: round(rho * rho, 2), mistakeCode: 'NO_ONE_MINUS' },
            { value: round(mm1L(lambda, mu), 2), mistakeCode: 'QUEUE_VS_SYSTEM' },
          ]
        : p.measure === 'W'
          ? [
              { value: round(60 / mu, 2), mistakeCode: 'SERVICE_ONLY' },
              { value: round(Wq, 2), mistakeCode: 'QUEUE_VS_SYSTEM' },
              { value: round(W / 60, 2), mistakeCode: 'MIXED_UNITS' },
            ]
          : [
              { value: round(W, 2), mistakeCode: 'QUEUE_VS_SYSTEM' },
              { value: round(Wq / 60, 2), mistakeCode: 'MIXED_UNITS' },
              { value: round((60 * rho) / mu, 2), mistakeCode: 'NO_ONE_MINUS' },
            ];
  return cleanDistractors(round(measureValue(p), 2), candidates);
}

/** "= 0.8" when exact at 4 decimals, otherwise "\approx 0.8571". */
const eq4 = (x: number) =>
  Math.abs(x - round(x, 4)) < 1e-12 ? `= ${num(x, 4)}` : `\\approx ${num(x, 4)}`;

const ASK: Record<Measure, (c: (typeof MM1_CONTEXTS)[Mm1Context]) => string> = {
  L: (c) =>
    `What is the average number of ${c.things} ${c.inside}, counting those waiting and the one being served?`,
  Lq: (c) =>
    `What is the average number of ${c.things} waiting in the queue, not counting the one being served?`,
  W: (c) =>
    `On average, how many minutes does a ${c.thing} spend in the system, waiting plus service?`,
  Wq: (c) =>
    `On average, how many minutes does a ${c.thing} wait in the queue before service starts?`,
};

/** SP05, difficulty 1: one of L, Lq, W or Wq (in minutes) for an M/M/1 queue from λ and μ per hour. */
export const mm1QueueMeasures: Generator<Params> = {
  id: 'mm1-queue-measures',
  title: 'M/M/1 queue length and waiting time',
  topicId: 'SP05',
  difficulty: 1,
  timeSec: 120,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(MM1_CONTEXTS) as Mm1Context[]);
      const mu = rng.int(4, 60);
      const lambda = rng.int(Math.ceil(mu / 2), mu - 1);
      const measure = rng.pick(['L', 'Lq', 'W', 'Wq'] as const);
      const p: Params = { context, lambda, mu, measure };
      // Utilisation between 0.5 and 0.95, so there is a real queue but not an absurd one.
      if (2 * lambda < mu || 20 * lambda > 19 * mu) continue;
      if (!isClean(p) || measureValue(p) < 0.1) continue;
      if (wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const value = round(measureValue(p), 2);
    const dp = Number.isInteger(value) ? '' : ' Give your answer to 2 decimal places.';
    return `${mm1Setting(p.context, p.lambda, p.mu)} ${ASK[p.measure](MM1_CONTEXTS[p.context])}${dp}`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(measureValue(p), 2), decimals: 2 }),

  steps(p) {
    const { lambda, mu } = p;
    const rho = lambda / mu;
    const gap = mu - lambda;
    const value = round(measureValue(p), 2);
    const first: Step = {
      text: 'Find the utilisation and check that the queue is stable.',
      latex: `\\rho = \\dfrac{\\lambda}{\\mu} = \\dfrac{${lambda}}{${mu}} ${eq4(rho)} < 1`,
      why: 'ρ is the share of time the server is busy; with ρ < 1 customers arrive more slowly than they can be served, so the queue has a long-run average.',
      result: round(rho, 4),
    };
    if (p.measure === 'L')
      return [
        first,
        {
          text: 'Use the M/M/1 formula for the average number in the system.',
          latex: `L = \\dfrac{\\rho}{1 - \\rho} = \\dfrac{\\lambda}{\\mu - \\lambda} = \\dfrac{${lambda}}{${gap}} = ${num(value)}`,
          why: 'Adding n(1 − ρ)ρⁿ over all n gives ρ/(1 − ρ); multiplying top and bottom by μ turns it into λ/(μ − λ).',
          result: value,
        },
      ];
    if (p.measure === 'Lq')
      return [
        first,
        {
          text: 'Use the M/M/1 formula for the average number waiting.',
          latex: `L_q = \\dfrac{\\rho^2}{1 - \\rho} = \\dfrac{\\lambda^2}{\\mu(\\mu - \\lambda)} = \\dfrac{${lambda * lambda}}{${mu} \\times ${gap}} = ${num(value)}`,
          why: 'Lq = L − ρ: from everyone in the system take away the one being served, who is there a share ρ of the time.',
          result: value,
        },
      ];
    const hours = p.measure === 'W' ? 1 / gap : lambda / (mu * gap);
    const formula =
      p.measure === 'W'
        ? {
            text: 'Use the M/M/1 formula for the average time in the system.',
            latex: `W = \\dfrac{1}{\\mu - \\lambda} = \\dfrac{1}{${gap}} ${eq4(hours)}\\ \\text{hours}`,
            why: 'By Little’s law W = L/λ = 1/(μ − λ). The rates are per hour, so the time comes out in hours.',
          }
        : {
            text: 'Use the M/M/1 formula for the average wait in the queue.',
            latex: `W_q = \\dfrac{\\lambda}{\\mu(\\mu - \\lambda)} = \\dfrac{${lambda}}{${mu} \\times ${gap}} ${eq4(hours)}\\ \\text{hours}`,
            why: 'By Little’s law Wq = Lq/λ; it is also W minus the service time 1/μ. The rates are per hour, so the time comes out in hours.',
          };
    return [
      first,
      { ...formula, result: round(hours, 4) },
      {
        text: 'Convert hours to minutes.',
        latex: `${p.measure === 'W' ? 'W' : 'W_q'} = ${p.measure === 'W' ? `\\dfrac{60}{${gap}}` : `\\dfrac{60 \\times ${lambda}}{${mu * gap}}`} = ${num(value)}\\ \\text{minutes}`,
        why: 'An hour has 60 minutes; multiplying the exact fraction by 60 avoids rounding errors.',
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
