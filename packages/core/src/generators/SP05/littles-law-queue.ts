import { round } from '../../engine/grading';
import type { Generator } from '../../engine/types';
import { cleanDistractors, num } from '../format';

const CONTEXTS = {
  emergency: {
    place: 'a hospital emergency department',
    things: 'patients',
    one: 'patient',
    inside: 'in the department',
    rates: [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20],
    counts: [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 25, 30, 36, 40, 45],
    minutes: [60, 90, 120, 150, 180, 210, 240],
  },
  cafe: {
    place: 'a busy café',
    things: 'customers',
    one: 'customer',
    inside: 'in the café',
    rates: [24, 30, 36, 40, 45, 48, 50, 60, 72, 80, 90],
    counts: [6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 25, 30, 36],
    minutes: [10, 12, 15, 18, 20, 24, 25, 30, 40, 45],
  },
  service: {
    place: 'a public service centre',
    things: 'visitors',
    one: 'visitor',
    inside: 'in the centre',
    rates: [30, 36, 40, 45, 48, 50, 60, 72, 80, 90, 100, 120],
    counts: [10, 12, 15, 18, 20, 24, 25, 30, 36, 40, 45, 50, 60],
    minutes: [15, 18, 20, 24, 25, 30, 35, 40, 45, 50],
  },
  petrol: {
    place: 'a petrol station',
    things: 'cars',
    one: 'car',
    inside: 'at the station',
    rates: [20, 24, 30, 36, 40, 45, 48, 60, 72, 80],
    counts: [2, 3, 4, 5, 6, 8, 9, 10, 12, 15],
    minutes: [4, 5, 6, 8, 9, 10, 12, 15],
  },
} as const;

type Context = keyof typeof CONTEXTS;

interface Params {
  context: Context;
  /** Arrivals per hour. */
  lambda: number;
  /** 'time': L given, find W in minutes. 'number': W given in minutes, find L. */
  mode: 'time' | 'number';
  /** Average number inside (given in 'time' mode). */
  count: number;
  /** Average time inside in minutes (given in 'number' mode). */
  minutes: number;
}

const exact = (p: Params) =>
  p.mode === 'time' ? (60 * p.count) / p.lambda : (p.lambda * p.minutes) / 60;

function wrongAnswers(p: Params) {
  const candidates =
    p.mode === 'time'
      ? [
          { value: round(p.lambda * p.count, 2), mistakeCode: 'LITTLE_REARRANGED' },
          { value: round(p.count / p.lambda, 2), mistakeCode: 'MIXED_UNITS' },
        ]
      : [
          { value: round(p.lambda * p.minutes, 2), mistakeCode: 'MIXED_UNITS' },
          { value: round((60 * p.lambda) / p.minutes, 2), mistakeCode: 'LITTLE_REARRANGED' },
        ];
  return cleanDistractors(
    round(exact(p), 2),
    candidates.filter((d) => d.value > 0),
  );
}

/** SP05, difficulty 1: Little's law L = λW, the average time inside from L and λ, or the average number inside from λ and W. */
export const littlesLawQueue: Generator<Params> = {
  id: 'littles-law-queue',
  title: "Little's law",
  topicId: 'SP05',
  difficulty: 1,
  timeSec: 75,

  params(rng) {
    for (;;) {
      const context = rng.pick(Object.keys(CONTEXTS) as Context[]);
      const c = CONTEXTS[context];
      const p: Params = {
        context,
        lambda: rng.pick(c.rates),
        mode: rng.pick(['time', 'number'] as const),
        count: rng.pick(c.counts),
        minutes: rng.pick(c.minutes),
      };
      if (p.mode === 'time') {
        // W = 60L/λ minutes with at most 1 decimal, in a sensible range for the place.
        if ((600 * p.count) % p.lambda !== 0) continue;
        const w = exact(p);
        if (w < Math.min(...c.minutes) / 2 || w > Math.max(...c.minutes) * 1.5) continue;
      } else {
        // L = λW/60 with at most 2 decimals and at least 1.
        if ((100 * p.lambda * p.minutes) % 60 !== 0) continue;
        if (exact(p) < 1) continue;
      }
      if (wrongAnswers(p).length < 2) continue;
      return p;
    }
  },

  stem(p) {
    const c = CONTEXTS[p.context];
    const value = round(exact(p), 2);
    const dp = Number.isInteger(value) ? '' : ' Give your answer to 2 decimal places.';
    if (p.mode === 'time')
      return `On average $${p.lambda}$ ${c.things} arrive at ${c.place} per hour, and on average $${p.count}$ ${c.things} are ${c.inside} at any moment. Using Little's law, how many minutes does a ${c.one} spend ${c.inside} on average?${dp}`;
    return `On average $${p.lambda}$ ${c.things} arrive at ${c.place} per hour, and each ${c.one} spends on average $${p.minutes}$ minutes ${c.inside}. Using Little's law, how many ${c.things} are ${c.inside} on average?${dp}`;
  },

  answer: (p) => ({ kind: 'numeric', value: round(exact(p), 2), decimals: 2 }),

  steps(p) {
    const value = round(exact(p), 2);
    if (p.mode === 'time') {
      const hours = p.count / p.lambda;
      return [
        {
          text: "Rearrange Little's law for the time.",
          latex: `W = \\dfrac{L}{\\lambda} = \\dfrac{${p.count}}{${p.lambda}} ${Math.abs(hours - round(hours, 4)) < 1e-12 ? '=' : '\\approx'} ${num(hours, 4)}\\ \\text{hours}`,
          why: 'L = λW holds for any queue in a steady state: the number inside equals the arrival rate times the time each one stays. Dividing by λ gives W.',
          result: round(hours, 4),
        },
        {
          text: 'Convert hours to minutes.',
          latex: `W = \\dfrac{60 \\times ${p.count}}{${p.lambda}} = ${num(value)}\\ \\text{minutes}`,
          why: 'λ is per hour, so L/λ is in hours; multiply by 60 for minutes.',
          result: value,
        },
      ];
    }
    const hours = p.minutes / 60;
    return [
      {
        text: 'Convert the time to hours, the unit of the arrival rate.',
        latex: `W = \\dfrac{${p.minutes}}{60} ${Math.abs(hours - round(hours, 4)) < 1e-12 ? '=' : '\\approx'} ${num(hours, 4)}\\ \\text{hours}`,
        why: 'λ counts arrivals per hour, so W must be in hours before the two are multiplied.',
        result: round(hours, 4),
      },
      {
        text: "Apply Little's law.",
        latex: `L = \\lambda W = ${p.lambda} \\times \\dfrac{${p.minutes}}{60} = ${num(value)}`,
        why: 'Each hour λ arrive and each stays W hours, so on average λW are inside at any moment, whatever the pattern of arrivals and service.',
        result: value,
      },
    ];
  },

  distractors: wrongAnswers,
};
